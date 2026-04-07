# Evidence pack summary (synthetic demo only)

This is **not** a regulator-ready evidence pack and **not** pilot authorization evidence.

## Engine output
- reportRunId: rpr_a8d7016d69e17e5a592e265ce3ac18f5b9cfa01db5a7936d610eb2b84dc33bd3
- completeness: {"status": "COMPLETE", "exportBlockedReasons": []}
- exportBlockers: []

## Stage summary
- **1_validate_pack**: EXECUTED — All required CSVs present under mock-enterprise\generated\pilot_shaped_clean
- **2_load_sources**: EXECUTED — workers=8000, assignments=8780
- **3_join_hris_payroll**: EXECUTED — Synthetic crosswalk join evaluated (demo adapter; not HTTP intake).
- **4_earning_code_mapping**: EXECUTED — Mapped in-scope lines using earning_code_mapping.csv (synthetic adapter).
- **5_normalized_worker_money_shape**: EXECUTED — Per-worker base/variable rollups computed for downstream eligibility checks.
- **6_7_ts_intake_snapshot_job_category**: EXECUTED — TS path: register intake → seal snapshot → job normalization → extended category (see engine_output_unlock.json).
- **7b_equal_value_path**: PARTIALLY EXECUTED — EqualValueRuleset not passed (null); equal-value grouping not exercised in this run.
- **8_eu_core_metrics**: EXECUTED — runEuCoreMetrics ran; runGateBlocked=False (classification complete for this cohort).
- **9_reporting_evidence_pack**: EXECUTED — assembleReportingPack executed; reporting completeness COMPLETE (see exportBlockers).
- **7c_pending_override_demo_cohort**: NOT IMPLEMENTED IN CURRENT SYSTEM — SCN-008 pending-override mini-run is only executed for --intermediate-run-id main.