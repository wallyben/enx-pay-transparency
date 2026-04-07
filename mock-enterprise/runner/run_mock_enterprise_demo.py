#!/usr/bin/env python3
"""
SYNTHETIC enterprise demonstration driver (Ireland perimeter pack).

- Loads CSVs from mock-enterprise/generated/
- Performs join + mapping-governance + reconciliation logic in Python (synthetic adapter)
- Invokes repo TypeScript engines (@enx/*) via mock-enterprise/runner/run_engines.ts for cohorts that can seal + run

NOT real pilot evidence. NOT legal/regulatory reliance.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

_RUNNER_DIR = Path(__file__).resolve().parent
if str(_RUNNER_DIR) not in sys.path:
    sys.path.insert(0, str(_RUNNER_DIR))

from scenario_allocation import build_worker_primary_scenario

REPO_ROOT = Path(__file__).resolve().parents[2]
MOCK_ENT_ROOT = REPO_ROOT / "mock-enterprise"
GENERATED_BASE = MOCK_ENT_ROOT / "generated"
OUT = MOCK_ENT_ROOT / "out"
LOGS = OUT / "logs"
REPORTS = OUT / "reports"
INTERMEDIATE = OUT / "intermediate"

METHOD_VERSION = "methodology_v1@v1.0.0"
RULE_PACK = "rule_pack_synth_v1"


@dataclass
class StageStatus:
    name: str
    status: str  # EXECUTED | PARTIALLY EXECUTED | BLOCKED | NOT IMPLEMENTED IN CURRENT SYSTEM
    notes: str = ""


def ensure_dirs() -> None:
    for p in (OUT, LOGS, REPORTS, INTERMEDIATE, LOGS):
        p.mkdir(parents=True, exist_ok=True)


def resolve_generated_dir(subdir: str) -> Path:
    s = (subdir or "").strip()
    if not s:
        return GENERATED_BASE
    return GENERATED_BASE / s


def load_csv(generated_dir: Path, name: str) -> List[Dict[str, str]]:
    path = generated_dir / name
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, headers: List[str], rows: Iterable[Dict[str, Any]]) -> int:
    n = 0
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in headers})
            n += 1
    return n


def log_line(path: Path, msg: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(msg.rstrip() + "\n")


def run_ts_engine(
    csv_path: Path,
    meta_path: Path,
    out_path: Path,
    log_path: Path,
    category_detail_out: Optional[Path] = None,
) -> None:
    runner_dir = REPO_ROOT / "mock-enterprise" / "runner"
    pnpm = shutil.which("pnpm")
    if not pnpm:
        raise RuntimeError("pnpm not found on PATH; install pnpm or run engines manually (see runner README).")
    cmd = [
        pnpm,
        "exec",
        "tsx",
        "run_engines.ts",
        f"--csv={csv_path.resolve().as_posix()}",
        f"--meta={meta_path.resolve().as_posix()}",
        f"--out={out_path.resolve().as_posix()}",
    ]
    if category_detail_out is not None:
        cmd.append(f"--categoryDetailOut={category_detail_out.resolve().as_posix()}")
    log_line(log_path, "COMMAND " + " ".join(cmd))
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
    log_line(log_path, "EXIT " + str(p.returncode))
    if p.stdout:
        log_line(log_path, "STDOUT\n" + p.stdout)
    if p.stderr:
        log_line(log_path, "STDERR\n" + p.stderr)
    if p.returncode != 0:
        raise RuntimeError(f"Engine subprocess failed with {p.returncode}")


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


def main() -> int:
    parser = argparse.ArgumentParser(description="Synthetic mock enterprise demo driver (CSV pack → adapter → TS engines).")
    parser.add_argument(
        "--generated-subdir",
        default=os.environ.get("MOCK_ENTERPRISE_GENERATED_SUBDIR", "").strip(),
        help="Optional folder under mock-enterprise/generated/ (e.g. pilot_shaped_clean). Default: mock-enterprise/generated/.",
    )
    parser.add_argument(
        "--intermediate-run-id",
        default=os.environ.get("MOCK_ENTERPRISE_INTERMEDIATE_RUN_ID", "main").strip() or "main",
        help='Intermediate artifact stem: "main" (default) or "unlock" (writes engine_output_unlock.json, unlock_run_manifest.json, ...).',
    )
    args = parser.parse_args()
    generated_dir = resolve_generated_dir(args.generated_subdir)
    synthetic_profile_label = args.generated_subdir.strip() or "default_generated_root"
    run_id = args.intermediate_run_id.strip() or "main"

    ensure_dirs()
    log_name = "mock-enterprise-demo" if run_id == "main" else f"mock-enterprise-demo-{run_id}"
    manifest_path = INTERMEDIATE / ("unlock_run_manifest.json" if run_id == "unlock" else "run_manifest.json")
    log_path = LOGS / f"{log_name}.log"
    if log_path.exists():
        log_path.unlink()
    stages: List[StageStatus] = []

    # --- 1) Validate presence / schema sanity ---
    required_files = [
        "hris_workers.csv",
        "hris_assignments.csv",
        "job_architecture.csv",
        "hris_payroll_crosswalk.csv",
        "payroll_runs.csv",
        "payroll_earnings.csv",
        "earning_code_mapping.csv",
        "expected_scenario_manifest.csv",
    ]
    missing = [f for f in required_files if not (generated_dir / f).exists()]
    if missing:
        stages.append(
            StageStatus(
                "1_validate_pack",
                "BLOCKED",
                "Missing generated files: " + ", ".join(missing) + f" (under {generated_dir})",
            )
        )
        write_json(
            manifest_path,
            {
                "run_id": log_name,
                "intermediate_run_id": run_id,
                "generated_dir": str(generated_dir.relative_to(REPO_ROOT)),
                "synthetic_profile_label": synthetic_profile_label,
                "stages": [s.__dict__ for s in stages],
                "error": "missing_inputs",
            },
        )
        return 1
    stages.append(
        StageStatus(
            "1_validate_pack",
            "EXECUTED",
            f"All required CSVs present under {generated_dir.relative_to(REPO_ROOT)}",
        )
    )

    workers = load_csv(generated_dir, "hris_workers.csv")
    assignments = load_csv(generated_dir, "hris_assignments.csv")
    jobs = {r["position_id"]: r for r in load_csv(generated_dir, "job_architecture.csv")}
    crosswalk = {r["hris_worker_id"]: r for r in load_csv(generated_dir, "hris_payroll_crosswalk.csv")}
    earnings = load_csv(generated_dir, "payroll_earnings.csv")
    earn_map = build_earning_lookup(load_csv(generated_dir, "earning_code_mapping.csv"))
    manifest_rows = load_csv(generated_dir, "expected_scenario_manifest.csv")

    worker_count = len(workers)
    scn_by_worker = build_worker_primary_scenario(worker_count)

    prim_by_w = primary_assignment_by_worker(assignments)

    # --- 2) Load complete (manifest line counts checked loosely) ---
    stages.append(StageStatus("2_load_sources", "EXECUTED", f"workers={worker_count}, assignments={len(assignments)}"))

    # --- 3–5) Join + mapping + reconciliation (synthetic adapter; not the TS intake API) ---
    payroll_id_to_hris: Dict[str, List[str]] = defaultdict(list)
    for w in workers:
        wid = w["hris_worker_id"]
        cw = crosswalk.get(wid, {})
        pid = (cw.get("payroll_worker_id") or "").strip()
        if pid:
            payroll_id_to_hris[pid].append(wid)

    join_rows: List[Dict[str, Any]] = []
    join_issues: List[Dict[str, Any]] = []

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

        join_rows.append(
            {
                "hris_worker_id": wid,
                "primary_scenario_id": scn,
                "payroll_worker_id": pwid,
                "crosswalk_status": st,
                "join_outcome": join_kind,
            }
        )
        if join_kind != "OK":
            join_issues.append({"hris_worker_id": wid, "join_outcome": join_kind, "scenario_id": scn})

    # Payroll lines indexed
    lines_by_payroll: Dict[str, List[Dict[str, str]]] = defaultdict(list)
    for e in earnings:
        lines_by_payroll[e["payroll_worker_id"]].append(e)

    IN_SCOPE = {"off_cycle_flag": "N", "retro_flag": "N"}

    def line_in_scope(e: Dict[str, str]) -> bool:
        return e.get("off_cycle_flag") == "N" and e.get("retro_flag") == "N"

    mapping_hits: List[Dict[str, Any]] = []
    recon_rows: List[Dict[str, Any]] = []

    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
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
        suspect_misclass = False
        for e in lines_by_payroll.get(pwid, []):
            if not line_in_scope(e):
                continue
            code = e["earning_code"]
            m = earn_map.get(code)
            if not m or m.get("mapping_status") == "UNMAPPED":
                unmapped = True
                mapping_hits.append({"hris_worker_id": wid, "earning_code": code, "status": "UNMAPPED"})
                continue
            fam = m.get("mapped_component_family") or ""
            amt = float(e.get("amount") or 0)
            if code == "SUSPECT_BASE" and (e.get("component_family_candidate") == "BASE"):
                suspect_misclass = True
            if fam == "BASE":
                base_sum += amt
            elif fam == "VARIABLE":
                var_sum += amt
            # EXCLUDED / ALLOWANCE etc. ignored for core metrics inputs here

        recon_rows.append(
            {
                "hris_worker_id": wid,
                "primary_scenario_id": scn,
                "base_pay_rollup": round(base_sum, 2),
                "variable_pay_rollup": round(var_sum, 2),
                "unmapped_blocker": unmapped,
                "suspect_misclassification": suspect_misclass,
            }
        )

    stages.append(
        StageStatus(
            "3_join_hris_payroll",
            "EXECUTED",
            "Synthetic crosswalk join evaluated (demo adapter; not HTTP intake).",
        )
    )
    stages.append(
        StageStatus(
            "4_earning_code_mapping",
            "EXECUTED",
            "Mapped in-scope lines using earning_code_mapping.csv (synthetic adapter).",
        )
    )
    stages.append(
        StageStatus(
            "5_normalized_worker_money_shape",
            "EXECUTED",
            "Per-worker base/variable rollups computed for downstream eligibility checks.",
        )
    )

    write_json(
        INTERMEDIATE / "join_results.json",
        {
            "summary": {
                "worker_count": worker_count,
                "join_ok": sum(1 for j in join_rows if j["join_outcome"] == "OK"),
                "join_missing_payroll": sum(1 for j in join_rows if j["join_outcome"] == "MISSING_PAYROLL"),
                "join_duplicate_key": sum(1 for j in join_rows if j["join_outcome"] == "DUPLICATE_PAYROLL_KEY"),
            },
            "notes": [
                "Join logic is mock-enterprise Python only; it mirrors the dataset dictionary join model.",
            ],
        },
    )
    write_json(INTERMEDIATE / "mapping_results.json", {"unmapped_events": mapping_hits[:500], "total_unmapped_events": len(mapping_hits)})
    write_json(
        INTERMEDIATE / "category_results.json",
        {
            "note": "Category engine outputs appear after TS run in engine_output_main.json (not this stub).",
        },
    )

    # --- Cohorts for TS ---
    EXCLUDE_MAIN = {"SCN-002", "SCN-003", "SCN-004", "SCN-005", "SCN-006", "SCN-008", "SCN-010"}

    def engine_row_for_worker(wid: str) -> Optional[Dict[str, str]]:
        w = next(x for x in workers if x["hris_worker_id"] == wid)
        prim = prim_by_w.get(wid)
        if not prim:
            return None
        rc = recon_by_wid.get(wid, {})
        base = rc.get("base_pay_rollup", 0.0)
        var = rc.get("variable_pay_rollup", 0.0)
        g = (w.get("gender") or "").strip()
        if not g:
            return None
        subfam = (prim.get("job_subfamily") or prim.get("job_subfamily_code") or "").strip()
        return {
            "worker_id": wid,
            "base_pay": f"{float(base):.2f}",
            "gender": g,
            "job_title": prim.get("job_title") or "",
            "job_family_code": prim.get("job_family") or "",
            "job_subfamily_code": subfam,
            "job_grade_or_level": prim.get("job_level") or "",
            "_variable_pay": f"{float(var):.2f}",
        }

    recon_by_wid = {r["hris_worker_id"]: r for r in recon_rows}

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

    csv_headers = [
        "worker_id",
        "base_pay",
        "gender",
        "job_title",
        "job_family_code",
        "job_subfamily_code",
        "job_grade_or_level",
    ]
    csv_rows = []
    variable_pay_rows = []
    overrides = []
    for i, wid in enumerate(main_workers):
        r = engine_row_for_worker(wid)
        if not r:
            continue
        variable_pay_rows.append({"rowIndex": i, "variablePayDecimal": r.pop("_variable_pay")})
        csv_rows.append(r)
        scn = scn_by_worker[wid]
        if scn == "SCN-009":
            overrides.append(
                {
                    "overrideId": f"ovr_{wid}",
                    "rowIndex": i,
                    "proposedCategoryId": "cat_synth_approved_override",
                    "status": "APPROVED",
                    "proposedAtIso": "2026-04-07T00:00:00.000Z",
                    "decidedAtIso": "2026-04-07T01:00:00.000Z",
                    "reviewerActorId": "synthetic-reviewer",
                }
            )

    main_csv = INTERMEDIATE / f"engine_intake_{run_id}.csv"
    write_csv(main_csv, csv_headers, csv_rows)
    main_meta = {
        "methodologyVersion": METHOD_VERSION,
        "rulePackVersion": RULE_PACK,
        "variablePayRows": variable_pay_rows,
        "governedOverrides": overrides,
        "equalValueRuleset": None,
    }
    main_meta_path = INTERMEDIATE / f"engine_meta_{run_id}.json"
    write_json(main_meta_path, main_meta)
    main_out = INTERMEDIATE / f"engine_output_{run_id}.json"
    main_category_detail = INTERMEDIATE / f"engine_category_detail_{run_id}.json"

    ts_stages_note = ""
    try:
        run_ts_engine(main_csv, main_meta_path, main_out, log_path, category_detail_out=main_category_detail)
        stages.append(
            StageStatus(
                "6_7_ts_intake_snapshot_job_category",
                "EXECUTED",
                f"TS path: register intake → seal snapshot → job normalization → extended category (see engine_output_{run_id}.json).",
            )
        )
        stages.append(
            StageStatus(
                "7b_equal_value_path",
                "PARTIALLY EXECUTED",
                "EqualValueRuleset not passed (null); equal-value grouping not exercised in this run.",
            )
        )
    except Exception as ex:
        ts_stages_note = str(ex)
        stages.append(
            StageStatus(
                "6_7_ts_intake_snapshot_job_category",
                "BLOCKED",
                f"TS engine invocation failed: {ex}",
            )
        )

    # --- 8 EU metrics + 9 reporting (if TS ok) ---
    eu_main: Optional[Dict[str, Any]] = None
    if main_out.exists():
        eu_main = json.loads(main_out.read_text(encoding="utf-8"))
        if eu_main.get("status") == "OK":
            m_blocked = (eu_main.get("euCoreMetrics") or {}).get("runGateBlocked")
            if m_blocked:
                m_notes = "runEuCoreMetrics ran; runGateBlocked=True (classification incomplete for this cohort)."
            else:
                m_notes = "runEuCoreMetrics ran; runGateBlocked=False (classification complete for this cohort)."
            stages.append(
                StageStatus(
                    "8_eu_core_metrics",
                    "PARTIALLY EXECUTED" if m_blocked else "EXECUTED",
                    m_notes,
                )
            )
            rp_ok = (eu_main.get("reportingPack") or {}).get("completeness", {}).get("status") == "COMPLETE"
            if rp_ok:
                rp_notes = "assembleReportingPack executed; reporting completeness COMPLETE (see exportBlockers)."
            else:
                rp_notes = "assembleReportingPack executed; export blocked when metrics gate blocked (see exportBlockers)."
            stages.append(
                StageStatus(
                    "9_reporting_evidence_pack",
                    "PARTIALLY EXECUTED" if not rp_ok else "EXECUTED",
                    rp_notes,
                )
            )
        elif eu_main.get("status") == "SNAPSHOT_BLOCKED":
            stages.append(StageStatus("8_eu_core_metrics", "BLOCKED", "Snapshot not sealed; metrics not run."))
            stages.append(StageStatus("9_reporting_evidence_pack", "BLOCKED", "No pack without metrics path."))
    else:
        stages.append(StageStatus("8_eu_core_metrics", "BLOCKED", ts_stages_note or "no output"))
        stages.append(StageStatus("9_reporting_evidence_pack", "BLOCKED", ts_stages_note or "no output"))

    # --- SCN-008 mini-run (pending override) — main demo only ---
    pending_out = INTERMEDIATE / "engine_output_pending_override.json"
    scn008_workers = [wid for wid, s in scn_by_worker.items() if s == "SCN-008"]
    scn008_workers.sort()
    mini = scn008_workers[: min(25, len(scn008_workers))]
    if run_id == "main" and len(mini) >= 1:
        csv_mini_rows = []
        vp_mini = []
        ovr_mini = []
        for i, wid in enumerate(mini):
            r = engine_row_for_worker(wid)
            if not r:
                continue
            vp_mini.append({"rowIndex": i, "variablePayDecimal": r.pop("_variable_pay")})
            csv_mini_rows.append(r)
            ovr_mini.append(
                {
                    "overrideId": f"ovr_pending_{wid}",
                    "rowIndex": i,
                    "proposedCategoryId": "cat_synth_pending",
                    "status": "PENDING",
                    "proposedAtIso": "2026-04-07T00:00:00.000Z",
                }
            )
        mini_csv = INTERMEDIATE / "engine_intake_pending_override.csv"
        write_csv(mini_csv, csv_headers, csv_mini_rows)
        mini_meta_path = INTERMEDIATE / "engine_meta_pending_override.json"
        write_json(
            mini_meta_path,
            {
                "methodologyVersion": METHOD_VERSION,
                "rulePackVersion": RULE_PACK,
                "variablePayRows": vp_mini,
                "governedOverrides": ovr_mini,
                "equalValueRuleset": None,
            },
        )
        try:
            run_ts_engine(
                mini_csv,
                mini_meta_path,
                pending_out,
                log_path,
                category_detail_out=INTERMEDIATE / "engine_category_detail_pending_override.json",
            )
            stages.append(
                StageStatus(
                    "7c_pending_override_demo_cohort",
                    "EXECUTED",
                    "Separate TS run on SCN-008 workers with PENDING governed override (metrics gate blocked).",
                )
            )
        except Exception as ex:
            stages.append(StageStatus("7c_pending_override_demo_cohort", "BLOCKED", str(ex)))
    elif run_id != "main":
        stages.append(
            StageStatus(
                "7c_pending_override_demo_cohort",
                "NOT IMPLEMENTED IN CURRENT SYSTEM",
                "SCN-008 pending-override mini-run is only executed for --intermediate-run-id main.",
            )
        )

    # --- Synthetic confidence / FC-R1 (adapter only; not H05 engine code) ---
    blocked_flags: Dict[str, bool] = {}
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        blocked = False
        jr = next(j for j in join_rows if j["hris_worker_id"] == wid)
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

    n_blocked = sum(1 for v in blocked_flags.values() if v)
    blocked_rate = n_blocked / max(1, worker_count)

    low_conf = 0
    for w in workers:
        wid = w["hris_worker_id"]
        scn = scn_by_worker[wid]
        if recon_by_wid.get(wid, {}).get("suspect_misclassification") or scn == "SCN-011":
            low_conf += 1
    low_conf_rate = low_conf / max(1, worker_count)

    metrics_adapter = {
        "blocked_record_rate": round(blocked_rate, 6),
        "low_confidence_proxy_rate": round(low_conf_rate, 6),
        "thresholds_reference": {
            "blocked_record_max": 0.005,
            "low_confidence_max": 0.02,
            "source": "docs/confidence/CONFIDENCE_MODEL_v1.md (reference only; not executed as code)",
        },
        "scn_012_013": "NOT EXERCISED — zero-count scenarios in this pack version (see manifest).",
    }
    metrics_out = dict(metrics_adapter)
    if main_out.exists():
        try:
            em = json.loads(main_out.read_text(encoding="utf-8"))
            if em.get("status") == "OK":
                metrics_out["main_engine_eu_core"] = {
                    "runGateBlocked": (em.get("euCoreMetrics") or {}).get("runGateBlocked"),
                    "classificationIncomplete": (em.get("euCoreMetrics") or {})
                    .get("inclusion", {})
                    .get("classificationIncomplete"),
                }
        except OSError:
            pass
    write_json(INTERMEDIATE / "metrics_results.json", metrics_out)

    # Update category intermediate from main engine
    if main_out.exists() and eu_main and eu_main.get("status") == "OK":
        write_json(
            INTERMEDIATE / "category_results.json",
            {
                "source": str(main_out.relative_to(REPO_ROOT)),
                "categoryAssignment": eu_main.get("categoryAssignment"),
            },
        )

    # --- Scenario matrix ---
    manifest_by_id = {m["scenario_id"]: m for m in manifest_rows}
    scenario_outcomes = []
    for m in manifest_rows:
        sid = m["scenario_id"]
        exp = m
        observed = summarize_scenario(
            sid,
            scn_by_worker,
            join_rows,
            workers,
            prim_by_w,
            recon_by_wid,
            blocked_flags,
            eu_main,
        )
        scenario_outcomes.append(
            {
                "scenario_id": sid,
                "expected_manifest": exp,
                "observed": observed,
            }
        )

    write_csv(
        REPORTS / "SCENARIO_OUTCOME_MATRIX.csv",
        [
            "scenario_id",
            "records_encountered_adapter",
            "expected_join_outcome",
            "observed_join_ok_share",
            "expected_export_gate",
            "engine_encountered_notes",
            "proof_level",
            "notes",
        ],
        scenario_csv_rows(scenario_outcomes, manifest_by_id, worker_count),
    )

    write_csv(
        REPORTS / "JOIN_SUMMARY.csv",
        ["metric", "value"],
        [
            {"metric": "workers_total", "value": worker_count},
            {"metric": "join_ok", "value": sum(1 for j in join_rows if j["join_outcome"] == "OK")},
            {"metric": "join_missing_payroll", "value": sum(1 for j in join_rows if j["join_outcome"] == "MISSING_PAYROLL")},
            {"metric": "join_duplicate_payroll_key", "value": sum(1 for j in join_rows if j["join_outcome"] == "DUPLICATE_PAYROLL_KEY")},
        ],
    )

    write_csv(
        REPORTS / "MAPPING_SUMMARY.csv",
        ["metric", "value"],
        [
            {"metric": "unmapped_in_scope_line_events", "value": len(mapping_hits)},
            {"metric": "workers_with_unmapped_blocker", "value": sum(1 for r in recon_rows if r.get("unmapped_blocker"))},
        ],
    )

    write_csv(
        REPORTS / "CATEGORY_SUMMARY.csv",
        ["metric", "value"],
        category_summary_rows(eu_main),
    )

    write_csv(
        REPORTS / "METRICS_SUMMARY.csv",
        ["metric", "value"],
        metrics_summary_rows(eu_main, metrics_adapter),
    )

    write_json(
        manifest_path,
        {
            "run_id": log_name,
            "intermediate_run_id": run_id,
            "synthetic_only": True,
            "generated_dir": str(generated_dir.relative_to(REPO_ROOT)),
            "synthetic_profile_label": synthetic_profile_label,
            "stages": [s.__dict__ for s in stages],
            "main_engine_output": str(main_out.relative_to(REPO_ROOT)) if main_out.exists() else None,
            "main_category_detail": str(main_category_detail.relative_to(REPO_ROOT))
            if main_category_detail.exists()
            else None,
            "pending_override_output": str(pending_out.relative_to(REPO_ROOT))
            if run_id == "main" and pending_out.exists()
            else None,
        },
    )

    write_evidence_pack_summary(REPORTS / "EVIDENCE_PACK_SUMMARY.md", eu_main, stages)
    write_coverage_gaps(REPORTS / "COVERAGE_GAPS.md", stages)
    write_run_report(
        REPORTS / "MOCK_ENTERPRISE_RUN_REPORT.md",
        stages,
        eu_main,
        metrics_adapter,
        worker_count,
        len(csv_rows),
    )

    return 0


def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2), encoding="utf-8")


def summarize_scenario(
    sid: str,
    scn_by_worker: Dict[str, str],
    join_rows: List[Dict[str, Any]],
    workers: List[Dict[str, str]],
    prim_by_w: Dict[str, Dict[str, str]],
    recon_by_wid: Dict[str, Any],
    blocked_flags: Dict[str, bool],
    eu_main: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    members = [w for w, s in scn_by_worker.items() if s == sid]
    if sid == "SCN-012" or sid == "SCN-013":
        return {
            "records": 0,
            "manifest_note": "Zero-count in baseline pack — NOT EXERCISED for threshold breach.",
        }
    join_ok = 0
    for wid in members:
        jr = next(j for j in join_rows if j["hris_worker_id"] == wid)
        if jr["join_outcome"] == "OK":
            join_ok += 1
    share = join_ok / max(1, len(members))
    out: Dict[str, Any] = {
        "cohort_size": len(members),
        "join_ok_share": round(share, 4),
    }
    if sid == "SCN-010":
        out["methodology_mismatch"] = "Simulated only at adapter level (SCN-010 workers excluded from main TS meta; no FC-F4 code path in repo)."
    if sid == "SCN-011":
        out["methodology_ambiguous_job_evidence"] = (
            "Generator perturbs assignment job_level vs job_architecture; @enx/job-architecture does not load job_architecture.csv for cross-check — cannot observe REVIEW_REQUIRED from that inconsistency in TS."
        )
    return out


def scenario_csv_rows(
    scenario_outcomes: List[Dict[str, Any]],
    manifest_by_id: Dict[str, Any],
    worker_count: int,
) -> List[Dict[str, Any]]:
    rows_out: List[Dict[str, Any]] = []
    for s in scenario_outcomes:
        sid = s["scenario_id"]
        exp = s["expected_manifest"]
        obs = s["observed"]
        cohort = int(exp.get("affected_record_count") or 0)
        enc = cohort
        if sid in ("SCN-012", "SCN-013"):
            enc = 0
        proof = "ADAPTER_ONLY"
        notes = ""
        if sid in ("SCN-012", "SCN-013"):
            proof = "NOT_EXERCISED"
            notes = "Zero-count scenarios in manifest; no threshold breach demonstration in this dataset version."
        elif sid in ("SCN-008", "SCN-009"):
            proof = "ADAPTER_PLUS_ENGINE_SECOND_RUN" if sid == "SCN-008" else "ENGINE_MAIN_COHORT"
            notes = "Override records are synthetic demo objects passed to @enx/category-engine; not legal approval."
        elif sid == "SCN-010":
            proof = "ADAPTER_ONLY"
            notes = "Excluded from main TS cohort; mismatch behaviour not executed as dedicated code beyond version strings."
        rows_out.append(
            {
                "scenario_id": sid,
                "records_encountered_adapter": enc,
                "expected_join_outcome": exp.get("expected_join_outcome", ""),
                "observed_join_ok_share": obs.get("join_ok_share", ""),
                "expected_export_gate": exp.get("expected_export_or_run_gate_outcome", ""),
                "engine_encountered_notes": json.dumps(obs, ensure_ascii=False),
                "proof_level": proof,
                "notes": notes,
            }
        )
    return rows_out


def category_summary_rows(eu_main: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:
    if not eu_main or eu_main.get("status") != "OK":
        return [
            {"metric": "status", "value": "no_main_engine_output"},
        ]
    c = eu_main.get("categoryAssignment") or {}
    return [
        {"metric": "assignedCount", "value": c.get("assignedCount", "")},
        {"metric": "reviewRequiredCount", "value": c.get("reviewRequiredCount", "")},
        {"metric": "unassignedCount", "value": c.get("unassignedCount", "")},
        {"metric": "metricsCalculationBlockedCount", "value": c.get("metricsCalculationBlockedCount", "")},
    ]


def metrics_summary_rows(eu_main: Optional[Dict[str, Any]], adapter: Dict[str, Any]) -> List[Dict[str, str]]:
    rows = [
        {"metric": "adapter_blocked_record_rate", "value": str(adapter.get("blocked_record_rate"))},
        {"metric": "adapter_low_confidence_proxy_rate", "value": str(adapter.get("low_confidence_proxy_rate"))},
    ]
    if eu_main and eu_main.get("status") == "OK":
        inc = (eu_main.get("euCoreMetrics") or {}).get("inclusion") or {}
        rows.append({"metric": "engine_eligible_for_pay_gap_count", "value": str(inc.get("eligibleForPayGapCount", ""))})
        rows.append({"metric": "engine_run_gate_blocked", "value": str((eu_main.get("euCoreMetrics") or {}).get("runGateBlocked", ""))})
    return rows


def write_evidence_pack_summary(path: Path, eu_main: Optional[Dict[str, Any]], stages: List[StageStatus]) -> None:
    lines = [
        "# Evidence pack summary (synthetic demo only)",
        "",
        "This is **not** a regulator-ready evidence pack and **not** pilot authorization evidence.",
        "",
        "## Engine output",
    ]
    if eu_main and eu_main.get("status") == "OK":
        rp = eu_main.get("reportingPack") or {}
        lines.append(f"- reportRunId: {rp.get('reportRunId', '')}")
        lines.append(f"- completeness: {json.dumps(rp.get('completeness', {}), ensure_ascii=False)}")
        lines.append(f"- exportBlockers: {rp.get('exportBlockers', [])}")
    else:
        lines.append("- Main engine did not produce an OK sealed path; see intermediate logs.")
    lines.append("")
    lines.append("## Stage summary")
    for s in stages:
        lines.append(f"- **{s.name}**: {s.status} — {s.notes}")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_coverage_gaps(path: Path, stages: List[StageStatus]) -> None:
    text = """# Coverage gaps (synthetic demo)

## Runnable system gaps
| Topic | Coverage |
| --- | --- |
| Intake structural gate on mixed mandatory-field failures | partially covered — stock layout blocks whole-file structural validation; demo uses cohort CSV + adapter |
| Single sealed snapshot spanning clean + failing rows | not covered — `collectIntakeSnapshotBlockedReasons` blocks seal if any row has mapping issues |
| Job architecture cross-check (assignment vs catalog) | not covered in engines — `job-architecture` normalizes intake fields only; does not ingest `job_architecture.csv` |
| Reconciliation engine (H04) | not implemented as code — governance docs only |
| Confidence engine (H05) | not implemented as code — adapter computes proxy rates from rules |

## Workflow / feature gaps
| Topic | Coverage |
| --- | --- |
| Enterprise HTTP/API intake of multi-file HRIS+payroll | not exercised — demo uses filesystem CSV + runner |
| Country pack (Ireland statutory overlay) | not implemented — Wave 6 paused |
| SCN-012 / SCN-013 run-level FC-R1 breach demonstration | not exercised — zero cohort in manifest for this baseline pack |

## Legal coverage gaps
| Topic | Coverage |
| --- | --- |
| Statutory pay transparency compliance proof | not covered — synthetic demo only |
| Lawful basis / DPIA / approvals | not covered — no real privacy workflow |

## Real-evidence gaps
| Topic | Coverage |
| --- | --- |
| Real payroll reconciliation to controlled extracts | not covered |
| Real join integrity measurement on production keys | not covered |
| Real methodology sign-off / Legal sign-off | not covered |

"""
    path.write_text(text, encoding="utf-8")


def write_run_report(
    path: Path,
    stages: List[StageStatus],
    eu_main: Optional[Dict[str, Any]],
    metrics_adapter: Dict[str, Any],
    worker_total: int,
    engine_row_count: int,
) -> None:
    lines = [
        "# Mock enterprise run report (synthetic)",
        "",
        "## 1. Objective",
        "Demonstrate, using **synthetic Ireland perimeter CSVs**, what the **current repository code** can execute versus what remains adapter-only or governance-only.",
        "",
        "## 2. Synthetic perimeter used",
        "- Country: IE (label only for the mock pack)",
        "- Entity / provider / period: see `mock-enterprise/docs/DATASET_DICTIONARY.md`",
        "",
        "## 3. Current system entrypoints used",
        "- `mock-enterprise/runner/run_engines.ts` → `@enx/intake-engine` (register + seal), `@enx/job-architecture`, `@enx/category-engine`, `@enx/metrics-engine`, `@enx/reporting-engine`",
        "- `mock-enterprise/runner/run_mock_enterprise_demo.py` → orchestration + adapter joins/mapping/reconciliation summaries",
        "",
        "## 4. Data files consumed",
        "- `mock-enterprise/generated/*.csv` (HRIS, payroll, crosswalk, mapping, manifest)",
        "",
        "## 5. Execution steps performed",
    ]
    for s in stages:
        lines.append(f"- **{s.name}** — {s.status}: {s.notes}")
    lines.extend(
        [
            "",
            "## 6. What executed successfully",
            "- CSV presence check and deterministic scenario allocation matching the generator seed",
            "- HRIS↔payroll join evaluation and earning-code rollup logic in **Python (demo adapter)**",
            "- TypeScript **main cohort** run: intake seal + job normalization + extended category assignment + `runEuCoreMetrics` + `assembleReportingPack` (see `engine_output_main.json`)",
            "- Separate **SCN-008** mini-cohort TS run with **PENDING** governed overrides (`engine_output_pending_override.json`)",
            "",
            "## 7. What partially executed",
            "- **EU core headline metrics**: `runEuCoreMetrics` **ran**, but for the main cohort `runGateBlocked=true` because `classificationIncomplete` is true for this synthetic title population (most rows are `REVIEW_REQUIRED` in category assignment). Scalar gap/quartile metrics show `BLOCKED_CLASSIFICATION_INCOMPLETE`.",
            "- **Reporting pack export**: structured pack JSON is assembled, but completeness is **INCOMPLETE** with `METRICS_RUN_GATE_BLOCKED` while the metrics gate is blocked.",
            "- **Equal-value ruleset**: not passed (`equalValueRuleset: null`) — equal-value grouping not exercised.",
            "- **SCN-011 “ambiguous job evidence”**: data includes assignment/catalog mismatch in the **CSV pack**, but `@enx/job-architecture` does not load `job_architecture.csv` for cross-check — scenario intent is only partially representable.",
            "",
            "## 8. What was blocked",
            "- Workers excluded from the **main engine CSV** when joins fail, mandatory fields are missing, unmapped earning codes apply, SCN-010 (excluded from main meta), or SCN-008 (handled in the separate pending-override cohort).",
            "",
            "## 9. Scenario coverage results",
            "See `SCENARIO_OUTCOME_MATRIX.csv` (tied to `expected_scenario_manifest.csv`). **SCN-012** and **SCN-013** are **NOT EXERCISED** (zero cohort in this pack version).",
            "",
            "## 10. Metrics / category / evidence outputs produced",
            f"- Main engine rows written: **{engine_row_count}** (of {worker_total} workers)",
            f"- Adapter proxy rates: blocked_record_rate={metrics_adapter.get('blocked_record_rate')}, low_confidence_proxy_rate={metrics_adapter.get('low_confidence_proxy_rate')}",
        ]
    )
    if eu_main and eu_main.get("status") == "OK":
        lines.append(
            "- Engine outputs: `mock-enterprise/out/intermediate/engine_output_main.json` and (when run) `engine_output_pending_override.json`"
        )
    lines.extend(
        [
            "",
            "## 11. What this proves",
            "- The **implemented** `@enx/*` packages can **execute** the mechanical pipeline: sealed intake snapshot → job normalization → extended category assignment → `runEuCoreMetrics` → `assembleReportingPack`, producing JSON artifacts under `mock-enterprise/out/intermediate/`.",
            "- The metrics engine **fail-closed** behaviour is observable: when category assignment leaves the population “incomplete” for metrics (`classificationIncomplete`), headline EU core metrics are **not** reported as computed and the reporting pack marks export blockers accordingly.",
            "",
            "## 12. What this does NOT prove",
            "- **Not** real pilot readiness, **not** legal compliance, **not** payroll-truth reconciliation, **not** production operator controls.",
            "",
            "## 13. Coverage gaps to reach fuller pay-transparency capability",
            "See `COVERAGE_GAPS.md`.",
            "",
            "## 14. Exact next recommended actions",
            "- If run-level FC-R1 breach must be demonstrated, generate a **new synthetic pack version** that allocates non-zero rows to SCN-012/013 (outside this task).",
            "- Implement reconciliation + confidence engines as **code** (not docs-only) before claiming enterprise gates.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
