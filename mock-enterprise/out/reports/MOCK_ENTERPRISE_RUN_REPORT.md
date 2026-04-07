# Mock enterprise run report (synthetic)

## 1. Objective
Demonstrate, using **synthetic Ireland perimeter CSVs**, what the **current repository code** can execute versus what remains adapter-only or governance-only.

## 2. Synthetic perimeter used
- Country: IE (label only for the mock pack)
- Entity / provider / period: see `mock-enterprise/docs/DATASET_DICTIONARY.md`

## 3. Current system entrypoints used
- `mock-enterprise/runner/run_engines.ts` → `@enx/intake-engine` (register + seal), `@enx/job-architecture`, `@enx/category-engine`, `@enx/metrics-engine`, `@enx/reporting-engine`
- `mock-enterprise/runner/run_mock_enterprise_demo.py` → orchestration + adapter joins/mapping/reconciliation summaries

## 4. Data files consumed
- `mock-enterprise/generated/*.csv` (HRIS, payroll, crosswalk, mapping, manifest)

## 5. Execution steps performed
- **1_validate_pack** — EXECUTED: All required CSVs present under mock-enterprise\generated
- **2_load_sources** — EXECUTED: workers=8000, assignments=8780
- **3_join_hris_payroll** — EXECUTED: Synthetic crosswalk join evaluated (demo adapter; not HTTP intake).
- **4_earning_code_mapping** — EXECUTED: Mapped in-scope lines using earning_code_mapping.csv (synthetic adapter).
- **5_normalized_worker_money_shape** — EXECUTED: Per-worker base/variable rollups computed for downstream eligibility checks.
- **6_7_ts_intake_snapshot_job_category** — EXECUTED: TS path: register intake → seal snapshot → job normalization → extended category (see engine_output_main.json).
- **7b_equal_value_path** — PARTIALLY EXECUTED: EqualValueRuleset not passed (null); equal-value grouping not exercised in this run.
- **8_eu_core_metrics** — PARTIALLY EXECUTED: runEuCoreMetrics ran; runGateBlocked=True (classification incomplete for this cohort).
- **9_reporting_evidence_pack** — PARTIALLY EXECUTED: assembleReportingPack executed; export blocked when metrics gate blocked (see exportBlockers).
- **7c_pending_override_demo_cohort** — EXECUTED: Separate TS run on SCN-008 workers with PENDING governed override (metrics gate blocked).

## 6. What executed successfully
- CSV presence check and deterministic scenario allocation matching the generator seed
- HRIS↔payroll join evaluation and earning-code rollup logic in **Python (demo adapter)**
- TypeScript **main cohort** run: intake seal + job normalization + extended category assignment + `runEuCoreMetrics` + `assembleReportingPack` (see `engine_output_main.json`)
- Separate **SCN-008** mini-cohort TS run with **PENDING** governed overrides (`engine_output_pending_override.json`)

## 7. What partially executed
- **EU core headline metrics**: `runEuCoreMetrics` **ran**, but for the main cohort `runGateBlocked=true` because `classificationIncomplete` is true for this synthetic title population (most rows are `REVIEW_REQUIRED` in category assignment). Scalar gap/quartile metrics show `BLOCKED_CLASSIFICATION_INCOMPLETE`.
- **Reporting pack export**: structured pack JSON is assembled, but completeness is **INCOMPLETE** with `METRICS_RUN_GATE_BLOCKED` while the metrics gate is blocked.
- **Equal-value ruleset**: not passed (`equalValueRuleset: null`) — equal-value grouping not exercised.
- **SCN-011 “ambiguous job evidence”**: data includes assignment/catalog mismatch in the **CSV pack**, but `@enx/job-architecture` does not load `job_architecture.csv` for cross-check — scenario intent is only partially representable.

## 8. What was blocked
- Workers excluded from the **main engine CSV** when joins fail, mandatory fields are missing, unmapped earning codes apply, SCN-010 (excluded from main meta), or SCN-008 (handled in the separate pending-override cohort).

## 9. Scenario coverage results
See `SCENARIO_OUTCOME_MATRIX.csv` (tied to `expected_scenario_manifest.csv`). **SCN-012** and **SCN-013** are **NOT EXERCISED** (zero cohort in this pack version).

## 10. Metrics / category / evidence outputs produced
- Main engine rows written: **5695** (of 8000 workers)
- Adapter proxy rates: blocked_record_rate=0.190875, low_confidence_proxy_rate=0.079
- Engine outputs: `mock-enterprise/out/intermediate/engine_output_main.json` and (when run) `engine_output_pending_override.json`

## 11. What this proves
- The **implemented** `@enx/*` packages can **execute** the mechanical pipeline: sealed intake snapshot → job normalization → extended category assignment → `runEuCoreMetrics` → `assembleReportingPack`, producing JSON artifacts under `mock-enterprise/out/intermediate/`.
- The metrics engine **fail-closed** behaviour is observable: when category assignment leaves the population “incomplete” for metrics (`classificationIncomplete`), headline EU core metrics are **not** reported as computed and the reporting pack marks export blockers accordingly.

## 12. What this does NOT prove
- **Not** real pilot readiness, **not** legal compliance, **not** payroll-truth reconciliation, **not** production operator controls.

## 13. Coverage gaps to reach fuller pay-transparency capability
See `COVERAGE_GAPS.md`.

## 14. Exact next recommended actions
- If run-level FC-R1 breach must be demonstrated, generate a **new synthetic pack version** that allocates non-zero rows to SCN-012/013 (outside this task).
- Implement reconciliation + confidence engines as **code** (not docs-only) before claiming enterprise gates.
