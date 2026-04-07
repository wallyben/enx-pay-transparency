# Descriptor completeness report (pre-engine JDMS gate; synthetic only)

**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**

## 1. Objective

Fail fast on **missing mandatory job descriptors** before `@enx/category-engine` runs, using **`JDMS_v1.json`** as the single machine-readable contract. Surface **where** gaps occur (raw HRIS assignment vs catalog vs demo adapter executable path), at **what scale**, and whether each gap is a **blocker** or **warning** under JDMS flags.

## 2. JDMS version used

- **contract_id:** `JDMS_v1`
- **version:** `1.0.0`
- **status:** `DRAFT`

## 3. Input files evaluated

- `mock-enterprise/generated/hris_workers.csv`
- `mock-enterprise/generated/hris_assignments.csv`
- `mock-enterprise/generated/job_architecture.csv`
- `mock-enterprise/generated/hris_payroll_crosswalk.csv`
- `mock-enterprise/generated/payroll_earnings.csv`
- `mock-enterprise/generated/earning_code_mapping.csv`
- `mock-enterprise/contracts/JDMS_v1.json`

## 4. Cohort summary

Cohort matches **`run_mock_enterprise_demo.py` main engine CSV** eligibility (join OK, excluded failure scenarios SCN-002/003/004/005/006/008/010, gender and FTE present, no unmapped in-scope earnings). Descriptor completeness is assessed on **primary assignment** rows for those workers.

### Profile: `baseline_adversarial`

| Metric | Value |
| --- | --- |
| Pack directory | `mock-enterprise/generated` |
| Workers in pack | 8000 |
| Cohort rows evaluated | **5695** |
| Rows with **blocker**-level descriptor gap | **5695** |
| Rows with **warning**-only issues | **0** |
| **overall_pass** (no blocker rows) | **False** |

### Profile: `pilot_shaped_clean`

| Metric | Value |
| --- | --- |
| Pack directory | `mock-enterprise/generated/pilot_shaped_clean` |
| Workers in pack | 8000 |
| Cohort rows evaluated | **5695** |
| Rows with **blocker**-level descriptor gap | **0** |
| Rows with **warning**-only issues | **218** |
| **overall_pass** (no blocker rows) | **True** |

## 5. Completeness results by required field

### `baseline_adversarial`

| Field | Missing count | Missing rate | Blocker if missing (JDMS) | Top job family | Top job level | Top scenario |
| --- | ---: | ---: | --- | --- | --- | --- |
| `job_family` | 0 | 0.0000 | True | — | — | — |
| `job_level` | 0 | 0.0000 | True | — | — | — |
| `job_subfamily_code` | 5695 | 1.0000 | True | ENG | L4 | SCN-001 |
| `job_title` | 0 | 0.0000 | True | — | — | — |

### `pilot_shaped_clean`

| Field | Missing count | Missing rate | Blocker if missing (JDMS) | Top job family | Top job level | Top scenario |
| --- | ---: | ---: | --- | --- | --- | --- |
| `job_family` | 0 | 0.0000 | True | — | — | — |
| `job_level` | 0 | 0.0000 | True | — | — | — |
| `job_subfamily_code` | 0 | 0.0000 | True | — | — | — |
| `job_title` | 0 | 0.0000 | True | — | — | — |

## 6. Blocker findings

A **blocker row** is any cohort row where a field with **`required_for_category_assignment: true`** and **`blocker_if_missing: true`** is **empty on the executable intake mapping** (what the demo adapter would place on `engine_intake_*.csv`).

- **`baseline_adversarial`:** 5695 / 5695 rows.
- **`pilot_shaped_clean`:** 0 / 5695 rows.

### `job_subfamily_code` (explicit)

- **`baseline_adversarial`:** missing **5695** rows (100.00% of cohort). Assignment and/or catalog omit subfamily for this pack; the TS path does not merge `job_architecture.csv` automatically — catalog richness must be projected onto the intake row (`JOB_ARCHITECTURE_INGEST_CONTRACT.md`).
- **`pilot_shaped_clean`:** missing **0** rows (0.00% of cohort). Executable `job_subfamily_code` is populated for this cohort (HRIS `job_subfamily` → demo adapter → engine CSV).

## 7. Warning findings

- **Methodology traceability:** `position_id` may be present; when empty, JDMS marks it non-blocking for category but **required for equal-value grouping** evidence — reflected in **`warning_count`** / **`row_status_counts`** when conflicts or methodology gaps apply; use `--include-row-detail-json` for per-row field flags.
- **Assignment vs catalog conflicts** on title/family/subfamily/level increment **warning** patterns (not assumed remediated automatically).

## 8. Top offending cohorts (aggregates)

### `baseline_adversarial` — top missing patterns

| Pattern | Count |
| --- | ---: |
| `job_subfamily_code:MISSING_IN_ASSIGNMENT_AND_NO_CATALOG_COLUMN` | 5695 |
| `job_level:CONFLICT_ASSIGNMENT_VS_CATALOG` | 218 |

### `pilot_shaped_clean` — top missing patterns

| Pattern | Count |
| --- | ---: |
| `job_level:CONFLICT_ASSIGNMENT_VS_CATALOG` | 218 |

## 9. Comparison note (multiple dataset profiles)

Two synthetic profiles are compared side-by-side in this run:

| Profile | Cohort rows | Blocker rows | job_subfamily_code missing |
| --- | ---: | ---: | ---: |
| `baseline_adversarial` | 5695 | 5695 | 5695 |
| `pilot_shaped_clean` | 5695 | 0 | 0 |

Expected: **`baseline_adversarial`** omits assignment subfamily → mass executable-path gaps; **`pilot_shaped_clean`** supplies `job_subfamily` → subfamily completeness clears for the cohort.

## 10. What this proves

- A **deterministic, JDMS-driven** pre-engine gate can explain **`REVIEW_REQUIRED` / metrics gate blockage** caused by **descriptor underfeed** before opaque engine outcomes.
- **`job_subfamily_code` completeness** is explicit, measurable, and tied to **raw vs executable** path (including “present in catalog, not mapped” when applicable).

## 11. What this does not prove

- **Not** pilot readiness, **not** payroll truth, **not** legal category defensibility, **not** Wave P real-evidence closure.
- **Not** that every real enterprise will mirror these CSV shapes — only that the **mock pack + demo adapter** satisfy or violate JDMS in a reproducible way.

## 12. Exact next recommended actions

1. **Remediation slice (future):** wire governed catalog → intake projection (or HRIS field population) so `job_subfamily_code` is non-empty where the category engine requires `subfamilyCodeNormalized`.
2. **Optional:** attach this validator to `run_mock_enterprise_demo.py` as an explicit pre-flight stage returning non-zero exit when `overall_pass` is false.
3. **Governance:** keep JDMS as the single contract version for intake validators; bump contract version if category rules change the descriptor minimum.

---

*Run timestamp (UTC): 2026-04-07T23:25:12Z*
