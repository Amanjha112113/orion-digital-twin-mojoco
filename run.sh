#!/bin/bash
echo "=== Starting ORION-FACTORY Demo Ecosystem ==="

cleanup() {
    echo "Terminating services..."
    kill $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup SIGINT

source venv/bin/activate
export PYTHONPATH=.
export PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH

# Start React Frontend Dashboard in Background
echo "Launching React Dashboard (Port 3000)..."
cd frontend
DISABLE_ESLINT_PLUGIN=true npm start &
FRONTEND_PID=$!
cd ..

sleep 2

# Start Native 3D Simulation & Backend Server in Foreground
# Running in foreground allows macOS to safely render the native GUI window
echo "Launching Native 3D MuJoCo Window & Backend (Port 8000)..."
venv/bin/mjpython app/main.py
