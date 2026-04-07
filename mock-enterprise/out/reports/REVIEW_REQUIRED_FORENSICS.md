# REVIEW_REQUIRED forensics (synthetic mock-enterprise)

**Not pilot evidence. Not legal/regulatory reliance.**

## Summary counts (engine cohort)
- Engine rows: **5695**
- ASSIGNED: **210** (3.69%)
- REVIEW_REQUIRED: **5485** (96.31%)
- UNASSIGNED: **0**

## Primary issue codes (REVIEW_REQUIRED only)

| Code | Count |
| --- | ---:|
| `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` | 5485 |

## Job-normalization issue codes (among REVIEW_REQUIRED)

| Code | Count |
| --- | ---:|

## Missing normalized descriptor keys (among REVIEW_REQUIRED)

| Pattern | Count |
| --- | ---:|
| subfamily | 5485 |

## Adapter-level blocker labels (all synthetic workers, not just engine file)

| Label | Workers |
| --- | ---:|
| join_not_ok | 473 |
| ambiguous_job_evidence_scenario_data_only | 320 |
| unmapped_earning_code_worker | 240 |
| missing_gender | 240 |
| missing_fte_primary_assignment | 240 |
| pending_override_scenario | 240 |
| methodology_mismatch_scenario_adapter | 160 |

## Category status by scenario (engine rows)

| Scenario | ASSIGNED | REVIEW_REQUIRED | UNASSIGNED |
| --- | ---:| ---:| ---:|
| SCN-001 | 0 | 3710 | 0 |
| SCN-007 | 0 | 287 | 0 |
| SCN-009 | 210 | 0 | 0 |
| SCN-011 | 0 | 277 | 0 |
| SCN-014 | 0 | 136 | 0 |
| SCN-015 | 0 | 140 | 0 |
| SCN-016 | 0 | 144 | 0 |
| SCN-017 | 0 | 215 | 0 |
| SCN-018 | 0 | 215 | 0 |
| SCN-019 | 0 | 141 | 0 |
| SCN-020 | 0 | 220 | 0 |

## Metrics / export gates (from engine_output JSON)
- runGateBlocked: **True**
- classificationIncomplete: **True**
- reporting completeness: **{'status': 'INCOMPLETE', 'exportBlockedReasons': ['METRICS_RUN_GATE_BLOCKED']}**
- exportBlockers: `['METRICS_RUN_GATE_BLOCKED']`

## Interpretation pointer
See `mock-enterprise/docs/CLASSIFICATION_UNLOCK_PLAN.md` and `CLASSIFICATION_UNLOCK_REPORT.md`.
