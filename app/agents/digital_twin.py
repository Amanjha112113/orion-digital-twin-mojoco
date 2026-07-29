from app.state import OrionState

def digital_twin_agent(state: OrionState) -> OrionState:
    """Agent 1: Perception layer from physical twin simulation."""
    # Simulates loading joint angles/velocities from MuJoCo
    sensor_data = state.get("sensor_data", {"vibration": 0.15, "temp": 65.0, "rpm": 1500.0})
    
    # Simple projection to twin state simulation coordinates
    twin_state = {
        "joint_x": 0.1 * sensor_data.get("rpm", 1500.0) / 1000.0,
        "joint_y": sensor_data.get("vibration", 0.15) * 2.0,
        "joint_z": sensor_data.get("temp", 65.0) / 100.0
    }
    
    state["twin_state"] = twin_state
    return state
