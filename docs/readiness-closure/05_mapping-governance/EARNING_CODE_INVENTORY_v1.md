## EARNING_CODE_INVENTORY_v1 — Readiness-Closure (Wave R / R06)

**Artifact ID:** R06-EARNING-CODE-INVENTORY-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute mapping, does **not** classify real earning codes, does **not** run reconciliation, does **not** authorize pilot entry/execution, and does **not** constitute product feature work.

---

## 1. Purpose and scope

This document defines the governance model for maintaining a controlled **earning-code inventory** and a controlled **mapping version lock** so that **remuneration truth cannot drift**.

It specifies:
- an inventory structure (what must be recorded for each earning code),
- a mapping status taxonomy and its semantics,
- explicit **blocker vs warning** rules (fail-closed posture),
- ownership and approval expectations,
- versioning and lock rules, and
- evidence requirements that downstream work (especially reconciliation) will rely on.

**In scope (R06):**
- governance definition for earning-code inventory + template
- mapping status taxonomy
- mapping version lock concept (defined by reference to `MAPPING_VERSION_LOCK_v1.md`)
- blocker/warning rules for unmapped or ambiguous earning codes
- evidence and approval expectations
- explicit mock/test vs real pilot distinction

**Out of scope (R06):**
- extracting earning codes from a real payroll system
- mapping/classifying real earning codes or approving real mappings
- implementing mapping logic, pipelines, or product features
- executing reconciliation, producing reconciliation results, or populating exception registers

**Binding principle:** **No payroll truth without governed earning-code mapping.** Downstream truth claims (reconciliation, metrics inputs, evidence packs) must be **blockable** when earning-code mapping is incomplete or ambiguous.

---

## 2. Inventory principles

These principles are binding for readiness-closure mapping governance.

- **Fail-closed on remuneration mapping:** if an earning code contributes to any **in-scope remuneration component**, it must not silently pass as “unknown”.
- **Explicit ambiguity handling:** ambiguous classification must be represented explicitly (e.g., `MISCLASSIFICATION_SUSPECTED`) and must be **blocker-capable**.
- **Provider/instance specificity:** earning codes are not globally unique across providers/instances. Inventory entries are bound to a `source_payroll_provider` and `source_instance`.
- **Perimeter-bound:** inventory coverage and evaluation are constrained to the locked perimeter (R02 scope lock). Inventory must reference the perimeter record used.
- **No invisible drift:** any change to mapping meaning (classification, component family, inclusion policy) is a versioned change and may require a new mapping version.
- **Evidence-first:** each mapped/approved classification must have an evidence reference (policy, payroll documentation, mapping decision record, or equivalent).

---

## 3. In-scope earning code population

This section defines what earning codes must be represented in the inventory for readiness-closure governance.

### 3.1 Inventory population sources (governance definition only)

In future execution slices (outside R06), the inventory population is expected to be drawn from:
- payroll earning line extracts (per R04 extract proof model),
- payroll earning code catalog/reference extracts (R04 extract type “EARNING_CODE_REFERENCE”),
- and/or payroll configuration exports (earning/deduction code tables).

R06 does **not** obtain these sources; it defines the governance structure that will be used when they exist.

### 3.2 Perimeter-bound inventory rule (binding)

For the locked perimeter:
- Every earning code that appears in the **in-scope payroll earning lines** must have a corresponding inventory entry.
- Every earning code expected to appear due to configuration or policy (even if not observed in a specific run) should be represented to prevent “surprise” codes later.

### 3.3 In-scope vs out-of-scope earning codes

An earning code is **in-scope** when:
- it appears in in-scope payroll earning lines (per perimeter), and
- it contributes to any remuneration component that is **in-scope for the pilot perimeter** (e.g., base pay and variable pay per the current scope lock record).

An earning code may be recorded as **out-of-scope** when:
- it is present in extracts but explicitly excluded by scope (off-cycle/retro exclusion policy, excluded component families), and
- the exclusion is explicit and evidence-referenced (not assumed).

---

## 4. Required inventory fields

The inventory must be maintained using the required fields defined in:
- `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_TEMPLATE_v1.md`

### 4.1 Field requirements (binding)

- All fields marked “required” in the template are mandatory for every inventory entry.
- If a field cannot be populated in mock/test governance mode, it must be set to `NOT AVAILABLE (MOCK/TEST)` with an explanation in `notes` (do not fabricate values).
- `mapping_status`, `mapping_version`, `approval_status`, and `blocker_flag` must be populated for every entry (no null/blank).

### 4.2 Component-family candidate (governance concept)

The `component_family_candidate` field captures the intended remuneration component family classification at a governance level.

R06 does not define a canonical pay component ontology in product contracts; for readiness-closure governance, the inventory must at minimum support these candidate families:
- `BASE_PAY`
- `VARIABLE_PAY`
- `ALLOWANCE_OR_ONE_TIME`
- `BENEFIT_IN_KIND`
- `REIMBURSEMENT_NON_PAY`
- `DEDUCTION_NON_REMUNERATION`
- `TAX_OR_STATUTORY`
- `OTHER_UNCERTAIN`

**Rule:** `OTHER_UNCERTAIN` is allowed only as a temporary classification and must be paired with a non-`MAPPED_APPROVED` mapping status.

---

## 5. Mapping status model

This taxonomy is the minimum required mapping status model for the earning-code inventory. Status values are **exclusive**.

### 5.1 Status values (required)

- **UNREVIEWED**
  - Meaning: entry exists, but no review has been performed. Evidence is typically missing.
  - Default severity: warning (unless the code is in-scope for remuneration inputs; see Section 6).

- **MAPPED_PROVISIONAL**
  - Meaning: a candidate mapping/classification exists but is not fully approved; evidence may be incomplete or awaiting sign-off.
  - Default severity: warning or blocker depending on in-scope usage and ambiguity; see Section 6.

- **MAPPED_APPROVED**
  - Meaning: mapping/classification is approved under the required governance model, with evidence reference(s), and is included in a locked mapping version.
  - Default severity: none (unless other integrity rules fail, e.g., instance mismatch).

- **UNMAPPED**
  - Meaning: code is known to exist (observed or expected) but has no mapping/classification.
  - Default severity: blocker-capable; see Section 6.

- **MISCLASSIFICATION_SUSPECTED**
  - Meaning: code has a mapping/classification but there is credible risk it is wrong (e.g., description mismatch, payroll controls flag, outlier reconciliation residuals).
  - Default severity: blocker-capable; see Section 6.

- **OUT_OF_SCOPE**
  - Meaning: code is explicitly out-of-scope for the locked perimeter’s remuneration components, or excluded by perimeter policy (e.g., excluded off-cycle/retro) with evidence.
  - Default severity: none, unless used contrary to scope policy (then treated as integrity issue; see Section 6).

### 5.2 Approval semantics

Status alone is not sufficient to proceed. Each entry must also capture:
- **approval_status**: `NOT_SUBMITTED` | `IN_REVIEW` | `APPROVED` | `REJECTED`
- **owner_role** and evidence references

**Rule:** `MAPPED_APPROVED` implies `approval_status = APPROVED` and a valid `mapping_version` referencing a locked mapping version.

---

## 6. Blocker vs warning rules

This section defines rules that determine whether a situation must block downstream “truth” (fail-closed posture) or may proceed with explicit, recorded risk.

### 6.1 Blocker rules (minimum required examples; binding)

The following conditions must be treated as **BLOCKER-capable** at minimum, and default to **BLOCKER** for in-scope remuneration components unless explicitly exception-approved under the Validation Charter authority model:

1) **In-scope earning code is `UNMAPPED`**
- Condition: earning code appears in in-scope earning lines and is required to compute in-scope remuneration components.
- Result: `blocker_flag = YES`

2) **In-scope earning code is `MISCLASSIFICATION_SUSPECTED`**
- Condition: code is used in in-scope remuneration components and classification is suspected wrong.
- Result: `blocker_flag = YES`

3) **Mapping version is missing**
- Condition: entry has `mapping_status` other than `OUT_OF_SCOPE` but `mapping_version` is blank/missing, or references a non-locked/unknown version.
- Result: `blocker_flag = YES`

4) **Provider/instance mismatch**
- Condition: earning code observed in run does not match `source_payroll_provider` / `source_instance` context in the inventory entry used, or inventory entries are reused across instances without explicit instance binding.
- Result: `blocker_flag = YES`

5) **Earning code appears in run but not in inventory**
- Condition: earning code found in an in-scope extract/run is absent from the inventory.
- Result: `blocker_flag = YES` (inventory completeness violation)

### 6.2 Warning rules (examples; allowed only with explicit risk posture)

Warnings may proceed only when explicitly recorded as acceptable risk by the governing body (VSG) and when they do not impact pilot-mandatory remuneration truth.

Examples:
- `UNREVIEWED` codes that are **out-of-scope** and demonstrably do not affect in-scope remuneration components.
- `MAPPED_PROVISIONAL` codes that are **not used** in the locked perimeter extracts, with explicit note that they must be approved before any inclusion.

### 6.3 “Ambiguity must not silently pass” rule (binding)

If a code’s classification is uncertain or disputed, it must be represented as:
- `MAPPED_PROVISIONAL` **or** `MISCLASSIFICATION_SUSPECTED`,
and must be evaluated as blocker-capable if it impacts in-scope remuneration components.

---

## 7. Ownership and approval model

R06 defines ownership/approval expectations; it does not execute approvals.

### 7.1 Required roles (minimum; by function)

- **Payroll Controls Lead (owner for remuneration truth)**
  - Accountable owner for earning code mapping correctness for payroll remuneration truth.

- **Reward / Compensation Owner (consulted)**
  - Consulted where earning codes reflect variable pay programs, allowances policy, or compensation structures.

- **Legal Counsel (review/sign-off where needed)**
  - Ensures defensibility for any inclusion/exclusion policies and that ambiguous classifications do not undermine compliance posture.

- **Internal Audit / Assurance (acknowledgement)**
  - Ensures evidence sufficiency, non-bypassable gates, and change control.

Engineering may steward documentation mechanics, but is not the sole approver for remuneration truth mapping.

### 7.2 Approval requirements by mapping status

- `MAPPED_APPROVED` requires:
  - owner approval (Payroll Controls Lead),
  - evidence reference(s),
  - inclusion in a locked mapping version (see Section 8),
  - and no active veto per Validation Charter governance.

- `MAPPED_PROVISIONAL` requires:
  - owner identified and review in progress,
  - explicit statement of what evidence is missing and what blocks approval.

---

## 8. Versioning and lock rules

### 8.1 Mapping version (required)

Every inventory entry must have a `mapping_version`. The version:
- is a stable identifier (e.g., `MAP-EC-YYYYMMDD-vX.Y`),
- references a mapping lock record (see `MAPPING_VERSION_LOCK_v1.md`), and
- is the version used by downstream reconciliation plans and evidence structures.

### 8.2 Lock rule (binding)

No downstream truth claims that depend on remuneration components may proceed unless:
- a mapping version is explicitly referenced, and
- that mapping version is **locked** per `MAPPING_VERSION_LOCK_v1.md`.

### 8.3 Change control: what forces a new mapping version

A new mapping version is required when any of the following change (non-exhaustive):
- an earning code moves between component families (e.g., base ↔ variable),
- an earning code changes inclusion/exclusion status for the in-scope perimeter,
- an earning code is marked `MISCLASSIFICATION_SUSPECTED` or cleared from that status,
- provider/instance scoping changes,
- any blocker-capable code status changes in a way that affects downstream eligibility.

---

## 9. Evidence requirements

### 9.1 Evidence per inventory entry (minimum)

Each entry must include an `evidence_reference` that points to one or more of:
- payroll provider documentation (earning code definition),
- payroll configuration export reference (object id/version),
- decision record reference (if classification is disputed or exception-approved),
- reconciliation residual analysis reference (if misclassification suspected),
- or other controlled evidence acceptable to Internal Audit/Assurance.

**Rule:** Evidence references must be stable pointers; do not embed real payroll data rows in the repo.

### 9.2 Evidence for inventory completeness (minimum)

Downstream (outside R06), completeness evidence is expected to show:
- “earning codes observed in run” set,
- “earning codes in inventory” set,
- set difference analysis, and
- blocker outcomes for any inventory gaps.

R06 defines the expectation only; it does not produce these comparisons.

---

## 10. Mock/test vs real pilot distinction

### 10.1 Mock/test governance mode (current readiness-closure posture)

Mock/test R06 is complete when:
- the inventory governance model and template exist,
- the status taxonomy and blocker rules are explicit and consistent with governing artifacts,
- mapping version lock concept and required approvals are defined,
- and the artifacts are clearly labeled as governance-only with no fabricated results.

Mock/test mode must:
- reference the locked perimeter record marked MOCK/SYNTHETIC,
- avoid any implication that real earning codes were extracted or mapped,
- avoid fabricated approvals or “signed” lock records.

### 10.2 Real pilot mode (future; not executed here)

Real pilot mapping governance would require:
- perimeter with real values approved under Validation Charter authority model (Gate G1),
- privacy/security clearance (Gate G4),
- executed earning-code extraction and inventory population evidence (R04/R07 dependencies),
- and an approved mapping version lock with real approver identities and timestamps.

---

## 11. References to governing artifacts

- Authoritative execution queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R06)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Validation Charter v1 (fail-closed posture, veto/authority model): `docs/validation/VALIDATION_CHARTER_v1.md`
- Source extract proof model (defines earning-code reference extract expectations):  
  - `docs/readiness-closure/03_extract-proof/SOURCE_EXTRACT_PROOF_v1.md`  
  - `docs/readiness-closure/03_extract-proof/EXTRACT_MANIFEST_TEMPLATE_v1.md`
- Join integrity proof model (identity integrity prerequisite for remuneration truth):  
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md`
- Source-of-Truth Matrix v1 (payroll anchor truth; remuneration field governance):  
  - `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`
- Reconciliation framework v1 (explicitly requires governed earning-code mapping versioning and blockers):  
  - `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
- Mapping version lock governance (this folder):  
  - `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md`

