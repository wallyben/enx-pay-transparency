# PILOT_SCOPE_LOCK_RECORD — Readiness-Closure (Wave R / R02)
**Artifact ID:** R02-PILOT-SCOPE-LOCK  
**Status:** DRAFT (binding once DR-0003 is APPROVED)  
**Applies to:** Readiness-Closure evidence work packages R02–R17 (governance/program-control only)  
**Non-goals (binding):** This artifact does **not** authorize pilot entry, pilot execution, data extraction, feature work, or any evidence fabrication.

**MOCK / SYNTHETIC PERIMETER CLARIFICATION (binding for interpretation):** The current perimeter values include identifiers marked “(MOCK)” and are **synthetic**. They exist only to preserve build/test continuity and governance structure during readiness-closure documentation. They must **not** be interpreted as a real pilot perimeter approval, and they do **not** authorize pilot entry or pilot execution. Real pilot scope approval requires replacement with real, enterprise-approved values and DR-0003 approval under the Validation Charter authority/veto model.

---

## 1. Purpose
This record locks **one explicit pilot perimeter** for the Readiness-Closure phase so that all follow-on readiness evidence work:
- references a single, approved scope, and
- cannot drift via implicit assumptions or “temporary” expansions.

This perimeter is the authoritative scope input for Validation Charter **Gate G1 — Pilot scope locked** and for Readiness-Closure work items **R02–R17**.

---

## 2. Scope lock authority
**Governing authority model:** Validation Steering Group (VSG) with quorum and veto-awareness, as adopted for Readiness-Closure under:
- `docs/validation/VALIDATION_CHARTER_v1.md` (§10 veto rights; §11 authority; Gate G1)
- `docs/readiness-closure/01_decision-log/DR-0001_NO_GO_READINESS_CLOSURE.md` (pilot entry prohibited until R17 passes)
- `docs/readiness-closure/00_charter/CHARTER_ADOPTION_RECORD.md` (DR-0002 adopts the charter)

**Binding rule:** This scope becomes binding only when **DR-0003** is **APPROVED** and the VSG confirms **no active veto** applies.

---

## 3. Locked perimeter
This section defines the pilot perimeter that Readiness-Closure evidence artifacts must use.

### 3.1 Country
- **Country (locked):** Ireland (IE)
- **Rule:** Exactly **one** country only.

### 3.2 Legal entity scope
- **In-scope legal entity / entities (locked):**
  - `legal_entity_id`: **WD-IE-COMP-001**
  - `legal_entity_name`: **Euronext Ireland Pilot Entity (MOCK)**
- **Rule:** Exactly **one** legal entity only (no “and others”).

### 3.3 Payroll provider scope
- **Payroll provider / system instance (locked):**
  - `payroll_provider_id`: **PAY-IE-PILOT-001**
  - `payroll_provider_name`: **Payroll Provider IE Instance A (MOCK)**
- **Rule:** Exactly **one** payroll provider/system instance only (single `payroll_provider_id`).

### 3.4 Payroll run / period scope
- **Payroll period(s) (locked):**
  - `pay_period_start_date`: **2026-02-01**
  - `pay_period_end_date`: **2026-02-28**
- **Payroll run scope (locked):**
  - **Regular runs:** include **only** the single closed regular on-cycle run: `payroll_run_id` = **RUN-IE-2026-02-REG-001**
  - **Off-cycle runs:** **EXPLICIT POLICY REQUIRED** (choose one and lock it):
    - [x] Excluded entirely
    - [ ] Included (must be flagged + segmented)
  - **Retro adjustments:** **EXPLICIT POLICY REQUIRED** (choose one and lock it):
    - [x] Excluded entirely
    - [ ] Included (must be identifiable and handled deterministically)

**Important:** Period/run policies are scope, not “implementation details”. Any change is a scope change.

---

## 4. In-scope populations
In-scope means: records that meet the perimeter and inclusion rules below **and** satisfy fail-closed eligibility (no missing pilot-mandatory fields, no blocked joins, no unresolved blocker reconciliation outcomes).

### 4.1 In-scope worker population (locked)
Must meet all of:
- **Country/legal entity:** worker is employed/assigned to an in-scope legal entity in the locked country.
- **Employment status / inclusion rule (locked):** **employees paid in-period** — worker must have ≥1 payroll earning line in the included regular on-cycle run (Section 3.4).
- **Paid population anchor:** **Payroll-anchored inclusion check required** (per Validation Charter and SoT Matrix principle: payroll is anchor truth for remuneration).
- **Population grain (locked):** **worker (person)**. If multiple assignments exist in-period, include **primary paid assignment only**; non-primary assignments are out of scope unless a superseding decision explicitly includes them.

### 4.2 In-scope earning lines / pay records (locked)
Must meet all of:
- **Provider context:** earning lines are from the locked `payroll_provider_id`.
- **Period/run:** earning lines fall within the locked period/run policy (including explicit off-cycle/retro policy).
- **Currency:** **single currency only** for the in-scope payroll run: `currency_code` = **EUR**

---

## 5. Out-of-scope populations
The following are explicitly out of scope for the pilot perimeter (must not be included in readiness evidence work unless the scope is formally changed via DR superseding DR-0003):

### 5.1 Out-of-scope worker populations (explicit)
- **Countries outside the locked country**
- **Legal entities not explicitly listed as in-scope**
- **Workers without payroll anchoring** (cannot be joined to payroll within the locked provider/period/run scope)
- **Non-employees** (e.g., contractors/externals) unless explicitly included by a superseding scope decision record
- **Any population not explicitly included in Section 4**

### 5.2 Out-of-scope pay records (explicit)
- **Earning lines outside the locked period(s)**
- **Earning lines from payroll providers/system instances outside the locked `payroll_provider_id`**
- **Any off-cycle/retro lines not covered by the locked policy in Section 3.4**
  - Off-cycle: out of scope when `off_cycle_flag = true`
  - Retro: out of scope when `retro_flag = true` (or equivalent retro indicator)

---

## 6. In-scope systems and extracts
The pilot is multi-source by design (Validation Charter §3). For this locked scope, the minimum in-scope systems are:

### 6.1 In-scope systems (locked)
- **HRIS / workforce system:** Workday (or successor HRIS) — worker identity and job attributes. In-scope instance: **Workday Production Tenant (MOCK)**
- **Payroll system:** the single locked payroll provider/system instance (Section 3.3).
- **Reward / job architecture source (if separate):** **Out of scope for perimeter v1 by default**. Include only if Methodology v1 evidence requires it and only via a superseding scope decision record.
- **Identity and access management (for approvals/auditability):** **Microsoft Entra ID Production Tenant (MOCK)**

### 6.2 In-scope extracts (locked by type; no raw extracts committed)
Readiness-Closure artifacts may define extract **schemas/field lists and metadata** but must not commit real extracts to the repo.

Required extract types for this scope:
- **HRIS extract (pilot perimeter):** worker + employment/assignment + job/position attributes for in-scope population.
- **Payroll extract (pilot perimeter):** earning lines + earning codes + pay period boundaries + payroll run identifiers + off-cycle/retro indicators.
- **Reward/job architecture reference extract (if in scope):** job level/grade references used by Methodology v1.
- **Extract metadata (mandatory):** extract timestamp, source system instance identifier, scope filters applied, row counts, and perimeter alignment evidence.

---

## 7. Mandatory fields required from each source
This record specifies the minimum fields required per source for readiness evidence work under this scope. It is aligned to SoT Matrix v1 pilot-mandatory intent; the definitive pilot-mandatory field list remains owned by SoT Matrix v1.

### 7.1 HRIS (Workday/HRIS) — mandatory minimum
- `hris_worker_id` (immutable worker/person identifier in HRIS)
- `worker_id` (canonical worker id if present; otherwise crosswalked)
- `employment_status`
- `employment_type`
- `contract_type`
- `hire_date`
- `termination_date` (if applicable)
- `legal_entity_id`
- `legal_entity_name`
- `country_code`
- `position_id` (or equivalent assignment/position identifier)
- `job_title`
- `job_level` / `grade` (if used by Methodology v1; otherwise explicitly out of scope)
- `fte_fraction`
- `gender`

### 7.2 Payroll — mandatory minimum (anchor truth for remuneration)
- `payroll_provider_id`
- `payroll_worker_id`
- `payroll_run_id`
- `pay_period_start_date`
- `pay_period_end_date`
- `payment_date` (if distinct / required for run classification)
- `off_cycle_flag`
- `retro_flag` (or equivalent retro indicator)
- `legal_entity_id` (as represented in payroll; crosswalk rules must be explicit)
- `earning_code`
- `earning_description` (if available; used for mapping evidence)
- `currency_code`
- `earning_amount`
- `earning_quantity` (hours/units where applicable; if used for normalization)

### 7.3 Reward / job architecture (if in scope) — mandatory minimum
**TBD — only include if required by Methodology v1.** If in scope, at minimum:
- `job_level_reference_id`
- `job_level`
- `job_family` / `job_family_id` (if used)
- effective dating fields (`effective_start_date`, `effective_end_date`) if applicable

### 7.4 Extract metadata (mandatory; all sources)
- `extract_generated_at_iso`
- `source_system_instance_id`
- `scope_filter_statement` (human-readable and machine-parseable if available)
- `row_count`
- `content_digest` (hash of extract file or equivalent, stored outside repo if necessary)

---

## 8. Join key strategy
Join strategy is part of scope and must be explicit to avoid drift.

### 8.1 Primary joins (locked)
At minimum the pilot must support and measure join integrity for:
- **HRIS worker/assignment ↔ payroll worker**:
  - **locked strategy:** `hris_worker_id` ↔ **controlled crosswalk** ↔ `payroll_worker_id`
  - **crosswalk artifact (required):** **XWALK-HRIS-PAYROLL-IE-PILOT-v1.0 (MOCK)**
  - **rule:** crosswalk must be deterministic and unique (no 1:many or many:many mappings for in-scope population)
- **Legal entity alignment**:
  - `legal_entity_id` (HRIS) ↔ `legal_entity_id` (Payroll)
  - if identifiers differ, a controlled crosswalk is required: **NOT REQUIRED — identifiers aligned between HRIS and payroll for mock pilot perimeter**

### 8.2 Join integrity rules (binding posture)
- **Uniqueness expectations** for mandatory identifiers must be declared (1:1 where expected).
- Duplicates, orphans, and ambiguous joins are treated as **BLOCKERS** unless explicitly exception-approved under charter authority/veto model.
- Join integrity measurement thresholds are governed by Validation Charter Gate G7 (>=99% for required joins, unless a higher threshold is set and approved).

---

## 9. Included remuneration components
Included components are defined as **mapped payroll earning lines** within the locked perimeter and component mapping version.

**Included (locked for pilot perimeter v1):**
- **Base pay** (fixed remuneration components paid in the period; mapped earning codes)
- **Variable pay / bonus** (mapped earning codes)

**Conditional inclusion (must be explicitly chosen in DR-0003):**
- **Allowances / one-time payments**:
  - [ ] Included (requires explicit mapping governance + reconciliation obligations)
  - [x] Excluded

---

## 10. Excluded remuneration components
Explicitly excluded unless later scope change is approved via a superseding decision record:
- Any remuneration components not mapped to included components under the approved earning-code mapping version
- Any components outside the locked period/run perimeter
- Any components from out-of-scope entities/countries/providers
- Any “nice-to-have” remuneration elements introduced without an explicit scope change decision

---

## 11. Working assumptions
These assumptions are explicit so they can be challenged; they are not implicit permissions.

- Exactly one country, one payroll provider/system instance, and a narrow legal-entity list will be selected.
- Payroll is anchor truth for remuneration fields (Validation Charter §3.2; SoT Matrix v1 principles).
- No readiness evidence artifact may silently broaden scope (e.g., adding entities, adding periods, adding pay components).
- Readiness-Closure produces governance artifacts and evidence structures only; it does not execute the pilot.

---

## 12. Dependencies and blockers
The perimeter fields marked **TBD** are blockers to treating this record as binding scope.

**Blockers to binding scope lock:**
- Replace all placeholder markers (**`<<INSERT_...>>`**) with real approved values:
  - Irish `legal_entity_id` and `legal_entity_name` (Section 3.2)
  - `payroll_provider_id` and provider/system instance name (Section 3.3)
  - closed on-cycle `pay_period_start_date`, `pay_period_end_date`, and `payroll_run_id` (Section 3.4)
  - `currency_code` (Section 4.2)
  - HRIS system instance identifier/name (Section 6.1) (if multiple exist)
  - IAM system identifier/name (Section 6.1)
  - crosswalk artifact reference(s) for HRIS↔Payroll identity and (if needed) legal entity alignment (Section 8.1)
- DR-0003 must be **APPROVED** under the Validation Charter authority model (VSG quorum + no active veto).

### 12.1 Open approval blockers (fill-in checklist)
The following placeholders must be resolved with real values before DR-0003 can be approved and Gate G1 can be treated as passed:
- **Resolved for approval readiness**: all perimeter placeholders have been replaced with explicit values (some marked “(MOCK)” as provided) and `NOT REQUIRED` statements where applicable.

**Dependencies (inputs this record must align to):**
- Validation Charter v1 Gate G1 structure and authority rules (`docs/validation/VALIDATION_CHARTER_v1.md`)
- SoT Matrix v1 pilot-mandatory fields, owners, and severities (`docs/data-governance/source-of-truth-matrix_v1.json`)
- Methodology v1 evidence requirements and override governance (`docs/methodology/METHODOLOGY_v1.md`)
- Reconciliation framework v1 exception taxonomy usage and payroll anchoring (`docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`)

---

## 13. Change-control rule for scope changes
**Hard rule (binding):** No change to the locked perimeter is valid unless:
- a **new decision record** is created that **supersedes DR-0003**, and
- it is approved under the Validation Charter authority model (VSG quorum + no active veto), and
- the updated scope lock record is revised with a new artifact revision marker and references the superseding DR.

Scope changes include (non-exhaustive):
- changing country, legal entity list, payroll provider/system instance
- expanding/altering period(s) or run inclusion policy
- changing population inclusion/exclusion rules
- adding/removing remuneration components
- changing join key strategy or identity grain

---

## 14. References to governing artifacts
- Authoritative execution queue: `.claude/SLICE_QUEUE.md` (Wave R; R02 purpose; pilot blocked until R17)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Decision log register: `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- NO-GO decision: `docs/readiness-closure/01_decision-log/DR-0001_NO_GO_READINESS_CLOSURE.md`
- Charter adoption: `docs/readiness-closure/00_charter/CHARTER_ADOPTION_RECORD.md` (DR-0002)
- Validation Charter v1 (authority model + Gate G1): `docs/validation/VALIDATION_CHARTER_v1.md`
- Enterprise hardening redirect (binding): `docs/validation/REDIRECT_DECISION.md`
- Source-of-Truth Matrix v1: `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md` and `docs/data-governance/source-of-truth-matrix_v1.json`
- Methodology v1: `docs/methodology/METHODOLOGY_v1.md`
- Reconciliation framework v1: `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
- Confidence model v1: `docs/confidence/CONFIDENCE_MODEL_v1.md`

