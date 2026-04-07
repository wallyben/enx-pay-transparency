#!/usr/bin/env python3
"""
Slice 2 — Pre-engine JDMS descriptor completeness validator (synthetic / mock-enterprise only).

Loads mock-enterprise/contracts/JDMS_v1.json and synthetic CSVs under mock-enterprise/generated/,
mirrors the demo adapter mapping for the main engine cohort, and emits machine- and human-readable
completeness diagnostics BEFORE invoking @enx/category-engine.

NOT real pilot evidence. NOT legal/regulatory reliance. Isolated under mock-enterprise/.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

_RUNNER_DIR = Path(__file__).resolve().parent
if str(_RUNNER_DIR) not in sys.path:
    sys.path.insert(0, str(_RUNNER_DIR))

from scenario_allocation import build_worker_primary_scenario

REPO_ROOT = Path(__file__).resolve().parents[2]
MOCK_ENT_ROOT = REPO_ROOT / "mock-enterprise"
CONTRACT_PATH = MOCK_ENT_ROOT / "contracts" / "JDMS_v1.json"
GENERATED_BASE = MOCK_ENT_ROOT / "generated"
OUT_REPORTS = MOCK_ENT_ROOT / "out" / "reports"
OUT_INTERMEDIATE = MOCK_ENT_ROOT / "out" / "intermediate"

# Same exclusions as run_mock_enterprise_demo.py main cohort (deterministic).
EXCLUDE_MAIN_SCENARIOS = frozenset({"SCN-002", "SCN-003", "SCN-004", "SCN-005", "SCN-006", "SCN-008", "SCN-010"})


# Logical columns on HRIS assignment row and job_architecture row used for diagnostics.
ASSIGNMENT_COLUMN_FALLBACKS: Dict[str, List[str]] = {
    "job_title": ["job_title"],
    "job_family": ["job_family", "job_family_code", "JOB_FAMILY_CODE", "family_code"],
    "job_subfamily_code": ["job_subfamily", "job_subfamily_code", "JOB_SUBFAMILY_CODE", "subfamily_code"],
    "job_level": ["job_level", "job_grade_or_level", "JOB_GRADE_OR_LEVEL", "grade_or_level", "job_grade"],
    "position_id": ["position_id", "positionId", "job_profile_id"],
    "job_code": ["job_code", "architecture_job_code", "JOB_CODE", "profile_code"],
    "equal_value_group_declaration": ["equal_value_group_id", "EQUAL_VALUE_GROUP_ID", "equal_value_group_declaration"],
}

CATALOG_COLUMN_FALLBACKS: Dict[str, List[str]] = {
    "job_title": ["job_title"],
    "job_family": ["job_family", "job_family_code"],
    "job_subfamily_code": ["job_subfamily", "job_subfamily_code", "subfamily_code"],
    "job_level": ["job_level", "job_grade_or_level"],
    "position_id": ["position_id"],
    "job_code": ["job_code"],
}


def load_csv_rows(path: Path) -> List[Dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def first_non_empty(row: Dict[str, str], cols: Iterable[str]) -> Tuple[str, str]:
    for c in cols:
        if c in row:
            v = (row.get(c) or "").strip()
            if v:
                return v, c
    return "", ""


def norm_header_keys(row: Dict[str, str]) -> Dict[str, str]:
    return {k: (v or "").strip() for k, v in row.items()}


def build_earning_lookup(mapping_rows: List[Dict[str, str]]) -> Dict[str, Dict[str, str]]:
    return {r["earning_code"]: r for r in mapping_rows}


def primary_assignment_by_worker(assignments: List[Dict[str, str]]) -> Dict[str, Dict[str, str]]:
    primaries: Dict[str, Dict[str, str]] = {}
    for a in assignments:
        if a.get("primary_assignment_flag") != "Y":
            continue
        wid = a["hris_worker_id"]
        if wid not in primaries:
            primaries[wid] = a
    return primaries


def worker_unmapped_blocker(
    workers: List[Dict[str, str]],
    crosswalk: Dict[str, Dict[str, str]],
    earnings: List[Dict[str, str]],
    earn_map: Dict[str, Dict[str, str]],
) -> Dict[str, bool]:
    lines_by_payroll: Dict[str, List[Dict[str, str]]] = defaultdict(list)
    for e in earnings:
        lines_by_payroll[e["payroll_worker_id"]].append(e)

    def line_in_scope(e: Dict[str, str]) -> bool:
        return e.get("off_cycle_flag") == "N" and e.get("retro_flag") == "N"

    out: Dict[str, bool] = {}
    for w in workers:
        wid = w["hris_worker_id"]
        cw = crosswalk.get(wid, {})
        pwid = (cw.get("payroll_worker_id") or "").strip()
        if not pwid:
            out[wid] = False
            continue
        unmapped = False
        for e in lines_by_payroll.get(pwid, []):
            if not line_in_scope(e):
                continue
            code = e["earning_code"]
            m = earn_map.get(code)
            if not m or m.get("mapping_status") == "UNMAPPED":
                unmapped = True
                break
        out[wid] = unmapped
    return out


def join_outcome_for_worker(wid: str, crosswalk: Dict[str, Dict[str, str]], payroll_id_to_hris: Dict[str, List[str]], scn: str) -> str:
    cw = crosswalk.get(wid, {})
    pwid = (cw.get("payroll_worker_id") or "").strip()
    st = (cw.get("crosswalk_status") or "").strip()
    dup = pwid and len(payroll_id_to_hris.get(pwid, [])) > 1
    missing_pay = (not pwid) or st == "MISSING" or scn == "SCN-002"
    if missing_pay:
        return "MISSING_PAYROLL"
    if dup:
        return "DUPLICATE_PAYROLL_KEY"
    return "OK"


def executable_descriptor_from_assignment(prim: Dict[str, str]) -> Dict[str, str]:
    """Mirrors run_mock_enterprise_demo.engine_row_for_worker mapping to intake columns."""
    subfam = (prim.get("job_subfamily") or prim.get("job_subfamily_code") or "").strip()
    return {
        "job_title": (prim.get("job_title") or "").strip(),
        "job_family": (prim.get("job_family") or prim.get("job_family_code") or "").strip(),
        "job_subfamily_code": subfam,
        "job_level": (prim.get("job_level") or prim.get("job_grade_or_level") or "").strip(),
        "position_id": (prim.get("position_id") or "").strip(),
        "job_code": (prim.get("job_code") or "").strip(),
        "equal_value_group_declaration": (
            prim.get("equal_value_group_declaration") or prim.get("equal_value_group_id") or ""
        ).strip(),
    }


@dataclass
class FieldEval:
    canonical: str
    raw_assignment_value: str
    raw_assignment_column_used: str
    catalog_value: str
    catalog_column_used: str
    catalog_column_absent: bool
    executable_value: str
    missing_in_raw_assignment: bool
    missing_on_executable_path: bool
    catalog_richer_than_assignment: bool
    conflict_assignment_vs_catalog: bool
    applicability: str  # APPLICABLE | OPTIONAL_NOT_REQUIRED_FOR_CATEGORY | NOT_IN_SYNTHETIC_SOURCES | CONDITIONAL_ENGINE_CONFIG
    notes: List[str] = field(default_factory=list)


def evaluate_field(
    canonical: str,
    jdms_entry: Dict[str, Any],
    prim: Dict[str, str],
    catalog_row: Optional[Dict[str, str]],
    executable: Dict[str, str],
) -> FieldEval:
    req_cat = bool(jdms_entry.get("required_for_category_assignment"))
    aliases = jdms_entry.get("allowed_aliases") or []

    assign_cols = list(dict.fromkeys(ASSIGNMENT_COLUMN_FALLBACKS.get(canonical, [canonical]) + list(aliases)))

    raw_val, raw_col = first_non_empty(prim, assign_cols)
    missing_raw = raw_val == ""

    ex_val = executable.get(canonical, "")
    missing_ex = ex_val == ""

    cat_val, cat_col = "", ""
    cat_absent = True
    catalog_richer = False
    conflict = False

    if catalog_row is not None:
        cat_cols = list(dict.fromkeys(CATALOG_COLUMN_FALLBACKS.get(canonical, [canonical]) + list(aliases)))
        cat_val, cat_col = first_non_empty(catalog_row, cat_cols)
        present_keys = set(catalog_row.keys())
        cat_absent = not any(c in present_keys for c in cat_cols)
        if not missing_raw and cat_val and raw_val != cat_val:
            if canonical in ("job_title", "job_family", "job_subfamily_code", "job_level"):
                conflict = True
        if missing_raw and cat_val:
            catalog_richer = True

    applicability = "APPLICABLE"
    notes: List[str] = []
    if canonical == "equal_value_group_declaration":
        applicability = "CONDITIONAL_ENGINE_CONFIG"
        notes.append("Mock demo passes equalValueRuleset=null; EV declaration not consumed on this path.")
    elif not req_cat:
        applicability = "OPTIONAL_NOT_REQUIRED_FOR_CATEGORY"

    return FieldEval(
        canonical=canonical,
        raw_assignment_value=raw_val,
        raw_assignment_column_used=raw_col,
        catalog_value=cat_val,
        catalog_column_used=cat_col,
        catalog_column_absent=cat_absent,
        executable_value=ex_val,
        missing_in_raw_assignment=missing_raw,
        missing_on_executable_path=missing_ex,
        catalog_richer_than_assignment=catalog_richer,
        conflict_assignment_vs_catalog=conflict,
        applicability=applicability,
        notes=notes,
    )


def main_engine_cohort_workers(
    workers: List[Dict[str, str]],
    scn_by_worker: Dict[str, str],
    crosswalk: Dict[str, Dict[str, str]],
    payroll_id_to_hris: Dict[str, List[str]],
    prim_by_w: Dict[str, Dict[str, str]],
    unmapped_by_w: Dict[str, bool],
) -> List[str]:
    cohort: List[str] = []
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        if join_outcome_for_worker(wid, crosswalk, payroll_id_to_hris, scn) != "OK":
            continue
        if scn in EXCLUDE_MAIN_SCENARIOS:
            continue
        if (w.get("gender") or "").strip() == "":
            continue
        if (prim_by_w.get(wid, {}).get("fte_fraction") or "").strip() == "":
            continue
        if unmapped_by_w.get(wid, False):
            continue
        cohort.append(wid)
    cohort.sort()
    return cohort


def load_jdms_contract(path: Path) -> Dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("contract_id") != "JDMS_v1":
        raise ValueError(f"Unexpected contract_id in {path}")
    return data


def run_profile(
    generated_dir: Path,
    dataset_profile: str,
    jdms: Dict[str, Any],
) -> Dict[str, Any]:
    workers = [norm_header_keys(r) for r in load_csv_rows(generated_dir / "hris_workers.csv")]
    assignments = [norm_header_keys(r) for r in load_csv_rows(generated_dir / "hris_assignments.csv")]
    jobs_list = [norm_header_keys(r) for r in load_csv_rows(generated_dir / "job_architecture.csv")]
    jobs_by_pos = {r["position_id"]: r for r in jobs_list if r.get("position_id")}
    crosswalk = {norm_header_keys(r)["hris_worker_id"]: norm_header_keys(r) for r in load_csv_rows(generated_dir / "hris_payroll_crosswalk.csv")}
    earnings = load_csv_rows(generated_dir / "payroll_earnings.csv")
    earn_map = build_earning_lookup([norm_header_keys(r) for r in load_csv_rows(generated_dir / "earning_code_mapping.csv")])

    worker_count = len(workers)
    scn_by_worker = build_worker_primary_scenario(worker_count)
    prim_by_w = primary_assignment_by_worker(assignments)

    payroll_id_to_hris: Dict[str, List[str]] = defaultdict(list)
    for w in workers:
        wid = w["hris_worker_id"]
        cw = crosswalk.get(wid, {})
        pid = (cw.get("payroll_worker_id") or "").strip()
        if pid:
            payroll_id_to_hris[pid].append(wid)

    unmapped_by_w = worker_unmapped_blocker(workers, crosswalk, earnings, earn_map)
    cohort_wids = main_engine_cohort_workers(workers, scn_by_worker, crosswalk, payroll_id_to_hris, prim_by_w, unmapped_by_w)

    fields_meta = sorted(jdms.get("fields") or [], key=lambda x: x.get("canonical_field_name", ""))

    row_records: List[Dict[str, Any]] = []
    missing_field_counter: Counter[str] = Counter()
    missing_by_family: Dict[str, Counter[str]] = defaultdict(Counter)
    missing_by_level: Dict[str, Counter[str]] = defaultdict(Counter)
    missing_by_scenario: Dict[str, Counter[str]] = defaultdict(Counter)
    pattern_counter: Counter[str] = Counter()
    blocker_rows = 0
    warning_rows = 0

    for wid in cohort_wids:
        prim = prim_by_w[wid]
        pos_id = (prim.get("position_id") or "").strip()
        catalog_row = jobs_by_pos.get(pos_id)
        executable = executable_descriptor_from_assignment(prim)
        scn = scn_by_worker[wid]
        fam_for_agg = executable.get("job_family") or "(blank_family)"
        lvl_for_agg = executable.get("job_level") or "(blank_level)"

        per_field: Dict[str, Any] = {}
        row_has_blocker = False
        row_has_warning = False

        for fm in fields_meta:
            cname = fm["canonical_field_name"]
            ev = evaluate_field(cname, fm, prim, catalog_row, executable)
            per_field[cname] = {
                "raw_assignment_value": ev.raw_assignment_value,
                "raw_assignment_column": ev.raw_assignment_column_used or None,
                "catalog_value": ev.catalog_value or None,
                "catalog_column": ev.catalog_column_used or None,
                "catalog_column_absent": ev.catalog_column_absent,
                "executable_value": ev.executable_value or None,
                "missing_in_raw_assignment": ev.missing_in_raw_assignment,
                "missing_on_executable_path": ev.missing_on_executable_path,
                "catalog_richer_than_assignment": ev.catalog_richer_than_assignment,
                "conflict_assignment_vs_catalog": ev.conflict_assignment_vs_catalog,
                "applicability": ev.applicability,
                "jdms_required_for_category_assignment": bool(fm.get("required_for_category_assignment")),
                "jdms_blocker_if_missing": bool(fm.get("blocker_if_missing")),
                "jdms_review_required_if_missing": bool(fm.get("review_required_if_missing")),
                "notes": ev.notes,
            }

            req_cat = bool(fm.get("required_for_category_assignment"))
            blk = bool(fm.get("blocker_if_missing"))
            rev = bool(fm.get("review_required_if_missing"))
            req_ev = bool(fm.get("required_for_equal_value_grouping"))

            if cname == "equal_value_group_declaration":
                continue

            if not req_cat:
                if cname == "position_id" and ev.missing_on_executable_path and req_ev:
                    row_has_warning = True
                    pattern_counter["position_id:MISSING_METHODOLOGY_TRACEABILITY"] += 1
                if ev.conflict_assignment_vs_catalog:
                    row_has_warning = True
                    pattern_counter[f"{cname}:CONFLICT_ASSIGNMENT_VS_CATALOG"] += 1
                continue

            if ev.missing_on_executable_path:
                missing_field_counter[cname] += 1
                missing_by_family[cname][fam_for_agg] += 1
                missing_by_level[cname][lvl_for_agg] += 1
                missing_by_scenario[cname][scn] += 1

                if ev.missing_in_raw_assignment and ev.catalog_richer_than_assignment:
                    pat = f"{cname}:PRESENT_IN_CATALOG_NOT_MAPPED_TO_INTAKE"
                    pattern_counter[pat] += 1
                elif ev.missing_in_raw_assignment and not ev.catalog_richer_than_assignment:
                    if ev.catalog_column_absent:
                        pat = f"{cname}:MISSING_IN_ASSIGNMENT_AND_NO_CATALOG_COLUMN"
                    else:
                        pat = f"{cname}:MISSING_IN_ASSIGNMENT_CATALOG_ALSO_BLANK"
                    pattern_counter[pat] += 1
                elif not ev.missing_in_raw_assignment and ev.missing_on_executable_path:
                    pat = f"{cname}:PRESENT_IN_SOURCE_STRIPPED_OR_ADAPTER_DROP"
                    pattern_counter[pat] += 1
                else:
                    pat = f"{cname}:MISSING_ON_EXECUTABLE_PATH"
                    pattern_counter[pat] += 1

                if blk:
                    row_has_blocker = True
                elif rev:
                    row_has_warning = True

            if ev.conflict_assignment_vs_catalog:
                row_has_warning = True
                pattern_counter[f"{cname}:CONFLICT_ASSIGNMENT_VS_CATALOG"] += 1

        if row_has_blocker:
            blocker_rows += 1
        elif row_has_warning:
            warning_rows += 1

        status = "PASS"
        if row_has_blocker:
            status = "BLOCKER"
        elif row_has_warning:
            status = "WARNING"

        row_records.append(
            {
                "hris_worker_id": wid,
                "primary_scenario_id": scn,
                "position_id": pos_id or None,
                "cohort_status": status,
                "fields": per_field,
            }
        )

    total = len(cohort_wids)
    required_field_summaries: List[Dict[str, Any]] = []
    for fm in fields_meta:
        cname = fm["canonical_field_name"]
        if not fm.get("required_for_category_assignment"):
            continue
        mc = int(missing_field_counter.get(cname, 0))
        required_field_summaries.append(
            {
                "canonical_field_name": cname,
                "missing_count": mc,
                "missing_rate": round(mc / max(1, total), 6),
                "blocker_if_missing": bool(fm.get("blocker_if_missing")),
                "review_required_if_missing": bool(fm.get("review_required_if_missing")),
                "top_job_family": missing_by_family[cname].most_common(1)[0][0] if mc else "",
                "top_job_level": missing_by_level[cname].most_common(1)[0][0] if mc else "",
                "top_scenario": missing_by_scenario[cname].most_common(1)[0][0] if mc else "",
            }
        )

    top_patterns = [{"pattern": p, "count": c} for p, c in pattern_counter.most_common(25)]

    overall_pass = blocker_rows == 0

    row_status_counts = Counter(r["cohort_status"] for r in row_records)

    return {
        "dataset_profile": dataset_profile,
        "generated_dir": generated_dir.relative_to(REPO_ROOT).as_posix(),
        "input_files_evaluated": [
            (generated_dir / name).relative_to(REPO_ROOT).as_posix()
            for name in (
                "hris_workers.csv",
                "hris_assignments.csv",
                "job_architecture.csv",
                "hris_payroll_crosswalk.csv",
                "payroll_earnings.csv",
                "earning_code_mapping.csv",
            )
        ],
        "jdms_contract_path": CONTRACT_PATH.relative_to(REPO_ROOT).as_posix(),
        "cohort_definition": "Same filters as run_mock_enterprise_demo.py main engine CSV (join OK, scenario not in EXCLUDE_MAIN, gender present, FTE present, no unmapped earning blocker).",
        "total_workers_in_pack": worker_count,
        "total_rows": total,
        "overall_pass": overall_pass,
        "blocker_count": blocker_rows,
        "warning_count": warning_rows,
        "row_status_counts": dict(row_status_counts),
        "required_field_summaries": required_field_summaries,
        "top_missing_patterns": top_patterns,
        "_row_records": row_records,
    }


def write_summary_csv(path: Path, profiles_payload: List[Dict[str, Any]], jdms: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    field_meta_by_name = {f["canonical_field_name"]: f for f in jdms.get("fields", [])}
    rows_out: List[Dict[str, str]] = []
    for prof in profiles_payload:
        dprof = prof["dataset_profile"]
        total = int(prof["total_rows"])
        for s in prof["required_field_summaries"]:
            cname = s["canonical_field_name"]
            fm = field_meta_by_name.get(cname, {})
            mc = int(s["missing_count"])
            rows_out.append(
                {
                    "dataset_profile": dprof,
                    "total_rows": str(total),
                    "required_field": cname,
                    "missing_count": str(mc),
                    "missing_rate": f"{s['missing_rate']:.6f}",
                    "blocker_if_missing": str(fm.get("blocker_if_missing", s.get("blocker_if_missing", ""))),
                    "review_required_if_missing": str(
                        fm.get("review_required_if_missing", s.get("review_required_if_missing", ""))
                    ),
                    "top_job_family": s.get("top_job_family") or "",
                    "top_job_level": s.get("top_job_level") or "",
                    "notes": "JDMS_v1 required_for_category_assignment; executable path mirrors demo adapter.",
                }
            )
        rows_out.append(
            {
                "dataset_profile": dprof,
                "total_rows": str(total),
                "required_field": "_row_level_blocker_any_field",
                "missing_count": str(prof["blocker_count"]),
                "missing_rate": f"{round(prof['blocker_count'] / max(1, total), 6):.6f}",
                "blocker_if_missing": "True",
                "review_required_if_missing": "True",
                "top_job_family": "",
                "top_job_level": "",
                "notes": "Rows with any category-mandatory JDMS field missing on executable intake mapping.",
            }
        )
    headers = [
        "dataset_profile",
        "total_rows",
        "required_field",
        "missing_count",
        "missing_rate",
        "blocker_if_missing",
        "review_required_if_missing",
        "top_job_family",
        "top_job_level",
        "notes",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        for r in rows_out:
            w.writerow(r)


def write_markdown_report(path: Path, jdms: Dict[str, Any], profiles_payload: List[Dict[str, Any]], run_ts: str) -> None:
    ver = jdms.get("version", "")
    lines = [
        "# Descriptor completeness report (pre-engine JDMS gate; synthetic only)",
        "",
        "**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**",
        "",
        "## 1. Objective",
        "",
        "Fail fast on **missing mandatory job descriptors** before `@enx/category-engine` runs, using **`JDMS_v1.json`** as the single machine-readable contract. Surface **where** gaps occur (raw HRIS assignment vs catalog vs demo adapter executable path), at **what scale**, and whether each gap is a **blocker** or **warning** under JDMS flags.",
        "",
        "## 2. JDMS version used",
        "",
        f"- **contract_id:** `{jdms.get('contract_id')}`",
        f"- **version:** `{ver}`",
        f"- **status:** `{jdms.get('status', '')}`",
        "",
        "## 3. Input files evaluated",
        "",
    ]
    if profiles_payload:
        for p in profiles_payload[0].get("input_files_evaluated", []):
            lines.append(f"- `{p}`")
        lines.append(f"- `{profiles_payload[0].get('jdms_contract_path', '')}`")
    lines.extend(
        [
            "",
            "## 4. Cohort summary",
            "",
            "Cohort matches **`run_mock_enterprise_demo.py` main engine CSV** eligibility (join OK, excluded failure scenarios SCN-002/003/004/005/006/008/010, gender and FTE present, no unmapped in-scope earnings). Descriptor completeness is assessed on **primary assignment** rows for those workers.",
            "",
        ]
    )
    for prof in profiles_payload:
        lines.extend(
            [
                f"### Profile: `{prof['dataset_profile']}`",
                "",
                f"| Metric | Value |",
                f"| --- | --- |",
                f"| Pack directory | `{prof['generated_dir']}` |",
                f"| Workers in pack | {prof['total_workers_in_pack']} |",
                f"| Cohort rows evaluated | **{prof['total_rows']}** |",
                f"| Rows with **blocker**-level descriptor gap | **{prof['blocker_count']}** |",
                f"| Rows with **warning**-only issues | **{prof['warning_count']}** |",
                f"| **overall_pass** (no blocker rows) | **{prof['overall_pass']}** |",
                "",
            ]
        )

    lines.extend(["## 5. Completeness results by required field", ""])
    for prof in profiles_payload:
        lines.append(f"### `{prof['dataset_profile']}`")
        lines.append("")
        lines.append("| Field | Missing count | Missing rate | Blocker if missing (JDMS) | Top job family | Top job level | Top scenario |")
        lines.append("| --- | ---: | ---: | --- | --- | --- | --- |")
        for s in prof["required_field_summaries"]:
            lines.append(
                f"| `{s['canonical_field_name']}` | {s['missing_count']} | {s['missing_rate']:.4f} | "
                f"{s['blocker_if_missing']} | {s.get('top_job_family') or '—'} | {s.get('top_job_level') or '—'} | "
                f"{s.get('top_scenario') or '—'} |"
            )
        lines.append("")

    lines.extend(
        [
            "## 6. Blocker findings",
            "",
            "A **blocker row** is any cohort row where a field with **`required_for_category_assignment: true`** and **`blocker_if_missing: true`** is **empty on the executable intake mapping** (what the demo adapter would place on `engine_intake_*.csv`).",
            "",
        ]
    )
    for prof in profiles_payload:
        lines.append(f"- **`{prof['dataset_profile']}`:** {prof['blocker_count']} / {prof['total_rows']} rows.")
    lines.append("")
    lines.append("### `job_subfamily_code` (explicit)")
    lines.append("")
    for prof in profiles_payload:
        sub = next((x for x in prof["required_field_summaries"] if x["canonical_field_name"] == "job_subfamily_code"), None)
        if sub:
            if int(sub["missing_count"]) > 0:
                extra = (
                    "Assignment and/or catalog omit subfamily for this pack; the TS path does not merge `job_architecture.csv` automatically — "
                    "catalog richness must be projected onto the intake row (`JOB_ARCHITECTURE_INGEST_CONTRACT.md`)."
                )
            else:
                extra = (
                    "Executable `job_subfamily_code` is populated for this cohort (HRIS `job_subfamily` → demo adapter → engine CSV)."
                )
            lines.append(
                f"- **`{prof['dataset_profile']}`:** missing **{sub['missing_count']}** rows "
                f"({float(sub['missing_rate']) * 100:.2f}% of cohort). {extra}"
            )
    lines.append("")

    lines.extend(
        [
            "## 7. Warning findings",
            "",
            "- **Methodology traceability:** `position_id` may be present; when empty, JDMS marks it non-blocking for category but **required for equal-value grouping** evidence — reflected in **`warning_count`** / **`row_status_counts`** when conflicts or methodology gaps apply; use `--include-row-detail-json` for per-row field flags.",
            "- **Assignment vs catalog conflicts** on title/family/subfamily/level increment **warning** patterns (not assumed remediated automatically).",
            "",
            "## 8. Top offending cohorts (aggregates)",
            "",
        ]
    )
    for prof in profiles_payload:
        lines.append(f"### `{prof['dataset_profile']}` — top missing patterns")
        lines.append("")
        lines.append("| Pattern | Count |")
        lines.append("| --- | ---: |")
        for item in prof.get("top_missing_patterns", [])[:15]:
            lines.append(f"| `{item['pattern']}` | {item['count']} |")
        lines.append("")

    lines.extend(
        [
            "## 9. Comparison note (multiple dataset profiles)",
            "",
        ]
    )
    if len(profiles_payload) >= 2:
        lines.append("Two synthetic profiles are compared side-by-side in this run:")
        lines.append("")
        lines.append("| Profile | Cohort rows | Blocker rows | job_subfamily_code missing |")
        lines.append("| --- | ---: | ---: | ---: |")
        for prof in profiles_payload:
            sub = next((x for x in prof["required_field_summaries"] if x["canonical_field_name"] == "job_subfamily_code"), {})
            lines.append(
                f"| `{prof['dataset_profile']}` | {prof['total_rows']} | {prof['blocker_count']} | {sub.get('missing_count', '')} |"
            )
        lines.append("")
        lines.append(
            "Expected: **`baseline_adversarial`** omits assignment subfamily → mass executable-path gaps; "
            "**`pilot_shaped_clean`** supplies `job_subfamily` → subfamily completeness clears for the cohort."
        )
    else:
        lines.append("Single profile in this report; generate/compare by re-running with `--profile` or default multi-profile discovery.")
    lines.append("")

    lines.extend(
        [
            "## 10. What this proves",
            "",
            "- A **deterministic, JDMS-driven** pre-engine gate can explain **`REVIEW_REQUIRED` / metrics gate blockage** caused by **descriptor underfeed** before opaque engine outcomes.",
            "- **`job_subfamily_code` completeness** is explicit, measurable, and tied to **raw vs executable** path (including “present in catalog, not mapped” when applicable).",
            "",
            "## 11. What this does not prove",
            "",
            "- **Not** pilot readiness, **not** payroll truth, **not** legal category defensibility, **not** Wave P real-evidence closure.",
            "- **Not** that every real enterprise will mirror these CSV shapes — only that the **mock pack + demo adapter** satisfy or violate JDMS in a reproducible way.",
            "",
            "## 12. Exact next recommended actions",
            "",
            "1. **Remediation slice (future):** wire governed catalog → intake projection (or HRIS field population) so `job_subfamily_code` is non-empty where the category engine requires `subfamilyCodeNormalized`.",
            "2. **Optional:** attach this validator to `run_mock_enterprise_demo.py` as an explicit pre-flight stage returning non-zero exit when `overall_pass` is false.",
            "3. **Governance:** keep JDMS as the single contract version for intake validators; bump contract version if category rules change the descriptor minimum.",
            "",
            f"---",
            f"",
            f"*Run timestamp (UTC): {run_ts}*",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="JDMS v1 descriptor completeness validator (mock-enterprise synthetic packs).")
    p.add_argument(
        "--generated-subdir",
        action="append",
        default=[],
        help="Folder under mock-enterprise/generated/ (repeatable). Default: baseline root + pilot_shaped_clean if present.",
    )
    p.add_argument(
        "--contract",
        type=Path,
        default=None,
        help="Override path to JDMS JSON (default: mock-enterprise/contracts/JDMS_v1.json).",
    )
    p.add_argument(
        "--include-row-detail-json",
        action="store_true",
        help="Include per-row 'rows' array in descriptor_completeness_results.json (very large). Default: summary only.",
    )
    return p.parse_args()


def default_profile_dirs() -> List[Tuple[str, Path]]:
    out: List[Tuple[str, Path]] = []
    root = GENERATED_BASE
    if root.exists():
        out.append(("baseline_adversarial", root))
        pilot = root / "pilot_shaped_clean"
        if pilot.exists():
            out.append(("pilot_shaped_clean", pilot))
    return out


def main() -> int:
    args = parse_args()
    contract_path = Path(args.contract) if args.contract else CONTRACT_PATH
    jdms = load_jdms_contract(contract_path)

    if args.generated_subdir:
        profiles: List[Tuple[str, Path]] = []
        for sub in args.generated_subdir:
            s = (sub or "").strip()
            gd = GENERATED_BASE if not s else GENERATED_BASE / s
            label = "baseline_adversarial" if not s else s
            profiles.append((label, gd))
    else:
        profiles = default_profile_dirs()

    if not profiles:
        print("No generated packs found under mock-enterprise/generated/", file=sys.stderr)
        return 1

    run_ts = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    profiles_payload: List[Dict[str, Any]] = []
    for label, gd in profiles:
        if not gd.exists():
            print(f"Missing generated dir: {gd}", file=sys.stderr)
            return 1
        profiles_payload.append(run_profile(gd, label, jdms))

    artifact = {
        "contract_id": jdms.get("contract_id"),
        "contract_version": jdms.get("version"),
        "synthetic_only": True,
        "not_pilot_evidence": True,
        "run_timestamp": run_ts,
        "notes": [
            "Cohort = main engine CSV eligibility in run_mock_enterprise_demo.py.",
            "Executable path mirrors engine_row_for_worker mapping (job_subfamily -> job_subfamily_code).",
            "job_architecture.csv is used for conflict/richer-than-assignment diagnostics only; TS engines do not auto-merge it.",
        ],
        "profiles": profiles_payload,
    }

    for p in artifact["profiles"]:
        if args.include_row_detail_json:
            p["rows"] = p.pop("_row_records")
        else:
            p.pop("_row_records", None)

    OUT_INTERMEDIATE.mkdir(parents=True, exist_ok=True)
    OUT_REPORTS.mkdir(parents=True, exist_ok=True)
    json_path = OUT_INTERMEDIATE / "descriptor_completeness_results.json"
    json_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    write_summary_csv(OUT_REPORTS / "DESCRIPTOR_COMPLETENESS_SUMMARY.csv", profiles_payload, jdms)
    write_markdown_report(OUT_REPORTS / "DESCRIPTOR_COMPLETENESS_REPORT.md", jdms, profiles_payload, run_ts)

    print(f"Wrote {json_path.relative_to(REPO_ROOT)}")
    print(f"Wrote {(OUT_REPORTS / 'DESCRIPTOR_COMPLETENESS_SUMMARY.csv').relative_to(REPO_ROOT)}")
    print(f"Wrote {(OUT_REPORTS / 'DESCRIPTOR_COMPLETENESS_REPORT.md').relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
