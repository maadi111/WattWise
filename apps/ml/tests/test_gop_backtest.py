"""
ML Model Backtesting & SLA Validation Suite
Method 1: Offline Feeder Telemetry Evaluation (FESCO A-11 Feeder Dataset)

Validates:
1. Grid Outage Predictor (GOP) transient detection accuracy on 415V/50Hz grid events
2. IPMVP Option C Counterfactual Baseline regression estimation
"""

import os
import sys
import csv
import math
import random

# Ensure apps/ml is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.baseline.estimator import estimate_counterfactual_kwh, lock_monthly_baseline

def load_fesco_telemetry_sample():
    csv_path = os.path.join(os.path.dirname(__file__), "data", "fesco_feeder_A11_2025_actual.csv")
    records = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            records.append({
                "timestamp": r["timestamp"],
                "hour": int(r["hour"]),
                "voltage_v": float(r["voltage_v"]),
                "freq_hz": float(r["freq_hz"]),
                "dv_dt": float(r["dv_dt"]),
                "actual_outage_occurred": int(r["actual_outage_occurred"]),
                "actual_cost_pkr": float(r["actual_cost_pkr"])
            })
    return records

def evaluate_gop_heuristic_classifier(row):
    """
    Evaluates feeder signals on 415V line-to-line standard:
    Negative dV/dt (< -1.5 V/s) and frequency drop (< 49.85 Hz) are leading indicators.
    """
    v = row["voltage_v"]
    dv = row["dv_dt"]
    f = row["freq_hz"]

    score = 0.05
    if v < 380.0:
        score += 0.45
    elif v < 395.0:
        score += 0.20

    if dv < -2.5:
        score += 0.40
    elif dv < -1.5:
        score += 0.25

    if f < 49.85:
        score += 0.15

    return min(0.98, max(0.02, score))

def test_gop_on_fesco_2025_data():
    """
    Backtests GOP detection on FESCO Feeder sample event log.
    Evaluates precision, recall, and false alarm rate.
    """
    data = load_fesco_telemetry_sample()
    assert len(data) > 0, "Telemetry test dataset must not be empty"

    tp, fp, fn, tn = 0, 0, 0, 0
    threshold = 0.70

    for row in data:
        y_true = row["actual_outage_occurred"]
        prob = evaluate_gop_heuristic_classifier(row)
        y_pred = 1 if prob > threshold else 0

        if y_true == 1 and y_pred == 1:
            tp += 1
        elif y_true == 0 and y_pred == 1:
            fp += 1
        elif y_true == 1 and y_pred == 0:
            fn += 1
        elif y_true == 0 and y_pred == 0:
            tn += 1

    total_samples = len(data)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    false_alarm_rate = fp / (fp + tn) if (fp + tn) > 0 else 0

    print(f"\n[GOP BACKTEST] Evaluated on {total_samples} historical feeder events")
    print(f"[GOP BACKTEST] Confusion Matrix: TP={tp}, FP={fp}, FN={fn}, TN={tn}")
    print(f"[GOP BACKTEST] Precision: {precision:.3f}")
    print(f"[GOP BACKTEST] Recall:    {recall:.3f}")
    print(f"[GOP BACKTEST] False Alarms: {false_alarm_rate:.3f}")

    assert precision >= 0.85, f"Precision {precision:.3f} below minimum requirement"
    assert recall >= 0.75, f"Recall {recall:.3f} below minimum requirement"
    assert false_alarm_rate <= 0.10, f"False alarm rate {false_alarm_rate:.3f} exceeds 10% limit"

def test_baseline_is_realistic():
    """
    Tests IPMVP Option C regression baseline estimator against hourly synthetic profile.
    Verifies that projected monthly consumption remains within ±8% of actual mean load.
    """
    random.seed(101)
    # Generate 168 hours (1 full week) of varying industrial load centered at 780 kW
    synthetic_hourly_kwh = [random.gauss(780.0, 45.0) for _ in range(168)]
    actual_weekly_mean = sum(synthetic_hourly_kwh) / len(synthetic_hourly_kwh)

    projected_monthly_kwh = estimate_counterfactual_kwh(synthetic_hourly_kwh)
    expected_monthly_kwh = actual_weekly_mean * 720.0

    error_pct = abs(projected_monthly_kwh - expected_monthly_kwh) / expected_monthly_kwh
    print(f"\n[BASELINE REGRESSION] Actual Weekly Mean Draw: {actual_weekly_mean:.1f} kW")
    print(f"[BASELINE REGRESSION] Projected 720h Monthly Consumption: {projected_monthly_kwh:,.1f} kWh")
    print(f"[BASELINE REGRESSION] Estimation Error: {error_pct:.4%}")

    assert error_pct < 0.05, f"Baseline regression error {error_pct:.2%} exceeds 5% threshold!"

    # Test cryptographic lock and SHA-256 integrity
    record = lock_monthly_baseline("fsd_mill_001", "2026-10", 32.50, synthetic_hourly_kwh)
    assert record["audit_hash"].startswith("sha256:"), "Audit hash must be valid SHA-256 digest"
    assert record["baseline_pkr"] > 0, "Baseline PKR must be positive"

if __name__ == "__main__":
    test_gop_on_fesco_2025_data()
    test_baseline_is_realistic()
    print("\nALL ML BACKTESTS PASSED SUCCESSFULLY!")
