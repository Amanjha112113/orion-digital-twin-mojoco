#!/bin/bash
echo "=== Starting ORION-FACTORY React Dashboard (Port 3000) ==="
export PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH
cd frontend
DISABLE_ESLINT_PLUGIN=true npm start
