# Lucas Museum of Narrative Art Commercial Performance Dashboard

An executive-facing React and TypeScript prototype for prior-day commercial performance and visitor operations. All values are aggregated November 2026 mock data for demonstration only.

## Run locally

Requires a current Node.js release and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` for a production build and `npm run lint` for static checks.

## Prototype structure

- `src/data/mockData.ts` contains typed, privacy-conscious demo data and the prototype reporting dates.
- `src/types/dashboard.ts` defines the reporting, filter, KPI, chart, alert, and source-availability contracts.
- `src/services/dashboardService.ts` provides the `DashboardDataAdapter` boundary. `MockDashboardAdapter` can later be replaced by a gold-layer API or Power BI semantic-model adapter without changing the pages.
- `src/components` contains the shell, filters, status elements, KPI cards, chart wrappers, and visualizations.
- `src/pages` contains the Executive Overview and Operations experiences.

The **Preview state** filter intentionally demonstrates loading, empty-data, and error states for the primary scorecard. Navigation items labeled **Planned** are non-interactive and have keyboard-accessible release guidance.

## Production data requirements

Expected curated sources include:

- Ticketing and admissions: sales, timed entry, available capacity, scans, attendance, and redemption.
- POS and reservations: food and beverage, retail, parking transactions, and restaurant reservations.
- Membership CRM: membership orders, levels, conversion, and consented repeat-visitor aggregates.
- Website analytics and social platforms: acquisition, funnel events, campaign engagement, subscribers, and social engagement.
- Operational instrumentation: privacy-reviewed Wi-Fi or people counters, queue tools, ticket-scan proxies, and structured staff observations for dwell, queues, elevator demand, and zone flow.
- Transportation: parking, shuttle, partner transit or rideshare aggregates, and opt-in visitor surveys. These measures remain marked **Instrumentation required** until sufficiently reliable.

No personally identifiable visitor information should enter the dashboard. Identity-linked repeat measures should be consented, aggregated, access-controlled, and subject to minimum cohort thresholds.

## Refresh and Power BI path

The intended production cadence is a scheduled overnight load into curated gold-layer tables. Source ingestion and reconciliation should complete before 5:00 AM Pacific; the dashboard then publishes the most recently completed business day. A museum business calendar should skip closure days and label the fallback date as the most recent completed business day. Feed completeness, delayed sources, last successful refresh, and reporting coverage should be emitted with every dataset.

For Power BI migration, preserve the contracts in `src/types/dashboard.ts` as a semantic-model guide. Measures can move into a governed dataset while this React experience consumes an API over that model, or the visual layer can be rebuilt in Power BI using the same KPI definitions, business calendar, row-level governance, source-status table, and scheduled refresh rules.