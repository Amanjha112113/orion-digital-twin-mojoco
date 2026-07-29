import sys
import os
import io
import time
from PIL import Image
import mujoco
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.simulation.sim_runner import SimRunner
from app.utils.logger import get_logger

logger = get_logger("WebStreamer")

app = FastAPI(title="ORION-FACTORY 3D Live Web Streamer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sim_runner = SimRunner()

try:
    renderer = mujoco.Renderer(sim_runner.model, height=480, width=640)
except Exception as e:
    logger.warning(f"Offscreen hardware rendering note: {e}")
    renderer = None

def generate_mjpeg_frames():
    """Generates MJPEG frames from the live 3D MuJoCo physics engine."""
    while True:
        sim_runner.step()
        
        if renderer is not None:
            try:
                renderer.update_scene(sim_runner.data)
                pixels = renderer.render()
                img = Image.fromarray(pixels)
                buffer = io.BytesIO()
                img.save(buffer, format="jpeg", quality=80)
                frame_bytes = buffer.getvalue()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            except Exception as e:
                logger.error(f"Render frame error: {e}")
                time.sleep(0.05)
        else:
            time.sleep(0.05)
            
        time.sleep(0.016)  # ~60 FPS rate limit

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(
        generate_mjpeg_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/")
async def root():
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html>
    <head>
        <title>ORION-FACTORY Live 3D Twin</title>
        <style>
            body { margin:0; background:#0e0e10; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; }
            img { max-width:100vw; max-height:100vh; object-fit:contain; border-radius:8px; }
        </style>
    </head>
    <body>
        <img src="/video_feed" alt="ORION-FACTORY Live Sim">
    </body>
    </html>
    """)

if __name__ == "__main__":
    print("🚀 ORION-FACTORY Web Streamer starting...")
    print("📺 Live Stream available at http://localhost:8001/video_feed")
    uvicorn.run(app, host="0.0.0.0", port=8001)
