## MAPPING_VERSION_LOCK_v1 — Readiness-Closure (Wave R / R06)

**Artifact ID:** R06-MAPPING-VERSION-LOCK-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute mapping, does **not** authorize pilot entry/execution, does **not** approve real payroll data handling, and does **not** constitute product feature work.

---

## 1. Purpose

This document defines what it means to **lock** an earning-code-to-component mapping version so that:
- reconciliation and downstream truth claims can reference an explicit, reviewable mapping state, and
- unmapped or ambiguous earning codes cannot silently leak into calculations or evidence packs.

**Binding design principle:** mapping must be explicit, versioned, and **non-bypassable** for remuneration truth.

---

## 2. What a mapping version lock means

A **mapping version lock** is a governance declaration that a named mapping version:
- has a defined scope (provider + instance + perimeter reference),
- contains an explicit set of earning-code inventory entries and their mapping statuses,
- identifies which statuses are permissible for downstream truth (typically only `MAPPED_APPROVED` for in-scope remuneration inputs),
- is reviewable and traceable to evidence references, and
- is treated as immutable for downstream runs: consumers must reference the locked version ID, not “latest”.

Locking a version does **not** mean:
- the mapping is correct for all time,
- the mapping is approved for production/pilot execution,
- or that the pilot is ready (gates still apply).

---

## 3. Preconditions for lock

The following are required preconditions to lock a mapping version for readiness-closure governance purposes.

### 3.1 Perimeter binding (required)

The lock must reference the locked perimeter record:
- `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)`

### 3.2 Provider/instance binding (required)

The lock must state:
- `source_payroll_provider`
- `source_instance`

**Rule:** A mapping lock is invalid if it does not declare the instance context.

### 3.3 Inventory completeness posture (required)

The lock must declare the intended completeness basis:
- **Observed-basis** (all codes observed in a defined perimeter extract/run set) — expected in real pilot mode, or
- **Catalog-basis** (all codes from an earning-code reference catalog) — may be used for governance planning.

In mock/test readiness-closure mode, completeness evidence is not executed; the lock must explicitly state the gaps and not fabricate run-derived coverage.

### 3.4 Blocker-capable status rules (required)

Lock must declare that the downstream posture is fail-closed for in-scope remuneration components:
- `UNMAPPED` and `MISCLASSIFICATION_SUSPECTED` are **blocker-capable** for in-scope remuneration inputs.
- Missing `mapping_version` is a **blocker**.
- “Code appears in run but not in inventory” is a **blocker**.

These rules must align to `EARNING_CODE_INVENTORY_v1.md` Section 6.

---

## 4. Required approvals

R06 defines approvals and their expectations; it does not execute them.

### 4.1 Minimum approver roles (required)

- **Payroll Controls Lead** (primary accountable owner for remuneration truth mapping)
- **Internal Audit / Assurance lead** (acknowledgement of evidence sufficiency and change control posture)
- **Legal counsel (employment/regulatory)** (sign-off where mapping policy affects inclusion/exclusion or defensibility)

### 4.2 Mock/test readiness-closure approvals (current mode)

In mock/test governance mode:
- approval sections may be present as placeholders,
- approvals must be recorded as `NOT YET OBTAINED (MOCK/TEST)` if not real,
- and the lock must not be represented as authorizing pilot entry or use of real employee payroll data.

### 4.3 Real pilot approvals (future; not executed here)

A real pilot mapping lock would require:
- approved real perimeter (Gate G1),
- privacy/security clearance (Gate G4),
- and explicit VSG decision(s) acknowledging the mapping lock as a prerequisite input to Gate G8 reconciliation and downstream metrics eligibility.

---

## 5. What changes require a new version

A new mapping version is required when any change affects downstream truth eligibility, including (non-exhaustive):

- **Reclassification**: earning code moves between component families (e.g., `BASE_PAY` ↔ `VARIABLE_PAY`).
- **Scope effect**: an earning code is newly treated as in-scope or out-of-scope for the locked perimeter.
- **Ambiguity change**: an earning code is newly flagged `MISCLASSIFICATION_SUSPECTED` or cleared from that status.
- **Status change**: `UNREVIEWED` → `MAPPED_PROVISIONAL` → `MAPPED_APPROVED` transitions that change eligibility.
- **Provider/instance correction**: any change to `source_payroll_provider` or `source_instance` binding for the mapping set.
- **Evidence correction**: material evidence changes that alter the justification for an approved mapping.

**Rule:** do not “edit in place” and keep the same version label if the meaning changes. New meaning → new version.

---

## 6. What lock authorizes

Within readiness-closure governance mode, a mapping version lock authorizes:
- downstream artifacts (e.g., reconciliation dry-run plans) to reference a single, explicit mapping version identifier,
- deterministic evaluation of blocker rules (e.g., “unmapped in-scope code blocks downstream truth”),
- and review of mapping governance readiness without executing the pilot.

---

## 7. What lock does not authorize

A mapping version lock does **not** authorize:
- pilot entry or pilot execution (still prohibited until R17 passes),
- extraction of real payroll data,
- reconciliation execution or acceptance of reconciliation outcomes,
- product feature work, pipelines, or mapping engine implementation,
- or any claim that mapping is complete for real payroll operations.

---

## 8. Relationship to reconciliation and exceptions

Mapping governance is a prerequisite to reconciliation because reconciliation is payroll-anchored and requires:
- component mapping verification,
- explicit handling for unmapped/misclassified codes,
- and explicit mapping version traceability.

This lock artifact is therefore a prerequisite input to:
- R07 reconciliation dry-run structure (planning only in readiness-closure),
- the reconciliation framework’s “unmapped earning code = BLOCKER” default rule,
- and later exception register governance (R08) where specific mapping-related exceptions would be coded and dispositioned.

**Rule:** If reconciliation residuals or anomalies suggest mapping issues, the correct posture is:
- flag `MISCLASSIFICATION_SUSPECTED`,
- create a new mapping version for any correction,
- and rerun reconciliation in real pilot mode (outside readiness-closure).

---

## 9. References

- Authoritative execution queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R06)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Earning code inventory governance: `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_v1.md`
- Earning code inventory template: `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_TEMPLATE_v1.md`
- Validation Charter v1 (fail-closed posture + veto/authority model): `docs/validation/VALIDATION_CHARTER_v1.md`
- Source-of-Truth Matrix v1 (remuneration truth anchor principles): `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`
- Reconciliation framework v1 (requires explicit mapping versioning and fail-closed posture): `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`

