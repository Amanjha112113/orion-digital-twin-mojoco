import gymnasium as gym
import gymnasium_robotics
env = gym.make("FetchPickAndPlace-v4")
obs, _ = env.reset()
print(f"Table Z approx 0.425")
print(f"Object resting (achieved_goal): {obs['achieved_goal']}")
print(f"Target (desired_goal): {obs['desired_goal']}")
