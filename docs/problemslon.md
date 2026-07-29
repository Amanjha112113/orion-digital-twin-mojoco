# CONTEXT: I am building a hackathon project called "ORION-FACTORY". 

# GOAL: 
Build a Self-Healing Manufacturing Digital Twin using 6 AI agents. I need you to act as my Senior AI Engineer. Generate the complete project code, architecture, and help me prepare the winning presentation.

# PROJECT NAME: ORION-FACTORY
**Tagline**: *"Where factories heal themselves before they break."*

## 1. THE PROBLEM (Why this matters)
- Unplanned downtime costs manufacturers over $50 Billion annually.
- Current systems only "alert" humans, wasting 30-40% of maintenance budgets.
- Existing digital twins are static and don't act autonomously.

## 2. THE SOLUTION (The 6 Agents)
We are building an autonomous multi-agent ecosystem using LangGraph. All 6 agents share a single StateGraph.

- **Agent 1: Digital Twin Agent** (Perception)
  - Uses `mujoco` (Google DeepMind) to simulate physics.
  - Outputs: Joint angles, velocity, torque.
- **Agent 2: Predictive Health Agent** (Prediction)
  - Uses `nixtla` (TimeGPT) or `sundial` for zero-shot forecasting.
  - Outputs: Health Score (0-100) and Remaining Useful Life (RUL).
- **Agent 3: Root Cause Diagnosis Agent** (Diagnosis)
  - Uses `ollama` (Llama 3.2 locally) + causal inference.
  - Outputs: Top 3 reasons for failure (e.g., "Bearing wear").
- **Agent 4: Self-Healing Scheduler Agent** (Execution)
  - Uses LangGraph's `Send` API for **parallel execution**.
  - Outputs: 3 simultaneous fixes (e.g., Reduce RPM, Activate Coolant).
- **Agent 5: Quality Assurance Agent** (Validation)
  - Uses `scipy.stats` to run T-tests comparing pre/post repair data.
  - Outputs: Pass/Fail status.
- **Agent 6: Dashboard & Reporting Agent** (Visualization)
  - Uses FastAPI + React + Plotly.
  - Outputs: Real-time LangGraph flow visualization.

## 3. THE TECHNOLOGY STACK (100% Free for MacBook Air)
- **Simulation**: `pip install mujoco` (NOT mujoco-py).
- **Orchestration**: `pip install langgraph langgraph-checkpoint-sqlite`.
- **Time Series**: `pip install nixtla` (Free API key) OR `pip install transformers` (for Sundial).
- **Local LLM**: Ollama + `llama3.2` (run via `ollama pull llama3.2`).
- **Backend**: FastAPI, Uvicorn.
- **Frontend**: React, Plotly.
- **Persistence**: SQLite (for stateful LangGraph checkpoints).

## 4. CRITICAL ARCHITECTURE FOR ANTIGRAVITY TO GENERATE
When you generate the Python code, ensure it follows this LangGraph State Schema:

```python
from typing import TypedDict, List

class OrionState(TypedDict):
    # Input Layer
    sensor_data: dict  # {"vibration": 0.5, "temp": 85}
    
    # Simulation Layer
    twin_state: dict   # MuJoCo position data
    
    # Prediction Layer
    health_score: int
    failure_prob: float
    
    # Diagnosis Layer
    root_causes: List[str]
    
    # Execution Layer
    repair_actions: List[dict]
    repair_status: str  # "PENDING", "RUNNING", "SUCCESS"
    
    # Validation Layer
    validation_result: bool
5. THE 3-MINUTE DEMO SCRIPT (For the Judges)
I will present this exactly as follows. Help me generate the assets for this:

Step 1: The "Before" State (30 sec)

Show MuJoCo simulation running smoothly.

LangGraph shows Agent 1 & 2 active, Health Score = 95.

Speech: "This is our digital twin. The system is stable."

Step 2: The Injection of Failure (60 sec) - THE WOW MOMENT

Trigger the anomaly in MuJoCo (vibration spikes).

Antigravity must show LangGraph Studio transitioning: Agents 3, 4, and 5 light up in parallel.

Agent 4 executes 3 parallel fixes.

Speech: "Watch as the Root Cause Agent diagnoses the issue, while the Scheduler executes repairs in parallel—without human intervention."

Step 3: The Heal (30 sec)

Show Health Score returning to 95.

LangGraph shows all nodes Green.

Speech: "Zero downtime. Healed in under 2 seconds. That is a $12,000 problem averted."

6. ANTIGRAVITY'S TASKS (What I need you to generate)
Based on the above, please generate the following files/folders in my workspace:

app/state.py: The LangGraph State definition.

app/agents/: Separate Python files for each of the 6 agents (with mujoco integration and ollama prompts).

app/graph.py: The main LangGraph builder with conditional edges (Router logic).

frontend/: A React dashboard that connects via WebSockets to display health scores and agent statuses.

demo/: A helper script to inject fake "failure" data into the simulation stream for the live demo.

7. FINAL INSTRUCTION FOR ANTIGRAVITY
Please ask me clarifying questions if any of the API integrations (like TimeGPT key or MuJoCo model selection) are unclear. Focus heavily on making the LangGraph visual transitions smooth for the demo, as the judges will be watching the graph move from Red to Green.

Let's start by generating the requirements.txt and the main orion_state.py file.

text

---

## 🚀 How to Use This in Antigravity

1. **Paste the entire block above** into Antigravity's main prompt window.
2. **Wait for Antigravity to generate** the folder structure and code. 
3. **Antigravity will ask clarifying questions** (e.g., "Which MuJoCo model do you want?"). Answer:
   - *"Use the standard Ant-v4 model from Gymnasium for the simulation."*
   - *"Use the free Nixtla TimeGPT API for predictions, but include a fallback to statistical rules (3-sigma) if the API fails."*
4. **After the code is built**, ask Antigravity: *"Now generate a beautiful HTML Dashboard that matches the Demo Script."*

## 🎤 The Exact Words to Say to the Judge (During Live Demo)
Once Antigravity builds the UI, follow this cheat sheet while pointing at your screen:

| Time | Your Action | Your Speech |
| :--- | :--- | :--- |
| **0:00** | Point at smooth simulation. | *"This is ORION-FACTORY. A self-healing factory powered by DeepMind's MuJoCo and LangGraph multi-agents."* |
| **0:30** | Click "Simulate Fault". | *"Suddenly, vibration spikes. Health drops to 42%. Traditional systems would shut down now."* |
| **1:00** | Point at LangGraph branching. | *"But watch the graph. The Diagnosis Agent routes the issue, and the Scheduler executes 3 parallel fixes—all autonomously."* |
| **1:45** | Point at Health returning to 95. | *"The machine healed itself. Zero downtime. Cost averted: Over $12,000."* |
| **2:00** | Look at the judges directly. | *"We didn't just build an alarm—we built a factory that takes action. This is the future of Industry 4.0."* |

---

## 🏆 Why This Works in Antigravity
- **Context Window Optimization**: The prompt is structured with clear headings (`#`, `##`), bullet points, and a specific "To-Do" list for the AI. 
- **Standard Libraries**: You explicitly told it to use `nixtla`, `mujoco`, and `ollama`—all of which Antigravity can install natively.
- **Presentation Integration**: By asking Antigravity to *also* generate the demo assets, the AI ensures your code aligns perfectly with your speech.

**Ready!** Copy the prompt, paste it into Antigravity, and let the AI do the heavy lifting while you practice the demo script. You are going to dominate this hackathon! 🚀
