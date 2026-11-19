# Hardware Fault Feature Implementation - UNSOLVABLE FAULTS

## Summary
Replaced the "Self Heal / Force Heal" button with "Hardware Fault Inject" button. **Hardware faults are PERMANENT and UNSOLVABLE** - the system attempts self-healing continuously but FAILS, keeping the machine stopped indefinitely.

## Key Characteristics of Hardware Faults

### 🔴 CRITICAL: Hardware Faults are Permanent
1. **Cannot be healed** - Self-healing system attempts repairs but continuously fails
2. **Machine stays stopped** - `auto_phase = "STOPPED"` permanently
3. **No cooldown** - Telemetry remains in critical state (no gradual recovery)
4. **Requires physical replacement** - Only manual intervention can resolve

### 🤖 Machine Behavior with Hardware Fault:
- ✅ Self-healing activates (repair_status = "RUNNING")
- ❌ Repairs continuously fail (never reaches "SUCCESS")
- ❌ **Machine completely FROZEN** (no movement, no shaking)
- ❌ Telemetry stays critical (RPM ~500, vibration ~0.75, temp ~82°C)
- 🔄 Dashboard shows persistent "UNSOLVABLE" notification

### Comparison with Other Faults:
| Fault Type | Machine Behavior |
|------------|------------------|
| Vibration/Overheat | 🔴 Shakes violently during fault |
| Hardware Fault | ⛔ **FROZEN in place** (emergency stop) |

## Changes Made

### 1. Frontend - Fault Injection Pages

#### FaultInjectionPage.jsx
- **Removed**: "Reset / Force Heal" button and `handleHeal()` function
- **Added**: "Hardware Fault Inject" button that calls `/api/fault/hardware`
- **Removed Import**: `RotateCcw` icon (no longer needed)
- **Styling**: Indigo color scheme for hardware fault button

#### AgentOrchestrationPage.jsx
- **Removed**: "Reset / Force Heal" button in the 3-button grid
- **Removed**: `handleHeal()` function
- **Added**: "Hardware Fault Inject" button as the third button
- **Removed Import**: `RotateCcw` icon
- **Layout**: Maintained 3-column grid with Vibration, Overheat, and Hardware

### 2. Backend - API Endpoints

#### app/main.py
- **Added**: New endpoint `/api/fault/hardware` that triggers hardware fault injection
```python
@app.post("/api/fault/hardware")
async def trigger_hardware():
    fault_injector.trigger_hardware_fault()
    return {"message": "Hardware fault injected successfully."}
```

### 3. Backend - Fault Injection Logic

#### app/simulation/fault_injector.py
- **Added**: `trigger_hardware_fault()` method
```python
def trigger_hardware_fault(self):
    logger.warning("Hardware fault triggered!")
    self.runner.inject_fault("hardware")
```

#### app/simulation/sim_runner.py
- **Added**: `hardware_fault_permanent` flag to track unsolvable faults
- **Updated**: `inject_fault()` method to handle "hardware" fault type
- **Hardware Fault Signature**:
  - Vibration: 0.75 (erratic, no cooldown)
  - Temperature: 82.0°C (elevated, no cooldown)
  - RPM: 500.0 (critical low, no recovery)
  - Health Score: 25 (permanent critical failure)
  - Auto Phase: STOPPED (machine frozen)
  - **Robot Motion**: COMPLETELY FROZEN (emergency stop, no shaking)
  
- **Updated**: `_gym_policy()` and `_step_mujoco()` methods
  - Hardware faults: Return zero actions (complete freeze)
  - Vibration/overheat faults: Apply random actions (shaking)
```python
# Hardware faults: FREEZE completely (no movement at all)
if self.hardware_fault_permanent:
    action = np.zeros(self._action_dim, dtype=np.float32)
    return action
```
  
- **Updated**: `clear_faults()` method - **REJECTS hardware fault clearing**
```python
def clear_faults(self):
    if self.hardware_fault_permanent:
        logger.warning("❌ Cannot clear hardware fault - physical replacement required!")
        return
```

- **Updated**: Telemetry step function - **NO COOLDOWN for hardware faults**
```python
if self.fault_type == "hardware":
    # Hardware faults: NO COOLDOWN - permanent critical state
    self.vibration = round(0.70 + random.uniform(0.05, 0.10), 3)
    self.temp = round(80.0 + random.uniform(0, 4), 1)
    self.rpm = round(450 + random.uniform(-50, 50), 1)
    health_score = 25  # Critical failure
```

### 4. Agent System - Unsolvable Fault Handling

#### app/state.py
- **Added**: `hardware_fault_active` field to track permanent hardware faults

#### app/agents/root_cause.py (Agent 3)
- **Enhanced**: Detects hardware faults as UNSOLVABLE
- **Special Diagnosis**:
```python
if hardware_fault_active:
    diagnoses = [
        "CRITICAL: Physical encoder hardware failure detected",
        "Mechanical servo lockup - requires component replacement",
        "System attempting self-healing but CANNOT RESOLVE hardware damage"
    ]
```

#### app/agents/scheduler.py (Agent 4)
- **Enhanced**: Continuously attempts repairs but marks as failing
- **Hardware Fault Behavior**:
```python
if hardware_fault_active:
    state["repair_status"] = "RUNNING"  # Continuously attempting
    actions = [
        {"action": "emergency_shutdown", "value": True},
        {"action": "attempting_encoder_reset", "value": "FAILING"},
        {"action": "physical_replacement_required", "value": True}
    ]
```

#### app/agents/dashboard.py (Agent 6)
- **Enhanced**: `dashboard_agent()` function to detect and report hardware faults as UNSOLVABLE
- **Special Graph Status**: `"HARDWARE_FAILURE"` for permanent faults
- **Detection Logic**: 
  - Uses `hardware_fault_active` flag OR sensor signature
  - Never marks hardware faults as "SUCCESS"
  - Creates detailed permanent fault report
- **Added to State**: 
```python
hardware_fault_details = {
    "status": "CRITICAL - UNSOLVABLE",
    "type": "Hardware Encoder Failure",
    "rpm": rpm,
    "vibration": vibration,
    "temperature": temp,
    "description": "Physical hardware damage detected - Self-healing CANNOT resolve - Component replacement required",
    "repair_attempts": "CONTINUOUS FAILURE"
}
```

#### app/server.py
- **Modified**: Fault clearing logic - **DOES NOT clear hardware faults**
```python
if output_state.get("repair_status") in ["SUCCESS", "IN_PROGRESS", "RUNNING"]:
    if not raw_data.get("hardware_fault_active", False):
        fault_injector.reset()  # Only clear if NOT hardware fault
```

### 5. Frontend - Persistent Dashboard Display

#### frontend/src/pages/OverviewPage.jsx
- **Enhanced**: Hardware fault alert card for **PERMANENT UNSOLVABLE faults**
- **Features**:
  - Red/rose gradient with continuous pulse animation
  - Shows "CRITICAL HARDWARE FAULT DETECTED" header
  - **Self-healing status box** showing continuous repair attempts
  - Text: "System attempting automated repair protocols... FAILING CONTINUOUSLY"
  - Warning: "Hardware damage cannot be resolved through software healing"
  - Displays real-time metrics with status labels:
    - RPM: "CRITICAL LOW"
    - Vibration: "ERRATIC"
    - Temperature: "ELEVATED"
  - Multiple status badges:
    - "CRITICAL - UNSOLVABLE" (pulsing)
    - "Hardware Encoder Failure"
    - "SYSTEM STOPPED"
    - "REPAIR: CONTINUOUS FAILURE"
  - **Persists indefinitely** - never disappears until system restart

## User Flow - Hardware Fault (UNSOLVABLE)

1. **Inject Hardware Fault**: User clicks "⚙️ Inject Hardware Fault" button
2. **Backend Processing**: 
   - API receives POST to `/api/fault/hardware`
   - FaultInjector triggers **permanent** hardware fault in SimRunner
   - Simulation updates: 
     - RPM drops to ~500 (erratic)
     - Vibration rises to ~0.75 (no cooldown)
     - Temp to ~82°C (no cooldown)
     - Health score drops to 25
     - **Machine stops**: `auto_phase = "STOPPED"`
     - Flag set: `hardware_fault_permanent = True`
3. **Agent 3 Detection** (Root Cause):
   - Detects hardware fault as UNSOLVABLE
   - Diagnosis: "Physical encoder hardware failure - requires replacement"
   - Confidence: 100%
4. **Agent 4 Response** (Scheduler):
   - Activates self-healing: `repair_status = "RUNNING"`
   - Schedules repair actions: emergency_shutdown, encoder_reset, etc.
   - **Repairs continuously FAIL** - never reaches "SUCCESS"
5. **Agent 6 Dashboard**:
   - Monitors hardware fault status
   - Sets `graph_status = "HARDWARE_FAILURE"`
   - Creates permanent fault report with "UNSOLVABLE" status
   - NO financial report generated (fault never resolves)
6. **Frontend Display**:
   - Overview page receives hardware fault data via WebSocket
   - **Persistent red alert card** appears with:
     - "CRITICAL HARDWARE FAULT DETECTED" header
     - Self-healing status: "ATTEMPTING... FAILING CONTINUOUSLY"
     - Real-time erratic sensor readings
     - Multiple critical status badges
   - **Card never disappears** - persists indefinitely
7. **System State**:
   - ❌ Machine remains STOPPED (no pick-and-place)
   - ❌ Telemetry stays critical (no recovery)
   - 🔄 Self-healing keeps trying (always fails)
   - 🚨 Dashboard shows permanent critical alert

## Testing

To test the **UNSOLVABLE hardware fault** implementation:
1. Start the backend: `python -m app.main`
2. Start the frontend: `cd frontend && npm start`
3. Navigate to "Fault Injection" page
4. Click "⚙️ Inject Hardware Fault" button
5. **Observe**:
   - Machine **immediately FREEZES** (no movement whatsoever)
   - Health score drops to 25
   - Self-healing activates (repair_status = "RUNNING")
   - Robot stops mid-motion and stays frozen
6. Navigate to "Overview" page
7. **Verify**:
   - Persistent red alert card appears
   - Shows "SELF-HEALING ACTIVE" with "FAILING CONTINUOUSLY"
   - Sensor readings stay critical (no improvement)
   - Multiple badges show unsolvable status
8. Navigate to "Agent Orchestration" page
9. **Verify**:
   - Graph shows "HARDWARE_FAILURE" status
   - Root causes show unsolvable hardware diagnosis
   - Repair actions show continuous attempts
10. **Wait 30+ seconds**:
    - ❌ Alert card DOES NOT disappear
    - ❌ Machine DOES NOT recover
    - ❌ Telemetry DOES NOT improve
    - 🔄 Self-healing keeps running (forever)

## Expected vs Other Faults

| Aspect | Vibration/Overheat Faults | Hardware Fault |
|--------|--------------------------|----------------|
| Self-healing | ✅ Works, reaches SUCCESS | ❌ Runs forever, never SUCCESS |
| Cooldown | ✅ Gradual recovery (~10s) | ❌ No recovery, stays critical |
| Robot motion | 🔴 Shakes violently | ⛔ **FROZEN completely** |
| Machine state | ✅ Resumes after healing | ❌ Stays STOPPED permanently |
| Dashboard alert | ⏱️ Disappears after fix | 🔄 Persists indefinitely |
| Health score | ✅ Returns to 95+ | ❌ Stays at 25 |
| Financial report | ✅ Generated on success | ❌ Never generated |

## Notes

- The `/api/heal` endpoint still exists but **CANNOT clear hardware faults**
- Hardware faults set `hardware_fault_permanent = True` which blocks all healing
- The system continuously attempts repairs but they always fail
- Machine remains in `auto_phase = "STOPPED"` - no operations possible
- Telemetry has no cooldown - stays at critical levels indefinitely
- Agent 6 sets special graph status: `"HARDWARE_FAILURE"`
- Dashboard alert is **persistent** - never disappears until system restart
- Financial reports are NOT generated for hardware faults (never resolve)
- Only a complete system restart can clear a hardware fault

## Physical World Analogy

This simulates a **real physical hardware failure** like:
- Broken encoder chip
- Seized bearing
- Stripped gear teeth
- Burned motor coil

In these cases:
- ✅ Diagnostic AI can identify the problem
- ✅ Control system can attempt recovery protocols
- ❌ Software cannot fix physical damage
- ❌ Robot must be taken offline for repair
- ❌ Human technician intervention required
