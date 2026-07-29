import httpx
from app.config import GROK_API_KEY
payload = {
    "model": "grok-2-latest",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Test"}
    ],
    "temperature": 0.1
}
headers = {"Authorization": f"Bearer {GROK_API_KEY}", "Content-Type": "application/json"}
resp = httpx.post("https://api.x.ai/v1/chat/completions", json=payload, headers=headers)
print(resp.status_code, resp.text)
