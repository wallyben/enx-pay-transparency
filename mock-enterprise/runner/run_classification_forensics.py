#!/usr/bin/env python3
"""
SYNTHETIC ONLY — forensic breakdown of category assignment outcomes for mock-enterprise runs.

Reads adapter CSVs + engine_category_detail_*.json (+ engine_output_*.json) and writes
reports under mock-enterprise/out/reports/ and intermediate JSON.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_RUNNER_DIR = Path(__file__).resolve().parent
if str(_RUNNER_DIR) not in sys.path:
    sys.path.insert(0, str(_RUNNER_DIR))

from mock_enterprise_paths import (  # noqa: E402
    INTERMEDIATE,
    REPORTS,
    REPO_ROOT,
    resolve_generated_dir,
)
from scenario_allocation import build_worker_primary_scenario  # noqa: E402


def load_csv(path: Path) -> List[Dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, headers: List[str], rows: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        for r in rows:
            w.writerow({h: r.get(h, "") for h in headers})


def primary_assignment_by_worker(assignments: List[Dict[str, str]]) -> Dict[str, Dict[str, str]]:
    primaries: Dict[str, Dict[str, str]] = {}
    for a in assignments:
        if a.get("primary_assignment_flag") != "Y":
            continue
        wid = a["hris_worker_id"]
        if wid not in primaries:
            primaries[wid] = a
    return primaries


def build_earning_lookup(mapping_rows: List[Dict[str, str]]) -> Dict[str, Dict[str, str]]:
    return {r["earning_code"]: r for r in mapping_rows}


def ensure_category_detail(
    run_id: str,
    generated_dir: Path,
    log_path: Path,
) -> Tuple[Path, Path, Path]:
    """Return paths (csv, meta, out, detail) ensuring detail JSON exists via TS if needed."""
    csv_p = INTERMEDIATE / f"engine_intake_{run_id}.csv"
    meta_p = INTERMEDIATE / f"engine_meta_{run_id}.json"
    out_p = INTERMEDIATE / f"engine_output_{run_id}.json"
    detail_p = INTERMEDIATE / f"engine_category_detail_{run_id}.json"
    if detail_p.exists() and out_p.exists():
        return csv_p, meta_p, out_p, detail_p
    runner_dir = REPO_ROOT / "mock-enterprise" / "runner"
    pnpm = shutil.which("pnpm")
    if not pnpm:
        raise RuntimeError("category detail missing and pnpm not found; run run_mock_enterprise_demo.py first.")
    cmd = [
        pnpm,
        "exec",
        "tsx",
        "run_engines.ts",
        f"--csv={csv_p.resolve().as_posix()}",
        f"--meta={meta_p.resolve().as_posix()}",
        f"--out={out_p.resolve().as_posix()}",
        f"--categoryDetailOut={detail_p.resolve().as_posix()}",
    ]
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as lg:
        lg.write("FORENSICS_TS " + " ".join(cmd) + "\n")
    if os.name == "nt":
        p = subprocess.run(
            subprocess.list2cmdline(cmd),
            cwd=str(runner_dir),
            capture_output=True,
            text=True,
            shell=True,
        )
    else:
        p = subprocess.run(cmd, cwd=str(runner_dir), capture_output=True, text=True)
    with log_path.open("a", encoding="utf-8") as lg:
        lg.write(f"exit={p.returncode}\n{p.stdout}\n{p.stderr}\n")
    if p.returncode != 0:
        raise RuntimeError(f"tsx forensics regeneration failed: {p.stderr}")
    return csv_p, meta_p, out_p, detail_p


def adapter_context(
    generated_dir: Path,
    worker_count: int,
) -> Tuple[
    Dict[str, str],
    Dict[str, Dict[str, str]],
    List[Dict[str, Any]],
    Dict[str, Dict[str, Any]],
    Dict[str, bool],
    List[str],
]:
    workers = load_csv(generated_dir / "hris_workers.csv")
    assignments = load_csv(generated_dir / "hris_assignments.csv")
    crosswalk = {r["hris_worker_id"]: r for r in load_csv(generated_dir / "hris_payroll_crosswalk.csv")}
    earnings = load_csv(generated_dir / "payroll_earnings.csv")
    earn_map = build_earning_lookup(load_csv(generated_dir / "earning_code_mapping.csv"))

    scn_by_worker = build_worker_primary_scenario(worker_count)
    prim_by_w = primary_assignment_by_worker(assignments)

    payroll_id_to_hris: Dict[str, List[str]] = defaultdict(list)
    for w in workers:
        wid = w["hris_worker_id"]
        cw = crosswalk.get(wid, {})
        pid = (cw.get("payroll_worker_id") or "").strip()
        if pid:
            payroll_id_to_hris[pid].append(wid)

    join_rows: List[Dict[str, Any]] = []
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        cw = crosswalk.get(wid, {})
        pwid = (cw.get("payroll_worker_id") or "").strip()
        st = (cw.get("crosswalk_status") or "").strip()
        dup = pwid and len(payroll_id_to_hris.get(pwid, [])) > 1
        missing_pay = (not pwid) or st == "MISSING" or scn == "SCN-002"
        join_kind = "OK"
        if missing_pay:
            join_kind = "MISSING_PAYROLL"
        elif dup:
            join_kind = "DUPLICATE_PAYROLL_KEY"
        join_rows.append({"hris_worker_id": wid, "primary_scenario_id": scn, "join_outcome": join_kind})

    lines_by_payroll: Dict[str, List[Dict[str, str]]] = defaultdict(list)
    for e in earnings:
        lines_by_payroll[e["payroll_worker_id"]].append(e)

    recon_rows: List[Dict[str, Any]] = []
    for w in workers:
        wid = w["hris_worker_id"]
        cw = crosswalk.get(wid, {})
        pwid = (cw.get("payroll_worker_id") or "").strip()
        if not pwid:
            continue
        prim = prim_by_w.get(wid)
        if not prim:
            continue
        base_sum = 0.0
        var_sum = 0.0
        unmapped = False
        for e in lines_by_payroll.get(pwid, []):
            if e.get("off_cycle_flag") != "N" or e.get("retro_flag") != "N":
                continue
            code = e["earning_code"]
            m = earn_map.get(code)
            if not m or m.get("mapping_status") == "UNMAPPED":
                unmapped = True
                continue
            fam = m.get("mapped_component_family") or ""
            amt = float(e.get("amount") or 0)
            if fam == "BASE":
                base_sum += amt
            elif fam == "VARIABLE":
                var_sum += amt
        recon_rows.append(
            {
                "hris_worker_id": wid,
                "unmapped_blocker": unmapped,
                "base_pay_rollup": round(base_sum, 2),
            }
        )

    recon_by_wid = {r["hris_worker_id"]: r for r in recon_rows}

    EXCLUDE_MAIN = {"SCN-002", "SCN-003", "SCN-004", "SCN-005", "SCN-006", "SCN-008", "SCN-010"}
    main_workers: List[str] = []
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        jr = next(j for j in join_rows if j["hris_worker_id"] == wid)
        if jr["join_outcome"] != "OK":
            continue
        if scn in EXCLUDE_MAIN:
            continue
        if (w.get("gender") or "").strip() == "":
            continue
        if (prim_by_w.get(wid, {}).get("fte_fraction") or "").strip() == "":
            continue
        if recon_by_wid.get(wid, {}).get("unmapped_blocker"):
            continue
        main_workers.append(wid)
    main_workers.sort()

    blocked_flags: Dict[str, bool] = {}
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        jr = next(j for j in join_rows if j["hris_worker_id"] == wid)
        blocked = False
        if jr["join_outcome"] != "OK":
            blocked = True
        if (w.get("gender") or "").strip() == "":
            blocked = True
        if (prim_by_w.get(wid, {}).get("fte_fraction") or "").strip() == "":
            blocked = True
        if recon_by_wid.get(wid, {}).get("unmapped_blocker"):
            blocked = True
        if scn == "SCN-008":
            blocked = True
        if scn == "SCN-010":
            blocked = True
        blocked_flags[wid] = blocked

    return scn_by_worker, prim_by_w, join_rows, recon_by_wid, blocked_flags, main_workers


def intake_rows_by_index(csv_path: Path) -> Dict[int, Dict[str, str]]:
    rows = load_csv(csv_path)
    out: Dict[int, Dict[str, str]] = {}
    for i, r in enumerate(rows):
        out[i] = r
    return out


def run_forensics(
    generated_subdir: str,
    run_id: str,
    regenerate_ts: bool,
) -> Dict[str, Any]:
    generated_dir = resolve_generated_dir(generated_subdir)
    workers = load_csv(generated_dir / "hris_workers.csv")
    worker_count = len(workers)

    scn_by_worker, prim_by_w, join_rows, recon_by_wid, blocked_flags, main_workers = adapter_context(
        generated_dir, worker_count
    )

    log_path = INTERMEDIATE / "classification_forensics.log"
    if regenerate_ts:
        if log_path.exists():
            log_path.unlink()
    try:
        csv_p, _meta_p, out_p, detail_p = ensure_category_detail(run_id, generated_dir, log_path)
    except Exception as ex:
        return {"error": str(ex), "generated_dir": str(generated_dir)}

    intake_by_i = intake_rows_by_index(csv_p)
    detail = json.loads(detail_p.read_text(encoding="utf-8"))
    eng_out = json.loads(out_p.read_text(encoding="utf-8"))

    job_by_index = {r["rowIndex"]: r for r in detail.get("jobNormalizationRows", [])}
    cat_by_index = {r["rowIndex"]: r for r in detail.get("categoryRows", [])}

    status_counts = Counter()
    issue_counts = Counter()
    jnorm_issue_counts = Counter()
    missing_desc_counts = Counter()
    scenario_status_rr = defaultdict(Counter)
    scenario_all_status = defaultdict(Counter)
    title_rr = Counter()
    family_rr = Counter()
    code_rr = Counter()
    blocker_labels = Counter()

    rows_out: List[Dict[str, Any]] = []

    for i in sorted(cat_by_index.keys()):
        cat = cat_by_index[i]
        jn = job_by_index.get(i, {})
        desc = (jn.get("descriptor") or {}).get("normalized") or {}
        wid = (intake_by_i.get(i) or {}).get("worker_id", "")
        title = (intake_by_i.get(i) or {}).get("job_title", "")
        fam = (intake_by_i.get(i) or {}).get("job_family_code", "")
        code = (intake_by_i.get(i) or {}).get("job_grade_or_level", "")
        st = cat.get("status", "")
        status_counts[st] += 1

        miss_parts = []
        if not (desc.get("titleNormalized") or "").strip():
            miss_parts.append("title")
        if not (desc.get("familyCodeNormalized") or "").strip():
            miss_parts.append("family")
        if not (desc.get("subfamilyCodeNormalized") or "").strip():
            miss_parts.append("subfamily")
        if not (desc.get("gradeOrLevelNormalized") or "").strip():
            miss_parts.append("grade_or_level")
        miss_key = ",".join(miss_parts) if miss_parts else "(none_missing)"

        issues = cat.get("issues") or []
        primary_issue = issues[0]["code"] if issues else ""
        scenario_all_status[scn_by_worker.get(wid, "")][st] += 1
        if st == "REVIEW_REQUIRED":
            issue_counts[primary_issue] += 1
            for jc in cat.get("jobNormalizationIssueCodes") or []:
                jnorm_issue_counts[jc] += 1
            missing_desc_counts[miss_key] += 1
            scenario_status_rr[scn_by_worker.get(wid, "")][st] += 1
            title_rr[title] += 1
            family_rr[fam] += 1
            code_rr[code] += 1

        rows_out.append(
            {
                "rowIndex": i,
                "worker_id": wid,
                "primary_scenario_id": scn_by_worker.get(wid, ""),
                "category_status": st,
                "primary_category_issue_code": primary_issue,
                "job_normalization_issue_codes": ",".join(cat.get("jobNormalizationIssueCodes") or []),
                "missing_descriptor_parts": miss_key,
                "intake_job_title": title,
                "intake_job_family_code": fam,
                "intake_job_subfamily_code": (intake_by_i.get(i) or {}).get("job_subfamily_code", ""),
                "intake_job_grade_or_level": code,
            }
        )

    # enterprise population blocker counts (all workers)
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        jr = next(j for j in join_rows if j["hris_worker_id"] == wid)
        if scn == "SCN-008":
            blocker_labels["pending_override_scenario"] += 1
        if (w.get("gender") or "").strip() == "":
            blocker_labels["missing_gender"] += 1
        if (prim_by_w.get(wid, {}).get("fte_fraction") or "").strip() == "":
            blocker_labels["missing_fte_primary_assignment"] += 1
        if scn == "SCN-010":
            blocker_labels["methodology_mismatch_scenario_adapter"] += 1
        if scn == "SCN-011":
            blocker_labels["ambiguous_job_evidence_scenario_data_only"] += 1
        if recon_by_wid.get(wid, {}).get("unmapped_blocker"):
            blocker_labels["unmapped_earning_code_worker"] += 1
        if jr["join_outcome"] != "OK":
            blocker_labels["join_not_ok"] += 1

    n_main = len(main_workers)

    result = {
        "generated_dir": str(generated_dir.relative_to(REPO_ROOT)),
        "intermediate_run_id": run_id,
        "main_cohort_worker_count": n_main,
        "engine_row_count": len(cat_by_index),
        "status_counts": dict(status_counts),
        "primary_issue_code_counts_review_required": dict(issue_counts),
        "job_normalization_issue_code_counts_among_review_required": dict(jnorm_issue_counts),
        "missing_normalized_descriptor_keys_among_review_required": dict(missing_desc_counts),
        "scenario_id_among_review_required": {k: dict(v) for k, v in scenario_status_rr.items()},
        "scenario_id_all_statuses_engine_rows": {k: dict(v) for k, v in scenario_all_status.items()},
        "enterprise_blocker_labels_worker_level": dict(blocker_labels),
        "engine_summary": eng_out.get("categoryAssignment"),
        "eu_core_metrics_gate": {
            "runGateBlocked": (eng_out.get("euCoreMetrics") or {}).get("runGateBlocked"),
            "classificationIncomplete": (eng_out.get("euCoreMetrics") or {})
            .get("inclusion", {})
            .get("classificationIncomplete"),
        },
        "reporting_export": {
            "completeness": (eng_out.get("reportingPack") or {}).get("completeness"),
            "exportBlockers": (eng_out.get("reportingPack") or {}).get("exportBlockers"),
        },
        "rows": rows_out,
        "top_review_required_titles": title_rr.most_common(25),
        "top_review_required_families": family_rr.most_common(25),
        "top_review_required_grades": code_rr.most_common(25),
    }
    return result


def write_forensic_artifacts(
    data: Dict[str, Any],
    *,
    json_name: str,
    markdown_name: Optional[str],
    write_reason_csvs: bool,
) -> int:
    if data.get("error"):
        print("ERROR", data["error"])
        return 1

    INTERMEDIATE.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    json_path = INTERMEDIATE / json_name
    json_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    n_rows = data["engine_row_count"]
    sc = data["status_counts"]
    rr = sc.get("REVIEW_REQUIRED", 0)
    asg = sc.get("ASSIGNED", 0)
    una = sc.get("UNASSIGNED", 0)

    br_rows = []
    for code, c in sorted(data["primary_issue_code_counts_review_required"].items(), key=lambda x: -x[1]):
        br_rows.append(
            {
                "primary_issue_code": code,
                "count": c,
                "share_of_engine_rows": round(c / max(1, n_rows), 6),
                "share_of_review_required": round(c / max(1, rr), 6) if rr else 0.0,
            }
        )
    if write_reason_csvs:
        write_csv(
            REPORTS / "REVIEW_REQUIRED_REASON_BREAKDOWN.csv",
            ["primary_issue_code", "count", "share_of_engine_rows", "share_of_review_required"],
            br_rows,
        )

        off = []
        for title, c in data["top_review_required_titles"]:
            off.append({"dimension": "job_title", "value": title, "review_required_count": c})
        for fam, c in data["top_review_required_families"]:
            off.append({"dimension": "job_family_code", "value": fam, "review_required_count": c})
        for gr, c in data["top_review_required_grades"]:
            off.append({"dimension": "job_grade_or_level", "value": gr, "review_required_count": c})
        write_csv(
            REPORTS / "REVIEW_REQUIRED_TOP_OFFENDERS.csv",
            ["dimension", "value", "review_required_count"],
            off,
        )

    md_lines = [
        "# REVIEW_REQUIRED forensics (synthetic mock-enterprise)",
        "",
        "**Not pilot evidence. Not legal/regulatory reliance.**",
        "",
        "## Summary counts (engine cohort)",
        f"- Engine rows: **{n_rows}**",
        f"- ASSIGNED: **{asg}** ({round(100 * asg / max(1, n_rows), 2)}%)",
        f"- REVIEW_REQUIRED: **{rr}** ({round(100 * rr / max(1, n_rows), 2)}%)",
        f"- UNASSIGNED: **{una}**",
        "",
        "## Primary issue codes (REVIEW_REQUIRED only)",
        "",
        "| Code | Count |",
        "| --- | ---:|",
    ]
    for code, c in sorted(data["primary_issue_code_counts_review_required"].items(), key=lambda x: -x[1]):
        md_lines.append(f"| `{code}` | {c} |")

    md_lines.extend(
        [
            "",
            "## Job-normalization issue codes (among REVIEW_REQUIRED)",
            "",
            "| Code | Count |",
            "| --- | ---:|",
        ]
    )
    for code, c in sorted(
        data["job_normalization_issue_code_counts_among_review_required"].items(),
        key=lambda x: -x[1],
    ):
        md_lines.append(f"| `{code}` | {c} |")

    md_lines.extend(
        [
            "",
            "## Missing normalized descriptor keys (among REVIEW_REQUIRED)",
            "",
            "| Pattern | Count |",
            "| --- | ---:|",
        ]
    )
    for k, c in sorted(
        data["missing_normalized_descriptor_keys_among_review_required"].items(),
        key=lambda x: -x[1],
    ):
        md_lines.append(f"| {k} | {c} |")

    md_lines.extend(
        [
            "",
            "## Adapter-level blocker labels (all synthetic workers, not just engine file)",
            "",
            "| Label | Workers |",
            "| --- | ---:|",
        ]
    )
    for k, c in sorted(data["enterprise_blocker_labels_worker_level"].items(), key=lambda x: -x[1]):
        md_lines.append(f"| {k} | {c} |")

    md_lines.extend(
        [
            "",
            "## Category status by scenario (engine rows)",
            "",
            "| Scenario | ASSIGNED | REVIEW_REQUIRED | UNASSIGNED |",
            "| --- | ---:| ---:| ---:|",
        ]
    )
    scen = data.get("scenario_id_all_statuses_engine_rows") or {}
    for sid in sorted(scen.keys()):
        d = scen[sid]
        md_lines.append(
            f"| {sid} | {d.get('ASSIGNED', 0)} | {d.get('REVIEW_REQUIRED', 0)} | {d.get('UNASSIGNED', 0)} |"
        )

    md_lines.extend(
        [
            "",
            "## Metrics / export gates (from engine_output JSON)",
            f"- runGateBlocked: **{data['eu_core_metrics_gate'].get('runGateBlocked')}**",
            f"- classificationIncomplete: **{data['eu_core_metrics_gate'].get('classificationIncomplete')}**",
            f"- reporting completeness: **{data['reporting_export'].get('completeness')}**",
            f"- exportBlockers: `{data['reporting_export'].get('exportBlockers')}`",
            "",
            "## Interpretation pointer",
            "See `mock-enterprise/docs/CLASSIFICATION_UNLOCK_PLAN.md` and `CLASSIFICATION_UNLOCK_REPORT.md`.",
            "",
        ]
    )
    if markdown_name:
        (REPORTS / markdown_name).write_text("\n".join(md_lines), encoding="utf-8")

    return 0


def write_comparison(baseline_json: Path, unlock_json: Path) -> None:
    b = json.loads(baseline_json.read_text(encoding="utf-8"))
    u = json.loads(unlock_json.read_text(encoding="utf-8"))

    def snap(d: Dict[str, Any]) -> Dict[str, Any]:
        eng = d.get("categoryAssignment") or {}
        eu = d.get("euCoreMetrics") or {}
        inc = eu.get("inclusion") or {}
        rp = d.get("reportingPack") or {}
        comp = rp.get("completeness") or {}
        exp = rp.get("exportBlockers") or []
        n = eng.get("assignedCount", 0) + eng.get("reviewRequiredCount", 0) + eng.get("unassignedCount", 0)
        return {
            "engine_rows": n,
            "assigned": eng.get("assignedCount"),
            "review_required": eng.get("reviewRequiredCount"),
            "unassigned": eng.get("unassignedCount"),
            "assigned_rate": round((eng.get("assignedCount") or 0) / max(1, n), 6),
            "review_required_rate": round((eng.get("reviewRequiredCount") or 0) / max(1, n), 6),
            "metrics_run_gate_blocked": eu.get("runGateBlocked"),
            "classification_incomplete": inc.get("classificationIncomplete"),
            "reporting_complete": comp.get("status") == "COMPLETE",
            "export_blocked": len(exp) > 0,
            "export_blockers": ",".join(exp) if exp else "",
        }

    sb = snap(b)
    su = snap(u)
    rows = [
        {"metric": "engine_category_rows", "baseline": sb["engine_rows"], "unlock": su["engine_rows"]},
        {"metric": "assigned_count", "baseline": sb["assigned"], "unlock": su["assigned"]},
        {"metric": "review_required_count", "baseline": sb["review_required"], "unlock": su["review_required"]},
        {"metric": "assigned_rate", "baseline": sb["assigned_rate"], "unlock": su["assigned_rate"]},
        {"metric": "review_required_rate", "baseline": sb["review_required_rate"], "unlock": su["review_required_rate"]},
        {
            "metric": "metrics_run_gate_blocked",
            "baseline": sb["metrics_run_gate_blocked"],
            "unlock": su["metrics_run_gate_blocked"],
        },
        {
            "metric": "classification_incomplete",
            "baseline": sb["classification_incomplete"],
            "unlock": su["classification_incomplete"],
        },
        {"metric": "reporting_pack_complete", "baseline": sb["reporting_complete"], "unlock": su["reporting_complete"]},
        {"metric": "export_blocked", "baseline": sb["export_blocked"], "unlock": su["export_blocked"]},
        {"metric": "export_blockers", "baseline": sb["export_blockers"], "unlock": su["export_blockers"]},
    ]
    write_csv(REPORTS / "CLASSIFICATION_YIELD_COMPARISON.csv", list(rows[0].keys()), rows)


def main() -> int:
    ap = argparse.ArgumentParser(description="Classification forensics for mock-enterprise synthetic runs.")
    ap.add_argument("--generated-subdir", default="", help="Under mock-enterprise/generated/")
    ap.add_argument(
        "--intermediate-run-id",
        default="main",
        help="Which engine artifact stem to analyze (main, unlock, ...).",
    )
    ap.add_argument(
        "--regenerate-category-detail",
        action="store_true",
        help="If set, rerun tsx engines to refresh engine_category_detail_*.json when missing.",
    )
    ap.add_argument(
        "--intermediate-json-name",
        default="review_required_forensics.json",
        help="Filename under out/intermediate/ for forensic JSON.",
    )
    ap.add_argument(
        "--markdown-name",
        default="REVIEW_REQUIRED_FORENSICS.md",
        help="Filename under out/reports/ for forensic markdown.",
    )
    ap.add_argument(
        "--omit-markdown",
        action="store_true",
        help="Do not write forensic markdown (keeps baseline REVIEW_REQUIRED_FORENSICS.md when analyzing unlock).",
    )
    ap.add_argument(
        "--skip-reason-csv-outputs",
        action="store_true",
        help="If set, do not rewrite REVIEW_REQUIRED_REASON_BREAKDOWN.csv / TOP_OFFENDERS.csv (use for unlock pass).",
    )
    ap.add_argument(
        "--include-per-row-rows",
        action="store_true",
        help="If set, include per-row detail in the forensic JSON (large; default is summary-only).",
    )
    ap.add_argument(
        "--compare",
        nargs=2,
        metavar=("BASELINE_ENGINE_JSON", "UNLOCK_ENGINE_JSON"),
        help="Write CLASSIFICATION_YIELD_COMPARISON.csv from two engine_output JSON files.",
    )
    args = ap.parse_args()

    if args.compare:
        bp = Path(args.compare[0])
        up = Path(args.compare[1])
        if not bp.is_file() or not up.is_file():
            print("Comparison paths must be existing engine output JSON files.")
            return 1
        write_comparison(bp, up)
        print("Wrote", REPORTS / "CLASSIFICATION_YIELD_COMPARISON.csv")
        return 0

    data = run_forensics(args.generated_subdir, args.intermediate_run_id, args.regenerate_category_detail)
    md = None if args.omit_markdown else args.markdown_name.strip()
    to_write = dict(data)
    if not args.include_per_row_rows:
        to_write.pop("rows", None)
        to_write["per_row_rows_included"] = False
    else:
        to_write["per_row_rows_included"] = True
    rc = write_forensic_artifacts(
        to_write,
        json_name=args.intermediate_json_name,
        markdown_name=md,
        write_reason_csvs=not args.skip_reason_csv_outputs,
    )
    if rc != 0:
        return rc
    print("Wrote", INTERMEDIATE / args.intermediate_json_name)
    if md:
        print("Wrote", REPORTS / md)
    return 0


if __name__ == "__main__":
    sys.exit(main())
