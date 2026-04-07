# Unlock regression report (Slice 10; synthetic only)

**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**

## 1. Objective

Lock **non-negotiable** expectations for the classification-unlock insight: the **baseline/adversarial** synthetic pack must remain a **fail-fast blocked** path under JDMS and engines, and **pilot_shaped_clean** must remain an **unblocked success** path when descriptor completeness is satisfied.

## 2. Profiles tested

- **`baseline_adversarial`** — `mock-enterprise/generated/` + `run_mock_enterprise_demo.py` with `--intermediate-run-id main` → `engine_output_main.json`
- **`pilot_shaped_clean`** — `mock-enterprise/generated/pilot_shaped_clean/` + `--generated-subdir pilot_shaped_clean` + `--intermediate-run-id unlock` → `engine_output_unlock.json`

*Demo runs: executed before reading engine outputs.*

## 3. Expected regression conditions

### baseline_adversarial

| Condition | Expected |
| --- | --- |
| Descriptor `overall_pass` | `false` |
| `job_subfamily_code` missing (cohort) | ≥ 1 |
| Descriptor `blocker_count` | ≥ 1 |
| Assigned rate (category engine) | < 0.5 (not enterprise-usable) |
| `euCoreMetrics.runGateBlocked` | `true` |
| Reporting / export | Incomplete **or** non-empty `exportBlockers` |

### pilot_shaped_clean

| Condition | Expected |
| --- | --- |
| Descriptor `overall_pass` | `true` |
| `job_subfamily_code` missing | 0 |
| Descriptor `blocker_count` | 0 |
| Assignment | `assignedCount == rowCount`, `reviewRequiredCount == 0` |
| `euCoreMetrics.runGateBlocked` | `false` |
| Reporting pack | `COMPLETE`, empty `exportBlockers` |

## 4. Actual results by profile

| Profile | Descriptor pass | Subfamily missing | Blockers | Assigned | Rate | Review req. | Metrics blocked | Export blocked | Met expectations |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| `baseline_adversarial` | False | 5695 | 5695 | 210 | 0.0369 | 5485 | True | True | **True** |
| `pilot_shaped_clean` | True | 0 | 0 | 5695 | 1.0000 | 0 | False | False | **True** |

## 5. Baseline blocked-path verification

- **PASS** `descriptor_overall_pass_is_false` — overall_pass=False expected False
- **PASS** `job_subfamily_missing_positive` — missing_count=5695 expected >=1
- **PASS** `descriptor_blocker_count_positive` — blocker_count=5695 expected >=1
- **PASS** `category_yield_low_not_enterprise_usable` — assigned_rate=0.036874 expected < 0.5
- **PASS** `metrics_gate_blocked` — runGateBlocked=True expected True
- **PASS** `reporting_incomplete_or_export_blocked` — complete=False export_blockers=['METRICS_RUN_GATE_BLOCKED']
- **PASS** `demo_run_succeeded` — run_mock_enterprise_demo.py must exit 0 for this profile

## 6. Pilot-shaped success-path verification

- **PASS** `descriptor_overall_pass_is_true` — overall_pass=True expected True
- **PASS** `job_subfamily_missing_zero` — missing_count=0 expected <=0
- **PASS** `descriptor_blocker_count_zero` — blocker_count=0 expected <=0
- **PASS** `full_assignment_cohort` — assigned=5695 row_count=5695
- **PASS** `review_required_zero` — review_required=0
- **PASS** `metrics_gate_not_blocked` — runGateBlocked=False expected False
- **PASS** `reporting_complete` — reporting complete=True
- **PASS** `export_not_blocked` — export_blockers=[]
- **PASS** `demo_run_succeeded` — run_mock_enterprise_demo.py must exit 0 for this profile

## 7. Regressions found

*No failing checks.*

## 8. Overall suite result

**PASS**

- **PASS** — baseline and pilot expectations all satisfied.
- **PARTIAL** — one profile satisfied, the other did not (or demo could not run for one side).
- **FAIL** — neither profile satisfied the contract.

## 9. What this proves

- The repo can **reproduce** both the **blocked baseline** and **unblocked unlock** synthetic outcomes under JDMS + the mock adapter + TS engines.
- Future generator, adapter, or runner edits that break descriptor completeness or collapse category yield should be **caught** by this suite.

## 10. What this does not prove

- **Not** real pilot readiness, **not** legal defensibility of categories, **not** production HRIS truth.
- **Not** that enterprise data will match these CSV shapes — only that **this synthetic harness** preserves the documented unlock contrast.

## 11. Exact next recommended actions

1. Run this suite in CI after changes under `mock-enterprise/` or demo-related runners.
2. Remediation slice: operational projection of catalog subfamily into intake (or HRIS population), then optional pre-flight hook from `run_mock_enterprise_demo.py` to the descriptor validator.
3. Keep thresholds in `EXPECTED_CONDITIONS` versioned with `SUITE_ID` when intentional contract changes are made.

---

*JDMS contract version: 1.0.0 — Run timestamp (UTC): 2026-04-07T23:32:28Z*
