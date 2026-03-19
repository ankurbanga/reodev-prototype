# HubSpot Integration - Technical Reference

## OAuth Scopes Needed

| Scope | Direction | Reason |
|-------|-----------|--------|
| `crm.objects.companies.read` | Import | Read company domain + CRM stage/deal stage fields |
| `crm.objects.contacts.read` | Import | Required by HubSpot to access any CRM object |
| `crm.objects.companies.write` | Export | Write-back enrichment data to HubSpot |

### Scope Gap Handling
If the existing OAuth token was granted with `crm.objects.companies.write` only (export-only), the Import tab prompts for re-consent to add read scopes. HubSpot handles this as a re-approval — no new account needed.

## API Required

### Companies API
- **Endpoint**: `POST /crm/v3/objects/companies/search`
- **Purpose**: Fetch company records by domain and CRM stage fields
- **Scope**: `crm.objects.companies.read`

We only fetch: `domain`, `hs_object_id`, `lifecyclestage`, `dealstage`, `hubspot_owner_id`
No bulk company list fetching — we match domain-by-domain from the user's input.

## Data Flow

```
HubSpot → Reo (Import)
  Trigger: Daily batch job (cron) + manual "Sync now"

  User submits domains → HubSpot search by domain
  → Match to CRM Account Stage, Deal Stage, Owner
  → Deduplicate against existing Reo accounts (by domain)
  → New accounts created as "CRM Import" source
  → Reo 3P enrichment pipeline runs async
  → Status: imported → enriched / pending

Reo → HubSpot (Export / Write-back)
  Trigger: Daily batch job (same cadence)
  Existing field mapping (Export tab)
  Write enrichment fields to mapped HubSpot properties
  "Auto Overwrite" flag per field controls overwrite behavior
```

## Match Key
**Company Domain** — exact match. HubSpot `domain` property maps to Reo's existing domain-based account records.

## No List Picker
We intentionally do not use the HubSpot Lists API (`GET /crm/v3/lists`). Reo is the enrichment company — we already know these companies. We only need the domain to match records. No company record bulk-import, no list fetching.

## Rate Limits
- 100 requests per 10 seconds per app (HubSpot default)
- For import, we only need 1 request per domain (search by domain), so rate limits are not a concern even for large lists.
