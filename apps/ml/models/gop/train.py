"""
Grid Outage Predictor (GOP) Model Training & Time-Based Backtest
Trained on FESCO Feeder A-11 continuous shadow monitoring telemetry (720 hourly records).
Implements out-of-time evaluation (first 75% train, last 25% test) to prevent data leakage.
"""

import os
import sys
import csv
import json
import math
from datetime import datetime

class GOPModel:
    """
    Calibrated Logistic Classifier for 415V 3-Phase Industrial Feeder Outage Prediction.
    Trained with SGD / Cross-Entropy loss on temporal feeder sags.
    """
    def __init__(self):
        # Weights for [bias, normalized_v, normalized_f, normalized_dv, peak_hour_indicator]
        self.weights = [0.0, 0.0, 0.0, 0.0, 0.0]
        self.threshold = 0.50
        self.v_mean = 405.0
        self.v_std = 12.0
        self.f_mean = 50.0
        self.f_std = 0.15
        self.dv_mean = -0.50
        self.dv_std = 1.0

    def extract_features(self, row):
        v_norm = (row["voltage_v"] - self.v_mean) / self.v_std
        f_norm = (row["freq_hz"] - self.f_mean) / self.f_std
        dv_norm = (row["dv_dt"] - self.dv_mean) / self.dv_std
        is_peak = 1.0 if (17 <= row["hour"] <= 22) else 0.0
        return [1.0, v_norm, f_norm, dv_norm, is_peak]

    def predict_proba(self, row):
        x = self.extract_features(row)
        z = sum(w * xi for w, xi in zip(self.weights, x))
        # Sigmoid
        z = max(-20.0, min(20.0, z))
        return 1.0 / (1.0 + math.exp(-z))

    def predict(self, row):
        return 1 if self.predict_proba(row) >= self.threshold else 0

    def fit(self, train_rows, epochs=150, lr=0.1, pos_weight=3.5):
        # Initialize weights with physical grid domain priors
        self.weights = [-2.0, -1.8, -2.2, -2.5, 0.8]
        self.threshold = 0.55
        
        for epoch in range(epochs):
            grad = [0.0] * len(self.weights)
            for row in train_rows:
                y = row["actual_outage_occurred"]
                p = self.predict_proba(row)
                x = self.extract_features(row)
                weight = pos_weight if y == 1 else 1.0
                err = (p - y) * weight
                for j in range(len(self.weights)):
                    grad[j] += err * x[j]

            n = len(train_rows)
            for j in range(len(self.weights)):
                # L2 regularization
                reg = 0.005 * self.weights[j] if j > 0 else 0.0
                self.weights[j] -= lr * (grad[j] / n + reg)

    def evaluate(self, test_rows):
        tp, fp, fn, tn = 0, 0, 0, 0
        for row in test_rows:
            y_true = row["actual_outage_occurred"]
            y_pred = self.predict(row)
            if y_true == 1 and y_pred == 1:
                tp += 1
            elif y_true == 0 and y_pred == 1:
                fp += 1
            elif y_true == 1 and y_pred == 0:
                fn += 1
            else:
                tn += 1

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        false_alarm = fp / (fp + tn) if (fp + tn) > 0 else 0.0

        return {
            "tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "false_alarm_rate": round(false_alarm, 4),
            "test_samples": len(test_rows)
        }

    def save(self, filepath):
        payload = {
            "model_type": "GOP_XGBOOST_LOGISTIC",
            "version": "v2.2.0-shadow-pilot",
            "trained_at": datetime.now().isoformat(),
            "weights": self.weights,
            "threshold": self.threshold,
            "scaling": {
                "v_mean": self.v_mean, "v_std": self.v_std,
                "f_mean": self.f_mean, "f_std": self.f_std,
                "dv_mean": self.dv_mean, "dv_std": self.dv_std
            }
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    def load(self, filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            payload = json.load(f)
            self.weights = payload["weights"]
            self.threshold = payload.get("threshold", 0.50)
            sc = payload["scaling"]
            self.v_mean = sc["v_mean"]
            self.v_std = sc["v_std"]
            self.f_mean = sc["f_mean"]
            self.f_std = sc["f_std"]
            self.dv_mean = sc["dv_mean"]
            self.dv_std = sc["dv_std"]

def train_and_backtest():
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "tests", "data", "fesco_feeder_A11_2025_actual.csv")
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

    total = len(records)
    split_idx = int(total * 0.75) # Time-based split: 75% train, 25% out-of-time test
    train_set = records[:split_idx]
    test_set = records[split_idx:]

    print(f"[GOP TRAINING] Loaded {total} shadow pilot records.")
    print(f"[GOP TRAINING] Train window (chronological): {len(train_set)} records ({train_set[0]['timestamp']} to {train_set[-1]['timestamp']})")
    print(f"[GOP TRAINING] Test window (out-of-time):     {len(test_set)} records ({test_set[0]['timestamp']} to {test_set[-1]['timestamp']})")

    model = GOPModel()
    model.fit(train_set, epochs=150, lr=0.1)

    eval_res = model.evaluate(test_set)
    print("\n" + "=" * 50)
    print("OUT-OF-TIME TEMPORAL BACKTEST RESULTS:")
    print(f"  Test Samples:      {eval_res['test_samples']}")
    print(f"  Confusion Matrix:  TP={eval_res['tp']}, FP={eval_res['fp']}, FN={eval_res['fn']}, TN={eval_res['tn']}")
    print(f"  Precision:         {eval_res['precision']:.2%}")
    print(f"  Recall:            {eval_res['recall']:.2%}")
    print(f"  False Alarm Rate:  {eval_res['false_alarm_rate']:.2%}")
    print("=" * 50)

    model_path = os.path.join(os.path.dirname(__file__), "gop_model.json")
    model.save(model_path)
    print(f"[GOP ARTIFACT] Saved trained model to {model_path}")
    return model, eval_res

if __name__ == "__main__":
    train_and_backtest()
