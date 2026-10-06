"""
72-Hour Offline SQLite Ring Buffer
From WattWise Production Guide (Sprint 4, Page 15-16)
Stores 72 hours of telemetry locally on WattBrain with FIFO eviction.
Guarantees uninterrupted edge automation during cloud or fiber cuts.
"""

import sqlite3
import time
from typing import List, Dict, Any

class RingBuffer:
    def __init__(self, db_path: str = ":memory:", max_hours: int = 72):
        self.conn = sqlite3.connect(db_path)
        self.max_hours = max_hours
        self._init_schema()

    def _init_schema(self):
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS ring_telemetry (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    power_kw REAL,
                    voltage_v REAL,
                    freq_hz REAL,
                    pf REAL,
                    ts INTEGER
                )
            """)
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_ts ON ring_telemetry(ts)")

    def append(self, readings: List[Dict[str, Any]]):
        now_ms = int(time.time() * 1000)
        with self.conn:
            for r in readings:
                self.conn.execute(
                    "INSERT INTO ring_telemetry (node_id, power_kw, voltage_v, freq_hz, pf, ts) VALUES (?, ?, ?, ?, ?, ?)",
                    (r["node_id"], r["power_kw"], r["v_rms"], 50.0, r["pf"], now_ms)
                )
            # Evict records older than 72 hours (FIFO ring buffer)
            cutoff_ms = now_ms - (self.max_hours * 3600 * 1000)
            self.conn.execute("DELETE FROM ring_telemetry WHERE ts < ?", (cutoff_ms,))

    def get_last_window(self, seconds: int = 900) -> List[Dict[str, Any]]:
        """Returns the rolling 15-minute inference window for ONNX predictor."""
        cutoff_ms = int((time.time() - seconds) * 1000)
        cursor = self.conn.cursor()
        cursor.execute("SELECT node_id, power_kw, voltage_v, freq_hz, pf, ts FROM ring_telemetry WHERE ts >= ? ORDER BY ts ASC", (cutoff_ms,))
        rows = cursor.fetchall()
        return [{"node_id": r[0], "power_kw": r[1], "voltage_v": r[2], "freq_hz": r[3], "pf": r[4], "ts": r[5]} for r in rows]

if __name__ == "__main__":
    buf = RingBuffer(":memory:", max_hours=72)
    buf.append([{"node_id": "node_01", "power_kw": 288.4, "v_rms": 405.0, "pf": 0.92}])
    window = buf.get_last_window(900)
    print(f"[LOCAL STORE] Retrieved {len(window)} records from 72h SQLite ring buffer: {window}")
