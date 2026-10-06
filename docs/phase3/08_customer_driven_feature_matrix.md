# WattWise™ — Phase 3 Customer-Driven Feature Matrix & Anti-Feature Rubric

> **Document Status:** Product Management & Engineering Governance  
> **Framework:** Industrial RICE Prioritization (Reach, Impact, Confidence, Effort)  
> **Target Release Cadence:** Bi-weekly Sprint Cycle (Weeks 5–12)  

---

## 1. Customer Request Intake & Triage Pipeline

To maintain high engineering velocity while preventing bespoke customization bloat, WattWise implements a strict 4-stage intake pipeline for all incoming customer feature requests.

```
+-----------------------------------------------------------------------------------+
|                        CUSTOMER FEATURE INTAKE WORKFLOW                           |
+-----------------------------------------------------------------------------------+
|  1. INTAKE            | Direct inputs from Weekly Plant Visits, WhatsApp Groups,  |
|                       | and Monthly C-suite Financial Audits.                     |
|                       | Logged into Jira / GitHub Projects with Raw Audio/Notes.  |
+-----------------------+-----------------------------------------------------------+
|  2. FILTER & SCORE    | Product Lead evaluates request against the Industrial     |
|                       | RICE Scoring Rubric. Custom one-offs are tagged.          |
+-----------------------+-----------------------------------------------------------+
|  3. TICKET CONVERSION | Accepted features are decomposed into Go backend API,     |
|                       | Python ML, and React UI user stories with clear ACs.      |
+-----------------------+-----------------------------------------------------------+
|  4. ROLLOUT & FEEDBACK| Bi-weekly canary deployment to 2 pilot sites; telemetry    |
|                       | validation before 100% fleet activation.                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. The Anti-Feature Trap Scoring Rubric

Industrial mill owners frequently request highly bespoke features (e.g., custom PLC ladder logic overrides, proprietary legacy machine serial protocols, or complex non-standard ERP exports) that can drain engineering velocity.

### 2.1 Industrial RICE Formula

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Financial Impact} \times \text{Technical Confidence}}{\text{Engineering Effort (Person-Weeks)}}$$

- **Reach (1 – 10):** Scalability across the target 20 textile mills ($1 = \text{single mill edge case}; 10 = \text{universal across all industrial feeders}$).
- **Financial Impact (1 – 5):** Direct correlation with customer energy bill reduction, diesel savings, or billing retention ($1 = \text{cosmetic}; 5 = >\text{Rs. 500,000 / month verified savings}$).
- **Technical Confidence (0.5 – 1.0):** Feasibility with standard non-invasive sensors ($0.5 = \text{requires invasive machine downtime}; 1.0 = \text{standard Modbus/MQTT telemetry}$).
- **Effort (Person-Weeks):** Total combined engineering weeks across Backend, ML, and Frontend.

### 2.2 Rejection & Bespoke Service Gate
- **Kill Threshold:** Any feature request scoring **$< 18.0$** is formally rejected from the core SaaS roadmap.
- **Paid Custom Engineering Clause:** If a mill insists on a bespoke non-standard feature, it is quoted under a separate Professional Services SOW with an upfront engineering fee of **minimum Rs. 650,000**, delivered without compromising the core multi-tenant codebase.

---

## 3. Prioritized Post-Pilot Feature Roadmap (Weeks 5–12)

```
+----+--------------------------------+-------+--------+------------+--------+-------+-----------+
| ID | FEATURE SPECIFICATION          | REACH | IMPACT | CONFIDENCE | EFFORT | SCORE | STATUS    |
+----+--------------------------------+-------+--------+------------+--------+-------+-----------+
| F1 | Multi-User Role RBAC           |  10   |   4    |    1.0     | 1.5 pw | 26.7  | SPRINT 1  |
| F2 | Urdu/Eng WhatsApp Digest       |  10   |   5    |    0.9     | 2.0 pw | 22.5  | SPRINT 1  |
| F3 | Ultrasonic Fuel Telemetry      |   8   |   5    |    0.9     | 2.5 pw | 14.4* | SPRINT 2  |
| F4 | Solar Net-Metering Audit       |   9   |   4    |    1.0     | 1.5 pw | 24.0  | SPRINT 2  |
| F5 | Motor Edge Vibration (FFT)     |   5   |   3    |    0.6     | 4.0 pw |  2.3  | DEFERRED  |
| F6 | Bespoke SAP ERP Direct Sync    |   2   |   2    |    0.5     | 5.0 pw |  0.4  | SOW ONLY  |
+----+--------------------------------+-------+--------+------------+--------+-------+-----------+
```
*\*F3 approved by exception due to massive diesel theft mitigation value in Faisalabad industrial cluster.*

---

## 4. Detailed Feature Specifications

### 4.1 Feature F1: Multi-User Role-Based Access Control (RBAC)
- **Problem Statement:** Textile mills require strict information segregation between executive owners, plant engineers, and shift supervisors.
- **Access Hierarchy:**
  - `OWNER / CFO`: Full financial visibility, FESCO tariff audit, ROI reports, billing settlement invoices.
  - `PLANT MANAGER`: Feeder-level energy consumption, peak hour load curtailment status, generator switchover alarms.
  - `SHIFT ELECTRICIAN`: Real-time phase voltages, power factor warning buzzer, motor trip diagnostics; financial data hidden.
  - `EXTERNAL AUDITOR`: Read-only historical export access for ISO 50001 or Higg FEM environmental compliance.
- **Implementation:** Integrated JWT claims in Golang API (`apps/api/internal/auth`) enforced at middleware level.

### 4.2 Feature F2: Automated Bilingual WhatsApp Digest (Urdu & English)
- **Problem Statement:** Mill owners spend <10 minutes/day at desktop dashboards but monitor WhatsApp continuously.
- **Delivery Mechanism:** Daily automated WhatsApp message dispatched at **08:30 PKT** summarizing previous 24-hour performance.
- **Payload Structure:**
  - Yesterday's Total Power Cost (PKR) vs Baseline Average.
  - Peak Hour Grid Violations Avoided (Units curtailed $\times$ Rs. 85/kWh penalty).
  - Generator Diesel Efficiency ($\text{kWh / Liter}$ against OEM benchmark).
  - Power Factor Surcharge Risk Status (FESCO $0.90$ PF penalty avoided).
- **Backend Service:** Implemented in `apps/api/internal/telemetry/weekly_summary.go` utilizing Meta Cloud API or local Pakistani SMS/WhatsApp gateway (Zong/Jazz business API).

### 4.3 Feature F3: Ultrasonic Generator Fuel Telemetry & Pilferage Detection
- **Problem Statement:** Diesel generator fuel theft is a chronic source of unaccounted factory OPEX, frequently disguised as poor engine efficiency.
- **Hardware Integration:** Non-invasive external ultrasonic level sensor clamped to bottom of bulk diesel storage and daily day-tanks; Modbus RS-485 to WattWise Edge Hub.
- **Algorithmic Anomaly Detection:**
  - Compares fuel volumetric drawdown rate ($\Delta V / \Delta t$) against actual electrical generator kW output.
  - If fuel level drops $>15\text{ liters}$ while generator breaker is open or operating at idle load, an immediate **SEV-1 Diesel Pilferage Alert** triggers via SMS/WhatsApp with timestamp and estimated theft volume.

### 4.4 Feature F4: Solar-Grid Net Metering Reconciliation & BKM Audit
- **Problem Statement:** 80% of textile mills have installed 500kW to 2MW captive rooftop solar. DISCOs (FESCO/LESCO) frequently miscalculate net-metering bills, failing to credit off-peak solar exports at lawful NEPRA PRG-01 rates.
- **Engine Logic:**
  - Continuously records bi-directional active and reactive energy at grid interconnection point.
  - Generates a "Shadow Utility Bill" reconciling DISCO's paper bill against physical meter exports.
  - Flags under-crediting variances $>Rs.\ 50,000$ with an automated formal dispute letter ready for filing with the Electric Inspector / Provincial NEPRA Ombudsman.
