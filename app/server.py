import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from app.simulation.sim_runner import SimRunner
from app.simulation.fault_injector import FaultInjector
from app.graph import graph
from app.state import OrionState
from app.utils.logger import get_logger
from app.utils.error_logger import error_logger

logger = get_logger("WSServer")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()
sim_runner = SimRunner()
fault_injector = FaultInjector(sim_runner)

async def telemetry_broadcast_loop():
    """Steps physics at 60Hz (to keep native window smooth) and broadcasts telemetry/AI at 10Hz."""
    logger.info("Starting 60Hz physics / 10Hz telemetry broadcast loop...")
    loop_counter = 0
    output_state = {}
    while True:
        try:
            # Step the simulation frame at 60Hz (prevents window freezing)
            raw_data = sim_runner.step()
            
            # Every 6 physics frames (~10Hz), run LangGraph and WebSocket broadcast
            if loop_counter % 6 == 0:
                input_state = {
                    "sensor_data": {
                        "vibration": raw_data["vibration"],
                        "temp": raw_data["temp"],
                        "rpm": raw_data["rpm"],
                        "max_velocity": raw_data["max_velocity"]
                    },
                    "twin_state": raw_data["joints"],
                    "health_score": raw_data["health_score"],
                    "failure_probability": round(1.0 - (raw_data["health_score"] / 100.0), 2),
                    "predicted_rul": int(raw_data["health_score"] * 36),
                    "root_causes": output_state.get("root_causes", []),
                    "diagnosis_confidence": output_state.get("diagnosis_confidence", 0.0),
                    "repair_actions": output_state.get("repair_actions", []),
                    "repair_status": output_state.get("repair_status", "IDLE"),
                    "validation_result": output_state.get("validation_result", False),
                    "post_repair_health": output_state.get("post_repair_health", raw_data["health_score"]),
                    "dashboard_metrics": output_state.get("dashboard_metrics", {}),
                    "graph_status": output_state.get("graph_status", "HEALTHY")
                }
                
                # Process state through LangGraph agent pipeline
                output_state = graph.invoke(input_state)
                
                # If the repair action is running/in progress, clear the active physical simulation fault
                # so the system can begin its natural cooldown sequence.
                if output_state.get("repair_status") in ["SUCCESS", "IN_PROGRESS", "RUNNING"]:
                    fault_injector.reset()
                
                # Prepare 100ms payload for React Frontend Dashboard
                payload = {
                    "telemetry": {
                        "vibration": raw_data["vibration"],
                        "temp": raw_data["temp"],
                        "rpm": raw_data["rpm"],
                        "max_velocity": raw_data["max_velocity"],
                        "qpos": raw_data["qpos"],
                        "qvel": raw_data["qvel"],
                        "auto_phase": raw_data["auto_phase"],
                        "cycle_count": raw_data.get("cycle_count", 0),
                        "max_cycles": raw_data.get("max_cycles", 30),
                        "joints": raw_data["joints"]
                    },
                    "state": {
                        "health_score": output_state.get("health_score", raw_data["health_score"]),
                        "failure_probability": output_state.get("failure_probability", 0.0),
                        "predicted_rul": output_state.get("predicted_rul", 3600),
                        "root_causes": output_state.get("root_causes", []),
                        "diagnosis_confidence": output_state.get("diagnosis_confidence", 0.0),
                        "repair_actions": output_state.get("repair_actions", []),
                        "repair_status": output_state.get("repair_status", "IDLE"),
                        "validation_result": output_state.get("validation_result", False),
                        "post_repair_health": output_state.get("post_repair_health", 100),
                        "dashboard_metrics": output_state.get("dashboard_metrics", {}),
                        "graph_status": output_state.get("graph_status", "HEALTHY"),
                        "system_errors": error_logger.get_errors(),
                        "sensor_data": input_state["sensor_data"]
                    }
                }
                
                # Broadcast every 10Hz to all connected React WebSocket clients
                await manager.broadcast(payload)
            
        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}", exc_info=True)
            
        loop_counter += 1
        # ~60 Hz physics update frequency
        await asyncio.sleep(1.0 / 60.0)
