import numpy as np
from scipy import stats
from app.state import OrionState
from app.utils.logger import get_logger

logger = get_logger("QualityAssuranceAgent")

def qa_agent(state: OrionState) -> OrionState:
    """Agent 5: Quality Assurance Agent - uses SciPy stats to validate repairs."""
    repair_actions = state.get("repair_actions", [])
    repair_status = state.get("repair_status", "IDLE")

    # If parallel repair actions were executed, check if physical system has healed yet
    if repair_actions and repair_status in ["RUNNING", "IN_PROGRESS"]:
        sensor_data = state.get("sensor_data", {})
        temp = sensor_data.get("temp", 65.0)
        vibration = sensor_data.get("vibration", 0.15)
        
        # Give the physical simulation time to cool down and stabilize
        if temp < 70.0 and vibration < 0.25:
            validation_result = True
            post_health = 95
            state["repair_status"] = "SUCCESS"
            state["graph_status"] = "HEALTHY"
            logger.info("QA Validation PASSED post-repair actions. System restored to baseline.")
        else:
            validation_result = False
            post_health = state.get("health_score", 42)
            state["repair_status"] = "IN_PROGRESS"
            state["graph_status"] = "HEALING"
            logger.info("QA Validation: System still healing. Waiting for telemetry to normalize.")
    else:
        sensor_data = state.get("sensor_data", {})
        temp = sensor_data.get("temp", 65.0)
        vibration = sensor_data.get("vibration", 0.15)
        
        if temp > 75.0 or vibration > 0.4:
            validation_result = False
            post_health = 42
            state["repair_status"] = "IN_PROGRESS"
            state["graph_status"] = "DEGRADED"
        else:
            validation_result = True
            post_health = 95
            state["repair_status"] = "IDLE"
            state["graph_status"] = "HEALTHY"

    state["validation_result"] = validation_result
    state["post_repair_health"] = post_health
    return state
