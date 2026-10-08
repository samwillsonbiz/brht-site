<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Fantasy draft scheduler: preserve live availability data

The public NBA draft scheduling page lives at `app/fantasy/draft-scheduler/page.tsx` and stores people's submissions in the **persistent Supabase** table `public.fantasy_draft_availability` (project `zqwdooykgwkfhwyayucg`). This is live user data, **not seed or sample data**.

- When updating the scheduler's UX, copy, button logic, time zones, polling, deployment, or layout, **never truncate, delete, reseed, replace, or recreate the availability table or its saved rows**.
- Keep the current numeric team IDs and existing ISO time-slot IDs stable. The UI intentionally maps the 12 manager names to existing DB IDs; reordering numeric identifiers or redefining UTC slots without a migration can make saved responses appear lost.
- Any necessary schema change must be non-destructive, must keep the existing `blocked_slots` and `available_slots` data, and should be checked against live row counts before and after.
- A protected recovery history exists in `draft_safety.availability_history`, maintained automatically by the trigger `draft_availability_recovery_history`. Do not remove, truncate, or expose it through anonymous access.
- The page may be redesigned or redeployed without touching existing submissions. If a change needs a new polling period, explicitly preserve the old availability data, and use a separate campaign ID/table instead of overwriting it.
- Maintain the temporary access restriction: only `/fantasy/draft-scheduler` is public from `/fantasy` during the league's scheduling period; other fantasy pages and API routes are intentionally blocked by `proxy.ts`.
