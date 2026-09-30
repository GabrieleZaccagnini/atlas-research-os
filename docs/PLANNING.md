# How we evolve Atlas

Updated 2026-09-28. Planning lives beside the code so it survives chat changes and can evolve with implementation. No external project-management setup is needed.

## Which document answers which question?

| Question | Source of truth |
| --- | --- |
| What is Atlas, and what should it eventually cover? | [MASTER-PLAN.md](MASTER-PLAN.md): product requirements, original 31-section mapping and detailed additions. |
| What should we build next, and in what order? | [ROADMAP.md](ROADMAP.md): release outcomes, dependencies and next batch. |
| Is a specific capability implemented, partial, planned or deferred? | [BACKLOG.md](BACKLOG.md): stable feature IDs, status, acceptance boundaries and idea inbox. |
| Where can the data come from? | [DATA-SOURCES.md](DATA-SOURCES.md): candidate providers and exact implemented coverage; inclusion does not prove access. |
| How does the working application behave? | [ARCHITECTURE.md](ARCHITECTURE.md) and [RESEARCH-WORKSPACE.md](RESEARCH-WORKSPACE.md): current implementation. |
| Why did we choose or change something? | [DECISIONS.md](DECISIONS.md): dated decisions, consequences and superseding changes. |

The master plan's implementation snapshot is historical context. Update live feature status in the backlog rather than maintaining competing checklists. VISION, FEATURES and the manifesto are supporting context, not separate delivery plans.

## Add ideas naturally

The user can send a sentence, screenshot, link or longer brainstorm. For example:

- “Add an idea: compare universities connected to projects.”
- “Move chain liquidity ahead of advanced macro charts.”
- “This screen is overwhelming; simplify the default view.”
- “This number looks wrong; record it as a bug and investigate.”
- “Show me what is built, what is next and what is deferred.”

For each addition, find an existing feature first. Extend its scope if it is the same need; otherwise assign the next unused ATLAS number. Preserve the original intent and source, distinguish unverified reference claims from requirements, and link it to a workspace and existing dependencies. A screenshot can inspire a feature without its numbers or claims becoming production data.

An idea enters the inbox without needing a complete specification. Clarify only when uncertainty affects the work. Routine, reversible choices can be made within the user's scope; this process adds no approval gate.

## Triage and prioritization

Ask: what question or repeated task does this improve, how often will it be used, what blocks it, and is usable data available? Prefer features that improve the current research workflow or unlock several other features. Bugs affecting saved data, isolation or misleading displayed facts take precedence over cosmetic additions.

Use simple horizons rather than false-precision scores:

- **Next:** the small batch in ROADMAP; normally one slice actively being built.
- **Soon:** the next usable milestones after dependencies clear.
- **Later:** retained scope that does not need implementation now.

New ideas normally enter the backlog and do not interrupt an active slice. An explicit user request to reprioritize does change the active scope; update the roadmap and explain what moves. A critical bug may justify a change immediately. Record material scope/order changes in the decision log, including the tradeoff.

## Feature lifecycle

| Status | Meaning |
| --- | --- |
| Inbox | Captured, not yet assessed or committed to delivery. |
| Planned | Accepted direction; scope, dependencies or data access still need work. |
| Ready | A bounded slice has a clear outcome and acceptance criteria; no unresolved blocker to starting it. |
| Building | Implementation is in progress, with the active slice stated. |
| Verify | Implementation exists and needs its acceptance checks. |
| Partial | A useful portion exists; the row explicitly identifies what remains. |
| Done | The named acceptance boundary works and has been checked. This does not mean the whole long-term domain is complete. |
| Blocked | A named external dependency prevents progress on that slice; independent work can continue. |
| Deferred | Intentionally postponed, with a reason and a condition for revisiting it. |
| Dropped | No longer intended; keep the rationale and any replacement ID. |

For broad partial features, track a named small slice below the row instead of cycling the whole capability through Building/Done. Keep parent IDs stable; use a suffix (for example ATLAS-009.a) when a independently trackable subtask is needed. Never renumber existing IDs.

## Lightweight feature card

Copy this into the backlog when a feature is selected for work. Small requests only need the relevant fields.

```text
ID / name:
Status / horizon / milestone:
User question or problem:
Source / date:
Smallest useful slice:
Acceptance checks (observable behavior):
Data needed / candidate source / access still to verify:
Dependencies / affected screens:
Not included in this slice:
Validation / migration / recovery needs:
Outcome / remaining work:
```

Unselected ideas can use a much shorter inbox row: ID, idea, reason, source/date and related feature. Keep original references where available; do not invent missing attachment contents or conversation history.

## Start and finish a build session

At the start, read the roadmap's next batch, relevant backlog rows and requirements; inspect the current code/diff. Identify the slice being worked on, not the entire platform. The latest user request can override the recorded order.

At the end, record what actually works, checks performed and remaining limits in the backlog. Update current architecture/source coverage when they changed. If requirements or priorities changed, update the master/roadmap and append a decision. Never mark an API connected based only on an adapter existing.

After the user tries a slice, capture: what was useful, confusing, missing, slow or unnecessary. Turn that feedback into a correction to an existing feature or a new inbox item. Review ordering after each usable release and when a substantial new idea arrives; no background monitoring is implied.

## Later: an Atlas idea inbox

ATLAS-046 proposes a private in-app feedback/idea form with page context, notes and attachments. Start with manual triage into these planning files; if GitHub issues are later adopted, define a single authoritative status location and link IDs rather than maintaining two independent backlogs. This is a planned convenience, not a prerequisite for building the product.
