import gymnasium as gym
import gymnasium_robotics
env = gym.make("FetchPickAndPlace-v4")
obs, _ = env.reset()
print(obs)
