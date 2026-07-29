import os
import json
import traceback
import time
from typing import List, Dict, Any
from app.utils.logger import get_logger

logger = get_logger("ErrorLogger")

LOG_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../logs/error_stream.json"))

class ErrorLogger:
    def __init__(self):
        os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)
        if not os.path.exists(LOG_FILE_PATH):
            with open(LOG_FILE_PATH, "w") as f:
                json.dump([], f)

    def log_exception(self, exc: Exception, context: str = "General") -> Dict[str, Any]:
        """Formats and stores an exception with its stack trace."""
        tb_str = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        
        error_entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "time_epoch": time.time(),
            "context": context,
            "error_type": type(exc).__name__,
            "message": str(exc),
            "traceback": tb_str
        }
        
        logger.error(f"[{context}] {type(exc).__name__}: {exc}")
        
        # Append to json log file (keep last 50 entries)
        try:
            entries = self.get_errors()
            entries.insert(0, error_entry)
            entries = entries[:50]
            with open(LOG_FILE_PATH, "w") as f:
                json.dump(entries, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write error to log file: {e}")
            
        return error_entry

    def get_errors(self) -> List[Dict[str, Any]]:
        """Reads recent error entries from the log file."""
        if not os.path.exists(LOG_FILE_PATH):
            return []
        try:
            with open(LOG_FILE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return []

error_logger = ErrorLogger()
