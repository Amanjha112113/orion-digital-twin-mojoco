import asyncio
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.server import manager, telemetry_broadcast_loop, fault_injector, sim_runner
from app.utils.logger import get_logger
from app.utils.error_logger import error_logger
from app.api.chat import router as chat_router

logger = get_logger("Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start telemetry broadcast in background on startup
    task = asyncio.create_task(telemetry_broadcast_loop())
    logger.info("ORION-FACTORY backend successfully started.")
    yield
    # Cleanup on shutdown
    task.cancel()

app = FastAPI(title="ORION-FACTORY Backend API", lifespan=lifespan)
app.include_router(chat_router, prefix="/api")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_entry = error_logger.log_exception(exc, context=f"HTTP {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": error_entry["message"], "error": error_entry}
    )

@app.get("/")
def read_root():
    return {"status": "ORION-FACTORY system active"}

@app.get("/api/logs/errors")
def get_error_logs():
    return {"errors": error_logger.get_errors()}

@app.post("/api/fault/vibration")
async def trigger_vibration():
    fault_injector.trigger_vibration_fault()
    return {"message": "Vibration fault injected successfully."}

@app.post("/api/fault/overheat")
async def trigger_overheat():
    fault_injector.trigger_overheat_fault()
    return {"message": "Overheat fault injected successfully."}

@app.post("/api/heal")
async def trigger_heal():
    fault_injector.reset()
    return {"message": "Heal command issued."}

@app.post("/api/auto_pick_place")
async def trigger_auto_pick_place():
    sim_runner.start_auto_pick_and_place()
    return {"message": "Autonomous Mobile Phone Pick & Place sequence started."}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
