# JOIN_INTEGRITY_PROOF_v1 — Readiness-Closure (Wave R / R05)
**Artifact ID:** R05-JOIN-INTEGRITY-PROOF-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute joins, does **not** implement pipelines, does **not** reconcile payroll, does **not** authorize pilot entry/execution, and does **not** constitute product feature work.

---

## 1. Purpose and scope
This document defines the **join-integrity-proof governance model** required before any reconciliation (R07) or pilot execution can be considered.

It specifies:
- what **join integrity** means for readiness validation,
- which **join paths** must be measured,
- which **join keys** are permitted/required and how they must be declared,
- the **metrics** and **thresholds** that must be reported (perimeter-bound and reproducible),
- how **duplicates / orphans / ambiguity** are classified,
- and the **evidence artifacts** required to claim join integrity has been measured in a reviewable way.

**In scope (R05):**
- join integrity proof model (definitions, measurement obligations, pass/fail rules)
- join integrity report template (structure; no results)
- taxonomy for join failures (duplicate/orphan/ambiguity classification)
- evidence requirements, including drill-down expectations
- explicit mock/test vs real pilot distinction for join proof

**Out of scope (R05):**
- running joins or producing join results
- building ingestion, transformation, or join pipelines
- reconciliation design/outputs (R07)
- earning code mapping governance (R06)
- any pilot execution activity (pilot entry remains prohibited)

---

## 2. Join-integrity principles
These principles are binding for readiness-closure join integrity proof.

- **No downstream truth without measured joins**: no reconciliation, metrics, reporting, or pilot claims may proceed without measured join integrity on required paths.
- **Fail-closed posture**: missing join measurement, missing perimeter binding, or missing drill-down evidence is treated as a blocker for pilot-critical paths.
- **Perimeter-bound and reproducible**: join metrics must be tied to the locked perimeter and the specific extract/crosswalk versions used. A join integrity report is invalid if it cannot be rerun from the same inputs (or immutable references thereto).
- **Ambiguity is toxic on identity paths**: ambiguous joins are not acceptable for pilot-mandatory identity paths (worker identity and legal entity alignment) and are treated as blockers.
- **Uniqueness must be stated**: any join key used must declare its expected uniqueness and grain (e.g., worker, assignment, earning line, period) and must measure violations (duplicate keys, many-to-many).
- **Drill-down to exceptions is mandatory**: aggregate percentages are insufficient; join proof must support reviewer drill-down to exception sets using stable exception classification.
- **Mock/test proof must not be confused with pilot proof**: readiness-closure may define the model and templates; it must not be presented as evidence of real pilot join readiness.

---

## 3. Required join paths
At minimum, join integrity must be measured and reported for the following paths within the **locked perimeter**.

### 3.1 Pilot-critical identity joins (mandatory)
1. **HRIS worker ↔ payroll worker**
   - Purpose: establish worker identity linkage across systems for in-scope population.
2. **HRIS legal entity ↔ payroll legal entity**
   - Purpose: ensure perimeter integrity (country/legal entity scoping) is consistent across sources.

### 3.2 Context joins (mandatory where relevant)
3. **HRIS assignment/position ↔ payroll worker-period context**
   - Purpose: establish the correct employment/assignment context for a worker in a specific payroll period/run.
   - Note: “where relevant” means the pilot scope or methodology requires assignment-level context rather than worker-only grain.

### 3.3 Governed crosswalk joins (mandatory when crosswalks are used)
4. **HRIS and/or payroll identifiers ↔ controlled crosswalk artifact**
   - Purpose: validate that controlled crosswalks used for identity and perimeter alignment are unique, versioned, and fit for join.

**Rule (binding):** If any required join path uses a controlled crosswalk, that crosswalk itself becomes an explicit join boundary that must be measured (crosswalk integrity and uniqueness are part of join integrity).

---

## 4. Required join keys
Every join integrity report must explicitly state the join keys used, including grain and uniqueness expectations.

### 4.1 Join key declaration requirements (mandatory)
For each join path evaluated, the report must declare:
- **left entity** and **right entity**
- **left key fields** and **right key fields**
- **expected mapping cardinality**: one-to-one / one-to-many / many-to-one / many-to-many
- **expected uniqueness constraint(s)** on each side (e.g., “left key unique at worker grain within perimeter”)
- **effective-dating/period constraints** if applicable (e.g., “within payroll_run_id”)
- whether a **controlled crosswalk** was used (and the crosswalk artifact id/version)

### 4.2 Required key families (minimum expectations; concrete fields are perimeter-specific)
This readiness-closure artifact does not prescribe vendor-specific field names, but it requires that the join keys fall into these families:

- **Worker identity keys**
  - HRIS worker identifier (source immutable key)
  - Payroll worker identifier (source immutable key)
  - If HRIS and payroll keys differ, a **controlled crosswalk** join is mandatory (per scope lock join strategy).

- **Legal entity keys**
  - HRIS legal entity identifier
  - Payroll legal entity identifier (or crosswalked equivalent)

- **Assignment/position keys (if used)**
  - HRIS assignment / position identifier(s)
  - Payroll worker-period context identifier(s) (e.g., worker+period/run, assignment id if present, or equivalent deterministic context key)

**Rule (binding):** “Name-based” joins (e.g., joining on free-text worker name) are not permitted for pilot-critical identity joins.

---

## 5. Required join metrics
All metrics must be computed for the specified join path and must be **reproducible** given the referenced source artifacts.

### 5.1 Required counts (minimum; mandatory)
- **total_left_records**
- **total_right_records**
- **matched_record_count**
- **unmatched_left_count**
- **unmatched_right_count**
- **duplicate_key_count**
- **ambiguous_match_count**

### 5.2 Join integrity percentage (mandatory)
The join integrity percentage must be reported as a deterministic ratio. Unless explicitly overridden by the join path definition, compute:

\[
\text{join\_integrity\_pct} = \frac{\text{matched\_record\_count}}{\text{total\_left\_records}} \times 100
\]

**Rule (binding):**
- The report must declare the **denominator** used (left-anchored vs right-anchored vs symmetric).
- For pilot-critical identity joins, the default is **left-anchored** to the population anchor declared in scope (typically payroll-anchored for paid population, but join proof must explicitly declare the chosen anchor).

### 5.3 Blocker/warning classification (mandatory)
Each report must declare:
- **threshold_result**: PASS/FAIL (based on numeric thresholds)
- **blocker_or_warning_result**: BLOCKER/WARNING/NONE (based on taxonomy and mandatory-path rules)

---

## 6. Thresholds and fail conditions
Thresholds must align to the Validation Charter’s fail-closed posture and readiness gate discipline.

### 6.1 Minimum thresholds (binding baseline)
- **Pilot-critical joins target**: join_integrity_pct **>= 99.0%**.
- **Ambiguous joins on mandatory identity paths**: **BLOCKER** (fail regardless of percentage).
- **Duplicate-key conditions on mandatory identity paths**: **BLOCKER** (fail regardless of percentage).

### 6.2 Fail conditions (binding)
A join integrity evaluation is a **FAIL** if any of the following are true:
- join_integrity_pct is below the applicable threshold for that join path, or
- ambiguous_match_count > 0 on a pilot-critical identity join, or
- duplicate_key_count > 0 on a pilot-critical identity join, or
- the report is missing perimeter binding, source artifact references, or join key declaration, or
- drill-down exception evidence is missing (see Section 8).

### 6.3 Threshold governance
- Thresholds must be stated **per join path** (a single global threshold is insufficient if grains differ).
- Any deviation from baseline thresholds requires a formal decision record under the Validation Charter authority model (VSG quorum + no active veto). This slice does not create such decisions.

---

## 7. Duplicate / orphan / ambiguity taxonomy
This taxonomy standardizes join exception classification so results are reviewable and comparable across runs.

### 7.1 Definitions (binding)
- **Duplicate key**: a key expected to be unique appears more than once on a side of the join within the perimeter-bound dataset.
  - Example: multiple HRIS rows share the same `hris_worker_id` when worker grain uniqueness was declared.
- **Orphan (unmatched-left)**: a left-side record has no matching right-side record after applying join constraints.
- **Orphan (unmatched-right)**: a right-side record has no matching left-side record after applying join constraints.
- **Ambiguous match**: a join produces more than one candidate match for a record when a one-to-one mapping was expected, or produces many-to-many mappings where not declared/allowed.

### 7.2 Classification rules (binding)
For each join path, exception sets must be classifiable into:
- **DUPLICATE_KEY_LEFT** and **DUPLICATE_KEY_RIGHT**
- **ORPHAN_LEFT** and **ORPHAN_RIGHT**
- **AMBIGUOUS_MATCH**

Additionally, reports must capture whether ambiguity is caused by:
- **CROSSWALK_NON_UNIQUE** (crosswalk maps one ID to multiple IDs)
- **KEY_COLLISION** (key values collide due to normalization/truncation rules)
- **EFFECTIVE_DATING_OVERLAP** (multiple active rows match within the same period)
- **GRAIN_MISMATCH** (joining worker-grain to assignment-grain without proper constraints)

### 7.3 Severity rules (binding minimum)
- For **pilot-critical identity joins** (worker identity, legal entity alignment):
  - any **AMBIGUOUS_MATCH** is **BLOCKER**
  - any **DUPLICATE_KEY** is **BLOCKER**
  - ORPHAN counts contribute to threshold failure and are blockers if they prevent reaching the target threshold
- For **context joins**:
  - ambiguity may be a blocker or warning depending on declared expected cardinality; must be explicitly stated per path

---

## 8. Evidence requirements
Join integrity proof is only valid if it is traceable, perimeter-bound, and drill-downable.

### 8.1 Required evidence artifacts (governance-only; no fabricated results)
For each join integrity evaluation, the following artifacts must exist (as documents/records or references):

1. **Join integrity report** (uses `JOIN_INTEGRITY_REPORT_TEMPLATE_v1.md`)
2. **Perimeter reference** to the locked scope record
3. **Source artifact references** for each input dataset and crosswalk used (extract manifests or equivalent)
4. **Join key declaration** (in-report) including cardinality and grain
5. **Exception drill-down structure**:
   - a reproducible way to list exception keys/rows for:
     - unmatched-left
     - unmatched-right
     - duplicate keys
     - ambiguous matches
   - in readiness-closure mock/test mode, this may be satisfied by **template structures and required fields** without including real records

### 8.2 Drill-down minimum fields (required in exception listings)
Exception listings (when produced in real pilot mode; outside this slice) must support at minimum:
- exception classification (taxonomy code)
- join path id
- left key values and/or right key values (as applicable)
- source artifact reference(s) and row identifiers (or stable record reference)
- owner role and disposition status (by reference to exception register governance in R08; not implemented here)

### 8.3 Prohibited evidence behaviors (binding)
- Do not fabricate join results, percentages, row counts, or exception lists.
- Do not claim Validation Charter Gate G7 is passed based on documentation alone.
- Do not commit real extracts or sensitive drill-down rows into the repo.

---

## 9. Mock/test vs real pilot distinction
This section prevents confusion between readiness-closure governance artifacts and real pilot join proof.

### 9.1 Mock/test join proof (current readiness-closure mode)
Mock/test join proof is complete when:
- this proof model exists and is internally consistent with governing artifacts,
- the report template exists and is perimeter-referenceable,
- join paths, metric definitions, thresholds, and taxonomy are defined,
- and evidence expectations are explicit without fabricating outputs.

Mock/test join proof must:
- explicitly label itself **MOCK/TEST GOVERNANCE ONLY**,
- reference the **MOCK/SYNTHETIC perimeter** scope record,
- avoid any implication that joins were executed or that pilot readiness has been achieved.

### 9.2 Real pilot join proof (future; not executed here)
Real pilot join proof requires:
- real, perimeter-scoped extracts (proven per R04 and approved under Gate G1/G4),
- executed join evaluations for each required join path,
- join integrity reports populated with real counts and drill-down exceptions,
- disposition governance for exceptions (R08) and linkage to reconciliation planning (R07),
- explicit decision records for any accepted risk or threshold deviations.

**Rule (binding):** Nothing in this document alone can be used to assert pilot readiness or permit pilot entry.

---

## 10. References to governing artifacts
- Authoritative execution queue and slice status: `.claude/SLICE_QUEUE.md` (Wave R; R05)
- Readiness-Closure phase definition and non-goals: `docs/readiness-closure/README.md`
- Validation Charter v1 (fail-closed posture; Gate G7 join integrity threshold baseline): `docs/validation/VALIDATION_CHARTER_v1.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Source extract proof model + manifest template (inputs must be perimeter-bound):  
  - `docs/readiness-closure/03_extract-proof/SOURCE_EXTRACT_PROOF_v1.md`  
  - `docs/readiness-closure/03_extract-proof/EXTRACT_MANIFEST_TEMPLATE_v1.md`
- Access model baseline (data handling and logging expectations for any join evidence work):  
  - `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md`  
  - `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md`

