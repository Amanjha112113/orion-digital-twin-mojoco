#!/bin/bash
echo "=== Starting ORION-FACTORY Backend & 3D Simulation ==="
source venv/bin/activate
export PYTHONPATH=.

# Note: The FastAPI server imports SimRunner which automatically opens the 
# native 3D viewer window on the main thread (required by macOS).
# We do NOT run sim_runner.py in the background, to avoid NSWindow thread collisions.
echo "Launching FastAPI WebSockets Server (Port 8000)..."
mjpython app/main.py
