# WATTWISE™ PHASE 3 — OPERATIONAL RUNBOOK
## Fleet Management & Incident Response for 1–20 Monitored Factories (Section 04)

---

## 1. Daily Operations Checklist (Completed by 09:00 PKT Daily)

| Check Item | Systems Checked | Expected Nominal State | Escalation Trigger |
|---|---|---|---|
| **1. Sensor Telemetry Health** | Modbus RS-485 / InfluxDB | 100% of CT nodes active within last 60s | Any sensor missing > 5 mins $\rightarrow$ SEV-2 |
| **2. Switchover Event Logs** | WattBrain Edge Syslog | Verified 8ms ATS transfer duration on trips | Transfer $> 12\text{ms}$ or bounce $\rightarrow$ SEV-1 |
| **3. GOP Accuracy Audit** | Model 1 Evaluation Service | Yesterday's Precision $> 88\%$, False Alarm $< 5\%$ | False alarm event $\rightarrow$ SEV-4 |
| **4. Kafka Streaming Lag** | Kafka KRaft Consumer Lag | Consumer lag $< 100$ messages across all topics | Lag $> 5,000$ messages $\rightarrow$ SEV-3 |
| **5. Billing Anomaly Watch** | PostgreSQL Rule Monitor | 0 unauthorized UPDATE attempts on ledger | Any tamper attempt $\rightarrow$ Security Alert |
| **6. Nightly ML Retraining** | Airflow / Python Pipeline | Nightly ONNX model promoted or SLA maintained | Quality gate fail $> 3$ consecutive days $\rightarrow$ SEV-4 |

---

## 2. Weekly Operational Rhythm (Every Friday Afternoon)

1. **Factory Energy Summaries:** Auto-generate and dispatch weekly bilingual digests to mill owners via WhatsApp.
2. **Model Drift Audit:** Review feature distributions ($dV/dt$ and harmonic variance) against historical feeder baselines.
3. **Customer Health Scoring:** Compute engagement scores for each mill (dashboard logins, WhatsApp open rates, invoice payment timeliness).
4. **Sales Pipeline Sync:** Review status of active shadow monitoring pilots converting to commercial contracts.
5. **Cloud Cost Allocation:** Verify AWS and database compute spend remains below 4% of monthly Gross Merchandise Value (GMV).

---

## 3. Incident Severity Levels & Response Protocols

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    INCIDENT SEVERITY & RESPONSE MATRIX                          │
├──────────┬─────────────────────────────┬───────────────┬────────────────────────┤
│ Severity │ Description & Example       │ SLA Response  │ Designated Escalation  │
├──────────┼─────────────────────────────┼───────────────┼────────────────────────┤
│ **SEV-1**│ **Production Impacting:**   │ **< 15 Mins** │ **Engr. Hammad Raza**  │
│          │ ATS relay failure, false    │ (Immediate)   │ (Lead On-Call) +       │
│          │ generator trigger, blackout │               │ On-Site Field Engineer │
├──────────┼─────────────────────────────┼───────────────┼────────────────────────┤
│ **SEV-2**│ **Critical Telemetry Drop:**│ **< 1 Hour**  │ **Field Operations**   │
│          │ Split-core CT displaced,    │               │ Technician             │
│          │ 4G cellular gateway down    │               │ (Faisalabad / Lahore)  │
├──────────┼─────────────────────────────┼───────────────┼────────────────────────┤
│ **SEV-3**│ **Platform Degraded:**      │ **< 2 Hours** │ **Backend DevOps**     │
│          │ Control Room dashboard slow,│               │ Team                   │
│          │ WebSocket disconnects       │               │                        │
├──────────┼─────────────────────────────┼───────────────┼────────────────────────┤
│ **SEV-4**│ **Algorithmic Drift:**      │ **< 24 Hours**│ **ML Systems**         │
│          │ GOP precision drops below   │               │ Engineer               │
│          │ 88%, minor report typo      │               │                        │
└──────────┴─────────────────────────────┴───────────────┴────────────────────────┘
```

### SEV-1 Critical Incident Playbook:
1. **Immediate Hardware Fail-Safe:** The mechanical BCM2835 hardware watchdog automatically forces contactors to the safe **GRID** state upon any software panic. Verify this in the edge log.
2. **Phone the Mill Electrical Foreman:** Within 5 minutes, call the plant manager: *"This is Hammad from WattWise. We observed an anomalous signal on Feeder A-11. The hardware has defaulted to the secure grid position. Production is safe. Our engineer is arriving in 30 minutes."*
3. **Remote SSH via Cloudflare Tunnel:**
   ```bash
   ssh -p 22 wattbrain@tunnel-fsd04.wattwise.pk
   cat /var/log/wattbrain/relay.log | grep -E "ERROR|CRITICAL"
   ```
4. **Post-Mortem Root Cause Analysis (RCA):** Publish an RCA document within 24 hours to the mill owner explaining exact root cause and preventative firmware patch.

---

## 4. On-Call Discipline
Until a dedicated 24/7 network operations center exists, **the technical founding team holds the primary pager**. Production-impacting events require immediate, authoritative human attention. Never allow an automated switchover issue to sit unacknowledged for more than 15 minutes.
