## SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE

**SYNTHETIC DATA ONLY**  
**NOT REAL PILOT EVIDENCE**  
**NOT FOR LEGAL OR REGULATORY RELIANCE**

This document describes the generated datasets under `mock-enterprise/generated/` produced by `mock-enterprise/generator/generate_mock_enterprise_pack.py`.

### Determinism
- **Seed (fixed)**: `20260407`
- The generator is deterministic: same seed ⇒ identical CSV outputs.

### Synthetic perimeter (binding for this pack)
- **Country**: `IE`
- **Legal entity**: `LE-IE-SYNTH-001` (synthetic)
- **Payroll provider instance**: `PAYPROV-IE-SYNTH-001` (synthetic)
- **Pay period**: `2026-02-01` to `2026-02-28` (single closed regular on-cycle run)
- **Currency**: `EUR`

### Join model (how files link)
- `hris_workers.hris_worker_id` 1—* `hris_assignments.hris_worker_id`
- `hris_assignments.position_id` *—1 `job_architecture.position_id`
- `hris_workers.hris_worker_id` 1—1 `hris_payroll_crosswalk.hris_worker_id`
- `hris_payroll_crosswalk.payroll_worker_id` 1—* `payroll_earnings.payroll_worker_id`
- `payroll_runs.payroll_run_id` 1—* `payroll_earnings.payroll_run_id`
- `payroll_earnings.earning_code` *—1 `earning_code_mapping.earning_code` (except intentionally unmapped)

### Conventions (synthetic-only)
- **No real names**: identifiers are synthetic strings (`HRIS-WKR-000001`, etc.)
- **No emails** and no real payroll identifiers
- Dates are ISO-8601 (`YYYY-MM-DD`)
- Flags are `"Y"`/`"N"` in payroll earnings/runs and `"Y"`/`"N"` for `primary_assignment_flag`

---

## File: `hris_workers.csv`

Worker master data for the synthetic Irish perimeter.

### Fields
- `hris_worker_id`: synthetic immutable HRIS worker key (primary key).
- `worker_public_id`: synthetic public-facing worker identifier (non-PII placeholder).
- `country_code`: always `IE`.
- `legal_entity_id`: always `LE-IE-SYNTH-001`.
- `employment_status`: `ACTIVE` | `TERMINATED`.
- `employment_type`: `EMPLOYEE` | `CONTRACTOR` (synthetic; included to test gates).
- `contract_type`: `PERMANENT` | `FIXED_TERM` | `APPRENTICE`.
- `hire_date`: ISO date.
- `termination_date`: ISO date or empty.
- `gender`: `F` | `M` | `NB` | `UNDISCLOSED` or empty (intentionally missing for scenario coverage).
- `department`: synthetic department label.
- `location`: `Dublin` | `Cork` | `Galway` | `Limerick` | `Remote-IE`.
- `cost_center`: synthetic cost center code (`CC-IE-001`..`CC-IE-040`).

---

## File: `hris_assignments.csv`

Assignment/position records (supports multi-assignment workers and primary-only logic).

### Fields
- `assignment_id`: synthetic unique assignment key.
- `hris_worker_id`: FK to `hris_workers`.
- `position_id`: FK to `job_architecture`.
- `job_code`: job code reference.
- `job_title`: job title reference.
- `job_family`: family code (e.g., `ENG`, `OPS`, etc.).
- `job_level`: `L1`..`L6` (intentionally mismatched for “ambiguous job evidence” scenario).
- `primary_assignment_flag`: `"Y"` | `"N"`.
- `fte_fraction`: decimal fraction (e.g., `1.0`, `0.8`) or empty (intentionally missing for scenario coverage).
- `standard_hours_per_week`: derived from 39 * fte (or empty when FTE is missing).
- `effective_start_date`: ISO date.
- `effective_end_date`: ISO date or empty.

---

## File: `job_architecture.csv`

Synthetic job architecture catalog (position-level reference + methodology factor scores).

### Fields
- `position_id`: synthetic position key (primary key).
- `job_code`: synthetic job code.
- `job_title`: synthetic title string.
- `job_family`: family code (6 families).
- `job_level`: `L1`..`L6`.
- `factor_skills_score`: integer 0–4.
- `factor_effort_score`: integer 0–4.
- `factor_responsibility_score`: integer 0–4.
- `factor_working_conditions_score`: integer 0–4.
- `methodology_version_reference`: always `methodology_v1@v1.0.0` (synthetic reference).

---

## File: `payroll_runs.csv`

Single synthetic payroll run for the closed period (regular on-cycle).

### Fields
- `payroll_run_id`: `RUN-IE-2026-02-REG-001`.
- `payroll_provider_id`: `PAYPROV-IE-SYNTH-001`.
- `legal_entity_id`: `LE-IE-SYNTH-001`.
- `pay_period_start_date`: `2026-02-01`.
- `pay_period_end_date`: `2026-02-28`.
- `off_cycle_flag`: `"N"`.
- `retro_flag`: `"N"`.
- `run_status`: `CLOSED`.
- `currency_code`: `EUR`.

---

## File: `payroll_earnings.csv`

Payroll earning lines for in-scope paid workers. Includes intentionally excluded rows (off-cycle/retro/allowance) and intentional mapping failures.

### Fields
- `payroll_line_id`: synthetic unique payroll line id.
- `payroll_run_id`: FK to `payroll_runs`.
- `payroll_worker_id`: synthetic payroll worker id (join target from crosswalk).
- `earning_code`: e.g., `BASE`, `BONUS`, `ALLOW_TRAVEL`, `OFFCYCLE_ADJ`, `RETRO_ADJ`, `SUSPECT_BASE`, `UNMAPPED_X`.
- `earning_description`: synthetic description.
- `amount`: EUR amount (2 decimals).
- `currency_code`: `EUR`.
- `component_family_candidate`: generator hint: `BASE` | `VARIABLE` | `ALLOWANCE` | `EXCLUDED` | `UNKNOWN`.
- `off_cycle_flag`: `"Y"`/`"N"` (off-cycle rows exist but are excluded by scope in the mock run plan).
- `retro_flag`: `"Y"`/`"N"` (retro rows exist but are excluded by scope in the mock run plan).

---

## File: `hris_payroll_crosswalk.csv`

Synthetic crosswalk between HRIS worker IDs and payroll worker IDs.

### Fields
- `hris_worker_id`: FK to `hris_workers`.
- `payroll_worker_id`: synthetic payroll worker id (may be empty for “missing join” scenario; may be duplicated for “duplicate join key” scenario).
- `legal_entity_id`: `LE-IE-SYNTH-001`.
- `crosswalk_status`: `ACTIVE` | `MISSING`.
- `crosswalk_version`: `xwalk_v1.0.0`.

---

## File: `earning_code_mapping.csv`

Synthetic mapping table for earning codes → canonical component families (and blockers).

### Fields
- `earning_code`: code.
- `earning_description`: description.
- `source_payroll_provider`: `SYNTH_PAYROLL`.
- `source_instance`: `IE-INSTANCE-A`.
- `mapping_status`: `MAPPED` | `UNMAPPED`.
- `mapped_component_family`: `BASE` | `VARIABLE` | `EXCLUDED` | empty when unmapped.
- `mapping_version`: `earning_mapping_v1.0.0`.
- `blocker_flag`: `"Y"` for unmapped codes meant to block.
- `notes`: human-readable rationale (synthetic).

---

## File: `expected_scenario_manifest.csv`

Scenario index that declares what each scenario is intended to trigger in the system controls.

### Fields
- `scenario_id`: `SCN-###` (synthetic).
- `scenario_name`: scenario name.
- `scenario_type`: `CLEAN` | `EDGE` | `FAILURE`.
- `affected_record_count`: worker count assigned to the scenario (primary scenario assignment).
- `expected_join_outcome`: expected join outcome label.
- `expected_reconciliation_outcome`: expected reconciliation outcome label.
- `expected_confidence_outcome`: expected confidence/gate outcome label.
- `expected_category_or_methodology_outcome`: expected category/methodology review state label.
- `expected_export_or_run_gate_outcome`: expected export/run gating label.
- `related_exception_codes`: comma-separated synthetic exception code labels where applicable.

---

## Generation assumptions (explicit)
- The population is synthetic and intended to be **enterprise-realistic**, not legally accurate.
- Base pay is generated as a monthly EUR amount with level-based ranges and FTE scaling.
- Variable pay appears for a minority subset; some scenarios force bonus presence.
- Off-cycle, retro, and allowance lines are present but flagged to be excluded per mock perimeter policy.
- “Run-level breach” scenarios are represented in the manifest and mock-run plan as **demonstration toggles** (increase edge allocations) rather than forcibly corrupting the base dataset.

