# ORION-FACTORY Multi-Agent Ecosystem

The system consists of 6 specialized agents, all sharing a single StateGraph.

## 1. Digital Twin Agent (Perception)
- **Role**: Simulates machine physics in real-time.
- **Tech**: `mujoco` (Google DeepMind physics engine) using the standard `Ant-v4` model from Gymnasium.
- **Outputs**: Joint angles, velocities, torques, and simulated sensor readings (temperature, vibration).

## 2. Predictive Health Agent (Prediction)
- **Role**: Zero-shot forecasting of remaining useful life (RUL) and health score.
- **Tech**: Nixtla TimeGPT API with a fallback to a statistical 3-sigma rule.
- **Outputs**: Health Score (0-100) and Failure Probability.

## 3. Root Cause Diagnosis Agent (Diagnosis)
- **Role**: Causal inference and logical deduction of physical faults.
- **Tech**: Local Ollama running `llama3.2` model.
- **Outputs**: Top 3 potential root causes (e.g., "High motor temperature due to coolant failure").

## 4. Self-Healing Scheduler Agent (Execution)
- **Role**: Executes parallel repair tasks.
- **Tech**: LangGraph `Send` API to spawn concurrent mitigation runs.
- **Outputs**: 3 simultaneous fixes (e.g., Reduce RPM, Activate Coolant, Adjust Joint Tension).

## 5. Quality Assurance Agent (Validation)
- **Role**: Statistical validation of the success of the repair actions.
- **Tech**: `scipy.stats` performing T-tests comparing post-repair metrics to a healthy baseline.
- **Outputs**: Pass/Fail status (`validation_result`).

## 6. Dashboard & Reporting Agent (Visualization)
- **Role**: Visualizes the factory twin's health and graph flow in real time.
- **Tech**: FastAPI backend, React + Plotly frontend with WebSockets.
- **Outputs**: Interactive web interface.
