import asyncio
from app.simulation.sim_runner import SimRunner
from app.utils.logger import get_logger

logger = get_logger("DataStreamer")

class DataStreamer:
    def __init__(self, runner: SimRunner):
        self.runner = runner

    async def stream(self, interval=0.5):
        """Continuously yields simulated sensor readings."""
        while True:
            data = self.runner.step()
            yield data
            await asyncio.sleep(interval)
