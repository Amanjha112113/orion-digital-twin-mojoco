import time
import gymnasium as gym
import gymnasium_robotics
import mujoco.viewer

env = gym.make("FetchPickAndPlace-v4")
obs, _ = env.reset()

# Get the underlying MuJoCo model and data
model = env.unwrapped.model
data = env.unwrapped.data

with mujoco.viewer.launch_passive(model, data, show_left_ui=True, show_right_ui=True) as viewer:
    for i in range(100):
        env.step(env.action_space.sample())
        viewer.sync()
        time.sleep(0.02)
        
env.close()
