# Reo.Dev — CRM Import Prototype

Interactive prototype for the **HubSpot → Reo CRM Account Import** feature (V0 shell + V1 import flow).

```bash
npm install && npm run dev
# → http://localhost:3000
```

---

## The Problem

Reo detects companies via 1st-party developer signals (GitHub, docs, telemetry) and pushes them to HubSpot. But **companies already in a customer's HubSpot that Reo hasn't detected** have zero visibility — even though Reo has valuable 3P intelligence on them.

Result: GTM teams can only use Reo for the ~80 accounts it found organically, not the other 420 in their pipeline.

---

## What This Feature Does

Import companies from HubSpot into Reo and enrich them with Reo's **3rd-party data** — even without any 1st-party developer signals.

| Data surfaced | Source |
|---|---|
| Firmographics (industry, employees, revenue, funding) | Reo 3P DB |
| Technographics + ICP fit score | Reo 3P DB |
| Hiring signals (open roles by tech, hiring trends) | LinkedIn / job boards |
| Known developers at the company | Reo 625M+ signal DB |
| Economic buyers (VP/CTO/Director) | Reo Buyer DB |

**Not available** until 1P signals arrive: Activity Score, Activity Timeline, Dev Funnel Stage.

---

## Key Flows

### 1. Setup (one-time)
`Settings → Integrations → HubSpot → Configure → Import tab`

- **Re-authorize** with HubSpot to grant read scopes (`crm.objects.companies.read`)
- Choose what to import:
  - All companies
  - **By CRM lifecycle stage** (Lead / MQL / SQL / Opportunity etc.) — recommended
  - Paste specific domains
- Set sync schedule (daily / weekly) or trigger manually

### 2. Accounts list
CRM-imported accounts appear alongside signal-detected accounts. Visual differences:

| Column | Signal account | CRM-imported account |
|---|---|---|
| Tags | New Lead / Dev Funnel | **CRM Import** (orange) |
| Activity Score | High / Medium / Low | **N/A** (grey) |
| Dev Funnel | Evaluating / Building | **--** |
| Last Activity | Date | **--** |

New filters: **Has Developer Signals** (Yes / No) and **Account Source** (Reo Detected / CRM Import / Both).

### 3. Account detail (CRM-imported)
- **Overview**: full firmographics + ICP fit + tech stack + `Source: HubSpot CRM Import` field
- **Activity Insights**: empty state banner nudging toward product integrations
- **Activity Timeline**: "Imported from HubSpot [CRM]" birth event as first entry
- **Hiring Signals**: fully populated from 3P data
- **Active Developers**: Reo DB matches (no activity scores)
- **More Prospects**: fully functional buyer discovery

### 4. Signal merge (passive)
When Reo later detects a 1P signal for a CRM-imported account:
- Auto-merges silently — no duplicate created
- Account Source updates to **Both**
- Activity Score, Dev Funnel, Timeline all activate
- Account starts counting against quota

---

## Pricing model

CRM-imported accounts **do not count against the account quota** while they're 3P-only. They start counting when 1P signals arrive — natural expansion trigger: *"45 CRM accounts now showing developer signals — upgrade to track all of them."*

Sidebar shows: `87 / 100 signal accounts (+ 420 CRM enriched)`

---

## Prototype Screens

| Route | What's there |
|---|---|
| `/dashboard/accounts` | Accounts table with mixed signal + CRM-import accounts, interactive filters |
| `/dashboard/integration` | Integrations grid |
| `/dashboard/integration/hubspot` | Full import setup flow (reauth → source → schedule) |
| `/dashboard/segments` | Segments with new "CRM Imported Accounts" magic segment |

---

## Tech

Next.js 14 · TypeScript · Tailwind CSS · Recharts · Lucide icons · all mock data
