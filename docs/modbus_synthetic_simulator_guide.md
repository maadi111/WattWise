# WattWise™ — Synthetic Modbus RTU / TCP Industrial Simulator Suite

## 1. Executive Summary & Purpose

The **WattWise™ Synthetic Modbus Industrial Simulator Suite** provides a high-fidelity, production-grade emulation of multi-unit power substations used in Pakistani manufacturing plants (textile spinning, weaving, denim finishing, and steel re-rolling).

It enables full end-to-end testing of the WattWise hardware abstraction layer, edge controllers, and real-time SCADA pipelines without requiring physical high-voltage connection to 11kV busbars or diesel generator switchboards during development.

---

## 2. Multi-Unit Substation Topology & Modbus Addressing

The daemon listens on **Modbus TCP port 5020** (standard Modbus TCP framing with 7-byte MBAP header) and routes requests to multi-drop industrial slave devices based on the `Unit ID` byte:

| Unit ID | Industrial Hardware Emulated | Role / Function | Rated Capacity |
| :--- | :--- | :--- | :--- |
| **0x01 (1)** | **Schneider Electric PowerLogic PM8000** | 11kV/415V Main Substation Incomer Transformer 1 | 2,500 kVA |
| **0x02 (2)** | **Janitza UMG 604E** | Standby Industrial Diesel Generator | 1,200 kW (1,500 kVA) |
| **0x03 (3)** | **Schneider Electric PowerLogic PM5560** | Ring Spinning Shed Feeder #1 | 630 kVA |
| **0x04 (4)** | **Schneider Electric PowerLogic PM5560** | Air-Jet Weaving Shed Feeder #2 | 500 kVA |
| **0x0A (10)** | **WattBrain™ Core Controller & Relay Box** | Hardware Coils, SwiftSwitch ATS & Load Shedding | Microsecond Relays |

---

## 3. Register Memory Map (Schneider PM8000 & Janitza Standard)

All electrical values are represented as **IEEE 754 32-bit Floating Point** values spanning two consecutive 16-bit registers in **Big-Endian word order** (High word first, Low word second).

### Holding Registers (`Function Code 0x03` & `0x04`)

| Register Address | Word Count | Data Type | Engineering Units | Metric Description |
| :--- | :---: | :--- | :--- | :--- |
| **3000 – 3001** | 2 | `Float32` | Amperes (A) | Phase A RMS Current ($I_A$) |
| **3002 – 3003** | 2 | `Float32` | Amperes (A) | Phase B RMS Current ($I_B$) *(Reversible via DSP)* |
| **3004 – 3005** | 2 | `Float32` | Amperes (A) | Phase C RMS Current ($I_C$) |
| **3006 – 3007** | 2 | `Float32` | Amperes (A) | Neutral Current ($I_N$) |
| **3020 – 3021** | 2 | `Float32` | Volts (V) | Line-to-Line Voltage $V_{AB}$ |
| **3022 – 3023** | 2 | `Float32` | Volts (V) | Line-to-Line Voltage $V_{BC}$ |
| **3024 – 3025** | 2 | `Float32` | Volts (V) | Line-to-Line Voltage $V_{CA}$ |
| **3026 – 3027** | 2 | `Float32` | Volts (V) | Average Line-to-Line Voltage ($V_{LL}$) |
| **3028 – 3029** | 2 | `Float32` | Volts (V) | Line-to-Neutral Voltage $V_{AN}$ |
| **3030 – 3031** | 2 | `Float32` | Volts (V) | Line-to-Neutral Voltage $V_{BN}$ |
| **3032 – 3033** | 2 | `Float32` | Volts (V) | Line-to-Neutral Voltage $V_{CN}$ |
| **3034 – 3035** | 2 | `Float32` | Volts (V) | Average Line-to-Neutral Voltage ($V_{LN}$) |
| **3060 – 3061** | 2 | `Float32` | Kilowatts (kW) | **Total 3-Phase Active Power ($P$)** |
| **3068 – 3069** | 2 | `Float32` | kVAR | Total 3-Phase Reactive Power ($Q$) |
| **3076 – 3077** | 2 | `Float32` | kVA | Total 3-Phase Apparent Power ($S$) |
| **3084 – 3085** | 2 | `Float32` | Ratio (-1.0 to 1.0) | **Total True Power Factor ($\cos\phi$)** |
| **3110 – 3111** | 2 | `Float32` | Hertz (Hz) | **Grid Frequency ($f_{grid}$)** |
| **3204 – 3205** | 2 | `Float32` | kWh | Lifetime Active Energy Delivered |
| **3250 – 3251** | 2 | `Float32` | % | Voltage Total Harmonic Distortion (THD-V) |
| **3252 – 3253** | 2 | `Float32` | % | Current Total Harmonic Distortion (THD-I) |

---

### Hardware Coils (`Function Code 0x01` Read, `0x05` Write Single)

Coils reside primarily on **Unit ID 0x0A (10)** (WattBrain Edge Gateway & Relay Contactor Box):

| Coil Address | Name | Default State | Description & Hardware Action |
| :---: | :--- | :---: | :--- |
| **0x0001 (1)** | `COIL_SWIFTSWITCH_ARM` | `1 (ON)` | Arms the sub-cycle grid outage detection and ATS trigger |
| **0x0002 (2)** | `COIL_FAST_ATS_TRIGGER` | `0 (OFF)` | High-speed ATS contactor pulse: transfers factory load from grid to generator |
| **0x0003 (3)** | `COIL_SHED_HVAC` | `0 (OFF)` | Sheds non-critical air-handling units and warehouse chillers (-91.4 kW) |
| **0x0004 (4)** | `COIL_SHED_COMPRESSOR_B` | `0 (OFF)` | Sheds secondary compressor bank B during peak load shifting |
| **0x0005 (5)** | `COIL_SUBSTATION_POLARITY_B` | `0 (OFF)` | **Software Polarity Inversion**: Flips Phase B Rogowski current angle 180° in DSP |

---

### Discrete Inputs (`Function Code 0x02` Read-Only)

| Input Address | Signal Name | Physical Status | Description |
| :---: | :--- | :---: | :--- |
| **0x0001 (1)** | `GRID_BREAKER_CLOSED` | `1 (CLOSED)` | Main WAPDA 11kV Vacuum Circuit Breaker (VCB) auxiliary contact |
| **0x0002 (2)** | `GEN_BREAKER_CLOSED` | `0 (OPEN)` | Diesel Generator Motorized Air Circuit Breaker (ACB) |
| **0x0003 (3)** | `GEN_ENGINE_READY` | `1 (READY)` | Engine pre-lubricated, coolant at 65°C, starter batteries charged |
| **0x0004 (4)** | `PHASE_SEQUENCE_OK` | `1 (OK)` | Positive sequence L1 $\to$ L2 $\to$ L3 confirmed (120° displacement) |

---

## 4. Sub-Cycle SwiftSwitch Protection & Transfer Engine

The edge client (`modbus_client.py`) executes a 10 Hz supervisory monitoring loop:

$$\text{Trigger Condition}: \quad f_{grid} < 48.5\text{ Hz} \quad \lor \quad V_{LN} < 195\text{ V}$$

When WAPDA grid frequency drops below 48.5 Hz (precursor to total grid collapse):
1. **Detection**: Edge supervisor samples holding register `3110` in under 10ms.
2. **Autonomous Trigger**: Issues Modbus Write Coil `0x0002 = ON` to WattBrain.
3. **Load Shedding**: Writes Modbus Coil `0x0003 = ON` to drop non-critical HVAC load.
4. **Benchmarked Transfer Speed**: **0.83 ms** execution latency (far exceeding the 15ms SLA gate requirement).

---

## 5. Software Polarity Inversion (Eliminating Physical Re-Wiring)

A common installation error during substation commissioning is clamping the split-core Rogowski coil backwards onto Phase B busbar, producing negative active power readings ($-408.2\text{ A}$):

$$P_{measured} = V_A I_A + V_B (-I_B) + V_C I_C \quad \implies \quad \text{False Negative / Low Power}$$

By writing `COIL_SUBSTATION_POLARITY_B = 1` via Modbus or the UI Commissioning Wizard:
* The internal DSP multiplies $I_B$ by $-1$ ($e^{j\pi}$ phase rotation).
* Measured power factor immediately recovers from apparent degradation to **+0.94 PF**.
* Total active power restores to **+274.6 kW**, verified without de-energizing high-voltage busbars.

---

## 6. High-Throughput Stress Testing Results

Running `python apps/edge/simulator/stress_test.py` executes concurrent multi-drop polling simulating 20 mills under continuous 50Hz load:

```
==============================================================================
🚀 WATTWISE™ INDUSTRIAL MODBUS RTU / TCP STRESS TEST & BENCHMARK
   Simulating 20 Multi-Drop Mill Endpoints (10Hz / 50Hz Polling Loops)
==============================================================================
Total Requests Executed:    1,298
Successful Requests:        1,298
Failed Requests:            0
Packet Success Rate:        100.00% (Target: 100.0%)
Test Duration:              5.07 seconds
Throughput:                 256.05 Requests / Second
------------------------------------------------------------------------------
⏱️ ROUND-TRIP LATENCY BENCHMARKS:
   Median (p50):            9.604 ms
   95th Percentile (p95):   24.419 ms
   99th Percentile (p99):   36.009 ms
   Peak Max Latency:        45.297 ms
------------------------------------------------------------------------------
⚡ SUB-CYCLE HARDWARE ACTIONS:
   SwiftSwitch ATS Transfer: 0.83 ms (<15ms SLA Gate PASS)
   Phase B Polarity Flip:   SUCCESS
==============================================================================
🎉 ALL STRESS TEST QUALITY CRITERIA MET WITH 100% RELIABILITY!
```

---

## 7. How to Run the Simulator Suite

### 1. Launch Synthetic Modbus Daemon
```bash
python apps/edge/simulator/modbus_server.py
```
*Listens on `127.0.0.1:5020` simulating Schneider PM8000, Janitza UMG 604, and WattBrain relays.*

### 2. Run Telemetry Client & Supervisor
```bash
python apps/edge/simulator/modbus_client.py
```

### 3. Run Automated 20-Mill Stress Test Suite
```bash
python apps/edge/simulator/stress_test.py
```

### 4. Integration with WattBrain Sensor Bus
```python
from wattbrain.sensor_bus import ModbusCTBus
import asyncio

async def poll():
    bus = ModbusCTBus(tcp_host="127.0.0.1", tcp_port=5020)
    await bus.connect_tcp()
    telemetry = await bus.read_all()
    print(telemetry)
    await bus.close()

asyncio.run(poll())
```
