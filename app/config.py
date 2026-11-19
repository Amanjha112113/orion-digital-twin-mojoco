import os
from dotenv import load_dotenv

# Load env variables from root .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

GROK_API_KEY = os.getenv("GROK_API_KEY", os.getenv("XAI_API_KEY", ""))
GROK_MODEL = os.getenv("GROK_MODEL", "grok-2-latest")

TIMEGPT_API_KEY = os.getenv("TIMEGPT_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
LANGGRAPH_DEV_PORT = int(os.getenv("LANGGRAPH_DEV_PORT", "8000"))
MUJOCO_MODEL = os.getenv("MUJOCO_MODEL", "FetchPickAndPlace-v4")
