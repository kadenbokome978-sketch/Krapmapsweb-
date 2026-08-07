# Hermes State Machine

**Component:** Hermes — Chief of Staff, NEXUS AI Operating System
**Status:** FROZEN (v1.0)
**Parent document:** `HERMES_ARCHITECTURE.md` §4 (Agent Lifecycle), §5
(Task Delegation Model), §0.1 (Approval Queue)
**Scope of this document:** Formal state machines only. No implementation
(no storage model, no persistence guarantees).

---

## 1. Purpose

The architecture document describes task flow and agent lifecycle in
prose and a linear diagram. This document makes both formal: every state,
every legal transition, the event that triggers it, and any guard
condition — so that an implementation has an unambiguous specification to
build against, and so reviewers can check for unreachable states or
missing failure exits before any code exists.

Three state machines are defined: **Task**, **Department Agent**, and
**Approval Queue Item**. All three are owned/observed by Hermes, though
the Approval Queue item's terminal transitions are driven by the CEO.

---

## 2. Task State Machine

### 2.1 States

| State | Meaning |
|---|---|
| `INTAKE` | Directive received, not yet decomposed |
| `DECOMPOSED` | Broken into one or more subtasks (or kept whole if single-department) |
| `ROUTED` | Owning department identified for this (sub)task |
| `ASSIGNED` | `task_assignment` sent, awaiting `ack` |
| `IN_PROGRESS` | Acked and department reports active work |
| `BLOCKED` | Department reports a blocker, or an assignment went un-acked past timeout |
| `ESCALATED` | Hermes has filed an `escalation` to the Approval Queue for this task |
| `DONE` | Terminal — `result(success)` received (and, for a parent task, all subtasks are `DONE`) |
| `FAILED` | Terminal — retries exhausted and no CEO resolution rescues it |
| `CANCELLED` | Terminal — CEO or Strategic Planning withdrew the directive |

### 2.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `directive` received | `INTAKE` | — |
| `INTAKE` | decomposition complete | `DECOMPOSED` | — |
| `DECOMPOSED` | department(s) matched | `ROUTED` | every subtask has exactly one owning department (architecture §5, single ownership) |
| `ROUTED` | `task_assignment` sent | `ASSIGNED` | — |
| `ASSIGNED` | `ack` received | `IN_PROGRESS` | — |
| `ASSIGNED` | ack timeout | `BLOCKED` | delivery retry exhausted (protocol doc §5) |
| `IN_PROGRESS` | `status_update(blocked)` | `BLOCKED` | — |
| `IN_PROGRESS` | `result(success)` | `DONE` | — |
| `IN_PROGRESS` | `result(failed)`, retries remain | `ASSIGNED` | department-declared retry policy (architecture §6) allows another attempt |
| `IN_PROGRESS` | `result(failed)`, retries exhausted | `BLOCKED` | — |
| `BLOCKED` | blocker clears (status_update resumes) | `IN_PROGRESS` | — |
| `BLOCKED` | Hermes cannot resolve at task level | `ESCALATED` | matches architecture §6 "Task" and "Agent" failure levels |
| `ESCALATED` | `approval_resolution(approve/alternative)` | `ASSIGNED` or `ROUTED` | re-enters the flow at the point the resolution unblocks |
| `ESCALATED` | `approval_resolution(reject)` | `FAILED` | — |
| `ESCALATED` | `approval_resolution(defer)` | `ESCALATED` | self-loop; stays visible in the Approval Queue, not auto-resolved |
| any non-terminal | CEO/Strategic Planning withdraws directive | `CANCELLED` | Tier C action |
| `DECOMPOSED` (parent) | all subtasks `DONE` | `DONE` | aggregation step (architecture §5, step 6) |
| `DECOMPOSED` (parent) | any subtask `FAILED` and not recoverable | `ESCALATED` | cross-department conflict/failure escalation (architecture §6) |

### 2.3 Diagram

```
   INTAKE → DECOMPOSED → ROUTED → ASSIGNED ⇄ IN_PROGRESS
                                       │            │
                                       ▼            ▼
                                   BLOCKED ───→ ESCALATED
                                       │              │
                                       ▼              ├──→ FAILED
                                  (resumes)            └──→ (re-enters ASSIGNED/ROUTED)

   IN_PROGRESS ──→ DONE
   any non-terminal ──→ CANCELLED
```

**Invariant:** a task never transitions directly from `ESCALATED` to
`DONE`. Escalation resolution always re-enters the normal flow (or ends
in `FAILED`/`CANCELLED`) — Hermes does not mark work complete as a side
effect of an approval; the department still delivers the `result`.

---

## 3. Department Agent State Machine

Mirrors architecture doc §4, formalized.

### 3.1 States

`REGISTERED`, `ACTIVE`, `BUSY`, `IDLE`, `DEGRADED`, `RETIRED`.

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | department onboarded | `REGISTERED` | Tier C action (CEO-only) |
| `REGISTERED` | capability/scope confirmed | `ACTIVE` | — |
| `ACTIVE` / `IDLE` | task assigned | `BUSY` | — |
| `BUSY` | all assigned tasks leave `IN_PROGRESS`/`ASSIGNED` | `IDLE` | — |
| `BUSY` or `IDLE` | missed heartbeat threshold, or repeated malformed/failed results | `DEGRADED` | matches architecture §4.4 |
| `DEGRADED` | health restored (heartbeat resumes, clean result received) | `IDLE` | Hermes resumes routing only after confirmation, not on the first good signal alone |
| `DEGRADED` | sustained failure, CEO decision | `RETIRED` | Tier C action |
| `ACTIVE` / `IDLE` / `BUSY` / `DEGRADED` | department restructured/decommissioned | `RETIRED` | Tier C action |

### 3.3 Diagram

```
REGISTERED → ACTIVE ⇄ BUSY ⇄ IDLE
                 │              │
                 └──→ DEGRADED ─┘
                        │
                        ▼
                     RETIRED
```

**Invariant:** `RETIRED` is only reachable via a Tier C action (architecture
§2, §4) — Hermes cannot retire an agent on its own authority, however
badly degraded it is. A permanently unhealthy agent stays `DEGRADED`
(routing paused) until the CEO acts.

---

## 4. Approval Queue Item State Machine

The Approval Queue (architecture §0.1) owns this machine; Hermes is the
originator of `FILED` and the consumer of `RESOLVED`, but does not drive
the states in between.

### 4.1 States

`FILED`, `PENDING_CEO`, `RESOLVED`, `EXPIRED`.

### 4.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | Hermes sends `escalation` | `FILED` | corresponds to task state `ESCALATED` (§2) |
| `FILED` | Approval Queue issues `approval_request` to CEO | `PENDING_CEO` | — |
| `PENDING_CEO` | CEO sends `approval_resolution` (approve / reject / alternative) | `RESOLVED` | — |
| `PENDING_CEO` | CEO sends `approval_resolution(defer)` | `PENDING_CEO` | self-loop, item stays visible with updated age (protocol doc §4.10) — never silently ages out |
| `PENDING_CEO` | age exceeds a CEO-configured staleness threshold, if one is set | `EXPIRED` | opt-in only; absent a configured threshold this transition never fires, since architecture §2 requires unanswered escalations to stay queued and visible, not auto-resolved |

### 4.3 Diagram

```
FILED → PENDING_CEO ──→ RESOLVED
             │  ▲
             └──┘  (defer, self-loop)
             │
             ▼ (only if a staleness threshold is configured)
          EXPIRED
```

**Invariant:** `RESOLVED` is the only state that unblocks the originating
task (§2, `ESCALATED` → re-enter flow or `FAILED`). `EXPIRED` is not a
silent default — architecture doc §2 is explicit that an unanswered
escalation "stays queued and visible, it is not auto-approved," so
`EXPIRED` exists only where the CEO has explicitly opted into a
staleness policy, and even then it is a visible state, not a deletion.

---

## 5. Review & Freeze

**Review pass:**
- ✅ Every terminal state (`DONE`, `FAILED`, `CANCELLED`, `RETIRED`) is
  reachable only through transitions consistent with the tiers defined
  in `HERMES_ARCHITECTURE.md` §2.
- ✅ No state allows Hermes to mark a task `DONE` without a `result`
  message from the owning department (architecture §1: Hermes produces
  no domain output itself).
- ✅ No silent-failure path: every failure transition in §2.2 lands in a
  visible state (`BLOCKED`, `ESCALATED`, or `FAILED`), matching
  architecture §6.
- ✅ Agent retirement requires Tier C, matching architecture §4/§7.

**Freeze:** This document is frozen as v1.0, dependent on
`HERMES_ARCHITECTURE.md` v1.1 and `HERMES_PROTOCOL.md` v1.0. Adding a
state or changing a guard condition requires a new revision.
