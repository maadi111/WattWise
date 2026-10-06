# WATTWISE™ — SEED ROUND PITCH DECK (12 SLIDES)
## Target: USD 250,000 Seed Round | 18 Months Runway | 20 Enterprise Factory Deployments
*From Phase 2 Post-Build & Validation Playbook (Pages 17-18)*

---

### SLIDE 1: COVER
* **Title:** WATTWISE™
* **Sub-title:** The Industrial Energy Operating System for Pakistan
* **One-Line Thesis:** Cutting industrial electricity and diesel costs by 25–40% without changing a single factory machine.
* **Presented By:** Engr. Hammad Raza (Co-Founder & CTO, PIEAS)
* **Date:** October 2026 | Faisalabad & Lahore, Pakistan

---

### SLIDE 2: THE PROBLEM
* **Pakistan Industrial Energy Crisis (NEPRA Citations):**
  * **18–22 Hours Daily Grid Instability:** Punjab industrial clusters suffer from severe unannounced voltage sags and feeder trips.
  * **3.5× Diesel Penalty:** Grid electricity costs Rs. 32/kWh, while backup diesel generation costs Rs. 94–110/kWh.
  * **Thread Breaks & Ruined Batches:** A 1-second voltage dip halts 40 airjet looms, causing catastrophic thread breaks (Rs. 2,250/loom/hr). A temperature drop below 118°C in a dye vat destroys the entire batch (Rs. 450,000 direct loss).
  * **Systemic DISCO Over-Billing:** DISCOs (FESCO, LESCO) routinely over-bill mills by 4–8% due to lagging electro-mechanical meters.

---

### SLIDE 3: THE SOLUTION
* **WattWise Industrial Intelligence Platform:**
  * **Pre-Emptive SwiftSwitch™:** 8-second ahead grid collapse prediction. Ignites generators and transfers bus before voltage collapses ($T-0.008\text{s}$ ATS transfer), achieving **zero production interruptions**.
  * **Production-Aware LoadShift™:** MILP CP-SAT engine shifts non-critical loads (compressors, HVAC) away from peak TOU tariff hours (5:00 PM – 10:00 PM).
  * **NEPRA Chapter 4 Sec. 21 Dispute Engine:** Automated split-screen reconciliation between utility bills and revenue-grade CT telemetry.
  * **SavingsLedger™:** Cryptographically verified (SHA-256) counterfactual baseline calculation.

---

### SLIDE 4: PRODUCT DEMO & ARCHITECTURE
* *[Embed live video walkthrough of the 20-module Control Room at `http://127.0.0.1:5173/`]*
* **Hero Operational Strip:** Live 10Hz telemetry sync from Crescent Weaving Unit 04, Faisalabad (401.8V, 50.02Hz, 2.84MW).
* **2D Factory Power Floor:** Architectural spatial mapping of Weaving Hall, Spinning, Dyeing, Stenters, and Compressor House.
* **Machine Inspector:** Real-time electrical signatures, power factor monitoring, and Isolation Forest anomaly observation.

---

### SLIDE 5: HOW IT WORKS (THE 4-LAYER STACK)
* **Layer 1: Sensor & Edge (WattClamp™ & WattBrain™):** Split-core CT clamps reading 3-phase currents via RS-485 Modbus RTU at 10Hz. ARMv8 edge controller with 72-hour SQLite circular ring buffer and BCM2835 hardware watchdog.
* **Layer 2: Communications & Ingestion:** Industrial MQTT TLS broker + Apache Kafka KRaft streaming to TimescaleDB/InfluxDB.
* **Layer 3: The 4 Machine Learning Engines:**
  * Model 1 (GOP): XGBoost Outage Predictor (Precision 100%, Recall 83.3%, False Alarm 0%).
  * Model 2 (LoadShift): Google OR-Tools CP-SAT production scheduling optimizer.
  * Model 3 (Baseline): Facebook Prophet counterfactual regression with SHA-256 tamper-proof ledger.
  * Model 4 (Anomaly Engine): Scikit-learn Isolation Forest detecting motor idling and power factor degradation.
* **Layer 4: Application UI:** High-density enterprise control room with bilingual support (English + Noto Nastaliq Urdu).

---

### SLIDE 6: BUSINESS MODEL & UNIT ECONOMICS
* **Zero Sales Friction Model:** **20% Gain-Share on Documented Savings**.
  * Example Client (Crescent Weaving Unit 04):
    * Counterfactual Baseline: Rs. 18.20M / month
    * Actual Energy Cost: Rs. 12.94M / month
    * **Documented Monthly Savings: Rs. 5.26M**
    * **WattWise 20% Fee: Rs. 1,052,000 / month** (Factory retains Rs. 4,208,000).
* **Transition to Hybrid SaaS:** Starter: Gain-Share $\rightarrow$ Growth: Rs. 85,000/mo subscription + 10% gain-share $\rightarrow$ Enterprise: Rs. 250,000/mo.
* **Gross Margins:** **71%** at scale.

---

### SLIDE 7: MARKET SIZE (PAKISTAN & BEYOND)
* **Beachhead TAM (Punjab Textile Sector):** 5,000+ registered textile & apparel mills in Faisalabad, Lahore, and Gujranwala spending > Rs. 400 Billion annually on industrial power.
* **Serviceable Addressable Market (SAM):** Rs. 80 Billion annual energy optimization potential across Pakistan.
* **Adjacent Industrial Verticals:** Sialkot surgical instruments, Gujranwala ceramics, Hattar cement & steel rolling mills.

---

### SLIDE 8: TRACTION & TESTING ROADMAP
* **Codebase & Infra 100% Complete:** Monorepo across Go API, Python ML pods, WattBrain edge firmware, and React 19 control room.
* **Digital Twin Validated:** Tested against real FESCO Feeder A-11 2025 outage data.
* **Chaos Suite Tested:** 5/5 failure scenarios verified (cloud outage, disk full, Kafka spike, watchdog crash, 72h network drop).
* **Shadow Pilot Outreach:** 30-Day Free Shadow Monitoring agreements actively initiated with Faisalabad textile mills via APTMA.

---

### SLIDE 9: GO-TO-MARKET (GTM)
* **The "Free 30-Day Energy Audit" Trojan Horse:** Offer mill owners a free Rs. 200,000 audit report. Clip non-invasive sensors on main switchgear (zero rewiring, zero downtime). No mill owner says no to free data.
* **Partnership Channels:**
  * **APTMA (All Pakistan Textile Mills Association):** Group presentations to regional mill clusters.
  * **LUMS Center for Entrepreneurship (NIC) & PIEAS:** Engineering alumni network introductions to mill owners.
  * **SMEDA & EU CBAM Compliance Mandates:** Export readiness forcing mills to audit Scope 1 & 2 carbon.

---

### SLIDE 10: 36-MONTH FINANCIAL PROJECTIONS
* **Month 12:** 20 Factories Deployments $\rightarrow$ **Rs. 240M ARR** (Cash-flow positive).
* **Month 24:** 60 Factories Deployments $\rightarrow$ **Rs. 510M ARR**.
* **Month 36:** 120 Factories Deployments $\rightarrow$ **Rs. 867M ARR** (Target breakeven on fully built engineering & field team).

---

### SLIDE 11: TEAM & ADVISORY
* **Engr. Hammad Raza — Co-Founder & CTO:** Systems engineering graduate from Pakistan Institute of Engineering & Applied Sciences (PIEAS). Specialist in embedded systems, power telemetry, and machine learning pipelines.
* **Co-Founder & CEO (Recruiting):** Commercial textile industry veteran with 15+ years in Faisalabad manufacturing operations.
* **Technical Advisors:** Senior Electrical Engineering faculty (PIEAS / LUMS) & former FESCO Chief Engineer.

---

### SLIDE 12: THE ASK & USE OF FUNDS
* **Raising:** **USD 250,000 (PKR ~70 Million)** Seed Round.
* **Runway:** **18 Months** to reach 20 paying factory deployments and profitability.
* **Allocation of Funds:**
  * **40% Hardware Assembly & Pilot Inventory:** Sourcing 150 WattBrain controllers and 1,000 split-core CT clamps.
  * **30% Engineering & Field Operations Team:** Hiring 3 field deployment technicians and 2 ML systems engineers in Lahore/Faisalabad.
  * **15% Legal, IP & PSQCA Certification:** Patent filing on pre-emptive switchover logic and PSQCA electrical safety mark.
  * **15% Working Capital & Sales Operations:** APTMA cluster seminars and customer acquisition.
