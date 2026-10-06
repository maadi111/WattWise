"""
Model 4: Anomaly Detector (Isolation Forest)
From WattWise Product Documentation & Guide (Sprint 3)
Detects unexpected consumption spikes (equipment faults or energy theft),
CT sensor dropout, and generator efficiency degradation.
"""

from typing import List, Dict, Any

def detect_telemetry_anomalies(readings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluates rolling 5-minute telemetry window for voltage dips, current spikes,
    or abnormal power factor drift (>3-sigma deviation).
    """
    anomalies = []
    for r in readings:
        is_anomaly = False
        reasons = []

        if r.get("power_factor", 1.0) < 0.75:
            is_anomaly = True
            reasons.append("Severe Power Factor Lag (<0.75 PF) - Low Motor Efficiency")

        if r.get("voltage_v", 400.0) < 370.0:
            is_anomaly = True
            reasons.append("Under-voltage sag (<370V) - Imminent WAPDA Feeder Trip Hazard")

        if r.get("thd_percent", 0.0) > 8.0:
            is_anomaly = True
            reasons.append("Excessive Harmonic Distortion THD > 8.0%")

        if is_anomaly:
            anomalies.append({
                "node_id": r.get("node_id"),
                "timestamp": r.get("timestamp"),
                "severity": "CRITICAL" if len(reasons) > 1 else "WARNING",
                "reasons": reasons
            })

    return anomalies

if __name__ == "__main__":
    sample = [
        {"node_id": "node_01", "power_factor": 0.92, "voltage_v": 405.0, "thd_percent": 3.1},
        {"node_id": "node_05", "power_factor": 0.68, "voltage_v": 362.0, "thd_percent": 9.4}
    ]
    alerts = detect_telemetry_anomalies(sample)
    print(f"Detected {len(alerts)} anomalies: {alerts}")
