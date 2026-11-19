import httpx
import json
import sqlite3
import os
from app.state import OrionState
from app.config import GROK_API_KEY, GROK_MODEL, OLLAMA_HOST
from app.utils.logger import get_logger

logger = get_logger("DashboardAgent")

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "metrics.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY, cost_averted INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS incident_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    fault_reason TEXT,
                    duration INTEGER,
                    cost_averted INTEGER
                 )''')
    c.execute('SELECT cost_averted FROM metrics WHERE id=1')
    if not c.fetchone():
        c.execute('INSERT INTO metrics (id, cost_averted) VALUES (1, 0)')
    else:
        # User requested reset to wipe the massive $4M loop artifact
        c.execute('UPDATE metrics SET cost_averted = 0 WHERE id=1')
    conn.commit()
    conn.close()

def get_total_cost():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT cost_averted FROM metrics WHERE id=1')
        row = c.fetchone()
        conn.close()
        return row[0] if row else 0
    except Exception:
        return 0

def add_cost(amount):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE metrics SET cost_averted = cost_averted + ? WHERE id=1', (int(amount),))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"DB Error: {e}")

def log_incident(fault_reason, duration, cost_averted):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('INSERT INTO incident_history (fault_reason, duration, cost_averted) VALUES (?, ?, ?)',
                  (fault_reason, int(duration), int(cost_averted)))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"DB Incident Log Error: {e}")

init_db()

LAST_FINANCIAL_REPORT = {
    "cost_averted": get_total_cost(),
    "mttr_reduced": 0,
    "maintenance_savings": 0,
    "summary": "Awaiting first system anomaly detection and repair cycle to calculate ROI."
}

FAULT_START_TIME = None

def generate_financial_report(fault_reason="Unknown fault", duration_seconds=0):
    """Hardcoded financial logic requested by user: $5 per second of downtime."""
    global LAST_FINANCIAL_REPORT
    
    cost_averted = duration_seconds * 5
    add_cost(cost_averted)
    log_incident(fault_reason, duration_seconds, cost_averted)
    
    LAST_FINANCIAL_REPORT = {
        "cost_averted": get_total_cost(),
        "mttr_reduced": duration_seconds,
        "maintenance_savings": 50,
        "summary": f"Direct savings calculated at $5/sec for {duration_seconds}s of downtime averted."
    }
    logger.info(f"Generated hardcoded financial metrics: {cost_averted}")

def dashboard_agent(state: OrionState) -> OrionState:
    """Agent 6: Data Aggregation for Frontend Dashboard"""
    global FAULT_START_TIME
    
    health = state.get("health_score", 100)
    repair_status = state.get("repair_status", "IDLE")
    sensor_data = state.get("sensor_data", {})
    hardware_fault_active = state.get("hardware_fault_active", False)
    
    # Hardware faults: Do NOT generate financial reports or mark as SUCCESS
    if hardware_fault_active:
        graph_status = "HARDWARE_FAILURE"  # Special status for unsolvable faults
        logger.error("🚨 Hardware fault active - system in permanent failure state")
    else:
        # Track the duration of the fault
        if repair_status in ["RUNNING", "IN_PROGRESS"] and FAULT_START_TIME is None:
            import time
            FAULT_START_TIME = time.time()
        
        # Trigger report generation only exactly when repair succeeds
        if repair_status == "SUCCESS":
            duration = 0
            if FAULT_START_TIME is not None:
                import time
                duration = int(time.time() - FAULT_START_TIME)
                FAULT_START_TIME = None
                
            fault_reason = state.get("root_causes", ["Unknown fault"])[0] if state.get("root_causes") else "Unknown fault"
            generate_financial_report(fault_reason, duration)
            # Reset to IDLE so we only generate the report once per fix!
            state["repair_status"] = "IDLE"
        
        # Define active graph state for visual highlight in frontend
        if health < 70:
            if repair_status == "RUNNING" or repair_status == "IN_PROGRESS":
                graph_status = "HEALING"
            else:
                graph_status = "DIAGNOSING"
        else:
            graph_status = "HEALTHY"
    
    # Hardware fault detection
    hardware_fault_detected = False
    hardware_fault_details = {}
    
    rpm = sensor_data.get("rpm", 1500)
    vibration = sensor_data.get("vibration", 0.15)
    temp = sensor_data.get("temp", 65)
    
    # Check for hardware fault signatures (low RPM + elevated vibration/temp)
    if hardware_fault_active or (rpm < 800 and (vibration > 0.6 or temp > 80)):
        hardware_fault_detected = True
        hardware_fault_details = {
            "status": "CRITICAL - UNSOLVABLE",
            "type": "Hardware Encoder Failure",
            "rpm": rpm,
            "vibration": vibration,
            "temperature": temp,
            "description": "Physical hardware damage detected - Self-healing CANNOT resolve - Component replacement required",
            "repair_attempts": "CONTINUOUS FAILURE" if hardware_fault_active else "N/A"
        }
    
    state["dashboard_metrics"] = {
        "active_tokens": 420,  # mock usage tracker for LLM evaluation
        "sensor_health_index": health,
        "financial_report": LAST_FINANCIAL_REPORT,
        "hardware_fault": hardware_fault_details if hardware_fault_detected else None
    }
    state["graph_status"] = graph_status
    logger.info(f"Dashboard metrics prepared. Status: {graph_status}, Hardware Fault: {hardware_fault_detected}")
    return state
