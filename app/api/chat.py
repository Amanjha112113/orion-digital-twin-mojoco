import httpx
import sqlite3
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import GROK_API_KEY, GROK_MODEL
from app.agents.dashboard import DB_PATH
from app.utils.logger import get_logger

logger = get_logger("Chatbot")
router = APIRouter()

class ChatRequest(BaseModel):
    message: str

def get_history_context():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM incident_history ORDER BY id DESC LIMIT 50')
        rows = c.fetchall()
        conn.close()
        
        if not rows:
            return "No incidents have occurred yet."
            
        history_str = "Recent Factory Incidents:\n"
        for r in rows:
            history_str += f"- [{r['timestamp']}] Fault: {r['fault_reason']} | Duration: {r['duration']}s | Cost Saved: ${r['cost_averted']}\n"
        return history_str
    except Exception as e:
        logger.error(f"Error fetching DB history for chat context: {e}")
        return "Failed to load history."

@router.post("/chat")
async def chat_with_history(req: ChatRequest):
    if not GROK_API_KEY or GROK_API_KEY == "your_grok_api_key_here":
        # Fallback if no key
        return {"response": "I am the ORION-FACTORY AI Assistant. I can see the history, but I need a valid Grok API Key to answer complex questions!"}
        
    history_context = get_history_context()
    
    system_prompt = f"""
You are the ORION-FACTORY AI Assistant, an expert industrial engineer.
You are monitoring a robotic manufacturing pipeline powered by a LangGraph AI agent orchestration system and a MuJoCo digital twin.

Here is the recent history of physical anomalies that the agents have detected and self-healed:
(Note: The timestamps below are in UTC. The user is in IST (UTC+5:30), so their local time is 5.5 hours ahead of these records. Convert when answering.)
{history_context}

Answer the user's questions about the factory, the history data, or the project architecture. Be concise, professional, and helpful. Do not output markdown, just plain text.
"""

    try:
        headers = {"Authorization": f"Bearer {GROK_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": GROK_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            "temperature": 0.3
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=5.0)
            
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"].strip()
            return {"response": content}
        else:
            return {"response": f"Failed to communicate with AI (Status {resp.status_code})"}
            
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {"response": "An error occurred while contacting the AI."}

@router.get("/history")
def get_incident_history():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM incident_history ORDER BY id DESC LIMIT 50')
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return {"history": rows}
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return {"history": []}
