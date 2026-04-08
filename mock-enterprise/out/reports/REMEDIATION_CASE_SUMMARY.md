# Remediation case summary (synthetic mock-enterprise)

**Not pilot evidence. Not legal or regulatory reliance.**

## 1. Objective

Materialize validator and forensics failures into deterministic, owned remediation cases with explicit severity, blocker vs warning posture, and rerun linkage — without mutating sealed runs or production packages.

## 2. Source artifacts used

- `mock-enterprise/out/intermediate/descriptor_completeness_results.json`
- `mock-enterprise/out/intermediate/review_required_forensics.json`
- `mock-enterprise/out/intermediate/unlock_regression_results.json`
- `mock-enterprise/out/intermediate/engine_output_main.json`
- `mock-enterprise/out/intermediate/engine_output_unlock.json`

- Bundle timestamp selected from inputs: **2026-04-07T23:32:28Z**

## 3. Cases generated

- **Total cases:** 11

- `REM-CASE-2b55825082f3` — **JDMS_JOB_SUBFAMILY_CODE_MISSING** (DESCRIPTOR_COMPLETENESS_BLOCKER) — owner **HRIS_PEOPLE_DATA_OWNER** — affected **5695** — blocker=True — rerun=True
- `REM-CASE-3991efecccf9` — **WORKER_JOIN_NOT_OK** (INTAKE_JOIN_INTEGRITY_BLOCKER) — owner **HRIS_PAYROLL_INTEGRATION_OWNER** — affected **473** — blocker=True — rerun=True
- `REM-CASE-3b7fa535c242` — **WORKER_UNMAPPED_EARNING_CODE** (PAYROLL_MAPPING_BLOCKER) — owner **PAYROLL_CONTROLS_OWNER** — affected **240** — blocker=True — rerun=True
- `REM-CASE-52b674cac748` — **WORKER_AMBIGUOUS_JOB_EVIDENCE** (JOB_EVIDENCE_AMBIGUITY_BLOCKER) — owner **HRIS_PAYROLL_INTEGRATION_OWNER** — affected **320** — blocker=True — rerun=True
- `REM-CASE-8b6aab4d5f37` — **CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR** (CLASSIFICATION_INSUFFICIENT_DESCRIPTOR) — owner **HRIS_PEOPLE_DATA_OWNER** — affected **5485** — blocker=True — rerun=True
- `REM-CASE-983aad6abfc1` — **WORKER_MISSING_FTE_PRIMARY_ASSIGNMENT** (DEMO_WORKER_MANDATORY_FIELD_BLOCKER) — owner **HRIS_PEOPLE_DATA_OWNER** — affected **240** — blocker=True — rerun=True
- `REM-CASE-9c2910e645ca` — **WORKER_METHODOLOGY_MISMATCH_SCENARIO_ADAPTER** (METHODOLOGY_ADAPTER_MISMATCH_BLOCKER) — owner **REWARD_GOVERNANCE_OWNER** — affected **160** — blocker=True — rerun=True
- `REM-CASE-a65cffa638ff` — **JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT** (JOB_ARCHITECTURE_HIERARCHY_CONFLICT) — owner **REWARD_JOB_ARCHITECTURE_OWNER** — affected **218** — blocker=True — rerun=True
- `REM-CASE-d94eaececea3` — **WORKER_PENDING_OVERRIDE_SCENARIO** (GOVERNANCE_PENDING_OVERRIDE_BLOCKER) — owner **REWARD_GOVERNANCE_OWNER** — affected **240** — blocker=True — rerun=True
- `REM-CASE-e7a9633c9a2e` — **JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT** (DESCRIPTOR_QUALITY_WARNING) — owner **REWARD_JOB_ARCHITECTURE_OWNER** — affected **218** — blocker=False — rerun=True
- `REM-CASE-ed0a5235cc53` — **WORKER_MISSING_GENDER** (DEMO_WORKER_MANDATORY_FIELD_BLOCKER) — owner **HRIS_PEOPLE_DATA_OWNER** — affected **240** — blocker=True — rerun=True

## 4. Case counts by issue

- **CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR:** 1 case(s), **5485** affected records (sum)
- **JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT:** 2 case(s), **436** affected records (sum)
- **JDMS_JOB_SUBFAMILY_CODE_MISSING:** 1 case(s), **5695** affected records (sum)
- **WORKER_AMBIGUOUS_JOB_EVIDENCE:** 1 case(s), **320** affected records (sum)
- **WORKER_JOIN_NOT_OK:** 1 case(s), **473** affected records (sum)
- **WORKER_METHODOLOGY_MISMATCH_SCENARIO_ADAPTER:** 1 case(s), **160** affected records (sum)
- **WORKER_MISSING_FTE_PRIMARY_ASSIGNMENT:** 1 case(s), **240** affected records (sum)
- **WORKER_MISSING_GENDER:** 1 case(s), **240** affected records (sum)
- **WORKER_PENDING_OVERRIDE_SCENARIO:** 1 case(s), **240** affected records (sum)
- **WORKER_UNMAPPED_EARNING_CODE:** 1 case(s), **240** affected records (sum)

## 5. Case counts by owner

- **HRIS_PAYROLL_INTEGRATION_OWNER:** 2 case(s), **793** affected records (sum)
- **HRIS_PEOPLE_DATA_OWNER:** 4 case(s), **11660** affected records (sum)
- **PAYROLL_CONTROLS_OWNER:** 1 case(s), **240** affected records (sum)
- **REWARD_GOVERNANCE_OWNER:** 2 case(s), **400** affected records (sum)
- **REWARD_JOB_ARCHITECTURE_OWNER:** 2 case(s), **436** affected records (sum)

## 6. Blocker vs warning split

- **Blocker-flag cases:** 10
- **Non-blocker (quality / exception-eligible posture in notes):** 1

## 7. Rerun-required cases

- **Cases with rerun_required=true:** 11 / 11

## 8. What this proves

- Failed and warning cohorts can be decomposed into **stable buckets** with **explicit ownership**.
- Each case **points at sealed intake + snapshot identifiers** and **read-only artifact paths** (no silent data edits).
- **Deterministic case_id** values allow diffing regeneration outputs across commits when inputs are unchanged.

## 9. What this does not prove

- No workflow engine, ticketing integration, or human assignment is implied.
- Counts are **synthetic** and may **double-count conceptual overlap** across worker-level labels vs engine cohort rows.
- **ACCEPTED_EXCEPTION** is documented as a lifecycle state only; this generator does not approve exceptions.

## 10. Exact next recommended actions

1. **HRIS_PEOPLE_DATA_OWNER:** Close `JDMS_JOB_SUBFAMILY_CODE_MISSING` for `baseline_adversarial`, then re-run `run_descriptor_completeness_validator.py` and `run_mock_enterprise_demo.py`.
2. **REWARD_JOB_ARCHITECTURE_OWNER:** Reconcile `JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT` for both profiles as applicable.
3. **PAYROLL_CONTROLS_OWNER / HRIS_PAYROLL_INTEGRATION_OWNER:** Triage worker-level join and mapping labels from forensics.
4. **REWARD_GOVERNANCE_OWNER:** Review pending-override and methodology-mismatch scenario buckets before any exception posture.
5. **Re-seal discipline:** After fixes, capture new `engine_output_*.json` and regenerate this report for audit trail.

