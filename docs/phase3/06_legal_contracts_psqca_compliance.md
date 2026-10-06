# WattWise™ — Phase 3 Legal Contracts, Data Governance & PSQCA Regulatory Compliance

> **Document Classification:** Internal Legal & Operational Protocol  
> **Applicable Jurisdiction:** Islamic Republic of Pakistan (Punjab / Sindh / KP)  
> **Standards Reference:** PSQCA, IEC 61869-2, IEC 60947-1, FBR Sales Tax on Services, PECA 2016  

---

## 1. Commercial Master Service Agreement (MSA) — Dual-Billing Framework

WattWise™ contracts operate under a standardized Master Service Agreement (MSA) that offers two commercial engagement models designed to de-risk adoption for textile mills while guaranteeing predictable SaaS margins.

### 1.1 Commercial Models

| Feature | Model A: Pure SaaS Subscription | Model B: Performance Gain-Share (Hybrid) |
| :--- | :--- | :--- |
| **Target Customer** | Large groups (Nishat, Sapphire, Interloop) requiring fixed OPEX | Mid-market mills (Crescent, Sitara, Chenab) wanting zero-risk entry |
| **Fee Structure** | Rs. 250,000 – Rs. 350,000 / month / facility | Base fee (Rs. 100,000/mo) + 20% of net verified energy savings |
| **Cap on Fees** | Fixed predictable fee | Capped at Rs. 650,000 / month to maintain customer goodwill |
| **Billing Frequency**| Monthly in advance (1st of each month) | Base in advance; gain-share reconciled Net-15 post-FESCO bill |
| **Contract Term** | 12 months minimum commitment | 12 months with 6-month performance review checkpoint |
| **Hardware Deposit** | Rs. 150,000 refundable security deposit | Zero deposit; bundled into monthly commitment |

### 1.2 Baseline Verification Protocol (IPMVP Option C)

To eliminate disputes over gain-share billing, WattWise binds all performance claims to the International Performance Measurement and Verification Protocol (IPMVP) Option C (Whole Facility Energy Consumption):

$$\text{Verified Savings (PKR)} = \left[ (E_{\text{baseline}} \times \frac{P_{\text{current}}}{P_{\text{baseline}}}) - E_{\text{actual}} \right] \times \text{Effective Tariff}_{\text{FESCO}} + \Delta \text{GenFuel}_{\text{savings}}$$

1. **Baseline Freeze:** The 90-day pre-pilot average specific energy consumption ($\text{kWh} / \text{kg of yarn}$ or $\text{kWh} / \text{meter of fabric}$) is frozen and countersigned by the Mill Resident Director.
2. **Weather & Production Normalization:** Baseline load is normalized against monthly spinning frame spindle hours and ambient temperature (cooling tower/chiller efficiency degradation).
3. **Dispute Resolution Threshold:** If the calculated savings variance is within $\pm 2.5\%$, the baseline figure stands unchallenged. If variance exceeds $15\%$ divergence from operational expectations, a joint physical audit is triggered within 5 working days.

---

## 2. Industrial Data Governance, Telemetry Ownership & Confidentiality

Industrial energy telemetry reveals proprietary operational intelligence, including:
- Production volumes (derived from spinning motor load profiles)
- Shift schedules, worker downtime, and maintenance outages
- High-efficiency equipment capabilities and process choke points

### 2.1 Non-Negotiable Data Covenants

1. **Customer Ownership:** All raw electrical telemetry ($V, I, kW, kVAR, Hz, THD, PF$) collected from the mill substation remains the exclusive proprietary property of the customer.
2. **WattWise Derived Rights:** WattWise retains a perpetual, royalty-free, anonymized license to use aggregated telemetry vectors exclusively for training machine learning forecasting models and provincial grid stability indexes.
3. **Zero Cross-Mill Leakage:** Models trained on Customer A’s feeder characteristics shall never expose raw time-series data or identifiable feature weightings to Customer B. Tenant data isolation is physically enforced via PostgreSQL Row-Level Security (RLS) and schema partition per NTN.
4. **Data Sovereign Hosting:** All primary telemetry databases are hosted within ISO 27001-certified cloud infrastructure with replication in Pakistani local tier-3 data centers (PTCL/Nayatel) to comply with data sovereignty mandates and the Prevention of Electronic Crimes Act (PECA 2016).

---

## 3. Hardware Bailment, Custody & Retrieval Agreement

All WattWise Edge Hubs, Rogowski coils, Modbus RS-485 to Ethernet gateways, and cellular telemetry terminals are deployed under legal **Bailment** (Amanat / Loan for Use):

### 3.1 Custody & Care Obligations
- **Ownership:** Title and ownership of all hardware components remain 100% with WattWise Private Limited. Hardware is never deemed a fixture of the mill premises.
- **Customer Duty of Care:** The mill provides clean, un-switched 220V AC auxiliary power, dust-free enclosure spacing, and physical security against tampering, water egress, or mechanical damage.
- **Accidental Damage vs Normal Wear:** In the event of catastrophic lightning strike or substation switchgear fire not caused by WattWise hardware, replacement hardware is supplied at cost (Rs. 45,000 per hub). Tampering or deliberate bypass triggers full hardware replacement liability against the mill.

### 3.2 Post-Termination Hardware Retrieval Protocol
1. Upon contract termination or expiry of the free shadow audit without conversion, the mill shall grant WattWise field technicians access within **7 business days**.
2. De-installation requires zero production downtime: Rogowski coils are unclipped from transformer busbars during normal operation without de-energizing.
3. A joint De-installation Handover Certificate is executed on site; security deposits are refunded via cross-cheque within 3 banking days of hardware return.

---

## 4. PSQCA & Substation Electrical Safety Compliance

Operating inside 11kV/415V textile substations requires strict adherence to Pakistan Standards and Quality Control Authority (PSQCA) technical regulations and National Electric Power Regulatory Authority (NEPRA) safety codes.

### 4.1 Applicable Engineering Standards

```
+---------------------------------------------------------------------------------+
|                     SUBSTATION SAFETY & COMPLIANCE ARCHITECTURE                 |
+---------------------------------------------------------------------------------+
|  COMPLIANCE VECTOR        | APPLICABLE STANDARD | ENFORCEMENT PROTOCOL          |
+---------------------------+---------------------+-------------------------------+
| Current Sensors           | IEC 61869-2         | Split-core / Rogowski coils   |
|                           | (PSQCA 161869)      | Galvanic isolation > 3.0 kV   |
| Enclosure & Switchgear    | IEC 60947-1 / IP65  | Self-extinguishing ABS,       |
|                           |                     | flame retardant UL94-V0       |
| Auxiliary Power Supply    | IEC 61010-1 Cat III | 1000V surge suppression,      |
|                           |                     | fused disconnect block (2A)   |
| Electromagnetic Shielding | IEC 61000-6-2/4     | Industrial immunity against   |
|                           |                     | VFD high-frequency noise      |
+---------------------------+---------------------+-------------------------------+
```

### 4.2 Chief Electrical Inspector Punjab / Sindh Protocol
- **Installation Permit:** Installations strictly interface on the secondary (415V/230V) low-voltage metering side. Primary 11kV medium-voltage lines are **never** tapped directly.
- **Certification:** Every installation is supervised by a PEC (Pakistan Engineering Council) registered electrical engineer and countersigned by the Mill's licensed substation supervisor.
- **Safety Interlock:** All voltage taps utilize IP20 touch-proof ceramic fuse carriers rated at 2 Amperes / 500V, ensuring any internal gateway fault vaporizes the fuse within 10 milliseconds without tripping the plant main breaker.

---

## 5. Taxation & Revenue Authority Structuring (FBR / PRA / SRB)

Billing industrial enterprises in Pakistan requires precise tax compliance to prevent cash flow lock-up due to withholding tax deductions and provincial sales tax disputes.

### 5.1 Tax Rates & Statutory Classifications

```
+---------------------------------------------------------------------------------------+
|  TRANSACTION COMPONENT     | TAXING BODY       | RATE    | COMPLIANCE NOTES           |
+----------------------------+-------------------+---------+----------------------------+
| Software Subscription SaaS | Punjab Revenue    | 16.0%   | Classified under PRA       |
|                            | Authority (PRA)   |         | Code 9815.6000 (Software)  |
| Software Subscription SaaS | Sindh Revenue     | 13.0%   | Tariff heading 9815.6000   |
| (Karachi deployments)      | Board (SRB)       |         | Telemetry & IT services    |
| Corporate Income Tax       | Federal Board of  | Exempt /| IT Services Active List    |
| Withholding (Sec 153-1b)   | Revenue (FBR)     | 3.0%    | Withholding tax exemption  |
+----------------------------+-------------------+---------+----------------------------+
```

### 5.2 Withholding Tax (WHT) Elimination Protocol
1. **Active Taxpayer List (ATL):** WattWise maintains 100% ATL compliance under NTN registration, preventing punitive non-filer deduction rates (16%).
2. **FBR Exemption Certificate:** WattWise applies annually for an exemption / concession certificate under Section 153 of the Income Tax Ordinance 2001 for IT and software enabled services, capping client withholding at 3% or 0%.
3. **Withholding Deduction Challan:** The client finance team is legally bound by the MSA to furnish CPR (Computerized Payment Receipt) challans within 10 business days of any withholding deduction, ensuring seamless tax credit reconciliation with FBR.
