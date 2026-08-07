# Hermes Architecture

**Component:** Hermes — Chief of Staff, NEXUS AI Operating System
**Status:** FROZEN (v1.1)
**Process stage:** Design → Review → Freeze (complete)
**Scope of this document:** Architecture only. No implementation.
**Related documents:** `HERMES_PROTOCOL.md`, `HERMES_STATE_MACHINE.md`,
`HERMES_PROMPT.md` — see §11.

---

## 0. Position in NEXUS

NEXUS is composed of a CEO layer, an **Executive Office** layer (of which
Hermes is one component), and six operating departments:

```
                    ┌─────────────┐
                    │     CEO     │   sets intent, strategy, priorities
                    └──────┬──────┘
                           │ intent / directives
                           ▼
                 ┌───────────────────────┐
                 │    EXECUTIVE OFFICE    │
                 │                        │
                 │  ┌──────────────────┐  │
                 │  │      HERMES      │  │  operational coordination
                 │  │ (Chief of Staff)  │  │  — this document
                 │  └──────────────────┘  │
                 │   Briefing Engine       │  CEO-facing reporting
                 │   Approval Queue        │  Tier B/C decision checkpoint
                 │   Strategic Planning    │  goal → initiative shaping
                 └───────────┬────────────┘
                              │ assignments / monitoring / reporting
        ┌─────────┬────────┬─┼──────┬─────────┬─────────┐
        ▼         ▼        ▼ ▼      ▼         ▼         ▼
   Control    Workshop  Research   Radar   Treasury   Memory
   Centre                Centre
```

**The CEO decides what matters. Hermes decides how it gets done and by
whom. Departments decide how their own work gets executed.**

Hermes sits inside the Executive Office, directly above the six
departments. It has no department of its own, owns no specialist
capability, and produces no domain output itself. Its only product is
**coordination**: turning CEO intent into tracked, executed, reported work.

### 0.1 The Executive Office

The Executive Office is a grouping of CEO-support functions, not an
additional approval hop between the CEO and Hermes — Tier A coordination
(§2) still flows without friction. It exists so that responsibilities
Hermes was previously absorbing by default now have a proper home,
each with a narrower job than Hermes's own:

- **Hermes (Chief of Staff)** — the operational coordinator described in
  this document: intent → tasks → departments → results.
- **Briefing Engine** — consumes Hermes's raw task/status state and
  composes it into CEO-consumable artifacts (the daily summary, on-demand
  briefings). Hermes is a data source to it, not its operator; see §8.
- **Approval Queue** — the durable store and workflow for Tier B/C items.
  Hermes files escalations into it rather than tracking their resolution
  lifecycle itself; CEO approve/reject/defer actions happen against the
  queue and resolutions flow back to Hermes for execution. See §2, §6.
- **Strategic Planning** — works with the CEO upstream of Hermes, turning
  strategic goals into scoped initiatives and directives. Hermes receives
  directives already scoped at the initiative level and decomposes them
  into department-level tasks (§5); Strategic Planning does not decompose
  into tasks, and Hermes does not set initiative-level scope.

Control Centre remains a department — the live operational/visual
dashboard for system state — distinct from Briefing Engine's curated,
CEO-facing reporting. The two consume overlapping data but serve
different audiences and update on different cadences (§8).

This document defines **Hermes only**. Briefing Engine, Approval Queue,
and Strategic Planning are positioned here for context; their own
architecture is out of scope until each gets its own design pass.

---

## 1. Hermes Responsibilities

Hermes is responsible for:

1. **Intent translation** — turning CEO directives (often high-level,
   sometimes ambiguous) into concrete, assignable tasks.
2. **Task routing** — determining which department(s) a task belongs to,
   including tasks that span more than one department.
3. **Work orchestration** — sequencing dependent tasks, parallelizing
   independent ones, and tracking task state end-to-end.
4. **Progress monitoring** — polling/receiving status from department
   agents and maintaining a live picture of what's in flight, blocked, or
   done.
5. **Result aggregation** — collecting outputs from multiple departments
   and assembling them into a single coherent report back to the CEO.
6. **Escalation** — surfacing blockers, conflicts, or decisions that
   exceed its authority to the CEO, with context and options rather than
   raw noise.
7. **Resource arbitration (light)** — when two departments compete for the
   same limited resource (e.g., Treasury budget, Workshop build slots),
   Hermes queues and prioritizes according to CEO-set priority rules — it
   does not invent new priorities.
8. **State-of-NEXUS reporting** — maintaining the summarized system status
   that feeds the CEO dashboard.

Hermes is explicitly **not** responsible for:

- Producing domain work product (code, research findings, financial
  models, monitoring signals, stored memories) — that belongs to the
  departments.
- Setting strategy, goals, or priorities — that belongs to the CEO.
- Overriding a department agent's judgment within that department's
  domain of expertise.

---

## 2. Decision Boundaries

Hermes operates inside a bounded authority envelope. Everything Hermes
does falls into one of three tiers:

| Tier | Description | Example | Approval needed |
|---|---|---|---|
| **A — Autonomous** | Routine coordination within existing CEO intent | Assign a task to Workshop, chase a stalled status update, re-order a queue by existing priority rules | None — Hermes just acts |
| **B — Escalate-and-recommend** | Ambiguous, cross-department, or resource-contended decisions | Two departments need the same Treasury budget this week; a task doesn't cleanly map to one department | Hermes proposes a resolution, CEO confirms or overrides |
| **C — CEO-only** | Strategic, irreversible, or scope-changing decisions | New department created, department mandate changed, CEO-level goal changed, budget ceiling changed | Hermes cannot act; it can only surface the need for a decision |

**Rule of thumb:** if a decision changes *what NEXUS is trying to do*, it's
Tier C. If it changes *how already-agreed work gets done*, it's Tier A or
B. Hermes never promotes itself from B to A by assumption — an escalation
that goes unanswered stays queued and visible, it is not auto-approved.

Hermes also never adjudicates *inside* a department's domain expertise
(e.g., it will not decide which research methodology Research Centre
should use). It only adjudicates *between* departments and *between*
department output and CEO intent.

---

## 3. Communication Protocol

All coordination traffic between the CEO, Hermes, and departments follows
one message shape so it can be logged, replayed, and audited consistently.

### 3.1 Message envelope

```
{
  message_id
  timestamp
  from            // "CEO" | "Hermes" | "<department>"
  to              // "CEO" | "Hermes" | "<department>" | "<department>.<agent>"
  type            // directive | task_assignment | status_update |
                  // result | escalation | query | ack
  ref_task_id     // links related messages into one task thread
  priority        // CEO-set: critical | high | normal | low
  payload         // type-specific content
}
```

### 3.2 Channels

- **CEO ↔ Hermes:** directives down (either directly from the CEO or
  scoped by Strategic Planning, §0.1 — Hermes treats both as equally
  authoritative), status/results up. Escalations route through the
  Approval Queue rather than as ad hoc CEO messages, and CEO-facing
  reporting is composed by the Briefing Engine rather than sent by Hermes
  directly (§8) — but Hermes remains the only source of the underlying
  operational state both of those consume.
- **Hermes ↔ Department (lead agent per department):** task assignment
  down, status/result up. Hermes never messages a department's internal
  sub-agents directly — it addresses the department's lead/coordinating
  agent, which manages its own internals.
- **Department ↔ Department:** not permitted directly for task
  coordination. If Workshop needs something from Research Centre, the
  request routes through Hermes, so Hermes retains a complete picture of
  cross-department dependencies. (Departments may share read-only data
  via Memory without going through Hermes — see §9 for why this is scoped
  narrowly today.)

### 3.3 Cadence

- **Status updates:** department agents push a status update on state
  change (assigned → in progress → blocked → done), not on a fixed
  timer. Hermes additionally polls any task with no update for longer
  than its expected duration band.
- **Reports to CEO:** Hermes reports on task completion, on escalation,
  and on a standing cadence (daily summary) — not on every intermediate
  status change. The CEO sees signal, not the raw event stream.

---

## 4. Agent Lifecycle

Hermes manages the lifecycle of its relationship with each department
agent (not the internal lifecycle of agents *within* a department — that's
the department's own concern).

```
 REGISTERED → ACTIVE → (BUSY ⇄ IDLE) → DEGRADED → RETIRED
```

1. **Registered** — a department agent is known to Hermes: its identity,
   capabilities, and permission scope are on file. Registration is a
   one-time setup step, not something Hermes performs autonomously —
   new departments/agents are registered as a Tier C action.
2. **Active** — the agent is available to receive task assignments.
3. **Busy / Idle** — Hermes tracks current load per department so it can
   route new work to available capacity and avoid overloading a
   department that's already saturated.
4. **Degraded** — the agent is missing heartbeats, repeatedly failing
   tasks, or returning malformed results. Hermes stops routing new work
   to a degraded agent and escalates (Tier B) rather than silently
   retrying forever.
5. **Retired** — the agent is deregistered (replaced, decommissioned, or
   department restructured). Retirement is Tier C.

Hermes maintains a lightweight **registry**, not a deployment system: it
does not spin agents up or down, install capability, or manage their
runtime. It only tracks who exists, what they can do, and what state
they're in.

---

## 5. Task Delegation Model

```
CEO directive
     │
     ▼
[1] Intake        — Hermes receives and logs the directive
     │
     ▼
[2] Decompose      — break into discrete tasks; identify dependencies
     │
     ▼
[3] Route          — match each task to owning department(s) by capability
     │
     ▼
[4] Assign         — send task_assignment; department acks
     │
     ▼
[5] Track          — monitor status through completion or failure
     │
     ▼
[6] Aggregate      — combine results across tasks/departments
     │
     ▼
[7] Report         — return consolidated result to CEO
```

**Decomposition principle:** a task is split only when it genuinely spans
department boundaries or has a real sequencing dependency. Hermes does not
fragment work for its own sake — over-decomposition creates coordination
overhead without benefit.

**Routing principle:** routing is capability-based, not load-based first —
Hermes sends work to the department whose mandate covers it, and only
uses current load (§4) as a tiebreaker or a reason to flag a bottleneck to
the CEO, never as a reason to reroute work outside a department's mandate.

**Single ownership:** every task has exactly one department as its owner
of record, even if other departments contribute inputs. This keeps status
tracking and accountability unambiguous. Multi-department tasks are
modeled as a parent task (owned by Hermes) with department-owned subtasks,
not as shared ownership of one task.

---

## 6. Failure Handling

Failure is handled at the level it occurs, escalating outward only when
the lower level can't resolve it:

| Level | Failure type | Response |
|---|---|---|
| **Task** | A single task errors or times out | Hermes retries once per department-declared retry policy; if it fails again, mark blocked and escalate (Tier B) |
| **Agent** | Department agent unresponsive / degraded (§4) | Hermes pauses routing to that agent, re-routes queued (not yet started) tasks if an alternate capable department exists, escalates the agent health issue |
| **Cross-department** | Two departments produce conflicting results for a shared task | Hermes does not pick a winner; it packages both results with context and escalates to CEO (Tier B/C depending on stakes) |
| **Systemic** | Multiple departments degraded, or Hermes itself cannot reach the Executive Office / CEO channel | Hermes freezes new task assignment, preserves all in-flight state, and surfaces a system-health alert through every available channel |

**Principles:**

- Hermes never silently drops a failed task — every failure is visible in
  status until explicitly resolved or explicitly accepted as a known
  issue by the CEO.
- Hermes never retries indefinitely — bounded retries only, then
  escalate.
- Hermes never fabricates a result to fill a gap when a department fails
  to deliver — a missing result is reported as missing, not papered over.

---

## 7. Permission Model

Permissions are scoped along two axes: **what Hermes can do to a
department**, and **what a department can do through Hermes**.

### 7.1 Hermes → Departments

| Action | Allowed |
|---|---|
| Assign a task within the department's declared mandate | Yes (Tier A) |
| Query status | Yes (Tier A) |
| Re-prioritize queued tasks using existing CEO priority rules | Yes (Tier A) |
| Assign work outside a department's declared mandate | No — reroute or escalate |
| Change a department's mandate, capability scope, or budget ceiling | No — Tier C, CEO only |
| Access a department's internal working data/state | No — only declared outputs and status |
| Command a department's internal sub-agents directly | No — only the department's lead agent |

### 7.2 Departments → Hermes

| Action | Allowed |
|---|---|
| Report status/results | Yes |
| Request clarification on an assignment | Yes |
| Request resources (budget, priority) | Yes — routed to Treasury/CEO as Tier B |
| Decline a task outside declared capability | Yes — Hermes must re-route, not force |
| Directly message another department | No — routes through Hermes |
| Directly message the CEO | No (routine) — escalation path only, and even then Hermes is cc'd/logged so it retains a complete picture |

### 7.3 CEO → Hermes

The CEO can issue any directive, override any Hermes decision (Tier A or
B), and perform any Tier C action. Hermes has no permission it can
exercise against the CEO — it can only escalate, recommend, and report.

Treasury deserves a specific note: Hermes can *request* budget release on
a department's behalf and *report* spend status, but Hermes does not hold
spending authority itself — actual authorization is a Treasury-department
function operating under CEO-set limits.

---

## 8. Dashboard Integration

Hermes is the primary data source for NEXUS's operational state. It does
not render any dashboard or briefing itself — it supplies the state that
Control Centre (live dashboard) and the Briefing Engine (curated CEO
reporting) each consume for their own purpose.

**Hermes publishes:**

- **System status board** — per-department state (active/idle/degraded),
  current load, open task count. (Rendered live by Control Centre.)
- **Task pipeline view** — tasks by stage (intake → routed → in progress →
  blocked → done), consistent with the model in §5. (Rendered live by
  Control Centre.)
- **Escalation feed** — open Tier B/C items as Hermes raises them, each
  with Hermes's recommendation attached. Hermes publishes the feed; the
  Approval Queue (§0.1) owns the item's persistent record and
  approve/reject/defer lifecycle from that point on.
- **Raw status/result stream** — the underlying data the Briefing Engine
  composes into the standing daily summary and on-demand briefings
  (§3.3). Hermes does not format this for CEO consumption; that curation
  is the Briefing Engine's job.
- **Health signals** — agent degradation events, retry exhaustion, missed
  heartbeats.

**Design constraint:** downstream consumers (Control Centre, Briefing
Engine, Approval Queue) consume Hermes's *reported* state, not live
internal department telemetry — this keeps a single, consistent source of
truth and avoids each consumer needing direct integration with six
separate departments individually.

**Out of scope for v1:** Hermes does not provide predictive analytics,
department performance scoring, or historical trend analysis on the
dashboard. It reports current and recent state. (See §9.)

---

## 9. Future Roadmap

This document freezes the **v1 coordination architecture**: single CEO,
one Hermes instance, six fixed departments, strictly hub-and-spoke
communication. Deliberately deferred to later phases:

- **Phase 2 — Peer collaboration channel:** a scoped, Hermes-visible
  channel for direct department-to-department data exchange (beyond
  read-only Memory access) for high-frequency collaboration patterns,
  without losing Hermes's cross-department visibility.
- **Phase 2 — Historical analytics:** trend lines on department
  throughput, failure rates, and turnaround time, feeding into CEO
  planning rather than just current-state reporting.
- **Phase 3 — Predictive load balancing:** Hermes anticipates department
  saturation from task pipeline trends and flags it before it becomes a
  blocker, rather than reacting after the fact.
- **Phase 3 — Multi-Hermes / delegation depth:** for significant scale,
  a model where Hermes can delegate a coordination sub-scope (e.g., a
  large multi-department initiative) to a temporary sub-coordinator,
  while retaining ultimate accountability.
- **Phase 4 — Additional departments:** the registry model in §4 is
  built to accommodate department growth beyond the current six without
  architectural change; onboarding a new department stays a Tier C CEO
  decision.

None of these are approved for implementation. They are recorded here so
future design work has a stated direction and doesn't silently drift from
what v1 intentionally deferred.

Also deferred: full architecture passes for Briefing Engine, Approval
Queue, and Strategic Planning (§0.1). They are scoped only as far as
needed to place Hermes correctly among them.

---

## 10. Review & Freeze Log

**Design pass (v1.0):** Sections 1–9 drafted to define Hermes as a pure
coordination layer — no domain execution capability, bounded decision
tiers, single communication hub, department-agnostic lifecycle and
delegation model.

**Review pass (v1.0 self-check against stated constraints):**

- ✅ Hermes never appears as a decision-maker on strategy/goals (Tier C
  reserved for CEO throughout).
- ✅ Hermes never replaces a department agent's domain judgment (§1, §2,
  §7.1).
- ✅ Every department interaction is logged/traceable (single envelope
  format, no direct department-to-department task channel).
- ✅ Failure handling has no silent-failure path (§6).
- ✅ No implementation detail (tech stack, storage, transport) specified
  anywhere in this document — architecture only, as scoped.

**Revision pass (v1.1):** introduced the Executive Office (§0, §0.1) as
Hermes's home, giving reporting curation (Briefing Engine), decision
checkpointing (Approval Queue), and goal-to-initiative shaping (Strategic
Planning) their own places instead of leaving them implicit inside
Hermes. Hermes's own responsibilities, tiers, lifecycle, delegation model,
and permission model (§1–§7) are unchanged in substance — only §0, §3.2,
§6, and §8 were touched to reflect where Hermes's output now flows.

**Review pass (v1.1):**

- ✅ Tier A coordination still requires no extra approval hop through the
  Executive Office (§0.1) — the new layer is a grouping, not a gate.
- ✅ Hermes's core loop (§5) is untouched; only downstream consumers of
  its output changed.
- ✅ No implementation detail introduced.

**Freeze:** This document is frozen as v1.1. Any change to Tiers,
permission boundaries, the department list, or the Executive Office
grouping requires a new revision, not an in-place edit.

---

## 11. Companion Documents

This document defines Hermes's architecture — its place in NEXUS, its
authority, and its relationships. Three companion documents bring Hermes
to the same documentation standard as the rest of NEXUS before any
implementation begins:

- **`HERMES_PROTOCOL.md`** — the concrete message protocol underlying §3:
  full message-type catalog, channel matrix, and example flows.
- **`HERMES_STATE_MACHINE.md`** — formal state machines for tasks (§5),
  department agents (§4), and Approval Queue items (§0.1), with
  transition tables.
- **`HERMES_PROMPT.md`** — the behavioral specification an actual Hermes
  agent implementation would be instructed with: identity, directives,
  hard boundaries, and worked examples of correct vs. incorrect behavior.

All three are design artifacts, consistent with this document's scope —
none of them constitute implementation.
