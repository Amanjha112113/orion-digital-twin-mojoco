#!/bin/bash
echo "=== Setting up ORION-FACTORY environment ==="
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "=== Setting up Frontend ==="
cd frontend
npm install
cd ..

echo "=== Setup complete! ==="
