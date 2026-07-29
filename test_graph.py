import asyncio
from app.graph import build_graph
from app.state import OrionState

async def test():
    # Initial state
    state: OrionState = {
        "sensor_data": {"vibration": 0.1, "temp": 75, "rpm": 1500.0},
        "twin_state": {},
        "health_score": 95,
        "failure_probability": 0.0,
        "predicted_rul": 1000,
        "root_causes": [],
        "diagnosis_confidence": 0.0,
        "repair_actions": [],
        "repair_status": "IDLE",
        "validation_result": False,
        "post_repair_health": 0,
        "dashboard_metrics": {},
        "graph_status": "HEALTHY"
    }
    
    graph = build_graph()
    # Run the graph synchronously
    result = graph.invoke(state)
    print("Health Score after run:", result.get("health_score"))
    print("Graph Status after run:", result.get("graph_status"))

if __name__ == "__main__":
    asyncio.run(test())
