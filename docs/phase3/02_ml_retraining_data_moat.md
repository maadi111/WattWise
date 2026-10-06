# WATTWISE™ PHASE 3 — ML RETRAINING & DATA MOAT STRATEGY
## Weeks 2–6: From Simulator to Factory-Trained Models (Section 02)

---

## 1. The Retraining Cycle

As soon as a factory enters the shadow pilot, synthetic data is progressively replaced with real-world sensor streams. The retraining cycle executes:
* **Nightly Automated Cadence:** Calibrates Model 1 (GOP) trip thresholds against daytime feeder shifts.
* **Monthly Cadence (Every 30 Days):** Full hyperparameter sweep on Model 3 (Prophet Baseline) and Model 4 (Isolation Forest).
* **Ad-Hoc Event Cadence:** Triggered immediately when NEPRA or FESCO announces seasonal tariff revisions or scheduled feeder maintenance rosters.

---

## 2. Feeder-Specific GOP Improvement

Generic AI models fail in Pakistan because every industrial feeder has a unique physical "personality" dictated by transmission line length, sub-station transformer age, and adjacent heavy industrial loads (e.g. arc furnaces causing harmonic noise).

WattWise builds a **hyper-localized feature set** for each feeder:
1. **Voltage-Sag Fingerprints:** Distinct precursor oscillations ($dV/dt$) that occur 5–15 seconds before a vacuum circuit breaker trips at the 132kV sub-station.
2. **Schedule Deviation Patterns:** Tracking the variance between FESCO's official load management schedule and actual physical feeder collapse times.
3. **Reactive Power Jitter:** Pre-collapse harmonic spikes ($THD_I > 8\%$) caused by regional grid frequency degradation below 49.80 Hz.
4. **Seasonal Weather Adjustments:** Summer midday air conditioning demand surges vs. winter peak heating shifts.

---

## 3. Continuous Training Pipeline & Quality Gates

Retrained models are **never automatically pushed to production switchgear without passing strict quality gates**.

```
[ Real Factory 10Hz Telemetry ] ──▶ [ PostgreSQL Ingest ]
                                            │
                                            ▼
                           [ Nightly Retraining Pod (Python 3.11) ]
                                            │
                                            ▼
                           [ Automated Model Quality Gate ]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
          [ Fails SLA Criteria ]                       [ Meets All 3 SLA Gates ]
          • Precision < 88%                            • Precision >= 88.0%
          • Recall < 80%                               • Recall >= 80.0%
          • False Alarm > 5%                           • False Alarm <= 5.0%
                     │                                             │
                     ▼                                             ▼
          [ Reject Candidate ]                         [ Promote to Production ]
          Keep existing edge model                      ├── Compile to ONNX
                                                        └── OTA Deploy via MQTT
```

### The 3 Non-Negotiable SLA Gates:
* **Gate 1: Precision $\ge 88.0\%$ (Target: $> 95\%$):** A false positive triggers unnecessary generator ignition, burning expensive diesel (Rs. 285/L) for no reason. False alarms destroy customer trust.
* **Gate 2: Recall $\ge 80.0\%$ (Target: $> 90\%$):** The model must catch genuine grid collapses in time for the 8-second pre-emptive sequence.
* **Gate 3: False Alarm Rate $\le 5.0\%$ ($FP / [FP + TN]$):** Unplanned generator starts must be near zero during stable grid conditions.

---

## 4. The Unassailable Industrial Data Moat

Why can't a software competitor replicate WattWise?
* **Proprietary High-Frequency Dataset:** Competitors only have access to hourly WAPDA billing data. WattWise captures 10Hz (100ms) continuous current, voltage, frequency, and harmonic waveforms from physical industrial busbars across Pakistan.
* **Network Effects:** As more mills join WattWise, cross-feeder correlations improve. When a sub-station trips in Khurrianwala, WattWise models instantly anticipate secondary cascade sags in Nishatabad and Sheikhupura.
* **Custom Machine Signatures:** Over 10,000 hours of electrical signatures for Tsudakoma looms, Thies vats, and Monforts stenters give WattWise unprecedented anomaly classification accuracy.
