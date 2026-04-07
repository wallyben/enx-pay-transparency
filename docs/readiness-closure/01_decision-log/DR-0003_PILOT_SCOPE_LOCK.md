# DR-0003 — Pilot scope lock for readiness-closure evidence work (R02)

**Decision ID:** DR-0003  
**Date:** 2026-04-07  
**Status:** PROPOSED (becomes binding once APPROVED and registered)  
**Decision type:** Scope lock (Validation Charter Gate G1; Readiness-Closure R02)  

---

## 1. Title
Pilot scope lock for Readiness-Closure (Wave R) — single perimeter for evidence work.

---

## 2. Decision statement
The program will operate all Readiness-Closure evidence work packages (R02–R17) against **one explicitly defined pilot perimeter** as documented in:
- `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`

This decision, once approved, **locks** that perimeter so that:
- all readiness evidence artifacts are scoped consistently, and
- no scope drift is permitted via implicit assumptions or ad-hoc expansions.

This decision does **not** authorize pilot entry or pilot execution. Pilot entry remains prohibited under DR-0001 until R17 passes and a subsequent GO decision is recorded.

**Approval constraint (fail-closed):** DR-0003 must not be signed/approved while `PILOT_SCOPE_LOCK_RECORD.md` still contains placeholder markers (e.g., `<<INSERT_...>>`) for core perimeter values (entity/provider/period/run/joins). Placeholders must be replaced with real, approved values prior to approval.

**Perimeter values present:** The scope lock record now contains explicit perimeter values (some marked “(MOCK)” as provided) and explicit `NOT REQUIRED` statements where applicable. DR-0003 remains **PROPOSED** until VSG approval and veto check are completed.

**MOCK / SYNTHETIC PERIMETER CLARIFICATION (binding for interpretation):** The currently recorded perimeter values include identifiers marked “(MOCK)” and are **synthetic**. They are valid only for build/test continuity of readiness-closure governance artifacts and must not be interpreted as real pilot scope approval. Real pilot scope approval requires: (1) replacement of synthetic/mock values with real, enterprise-approved values, and (2) VSG approval with veto clearance as required by the Validation Charter.

---

## 3. Scope being locked
The locked pilot perimeter is the exact scope defined in `PILOT_SCOPE_LOCK_RECORD.md`, including:
- country
- legal entity scope
- payroll provider/system instance
- payroll period(s) and run inclusion policy (including off-cycle/retro policy)
- in-scope and out-of-scope populations
- in-scope systems and extract types (no raw extracts committed)
- mandatory fields and join key strategy
- included and excluded remuneration components
- explicit assumptions, dependencies, and blockers

**Approved perimeter selection (to be made exact by replacing placeholders):**
- **Country:** Ireland (IE)
- **Legal entity:** exactly one Irish legal entity (Workday Company) — `legal_entity_id` / `legal_entity_name` must be explicitly stated in the scope lock record
- **Payroll provider/system instance:** exactly one — `payroll_provider_id` and instance name must be explicitly stated in the scope lock record
- **Payroll period/run:** exactly one closed regular on-cycle payroll period and exactly one on-cycle `payroll_run_id`
- **Off-cycle runs:** excluded
- **Retro adjustments:** excluded
- **Allowances/one-time payments:** excluded
- **Population:** employees paid in-period with deterministic HRIS↔Payroll joins; non-employees and non-paid are excluded
- **Join keys:** `hris_worker_id` ↔ controlled crosswalk ↔ `payroll_worker_id` (plus controlled legal-entity alignment crosswalk if identifiers differ)

---

## 4. Rationale
Readiness-Closure exists to close evidence gaps after a NOT READY outcome. Without a single locked perimeter:
- evidence artifacts cannot be compared or composed into a consolidated readiness bundle,
- join integrity and reconciliation targets can silently shift,
- mapping/earning-code governance can drift,
- auditability and defensibility are undermined by inconsistent population definitions.

This lock operationalizes Validation Charter Gate **G1** and enforces the “no drift” principle stated in `PROJECT_PLAN.md` and `SLICE_QUEUE.md`.

---

## 5. What is explicitly included
Included, once approved:
- Governance-grade definition of a single pilot scope perimeter for Readiness-Closure evidence work
- A locked definition of mandatory fields and join strategy required to measure join integrity and reconciliation (as artifacts/requirements, not executed work)
- Explicit inclusion/exclusion rules for populations and remuneration components
- Change-control rule that forbids scope change without a new decision record

---

## 6. What is explicitly excluded
Excluded (not authorized by this decision):
- Any pilot entry activity (kickoff, scheduling, starting runs)
- Any pilot execution activity (data extraction runs, reconciliation runs on real data, producing pilot results)
- Any product/application code changes, feature work, dashboards, reporting expansion, or schema changes
- Any fabricated evidence artifacts or results
- Any scope expansion “for convenience” (additional countries, entities, providers, periods, populations, components)

---

## 7. What this authorizes
This decision authorizes (once approved):
- Use of the scope record as the single perimeter reference for Readiness-Closure artifacts (R02–R17)
- Rejection of any readiness evidence work product that is not aligned to the locked perimeter
- Creation of future readiness-closure evidence structures that reference this locked scope (without executing the pilot)

---

## 8. What this does not authorize
This decision does not authorize:
- pilot entry or pilot execution (still prohibited and blocked until R17 passes and a new GO decision is recorded)
- data extraction work
- reconciliation execution
- join integrity measurement execution
- earning-code mapping work beyond governance scaffolding
- any feature delivery or product expansion

---

## 9. How scope changes must be approved
**Hard rule:** Any change to the pilot perimeter requires:
- a **new decision record** that **supersedes DR-0003**, and
- approval under the Validation Charter authority model (VSG quorum + no active veto), and
- an updated scope lock record that references the superseding decision record.

No scope change is valid “by email”, “by meeting notes”, or “by implementation convenience”.

---

## 10. Related artifacts
- Pilot scope lock record (this decision’s scope definition): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Decision log register: `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- NO-GO / readiness-closure initiation: `docs/readiness-closure/01_decision-log/DR-0001_NO_GO_READINESS_CLOSURE.md`
- Charter adoption (authority model): `docs/readiness-closure/00_charter/CHARTER_ADOPTION_RECORD.md` (DR-0002)
- Validation Charter v1 (Gate G1; authority/veto model): `docs/validation/VALIDATION_CHARTER_v1.md`
- Enterprise redirect decision (binding): `docs/validation/REDIRECT_DECISION.md`
- Phase definition: `docs/readiness-closure/README.md`
- Authoritative queue: `.claude/SLICE_QUEUE.md`

---

## 10A. Preconditions for approval (no placeholders)
Before DR-0003 may be approved, the following must be true:
- `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md` contains **no placeholder markers** for:
  - `legal_entity_id` and `legal_entity_name`
  - `payroll_provider_id` and provider/system instance name
  - `pay_period_start_date`, `pay_period_end_date`, and `payroll_run_id`
  - required crosswalk artifact references for HRIS↔Payroll identity joins (and legal-entity alignment if needed)
- VSG quorum is met and **no active veto** applies (per `VALIDATION_CHARTER_v1` §10–§11).

### 10A.1 Open approval blockers (must be resolved before signing)
Until the placeholders listed in `PILOT_SCOPE_LOCK_RECORD.md` §12.1 are replaced with real values (or “NOT REQUIRED/NOT APPLICABLE” where explicitly allowed), DR-0003 remains **PROPOSED** and must not be approved.

---

## 11. Sign-off placeholders (no fabricated signatures)
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
- Active veto invoked against scope lock? [ ] Yes  [ ] No
- If Yes: veto holder role + reference to veto decision record: __________________________

