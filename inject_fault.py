import sys
import os
import requests

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def inject_vibration():
    """Overrides control signals in MuJoCo to simulate motor seizure & vibration spike."""
    print("🔴 INJECTING VIBRATION! Watch the robot shake!")
    url = "http://localhost:8000/api/fault/vibration"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            print("✅ Fault injection command received by backend server.")
            print("The native 3D MuJoCo robot is vibrating and max_velocity > 5.0!")
        else:
            print(f"⚠️ Server returned status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error connecting to FastAPI backend at {url}: {e}")

if __name__ == "__main__":
    inject_vibration()
