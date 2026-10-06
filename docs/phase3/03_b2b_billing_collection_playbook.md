# WATTWISE™ PHASE 3 — FIRST REVENUE: BILLING & COLLECTION PLAYBOOK
## Weeks 5–8: From Live Automation to Paid Invoice (Section 03)

---

## 1. The First Month Billing Lifecycle

```
[ Day 1: SwiftSwitch Live ] ──▶ [ Freeze Baseline in PostgreSQL (SHA-256) ]
                                              │
                                              ▼
                             [ Continuous 30-Day Ingest & Audit ]
                                              │
                                              ▼
                             [ Day 30: Compute Verified Savings ]
                             (Baseline Rs. 18.2M - Actual Rs. 12.94M = Rs. 5.26M)
                                              │
                                              ▼
                             [ In-Person Trust Walkthrough with Owner ]
                                              │
                                              ▼
                             [ Issue FBR Tax Invoice + PRA 16% ]
                             (Rs. 1,052,000 + Rs. 168,320 Tax = Rs. 1,220,320)
                                              │
                                              ▼
                             [ Meezan Bank IBFT / Cross-Cheque Settlement ]
```

---

## 2. The First Invoice Psychological Trust Moment

In Pakistani manufacturing, sending an invoice via email without in-person review leads to immediate payment delays ("review kar rahe hain").

**Never email the first invoice without an in-person walkthrough.**

### The 4-Step In-Person Walkthrough Script:
1. **Open the Physical Savings Certificate:** Hand the mill owner a printed, laminated WattWise Verified Savings Certificate.
2. **Review the Counterfactual Baseline:**
   > *"Tariq Sahib, let's examine the baseline first. Our Prophet model estimated that based on September 2025 historical data and weather patterns, your facility would have spent Rs. 18,200,000 without WattWise."*
3. **Review the Measured Utility & Diesel Spend:**
   > *"Now look at your actual FESCO bill plus diesel fuel receipts: exactly Rs. 12,940,000. That is a documented reduction of Rs. 5,260,000."*
4. **Present the Gain-Share Breakdown:**
   > *"Under our agreement, 80% (Rs. 4,208,000) remains entirely in your company account. WattWise's 20% performance share is Rs. 1,052,000. We made you Rs. 4.2 Million in profit this month."*
5. **Only Then Hand Over the FBR Invoice:** The owner views the invoice not as an expense, but as a small performance commission on new money created.

---

## 3. Pakistani B2B Payment Collection Protocol

### Primary Channel: Inter-Bank Funds Transfer (IBFT / RTGS)
* **Designated Account:** Meezan Bank Limited (Islamic Corporate Banking)
* **Account Title:** WattWise Pakistan (Pvt.) Limited
* **IBAN:** `PK42 MEZN 0001 0293 8472 0192`
* **Advantage:** Instant settlement confirmation via 1Link RTGS; automatic reconciliation in PostgreSQL.

### Secondary Channel: Crossed Corporate Cheque
* For mills with traditional treasury sign-offs requiring two physical signatures.
* Payable to: `WattWise Pakistan (Pvt.) Limited — Account Payee Only`.
* Field CSR collects the cheque physically on Day 7 post-invoice.

### Payment Terms & Follow-Up Ladder:
* **Payment Terms:** Net 15 Days from invoice presentation.
* **Day 5:** Friendly WhatsApp check-in to Chief Financial Officer / Accounts Head.
* **Day 10:** Polite phone call confirming voucher has been queued for signing.
* **Day 15 (Due Date):** In-person visit by Field CSR with official tax receipt.
* **Grace Period:** 7 days before issuing an automated notification. Note: Never threaten to disconnect power or switch off relay automation during commercial disputes; software simply reverts to passive reporting.
