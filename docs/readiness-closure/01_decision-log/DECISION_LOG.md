# Decision Log — Readiness-Closure (Wave R)
**Artifact:** Decision Log Register + Operating Rules  
**Applies to:** Readiness-Closure phase (Wave R) and any decisions that govern pilot entry prohibition, readiness re-review gating, and resumption authority.  
**Binding inputs:**  
- `.claude/SLICE_QUEUE.md` (authoritative queue and phase constraints)  
- `.claude/PROJECT_PLAN.md` §12B (Readiness-Closure) and §12A (Enterprise Hardening Redirect)  
- `docs/validation/VALIDATION_CHARTER_v1.md` (authority model + veto rights + gate model)  
- `docs/readiness-closure/README.md` (phase definition and non-goals)

---

## 1. Purpose
This decision log is the **append-only, reviewable record** of governance decisions taken during **Readiness-Closure (Wave R)**.

It exists to:
- **Prevent procedural drift** after a **NOT READY** readiness outcome.
- Make **pilot entry prohibition** and **freeze/permit boundaries** explicit and enforceable.
- Provide a single index of decisions that govern what is allowed during readiness-closure and what remains frozen.

**Rule:** No work that changes pilot status, scope, or freeze boundaries is valid unless it is recorded here (or explicitly referenced here as an adopted artifact) with the required authority and sign-off placeholders.

---

## 2. Where decision records live (storage and naming)
Decision records are stored under:
- `docs/readiness-closure/01_decision-log/`

Decision records use this filename convention:
- `DR-000X_<SHORT_TITLE>.md`

The register of all decision records is this file:
- `docs/readiness-closure/01_decision-log/DECISION_LOG.md`

**Cross-folder references:** If a decision is recorded in another folder (e.g., charter adoption record under `00_charter/`), it must still be registered here and must carry a Decision ID in the `DR-000X` series.

---

## 3. Decision ID assignment
Decision IDs are assigned sequentially:
- Format: `DR-0001`, `DR-0002`, `DR-0003`, …
- IDs are never reused.
- If a decision is superseded, the original record remains unchanged and a **new** decision record is created that references the earlier one.

**Ownership:** The readiness-closure operator (program-control function) assigns the next ID at record creation time.

---

## 4. Status model (for each decision record)
Every decision record must declare exactly one status:
- **PROPOSED**: drafted; not yet approved; not binding.
- **APPROVED**: approved under the authority rules in §6; binding.
- **SUPERSEDED**: no longer binding due to a later decision; remains part of the record.
- **REJECTED**: considered and rejected; remains part of the record.

**Append-only rule:** Status changes are made by creating a new decision record that supersedes an earlier one (do not edit prior records to “flip” status).

---

## 5. Required fields for every decision record
Every decision record must include:
- **Decision ID**
- **Date** (ISO; YYYY-MM-DD; time optional)
- **Title**
- **Status** (per §4)
- **Decision statement** (unambiguous, single-paragraph binding statement)
- **Rationale** (why this decision is necessary and correct)
- **Binding implications** (what must happen / must not happen)
- **Freeze vs permitted work** (explicit boundaries)
- **Conditions to reverse** (if applicable; must be explicit and testable)
- **Accountable roles** (role-based; not individuals)
- **Follow-on work packages / slices** (references to Wave R items, e.g., R02–R17)
- **Approval / signature placeholders** (role lines only; no fabricated signatures)
- **Related artifacts / references** (stable paths + IDs/versions)

---

## 6. Authority and sign-off rules (binding)
This decision log is governed by the Validation Charter’s authority model:
- `docs/validation/VALIDATION_CHARTER_v1.md` §11 (Go/No-Go authority: Validation Steering Group; quorum)  
- `docs/validation/VALIDATION_CHARTER_v1.md` §10 (Veto rights; non-overridable)

**Readiness-Closure governance rule (binding):**
- Any decision that affects **pilot entry**, **pilot execution**, or **resumption of paused/deferred feature work** requires:
  - VSG quorum (per charter), and
  - explicit sign-off placeholders for required control functions, and
  - confirmation of **no active veto** (or documentation of veto-based NO-GO).

**Minimum sign-off placeholder roles for binding decisions affecting pilot entry/resumption:**
- Reward methodology owner
- Payroll controls owner
- HRIS / People Data owner
- Legal representative
- Privacy / GDPR lead
- Security lead
- Internal Audit / Assurance lead

Engineering roles may contribute evidence and drafts but **do not have authority** to override the VSG or veto holders.

---

## 7. Evidence reference convention (no fabricated evidence)
Decision records may reference evidence artifacts, but **must not fabricate results**.

Use stable repo paths and explicit version identifiers where applicable:
- **Charter**: `docs/validation/VALIDATION_CHARTER_v1.md` (`Document ID: VALIDATION_CHARTER_v1`)
- **Redirect decision**: `docs/validation/REDIRECT_DECISION.md`
- **Readiness-closure phase definition**: `docs/readiness-closure/README.md`

If referencing evidence outputs that are not committed yet (e.g., future reports), include as:
- **Planned artifact** with a placeholder path and status “NOT YET PRODUCED”, and
- the Wave R slice that will produce the structure (e.g., R05, R07, R16).

---

## 8. Append-only discipline (binding)
- Do not rewrite history.
- Do not edit prior decision statements after approval.
- Corrections must be made as **new decision records** that supersede earlier records.

Exception: Fixing spelling/formatting errors in a *PROPOSED* record is allowed until it is approved. Once approved, treat the record as immutable.

---

## 9. Decision register (append-only)
| Decision ID | Title | Date | Status | Scope impact | Authority required | Record |
|---|---:|---:|---:|---|---|---|
| DR-0001 | NO-GO: Readiness-Closure initiated; pilot entry prohibited | 2026-04-07 | APPROVED (recorded) | Freezes pilot entry/execution; enforces readiness-closure governance | VSG / veto-aware | `DR-0001_NO_GO_READINESS_CLOSURE.md` |
| DR-0002 | Adopt Validation Charter v1 for readiness-closure governance | 2026-04-07 | APPROVED (recorded) | Establishes binding authority model and veto rules for Wave R | VSG / veto-aware | `../00_charter/CHARTER_ADOPTION_RECORD.md` |

