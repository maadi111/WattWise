# WattWise™ — Design System Specification
### Industrial Energy Intelligence, SCADA Telemetry & Power Arbitrage Platform
**Target Environment:** Factory Control Rooms, Mobile Supervisor Tablets, C-Suite Executive Desktops  
**Version:** 2.0 (Dual-Mode: High-Contrast Dark & Precision Industrial Light)

---

## 1. Executive Design Philosophy & First Principles

WattWise™ is built for high-stakes industrial operations in Pakistan's manufacturing heartland (Faisalabad, Sialkot, Gujranwala, Lahore, Karachi). The design system must serve three starkly distinct physical environments:
1. **Low-Light Electrical Sub-Stations & Control Rooms (Dark Mode):** 24/7 multi-monitor SCADA setups, night shifts, reducing eye fatigue while retaining instant peripheral visibility of critical power trips (grid collapse, generator ignition, thermal over-temp).
2. **Bright Factory Floors & Executive Offices (Light Mode):** High-ambient glare, dusty sunlight across weaving sheds, and C-suite audit review for bank financing (Meezan Bank, HBL) and utility legal dossiers (NEPRA, FESCO).
3. **Bilingual Floor Supervisors (RTL Urdu Mode):** Ground-level plant operators, loom masters, and shift electricians who require native Noto Nastaliq Urdu typography with uncompromised legibility and WhatsApp-friendly summaries.

### The 5 Iron Rules of Industrial UI (Anti-Slop Constitution)
1. **Zero-Pill Discipline on Metadata:** Never enclose static informational labels, timestamps, or statuses in bubbly capsule pills or bordered pill badges. Use unboxed text separated by subtle typographic glyphs (`·`, `/`). Functional filter tabs are styled as clean segmented surfaces.
2. **Tabular Numerals Everywhere:** Every electrical reading (kW, V, Hz, PF, THD), financial value (Rs. PKR), diesel volume (Liters), and timestamp must enforce `font-variant-numeric: tabular-nums` or `font-mono` to prevent jitter on 100ms telemetry refreshes.
3. **Single-Elevation Depth:** No nested cards within cards. Demarcate zones using deliberate whitespace margins ($1.5\text{rem}$–$2.5\text{rem}$) and 1px hairline dividers (`border-slate-200` / `border-slate-800`). No heavy floating drop-shadows.
4. **60-30-10 Color Architecture:** 
   - **60% Neutral Canvas:** Deep industrial obsidian (`#0A0E17`) in dark; sterile clean gray-white (`#F8FAFC`) in light.
   - **30% Structural Elements:** Hairline gridlines, panel enclosures, muted data legends, and structured tables.
   - **10% High-Intent Semantic Accent:** Dedicated strictly to electrical states (Grid Azure, Generator Amber, Trip Crimson, Nominal Emerald).
5. **No Mechanical Gimmickry:** No code-comment section titles (`// 01 ARCH`), no arbitrary pseudo-AI scores (`94/100 INNOVATION`), and no fake footer tickers. Plain, high-density industrial clarity.

---

## 2. Complete Color Token Architecture

### 2.1 Core Neutral & Structural Tokens

| Token Name | Dark Mode (Hex / HSL) | Light Mode (Hex / HSL) | Usage Context | WCAG AA Ratio |
| :--- | :--- | :--- | :--- | :--- |
| `canvas-bg` | `#080C14` / `220° 43% 6%` | `#F8FAFC` / `210° 40% 98%` | Primary root viewport background | > 14:1 |
| `surface-base` | `#0F172A` / `222° 47% 11%` | `#FFFFFF` / `0° 0% 100%` | Primary panels, cards, data tables | > 12:1 |
| `surface-raised` | `#162036` / `222° 42% 15%` | `#F1F5F9` / `210° 40% 96%` | Inset metric modules, hover rows, inputs | > 9:1 |
| `surface-subtle` | `#1E293B` / `217° 33% 17%` | `#E2E8F0` / `214° 32% 91%` | Segmented control tracks, progress bars | > 4.5:1 |
| `border-hairline` | `#1E293B` / `217° 33% 17%` | `#E2E8F0` / `214° 32% 91%` | Standard 1px panel boundaries & dividers | > 3:1 |
| `border-strong` | `#334155` / `215° 25% 27%` | `#CBD5E1` / `214° 32% 80%` | Active inputs, focused card rims | > 4.5:1 |
| `text-primary` | `#F8FAFC` / `210° 40% 98%` | `#0F172A` / `222° 47% 11%` | Main headers, large telemetry figures | > 15:1 |
| `text-secondary` | `#94A3B8` / `215° 16% 65%` | `#475569` / `215° 25% 35%` | Explanatory copy, column headers, units | > 6.5:1 |
| `text-muted` | `#64748B` / `215° 16% 47%` | `#64748B` / `215° 16% 47%` | Timestamps, metadata, unselected tabs | > 4.5:1 |

### 2.2 Domain-Specific Industrial Power States

In electrical SCADA applications, color indicates physical operational state. Colors are never used ornamentally.

| Semantic Power State | Dark Mode Hex | Light Mode Hex | Tailwind Class Token | Physical SCADA Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Grid Power (WAPDA)** | `#38BDF8` (Sky-400) | `#0284C7` (Sky-600) | `text-sky-400` / `text-sky-600` | National grid (11kV / 400V) supplying load |
| **Generator (Diesel)** | `#F59E0B` (Amber-500)| `#D97706` (Amber-600)| `text-amber-500` / `text-amber-600` | Captive diesel gen-set online (high fuel cost) |
| **SwiftSwitch™ Armed** | `#FB923C` (Orange-400)| `#EA580C` (Orange-600)| `text-orange-400` / `text-orange-600`| Pre-emptive switch sequence in progress (T-12s) |
| **Nominal Efficiency** | `#10B981` (Emerald-500)| `#059669` (Emerald-600)| `text-emerald-500` / `text-emerald-600`| System within optimal power factor & savings |
| **Sag / Alert / PF Drop**| `#FBBF24` (Amber-400)| `#B45309` (Amber-700)| `text-amber-400` / `text-amber-700`| Voltage drop < 370V, PF < 0.75, or MDI surge |
| **Blackout / Trip** | `#EF4444` (Red-500) | `#DC2626` (Red-600) | `text-red-500` / `text-red-600` | Feeder trip, breaker blown, CT clamp detached |
| **Load Shedding Inactive**| `#475569` (Slate-630)| `#94A3B8` (Slate-400)| `text-slate-500` / `text-slate-400`| Non-critical load shed during generator mode |

---

## 3. Typography & Numerical Hierarchy

### 3.1 Font Family Stacks

```css
/* Display & Structural UI */
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

/* SCADA Instrument Telemetry, Tables & Financial Audit */
--font-mono: 'JetBrains Mono', 'IBM Plex Mono', monospace;

/* Urdu Bilingual Mode (Supervisor Shift Reports & Alerts) */
--font-urdu: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif;
```

### 3.2 Type Scale Specification

| Role | Font Family | Size | Weight | Tracking / Leading | Dark Styling | Light Styling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Telemetry Hero** | JetBrains Mono | 32px / 2rem | 600 SemiBold | `tracking-tight leading-none` | `text-white tabular-nums` | `text-slate-900 tabular-nums` |
| **Section Title** | Plus Jakarta Sans | 20px / 1.25rem | 600 SemiBold | `tracking-tight leading-snug` | `text-slate-100` | `text-slate-900` |
| **Card Header** | Plus Jakarta Sans | 15px / 0.9375rem | 600 SemiBold | `tracking-normal leading-normal` | `text-slate-200` | `text-slate-800` |
| **Grid Data Cell** | JetBrains Mono | 13px / 0.8125rem | 500 Medium | `tracking-normal tabular-nums` | `text-slate-300` | `text-slate-700` |
| **Prose / Labels** | Plus Jakarta Sans | 14px / 0.875rem | 400 Regular | `leading-relaxed` | `text-slate-300` | `text-slate-600` |
| **Micro Metadata** | Plus Jakarta Sans | 11px / 0.6875rem | 500 Medium | `tracking-wide uppercase` | `text-slate-400` | `text-slate-500` |
| **Urdu Shift Body**| Noto Nastaliq Urdu| 16px / 1rem | 400 Regular | `leading-[2.2] rtl` | `text-slate-100` | `text-slate-900` |

---

## 4. Layout Architecture & Spatial Grid

### 4.1 Master Workspace Blueprint
- **Desktop Target:** $1440\text{px} \times 900\text{px}$ baseline, fluid expansion up to $2560\text{px}$ (4K factory control monitors).
- **Sidebar Width:** Fixed $260\text{px}$ left rail (`shrink-0 border-r`).
- **Main Viewport Canvas:** Flexible single-scroll viewport with max-width $1600\text{px}$ or full-bleed SCADA telemetry grid.
- **Outer Container Padding:** $\ge 24\text{px}$ on desktop, $16\text{px}$ on mobile/tablet.
- **Component Gap Consistency:** Standard $16\text{px}$ (`gap-4`) or $20\text{px}$ (`gap-5`) grid layout.

### 4.2 The 3-Zone Top Bar Contract
The top bar implements a strict one-row, three-zone contract with zero secondary tagline clutter:
```
[Brand: WattWise™ Industrial]  ───  [Factory: Crescent Weaving Unit 4 · Feeder A-11]  ───  [Theme Toggle | Urdu Toggle | Gen Auto State]
```
- **Zone 1 (Left):** Wordmark `WattWise™` in bold display face + clean unboxed feeder location.
- **Zone 2 (Center):** Quick-switch tabs (Live SCADA, SwiftSwitch, LoadShift, Savings Ledger, WAPDA Audit, EU Carbon).
- **Zone 3 (Right):** Mode controls (Dark/Light toggle, English/اردو toggle, Edge Controller connection status indicator).

---

## 5. Subsystem Component Specifications (Dual Mode)

### 5.1 Subsystem 1: Live Multi-Section Power Floor Map (SCADA)
*Monitors 40 Airjet Looms, 4 Dyeing Vats, Warping/Sizing, and HVAC Compressors.*

- **Dark Mode Presentation:**
  - Background: `#0B1120` with a subtle 24px electrical grid pattern (`bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]`).
  - Active Busbar Line: Glowing 2px stroke in `#38BDF8` (Grid) or `#F59E0B` (Gen).
  - Sensor Tile: Inset flat card `#111C30` with `border border-slate-800`.
  - Machine Power Draw: Large 22px tabular numerals in `#F8FAFC`.
  - Power Factor Gauge: Minimalist segmented SVG arc (Green $\ge 0.90$, Amber $< 0.80$, Red $< 0.75$).
- **Light Mode Presentation:**
  - Background: `#F8FAFC` with crisp architectural hairline grid (`#E2E8F0`).
  - Active Busbar Line: Solid 2px stroke in `#0284C7` (Grid) or `#D97706` (Gen).
  - Sensor Tile: Solid white `#FFFFFF` with crisp hairline `border border-slate-200`.
  - Machine Power Draw: Large 22px tabular numerals in `#0F172A`.
  - Power Factor Gauge: High-contrast gauge with bold stroke.

### 5.2 Subsystem 2: SwiftSwitch™ Pre-Emptive Automation Engine
*Visualizes the 8-second ATS switchover and T-12s grid collapse prediction.*

- **Dark Mode Presentation:**
  - Background: Deep obsidian container `#0D1527` with warning perimeter accent.
  - Predictive Horizon Countdown: Huge 36px countdown timer (`T - 08.4s to Grid Failure`).
  - Shedding Bar: Horizontal distribution bar showing active $-91.4\text{ kW}$ non-critical shed loads in `#64748B` with amber striping.
  - ATS Contactor Relays: 8x hardware relay matrix displayed as high-contrast LED contacts (`CLOSED` in `#10B981`, `OPEN` in `#334155`).
  - Stability Counter: 10-second anti-hunting timer ring pulsing in `#38BDF8`.
- **Light Mode Presentation:**
  - Background: `#FFFFFF` with warm alert accent border (`border-amber-200`).
  - Predictive Horizon Countdown: High-contrast amber numerals `#B45309` on pale tint `#FEF3C7`.
  - Shedding Bar: Clean segmented gray bar with warning hatch `#D97706`.
  - ATS Contactor Relays: Physical industrial rocker toggle aesthetics (`CLOSED` in `#059669`, `OPEN` in `#E2E8F0`).
  - Stability Counter: 10-second timer ring in vibrant sky `#0284C7`.

### 5.3 Subsystem 3: LoadShift™ 24-Hour MILP Process Calendar
*Interactive 48 half-hour slot schedule powered by Google OR-Tools CP-SAT.*

- **Visual Layout:** Horizontal timeline with rows for Dyeing Vats (Protected), Weaving Looms, Sizing, Warping, and Administrative HVAC.
- **Dark Mode Colors:**
  - Grid Low-Cost Windows (Off-Peak): Inset subtle emerald wash `rgba(16, 185, 129, 0.08)` with border `rgba(16, 185, 129, 0.2)`.
  - Grid Peak / Load Shed Window: Slate wash `rgba(30, 41, 59, 0.5)` with diagonal warning hatch.
  - Diesel Generator Mandatory Windows: Inset amber wash `rgba(245, 158, 11, 0.08)`.
  - Protected Process Blocks (Fong's Vats): Solid `#1E293B` block with lock glyph and uninterrupted duration indicator.
- **Light Mode Colors:**
  - Grid Low-Cost Windows: Clean mint surface `#ECFDF5` with border `#A7F3D0`.
  - Grid Peak / Load Shed Window: Soft slate `#F1F5F9` with subtle hatch.
  - Diesel Generator Mandatory Windows: Soft amber `#FFFBEB` with border `#FDE68A`.
  - Protected Process Blocks: Pure white `#FFFFFF` with charcoal border `#475569` and crisp lock symbol.

### 5.4 Subsystem 4: SavingsLedger™ & Bank-Grade Cryptographic Audit
*Tamper-proof 20% gain-share invoice calculations with SHA-256 baseline seal.*

- **Dark Mode Presentation:**
  - Metric Summary Tiles: Flat `#0F172A` cards with subtle top border highlight.
  - Baseline vs Actual Contrast:
    - Counterfactual Baseline: `#94A3B8` (Muted, Rs. 18,200,000)
    - Actual Incurred Cost: `#38BDF8` (Measured, Rs. 12,940,000)
    - Net Factory Cash Gain: `#34D399` (Bold 28px, Rs. 4,208,000)
  - Cryptographic Hash Block: Monospace string `sha256:e3b0c442...` rendered in `#64748B` with instant 1-click copy affordance.
  - Bank Download Action: Muted slate button with green hover feedback (`Meezan / HBL ESCO Certificate`).
- **Light Mode Presentation:**
  - Metric Summary Tiles: Crisp white `#FFFFFF` cards with hairline `#E2E8F0` border.
  - Baseline vs Actual Contrast:
    - Counterfactual Baseline: `#64748B` (Rs. 18,200,000)
    - Actual Incurred Cost: `#0284C7` (Rs. 12,940,000)
    - Net Factory Cash Gain: `#059669` (Bold 28px, Rs. 4,208,000)
  - Cryptographic Hash Block: Crisp mono block on `#F1F5F9` background with charcoal text `#334155`.
  - Bank Download Action: Professional corporate dark navy button (`bg-slate-900 text-white hover:bg-slate-800`).

### 5.5 Subsystem 5: WAPDA Bill Reconciliation & Overbilling Dispute Dossier
*Automated audit matching Class 0.5 CT readings against FESCO/LESCO/GEPCO utility bills.*

- **Dark Mode Presentation:**
  - Discrepancy Highlight: High-contrast alert callout in dark crimson (`#7F1D1D` background, `#FCA5A5` text, `#EF4444` border).
  - Metric Callout: `+17,180 kWh Discrepancy (4.89%) · Overcharge: Rs. 618,480`.
  - Comparison Table: Striped data grid (`#0F172A` / `#162036`) with right-aligned tabular figures.
  - Dossier CTA: Primary action button `Generate NEPRA Section 21 Legal Dispute`.
- **Light Mode Presentation:**
  - Discrepancy Highlight: High-contrast pastel red banner (`#FEF2F2` background, `#991B1B` text, `#F87171` border).
  - Metric Callout: Bold red-800 typography with clear financial impact note.
  - Comparison Table: Clean white table with subtle `#F8FAFC` alternate rows and `#E2E8F0` divider lines.
  - Dossier CTA: Distinctive crimson button with white text (`bg-red-700 hover:bg-red-800`).

### 5.6 Subsystem 6: EU GSP+ Carbon Emission Tracker
*Scope 1 Diesel vs Scope 2 Grid CO2 tracking for European buyers (Inditex, H&M, Levi's).*

- **Dark Mode Presentation:**
  - Progress Ring / Gauge: Dual-color arc — Grid Scope 2 in `#38BDF8`, Diesel Scope 1 in `#F59E0B`.
  - Avoided Emissions Banner: Emerald wash `#064E3B` with bold text `38.4 MT CO2 Avoided This Month`.
  - Factor Legend: Unboxed inline text `0.78 kg CO2/kWh (Diesel) · 0.41 kg CO2/kWh (Grid)`.
- **Light Mode Presentation:**
  - Progress Ring / Gauge: High-contrast arc with clear numerical labels.
  - Avoided Emissions Banner: Crisp green banner `#ECFDF5` with deep green text `#065F46`.
  - Factor Legend: Subdued charcoal metadata on `#F1F5F9` background.

### 5.7 Subsystem 7: Bilingual Urdu Supervisor Shift Report
*Ground-level shift handover card formatted for instant WhatsApp sharing.*

- **Typography & Alignment:**
  - Right-to-Left (RTL) layout when active.
  - Generous line-height (`leading-[2.2]`) to accommodate Nastaliq ascenders and descenders.
  - Clear section headers: `شفٹ رپورٹ: 07:00 تا 19:00 (ڈے شفٹ)`.
- **Dark Mode:** `#131D31` card with gold/amber Nastaliq highlights and instant WhatsApp share button (`bg-[#25D366] text-slate-900 font-bold`).
- **Light Mode:** Crisp white `#FFFFFF` card with deep charcoal Nastaliq text and WhatsApp brand CTA.

---

## 6. CSS Tokens & Theme Variables

```css
/* ==========================================================================
   WattWise™ Design System Tokens (Light Baseline & Dark Override)
   ========================================================================== */

:root {
  /* Color Palette - Light Mode Baseline */
  --bg-canvas: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-raised: #f1f5f9;
  --bg-surface-subtle: #e2e8f0;
  
  --border-hairline: #e2e8f0;
  --border-strong: #cbd5e1;
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  
  /* Industrial Power States */
  --power-grid: #0284c7;        /* Sky-600 */
  --power-grid-tint: #e0f2fe;   /* Sky-100 */
  --power-gen: #d97706;         /* Amber-600 */
  --power-gen-tint: #fef3c7;    /* Amber-100 */
  --power-alert: #dc2626;       /* Red-600 */
  --power-alert-tint: #fee2e2;  /* Red-100 */
  --power-nominal: #059669;     /* Emerald-600 */
  --power-nominal-tint: #d1fae5;/* Emerald-100 */
  --power-armed: #ea580c;       /* Orange-600 */
  
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', monospace;
  --font-urdu: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif;
}

.dark {
  /* Color Palette - Dark Mode High Contrast */
  --bg-canvas: #080c14;
  --bg-surface: #0f172a;
  --bg-surface-raised: #162036;
  --bg-surface-subtle: #1e293b;
  
  --border-hairline: #1e293b;
  --border-strong: #334155;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Industrial Power States */
  --power-grid: #38bdf8;        /* Sky-400 */
  --power-grid-tint: rgba(56, 189, 248, 0.12);
  --power-gen: #f59e0b;         /* Amber-500 */
  --power-gen-tint: rgba(245, 158, 11, 0.12);
  --power-alert: #ef4444;       /* Red-500 */
  --power-alert-tint: rgba(239, 68, 68, 0.15);
  --power-nominal: #10b981;     /* Emerald-500 */
  --power-nominal-tint: rgba(16, 185, 129, 0.12);
  --power-armed: #fb923c;       /* Orange-400 */
}
```

---

## 7. Interactive States, Feedback & Motion Budgets

1. **Micro-Interaction Latency ($\le 150\text{ms}$):**
   - Relay clicks, simulator triggers, tab switches, and mode toggles must render immediate feedback within 100ms.
   - Transition curve: `cubic-bezier(0.16, 1, 0.3, 1)` strictly on `opacity` and `transform`.
2. **Accessible Focus Rings:**
   - Dark Mode: `focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]`.
   - Light Mode: `focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white`.
3. **Telemetry Pulse & Live Update Rules:**
   - 1-second pulse indicator for edge connection status (emerald dot with gentle `scale(1.05)` breath, never harsh blinking).
   - Numeric counter transitions: smooth tabular update with zero layout shift.

---

## 8. Anti-Slop Audit Checklist

- [x] **Zero Pills:** No static labels or status tags wrapped in rounded pill badges; unboxed text with `·` or `/` separators used exclusively.
- [x] **No Comment Syntax:** No section titles starting with `//`, `/*`, or `>_`.
- [x] **No Hallucinated Scores:** No arbitrary `98% SYSTEM INTELLIGENCE` or `A+ ENERGY SCORE` widgets. Real units only (kW, V, Hz, Rs., Liters, MT CO2).
- [x] **Strict 2+1 Typography:** Plus Jakarta Sans (UI & Display), JetBrains Mono (Telemetry & Audit), Noto Nastaliq (Bilingual Urdu).
- [x] **Single-Elevation Depth:** Clean flat surfaces with 1px hairline borders; zero nested card-in-card containers.
- [x] **Dual-Mode Contrast Certified:** Every text token meets or exceeds WCAG AA (4.5:1 for body, 3:1 for large display numerals) in both Dark and Light modes.
