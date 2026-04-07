# Evidence pack summary (synthetic demo only)

This is **not** a regulator-ready evidence pack and **not** pilot authorization evidence.

## Engine output
- reportRunId: rpr_5dcd450002cd82d8cb730455528035058d5d0e83a84905fd1d2f63a495fa3893
- completeness: {"status": "INCOMPLETE", "exportBlockedReasons": ["METRICS_RUN_GATE_BLOCKED"]}
- exportBlockers: ['METRICS_RUN_GATE_BLOCKED']

## Stage summary
- **1_validate_pack**: EXECUTED — All required CSVs present under mock-enterprise/generated/
- **2_load_sources**: EXECUTED — workers=8000, assignments=8780
- **3_join_hris_payroll**: EXECUTED — Synthetic crosswalk join evaluated (demo adapter; not HTTP intake).
- **4_earning_code_mapping**: EXECUTED — Mapped in-scope lines using earning_code_mapping.csv (synthetic adapter).
- **5_normalized_worker_money_shape**: EXECUTED — Per-worker base/variable rollups computed for downstream eligibility checks.
- **6_7_ts_intake_snapshot_job_category**: EXECUTED — TS path: register intake → seal snapshot → job normalization → extended category (see engine_output_main.json).
- **7b_equal_value_path**: PARTIALLY EXECUTED — EqualValueRuleset not passed (null); equal-value grouping not exercised in this run.
- **8_eu_core_metrics**: PARTIALLY EXECUTED — runEuCoreMetrics ran; runGateBlocked=True (classification incomplete dominates this synthetic title set).
- **9_reporting_evidence_pack**: PARTIALLY EXECUTED — assembleReportingPack executed; export blocked when metrics gate blocked (see exportBlockers).
- **7c_pending_override_demo_cohort**: EXECUTED — Separate TS run on SCN-008 workers with PENDING governed override (metrics gate blocked).