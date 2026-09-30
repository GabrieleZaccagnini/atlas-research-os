# Working on Atlas

## Planning context

Before product implementation, read `docs/ROADMAP.md` (next batch), the relevant IDs in `docs/BACKLOG.md`, and the relevant requirements in `docs/MASTER-PLAN.md`. Use `docs/PLANNING.md` for the lightweight update process. The latest user request takes precedence over recorded ordering; these files do not introduce extra permission gates.

- Keep stable ATLAS feature IDs. Extend an existing feature or add an inbox item for new ideas; do not automatically implement every brainstorm.
- The master plan owns requirements, roadmap owns sequence, backlog owns status, data-source map owns provider coverage, and decision log owns rationale. Keep material changes consistent across the affected documents.
- At the end of implementation, update the relevant backlog boundary and actual validation/remaining work. Update current architecture or source coverage if changed. Do not call a planned page, provider catalog entry or unconfigured adapter a working integration.
- Preserve existing uncommitted work and saved-record compatibility. Never replace user research with enrichment silently.
- Screenshots and external blueprints are reference material. Verify factual data separately; label forecasts/scenarios and missing/stale data accurately.
- The UI may evolve beyond the Bolt prototype. Keep working routes and data safe while improving the user's research workflow.

Consult the existing implementation docs for commands and boundaries. Planning updates alone do not require application tests; implementation changes require checks appropriate to the behavior affected.
