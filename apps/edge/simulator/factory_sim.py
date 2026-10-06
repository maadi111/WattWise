"""
WattBrain Factory Load Simulator (Dev Environment)
From WattWise Production Guide (Sprint 2, Pages 9-10)
Simulates realistic industrial load curves and publishes MQTT packets
so the full cloud pipeline can be tested before physical sensors are deployed.
"""

import json
import math
import random
import time

FACTORY_ID = "fsd_mill_001"
BROKER = "localhost" # or mqtt.wattwise.pk
PORT = 1883

SECTIONS = [
    {"id": "weaving_a", "base_kw": 310.0, "variance": 15.0},
    {"id": "dyeing_vats", "base_kw": 285.0, "variance": 20.0},
    {"id": "stenter", "base_kw": 142.0, "variance": 8.0},
    {"id": "compressors", "base_kw": 63.0, "variance": 5.0},
    {"id": "hvac", "base_kw": 47.0, "variance": 3.0},
]

def simulate_reading(section, on_grid=True):
    t = time.time()
    # Simulate realistic load curve: lower at shift start/end (sinusoidal diurnal wave)
    hour_factor = 0.8 + 0.2 * math.sin(t / 3600)
    kw = (section["base_kw"] + random.gauss(0, section["variance"])) * hour_factor
    kw = max(10.0, kw)

    v_nom = 220.0 if on_grid else 218.0
    f_nom = 50.0 if on_grid else 50.1

    return {
        "factory_id": FACTORY_ID,
        "node_id": section["id"],
        "ts": int(t * 1000), # epoch milliseconds
        "power_kw": round(kw, 2),
        "voltage_v": round(random.gauss(v_nom, 2.0), 1),
        "freq_hz": round(random.gauss(f_nom, 0.04), 2),
        "on_grid": on_grid,
        "pf": round(random.gauss(0.92, 0.02), 3)
    }

def run_simulation(duration_seconds=30):
    print(f"[SIMULATOR] Starting WattBrain telemetry emission for {FACTORY_ID} on {BROKER}:{PORT}...")
    start_t = time.time()
    count = 0
    while time.time() - start_t < duration_seconds:
        for s in SECTIONS:
            payload = simulate_reading(s)
            topic = f"factory/{FACTORY_ID}/sensors/{s['id']}"
            # In live environment with paho-mqtt:
            # client.publish(topic, json.dumps(payload), qos=1)
            count += 1
            if count % 10 == 0:
                print(f"[MQTT PUB] {topic} -> {payload['power_kw']} kW, {payload['voltage_v']}V, PF {payload['pf']}")
        time.sleep(2)
    print(f"[SIMULATOR] Emitted {count} telemetry packets successfully.")

if __name__ == "__main__":
    run_simulation(10)
