# HubSpot Integration - Technical Reference

## OAuth Scopes Needed

| Scope | Direction | Reason |
|-------|-----------|--------|
| `crm.objects.companies.read` | Import | Read company domain, lifecycle stage, and owner fields |
| `crm.objects.companies.write` | Export | Write-back enrichment data to HubSpot |

> **Removed**: `crm.objects.contacts.read` was listed here with the rationale that HubSpot requires it to access any CRM object — that is incorrect. CRM scopes are object-specific; `contacts.read` is not a prerequisite for reading companies. Only add it if contact-company associations are fetched downstream.

### Scope Gap Handling
If the existing OAuth token was granted with `crm.objects.companies.write` only (export-only), the Import tab prompts for re-consent to add the read scope. HubSpot handles this as a re-approval — no new account needed.

---

## API Required

### Companies Search API
- **Endpoint**: `POST /crm/v3/objects/companies/search`
- **Purpose**: Fetch company records by domain
- **Scope**: `crm.objects.companies.read`

Fields fetched per company: `domain`, `hs_object_id`, `lifecyclestage`, `hubspot_owner_id`

> **Note on `dealstage`**: `dealstage` is a **Deal** property, not a Company property, and is not returned by the Companies Search API. Fetching it requires two additional API calls per domain:
> 1. `GET /crm/v3/objects/companies/{id}/associations/deals` — get linked deal IDs
> 2. `GET /crm/v3/objects/deals/{dealId}?properties=dealstage` — fetch deal stage
>
> **Decision needed**: Is `dealstage` worth the 2× API call overhead per domain? `lifecyclestage` on the company object may be sufficient for the initial use case. If deal stage is needed in V1, it should be fetched lazily (only when a user opens an account detail), not during bulk import.

---

## Rate Limits

| Limit | Value | Applies to |
|-------|-------|------------|
| General API burst limit | 100 req / 10 sec | All other endpoints |
| **Search API burst limit** | **5 req / sec** | `POST /crm/v3/objects/*/search` |

The Search API has a **separate, stricter limit** of 5 requests per second. This is an **account-level cap shared across all integrations** on the customer's HubSpot account — if they have other tools also hitting the Search API, the budget is shared.

For a daily batch import of hundreds of domains: 5 req/s = 300 domains/minute, so large lists are still fine. However:
- Implement a 200ms delay between search requests to stay safely under the cap
- Surface a clear error if HubSpot returns a 429 (rate limit hit), and retry with backoff
- Document the shared cap in onboarding — customers with heavy HubSpot integrations may see slower imports

---

## Data Flow

```
HubSpot → Reo (Import)
  Trigger: Daily batch job (cron) + manual "Sync now"

  For each domain in user's import list:
    → POST /crm/v3/objects/companies/search (filter by domain)
    → Extract: hs_object_id, lifecyclestage, hubspot_owner_id
    → [Optional, not recommended for bulk] fetch associated deals for dealstage
    → Deduplicate against existing Reo accounts (by domain)
    → New accounts created with source = "CRM Import"
    → Reo 3P enrichment pipeline runs async
    → Status: imported → enriched / pending enrichment

Reo → HubSpot (Export / Write-back)
  Trigger: Daily batch job (same cadence)
  Existing field mapping (Export tab)
  Write enrichment fields to mapped HubSpot properties
  "Auto Overwrite" flag per field controls overwrite behavior
```

---

## Match Key
**Company Domain** — exact match. HubSpot `domain` property maps to Reo's existing domain-based account records. Fallback: company name + location fuzzy match (handled in Reo's dedup layer, not via HubSpot API).

---

## No List Picker
We intentionally do not use the HubSpot Lists API (`GET /crm/v3/lists`). Reo is the enrichment company — we already know these companies. We only need the domain to match records. No bulk company list fetching needed.
