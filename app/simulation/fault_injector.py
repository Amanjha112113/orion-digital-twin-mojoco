import sys
import os
import argparse

# Add root project directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import requests
from app.simulation.sim_runner import SimRunner
from app.utils.logger import get_logger

logger = get_logger("FaultInjector")

class FaultInjector:
    def __init__(self, runner: SimRunner):
        self.runner = runner

    def trigger_vibration_fault(self):
        logger.warning("Vibration fault triggered!")
        self.runner.inject_fault("vibration_spike")

    def trigger_overheat_fault(self):
        logger.warning("Overheating fault triggered!")
        self.runner.inject_fault("overheat")

    def trigger_hardware_fault(self):
        logger.warning("Hardware fault triggered!")
        self.runner.inject_fault("hardware")

    def reset(self):
        logger.info("Fault reset/heal command issued.")
        self.runner.clear_faults()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ORION-FACTORY Demo Fault Injector")
    parser.add_argument("--spike", type=float, help="Simulate a vibration spike")
    parser.add_argument("--overheat", action="store_true", help="Simulate overheating")
    parser.add_argument("--reset", action="store_true", help="Reset/Heal simulation")
    
    args = parser.parse_args()
    
    url = "http://localhost:8000/api"
    
    try:
        if args.spike:
            print(f"Injecting vibration spike...")
            res = requests.post(f"{url}/fault/vibration")
            print(res.json().get("message", "Done"))
        elif args.overheat:
            print("Injecting overheat fault...")
            res = requests.post(f"{url}/fault/overheat")
            print(res.json().get("message", "Done"))
        elif args.reset:
            print("Issuing heal command...")
            res = requests.post(f"{url}/heal")
            print(res.json().get("message", "Done"))
        else:
            print("Usage: python app/simulation/fault_injector.py [--spike 0.8 | --overheat | --reset]")
    except Exception as e:
        print(f"Could not connect to FastAPI server at {url}. Make sure it is running. Error: {e}")
