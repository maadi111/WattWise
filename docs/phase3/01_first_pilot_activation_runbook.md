# WATTWISE™ PHASE 3 — FIRST PILOT ACTIVATION RUNBOOK
## Weeks 1–4: From Shadow Monitoring to Live Automation (Section 01)

---

## 1. Week 1: Shadow Install Day (3–5 Hours Protocol)

The physical installation takes exactly one site visit. Bring everything 100% pre-configured and tested on your home test bench. The textile mill experiences **zero downtime and zero production interruption**.

### Pre-Arrival Checklist (Pack in Tool Bag):
* [ ] Pre-flashed Raspberry Pi CM4 with WattBrain Edge OS v2.4.
* [ ] 28× Split-Core CT Clamps (SCT-013-100 or industrial Rogowski coils).
* [ ] 1× Jazz 4G LTE USB Dongle with active data bundle (pre-tested).
* [ ] 1× DIN-rail mounted 5V/3A industrial power supply (MeanWell HDR-15-5).
* [ ] 1× UNI-T UT210E True-RMS clamp meter (for ground truth calibration).
* [ ] 50× Heavy-duty UV-resistant cable ties.
* [ ] 1× Multi-socket surge protector + terminal screwdriver set.
* [ ] 2× Signed copies of the 30-Day Free Shadow Monitoring Agreement.

### 5-Step On-Site Installation Procedure (45 Minutes Inside Sub-station):
1. **Physical Safety Check:** Greet the Electrical Foreman. Put on electrical gloves and safety helmet. Inspect the Main Distribution Board (MDB-01).
2. **Mounting WattBrain Unit:** Mount the DIN-rail enclosure inside the auxiliary section of the switchgear panel (away from high-temperature exhaust).
3. **Clamping CT Sensors:** Snap split-core CT clamps around the insulated Phase A, B, and C busbars feeding the weaving shed, dyeing unit, compressors, and generator incoming.
4. **Power & Cellular Uplink:** Connect the 5V power supply to an auxiliary single-phase socket. Plug in the 4G USB dongle. Verify green status LED on WattBrain.
5. **Real-Time Calibration:** Measure incoming current with the handheld UNI-T clamp meter. Verify the live reading in the WattWise dashboard matches within $\pm 1.5\%$.

### ▲ Non-Negotiable Requirements Before Leaving the Factory:
* **Requirement 1:** Verify CT current readings are updating live in the dashboard (`http://app.wattwise.pk` or mobile).
* **Requirement 2:** Confirm 4G connection uptime and verify local SQLite ring buffer commits (`cat /var/log/wattbrain/buffer.log`).
* **Requirement 3:** Save the WhatsApp number of the Factory Manager and Senior Electrical Foreman in your phone, and hand them your direct contact card.

---

## 2. Weeks 1–4: The 30-Day Shadow Period

During this phase, WattWise runs in **passive monitoring mode only**. Absolutely no relay control. No ATS contactor connection. No operational risk to the factory.

### Daily Cadence (8:00 AM — 9:00 AM PKT):
* [ ] **Sensor Health Check:** Log into the WattWise fleet dashboard. Verify all 28 sensors have transmitted data in the last 60 seconds.
* [ ] **Outage Event Logging:** Check if FESCO tripped Feeder A-11 in the last 24 hours. Cross-reference trip timestamps with Model 1 (GOP) predictions.
* [ ] **Edge Buffer Audit:** Verify zero packet drops and zero database locking errors on the edge device.

### Weekly Touchpoint (Every Friday at 17:00 PKT):
* Dispatch the **Weekly Energy Summary** in Urdu & English via WhatsApp to the Mill Owner and Plant Director.
* Example Friday message:
  > *"Salam Tariq Sahib, this week WattWise tracked 158,400 kWh at Unit 04. FESCO tripped 7 times for a total of 9.2 hours. Your backup generator consumed Rs. 974,700 in diesel. We identified Rs. 312,000 in peak TOU curtailment savings. Full report attached."*
* Retrain the GOP model nightly with the factory's unique feeder trip fingerprints.

---

## 3. Week 4: The Handover & Conversion Meeting

The handover meeting is where the **free shadow pilot converts into a paying commercial customer**.

### The Core Psychological Anchor:
Present the mill owner with a single, irrefutable number: **The Monthly Cost of Inaction**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              30-DAY SHADOW AUDIT SUMMARY — CRESCENT WEAVING UNIT 04             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  • WAPDA Outages Experienced:            38 Outages (44.6 Total Hours)          │
│  • Generator Diesel Consumed:             14,320 Liters (Rs. 4,081,200)         │
│  • Diesel Avoidable via SwiftSwitch:      14,250 Liters (Rs. 4,061,250)         │
│  • Peak Tariff Curtailment Potential:     Rs. 1,198,750                         │
│  • FESCO Discrepancy (Over-billing):      17,180 kWh (Rs. 618,480 Recoverable)  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  TOTAL DOCUMENTED RECOVERABLE VALUE:      Rs. 5,260,000 / Month                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### The Closing Script:
> *"Tariq Sahib, your factory lost Rs. 5.26 Million this past month that was completely avoidable. WattWise proved this with real data from your own electrical panel.*
>
> *We don't want you to pay us anything upfront. We propose a 1-day controlled trial: we will connect the SwiftSwitch relay module to your ATS control terminal. If the next feeder outage doesn't switch seamlessly in 8 milliseconds with zero loom stoppages, we remove our gear immediately.*
>
> *When it works, we split the documented savings: 80% stays in your bank account, and WattWise takes a 20% performance fee. You risk zero."*

### Step 4: Activating Live SwiftSwitch™:
* Wire Relay 01 dry contacts across the ATS remote start terminal block.
* Verify mechanical interlock prevents cross-feeding.
* Arm SwiftSwitch in the dashboard $\rightarrow$ Factory is officially live!
