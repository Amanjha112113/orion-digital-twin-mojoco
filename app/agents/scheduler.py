from langgraph.constants import Send
from app.state import OrionState
from app.utils.logger import get_logger

logger = get_logger("SchedulerAgent")

def scheduler_agent(state: OrionState) -> OrionState:
    """Agent 4: Self-Healing Scheduler - outlines the repair strategy."""
    sensor_data = state.get("sensor_data", {})
    temp = sensor_data.get("temp", 65.0)
    vibration = sensor_data.get("vibration", 0.15)
    
    actions = state.get("repair_actions", [])
    current_status = state.get("repair_status", "IDLE")
    
    if current_status == "IDLE" and (temp > 75.0 or vibration > 0.4):
        state["repair_status"] = "RUNNING"
        actions = [
            {"action": "reduce_rpm", "value": 15},
            {"action": "coolant_boost", "value": "ON"},
            {"action": "joint_isolation", "value": True}
        ]
    elif current_status in ["RUNNING", "IN_PROGRESS"]:
        # Do not overwrite to IDLE while cooling down.
        pass
    else:
        state["repair_status"] = "IDLE"
        
    state["repair_actions"] = actions
    logger.info(f"Scheduled repair actions: {actions}")
    return state

def schedule_repairs(state: OrionState):
    """LangGraph Conditional Router executing parallel tasks using the Send API."""
    if state.get("repair_status") == "RUNNING":
        logger.info("Routing to parallel repair actions.")
        return [
            Send("adjust_rpm", {"action": "reduce_rpm", "value": 15}),
            Send("activate_coolant", {"action": "coolant_boost", "value": "ON"}),
            Send("isolate_joint", {"action": "joint_isolation", "value": True}),
        ]
    return ["quality_assurance"]
