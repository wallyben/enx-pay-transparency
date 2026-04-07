# Canonical Job Descriptor Minimum Set (JDMS) v1

**Contract ID:** `JDMS_v1`  
**Version:** `1.0.0`  
**Status:** DRAFT  
**Machine-readable source:** `mock-enterprise/contracts/JDMS_v1.json`

**Synthetic / mock framing:** This artifact describes the **executable** mock-enterprise intake → job normalization → category assignment path. It is **not** real pilot evidence, **not** legal approval, and **not** a governance-template substitution for Wave P readiness.

---

## 1. Purpose and scope

JDMS v1 defines the **minimum canonical job-descriptor fields** that upstream integrations should supply so that:

- **High-yield deterministic category assignment** can run on the current rule pack (same inputs → same assignment outcomes).
- **Equal-value grouping work** can anchor roles to stable identifiers and levels as described in Methodology v1.
- **Later validator and adapter slices** can consume one JSON contract instead of re-deriving rules from scattered docs.

**In scope:** Field requirements, nullability expectations, source-domain ownership hints, and which gaps cause `REVIEW_REQUIRED` vs run-level gate blockage **as implemented today** in the referenced engines.

**Out of scope:** Validator implementation, remediation workflows, production connectors, payroll reconciliation, confidence models, and edits to readiness-closure governance documents.

---

## 2. Why JDMS exists

The classification-unlock exercise showed that the engines **already assign at scale** when descriptor completeness is satisfied on the intake row—specifically when normalized **subfamily** is present alongside family and grade. Baseline synthetic runs that omitted `job_subfamily_code` produced mass `REVIEW_REQUIRED` (`CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR`), which is **mechanical**, not proof that category rules were “too strict.”

JDMS makes that lesson **explicit and machine-readable** so HRIS, job architecture, reward, and engineering share one contract.

---

## 3. Minimum required descriptor fields

For **enterprise-usable classification yield on the current executable category path**, these fields are **mandatory** on the sealed intake row (after adapter mapping):

| Canonical field | Role |
| --- | --- |
| `job_title` | Title normalization and intake sealing (mock profile). |
| `job_family` | `familyCodeNormalized` for assignment paths. |
| `job_subfamily_code` | `subfamilyCodeNormalized`—**required by current assignment logic** (see §8). |
| `job_level` | `gradeOrLevelNormalized` (parsed grade/band token). |

**Strongly required for governed equal-value work (Methodology v1 alignment):**

| Canonical field | Role |
| --- | --- |
| `position_id` | Stable role/position identifier for audit and scoring-unit traceability. |

**Optional but useful:**

| Canonical field | Role |
| --- | --- |
| `job_code` | Catalog/reward crosswalk key when that is how the enterprise joins architecture. |
| `equal_value_group_declaration` | Only when equal-value engine configuration is active (conditional). |

Authoritative booleans per field: **`mock-enterprise/contracts/JDMS_v1.json`**.

---

## 4. Field-by-field contract rules

Each field entry in `JDMS_v1.json` includes:

- **`required_for_*` flags** — category assignment, equal-value grouping, and metrics eligibility (given current metrics gate behavior).
- **`expected_source_domain`** — which upstream function/system classically owns the truth (HRIS assignment vs catalog vs reward).
- **`allowed_aliases`** — common column or logical names (e.g. `job_family_code` → canonical `job_family`).
- **`data_type` / `allowed_nullability`** — expected shape and when null is tolerable.
- **`blocker_if_missing` / `review_required_if_missing`** — how absence surfaces **today** (row-level review vs run-level incompleteness).

**Distinction:** A field can be **mandatory for assignment** (missing ⇒ `REVIEW_REQUIRED`) without being **optional for methodology** (e.g. `position_id` is mandatory for defensible equal-value evidence units but is not the synthetic unlock blocker for category assignment).

---

## 5. Source ownership expectations

| Domain | Typical ownership | Descriptor examples |
| --- | --- | --- |
| **HRIS assignment / position** | HR operations; HRIS technical owner | `job_title`, `position_id`, often mirrored family/level |
| **Job architecture catalog** | Reward / job architecture; data steward | `job_family`, `job_subfamily_code`, `job_code` |
| **Reward / job architecture (level framework)** | Reward | `job_level` (grade/band), mappings and governance |
| **Methodology / equal-value register** | Reward + Legal (governance) | `equal_value_group_declaration` when EV path is on |

**Rule:** If HRIS and catalog disagree, that is a **reconciliation or override** problem—JDMS does not pick a silent winner. The current TS path does not ingest a standalone catalog file; richness must be **projected onto the intake row** by an adapter or future intake pipeline (`JOB_ARCHITECTURE_INGEST_CONTRACT.md`).

---

## 6. What causes classification blockage

**Classification blockage** here means the row **cannot** reach `ASSIGNED` through the normal deterministic paths without an approved override or a configuration change.

On the current engines, missing or non-normalizing **mandatory hierarchy fields** (`job_title`, `job_family`, **`job_subfamily_code`**, `job_level`) prevents satisfying the assignment preconditions (normalized family + **subfamily** + grade/level, with title per path rules). That manifests as **`REVIEW_REQUIRED`** (e.g. `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR`) or, if all normalized parts are empty, **`UNASSIGNED`** (`CAT_ASN_DESCRIPTOR_EMPTY`).

**Optional fields** such as `job_code` do **not** unblock assignment when hierarchy fields are incomplete—they are supporting keys for enterprise joins and future controls.

---

## 7. What causes review-required states

**`REVIEW_REQUIRED`** is the row-level state when the category engine refuses a confident `ASSIGNED` outcome. Common JDMS-linked causes:

- **Insufficient descriptor** after normalization — notably **missing normalized subfamily** with otherwise-valid family and grade (`CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR`).
- **Job-normalization defects** — bad code shapes, missing title where required, unparseable grade (`CAT_ASN_JOB_NORMALIZATION_ISSUES_PRESENT`).
- **Equal-value path on without a declared group** — `CAT_ASN_EQUAL_VALUE_NO_DECLARED_GROUP` (conditional on engine meta).

**Run-level impact:** In the mock metrics engine, **any** `REVIEW_REQUIRED` rows drive `classificationIncomplete`, which **blocks** EU core metrics and can mark the reporting pack incomplete (`METRICS_RUN_GATE_BLOCKED`). JDMS marks those descriptor fields `blocker_if_missing: true` when their absence is intended to prevent a gate-clearing run under that behavior.

---

## 8. Relationship to the synthetic unlock finding

The **`pilot_shaped_clean`** profile supplied **`job_subfamily`** through the adapter into `job_subfamily_code`, holding scenario mix constant. Result: **100% `ASSIGNED`** on the main engine cohort and **`runGateBlocked: false`** versus baseline **~3.7% assigned** dominated by **`CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR`** and missing **subfamily** (`CLASSIFICATION_UNLOCK_REPORT.md`, `CLASSIFICATION_YIELD_COMPARISON.csv`).

**JDMS conclusion:** **`job_subfamily_code` is mandatory for the current executable category-assignment path** if the goal is enterprise-usable yield (high assignment rate without relying on mass overrides). This is a **product/engine contract** statement, not a legal determination of comparability.

---

## 9. What JDMS does and does not prove

**Does:**

- Encode the **minimum descriptor shape** the current engines expect for high-yield assignment.
- Align **source-domain expectations** with enterprise SoT thinking (HRIS vs catalog vs reward).
- Distinguish **assignment blockers** from **optional** descriptors.

**Does not:**

- Prove pilot readiness, payroll truth, join integrity, or reconciliation.
- Replace Methodology v1 sign-off or legal defensibility of categories/equal value.
- Implement validation, workflows, or integrations (future slices consume this file).

---

## 10. References

- `mock-enterprise/contracts/JDMS_v1.json` — authoritative structured contract.
- `mock-enterprise/docs/JOB_ARCHITECTURE_INGEST_CONTRACT.md` — executable ingest bridge and failure codes.
- `mock-enterprise/docs/CLASSIFICATION_UNLOCK_PLAN.md` — synthetic unlock methodology.
- `mock-enterprise/out/reports/CLASSIFICATION_UNLOCK_REPORT.md` — unlock narrative and metrics.
- `mock-enterprise/out/reports/REVIEW_REQUIRED_FORENSICS.md` — baseline `REVIEW_REQUIRED` characterization.
- `mock-enterprise/out/reports/CLASSIFICATION_YIELD_COMPARISON.csv` — baseline vs unlock metrics.
- `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md` — enterprise SoT framing (separate artifact).
- `docs/methodology/METHODOLOGY_v1.md` — equal-value evidence and scoring context.
