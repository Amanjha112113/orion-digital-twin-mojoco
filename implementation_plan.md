# Fix Grasping Reliability and Placement Accuracy

I have identified the core issue based on your screenshot and description.

## The Error: Empty-Handed Delivery
1. **The "Green Dot"**: The red dot you are seeing is MuJoCo's **Mocap Body** (the invisible target handle the inverse kinematics solver uses to pull the arm). It is pointing at the box because the robot is currently in the `PICK_APPROACH` phase trying to target the box! 
2. **The Real Problem**: The robot is descending onto the box too aggressively. Its fingers are colliding with the box and knocking it away. Because the current code doesn't verify if it actually grabbed the box, it blindly proceeds to the `TRANSPORT` and `PLACE` phases with an **empty hand**! This is why it appears to "fail to place the box at the target"—it never had the box to begin with!

## Proposed Changes

### [MODIFY] `app/simulation/sim_runner.py`
We will overhaul the pick-and-place logic to be robust and self-verifying:
- **Gentle Descent**: Slow down the `DESCEND` phase (`action[:3] = np.clip(delta * 2.0, -1, 1)`) so the gripper gently surrounds the box without knocking it away.
- **Grasp Verification**: Before transitioning from `LIFT` to `TRANSPORT`, we will add a check: if the object's Z-coordinate hasn't increased (meaning it's still on the table), the robot **failed to pick it up**. It will abort the sequence and try again!
- **Accurate Placement**: Refine the exact Z-heights for hovering over the box and the target to prevent physics clipping.

## Verification Plan
1. Restart the backend.
2. Watch the robot's `DESCEND` phase in the MuJoCo viewer; it will be noticeably slower and gentler.
3. If the robot fumbles the box, it will automatically abort the delivery and retry picking it up, rather than pantomiming an empty-handed placement.
