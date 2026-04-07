# DR-0002 — Charter Adoption Record (VALIDATION_CHARTER_v1)

**Decision ID:** DR-0002  
**Date:** 2026-04-07  
**Status:** APPROVED (recorded as binding governance adoption for readiness-closure)  
**Decision type:** Artifact adoption / governance activation  

---

## 1. Adoption statement (binding)
The program **adopts** `docs/validation/VALIDATION_CHARTER_v1.md` (Document ID: **VALIDATION_CHARTER_v1**) as the **binding governance charter** for:
- the **Readiness-Closure phase (Wave R)**, and
- all decisions that govern **pilot entry**, **pilot execution**, and **resumption eligibility**.

This adoption is operational: the authority model, veto rights, gate discipline, and decision recording obligations defined in `VALIDATION_CHARTER_v1` are now the governing basis for readiness-closure decision-making and enforcement.

---

## 2. What this adoption authorizes (and why)
This adoption authorizes **governance/program-control** actions required to run readiness-closure safely and without drift:
- Establish and maintain an **append-only decision log** for Wave R decisions (register + individual decision records).
- Apply the charter’s **authority model** for readiness decisions:
  - VSG go/no-go authority (quorum and decision rule), and
  - non-overridable **veto rights** (privacy, security, audit, legal, payroll controls).
- Use the charter’s gate language (PASSED/FAILED/BLOCKED) to define readiness evidence closure obligations and to structure follow-on readiness work items.

---

## 3. What this adoption does NOT authorize (explicit non-authorization)
This adoption does **not** authorize:
- **Pilot entry** or **pilot execution** (these remain prohibited under DR-0001 and binding readiness-closure rules).
- Any resumption of deferred/paused downstream feature work (S13 DEFERRED; Waves 4–7 PAUSED).
- Any creation of fabricated evidence artifacts or fake results.
- Starting **R02** (pilot scope lock) content work as part of this R01 adoption record.
- Any product code work, schema expansion, or feature delivery.

In short: this adoption authorizes **governance enforcement**, not execution.

---

## 4. Authority model (operationalization)
Authority and veto rules for readiness-closure decisions are adopted by reference from `VALIDATION_CHARTER_v1`:
- **Go/No-Go authority:** Validation Steering Group (VSG) (see `VALIDATION_CHARTER_v1` §11)
- **Quorum:** per charter (Reward, Payroll, Legal, Privacy, Security, Internal Audit represented)
- **Veto rights:** per charter (see `VALIDATION_CHARTER_v1` §10); veto cannot be overridden by majority vote

**Operational rule (binding):** Any decision that changes pilot status (e.g., moving from blocked to eligible) is invalid unless it satisfies:
- VSG quorum and approval, and
- no active veto, and
- a recorded decision record in the decision log.

---

## 5. Veto relevance (explicit)
Veto holders remain fully empowered during readiness-closure. In particular:
- Privacy/GDPR veto applies to any attempt to handle real/pseudonymized worker pay/identity data without explicit approvals and controls.
- Security veto applies to any unacceptable access/logging gaps for pilot data handling.
- Internal Audit veto applies to missing evidence, non-reproducibility, or control bypass.
- Legal veto applies to methodology defensibility gaps and insufficient approval evidence.
- Payroll controls veto applies to unreconciled remuneration truth or uncontrolled earning-code mapping drift.

Readiness-closure work must be structured so that veto conditions can be evidenced as lifted (by later decisions), not argued away.

---

## 6. Required next governance steps (immediate)
The following governance steps are required immediately as part of readiness-closure discipline:
- Maintain `docs/readiness-closure/01_decision-log/DECISION_LOG.md` as the **append-only** register.
- Record the NO-GO and charter adoption as the **first entries** (DR-0001 and DR-0002).
- Use decision records (new DRs) to record any future approvals, veto invocations/lifts, and the eventual R17 readiness re-review outcome.

---

## 7. Relationship to the decision log
This adoption is registered in the readiness-closure decision log:
- Register: `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- Decision record: this file (`docs/readiness-closure/00_charter/CHARTER_ADOPTION_RECORD.md`)

**Append-only rule:** If this adoption is revised, it must be superseded by a new decision record (do not rewrite this record after approval).

---

## 8. Approval / sign-off placeholders (no fabricated signatures)
**Decision body:** Validation Steering Group (VSG)

Sign-off placeholders (roles):
- Reward methodology owner: ____________________  Date: __________
- Payroll controls owner: ______________________  Date: __________
- HRIS / People Data owner: ____________________  Date: __________
- Legal representative: ________________________  Date: __________
- Privacy / GDPR lead: _________________________  Date: __________
- Security lead: ______________________________  Date: __________
- Internal Audit / Assurance lead: _____________  Date: __________

Veto check (per `VALIDATION_CHARTER_v1` §10):
- Active veto invoked against charter adoption? [ ] Yes  [ ] No
- If Yes: veto holder role + reference to veto decision record: __________________________

---

## 9. Related artifacts / references
- Decision log register: `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- NO-GO decision record: `docs/readiness-closure/01_decision-log/DR-0001_NO_GO_READINESS_CLOSURE.md`
- Adopted charter: `docs/validation/VALIDATION_CHARTER_v1.md` (Document ID: VALIDATION_CHARTER_v1)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Enterprise redirect decision (binding): `docs/validation/REDIRECT_DECISION.md`
- Authoritative queue: `.claude/SLICE_QUEUE.md`

