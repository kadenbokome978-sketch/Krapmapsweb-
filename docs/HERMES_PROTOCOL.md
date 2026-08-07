# Hermes Protocol

**Component:** Hermes — Chief of Staff, NEXUS AI Operating System
**Status:** FROZEN (v1.0)
**Parent document:** `HERMES_ARCHITECTURE.md` §3 (Communication Protocol)
**Scope of this document:** Message-level protocol only. No transport,
storage, or implementation detail (no queue technology, no wire format).

---

## 1. Purpose

`HERMES_ARCHITECTURE.md` establishes that all coordination traffic shares
one envelope and flows through Hermes as the hub. This document makes
that concrete: the full message-type catalog, who may send what to whom,
and how a message thread is expected to unfold. It does not prescribe a
transport (HTTP, message bus, etc.) — that is an implementation decision
for later.

---

## 2. Envelope (canonical)

Every message on the NEXUS coordination layer uses this shape:

```
{
  message_id       // unique per message
  timestamp        // when sent
  from             // sender identity (see §3)
  to               // recipient identity (see §3)
  type             // one of the types in §4
  ref_task_id      // groups messages into one task thread; null for
                    // messages that don't belong to a task (e.g. a
                    // registry query)
  ref_message_id    // set when replying to a specific prior message
                    // (e.g. an ack, a resolution)
  priority         // critical | high | normal | low — set by whoever
                    // originates the thread and carried through it
  payload          // type-specific body, defined per type in §4
}
```

**Identity strings** follow `<layer>` or `<layer>.<component>`:
`CEO`, `Hermes`, `BriefingEngine`, `ApprovalQueue`, `StrategicPlanning`,
`ControlCentre`, `Workshop`, `ResearchCentre`, `Radar`, `Treasury`,
`Memory`. Department sub-agents are never addressed directly (Hermes
addresses only the department's lead agent) so no sub-agent identity
form is defined at this layer.

---

## 3. Channel Matrix

Who may originate which message types to whom. "—" means not permitted;
the sender must route through Hermes instead.

| From \ To | CEO | Hermes | Dept. lead agent | Briefing Engine / Approval Queue / Strategic Planning |
|---|---|---|---|---|
| **CEO** | — | directive | — | directive (via Strategic Planning), approval_resolution (via Approval Queue) |
| **Hermes** | — (routes via Approval Queue / Briefing Engine) | — | task_assignment, query | status_report (→ Briefing Engine), escalation (→ Approval Queue) |
| **Dept. lead agent** | — | status_update, result, query, decline | — | — |
| **Strategic Planning** | query | directive (initiative-scoped) | — | — |
| **Approval Queue** | approval_request (surfaces to CEO) | approval_resolution | — | — |
| **Briefing Engine** | briefing_delivery | briefing_request | — | — |

A department lead agent that needs input from another department sends
a `query` to Hermes with the target department named in the payload;
Hermes re-issues it as its own `query` to that department (§3.2 of the
architecture doc — no direct department-to-department channel).

---

## 4. Message Types

### 4.1 `directive`
CEO (or Strategic Planning, CEO-authorized) → Hermes. Starts a task
thread.
```
payload: {
  intent_summary      // what the CEO wants, in their own terms
  scope                // initiative-level boundaries, if any
  priority
  origin               // "CEO" | "StrategicPlanning"
}
```

### 4.2 `task_assignment`
Hermes → department lead agent. Product of decomposition (architecture
doc §5, step 4).
```
payload: {
  task_description
  parent_task_id       // set for subtasks of a multi-department directive
  dependencies          // task_ids that must complete first, if any
  expected_duration_band // used by Hermes to detect stalls
}
```
Must be met with an `ack` (§4.7) or a `decline` (§4.8).

### 4.3 `status_update`
Department lead agent → Hermes. Pushed on state change, not polled on a
timer (architecture doc §3.3).
```
payload: {
  task_id
  state          // assigned | in_progress | blocked | done | failed
  detail         // free text, required when state = blocked or failed
}
```

### 4.4 `result`
Department lead agent → Hermes. Terminal message for a task.
```
payload: {
  task_id
  output          // department-defined result payload
  status          // success | partial | failed
}
```

### 4.5 `escalation`
Hermes → Approval Queue. Raised when a decision exceeds Tier A
(architecture doc §2).
```
payload: {
  task_id (or null for a non-task escalation)
  tier              // B | C
  situation
  options            // Hermes's proposed resolution(s)
  recommendation     // Hermes's preferred option, if any
}
```
The Approval Queue takes ownership of the item's lifecycle from here
(see `HERMES_STATE_MACHINE.md` §3).

### 4.6 `query`
Any → Hermes, or Hermes → department. A non-task-creating request for
information (e.g., "is Workshop currently degraded?", "does Research
Centre have capacity this week?").
```
payload: {
  question
  context      // optional
}
```
Answered with an `ack` carrying the answer in its payload, not a new
message type — queries are lightweight by design.

### 4.7 `ack`
Any → any. Acknowledges receipt, optionally carrying an answer or
confirmation.
```
payload: {
  in_response_to    // = ref_message_id
  note              // optional, e.g. an answer to a query
}
```

### 4.8 `decline`
Department lead agent → Hermes. Refuses a `task_assignment` outside its
declared capability (architecture doc §7.2). Hermes must re-route, not
force.
```
payload: {
  task_id
  reason
  suggested_owner    // optional
}
```

### 4.9 `approval_request`
Approval Queue → CEO. Surfaces a filed escalation for CEO decision.
```
payload: {
  escalation_id
  summary            // condensed from the original escalation payload
  options
  recommendation
  age                // how long it's been pending
}
```

### 4.10 `approval_resolution`
CEO → Approval Queue → Hermes. Closes the loop on an escalation.
```
payload: {
  escalation_id
  decision       // approve | reject | defer | alternative
  detail         // required if decision = alternative
}
```
On receipt, Hermes resumes the affected task thread per the decision
(architecture doc §6).

### 4.11 `briefing_request`
Briefing Engine → Hermes. Pulls current state for report composition;
distinct from `query` because it requests a state snapshot, not an
answer to a specific question.
```
payload: {
  scope        // e.g. "daily_summary" | "on_demand" | task_id list
}
```

### 4.12 `briefing_delivery`
Briefing Engine → CEO. Out of Hermes's channel entirely — included here
only so the full loop from §4.11 is visible. Hermes has no role in this
message's content or delivery.

---

## 5. Sequencing and Idempotency

- `message_id` is unique; a receiver that sees a repeated `message_id`
  treats it as a retransmission, not a new event, and does not
  double-process it.
- `ref_task_id` threads every message belonging to one task end to end —
  this is what lets Hermes (and anything auditing Hermes) reconstruct a
  task's full history in order.
- `ref_message_id` is set whenever a message is a direct response
  (`ack`, `approval_resolution`, etc.) so responses are unambiguously
  paired with what they answer, even under concurrent traffic.
- A `task_assignment` is not considered delivered until `ack`'d. Hermes
  treats an un-acked assignment past a short timeout as a delivery
  failure (distinct from a task failure) and retries delivery, not the
  task itself.

---

## 6. Example Flows

### 6.1 Simple single-department task

```
CEO           →directive→        Hermes
Hermes        →task_assignment→  Workshop
Workshop      →ack→               Hermes
Workshop      →status_update(in_progress)→  Hermes
Workshop      →result(success)→   Hermes
Hermes        →briefing_request response included in next→ BriefingEngine
```

### 6.2 Cross-department task hitting an escalation

```
CEO            →directive→                 Hermes
Hermes         →task_assignment→           ResearchCentre   (subtask 1)
Hermes         →task_assignment→           Treasury          (subtask 2)
Treasury       →decline("budget ceiling exceeded")→  Hermes
Hermes         →escalation(tier=B)→        ApprovalQueue
ApprovalQueue  →approval_request→          CEO
CEO            →approval_resolution(decision=approve)→  ApprovalQueue
ApprovalQueue  →approval_resolution→       Hermes
Hermes         →task_assignment (re-sent)→ Treasury
Treasury       →ack→ ... →result(success)→ Hermes
Hermes         → aggregates subtask 1 + 2 results → reports complete
```

### 6.3 Query without task creation

```
Workshop  →query("is Research Centre available this sprint?")→  Hermes
Hermes    →query→  ResearchCentre
ResearchCentre →ack(note="idle, 3 slots open")→ Hermes
Hermes    →ack(note="idle, 3 slots open")→  Workshop
```

---

## 7. Review & Freeze

**Review pass:**
- ✅ Every message type maps to a channel permitted by the matrix in §3
  — no type allows a department-to-department or department-to-CEO
  shortcut.
- ✅ Every escalation/approval path matches architecture doc §2 and §6
  exactly (Tier B/C only, Hermes proposes, CEO/Approval Queue decides).
- ✅ No transport, serialization, or storage technology specified.

**Freeze:** This document is frozen as v1.0, dependent on
`HERMES_ARCHITECTURE.md` v1.1. A change to the channel matrix or message
catalog requires a new revision of both documents in tandem if it implies
an architectural change; a protocol-only clarification may revise this
document alone.
