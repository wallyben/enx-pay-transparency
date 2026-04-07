# Classification unlock sprint report (synthetic enterprise only)

**SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**

This report summarizes a **mock-enterprise-only** sprint to explain baseline `REVIEW_REQUIRED` dominance and to prove engine behavior when **job subfamily** is supplied through the demo intake path. It does **not** assert pilot readiness, legal defensibility, or real operational controls.

---

## 1. Objective

Identify why the **main engine cohort** (~5,695 rows) produced very low `ASSIGNED` yield on the **baseline adversarial** synthetic pack, implement an **isolated unlock variant** (`pilot_shaped_clean`) that preserves scenario mix but enriches job-architecture fields, re-run the executable pipeline, and compare results **honestly**.

---

## 2. Baseline run problem statement

On `mock-enterprise/generated/` (default pack) with `run_mock_enterprise_demo.py`:

- `engine_output_main.json` showed **`assignedCount`: 210**, **`reviewRequiredCount`: 5,485**, **`unassignedCount`: 0** on **5,695** sealed rows.
- `euCoreMetrics.runGateBlocked` was **`true`** with `classificationIncomplete` **`true`** because **any** `REVIEW_REQUIRED` row fails the metrics gate in `@enx/metrics-engine` (`run-eu-core-metrics.ts`).
- `reportingPack.completeness.status` was **`INCOMPLETE`** with export blocker **`METRICS_RUN_GATE_BLOCKED`**.

The population was not “unclassifiable by rule pack magic”: the **mock adapter never sent `job_subfamily_code`**, while **`@enx/category-engine` requires normalized subfamily** (with family + grade) for both `EXACT` and `NORMALIZED_EQUIVALENT` assignment paths (`assign-category-row.ts`).

---

## 3. Forensic findings (baseline adversarial)

Artifacts: `out/reports/REVIEW_REQUIRED_FORENSICS.md`, `out/reports/REVIEW_REQUIRED_REASON_BREAKDOWN.csv`, `out/reports/REVIEW_REQUIRED_TOP_OFFENDERS.csv`, `out/intermediate/review_required_forensics.json` (summary JSON; per-row drill-down omitted by default — use `run_classification_forensics.py --include-per-row-rows`).

| Finding | Value |
| --- | --- |
| Primary issue on all `REVIEW_REQUIRED` rows | `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` |
| Job-normalization issue codes on those rows | *(none)* |
| Missing normalized descriptor key | **`subfamily` on 5,485 rows** |
| Rows `ASSIGNED` without fixing subfamily | **210** — **SCN-009** approved governed overrides only |
| Scenario mix in engine file | Clean and edge scenarios (SCN-001, SCN-007, SCN-011, etc.) all sat in `REVIEW_REQUIRED` **until** subfamily was supplied — proving **category rules were not “too narrow” for the titles/families**; the blocker was **missing hierarchy axis in intake** |

Adapter / population blockers **outside** the engine file (8,000 workers) remain (join failures, gender/FTE, unmapped earnings, SCN-008/010, etc.) — see `enterprise_blocker_labels_worker_level` in `review_required_forensics.json`.

---

## 4. Root-cause interpretation

| Bucket | Share of baseline `REVIEW_REQUIRED` (engine cohort) | Interpretation |
| --- | --- | --- |
| **Adapter / synthetic field underfeed** | **~100%** (`CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` + missing `subfamily` only) | Demo CSV omitted subfamily; generator did not emit it on baseline profile. |
| **Job normalization defects** | **0%** among `REVIEW_REQUIRED` (no `JOB_NORM_*` issues) | Titles, families, grades were already shape-valid for this cohort. |
| **Category-rule incompleteness** | **Not supported** | Same rules assign cleanly once subfamily is present (unlock run). |
| **Join / crosswalk exclusion** | **N/A inside engine file** | Excluded workers never reach the 5,695-row cohort; counted separately in adapter forensics. |
| **Engine strictness** | **High — by design** | Metrics gate requires **zero** `REVIEW_REQUIRED` / `UNASSIGNED` rows (`classificationIncomplete` boolean). |

**Synthetic data bias:** baseline pack was realistic in *having* failures, but **unrealistic in omitting subfamily entirely** on the “clean” scenarios — that biases classification downward independent of the failure scenarios.

**`job_architecture.csv` limitation:** the TypeScript job-normalization step **does not ingest** the catalog file; catalog richness must be **merged into intake** by an adapter or future intake pipeline (documented in `JOB_ARCHITECTURE_INGEST_CONTRACT.md`).

---

## 5. Unlock changes made

| Layer | Change |
| --- | --- |
| **Generator** | New flag `--synthetic-profile pilot_shaped_clean` writes under `generated/pilot_shaped_clean/` and adds deterministic `job_subfamily` on catalog + assignments. |
| **Demo adapter** | `run_mock_enterprise_demo.py` maps `job_subfamily` → `job_subfamily_code` on engine CSV rows; `--generated-subdir pilot_shaped_clean` points at the unlock pack. |
| **Runner / TS** | `run_engines.ts` accepts optional `--categoryDetailOut` for forensic JSON (`engine_category_detail_*.json`). |
| **Forensics** | New `run_classification_forensics.py` aggregates reasons, scenarios, and optional baseline/unlock comparison CSV. |

No `packages/*` production code was modified for this sprint.

---

## 6. Unlock run results (`pilot_shaped_clean`, `--intermediate-run-id unlock`)

| Stage | Status |
| --- | --- |
| 1_validate_pack | **EXECUTED** |
| 2_load_sources | **EXECUTED** |
| 3_join_hris_payroll | **EXECUTED** |
| 4_earning_code_mapping | **EXECUTED** |
| 5_normalized_worker_money_shape | **EXECUTED** |
| 6_7_ts_intake_snapshot_job_category | **EXECUTED** |
| 7b_equal_value_path | **PARTIALLY EXECUTED** (`equalValueRuleset` null) |
| 7c_pending_override_demo_cohort | **NOT IMPLEMENTED IN CURRENT SYSTEM** (SCN-008 mini-run is wired only for `--intermediate-run-id main`) |
| 8_eu_core_metrics | **EXECUTED** (`runGateBlocked=false`) |
| 9_reporting_evidence_pack | **EXECUTED** (completeness **COMPLETE**, no export blockers) |

Engine summary (`engine_output_unlock.json`):

- **`assignedCount` 5,695**, **`reviewRequiredCount` 0**, **`unassignedCount` 0**
- Headline EU core metrics: **COMPUTED** (mean/median gender gap, variable pay gap, quartile distribution)
- Reporting pack: **`COMPLETE`**, **`exportBlockers`: []**

Manifest: `out/intermediate/unlock_run_manifest.json`

---

## 7. Baseline vs unlock comparison

See `out/reports/CLASSIFICATION_YIELD_COMPARISON.csv` (baseline snapshot: `out/intermediate/baseline_engine_output_for_compare.json`).

| Metric | Baseline | Unlock |
| --- | ---: | ---: |
| Engine category rows | 5,695 | 5,695 |
| Assigned | 210 | 5,695 |
| Assigned rate | 3.69% | 100% |
| Review required | 5,485 | 0 |
| Metrics run gate blocked | Yes | No |
| Reporting pack complete | No | Yes |
| Export blocked | Yes (`METRICS_RUN_GATE_BLOCKED`) | No |

---

## 8. What this proves

- With **complete hierarchy fields** on the intake row (including **subfamily**), the **existing** `@enx/category-engine` ruleset can reach **100% `ASSIGNED`** on the same main-cohort shape, and **`@enx/metrics-engine`** will clear **`classificationIncomplete`**.
- The baseline low yield was **not** evidence that “titles don’t match rules”; it was **`CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` driven by absent subfamily in the demo adapter**, masked by a small **SCN-009 override** cohort showing non-zero `assignedCount`.

---

## 9. What this does NOT prove

- **Not** real pilot success, **not** payroll reconciliation, **not** H04/H05 executable engines, **not** legal methodology sign-off.
- **Not** that FC-R1-style **adapter blocked-rate** thresholds pass — the Python proxy still sees ~19% blocked workers on the full 8,000-worker population (unchanged scenario mix); only the **sealed engine cohort** was unblocked for metrics **in this code path**.
- **Not** that `job_architecture.csv` cross-checks assignment vs catalog — that scenario remains **data-only** until a catalog-aware normalization path exists.

---

## 10. Remaining blockers to enterprise-usable category assignment (truthful framing)

1. **Real upstream contract:** production must carry **subfamily (or an equivalent second axis)** into canonical intake — omitting it reproduces mass `REVIEW_REQUIRED` under current rules.
2. **Catalog vs assignment conflicts:** SCN-011-style inconsistency is **not enforced in TS engines** today; real pilots need an explicit reconciliation/override workflow, not silent picks.
3. **Run-level confidence / reconciliation gates** (H04/H05) are still **not implemented as code** in this repo snapshot — export may be “COMPLETE” in the **demo metrics engine** while enterprise assurance models would still demand more evidence.

---

## 11. Exact next recommended actions

1. Lock a **pilot-shaped intake contract** that includes **subfamily** (or formally narrows rules if subfamily is intentionally out of scope — which would require **product/governance** change, not a silent demo tweak).
2. Implement **catalog-aware normalization or governed joins** if assignment must reflect HRIS vs Reward architecture cross-checks.
3. Keep **baseline adversarial** packs for **failure choreography**; use **`pilot_shaped_clean`** (or equivalent) to regression-test **happy-path assignability** without conflating the two purposes.

---

## Blunt conclusion

**Unlock verdict:** On the synthetic main cohort, the engine **does** reach **enterprise-usable assignment yield** (100% assigned, metrics gate open, reporting pack **COMPLETE**) **when subfamily is supplied** through the mock intake adapter.

**Baseline verdict:** The prior **3.7%** assigned rate was **misleading for rule-pack quality** — it was **almost entirely** an **adapter/generator omission of `job_subfamily_code`**, plus **210** synthetic **approved overrides**.

**Does this authorize a real pilot?** **No.** This is **synthetic demonstration only** under an explicit unlock profile and does not satisfy Wave P real-evidence requirements.
