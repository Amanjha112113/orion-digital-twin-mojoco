from langgraph.graph import StateGraph, START, END
from app.state import OrionState
from app.agents.digital_twin import digital_twin_agent
from app.agents.predictive_health import predictive_health_agent
from app.agents.root_cause import root_cause_agent
from app.agents.scheduler import scheduler_agent, schedule_repairs
from app.agents.quality_assurance import qa_agent
from app.agents.dashboard import dashboard_agent
from app.utils.logger import get_logger

logger = get_logger("GraphBuilder")

# Dummy implementation of parallel nodes for Send API or parallel execution path
def adjust_rpm_node(state: OrionState) -> OrionState:
    logger.info("Executing Parallel Action: Adjusting RPM")
    # Simulate action taking effect on state
    if "sensor_data" in state:
        state["sensor_data"]["rpm"] = max(1000.0, state["sensor_data"]["rpm"] - 300.0)
    return state

def activate_coolant_node(state: OrionState) -> OrionState:
    logger.info("Executing Parallel Action: Activating Coolant")
    if "sensor_data" in state:
        state["sensor_data"]["temp"] = max(65.0, state["sensor_data"]["temp"] - 15.0)
    return state

def isolate_joint_node(state: OrionState) -> OrionState:
    logger.info("Executing Parallel Action: Isolating Joint")
    if "sensor_data" in state:
        state["sensor_data"]["vibration"] = max(0.15, state["sensor_data"]["vibration"] - 0.3)
    return state

def routing_decision(state: OrionState):
    """Decide if we need diagnosis and repairs."""
    health = state.get("health_score", 100)
    repair_status = state.get("repair_status", "IDLE")
    if health < 70 or repair_status in ["RUNNING", "IN_PROGRESS"]:
        return "diagnose"
    return "visualize"

def build_graph():
    # Define StateGraph
    builder = StateGraph(OrionState)
    
    # Register Core Agents as Nodes
    builder.add_node("digital_twin", digital_twin_agent)
    builder.add_node("predictive_health", predictive_health_agent)
    builder.add_node("root_cause", root_cause_agent)
    builder.add_node("scheduler", scheduler_agent)
    builder.add_node("quality_assurance", qa_agent)
    builder.add_node("dashboard", dashboard_agent)
    
    # Register Parallel Repair Action Nodes
    builder.add_node("adjust_rpm", adjust_rpm_node)
    builder.add_node("activate_coolant", activate_coolant_node)
    builder.add_node("isolate_joint", isolate_joint_node)
    
    # Define Edges
    builder.add_edge(START, "digital_twin")
    builder.add_edge("digital_twin", "predictive_health")
    
    # Route based on predictive health score
    builder.add_conditional_edges(
        "predictive_health",
        routing_decision,
        {
            "diagnose": "root_cause",
            "visualize": "dashboard"
        }
    )
    
    builder.add_edge("root_cause", "scheduler")
    
    # Route scheduler to parallel repairs or straight to QA
    builder.add_conditional_edges(
        "scheduler",
        schedule_repairs,
        ["adjust_rpm", "activate_coolant", "isolate_joint", "quality_assurance"]
    )
    
    # Link parallel nodes back to Quality Assurance
    # Since scheduler triggered Send API or parallel paths, we link all of them to QA
    builder.add_edge("adjust_rpm", "quality_assurance")
    builder.add_edge("activate_coolant", "quality_assurance")
    builder.add_edge("isolate_joint", "quality_assurance")
    
    builder.add_edge("quality_assurance", "dashboard")
    builder.add_edge("dashboard", END)
    
    # Compile
    return builder.compile()

# Single graph instance
graph = build_graph()
