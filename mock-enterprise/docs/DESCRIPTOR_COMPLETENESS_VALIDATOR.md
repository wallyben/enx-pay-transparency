# Descriptor completeness validator (Slice 2)

**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**

## Purpose

`runner/run_descriptor_completeness_validator.py` implements a **deterministic pre-engine gate** that checks whether the **main demo engine cohort** satisfies **`JDMS_v1`** (`mock-enterprise/contracts/JDMS_v1.json`) **before** `@enx/category-engine` runs.

It answers:

- Which **required-for-category-assignment** descriptor fields are missing, and on **how many** rows?
- Is the gap **in raw HRIS assignment**, **only in the catalog**, **not mapped into the executable intake path**, or a **cross-source conflict**?
- What are the **blocker** vs **warning** implications under JDMS flags?

## Contract source

- **Authoritative contract:** `mock-enterprise/contracts/JDMS_v1.json`
- **Human narrative:** `mock-enterprise/docs/JDMS_v1.md`, `mock-enterprise/docs/JOB_ARCHITECTURE_INGEST_CONTRACT.md`

Fields with `required_for_category_assignment: true` are evaluated for **cohort-level pass/fail** (`overall_pass` is false if any cohort row has any such field empty on the **executable** mapping).

## Cohort definition

The validator uses the **same inclusion rules** as `run_mock_enterprise_demo.py` for the **main** engine CSV:

- Primary assignment present
- HRIS↔payroll join OK (synthetic crosswalk rules)
- Scenario **not** in `SCN-002`, `003`, `004`, `005`, `006`, `008`, `010`
- Gender and FTE present (demo intake requirements)
- No unmapped in-scope earnings (recon blocker)

Descriptor values are read from **`hris_assignments.csv`** (primary) and compared to **`job_architecture.csv`** via `position_id` for **conflict** and **catalog richer than assignment** diagnostics. The TypeScript engines **do not** ingest the catalog file directly; executable completeness mirrors the Python adapter (`job_subfamily` → `job_subfamily_code` on the engine CSV).

## Outputs

| Artifact | Description |
| --- | --- |
| `out/intermediate/descriptor_completeness_results.json` | Machine-readable summary per dataset profile: `total_rows`, `overall_pass`, `blocker_count`, `warning_count`, `row_status_counts`, `required_field_summaries`, `top_missing_patterns`, `run_timestamp`, `notes`. |
| `out/reports/DESCRIPTOR_COMPLETENESS_SUMMARY.csv` | Flat summary rows for spreadsheet use (per profile × required field plus `_row_level_blocker_any_field`). |
| `out/reports/DESCRIPTOR_COMPLETENESS_REPORT.md` | Operator-facing narrative with explicit **`job_subfamily_code`** section. |

### Optional large JSON

```bash
python mock-enterprise/runner/run_descriptor_completeness_validator.py --include-row-detail-json
```

Adds a per-profile `rows` array with **per-field** diagnostics (very large for full packs). Default omits it to keep the JSON small and reviewable.

## Commands

From repository root (default: **baseline** `generated/` + **`pilot_shaped_clean`** if present):

```bash
python mock-enterprise/runner/run_descriptor_completeness_validator.py
```

Single pack:

```bash
python mock-enterprise/runner/run_descriptor_completeness_validator.py --generated-subdir ""
python mock-enterprise/runner/run_descriptor_completeness_validator.py --generated-subdir pilot_shaped_clean
```

Repeat `--generated-subdir` to evaluate multiple custom folders.

## Blocker vs warning (JDMS-aligned)

- **Blocker row:** Any field with `required_for_category_assignment: true` and `blocker_if_missing: true` is **empty on the executable path** (what the demo adapter would emit).
- **Warning row (no blocker):** Examples include **assignment vs catalog conflict** on title/family/subfamily/level, or **`position_id`** empty when JDMS expects methodology traceability (`required_for_equal_value_grouping`) — category-mandatory fields may still be present.

`equal_value_group_declaration` is documented as **conditional** on engine configuration; the mock demo uses `equalValueRuleset: null`, so it is not treated as a universal intake requirement here.

## Slice boundary

**In scope (this slice):** Read synthetic CSVs, load JDMS, emit diagnostics, distinguish blocker/warning, surface **`job_subfamily_code`** explicitly.

**Out of scope:** Production packages, remediation workflow automation, governance doc edits, category-rule changes, pilot-readiness claims.

**Next slice (remediation):** Operational fixes — populate or project subfamily (or governed alternate axis), resolve catalog/HRIS conflicts, wire adapters — **after** this gate identifies **where** failures concentrate.
