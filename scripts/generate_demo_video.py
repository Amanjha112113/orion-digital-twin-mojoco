import os
import numpy as np
from app.utils.logger import get_logger

logger = get_logger("GenerateDemoVideo")

# Use a standard model or mockup to generate the fallback MP4
try:
    import imageio  # type: ignore
    import mujoco   # type: ignore
    import gymnasium as gym  # type: ignore
    
    logger.info("Initializing gymnasium Ant-v4 environment...")
    env = gym.make("Ant-v4", render_mode="rgb_array")
    
    frames = []
    obs, info = env.reset()
    
    logger.info("Simulating steps (normal -> fault -> heal)...")
    for i in range(500):
        if i < 150:  # Normal
            action = env.action_space.sample() * 0.1
        elif i < 300:  # FAULT: Introduce vibration (shake the motors)
            action = np.random.uniform(-1, 1, 8) * 0.8
        else:  # HEAL: Stabilize
            action = env.action_space.sample() * 0.1
            
        obs, reward, terminated, truncated, info = env.step(action)
        frame = env.render()
        frames.append(frame)
        
        if terminated or truncated:
            break
            
    env.close()
    
    output_dir = "demo_assets"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "pre_recorded_sim.mp4")
    
    imageio.mimsave(output_path, frames, fps=30, codec="libx264")
    print(f"✅ Video saved to {output_path}")
    
except Exception as e:
    print(f"⚠️ Could not generate video automatically: {e}")
    os.makedirs("demo_assets", exist_ok=True)
    with open("demo_assets/pre_recorded_sim.mp4", "w") as f:
        f.write("fallback_placeholder")
    print("Just use the live simulation window for testing!")
