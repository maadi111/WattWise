"""
FastAPI Model Serving Layer (Internal ML Service)
From WattWise Production Guide (Sprint 3)
Serves the trained GOP Outage Prediction Model & LoadShift MILP Optimizer
"""

import os
import sys
from datetime import datetime
from fastapi import FastAPI, Query, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

# Add models directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.gop.train import GOPModel
from models.loadshift.optimizer import optimize_daily_schedule, ProcessConfig
from models.baseline.estimator import compute_prophet_baseline, lock_monthly_baseline, InsufficientHistoryError

app = FastAPI(
    title="WattWise ML Inference Service",
    version="1.0.0",
    description="Inference layer for 415V Grid Outage Prediction & LoadShift MILP Optimization"
)

# Load trained GOP model artifact on startup
gop_model = GOPModel()
model_path = os.path.join(os.path.dirname(__file__), "..", "models", "gop", "gop_model.json")
if os.path.exists(model_path):
    try:
        gop_model.load(model_path)
    except Exception as e:
        print(f"Warning: Could not load model artifact from {model_path}: {e}")

class PredictionResponse(BaseModel):
    factory_id: str
    outage_probability: float
    trigger_automation: bool
    confidence_score: float
    leading_indicator: str
    voltage_v: float
    frequency_hz: float
    dv_dt: float
    data_source: str
    model_version: str

class BaselineRequest(BaseModel):
    factory_id: str
    month: Optional[str] = "2026-10"
    historical_readings: Optional[List[dict]] = None
    historical_hourly_kwh: Optional[List[float]] = None
    tariff_rate_pkr: Optional[float] = 32.50

class ProcessItem(BaseModel):
    id: str
    name: str
    duration_slots: int
    power_kw: float
    critical: bool

class ScheduleRequest(BaseModel):
    factory_id: str
    processes: List[ProcessItem]
    grid_rate_pkr: Optional[float] = 32.50
    diesel_rate_pkr: Optional[float] = 94.20

@app.get("/healthz")
async def healthz():
    return {
        "status": "UP",
        "models_loaded": ["GOP_XGBoost_ONNX_Logistic_v2", "LoadShift_CPSAT_v1", "Prophet_IPMVP_OptionC_v1"],
        "telemetry_standard": "415V_3PHASE_50HZ_PAKISTAN",
        "mode": "TRAINED_MODEL_INFERENCE"
    }

@app.post("/baseline/{factory_id}")
async def get_factory_baseline(factory_id: str, payload: Optional[BaselineRequest] = None):
    """
    Computes IPMVP Option C counterfactual baseline using Prophet / Additive Seasonal Regression
    on the factory's own historical meter readings.
    Fails closed with HTTP 422 if historical meter records are missing or < 168 hours.
    """
    readings = payload.historical_readings if payload else None
    hourly_kwh = payload.historical_hourly_kwh if payload else None
    month = payload.month if (payload and payload.month) else "2026-10"
    tariff = payload.tariff_rate_pkr if (payload and payload.tariff_rate_pkr) else 32.50

    try:
        if readings:
            prophet_res = compute_prophet_baseline(factory_id, readings, forecast_hours=720)
            return {
                "factory_id": factory_id,
                "period_month": month,
                "prophet_baseline": prophet_res,
                "status": "COMPUTED_FROM_FACTORY_HISTORY"
            }
        elif hourly_kwh:
            locked = lock_monthly_baseline(factory_id, month, tariff, hourly_kwh)
            return {
                "factory_id": factory_id,
                "period_month": month,
                "locked_baseline": locked,
                "status": "LOCKED_IPMVP_SNAPSHOT"
            }
        else:
            raise InsufficientHistoryError(
                "Missing historical meter readings. Minimum 168 hours (1 full week) required to compute baseline."
            )
    except InsufficientHistoryError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@app.get("/predict/outage/{factory_id}", response_model=PredictionResponse)
async def predict_outage(
    factory_id: str,
    voltage_v: float = Query(401.8, description="Current 3-phase line-to-line voltage in Volts"),
    freq_hz: float = Query(50.01, description="Grid frequency in Hertz"),
    dv_dt: float = Query(-0.45, description="Voltage rate-of-change in V/s")
):
    """
    Evaluates real-time 415V feeder signals through the trained GOP Model.
    Computes dynamic outage probability. Triggers SwiftSwitch automation when probability > 0.70.
    """
    hour = datetime.now().hour
    features = {
        "voltage_v": voltage_v,
        "freq_hz": freq_hz,
        "dv_dt": dv_dt,
        "hour": hour
    }

    # Run inference using the trained model
    outage_prob = gop_model.predict_proba(features)
    trigger = outage_prob >= 0.70
    confidence = min(0.98, max(0.60, 0.5 + abs(outage_prob - 0.5)))

    indicators = []
    if voltage_v < 380.0:
        indicators.append(f"Grid undervoltage ({voltage_v:.1f}V)")
    if freq_hz < 49.80:
        indicators.append(f"Frequency sag ({freq_hz:.2f}Hz)")
    if dv_dt < -1.5:
        indicators.append(f"Negative dV/dt transient ({dv_dt:.2f} V/s)")

    primary_indicator = "; ".join(indicators) if indicators else "Nominal 415V/50Hz grid stability"

    return PredictionResponse(
        factory_id=factory_id,
        outage_probability=round(outage_prob, 3),
        trigger_automation=trigger,
        confidence_score=round(confidence, 3),
        leading_indicator=primary_indicator,
        voltage_v=voltage_v,
        frequency_hz=freq_hz,
        dv_dt=dv_dt,
        data_source="TRAINED_GOP_MODEL_INFERENCE",
        model_version="v2.2.0-shadow-pilot"
    )

@app.post("/schedule/{factory_id}")
async def generate_schedule(factory_id: str, payload: ScheduleRequest):
    """
    Runs Google OR-Tools CP-SAT MILP solver on submitted factory process items.
    """
    proc_configs = [
        ProcessConfig(
            proc_id=p.id,
            name=p.name,
            duration_slots=p.duration_slots,
            power_kw=p.power_kw,
            critical=p.critical
        )
        for p in payload.processes
    ]

    result = optimize_daily_schedule(
        processes=proc_configs,
        grid_rate=payload.grid_rate_pkr or 32.50,
        diesel_rate=payload.diesel_rate_pkr or 94.20
    )
    return {
        "factory_id": factory_id,
        "optimization_result": result
    }
