"""
Grid Outage Predictor (GOP) Model Training & Calibration
From WattWise Production Guide (Sprint 3)
Predicts Pakistani 11kV/415V 3-phase industrial feeder trip within a 10-15 minute horizon.
"""

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
import xgboost as xgb

FEATURES = [
    'hour_of_day',
    'day_of_week',
    'is_ramadan',
    'is_holiday',
    'feeder_outage_scheduled', # from WAPDA schedule scraper
    'voltage_v_lag5m',          # 415V industrial line-to-line voltage 5 min ago
    'freq_hz_lag1m',            # grid frequency 1 min ago
    'voltage_rate_of_change',   # dV/dt — key early warning of trip (V/s)
    'national_deficit_mw',      # from NEPRA daily deficit reports
    'minutes_since_last_outage' # clustering pattern
]

def generate_synthetic_feeder_history(n_samples=5000):
    """
    Generates calibrated Pakistani 3-phase industrial feeder telemetry
    centered around 415V (line-to-line) and 50.0 Hz nominal frequency.
    """
    np.random.seed(42)
    hour = np.random.randint(0, 24, n_samples)
    day = np.random.randint(0, 7, n_samples)
    ramadan = np.random.choice([0, 1], n_samples, p=[0.9, 0.1])
    holiday = np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
    sched = np.random.choice([0, 1], n_samples, p=[0.8, 0.2])

    # 415V nominal 3-phase industrial supply (varies between 380V - 425V in Pakistan)
    v_lag = np.random.normal(405.0, 12.0, n_samples)
    f_lag = np.random.normal(50.0, 0.18, n_samples)
    dv_dt = np.random.normal(-0.05, 0.6, n_samples)
    deficit = np.random.uniform(2000, 6500, n_samples)
    mins_since = np.random.exponential(180, n_samples)

    # Ground truth: trip occurs when frequency drops below 49.3 Hz, dV/dt sags sharply, or scheduled
    p_trip = 0.05 + 0.5 * sched + 0.3 * (f_lag < 49.3) + 0.3 * (dv_dt < -1.5) + 0.2 * (deficit > 5000) + 0.2 * (v_lag < 380.0)
    p_trip = np.clip(p_trip, 0.01, 0.99)
    y = np.random.binomial(1, p_trip)

    df = pd.DataFrame({
        'hour_of_day': hour,
        'day_of_week': day,
        'is_ramadan': ramadan,
        'is_holiday': holiday,
        'feeder_outage_scheduled': sched,
        'voltage_v_lag5m': v_lag,
        'freq_hz_lag1m': f_lag,
        'voltage_rate_of_change': dv_dt,
        'national_deficit_mw': deficit,
        'minutes_since_last_outage': mins_since,
        'outage_in_15min': y
    })
    return df

def train_gop_model():
    print("[GOP] Generating calibrated 415V industrial training telemetry...")
    df = generate_synthetic_feeder_history(10000)
    X = df[FEATURES]
    y = df['outage_in_15min']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"[GOP] Training XGBoost classifier on {len(X_train)} samples...")
    base_model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        scale_pos_weight=6,
        eval_metric='aucpr',
        random_state=42
    )

    calibrated = CalibratedClassifierCV(base_model, cv=3, method='isotonic')
    calibrated.fit(X_train, y_train)

    score = calibrated.score(X_test, y_test)
    print(f"[GOP] Calibrated Model Accuracy: {score * 100:.2f}%")
    return calibrated

if __name__ == "__main__":
    train_gop_model()
