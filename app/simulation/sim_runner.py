"""
sim_runner.py
=============
Physics-correct pick-and-place simulation.

PRIMARY path: gymnasium-robotics FetchPickAndPlace-v4
  – 4-DOF delta-control (dx, dy, dz, gripper)
  – Native 60 FPS MuJoCo viewer window via render_mode="human"
  – Scripted goal-reaching policy (no training required)

FALLBACK path: bare MuJoCo XML (franka_pick_place.xml)
  – Used only if gymnasium-robotics is not installed
  – Position-control PD with phone repositioned at phase transitions
    (phone moves with the arm via kinematic attachment, NOT qpos overwrite)
"""

import os
import sys
import time
import math
import random
import threading
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.utils.logger import get_logger
from app.utils.error_logger import error_logger

logger = get_logger("SimRunner3D")


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


# ---------------------------------------------------------------------------
# SimRunner
# ---------------------------------------------------------------------------

class SimRunner:
    """Unified interface: gymnasium-robotics primary, bare MuJoCo fallback."""

    def __init__(self):
        # Telemetry state
        self.rpm = 1500.0
        self.temp = 65.0
        self.vibration = 0.15

        # Fault state
        self.fault_active = False
        self.fault_type = None
        self.fault_start_time = 0.0

        # Auto-phase tracking (exposed to dashboard)
        self.auto_phase = "STOPPED"
        self.phase_start_time = time.time()
        self._pending_reset = False
        self.cycle_count = 0
        self.max_cycles = 30

        # Try gymnasium-robotics first
        self._gym_env = None
        self._use_gym = False
        self._init_gymnasium()

        if not self._use_gym:
            self._init_mujoco_fallback()

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def _init_gymnasium(self):
        """Load FetchPickAndPlace-v4 (Fetch arm, proven pick-and-place physics)."""
        try:
            import gymnasium as gym
            import gymnasium_robotics  # noqa: F401 – registers envs
            import mujoco.viewer

            self._gym_env = gym.make("FetchPickAndPlace-v4", render_mode="rgb_array", max_episode_steps=10000)
            obs, _ = self._gym_env.reset()
            self._obs = obs
            self._use_gym = True
            self._action_dim = self._gym_env.action_space.shape[0]  # 4

            # Change target dot color to Neon Green to distinguish it
            try:
                model = self._gym_env.unwrapped.model
                target_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_SITE, "target0")
                if target_id >= 0:
                    model.site_rgba[target_id] = [0.0, 1.0, 0.0, 1.0] # Green!
            except Exception as e:
                logger.error(f"Failed to change target color: {e}")

            # Launch native viewer with UI enabled
            self.viewer = mujoco.viewer.launch_passive(
                self._gym_env.unwrapped.model, 
                self._gym_env.unwrapped.data, 
                show_left_ui=True, 
                show_right_ui=True
            )

            logger.info(
                "gymnasium-robotics FetchPickAndPlace-v4 loaded. "
                f"Action dim={self._action_dim}"
            )
        except Exception as exc:
            logger.warning(f"gymnasium-robotics unavailable ({exc}). Using MuJoCo fallback.")
            self._use_gym = False

    def _init_mujoco_fallback(self):
        """Bare MuJoCo fallback — loads model from the external XML file."""
        import mujoco

        xml_path = os.path.join(os.path.dirname(__file__), "franka_pick_place.xml")
        self.model = mujoco.MjModel.from_xml_path(xml_path)
        self.data  = mujoco.MjData(self.model)
        self.nu    = self.model.nu

        # Phone freejoint offset
        try:
            self._phone_qadr = self.model.joint("phone_free").qposadr[0]
        except Exception:
            self._phone_qadr = 7

        # Home position
        self._reset_phone()
        logger.info(f"MuJoCo fallback model loaded from {xml_path}")

    def _reset_phone(self):
        """Place phone at canonical pick-up spot."""
        if self._use_gym:
            return
        a = self._phone_qadr
        self.data.qpos[a + 0] = 0.42
        self.data.qpos[a + 1] = 0.20
        self.data.qpos[a + 2] = 0.025
        self.data.qpos[a + 3] = 1.0  # quaternion w

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start_auto_pick_and_place(self, max_cycles: int = 30):
        """Start the pick-and-place loop for N iterations (default 30)."""
        logger.info(f"🤖 Autonomous Pick & Place sequence started ({max_cycles} cycles).")
        self.cycle_count = 0
        self.max_cycles = max_cycles
        self.auto_phase = "PICK_APPROACH"
        self.phase_start_time = time.time()
        self._pending_reset = True

    def inject_fault(self, fault_type: str = "vibration_spike"):
        logger.warning(f"🔴 Fault injected: {fault_type}")
        self.fault_active = True
        self.fault_type = fault_type
        self.fault_start_time = time.time()
        if fault_type == "overheat" or fault_type == "overheat_thermal":
            self.temp = 88.0
            self.vibration = 0.45
        else:
            self.vibration = 0.95
            self.temp = 78.0

    def clear_faults(self):
        if self.fault_active:
            logger.info("✅ Fault injection stopped. System entering natural cooldown.")
            self.fault_active = False
            self.fault_type = None

    # ------------------------------------------------------------------
    # gymnasium-robotics step (scripted goal-reaching policy)
    # ------------------------------------------------------------------

    def _gym_policy(self):
        """
        Scripted pick-and-place policy for FetchPickAndPlace-v4.

        The observation dict has:
          obs["observation"][0:3]  = gripper position (world frame)
          obs["observation"][3:6]  = object position
          obs["observation"][6:9]  = object relative position (obj - gripper)
          obs["observation"][9]    = gripper finger width (0=closed, 1=open)
          obs["achieved_goal"]     = current object position
          obs["desired_goal"]      = target position where object should go

        Action: [dx, dy, dz, gripper]  ∈ [-1, 1]
          gripper > 0 → open, gripper < 0 → close
        """
        if self.fault_active:
            # Shake on fault – large random actions
            return np.random.uniform(-1.0, 1.0, self._action_dim).astype(np.float32)
            
        if self.vibration > 0.4 or self.temp > 75.0:
            # Emergency Stop / Healing phase: freeze all actuators until cooled down
            action = np.zeros(self._action_dim, dtype=np.float32)
            return action

        if self.auto_phase == "STOPPED":
            # Do nothing until started via API
            return np.zeros(self._action_dim, dtype=np.float32)

        obs = self._obs
        gripper_pos  = obs["observation"][0:3]
        obj_pos      = obs["observation"][3:6]
        obj_rel      = obs["observation"][6:9]   # obj - gripper
        finger_width = float(obs["observation"][9])
        achieved     = obs["achieved_goal"]       # current obj pos
        desired      = obs["desired_goal"]        # target pos

        action = np.zeros(self._action_dim, dtype=np.float32)
        dist_to_obj  = np.linalg.norm(obj_rel)
        dist_to_goal = np.linalg.norm(desired - achieved)

        # ── Phase 1: Move gripper above the object ──────────────────────
        if self.auto_phase == "PICK_APPROACH":
            target = obj_pos.copy()
            target[2] += 0.10
            delta = target - gripper_pos
            action[:3] = np.clip(delta * 4.0, -1, 1) # Slower
            action[3]  = 1.0  # open gripper

            if np.linalg.norm(delta) < 0.01:
                self.auto_phase = "DESCEND"
                self.phase_start_time = time.time()

        # ── Phase 2: Descend onto the object ───────────────────────────
        elif self.auto_phase == "DESCEND":
            target = obj_pos.copy()
            target[2] += 0.005 # aim slightly above center so fingers wrap the top edge
            delta = target - gripper_pos
            action[:3] = np.clip(delta * 1.0, -1, 1) # very slow approach
            action[3]  = 1.0   # keep open

            if np.linalg.norm(delta) < 0.01:
                self.auto_phase = "GRASP"
                self.phase_start_time = time.time()

        # ── Phase 3: Close gripper ──────────────────────────────────────
        elif self.auto_phase == "GRASP":
            action[:3] = np.zeros(3)
            action[3]  = -1.0   # close fully
            elapsed = time.time() - self.phase_start_time

            if elapsed > 0.35:   # 0.35 s grasp
                self.auto_phase = "LIFT"
                self.phase_start_time = time.time()

        # ── Phase 4: Lift object up ─────────────────────────────────────
        elif self.auto_phase == "LIFT":
            target = gripper_pos.copy()
            target[2] = 0.55  # fixed lift height (55 cm)
            delta = target - gripper_pos
            action[:3] = np.clip(delta * 3.5, -1, 1) # Slower
            action[3]  = -1.0   # keep closed

            if abs(gripper_pos[2] - 0.55) < 0.03:
                # Grasp Verification: Did the object actually lift?
                if obj_pos[2] < 0.47:
                    logger.warning("Failed to grasp object! Retrying...")
                    self.auto_phase = "PICK_APPROACH"
                else:
                    self.auto_phase = "TRANSPORT"
                self.phase_start_time = time.time()

        # ── Phase 5: Move to above the goal (XY) ───────────────────────
        elif self.auto_phase == "TRANSPORT":
            # Verification: Abort if dropped mid-transport
            if obj_pos[2] < 0.47:
                logger.warning("Dropped object during transport! Retrying...")
                self.auto_phase = "PICK_APPROACH"
                self.phase_start_time = time.time()
                return np.zeros(self._action_dim, dtype=np.float32)

            # Object-centric targeting: move the object (achieved) to target
            target_obj = desired.copy()
            if target_obj[2] < 0.45:
                target_obj[2] += 0.08   # stay slightly above for table targets
                
            delta = target_obj - achieved
            action[:3] = np.clip(delta * 4.0, -1, 1) # Slower
            action[3]  = -1.0   # keep closed

            xy_dist = np.linalg.norm(delta[:2])
            if xy_dist < 0.015:
                if desired[2] < 0.45:
                    self.auto_phase = "PLACE"
                else:
                    self.auto_phase = "HOLD"
                self.phase_start_time = time.time()

        # ── Phase 6: Lower object onto goal ────────────────────────────
        elif self.auto_phase == "PLACE":
            # Consistently track the object to the target
            target_obj = desired.copy()
            target_obj[2] += 0.005  # hover 5mm above exact target to prevent clipping
            delta = target_obj - achieved
            action[:3] = np.clip(delta * 2.5, -1, 1) # approach slowly
            action[3]  = -1.0

            if np.linalg.norm(delta) < 0.01:
                self.auto_phase = "RELEASE"
                self.phase_start_time = time.time()

        # ── Phase 6b: Hold object at goal (For air targets) ────────────
        elif self.auto_phase == "HOLD":
            delta = desired - achieved
            action[:3] = np.clip(delta * 2.5, -1, 1) # Slower
            action[3]  = -1.0
            
            if time.time() - self.phase_start_time > 1.0:
                self.cycle_count += 1
                if self.cycle_count < self.max_cycles:
                    self.auto_phase = "PICK_APPROACH"
                    self._pending_reset = True

        # ── Phase 7: Open gripper & repeat until max_cycles ──────────────
        elif self.auto_phase == "RELEASE":
            action[:3] = np.zeros(3)
            action[3]  = 1.0   # open
            elapsed = time.time() - self.phase_start_time

            if elapsed > 0.2:
                self.cycle_count += 1
                if self.cycle_count < self.max_cycles:
                    self.auto_phase = "PICK_APPROACH"
                    self._pending_reset = True
                    self.phase_start_time = time.time()
                else:
                    self.auto_phase = "COMPLETED"
                    self.phase_start_time = time.time()

        return action

    def _step_gymnasium(self):
        """One physics step via FetchPickAndPlace-v4."""
        if self._pending_reset:
            self._pending_reset = False
            self._obs, _ = self._gym_env.reset()

        action = self._gym_policy()
        obs, reward, terminated, truncated, info = self._gym_env.step(action)
        self._obs = obs
        
        # Manually update target0 site position for the passive viewer
        # (Since we aren't calling env.render(), gym doesn't update the visual site automatically)
        try:
            self._gym_env.unwrapped._render_callback()
        except Exception:
            pass

        if hasattr(self, 'viewer') and self.viewer.is_running():
            self.viewer.sync()

        if terminated or truncated:
            logger.info(f"Episode done (reward={reward:.2f}). Resetting.")
            self._obs, _ = self._gym_env.reset()
            if self.auto_phase != "STOPPED":
                self.auto_phase = "PICK_APPROACH"
            self.phase_start_time = time.time()

        # Extract joint data from underlying MuJoCo data
        mj_data = self._gym_env.unwrapped.data
        qpos = list(map(float, mj_data.qpos))
        qvel = list(map(float, mj_data.qvel))
        max_vel = float(max(abs(v) for v in qvel[:10])) if qvel else 0.0
        return qpos, qvel, max_vel

    # ------------------------------------------------------------------
    # MuJoCo fallback step (PD position control — NO qpos teleportation)
    # ------------------------------------------------------------------

    def _step_mujoco(self):
        """
        Step the bare MuJoCo model.
        The phone is a free body — gravity and friction handle it naturally.
        We use kinematic scripting ONLY for joint targets, not for phone qpos.
        """
        import mujoco

        t = time.time()
        elapsed = t - self.phase_start_time

        # 7 joint target positions (radians)
        tq = [0.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0]

        if self.fault_active:
            # Vibration fault: add high-frequency noise to all targets
            for i in range(self.nu):
                self.data.ctrl[i] = self.data.qpos[i + self._phone_qadr - self._phone_qadr + i] \
                    if False else (self.data.qpos[7 + i] + 0.5 * math.sin(t * 30.0 + i * 1.4))
        elif self.vibration > 0.4 or self.temp > 75.0:
            # Emergency Stop / Healing phase: freeze all actuators until cooled down
            for i in range(self.nu):
                tq[i] = self.data.qpos[7 + i]
        else:
            if self.auto_phase == "STOPPED":
                tq = [0.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0]

            elif self.auto_phase == "PICK_APPROACH":
                # Swing arm to be above the phone (0.42, 0.20, 0.025)
                p = min(1.0, elapsed / 4.0)  # Slower (was 3.0)
                tq = [0.55*p, 0.30*p, 0.0, -1.10 - 0.15*p, 0.0, 0.80 + 0.20*p, 0.0]
                if elapsed >= 4.0:
                    self.auto_phase = "GRASP"
                    self.phase_start_time = t

            elif self.auto_phase == "GRASP":
                # Lower arm — the gripper geom will contact the phone body
                tq = [0.55, 0.50, 0.0, -1.40, 0.0, 1.05, 0.0]
                if elapsed >= 3.5:  # Slower (was 2.5)
                    self.auto_phase = "TRANSPORT"
                    self.phase_start_time = t

            elif self.auto_phase == "TRANSPORT":
                p = min(1.0, elapsed / 6.0)  # Slower (was 4.5)
                pan = 0.55 - 1.10 * p
                tq = [pan, 0.20 + 0.15*p, 0.0, -0.95 + 0.20*p, 0.0, 0.75, 0.0]
                if elapsed >= 6.0:
                    self.auto_phase = "PLACE"
                    self.phase_start_time = t

            elif self.auto_phase == "PLACE":
                tq = [-0.55, 0.40, 0.0, -1.05, 0.0, 0.90, 0.0]
                if elapsed >= 3.0:  # Slower (was 2.0)
                    self.auto_phase = "RELEASE"
                    self.phase_start_time = t

            elif self.auto_phase == "RELEASE":
                tq = [-0.55, 0.20, 0.0, -1.00, 0.0, 0.80, 0.0]
                if elapsed >= 2.5:  # Slower (was 1.5)
                    # Reset phone to pick-up spot for next cycle
                    self._reset_phone()
                    self.auto_phase = "PICK_APPROACH"
                    self.phase_start_time = t

        # Write PD position targets (from_xml_path model uses <position> actuators)
        for i in range(self.nu):
            if self.fault_active:
                self.data.ctrl[i] = self.data.qpos[7 + i] + 0.5 * math.sin(t * 30.0 + i * 1.4)
            elif self.vibration > 0.4 or self.temp > 75.0:
                self.data.ctrl[i] = tq[i] # already set to current qpos above
            else:
                self.data.ctrl[i] = tq[i]

        mujoco.mj_step(self.model, self.data)

        qpos = list(map(float, self.data.qpos))
        qvel = list(map(float, self.data.qvel))
        max_vel = float(max(abs(v) for v in qvel[7:14])) if len(qvel) >= 14 else 0.0
        return qpos, qvel, max_vel

    # ------------------------------------------------------------------
    # Public step — called every 100ms by server.py
    # ------------------------------------------------------------------

    def step(self):
        """Step physics; return unified telemetry dict for WebSocket broadcast."""
        try:
            if self._use_gym:
                qpos, qvel, max_velocity = self._step_gymnasium()
            else:
                qpos, qvel, max_velocity = self._step_mujoco()
        except Exception as exc:
            error_logger.log_exception(exc, context="PhysicsSimulationEngine")
            # Defensive Fallback: return neutral telemetry to prevent server crash
            qpos, qvel, max_velocity = [0.0]*10, [0.0]*10, 0.0

        # ── Telemetry bookkeeping ───────────────────────────────────────
        if self.fault_active:
            if self.fault_type == "vibration_spike":
                self.vibration = round(0.85 + random.uniform(0.10, 0.30), 3)
                self.temp = min(110.0, round(self.temp + random.uniform(0.5, 1.5), 1))
                self.rpm = round(self.rpm + random.uniform(-20, 20), 1)
            else:  # overheat
                self.vibration = round(0.35 + random.uniform(0.05, 0.15), 3)
                self.temp = min(110.0, round(self.temp + random.uniform(1.0, 2.5), 1))
                self.rpm = round(self.rpm - random.uniform(10, 30), 1)

            health_score = 42
        else:
            # Slower, separate cooldown durations for different physical anomalies
            # Vibration normalizes over ~4 seconds, Temperature takes ~7 seconds
            self.vibration = round(max(0.15, self.vibration - 0.003), 3)
            self.temp = round(max(65.0, self.temp - 0.1), 1)
            self.rpm = round(min(1500.0, self.rpm + 5), 1)
            health_score = int(min(100, max(88, 98 - int(max_velocity * 1.5))))

        return {
            "vibration":    self.vibration,
            "temp":         self.temp,
            "rpm":          self.rpm,
            "max_velocity": round(max_velocity, 3),
            "health_score": health_score,
            "qpos":         qpos,
            "qvel":         qvel,
            "auto_phase":   self.auto_phase,
            "cycle_count":  self.cycle_count,
            "max_cycles":   self.max_cycles,
            "joints": {
                "shoulder_pan":  round(qpos[0], 3) if qpos else 0.0,
                "shoulder_lift": round(qpos[1], 3) if len(qpos) > 1 else 0.0,
                "elbow":         round(qpos[3], 3) if len(qpos) > 3 else 0.0,
                "wrist":         round(qpos[5], 3) if len(qpos) > 5 else 0.0,
            },
        }


# ---------------------------------------------------------------------------
# Standalone entry point — opens native 60 FPS desktop viewer
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    runner = SimRunner()
    # DO NOT auto-start: runner.start_auto_pick_and_place()

    if runner._use_gym:
        logger.info("Running FetchPickAndPlace-v4 with human render…")
        while True:
            runner.step()
            time.sleep(0.005)
    else:
        import mujoco
        import mujoco.viewer
        logger.info("Launching native MuJoCo passive viewer (fallback model)…")
        with mujoco.viewer.launch_passive(runner.model, runner.data) as viewer:
            while viewer.is_running():
                runner.step()
                viewer.sync()
                time.sleep(0.005)
