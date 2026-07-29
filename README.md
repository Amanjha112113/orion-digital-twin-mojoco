# ORION-FACTORY 🏭🤖
> *"Where factories heal themselves before they break."*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://reactjs.org)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-purple)](https://langchain.com)
[![MuJoCo](https://img.shields.io/badge/Physics-MuJoCo-red)](https://mujoco.org)

**ORION-FACTORY** is a state-of-the-art **Autonomous Self-Healing Digital Twin**. It simulates a robotic manufacturing environment in 3D physics (MuJoCo) and uses a swarm of 6 specialized AI agents (powered by LangGraph and Grok/Llama 3.2) to instantly detect, diagnose, and repair hardware failures in real-time—completely eliminating human-in-the-loop downtime.

---

## ✨ Key Features
- **🧠 Zero-Shot Causal Diagnosis:** Uses large language models (Grok / Llama 3.2) to translate raw sensor anomalies into human-readable mechanical root causes.
- **⚡ Millisecond Self-Healing:** Instantly dispatches parallel software countermeasures (like reducing RPM or boosting coolant) the moment an anomaly is detected.
- **🛡️ 3-Sigma Mathematical Safety:** Prevents false positives using strict Gaussian anomaly detection and Welch's t-test validation loops.
- **💰 Real-Time ROI Tracking:** Hardcoded financial models dynamically calculate and persist the exact dollar amount of factory downtime averted (tracked in SQLite).
- **🔒 Privacy-First / Air-Gapped:** Architecture supports dropping in local, on-premise models like Ollama for strict industrial data security.

---

## 🏗️ Architecture & The 6 Agents

Our orchestrator mimics a real human engineering team through a strict Separation of Concerns:

1. **`Agent A1` (Digital Twin):** Bridges the physical-to-digital gap. Streams high-frequency IoT data (Vibration, Temp, RPM) from the physics engine to the orchestrator via WebSockets.
2. **`Agent A2` (Predictive Health):** The Mathematician. Uses 3-Sigma algorithms to instantly flag anomalies and trigger Emergency Stops (E-Stop).
3. **`Agent A3` (Root Cause LLM):** The Brain. Asynchronously diagnoses the complex *why* behind the failure without blocking safety loops.
4. **`Agent A4` (Self-Healing Scheduler):** The Manager. Dispatches real-time commands to the machine's PLC/Simulator to mitigate the fault.
5. **`Agent A5` (Quality Assurance):** The Inspector. Monitors post-repair telemetry. It mathematically validates if the repair succeeded before returning the factory to green status.
6. **`Agent A6` (Dashboard):** The Reporter. Pipes data to a React UI and tracks cumulative financial savings in a local database.

---

## 🛠️ Technology Stack

- **AI & Orchestration:** Python, LangGraph, Grok API, Ollama (Llama 3.2)
- **Physics Simulation:** MuJoCo (C++ Physics Engine), Gymnasium
- **Backend & APIs:** FastAPI, WebSockets, Uvicorn, SQLite
- **Frontend Dashboard:** React, Tailwind CSS, Vite, Lucide Icons

---

## 🚀 Quick Start Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Installation
Install all backend and frontend dependencies:
```bash
bash scripts/setup.sh
```

### 2. Configure Environment
Set up your API keys (like Grok) inside the `.env` file (the system will safely fall back to local/hardcoded logic if keys are omitted).

### 3. Launch Services
We provide a single unified script that launches the FastAPI backend, the MuJoCo simulation, and the Vite frontend simultaneously:
```bash
bash start_services.sh
```
*Alternatively, you can run `bash scripts/run_backend.sh` and `bash scripts/run_frontend.sh` in separate terminal tabs.*

### 4. View Dashboard
Navigate to **`http://localhost:5173`** in your browser to view the live Digital Twin and Agent Terminal.

---

## 🎯 How to Use the Demo
1. **Watch the Baseline:** Observe the robotic arm picking and placing objects smoothly in a healthy state.
2. **Inject a Fault:** Click **"Trigger Vibration Spike"** or **"Trigger Thermal Overheat"** on the dashboard.
3. **Watch the Agents Work:** In the terminal panel, watch Agent A2 flag the anomaly, Agent A3 diagnose it, and the robot enter an Emergency Stop.
4. **Validation:** Once the physics engine cools down, Agent A5 will validate the fix, the robot will resume work, and the financial ROI will instantly jump on the dashboard!

---

*Built with ❤️ for the future of Industrial AI.*
