import gymnasium_robotics
import inspect
from gymnasium_robotics.envs.fetch.pick_and_place import MujocoFetchEnv

print("--- step method ---")
try:
    print(inspect.getsource(MujocoFetchEnv.step))
except Exception as e:
    print(e)
