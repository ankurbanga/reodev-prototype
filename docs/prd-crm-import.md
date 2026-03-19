# PRD: CRM-to-Reo Account Import & 3P Enrichment (HubSpot V1)

## Context

Today Reo.Dev's HubSpot integration is **one-directional for accounts**: Reo detects companies via 1st-party developer signals (GitHub, docs, telemetry, etc.) and pushes them to HubSpot. But there's a large blind spot -- **companies already in the customer's HubSpot that Reo hasn't detected via 1P signals**. These accounts have no visibility in Reo, even though Reo possesses valuable 3rd-party intelligence on them (firmographics, technographics, LinkedIn hiring signals, developers from Reo's DB).

This means GTM teams can't use Reo to enrich or prioritize their existing pipeline -- only net-new accounts that Reo discovers. This feature closes that gap.

---

## Problem Statement

**For SDR/AE teams**: "I have 500 accounts in my HubSpot pipeline. Reo shows me great intel for the 80 it detected via signals -- but for the other 420, I'm blind. I want Reo's hiring signals, technographics, ICP fit, and developer data for those too."

**For RevOps**: "Our CRM data is incomplete. Reo has 3P enrichment data that could fill in gaps across our entire HubSpot account base -- not just the accounts Reo found organically."

**For Marketing**: "I want to run campaigns against my full account list, prioritized by Reo's ICP scoring and enrichment -- including accounts that haven't shown developer signals yet."

---

## Goals

1. Allow customers to **import companies from HubSpot into Reo** for 3P enrichment
2. Surface **firmographics, technographics, hiring signals, ICP fit, and developer/buyer data** for imported accounts -- even without 1st-party developer activity
3. Enable a **continuous sync** so new HubSpot additions flow into Reo automatically
4. Seamlessly **merge 1P signals** when Reo later detects developer activity for an imported account
5. Maintain the **enrichment write-back** to HubSpot via the existing export field mapping

## Non-Goals (V1)

- Salesforce or Attio import (future, but HubSpot-only for V1)
- Real-time / webhook-based sync (daily batch is sufficient for V1)
- New pricing tier design (limit model is defined but packaging is out of scope)

---

## User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | RevOps lead | Import my HubSpot company lists into Reo | I can enrich my CRM accounts with Reo's 3P data |
| 2 | SDR | See hiring signals and ICP fit for my pipeline accounts | I can prioritize which accounts to call this week |
| 3 | SDR | Filter the Accounts view to show accounts with and without developer signals | I know which accounts are signal-rich vs. 3P-enriched only |
| 4 | RevOps lead | Have new HubSpot additions automatically sync to Reo daily | I don't need to manually re-import |
| 5 | Marketing | Segment and target CRM-imported accounts by ICP fit and technographics | I can run ABM campaigns against my full pipeline |
| 6 | AE | See which CRM accounts start showing 1P developer signals | I know when a stalled deal has renewed developer interest |

---

## Feature Specification

### 1. HubSpot Import Configuration (Settings)

**Location**: HubSpot integration settings page (`/dashboard/integration` -> HubSpot -> Configure)

**UX change**: Restructure the existing page into **two tabs** below the Overview section:

```
+-----------------------------------------------------+
| Overview                                            |
| Status: * Active    Connected on: 05-Feb-2025       |
| HubSpot to Reo.Dev: * Connected                    |
| Reo.Dev to HubSpot: * Connected                    |
+-----------------------------------------------------+
| [^ Import (HubSpot -> Reo)] | [v Export (Reo -> HS)] |
+-----------------------------------------------------+
|                                                     |
|  Import tab content (NEW)                           |
|  -- or --                                           |
|  Export tab content (EXISTING, moved here)           |
|                                                     |
+-----------------------------------------------------+
```

#### OAuth & Connection State

The Import and Export tabs share the same HubSpot OAuth connection. No re-authentication is needed when one direction is already connected.

**Three connection states:**

| Export State | Import State | Import Tab Behavior |
|---|---|---|
| Not connected | Not connected | Shows "Connect HubSpot" CTA → OAuth flow |
| Connected, scopes sufficient | Not configured | Shows setup flow directly (no re-auth) |
| Connected, scope gap | Not configured | Shows inline "Re-authorize with HubSpot" prompt → re-consent |

> **Scope gap handling**: If the existing OAuth token was granted with fewer scopes than import needs (e.g. export-only token with `crm.objects.companies.write`), show: "Additional permissions required — To import accounts, Reo needs read access to your company records and lists. Please re-authorize." Re-consent does not require a new HubSpot account — it's a single re-approval.

**Disconnect behavior**: Disconnecting HubSpot from the Import tab revokes OAuth and stops daily sync. Imported accounts remain in Reo (they are full account citizens) but won't receive updates.

#### Import Tab -- Contents

**1.1 Import Toggle**
- Master toggle: `Enable CRM Account Import` (on/off)
- When OFF: import paused, existing imported accounts remain in Reo unchanged
- When ON: prompts for source selection

**1.2 Source Selection -- Simple Options**
Two mutually exclusive options:

- **Option A — Import all companies** (one checkbox)
  - "Import all companies from my HubSpot account"
  - Single click, no list selection needed

- **Option B — Select by domain list** (default)
  - User pastes or uploads a list of company domains (one per line, or CSV)
  - Reo validates domains and shows match preview
  - "Import X domains" confirmation button

> Note: We deliberately do NOT implement a HubSpot list picker. Reo is the enrichment company — we already know these companies. We only need the **Company Domain** from HubSpot to match records. No list fetching, no company record bulk-import needed.

**1.3 Match Preview (post-domain entry)**
After entering domains, show inline preview:
```
Domain validation:
• acme.com — matched ✓
• unknowncompany.io — not found in HubSpot (will be skipped)
• 2 domains valid, 1 skipped

[ Import X companies → ]
```

**1.4 Sync Settings**
- Sync frequency: **Daily** (fixed for V1, displayed as informational text: "Accounts are synced from HubSpot daily")
- Last synced timestamp displayed
- "Sync now" manual trigger button for on-demand refresh
- Import stats: `X accounts imported | Y enriched | Z pending enrichment`

**1.5 CRM Field Mapping (HubSpot -> Reo)** *(Optional, for display only)*
Since Reo already knows these companies, we only optionally pull CRM-specific fields from HubSpot for display context in Reo:

| HubSpot Field | Reo Use | Required |
|---|---|---|
| Company Domain | Match key | Yes (for initial match) |
| CRM Account Stage | Display in Reo account detail | No |
| CRM Deal Stage | Display in Reo account detail | No |
| CRM Owner | Display in Reo | No |

All other HubSpot fields are ignored. All enrichment data (firmographics, technographics, hiring signals, ICP fit, developer/buyer data) comes from Reo's existing 3P DB — no enrichment data is pulled from HubSpot.

The mapping is configured once and applies to all imports.

#### Export Tab

- Existing "Reo.Dev to HubSpot" section moves here unchanged
- Export & Sync Settings + Field Mapping (Accounts, Contacts, Deals) as-is

---

### 2. 3P Enrichment for Imported Accounts

When an account is imported from HubSpot, Reo enriches it using its 3rd-party data sources. The following data is surfaced:

| Data Category | Source | Fields |
|--------------|--------|--------|
| **Firmographics** | Reo 3P DB | Industry, Employee Range, Revenue, Funding Stage, Funding Amount, Founded Year, Country, State |
| **Technographics** | Reo 3P DB | Technology stack, ICP technologies match |
| **ICP Fit Score** | Reo scoring engine | Strong / Moderate / Weak (based on configured ICP criteria) |
| **Hiring Signals** | LinkedIn / job boards | Open positions by technology, hiring trends, ICP technology hires |
| **Developers** | Reo Developer DB | Known developers/employees at the company (from Reo's 625M+ signal DB, without needing 1P activity) |
| **Buyers** | Reo Buyer DB | Economic buyers (VP/CTO/Director) identified at the company |

**What is NOT available** (without 1P signals):
- Developer Activity Score (requires 1P events)
- Activity Timeline (requires 1P events)
- Activity Insights charts (requires 1P events)
- Dev Funnel Stage (requires 1P evaluation behavior)
- Activity Sources / Activity Trend

---

### 3. Accounts List View -- Filter & Display Changes

#### 3.1 New Filters

Two new filters added to the existing `+ Add Filter` dropdown:

**Filter: Has Developer Signals**
```
Has Developer Signals
  * Yes  -- accounts with 1st-party developer activity (GitHub, docs, telemetry, etc.)
  * No   -- accounts with 3P enrichment only (no 1P signals detected yet)
```

**Filter: Account Source**
```
Account Source
  * Reo Detected    -- accounts discovered by Reo via 1P developer signals
  * CRM Import      -- accounts imported from HubSpot
  * Both            -- accounts that were CRM-imported AND later detected via signals
```

The **Account Source** filter is important because it's the first time Reo has multiple account sources. Even when a CRM-imported account later gains 1P signals, its source remains "CRM Import" (or becomes "Both") -- preserving provenance.

The existing **Activity Score** (HIGH/MEDIUM/LOW/**N/A**) naturally provides depth differentiation:
- Accounts with 1P signals: Activity Score = HIGH (100) / MEDIUM (50) / LOW (5)
- CRM-imported, 3P-only accounts: Activity Score = **N/A** or **--**

#### 3.2 Table Column Behavior for 3P-Only Accounts

| Column | 3P-Only Account | Full Signal Account |
|--------|----------------|-------------------|
| Name | Displayed | Displayed |
| Tags | `CRM Import` tag (new tag type) | New Lead / Dev Funnel / Surge / etc. |
| ICP fit | Scored from 3P data | Scored from all data |
| Dev funnel | `--` or `Not tracked` | Exploring / Evaluating / Building / Deployed |
| Account activity score | `N/A` (grey) | HIGH (100) / MED / LOW |
| Activity sources (L30D) | Empty | GitHub / docs / web icons |
| Country, State, Employee range | From 3P | From 1P + 3P |
| # Devs | From Reo DB | From signals |
| # Monthly active devs | `0` or `--` | Active count |
| # Deanonymised devs | `0` or `--` | Count |
| Last activity | `--` | Date |
| Activity trend (L7D) | Empty | Sparkline |
| Stage | From HubSpot (synced back) | From HubSpot |
| CRM owner | From HubSpot | From HubSpot |

#### 3.3 Default View Behavior

- **All Accounts** segment includes CRM-imported accounts (they are full account citizens)
- The existing default segment **"Accounts with Deanonymised Developers"** naturally excludes 3P-only accounts (no deanonymised devs)
- A new **Magic Segment** is auto-created: **"CRM Imported Accounts"** -- filters to accounts sourced from CRM with no 1P signals
- Users can create custom segments combining "Has Developer Signals = No" with ICP Fit, Hiring Signals, etc.

---

### 4. Account Detail Drawer -- 3P-Only Accounts

All 6 tabs remain visible. Tabs without 1P data show contextual empty states:

#### Overview Tab (fully populated from 3P)
- Company description, firmographics, ICP Fit Score -- all populated
- Technology stack -- populated from technographics
- **Account Source**: New field in the Overview section displaying `Source: HubSpot CRM Import` with HubSpot icon + import date. For Reo-detected accounts this shows `Source: Reo Signal Detection`. For accounts that have both: `Source: CRM Import + Reo Signals`
- **Dev Funnel Stage**: Shows "Not tracked" state with helper text: "Connect your product integrations to track developer evaluation activity for this account"

#### Activity Insights Tab
- **Banner**: "No developer activity detected yet. This account was imported from your CRM and enriched with third-party data. When developers at this company start interacting with your product, activity insights will appear here."
- ICP Fit Score and firmographic insights still shown
- Developer count from Reo DB shown

#### Activity Timeline Tab
- **CRM Import event**: The first event on the timeline is a system-generated "birth event":
  ```
  18 Mar 2026   [import icon]
  +------------------------------------------+
  | Imported from HubSpot             [CRM]  |
  +------------------------------------------+
  ```
  - Uses a distinct icon (import icon or HubSpot logo) and a `[CRM]` badge (new badge type, similar to existing `[Website]`, `[Github]`, `[Telemetry]` badges)
  - This is a **system event** -- no developer name, just the import action
  - Visually differentiated from developer activity events (lighter/grey treatment or different icon color)
  - Appears as the earliest chronological event for CRM-imported accounts
- **Beyond the import event**: If no 1P signals exist yet, a contextual banner appears below: "Developer activity events will appear here when Reo detects signals like GitHub interactions, documentation visits, or product usage from this company."
- When 1P signals later arrive, they appear above the import event chronologically, creating a natural narrative: import -> first signal -> ongoing activity

#### Hiring Signals Tab (fully populated from 3P)
- Works exactly as it does today -- hiring trends + job postings from LinkedIn/job boards
- This is a **key value tab** for 3P-only accounts

#### Active Developers Tab
- Shows developers from Reo's DB (without activity scores since no 1P data)
- Left panel: Developers from Reo DB (no "Deanonymised" / "Active this Month" split since there's no 1P activity)
- Table: Developer name, Designation, Location, Contact IDs
- Activity Score column shows `--` for all developers

#### More Prospects Tab
- Works exactly as it does today -- Reo DB prospects, CRM Prospects
- Full buyer discovery functionality available

---

### 5. Account Limit & Pricing Model

**CRM-imported accounts do NOT count against the account quota** as long as they only have 3P enrichment.

- When Reo detects 1st-party developer signals for a CRM-imported account, the account **automatically starts counting** against the quota
- This is a natural expansion trigger: "You have 45 CRM accounts now showing developer signals -- upgrade your plan to track all of them"
- The existing "Accounts limit exhausted" banner does NOT affect CRM import (since these accounts are free until 1P signals)

**Quota display update**: Account usage indicator in sidebar should show: `87 / 100 signal accounts (+ 420 CRM enriched)`

---

### 6. Signal Merge Behavior

When Reo detects 1st-party developer signals for a CRM-imported account:

1. **Auto-merge silently** -- 1P signals are added to the existing account record
2. **Account Source updates** to "Both" (CRM Import + Reo Signals) -- provenance is preserved, never overwritten
3. The "Has Developer Signals" filter now returns `Yes` for this account
4. The "Account Source" filter returns `Both` for this account
5. Activity Score, Dev Funnel, Activity Timeline, and Activity Insights all activate
6. The original "Imported from HubSpot" timeline event remains as the first chronological entry -- new 1P events appear above it
7. The account begins counting against the quota
8. No user notification required (silent upgrade) -- the account just becomes richer

---

### 7. Enrichment Write-Back to HubSpot

Uses the **existing export field mapping** (on the Export tab). No new mechanism needed.

When Reo enriches a CRM-imported account with 3P data:
- Enrichment fields (ICP Fit, technographics, hiring signal count, developer count) are written back to HubSpot via the existing mapped fields
- The "Auto Overwrite" checkbox per field controls whether Reo overwrites existing HubSpot values
- Fields where Reo has no data: `null` sent (no overwrite of existing HubSpot data)
- Write-back happens on the same daily sync cadence

---

## UX Flow Summary

### Setup Flow (one-time)
1. User goes to Settings -> Integrations -> HubSpot -> Configure
2. Sees the new **Import tab** (alongside existing Export tab)
3. Enables `CRM Account Import` toggle
4. Selects HubSpot lists to import via dynamic list picker
5. Reviews/adjusts field mapping (auto-mapped by default)
6. Clicks Save -> initial bulk import begins
7. Completion notification: "X accounts imported, Y enriched"

### Daily Use Flow
1. User opens Accounts view -> sees all accounts (signal-detected + CRM-imported)
2. CRM-imported accounts show ICP Fit, Hiring Signals, Technographics, Devs from Reo DB
3. Activity Score shows `N/A` for 3P-only accounts -> clear signal that no developer activity exists yet
4. User uses `Has Developer Signals: No` filter + `ICP Fit: Strong` to find high-potential CRM accounts
5. Clicks into account detail -> sees full 3P enrichment + hiring signals
6. Tabs without 1P data show contextual banners nudging toward product integrations
7. User uses "More Prospects" to find buyers and add to outreach sequences

### Signal Activation Flow (passive)
1. A developer at a CRM-imported company stars the customer's GitHub repo
2. Reo detects the signal, auto-merges onto the existing account
3. Next time the user views this account: Activity Score, Timeline, Dev Funnel are now populated
4. The account now counts against quota

---

## Success Metrics

| Metric | Target |
|--------|--------|
| % of HubSpot-connected customers enabling import | > 50% within 3 months |
| Avg. accounts imported per customer | > 200 |
| % of imported accounts successfully enriched (at least 1 field) | > 80% |
| Signal activation rate (CRM imports later showing 1P signals) | > 10% within 6 months |
| Increase in platform DAU after feature launch | > 15% |
| Reduction in "Reo only shows me X accounts" churn feedback | Qualitative |

---

## Technical Considerations

- **Match key**: Company domain is the primary key for matching HubSpot companies to Reo's 3P DB. Fallback: company name + location fuzzy match.
- **HubSpot API**: Requires Lists API scope for dynamic list fetching. Companies API for bulk import. Rate limits: 100 requests/10 seconds -- batch accordingly.
- **Enrichment pipeline**: 3P enrichment should run asynchronously after import. Not all accounts will have data -- surface enrichment status.
- **Deduplication**: If a CRM-imported company already exists in Reo (detected via 1P signals), merge and enrich -- don't create a duplicate.
- **Data freshness**: 3P data (especially hiring signals) can go stale. Consider showing "Last enriched: X days ago" on account detail.

---

## Phasing

### Phase 1 (MVP)
- Import tab on HubSpot settings page
- Dynamic list picker + bulk import
- Daily batch sync
- 3P enrichment (firmographics, technographics, ICP Fit)
- "Has Developer Signals" filter on Accounts view
- "Account Source" filter on Accounts view (Reo Detected / CRM Import / Both)
- Account Source displayed in account detail Overview tab
- "Imported from HubSpot [CRM]" timeline event as first entry for CRM-imported accounts
- Empty state banners on 1P-dependent tabs (with nudge messaging re: 1P signals)
- Auto-merge when 1P signals detected (source updates to "Both")

### Phase 2
- Hiring signals surfaced as timeline events (even for 3P-only accounts)
- Enrichment status indicator on account rows
- "CRM Imported Accounts" Magic Segment auto-creation
- Enrichment completeness tracking in settings
- Quota upgrade nudge when CRM accounts activate with 1P signals

### Phase 3 (Future)
- Salesforce import support
- Attio import support
- Webhook-based real-time sync option
- Smart import recommendations ("We found 120 HubSpot accounts matching your ICP -- import them?")

---

## Open Questions

1. **Enrichment coverage**: What % of arbitrary company domains can Reo's 3P DB actually enrich? If coverage is low (<50%), we need to set expectations in the UI. Should we show enrichment rates during list selection?

2. **Historical hiring data**: For CRM-imported accounts, do we have historical hiring signal data or only going-forward? This affects the Hiring Signals tab value on day 1.

3. **Contact/developer reveal credits**: When showing developers from Reo's DB on CRM-imported accounts, does viewing their contact info (email, LinkedIn) consume reveal credits? This needs alignment with the existing credit model.

4. **Conflict resolution**: If HubSpot has `Industry = "Technology"` and Reo 3P has `Industry = "Information Technology & Services"` -- who wins? Should this be configurable per field?
