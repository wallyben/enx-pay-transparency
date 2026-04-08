#!/usr/bin/env python3
"""
Slice 3 — Deterministic remediation case generation (synthetic / mock-enterprise only).

Reads validator + forensics JSON under mock-enterprise/out/intermediate/, emits owned
remediation objects (machine + human readable). Does not mutate source data or production packages.

NOT real pilot evidence. NOT legal/regulatory reliance.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple

_RUNNER_DIR = Path(__file__).resolve().parent
if str(_RUNNER_DIR) not in sys.path:
    sys.path.insert(0, str(_RUNNER_DIR))

from mock_enterprise_paths import INTERMEDIATE, REPORTS

MODEL_VERSION = "1.0.0"
REMEDIATION_BUNDLE_ID = "mock_enterprise_remediation_bundle_v1"

ARTIFACT_RELPATHS = (
    "mock-enterprise/out/intermediate/descriptor_completeness_results.json",
    "mock-enterprise/out/intermediate/review_required_forensics.json",
    "mock-enterprise/out/intermediate/unlock_regression_results.json",
    "mock-enterprise/out/intermediate/engine_output_main.json",
    "mock-enterprise/out/intermediate/engine_output_unlock.json",
)


def _load_json(path: Path) -> Optional[Dict[str, Any]]:
    if not path.exists():
        return None
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _stable_case_id(*parts: str) -> str:
    payload = "|".join(parts)
    h = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]
    return f"REM-CASE-{h}"


def _pick_iso_timestamp(*blobs: Optional[Dict[str, Any]]) -> str:
    candidates: List[str] = []
    for b in blobs:
        if not b:
            continue
        ts = b.get("run_timestamp")
        if isinstance(ts, str) and ts.strip():
            candidates.append(ts.strip())
    if not candidates:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return sorted(candidates)[-1]


def _engine_refs(engine: Optional[Dict[str, Any]]) -> Tuple[str, str]:
    if not engine:
        return "NOT_AVAILABLE_SYNTHETIC", "NOT_AVAILABLE_SYNTHETIC"
    intake = engine.get("intakeFileId")
    snap = (engine.get("snapshot") or {}) if isinstance(engine.get("snapshot"), dict) else {}
    sid = snap.get("snapshotId")
    run_ref = str(intake).strip() if intake else "NOT_AVAILABLE_SYNTHETIC"
    snap_ref = str(sid).strip() if sid else "NOT_AVAILABLE_SYNTHETIC"
    return run_ref, snap_ref


def _top_patterns_for_profile(
    desc: Dict[str, Any], profile_name: str
) -> List[Dict[str, Any]]:
    for p in desc.get("profiles") or []:
        if p.get("dataset_profile") == profile_name:
            return list(p.get("top_missing_patterns") or [])
    return []


def _build_descriptor_cases(
    desc: Optional[Dict[str, Any]],
    engine_main: Optional[Dict[str, Any]],
    engine_unlock: Optional[Dict[str, Any]],
    created_ts: str,
) -> List[Dict[str, Any]]:
    if not desc:
        return []
    cases: List[Dict[str, Any]] = []
    main_run, main_snap = _engine_refs(engine_main)
    unlock_run, unlock_snap = _engine_refs(engine_unlock)

    profiles = {p.get("dataset_profile"): p for p in (desc.get("profiles") or []) if p.get("dataset_profile")}

    baseline = profiles.get("baseline_adversarial")
    pilot = profiles.get("pilot_shaped_clean")

    if baseline:
        patterns = {x.get("pattern"): int(x.get("count") or 0) for x in _top_patterns_for_profile(desc, "baseline_adversarial")}
        sub_key = "job_subfamily_code:MISSING_IN_ASSIGNMENT_AND_NO_CATALOG_COLUMN"
        if patterns.get(sub_key, 0) > 0:
            cid = _stable_case_id("DESCRIPTOR_BLOCKER", sub_key, "baseline_adversarial")
            lvl_conflict = patterns.get("job_level:CONFLICT_ASSIGNMENT_VS_CATALOG", 0)
            related = []
            if lvl_conflict > 0:
                related.append(
                    _stable_case_id("JOB_ARCH_CONFLICT", "job_level:CONFLICT_ASSIGNMENT_VS_CATALOG", "baseline_adversarial")
                )
            cases.append(
                {
                    "case_id": cid,
                    "case_type": "DESCRIPTOR_COMPLETENESS_BLOCKER",
                    "issue_code": "JDMS_JOB_SUBFAMILY_CODE_MISSING",
                    "severity": "CRITICAL",
                    "blocker_flag": True,
                    "owner_role": "HRIS_PEOPLE_DATA_OWNER",
                    "status": "OPEN",
                    "source_run_reference": f"mock_enterprise:intake_file_id:{main_run}",
                    "source_snapshot_reference": main_snap,
                    "source_artifact_references": list(ARTIFACT_RELPATHS),
                    "affected_record_count": int(patterns[sub_key]),
                    "affected_entity_keys": [
                        "dataset_profile:baseline_adversarial",
                        f"validator_pattern:{sub_key}",
                    ],
                    "root_cause_summary": (
                        "Mandatory JDMS field job_subfamily_code is absent on the executable intake path "
                        "for the full main-engine cohort rows in baseline_adversarial (assignment/catalog gap)."
                    ),
                    "recommended_action": (
                        "Populate subfamily on HRIS assignment or project catalog columns onto intake per "
                        "JOB_ARCHITECTURE_INGEST_CONTRACT; re-run descriptor validator then sealed engine run."
                    ),
                    "rerun_required": True,
                    "related_case_ids": sorted(related),
                    "created_timestamp": created_ts,
                    "notes": (
                        "Synthetic baseline pack; sealed-run discipline: fix source data and re-seal — do not "
                        "mutate historical snapshot artifacts."
                    ),
                }
            )

        ck = "job_level:CONFLICT_ASSIGNMENT_VS_CATALOG"
        if patterns.get(ck, 0) > 0:
            cid = _stable_case_id("JOB_ARCH_CONFLICT", ck, "baseline_adversarial")
            sub_cid = _stable_case_id("DESCRIPTOR_BLOCKER", sub_key, "baseline_adversarial")
            cases.append(
                {
                    "case_id": cid,
                    "case_type": "JOB_ARCHITECTURE_HIERARCHY_CONFLICT",
                    "issue_code": "JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT",
                    "severity": "HIGH",
                    "blocker_flag": True,
                    "owner_role": "REWARD_JOB_ARCHITECTURE_OWNER",
                    "status": "OPEN",
                    "source_run_reference": f"mock_enterprise:intake_file_id:{main_run}",
                    "source_snapshot_reference": main_snap,
                    "source_artifact_references": list(ARTIFACT_RELPATHS),
                    "affected_record_count": int(patterns[ck]),
                    "affected_entity_keys": [
                        "dataset_profile:baseline_adversarial",
                        f"validator_pattern:{ck}",
                    ],
                    "root_cause_summary": (
                        "Assignment job_level disagrees with job_architecture catalog for a material subset of cohort rows."
                    ),
                    "recommended_action": (
                        "Reconcile authoritative grade/level between HRIS assignment and job architecture catalog; "
                        "align ingestion mapping; re-run descriptor validator."
                    ),
                    "rerun_required": True,
                    "related_case_ids": sorted([sub_cid]) if sub_key in patterns else [],
                    "created_timestamp": created_ts,
                    "notes": "Coexists with cohort-wide subfamily gap in baseline_adversarial; remediate hierarchy of truth.",
                }
            )

    if pilot:
        patterns = {x.get("pattern"): int(x.get("count") or 0) for x in _top_patterns_for_profile(desc, "pilot_shaped_clean")}
        ck = "job_level:CONFLICT_ASSIGNMENT_VS_CATALOG"
        if patterns.get(ck, 0) > 0:
            cid = _stable_case_id("JOB_ARCH_WARNING", ck, "pilot_shaped_clean")
            cases.append(
                {
                    "case_id": cid,
                    "case_type": "DESCRIPTOR_QUALITY_WARNING",
                    "issue_code": "JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT",
                    "severity": "MEDIUM",
                    "blocker_flag": False,
                    "owner_role": "REWARD_JOB_ARCHITECTURE_OWNER",
                    "status": "TRIAGED",
                    "source_run_reference": f"mock_enterprise:intake_file_id:{unlock_run}",
                    "source_snapshot_reference": unlock_snap,
                    "source_artifact_references": list(ARTIFACT_RELPATHS),
                    "affected_record_count": int(patterns[ck]),
                    "affected_entity_keys": [
                        "dataset_profile:pilot_shaped_clean",
                        f"validator_pattern:{ck}",
                    ],
                    "root_cause_summary": (
                        "JDMS overall_pass is true but cohort rows carry warning-level assignment vs catalog level mismatch."
                    ),
                    "recommended_action": (
                        "Resolve catalog vs assignment level drift to clear warnings and reduce governance noise; "
                        "re-run descriptor validator on pilot_shaped_clean."
                    ),
                    "rerun_required": True,
                    "related_case_ids": [],
                    "created_timestamp": created_ts,
                    "notes": (
                        "Accepted-exception eligible (synthetic): warning-only under JDMS for this profile; "
                        "formal ACCEPTED_EXCEPTION status requires governance decision — not auto-applied here."
                    ),
                }
            )

    return cases


def _forensics_classification_case(
    forensics: Optional[Dict[str, Any]],
    engine_main: Optional[Dict[str, Any]],
    desc: Optional[Dict[str, Any]],
    created_ts: str,
) -> List[Dict[str, Any]]:
    if not forensics:
        return []
    counts = forensics.get("primary_issue_code_counts_review_required") or {}
    code = "CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR"
    n = int(counts.get(code) or 0)
    if n <= 0:
        return []
    main_run, main_snap = _engine_refs(engine_main)
    cid = _stable_case_id("CLASSIFICATION", code, forensics.get("intermediate_run_id") or "main")
    sub_cid = _stable_case_id(
        "DESCRIPTOR_BLOCKER",
        "job_subfamily_code:MISSING_IN_ASSIGNMENT_AND_NO_CATALOG_COLUMN",
        "baseline_adversarial",
    )
    related = [sub_cid] if desc else []
    return [
        {
            "case_id": cid,
            "case_type": "CLASSIFICATION_INSUFFICIENT_DESCRIPTOR",
            "issue_code": code,
            "severity": "HIGH",
            "blocker_flag": True,
            "owner_role": "HRIS_PEOPLE_DATA_OWNER",
            "status": "OPEN",
            "source_run_reference": f"mock_enterprise:intake_file_id:{main_run};forensics_run:{forensics.get('intermediate_run_id')}",
            "source_snapshot_reference": main_snap,
            "source_artifact_references": list(ARTIFACT_RELPATHS),
            "affected_record_count": n,
            "affected_entity_keys": [
                f"forensics_intermediate_run:{forensics.get('intermediate_run_id')}",
                "engine_cohort:main",
            ],
            "root_cause_summary": (
                "Category engine placed rows in REVIEW_REQUIRED for insufficient job descriptor material; "
                "forensics shows missing normalized subfamily key alignment at the same scale."
            ),
            "recommended_action": (
                "Close JDMS mandatory descriptor gaps first; then re-run sealed intake + category assignment; "
                "confirm REVIEW_REQUIRED clears for this issue code."
            ),
            "rerun_required": True,
            "related_case_ids": sorted(related),
            "created_timestamp": created_ts,
            "notes": "Downstream symptom tied to descriptor completeness in synthetic baseline; trace via related_case_ids.",
        }
    ]


def _enterprise_worker_blocker_cases(
    forensics: Optional[Dict[str, Any]],
    engine_main: Optional[Dict[str, Any]],
    created_ts: str,
) -> List[Dict[str, Any]]:
    if not forensics:
        return []
    labels = forensics.get("enterprise_blocker_labels_worker_level") or {}
    if not isinstance(labels, dict):
        return []
    main_run, main_snap = _engine_refs(engine_main)

    mapping: Sequence[Tuple[str, str, str, str, str]] = (
        (
            "WORKER_JOIN_NOT_OK",
            "INTAKE_JOIN_INTEGRITY_BLOCKER",
            "HRIS_PAYROLL_INTEGRATION_OWNER",
            "HIGH",
            "Worker-level join_not_ok from adapter context; crosswalk / key resolution failure pool.",
        ),
        (
            "WORKER_UNMAPPED_EARNING_CODE",
            "PAYROLL_MAPPING_BLOCKER",
            "PAYROLL_CONTROLS_OWNER",
            "HIGH",
            "Unmapped in-scope earning code on worker; mapping table / payroll controls remediation.",
        ),
        (
            "WORKER_AMBIGUOUS_JOB_EVIDENCE",
            "JOB_EVIDENCE_AMBIGUITY_BLOCKER",
            "HRIS_PAYROLL_INTEGRATION_OWNER",
            "MEDIUM",
            "Ambiguous job evidence (scenario-driven synthetic); clarify authoritative job signals and joins.",
        ),
        (
            "WORKER_MISSING_GENDER",
            "DEMO_WORKER_MANDATORY_FIELD_BLOCKER",
            "HRIS_PEOPLE_DATA_OWNER",
            "MEDIUM",
            "Missing gender on worker record for synthetic scenarios requiring it for cohort eligibility.",
        ),
        (
            "WORKER_MISSING_FTE_PRIMARY_ASSIGNMENT",
            "DEMO_WORKER_MANDATORY_FIELD_BLOCKER",
            "HRIS_PEOPLE_DATA_OWNER",
            "MEDIUM",
            "Missing FTE on primary assignment for eligible cohort scenarios.",
        ),
        (
            "WORKER_PENDING_OVERRIDE_SCENARIO",
            "GOVERNANCE_PENDING_OVERRIDE_BLOCKER",
            "REWARD_GOVERNANCE_OWNER",
            "MEDIUM",
            "Pending governance override scenario flag at worker level (synthetic).",
        ),
        (
            "WORKER_METHODOLOGY_MISMATCH_SCENARIO_ADAPTER",
            "METHODOLOGY_ADAPTER_MISMATCH_BLOCKER",
            "REWARD_GOVERNANCE_OWNER",
            "HIGH",
            "Methodology / adapter mismatch scenario at worker level (synthetic).",
        ),
    )

    key_to_label = {
        "join_not_ok": mapping[0],
        "unmapped_earning_code_worker": mapping[1],
        "ambiguous_job_evidence_scenario_data_only": mapping[2],
        "missing_gender": mapping[3],
        "missing_fte_primary_assignment": mapping[4],
        "pending_override_scenario": mapping[5],
        "methodology_mismatch_scenario_adapter": mapping[6],
    }

    cases: List[Dict[str, Any]] = []
    for json_key, spec in key_to_label.items():
        issue_code, case_type, owner, severity, summary = spec
        cnt = int(labels.get(json_key) or 0)
        if cnt <= 0:
            continue
        cid = _stable_case_id("WORKER_BLOCKER", issue_code, json_key)
        cases.append(
            {
                "case_id": cid,
                "case_type": case_type,
                "issue_code": issue_code,
                "severity": severity,
                "blocker_flag": True,
                "owner_role": owner,
                "status": "OPEN",
                "source_run_reference": f"mock_enterprise:intake_file_id:{main_run};forensics_label:{json_key}",
                "source_snapshot_reference": main_snap,
                "source_artifact_references": list(ARTIFACT_RELPATHS),
                "affected_record_count": cnt,
                "affected_entity_keys": [
                    f"forensics_enterprise_label:{json_key}",
                    f"forensics_intermediate_run:{forensics.get('intermediate_run_id')}",
                ],
                "root_cause_summary": summary,
                "recommended_action": (
                    "Remediate underlying HRIS/payroll/governance data or approved exception path; "
                    "re-run mock-enterprise demo forensics to confirm label counts trend to expectation."
                ),
                "rerun_required": True,
                "related_case_ids": [],
                "created_timestamp": created_ts,
                "notes": (
                    "Worker-level adapter labels; counts are not identical to engine-row cohort — coarse synthetic bucket."
                ),
            }
        )
    return cases


def _aggregate_rows(cases: Sequence[Mapping[str, Any]]) -> List[Dict[str, Any]]:
    agg: Dict[Tuple[Any, ...], Dict[str, Any]] = {}
    for c in cases:
        key = (
            c.get("case_type"),
            c.get("issue_code"),
            c.get("owner_role"),
            c.get("severity"),
            c.get("blocker_flag"),
            c.get("rerun_required"),
        )
        if key not in agg:
            agg[key] = {
                "case_type": key[0],
                "issue_code": key[1],
                "owner_role": key[2],
                "severity": key[3],
                "blocker_flag": key[4],
                "rerun_required": key[5],
                "case_count": 0,
                "affected_record_count": 0,
                "notes": [],
            }
        agg[key]["case_count"] += 1
        agg[key]["affected_record_count"] += int(c.get("affected_record_count") or 0)
        n = c.get("notes")
        if isinstance(n, str) and n.strip():
            agg[key]["notes"].append(n.strip()[:200])
    rows = list(agg.values())
    for r in rows:
        r["notes"] = "; ".join(sorted(set(r["notes"])))[:500]
    rows.sort(key=lambda r: (r["issue_code"], r["case_type"], r["owner_role"]))
    return rows


def _counts_by_issue(cases: Sequence[Mapping[str, Any]]) -> Dict[str, Dict[str, int]]:
    out: Dict[str, Dict[str, int]] = {}
    for c in cases:
        ic = str(c.get("issue_code") or "UNKNOWN")
        slot = out.setdefault(ic, {"case_count": 0, "affected_record_count": 0})
        slot["case_count"] += 1
        slot["affected_record_count"] += int(c.get("affected_record_count") or 0)
    return dict(sorted(out.items()))


def _counts_by_owner(cases: Sequence[Mapping[str, Any]]) -> Dict[str, Dict[str, int]]:
    out: Dict[str, Dict[str, int]] = {}
    for c in cases:
        ow = str(c.get("owner_role") or "UNKNOWN")
        slot = out.setdefault(ow, {"case_count": 0, "affected_record_count": 0})
        slot["case_count"] += 1
        slot["affected_record_count"] += int(c.get("affected_record_count") or 0)
    return dict(sorted(out.items()))


def _counts_by_severity(cases: Sequence[Mapping[str, Any]]) -> Dict[str, Dict[str, int]]:
    out: Dict[str, Dict[str, int]] = {}
    for c in cases:
        sev = str(c.get("severity") or "UNKNOWN")
        slot = out.setdefault(sev, {"case_count": 0, "affected_record_count": 0})
        slot["case_count"] += 1
        slot["affected_record_count"] += int(c.get("affected_record_count") or 0)
    return dict(sorted(out.items()))


def _write_csv(path: Path, rows: Sequence[Mapping[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "case_type",
        "issue_code",
        "owner_role",
        "severity",
        "blocker_flag",
        "case_count",
        "affected_record_count",
        "rerun_required",
        "notes",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k) for k in fieldnames})


def _write_summary_md(
    path: Path,
    cases: Sequence[Mapping[str, Any]],
    agg_rows: Sequence[Mapping[str, Any]],
    source_ts: str,
) -> None:
    by_issue = _counts_by_issue(cases)
    by_owner = _counts_by_owner(cases)
    blockers = sum(1 for c in cases if c.get("blocker_flag") is True)
    warnings = sum(1 for c in cases if c.get("blocker_flag") is False)
    rerun_y = sum(1 for c in cases if c.get("rerun_required") is True)

    lines = [
        "# Remediation case summary (synthetic mock-enterprise)",
        "",
        "**Not pilot evidence. Not legal or regulatory reliance.**",
        "",
        "## 1. Objective",
        "",
        "Materialize validator and forensics failures into deterministic, owned remediation cases with explicit "
        "severity, blocker vs warning posture, and rerun linkage — without mutating sealed runs or production packages.",
        "",
        "## 2. Source artifacts used",
        "",
    ]
    for a in ARTIFACT_RELPATHS:
        lines.append(f"- `{a}`")
    lines.extend(
        [
            "",
            f"- Bundle timestamp selected from inputs: **{source_ts}**",
            "",
            "## 3. Cases generated",
            "",
            f"- **Total cases:** {len(cases)}",
            "",
        ]
    )
    for c in sorted(cases, key=lambda x: x["case_id"]):
        lines.append(
            f"- `{c['case_id']}` — **{c['issue_code']}** ({c['case_type']}) — "
            f"owner **{c['owner_role']}** — affected **{c['affected_record_count']}** — "
            f"blocker={c['blocker_flag']} — rerun={c['rerun_required']}"
        )
    lines.extend(["", "## 4. Case counts by issue", ""])
    for ic, d in by_issue.items():
        lines.append(f"- **{ic}:** {d['case_count']} case(s), **{d['affected_record_count']}** affected records (sum)")
    lines.extend(["", "## 5. Case counts by owner", ""])
    for ow, d in by_owner.items():
        lines.append(f"- **{ow}:** {d['case_count']} case(s), **{d['affected_record_count']}** affected records (sum)")
    lines.extend(
        [
            "",
            "## 6. Blocker vs warning split",
            "",
            f"- **Blocker-flag cases:** {blockers}",
            f"- **Non-blocker (quality / exception-eligible posture in notes):** {warnings}",
            "",
            "## 7. Rerun-required cases",
            "",
            f"- **Cases with rerun_required=true:** {rerun_y} / {len(cases)}",
            "",
            "## 8. What this proves",
            "",
            "- Failed and warning cohorts can be decomposed into **stable buckets** with **explicit ownership**.",
            "- Each case **points at sealed intake + snapshot identifiers** and **read-only artifact paths** (no silent data edits).",
            "- **Deterministic case_id** values allow diffing regeneration outputs across commits when inputs are unchanged.",
            "",
            "## 9. What this does not prove",
            "",
            "- No workflow engine, ticketing integration, or human assignment is implied.",
            "- Counts are **synthetic** and may **double-count conceptual overlap** across worker-level labels vs engine cohort rows.",
            "- **ACCEPTED_EXCEPTION** is documented as a lifecycle state only; this generator does not approve exceptions.",
            "",
            "## 10. Exact next recommended actions",
            "",
            "1. **HRIS_PEOPLE_DATA_OWNER:** Close `JDMS_JOB_SUBFAMILY_CODE_MISSING` for `baseline_adversarial`, then re-run "
            "`run_descriptor_completeness_validator.py` and `run_mock_enterprise_demo.py`.",
            "2. **REWARD_JOB_ARCHITECTURE_OWNER:** Reconcile `JDMS_JOB_LEVEL_ASSIGNMENT_VS_CATALOG_CONFLICT` for both profiles as applicable.",
            "3. **PAYROLL_CONTROLS_OWNER / HRIS_PAYROLL_INTEGRATION_OWNER:** Triage worker-level join and mapping labels from forensics.",
            "4. **REWARD_GOVERNANCE_OWNER:** Review pending-override and methodology-mismatch scenario buckets before any exception posture.",
            "5. **Re-seal discipline:** After fixes, capture new `engine_output_*.json` and regenerate this report for audit trail.",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def collect_cases(
    desc: Optional[Dict[str, Any]],
    forensics: Optional[Dict[str, Any]],
    unlock_blob: Optional[Dict[str, Any]],
    engine_main: Optional[Dict[str, Any]],
    engine_unlock: Optional[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], str]:
    created_ts = _pick_iso_timestamp(desc, forensics, unlock_blob)
    cases: List[Dict[str, Any]] = []
    cases.extend(_build_descriptor_cases(desc, engine_main, engine_unlock, created_ts))
    cases.extend(_forensics_classification_case(forensics, engine_main, desc, created_ts))
    cases.extend(_enterprise_worker_blocker_cases(forensics, engine_main, created_ts))
    cases.sort(key=lambda c: c["case_id"])
    known_ids = {c["case_id"] for c in cases}
    for c in cases:
        rel = c.get("related_case_ids") or []
        c["related_case_ids"] = sorted(x for x in rel if x in known_ids)
    return cases, created_ts


def generate_bundle(
    intermediate_dir: Path,
    reports_dir: Path,
) -> Dict[str, Any]:
    desc_path = intermediate_dir / "descriptor_completeness_results.json"
    forensics_path = intermediate_dir / "review_required_forensics.json"
    unlock_path = intermediate_dir / "unlock_regression_results.json"
    engine_main_path = intermediate_dir / "engine_output_main.json"
    engine_unlock_path = intermediate_dir / "engine_output_unlock.json"

    desc = _load_json(desc_path)
    forensics = _load_json(forensics_path)
    unlock_blob = _load_json(unlock_path)
    engine_main = _load_json(engine_main_path)
    engine_unlock = _load_json(engine_unlock_path)

    cases_a, created_ts = collect_cases(desc, forensics, unlock_blob, engine_main, engine_unlock)
    cases_b, _ts2 = collect_cases(desc, forensics, unlock_blob, engine_main, engine_unlock)
    if json.dumps(cases_a, sort_keys=True) != json.dumps(cases_b, sort_keys=True):
        raise RuntimeError("remediation case generation is not deterministic for fixed inputs")
    cases = cases_a

    main_run, _ = _engine_refs(engine_main)
    bundle: Dict[str, Any] = {
        "model_version": MODEL_VERSION,
        "source_run_reference": f"{REMEDIATION_BUNDLE_ID};primary_intake_file_id:{main_run}",
        "cases": cases,
        "case_counts_by_issue": _counts_by_issue(cases),
        "case_counts_by_owner": _counts_by_owner(cases),
        "case_counts_by_severity": _counts_by_severity(cases),
        "generated_timestamp": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "notes": [
            "Synthetic mock-enterprise only; not pilot readiness evidence.",
            "Unlock regression JSON is referenced for lineage; cases are derived from descriptor + forensics + engine IDs.",
            "generated_timestamp records report emission time; case content is keyed to input artifact timestamps where listed on cases.",
        ],
    }
    if unlock_blob:
        bundle["unlock_regression_overall"] = unlock_blob.get("overall_result")

    out_json = intermediate_dir / "remediation_cases.json"
    out_json.parent.mkdir(parents=True, exist_ok=True)
    with out_json.open("w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2)
        f.write("\n")

    agg = _aggregate_rows(cases)
    _write_csv(reports_dir / "REMEDIATION_CASE_COUNTS.csv", agg)
    _write_summary_md(reports_dir / "REMEDIATION_CASE_SUMMARY.md", cases, agg, created_ts)

    return bundle


def main() -> int:
    p = argparse.ArgumentParser(description="Generate deterministic remediation cases (mock-enterprise).")
    p.add_argument(
        "--intermediate-dir",
        type=Path,
        default=INTERMEDIATE,
        help="Directory containing descriptor_completeness_results.json and forensics JSON",
    )
    p.add_argument(
        "--reports-dir",
        type=Path,
        default=REPORTS,
        help="Directory for REMEDIATION_CASE_SUMMARY.md and REMEDIATION_CASE_COUNTS.csv",
    )
    args = p.parse_args()

    try:
        bundle = generate_bundle(args.intermediate_dir, args.reports_dir)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    print(f"Wrote {len(bundle['cases'])} remediation cases to mock-enterprise/out/intermediate/remediation_cases.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
