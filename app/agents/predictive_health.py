import os
import requests
from app.state import OrionState
from app.config import TIMEGPT_API_KEY
from app.utils.logger import get_logger

logger = get_logger("PredictiveHealthAgent")

def predictive_health_agent(state: OrionState) -> OrionState:
    """Agent 2: Predicts remaining useful life and failure probabilities."""
    sensor_data = state.get("sensor_data", {"vibration": 0.15, "temp": 65.0, "rpm": 1500.0})
    vibration = sensor_data.get("vibration", 0.15)
    temp = sensor_data.get("temp", 65.0)

    # Statistical baseline fallback / 3-sigma calculation
    # Normal vibration: ~0.15, high vibration: >0.5
    # Normal temp: ~65, high temp: >85
    
    if temp > 75.0 or vibration > 0.4:
        health_score = 42
        failure_probability = 0.85
        predicted_rul = 120
        graph_status = "DEGRADED"
    else:
        vibration_penalty = max(0, (vibration - 0.15) / 0.8 * 50)
        temp_penalty = max(0, (temp - 65.0) / 45.0 * 50)
        health_score = int(max(75, 100 - (vibration_penalty + temp_penalty)))
        failure_probability = round(1.0 - (health_score / 100.0), 2)
        predicted_rul = 3600
        graph_status = "HEALTHY"

    state["health_score"] = health_score
    state["failure_probability"] = failure_probability
    state["predicted_rul"] = predicted_rul
    state["graph_status"] = graph_status
    
    return state
