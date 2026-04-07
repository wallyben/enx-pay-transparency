# Unlock regression suite (Slice 10)

**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**

## Purpose

`runner/run_unlock_regression_suite.py` is a **deterministic regression gate** that preserves two synthetic proofs at once:

1. **Baseline / adversarial** (`mock-enterprise/generated/`) — JDMS descriptor completeness **fails**, and the mock TS pipeline stays on a **blocked** metrics/reporting path with **low** category assignment yield.
2. **Pilot-shaped clean** (`mock-enterprise/generated/pilot_shaped_clean/`) — JDMS completeness **passes**, and the same engines reach **full** assignment, **cleared** metrics gate, and **complete** reporting export.

If a future change to the generator, adapter, or runners silently removes subfamily from the intake path or collapses the unlock contrast, this suite should **fail** or report **PARTIAL**.

## Preconditions

- Python 3.10+.
- Packs present: default `generated/` and `generated/pilot_shaped_clean/` (generate the latter with  
  `python mock-enterprise/generator/generate_mock_enterprise_pack.py --synthetic-profile pilot_shaped_clean`).
- For **default** mode (live demo runs): Node 22+ and `pnpm` on `PATH` (same as `run_mock_enterprise_demo.py`).

## Commands

From repository root:

```bash
python mock-enterprise/runner/run_unlock_regression_suite.py
```

Re-run descriptor evaluation against **existing** engine JSON only (no TS subprocess — useful when Node/pnpm is unavailable):

```bash
python mock-enterprise/runner/run_unlock_regression_suite.py --skip-demo-runs
```

**Exit code:** `0` only when **overall_result** is `PASS` (both profiles meet all checks). Non-zero for `PARTIAL` or `FAIL`.

## Outputs

| Artifact | Role |
| --- | --- |
| `out/intermediate/unlock_regression_results.json` | Machine-readable: `expected_conditions`, `actual_conditions`, per-profile checks, `overall_result`, `run_timestamp`. |
| `out/reports/UNLOCK_REGRESSION_SUMMARY.csv` | Flat comparison row per profile. |
| `out/reports/UNLOCK_REGRESSION_REPORT.md` | Operator narrative (sections 1–11). |

## Contract source

- **JDMS:** `mock-enterprise/contracts/JDMS_v1.json` (loaded indirectly via the descriptor validator module).
- **Explicit thresholds:** `EXPECTED_CONDITIONS` in `run_unlock_regression_suite.py` (versioned with `SUITE_ID`).

## Slice boundary

**In scope:** Orchestrate descriptor validator logic + demo runs, assert dual-path outcomes, emit reports under `mock-enterprise/`.

**Out of scope:** Remediation workflows, production package edits, governance doc edits, category-rule changes, pilot-readiness claims.

**Next slice (remediation):** Operational fixes to populate/project descriptors and optional pre-flight wiring — **after** this gate flags regressions.
