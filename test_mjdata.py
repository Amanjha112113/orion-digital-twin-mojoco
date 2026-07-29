import os
import re
from app.graph import build_graph
from app.state import OrionState

def parse_mjdata(file_path):
    """Parses exported MuJoCo MJDATA.TXT file for QPOS, QVEL, and CTRL values."""
    with open(file_path, "r") as f:
        content = f.read()

    def get_section_values(section_name):
        pattern = rf"{section_name}\s*\n((?:\s*[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?\s*\n)+)"
        match = re.search(pattern, content)
        if match:
            lines = match.group(1).strip().splitlines()
            vals = []
            for l in lines:
                for token in l.split():
                    try:
                        vals.append(float(token))
                    except ValueError:
                        pass
            return vals
        return []

    qpos = get_section_values("QPOS")
    qvel = get_section_values("QVEL")
    ctrl = get_section_values("CTRL")

    return {
        "qpos": qpos,
        "qvel": qvel,
        "ctrl": ctrl
    }

def test_mjdata_ingestion():
    file_path = "MJDATA.TXT"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("Parsing downloaded MJDATA.TXT physics dump...")
    data = parse_mjdata(file_path)
    print(f"Extracted QPOS (Joint Angles): {data['qpos']}")
    print(f"Extracted QVEL (Joint Velocities): {data['qvel']}")
    print(f"Extracted CTRL (Actuator Torques): {data['ctrl']}")

    # Formulate sensor reading from physics telemetry dump
    vibration = round(abs(data['qvel'][3]) / 20.0, 3) if len(data['qvel']) > 3 else 0.15
    temp = round(65.0 + max(0, abs(data['ctrl'][2])) * 3.0, 1) if len(data['ctrl']) > 2 else 65.0

    state: OrionState = {
        "sensor_data": {
            "vibration": vibration,
            "temp": temp,
            "rpm": 1500.0
        },
        "twin_state": {
            "shoulder_pan": data['qpos'][0] if len(data['qpos']) > 0 else 0.0,
            "shoulder_lift": data['qpos'][1] if len(data['qpos']) > 1 else 0.0,
            "elbow": data['qpos'][2] if len(data['qpos']) > 2 else 0.0,
            "wrist": data['qpos'][3] if len(data['qpos']) > 3 else 0.0
        },
        "health_score": 100,
        "failure_probability": 0.0,
        "predicted_rul": 3600,
        "root_causes": [],
        "diagnosis_confidence": 0.0,
        "repair_actions": [],
        "repair_status": "IDLE",
        "validation_result": False,
        "post_repair_health": 100,
        "dashboard_metrics": {},
        "graph_status": "HEALTHY"
    }

    print("\nFeeding parsed MuJoCo physics dump into LangGraph StateGraph...")
    graph = build_graph()
    result = graph.invoke(state)

    print("\n=== LANGGRAPH TEST RESULT FROM REAL MJDATA.TXT ===")
    print(f"Health Score: {result.get('health_score')}")
    print(f"Failure Probability: {result.get('failure_probability')}")
    print(f"Graph Status: {result.get('graph_status')}")
    print(f"Diagnosed Causes: {result.get('root_causes')}")
    print(f"Repair Actions Scheduled: {result.get('repair_actions')}")
    print("==================================================")

if __name__ == "__main__":
    test_mjdata_ingestion()
