import mujoco
import mujoco.viewer
import time

xml = """
<mujoco>
  <worldbody>
    <site name="target" pos="0 0 0" size="0.1" rgba="1 0 0 1"/>
  </worldbody>
</mujoco>
"""
model = mujoco.MjModel.from_xml_string(xml)
data = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    for i in range(50):
        model.site_pos[0][0] += 0.01
        mujoco.mj_step(model, data)
        viewer.sync()
        time.sleep(0.1)
