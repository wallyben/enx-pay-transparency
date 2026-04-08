# Remediation ticket model (mock-enterprise, synthetic)

**Synthetic / demonstration only — not real pilot evidence — not for legal or regulatory reliance.**

## 1. Purpose and scope

This document defines the **remediation case** object used under `mock-enterprise/` to turn **descriptor completeness failures**, **classification forensics signals**, and **related engine gate outcomes** into **owned, auditable remediation work** with explicit **severity**, **blocker posture**, and **rerun linkage**.

Scope is limited to:

- Artifacts under `mock-enterprise/out/intermediate/` and `mock-enterprise/out/reports/`
- Generation via `mock-enterprise/runner/generate_remediation_cases.py`

No production packages, workflow engines, or governance-doc changes are implied.

## 2. Why remediation cases exist

The mock-enterprise path can already **prove**:

- When JDMS descriptor completeness **fails or passes** (validator)
- When downstream behavior is **blocked vs unblocked** (unlock regression + engine outputs)

The next operational step is to ensure those outcomes produce **actionable objects** — not only prose reports — so that:

- Accountability is explicit (**owner_role**)
- Work state is legible (**status**)
- Risk is ordered (**severity**, **blocker_flag**)
- Evidence is pointer-based (**source_*_reference**, **source_artifact_references**)
- Closure is tied to **re-execution** of sealed runs (**rerun_required**), not to silent edits

## 3. Case model principles

1. **Deterministic:** The same inputs yield the same `case_id` values and the same case payloads (modulo emission metadata such as `generated_timestamp` on the bundle).
2. **Sealed-run discipline:** Cases reference **intake file IDs** and **snapshot IDs** from engine JSON; they do not mutate prior sealed artifacts.
3. **Coarse honesty:** Buckets prefer **stable, explainable groupings** over fake row-level precision when the source aggregates are already coarse (for example, worker-level adapter labels vs engine-row cohort).
4. **Synthetic-only labeling:** Missing production snapshot lineage is expressed explicitly (for example `NOT_AVAILABLE_SYNTHETIC` when an engine file is absent).

## 4. Required case fields

Each remediation case includes at minimum:

| Field | Meaning |
| --- | --- |
| `case_id` | Stable identifier (`REM-CASE-` + deterministic hash) |
| `case_type` | Coarse bucket (for example `DESCRIPTOR_COMPLETENESS_BLOCKER`) |
| `issue_code` | Normalized issue key (for example `JDMS_JOB_SUBFAMILY_CODE_MISSING`) |
| `severity` | `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` (synthetic ordering) |
| `blocker_flag` | `true` if the issue is treated as blocking under the originating gate semantics |
| `owner_role` | Responsible function (see §5) |
| `status` | Lifecycle state (see §7) |
| `source_run_reference` | Pointer to run context (intake / forensics run id / bundle id) |
| `source_snapshot_reference` | Snapshot id from engine output when available, else `NOT_AVAILABLE_SYNTHETIC` |
| `source_artifact_references` | Read-only relative paths to JSON/Markdown inputs used |
| `affected_record_count` | Integer scale from the source aggregate (may overlap across cases conceptually) |
| `affected_entity_keys` | Stable key strings (dataset profile, validator pattern, forensics labels) |
| `root_cause_summary` | Short narrative grounded in the source artifact |
| `recommended_action` | Concrete next step without auto-fixing data |
| `rerun_required` | Whether a re-run of validators/engines is expected after remediation |
| `related_case_ids` | Graph edges to linked cases (for example descriptor → classification symptom) |
| `created_timestamp` | ISO-8601 timestamp derived from input artifacts (`run_timestamp` max) |
| `notes` | Synthetic caveats, exception eligibility hints, overlap warnings |

## 5. Owner-role mapping rules

| Situation | `owner_role` |
| --- | --- |
| Missing mandatory HRIS-side descriptor material (for example subfamily on executable path) | `HRIS_PEOPLE_DATA_OWNER` |
| Job architecture hierarchy conflicts (assignment vs catalog level, profile conflicts) | `REWARD_JOB_ARCHITECTURE_OWNER` |
| Payroll code mapping / earning mapping failures | `PAYROLL_CONTROLS_OWNER` |
| Join / crosswalk / ambiguous job evidence integration issues | `HRIS_PAYROLL_INTEGRATION_OWNER` |
| Methodology, adapter mismatch, or pending governance override scenarios | `REWARD_GOVERNANCE_OWNER` |

## 6. Severity and blocker rules

- **`blocker_flag`:** `true` when the originating signal is a JDMS **blocker** row, a **classification REVIEW_REQUIRED** driver, or a **worker-level enterprise blocker label** in forensics. `false` for **warning-only** descriptor patterns (for example JDMS pass with warning rows).
- **`severity`:** Assigned from **cohort scale** and **gate criticality** (full-cohort JDMS failure → `CRITICAL`; large classification block → `HIGH`; isolated worker-label pools → `MEDIUM`/`HIGH` by label).
- **Accepted-exception posture:** Cases may **note** eligibility; **no case auto-transitions** to `ACCEPTED_EXCEPTION` without human governance.

## 7. Status lifecycle

Minimum supported statuses:

| Status | Meaning |
| --- | --- |
| `OPEN` | Newly generated from evidence; not yet actioned |
| `TRIAGED` | Understood and routed (generator may set for known warning-only buckets) |
| `IN_PROGRESS` | Active remediation in flight (human / future workflow) |
| `RESOLVED_PENDING_RERUN` | Data or policy fix landed; waiting on sealed re-run |
| `CLOSED` | Confirmed cleared by rerun evidence |
| `ACCEPTED_EXCEPTION` | Formal governance acceptance (not auto-set by the generator) |

The generator defaults to **`OPEN`** for blockers and may set **`TRIAGED`** for narrow synthetic warning buckets.

## 8. Relationship to runs, snapshots, and reruns

- **Runs:** `source_run_reference` ties a case to **`intakeFileId`** strings from `engine_output_*.json` and/or forensics `intermediate_run_id`.
- **Snapshots:** `source_snapshot_reference` carries `snapshot.snapshotId` when the engine file is present.
- **Reruns:** `rerun_required` documents that closure expects **new validator and/or engine outputs**, not edits to prior JSON.
- **Bundle:** `remediation_cases.json` includes `source_run_reference` for the whole generation pass and lists artifacts under `source_artifact_references` on each case.

## 9. What this does and does not do

**Does:**

- Materialize major validator and forensics buckets into cases
- Preserve audit pointers to inputs and sealed identifiers
- Split **blocker vs warning** and surface **rerun** expectations

**Does not:**

- Implement ticketing integrations, SLAs, or UI
- Auto-repair CSVs or mutate snapshots
- Prove pilot readiness or regulatory-grade controls
- Replace category rules or JDMS contract semantics

## 10. References

- `mock-enterprise/contracts/JDMS_v1.json` — canonical descriptor contract
- `mock-enterprise/docs/DESCRIPTOR_COMPLETENESS_VALIDATOR.md`
- `mock-enterprise/docs/UNLOCK_REGRESSION_SUITE.md`
- `mock-enterprise/docs/JOB_ARCHITECTURE_INGEST_CONTRACT.md`
- `mock-enterprise/runner/generate_remediation_cases.py`
- `mock-enterprise/out/intermediate/remediation_cases.json`
- `mock-enterprise/out/reports/REMEDIATION_CASE_SUMMARY.md`
