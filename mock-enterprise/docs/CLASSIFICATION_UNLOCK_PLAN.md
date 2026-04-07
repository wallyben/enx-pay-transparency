## SYNTHETIC CLASSIFICATION UNLOCK PLAN — NOT PILOT EVIDENCE

**SYNTHETIC DATA ONLY**  
**NOT REAL PILOT EVIDENCE**  
**NOT FOR LEGAL OR REGULATORY RELIANCE**

---

## Objective

Prove whether **low `ASSIGNED` yield** in the mock-enterprise main cohort is dominated by **adapter / upstream descriptor gaps** versus **category-rule strictness**, by introducing a **second synthetic profile** that preserves adversarial scenarios but supplies **complete job hierarchy codes** (including subfamily) into the engine intake path.

---

## Baseline profile: `baseline_adversarial` (default generator output)

- Output directory: `mock-enterprise/generated/`
- **No** `job_subfamily` column on `job_architecture.csv` / `hris_assignments.csv`
- Demo adapter maps `job_subfamily_code` → **empty** for all engine rows
- **Expected engine behavior:** mass `REVIEW_REQUIRED` with `CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR` because `subfamilyCodeNormalized` is null
- **SCN-009** workers still show `ASSIGNED` via **approved governed overrides** (~3% of population in the scenario plan), explaining non-zero baseline `assignedCount`

---

## Unlock profile: `pilot_shaped_clean`

- Generate with:  
  `python mock-enterprise/generator/generate_mock_enterprise_pack.py --synthetic-profile pilot_shaped_clean`
- Output directory: `mock-enterprise/generated/pilot_shaped_clean/`
- Adds deterministic `job_subfamily` on each catalog row (`{FAMILY}_SUB_{jj}`) and copies it to assignments
- **Same** scenario allocation counts as baseline (failures remain present at worker level; clean path is not “cheated” by removing scenarios)
- Demo command:  
  `python mock-enterprise/runner/run_mock_enterprise_demo.py --generated-subdir pilot_shaped_clean --intermediate-run-id unlock`

---

## Isolation from production

- All changes are under `mock-enterprise/` (generator, runner, docs, outputs).
- `@enx/*` packages are **not** modified for this sprint; behavior is observed as-is.
- `run_engines.ts` only gains an optional diagnostic export flag (`--categoryDetailOut`).

---

## Honest comparison method

1. Capture `engine_output_main.json` from baseline `generated/` run.
2. Capture `engine_output_unlock.json` from `pilot_shaped_clean` + `--intermediate-run-id unlock`.
3. `run_classification_forensics.py --compare <baseline_json> <unlock_json>` writes `CLASSIFICATION_YIELD_COMPARISON.csv`.
4. Metrics gate read directly from each `engine_output_*.json` (`euCoreMetrics.runGateBlocked`, `classificationIncomplete`) and reporting completeness from `reportingPack`.

---

## Acceptance (truth-seeking)

- If unlock yields **near-100% `ASSIGNED`** on the main engine cohort and **`classificationIncomplete: false`**, the sprint shows **descriptor completeness + adapter mapping** was the dominant baseline blocker (for this rule pack).
- Residual **adapter-only** FC-R1 proxy breach (blocked worker rate) may still exceed confidence-doc thresholds—that is **separate** from the metrics engine’s `runGateBlocked` flag in the current code (which keys off classification completeness only).

---

## Artifacts

| Artifact | Role |
| --- | --- |
| `runner/run_classification_forensics.py` | Baseline/unlock forensics + comparison |
| `out/reports/REVIEW_REQUIRED_FORENSICS.md` | Baseline narrative (adversarial pack) |
| `out/intermediate/review_required_forensics_unlock.json` | Unlock JSON snapshot (`--omit-markdown --skip-reason-csv-outputs`) |
| `out/reports/CLASSIFICATION_UNLOCK_REPORT.md` | End-to-end narrative + blunt conclusion |
