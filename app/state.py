from typing import TypedDict, List, Dict, Any, Optional

class OrionState(TypedDict):
    # 1. Perception Layer
    sensor_data: Dict[str, float]  # {"vibration": 0.5, "temp": 85, "rpm": 1500}
    twin_state: Dict[str, float]   # MuJoCo joint angles/velocities
    
    # 2. Prediction Layer
    health_score: int              # 0-100
    failure_probability: float     # 0.0 - 1.0
    predicted_rul: int             # Remaining Useful Life (seconds)
    
    # 3. Diagnosis Layer
    root_causes: List[str]         # ["Bearing Wear", "Misalignment"]
    diagnosis_confidence: float    # 0.0 - 1.0
    
    # 4. Execution Layer
    repair_actions: List[Dict[str, Any]]     # [{"action": "reduce_rpm", "value": 15}]
    repair_status: str             # "IDLE" | "RUNNING" | "SUCCESS" | "FAILED"
    
    # 5. Validation Layer
    validation_result: bool        # True if repair passed T-test
    post_repair_health: int        # Updated health score
    
    # 6. Visualization Layer
    dashboard_metrics: Dict[str, Any]        # Cost averted, token usage, etc.
    graph_status: str              # "HEALTHY" | "DIAGNOSING" | "HEALING"
    
    # 7. Hardware Fault Tracking
    hardware_fault_active: Optional[bool]    # True if hardware fault is injected
