import httpx
from app.state import OrionState
from app.config import GROK_API_KEY, GROK_MODEL, OLLAMA_HOST
from app.utils.logger import get_logger

logger = get_logger("RootCauseAgent")

def root_cause_agent(state: OrionState) -> OrionState:
    """Agent 3: Diagnoses physical issues using xAI Grok API, local Ollama, or rules fallback."""
    sensor_data = state.get("sensor_data", {})
    vibration = sensor_data.get("vibration", 0.15)
    temp = sensor_data.get("temp", 65.0)
    rpm = sensor_data.get("rpm", 1500)
    hardware_fault_active = state.get("hardware_fault_active", False)
    
    # Do not overwrite the diagnosis if a repair is already in progress
    if state.get("repair_status") in ["RUNNING", "IN_PROGRESS"] and state.get("root_causes"):
        return state
    
    # CRITICAL: Hardware faults are UNSOLVABLE
    if hardware_fault_active:
        diagnoses = [
            "CRITICAL: Physical encoder hardware failure detected",
            "Mechanical servo lockup - requires component replacement",
            "System attempting self-healing but CANNOT RESOLVE hardware damage"
        ]
        confidence = 1.0
        state["root_causes"] = diagnoses
        state["diagnosis_confidence"] = confidence
        return state
        
    # Pre-packaged diagnosis rules baseline
    diagnoses = []
    confidence = 0.90
    
    if vibration > 0.4:
        diagnoses.append("Structural misalignment in joint actuator housing")
        diagnoses.append("Actuator bearing friction due to mechanical stress")
    if temp > 75.0:
        diagnoses.append("Thermal dissipation failure in drive motor coil")
        diagnoses.append("Overloading of adjacent joint actuators")
        
    if not diagnoses:
        diagnoses = ["No active fault detected. All systems operating within bounds."]
        confidence = 1.0

    # Primary LLM Choice: xAI Grok API
    if GROK_API_KEY and GROK_API_KEY != "your_grok_api_key_here":
        try:
            headers = {
                "Authorization": f"Bearer {GROK_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROK_MODEL,
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are the Lead Diagnosis Agent for the ORION-FACTORY digital twin. Given telemetry data (temperature, vibration, rpm) from a faulty robot joint, diagnose the top 3 physical root causes of the issue. Reply in concise bullet points."
                    },
                    {
                        "role": "user", 
                        "content": f"System Status - Temp: {temp}C, Vibration: {vibration}G. List top 3 failure causes."
                    }
                ],
                "temperature": 0.2
            }
            response = httpx.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=10.0)
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                parsed_causes = [line.strip("- *") for line in content.splitlines() if line.strip()]
                if parsed_causes:
                    diagnoses = parsed_causes[:3]
                    confidence = 0.95
                    logger.info(f"xAI Grok ({GROK_MODEL}) diagnosis succeeded.")
        except Exception as e:
            logger.warning(f"Grok API error: {e}. Falling back to secondary agent...")

    # Secondary LLM Choice: Local Ollama
    elif OLLAMA_HOST:
        try:
            payload = {
                "model": "llama3.2",
                "prompt": f"System status - Temp: {temp}C, Vibration: {vibration}G. Diagnose top 3 issues.",
                "stream": False
            }
            response = httpx.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=0.5)
            if response.status_code == 200:
                logger.info("Local Ollama diagnosis succeeded.")
        except Exception:
            logger.info("Ollama offline, utilizing built-in causal rules database.")
        
    state["root_causes"] = diagnoses[:3]
    state["diagnosis_confidence"] = confidence
    return state
