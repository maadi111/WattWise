"""
ML Model Backtesting & SLA Validation Suite
Method 1: Out-of-Time Feeder Telemetry Evaluation (FESCO A-11 Feeder Dataset)

Validates:
1. Grid Outage Predictor (GOP) actual model predictions on out-of-time test split
2. IPMVP Option C Counterfactual Baseline regression estimation on factory profile
"""

import os
import sys
import csv
import math
import random

# Ensure apps/ml is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.gop.train import GOPModel
from models.baseline.estimator import (
    estimate_counterfactual_kwh,
    lock_monthly_baseline,
    compute_prophet_baseline,
    InsufficientHistoryError
)

def load_fesco_telemetry_series():
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

def test_gop_on_fesco_2025_data():
    """
    Backtests GOP model on out-of-time split (last 25% of chronological records).
    Validates model against actual feeder ground-truth trip records.
    """
    data = load_fesco_telemetry_series()
    assert len(data) >= 100, f"Telemetry dataset has {len(data)} rows; expected >= 100"

    # Time-based split: train on first 75%, evaluate strictly on out-of-time remaining 25%
    split_idx = int(len(data) * 0.75)
    train_set = data[:split_idx]
    test_set = data[split_idx:]

    model = GOPModel()
    model_path = os.path.join(os.path.dirname(__file__), "..", "models", "gop", "gop_model.json")
    if os.path.exists(model_path):
        model.load(model_path)
    else:
        model.fit(train_set)

    eval_result = model.evaluate(test_set)
    tp = eval_result["tp"]
    fp = eval_result["fp"]
    fn = eval_result["fn"]
    tn = eval_result["tn"]
    precision = eval_result["precision"]
    recall = eval_result["recall"]
    false_alarm = eval_result["false_alarm_rate"]

    print(f"\n[GOP BACKTEST] Chronological Out-of-Time Test Window: {len(test_set)} hours")
    print(f"[GOP BACKTEST] Confusion Matrix: TP={tp}, FP={fp}, FN={fn}, TN={tn}")
    print(f"[GOP BACKTEST] Precision: {precision:.3f}")
    print(f"[GOP BACKTEST] Recall:    {recall:.3f}")
    print(f"[GOP BACKTEST] False Alarms: {false_alarm:.3f}")

    # Out-of-time evaluation gates on real industrial grid distribution
    assert recall >= 0.50, f"Recall {recall:.3f} below 50% minimum early trip detection threshold"
    assert false_alarm <= 0.25, f"False alarm rate {false_alarm:.3f} exceeds 25% maximum limit"
    assert (tp + tn) > (fp + fn), "Model accuracy must be strictly superior to random baseline"

def test_baseline_is_realistic():
    """
    Tests IPMVP Option C regression baseline estimator against hourly synthetic profile.
    Verifies that projected monthly consumption remains within ±5% of actual mean load.
    """
    random.seed(101)
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

def test_prophet_baseline_on_factory_history():
    """
    Tests Prophet counterfactual baseline computation on factory's own historical meter series.
    """
    history = [
        {"timestamp": f"2025-01-01T{h%24:02d}:00:00", "kwh": 760.0 + 30.0 * (1 if 8 <= h%24 <= 18 else 0)}
        for h in range(168)
    ]
    baseline = compute_prophet_baseline("fsd_crescent_mill_001", history, forecast_hours=720)
    print(f"\n[PROPHET BASELINE] Factory: {baseline['factory_id']}")
    print(f"[PROPHET BASELINE] Methodology: {baseline['methodology']}")
    print(f"[PROPHET BASELINE] Projected Monthly Consumption: {baseline['total_projected_kwh']:,.1f} kWh")
    print(f"[PROPHET BASELINE] Mean Draw: {baseline['mean_hourly_kw']:.1f} kW")

    assert baseline["total_projected_kwh"] > 400000.0, "Monthly baseline too low for industrial textile facility"
    assert baseline["samples_trained"] == 168, "All 168 historical hours should be ingested"

def test_insufficient_history_refusal():
    """
    Verifies that IPMVP Option C estimator fails closed and refuses to lock
    a counterfactual baseline when historical data is missing or < 168 hours.
    """

    # 1. None / missing history
    try:
        estimate_counterfactual_kwh(None)
        assert False, "Should have raised InsufficientHistoryError on None history"
    except InsufficientHistoryError as e:
        print(f"\n[BASELINE REFUSAL] Correctly caught missing history: {e}")

    # 2. Insufficient hourly readings (< 168 hours)
    try:
        estimate_counterfactual_kwh([750.0] * 72)
        assert False, "Should have raised InsufficientHistoryError on 72 hours"
    except InsufficientHistoryError as e:
        print(f"[BASELINE REFUSAL] Correctly caught short history: {e}")

    # 3. Refusal to lock baseline
    try:
        lock_monthly_baseline("fsd_mill_001", "2026-10", 32.50, [750.0] * 100)
        assert False, "Should have refused to lock baseline on 100 hours"
    except InsufficientHistoryError as e:
        print(f"[BASELINE REFUSAL] Correctly refused baseline lock: {e}")

    # 4. Prophet baseline refusal on empty or short history
    try:
        compute_prophet_baseline("fsd_mill_001", [{"timestamp": "2025-01-01T00:00:00", "kwh": 500.0}] * 24)
        assert False, "Should have refused Prophet baseline on 24 hours"
    except InsufficientHistoryError as e:
        print(f"[BASELINE REFUSAL] Correctly refused Prophet baseline on 24h: {e}")

if __name__ == "__main__":
    test_gop_on_fesco_2025_data()
    test_baseline_is_realistic()
    test_prophet_baseline_on_factory_history()
    test_insufficient_history_refusal()
    print("\nALL ML BACKTESTS PASSED SUCCESSFULLY!")

