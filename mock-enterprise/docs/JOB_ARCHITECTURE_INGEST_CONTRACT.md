## SYNTHETIC / EXECUTABLE CONTRACT — NOT LEGAL METHODOLOGY

**SYNTHETIC DATA ONLY**  
**NOT REAL PILOT EVIDENCE**  
**NOT FOR LEGAL OR REGULATORY RELIANCE**

This document describes what the **executable** `@enx/category-engine` + `@enx/job-architecture` stack needs from **job architecture–like fields** when driven through the **mock-enterprise** CSV bridge (`mock-intake-profile.ts` + `engine_intake_*.csv`). It is an engineering data contract for deterministic runs, not a sign-off artifact.

---

## 1. Purpose

Define which job-architecture fields must reach the sealed intake row so that **comparable category assignment** can reach `ASSIGNED` at scale, and which absences force `REVIEW_REQUIRED` or `UNASSIGNED` under the current rules implementation.

---

## 2. Why assignment yield is sensitive to upstream descriptor completeness

The extended category path (`assign-category-row.ts`) assigns only when normalized descriptors satisfy one of:

1. **EXACT**: `titleNormalized`, `familyCodeNormalized`, `subfamilyCodeNormalized`, and `gradeOrLevelNormalized` are all non-empty after job normalization, **or**
2. **NORMALIZED_EQUIVALENT**: `familyCodeNormalized`, `subfamilyCodeNormalized`, and `gradeOrLevelNormalized` are all non-empty (title may be absent **only** if the first path is not used—however title is required by the mock mapping profile for sealing, so in practice the second path still requires a present title in the CSV that normalizes cleanly).

If **subfamily** never enters the intake row, `subfamilyCodeNormalized` stays null, neither path is satisfied, and the row becomes **`REVIEW_REQUIRED`** with `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` (unless job-normalization issues already forced review).

**Mock-enterprise lesson (baseline adversarial pack):** the Python adapter wrote `job_subfamily_code` as an empty column for every row while the generator did not emit `job_subfamily` on assignments/catalog. That combination guarantees mass `REVIEW_REQUIRED` independent of scenario mix.

---

## 3. Required upstream fields (for high-yield deterministic assignment)

| Canonical intent | Mock CSV column (`engine_intake_*.csv`) | Must normalize to |
| --- | --- | --- |
| Job title | `job_title` | Non-null `titleNormalized` (and required to seal in mock profile) |
| Job family | `job_family_code` | Non-null `familyCodeNormalized` |
| Job subfamily | `job_subfamily_code` | Non-null `subfamilyCodeNormalized` |
| Grade / level | `job_grade_or_level` | Non-null `gradeOrLevelNormalized` (must parse via `normalizeGradeOrLevelRaw`) |

These four must be present **in the intake file** at assignment time for the **EXACT** path (the default successful path in clean synthetic data).

---

## 4. Optional upstream fields (mock / engine)

| Field | Notes |
| --- | --- |
| Equal-value ruleset | Passed as `equalValueRuleset` in engine meta; not used in mock-enterprise baseline/unlock runs (`null`). |
| Governed category overrides | Optional `governedOverrides` in meta; used for SCN-008/009 demonstrations. |

---

## 5. Mapping from source fields to executable engine inputs

| Synthetic HRIS / catalog source (`mock-enterprise/generated/`) | Adapter mapping in `run_mock_enterprise_demo.py` | Logical intake fields (`mock-intake-profile.ts`) |
| --- | --- | --- |
| `hris_assignments.job_title` (primary) | `job_title` | `JOB_TITLE` |
| `hris_assignments.job_family` | `job_family_code` | `JOB_FAMILY_CODE` |
| `hris_assignments.job_subfamily` (pilot profile only) | `job_subfamily_code` | `JOB_SUBFAMILY_CODE` |
| `hris_assignments.job_level` | `job_grade_or_level` | `JOB_GRADE_OR_LEVEL` |

**Important:** `job_architecture.csv` is **not** consumed by `@enx/job-architecture` in this repo snapshot. Richer catalog evidence must be **joined into the intake CSV** by the adapter (or a future intake pipeline) to affect the engine.

---

## 6. Known failure modes that lead to `REVIEW_REQUIRED`

| Condition | Typical issue code | Notes |
| --- | --- | --- |
| Any job-normalization issue on the row | `CAT_ASN_JOB_NORMALIZATION_ISSUES_PRESENT` | Issues include invalid/ambiguous grade, missing title, invalid family/subfamily code shape. |
| Partial descriptor (e.g. missing subfamily) | `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` | Most common when subfamily column is blank. |
| Equal-value path enabled but no group | `CAT_ASN_EQUAL_VALUE_NO_DECLARED_GROUP` | Not exercised when `equalValueRuleset` is null. |

`UNASSIGNED` occurs when **all** normalized descriptor parts are empty (`CAT_ASN_DESCRIPTOR_EMPTY`).

---

## 7. Minimum pilot-shaped upstream contract (executable, not legal)

For a **deterministic** category assignment run using the current engines:

1. Primary assignment row per in-scope worker with **non-empty** `job_title`, `job_family_code`, `job_subfamily_code`, `job_grade_or_level` that survive normalization (alphanumeric/underscore rules for hierarchy codes; grade tokens parseable).
2. Intake mapping profile marks required logical fields consistently (mock profile requires title, family, grade; subfamily is optional at seal but **mandatory for assignment yield** in practice).
3. If HRIS and catalog disagree, either resolve before intake **or** encode governance explicitly (overrides / methodology workflow)—the stock engine does **not** read a separate catalog file.

---

## 8. Notes on synthetic vs real use

- **Synthetic:** `pilot_shaped_clean` adds deterministic `job_subfamily` values on catalog and assignments to prove engine behavior when the adapter supplies a complete hierarchy.
- **Real:** Subfamily (or an equivalent second hierarchy axis) must be sourced from the governed job architecture / position model and carried into the canonical intake row; leaving it blank will reproduce the same `REVIEW_REQUIRED` pattern at scale.
- This contract does **not** assert legal defensibility of categories—only mechanical assignability under the implemented rule pack.
