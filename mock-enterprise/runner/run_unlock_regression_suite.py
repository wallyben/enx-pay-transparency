#!/usr/bin/env python3
"""
Slice 10 — Synthetic unlock regression suite (mock-enterprise only).

Runs JDMS descriptor completeness + mock enterprise demo engines for baseline vs pilot-shaped
profiles, compares actuals to explicit expectations, emits PASS / FAIL / PARTIAL.

NOT real pilot evidence. NOT legal/regulatory reliance.
"""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_RUNNER_DIR = Path(__file__).resolve().parent
if str(_RUNNER_DIR) not in sys.path:
    sys.path.insert(0, str(_RUNNER_DIR))

import run_descriptor_completeness_validator as dcv

REPO_ROOT = Path(__file__).resolve().parents[2]
MOCK_ENT_ROOT = REPO_ROOT / "mock-enterprise"
OUT_INTERMEDIATE = MOCK_ENT_ROOT / "out" / "intermediate"
OUT_REPORTS = MOCK_ENT_ROOT / "out" / "reports"

SUITE_ID = "UNLOCK_REGRESSION_V1"

# Explicit, documented regression contract (deterministic thresholds).
EXPECTED_CONDITIONS: Dict[str, Dict[str, Any]] = {
    "baseline_adversarial": {
        "descriptor_overall_pass": False,
        "job_subfamily_missing_count_min": 1,
        "blocker_count_min": 1,
        "assigned_rate_max_exclusive": 0.5,
        "metrics_run_gate_blocked": True,
        # Engine: reporting incomplete OR export still blocked (non-bypassable gate).
        "reporting_incomplete_or_export_blocked": True,
    },
    "pilot_shaped_clean": {
        "descriptor_overall_pass": True,
        "job_subfamily_missing_count_max": 0,
        "blocker_count_max": 0,
        "assigned_count_equals_row_count": True,
        "review_required_count_max": 0,
        "metrics_run_gate_blocked": False,
        "reporting_pack_complete": True,
        "export_blockers_required_empty": True,
    },
}


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str


@dataclass
class ProfileRegressionRow:
    dataset_profile: str
    descriptor_overall_pass: bool
    subfamily_missing_count: int
    blocker_count: int
    assigned_count: int
    assigned_rate: float
    review_required_count: int
    metrics_gate_blocked: bool
    reporting_export_blocked: bool
    regression_expectation_met: bool
    notes: str
    checks: List[CheckResult] = field(default_factory=list)
    demo_exit_code: Optional[int] = None
    demo_error: str = ""


def load_engine_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Engine output missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def extract_engine_stats(data: Dict[str, Any]) -> Dict[str, Any]:
    snap = data.get("snapshot") or {}
    row_count = int(snap.get("rowCount") or 0)
    cat = data.get("categoryAssignment") or {}
    assigned = int(cat.get("assignedCount") or 0)
    review_req = int(cat.get("reviewRequiredCount") or 0)
    eu = data.get("euCoreMetrics") or {}
    gate_blocked = bool(eu.get("runGateBlocked"))
    rp = data.get("reportingPack") or {}
    completeness = (rp.get("completeness") or {}).get("status") or ""
    export_blockers = rp.get("exportBlockers") or []
    reporting_complete = completeness == "COMPLETE"
    export_blocked = bool(export_blockers) or completeness != "COMPLETE"
    rate = (assigned / row_count) if row_count else 0.0
    return {
        "row_count": row_count,
        "assigned_count": assigned,
        "review_required_count": review_req,
        "assigned_rate": rate,
        "metrics_gate_blocked": gate_blocked,
        "reporting_pack_complete": reporting_complete,
        "export_blockers": export_blockers,
        "reporting_export_blocked": export_blocked,
    }


def run_mock_demo(generated_subdir: str, intermediate_run_id: str) -> Tuple[int, str]:
    cmd = [sys.executable, str(_RUNNER_DIR / "run_mock_enterprise_demo.py"), "--intermediate-run-id", intermediate_run_id]
    if generated_subdir.strip():
        cmd.extend(["--generated-subdir", generated_subdir.strip()])
    try:
        p = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=600,
        )
        err = (p.stderr or "") + (p.stdout or "")
        return p.returncode, err[-4000:] if err else ""
    except Exception as ex:
        return 1, str(ex)


def evaluate_baseline(
    prof: Dict[str, Any],
    eng: Dict[str, Any],
    exp: Dict[str, Any],
    demo_ok: bool,
) -> Tuple[List[CheckResult], bool]:
    checks: List[CheckResult] = []
    sub_summary = next(
        (x for x in prof.get("required_field_summaries", []) if x.get("canonical_field_name") == "job_subfamily_code"),
        {},
    )
    sub_missing = int(sub_summary.get("missing_count") or 0)
    desc_pass = bool(prof.get("overall_pass"))
    blockers = int(prof.get("blocker_count") or 0)

    checks.append(
        CheckResult(
            "descriptor_overall_pass_is_false",
            desc_pass == exp["descriptor_overall_pass"],
            f"overall_pass={desc_pass} expected {exp['descriptor_overall_pass']}",
        )
    )
    checks.append(
        CheckResult(
            "job_subfamily_missing_positive",
            sub_missing >= exp["job_subfamily_missing_count_min"],
            f"missing_count={sub_missing} expected >={exp['job_subfamily_missing_count_min']}",
        )
    )
    checks.append(
        CheckResult(
            "descriptor_blocker_count_positive",
            blockers >= exp["blocker_count_min"],
            f"blocker_count={blockers} expected >={exp['blocker_count_min']}",
        )
    )

    st = extract_engine_stats(eng)
    mx = exp["assigned_rate_max_exclusive"]
    yield_low = st["assigned_rate"] < mx
    checks.append(
        CheckResult(
            "category_yield_low_not_enterprise_usable",
            yield_low,
            f"assigned_rate={st['assigned_rate']:.6f} expected < {mx}",
        )
    )
    checks.append(
        CheckResult(
            "metrics_gate_blocked",
            st["metrics_gate_blocked"] == exp["metrics_run_gate_blocked"],
            f"runGateBlocked={st['metrics_gate_blocked']} expected {exp['metrics_run_gate_blocked']}",
        )
    )
    reporting_still_gated = (not st["reporting_pack_complete"]) or bool(st["export_blockers"])
    checks.append(
        CheckResult(
            "reporting_incomplete_or_export_blocked",
            reporting_still_gated == exp["reporting_incomplete_or_export_blocked"],
            f"complete={st['reporting_pack_complete']} export_blockers={st['export_blockers']}",
        )
    )
    checks.append(
        CheckResult(
            "demo_run_succeeded",
            demo_ok,
            "run_mock_enterprise_demo.py must exit 0 for this profile",
        )
    )

    ok = all(c.passed for c in checks)
    return checks, ok


def evaluate_pilot(
    prof: Dict[str, Any],
    eng: Dict[str, Any],
    exp: Dict[str, Any],
    demo_ok: bool,
) -> Tuple[List[CheckResult], bool]:
    checks: List[CheckResult] = []
    sub_summary = next(
        (x for x in prof.get("required_field_summaries", []) if x.get("canonical_field_name") == "job_subfamily_code"),
        {},
    )
    sub_missing = int(sub_summary.get("missing_count") or 0)
    desc_pass = bool(prof.get("overall_pass"))
    blockers = int(prof.get("blocker_count") or 0)
    st = extract_engine_stats(eng)

    checks.append(
        CheckResult(
            "descriptor_overall_pass_is_true",
            desc_pass == exp["descriptor_overall_pass"],
            f"overall_pass={desc_pass} expected {exp['descriptor_overall_pass']}",
        )
    )
    checks.append(
        CheckResult(
            "job_subfamily_missing_zero",
            sub_missing <= exp["job_subfamily_missing_count_max"],
            f"missing_count={sub_missing} expected <={exp['job_subfamily_missing_count_max']}",
        )
    )
    checks.append(
        CheckResult(
            "descriptor_blocker_count_zero",
            blockers <= exp["blocker_count_max"],
            f"blocker_count={blockers} expected <={exp['blocker_count_max']}",
        )
    )
    full_assign = st["row_count"] > 0 and st["assigned_count"] == st["row_count"]
    checks.append(
        CheckResult(
            "full_assignment_cohort",
            full_assign,
            f"assigned={st['assigned_count']} row_count={st['row_count']}",
        )
    )
    checks.append(
        CheckResult(
            "review_required_zero",
            st["review_required_count"] <= exp["review_required_count_max"],
            f"review_required={st['review_required_count']}",
        )
    )
    checks.append(
        CheckResult(
            "metrics_gate_not_blocked",
            st["metrics_gate_blocked"] == exp["metrics_run_gate_blocked"],
            f"runGateBlocked={st['metrics_gate_blocked']} expected {exp['metrics_run_gate_blocked']}",
        )
    )
    checks.append(
        CheckResult(
            "reporting_complete",
            st["reporting_pack_complete"] == exp["reporting_pack_complete"],
            f"reporting complete={st['reporting_pack_complete']}",
        )
    )
    checks.append(
        CheckResult(
            "export_not_blocked",
            (not st["export_blockers"]) == exp["export_blockers_required_empty"],
            f"export_blockers={st['export_blockers']}",
        )
    )
    checks.append(
        CheckResult(
            "demo_run_succeeded",
            demo_ok,
            "run_mock_enterprise_demo.py must exit 0 for this profile",
        )
    )

    ok = all(c.passed for c in checks)
    return checks, ok


def build_actual_conditions(profile_label: str, prof: Dict[str, Any], eng: Dict[str, Any]) -> Dict[str, Any]:
    sub_summary = next(
        (x for x in prof.get("required_field_summaries", []) if x.get("canonical_field_name") == "job_subfamily_code"),
        {},
    )
    st = extract_engine_stats(eng)
    return {
        "dataset_profile": profile_label,
        "descriptor_overall_pass": bool(prof.get("overall_pass")),
        "job_subfamily_missing_count": int(sub_summary.get("missing_count") or 0),
        "blocker_count": int(prof.get("blocker_count") or 0),
        "assigned_count": st["assigned_count"],
        "row_count": st["row_count"],
        "assigned_rate": round(st["assigned_rate"], 6),
        "review_required_count": st["review_required_count"],
        "metrics_run_gate_blocked": st["metrics_gate_blocked"],
        "reporting_pack_complete": st["reporting_pack_complete"],
        "export_blockers": st["export_blockers"],
        "reporting_export_blocked": st["reporting_export_blocked"],
    }


def overall_suite_result(baseline_ok: bool, pilot_ok: bool) -> str:
    if baseline_ok and pilot_ok:
        return "PASS"
    if baseline_ok or pilot_ok:
        return "PARTIAL"
    return "FAIL"


def write_summary_csv(path: Path, rows: List[ProfileRegressionRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "dataset_profile",
        "descriptor_overall_pass",
        "subfamily_missing_count",
        "blocker_count",
        "assigned_count",
        "assigned_rate",
        "review_required_count",
        "metrics_gate_blocked",
        "reporting_export_blocked",
        "regression_expectation_met",
        "notes",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        for r in rows:
            w.writerow(
                {
                    "dataset_profile": r.dataset_profile,
                    "descriptor_overall_pass": str(r.descriptor_overall_pass),
                    "subfamily_missing_count": str(r.subfamily_missing_count),
                    "blocker_count": str(r.blocker_count),
                    "assigned_count": str(r.assigned_count),
                    "assigned_rate": f"{r.assigned_rate:.6f}",
                    "review_required_count": str(r.review_required_count),
                    "metrics_gate_blocked": str(r.metrics_gate_blocked),
                    "reporting_export_blocked": str(r.reporting_export_blocked),
                    "regression_expectation_met": str(r.regression_expectation_met),
                    "notes": r.notes,
                }
            )


def write_markdown_report(
    path: Path,
    rows: List[ProfileRegressionRow],
    overall: str,
    run_ts: str,
    jdms_version: str,
    demo_skip: bool,
) -> None:
    lines: List[str] = [
        "# Unlock regression report (Slice 10; synthetic only)",
        "",
        "**SYNTHETIC / MOCK-ENTERPRISE ONLY — NOT REAL PILOT EVIDENCE — NOT FOR LEGAL OR REGULATORY RELIANCE**",
        "",
        "## 1. Objective",
        "",
        "Lock **non-negotiable** expectations for the classification-unlock insight: the **baseline/adversarial** synthetic pack must remain a **fail-fast blocked** path under JDMS and engines, and **pilot_shaped_clean** must remain an **unblocked success** path when descriptor completeness is satisfied.",
        "",
        "## 2. Profiles tested",
        "",
        "- **`baseline_adversarial`** — `mock-enterprise/generated/` + `run_mock_enterprise_demo.py` with `--intermediate-run-id main` → `engine_output_main.json`",
        "- **`pilot_shaped_clean`** — `mock-enterprise/generated/pilot_shaped_clean/` + `--generated-subdir pilot_shaped_clean` + `--intermediate-run-id unlock` → `engine_output_unlock.json`",
        "",
        f"*Demo runs: {'skipped (--skip-demo-runs); engine JSON read as-is' if demo_skip else 'executed before reading engine outputs.'}*",
        "",
        "## 3. Expected regression conditions",
        "",
        "### baseline_adversarial",
        "",
        "| Condition | Expected |",
        "| --- | --- |",
        "| Descriptor `overall_pass` | `false` |",
        "| `job_subfamily_code` missing (cohort) | ≥ 1 |",
        "| Descriptor `blocker_count` | ≥ 1 |",
        "| Assigned rate (category engine) | < 0.5 (not enterprise-usable) |",
        "| `euCoreMetrics.runGateBlocked` | `true` |",
        "| Reporting / export | Incomplete **or** non-empty `exportBlockers` |",
        "",
        "### pilot_shaped_clean",
        "",
        "| Condition | Expected |",
        "| --- | --- |",
        "| Descriptor `overall_pass` | `true` |",
        "| `job_subfamily_code` missing | 0 |",
        "| Descriptor `blocker_count` | 0 |",
        "| Assignment | `assignedCount == rowCount`, `reviewRequiredCount == 0` |",
        "| `euCoreMetrics.runGateBlocked` | `false` |",
        "| Reporting pack | `COMPLETE`, empty `exportBlockers` |",
        "",
        "## 4. Actual results by profile",
        "",
        "| Profile | Descriptor pass | Subfamily missing | Blockers | Assigned | Rate | Review req. | Metrics blocked | Export blocked | Met expectations |",
        "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ]
    for r in rows:
        lines.append(
            f"| `{r.dataset_profile}` | {r.descriptor_overall_pass} | {r.subfamily_missing_count} | {r.blocker_count} | "
            f"{r.assigned_count} | {r.assigned_rate:.4f} | {r.review_required_count} | {r.metrics_gate_blocked} | "
            f"{r.reporting_export_blocked} | **{r.regression_expectation_met}** |"
        )
    lines.extend(
        [
            "",
            "## 5. Baseline blocked-path verification",
            "",
        ]
    )
    bl = next((x for x in rows if x.dataset_profile == "baseline_adversarial"), None)
    if bl:
        for c in bl.checks:
            mark = "PASS" if c.passed else "FAIL"
            lines.append(f"- **{mark}** `{c.name}` — {c.detail}")
        if bl.demo_error and not bl.regression_expectation_met:
            lines.append("")
            lines.append("```")
            lines.append(bl.demo_error[:2000])
            lines.append("```")
    lines.extend(["", "## 6. Pilot-shaped success-path verification", ""])
    pl = next((x for x in rows if x.dataset_profile == "pilot_shaped_clean"), None)
    if pl:
        for c in pl.checks:
            mark = "PASS" if c.passed else "FAIL"
            lines.append(f"- **{mark}** `{c.name}` — {c.detail}")
        if pl.demo_error and not pl.regression_expectation_met:
            lines.append("")
            lines.append("```")
            lines.append(pl.demo_error[:2000])
            lines.append("```")

    lines.extend(
        [
            "",
            "## 7. Regressions found",
            "",
        ]
    )
    failed = [(r.dataset_profile, c) for r in rows for c in r.checks if not c.passed]
    if not failed:
        lines.append("*No failing checks.*")
    else:
        for prof, c in failed:
            lines.append(f"- **`{prof}`** / `{c.name}` — {c.detail}")
    lines.extend(
        [
            "",
            "## 8. Overall suite result",
            "",
            f"**{overall}**",
            "",
            "- **PASS** — baseline and pilot expectations all satisfied.",
            "- **PARTIAL** — one profile satisfied, the other did not (or demo could not run for one side).",
            "- **FAIL** — neither profile satisfied the contract.",
            "",
            "## 9. What this proves",
            "",
            "- The repo can **reproduce** both the **blocked baseline** and **unblocked unlock** synthetic outcomes under JDMS + the mock adapter + TS engines.",
            "- Future generator, adapter, or runner edits that break descriptor completeness or collapse category yield should be **caught** by this suite.",
            "",
            "## 10. What this does not prove",
            "",
            "- **Not** real pilot readiness, **not** legal defensibility of categories, **not** production HRIS truth.",
            "- **Not** that enterprise data will match these CSV shapes — only that **this synthetic harness** preserves the documented unlock contrast.",
            "",
            "## 11. Exact next recommended actions",
            "",
            "1. Run this suite in CI after changes under `mock-enterprise/` or demo-related runners.",
            "2. Remediation slice: operational projection of catalog subfamily into intake (or HRIS population), then optional pre-flight hook from `run_mock_enterprise_demo.py` to the descriptor validator.",
            "3. Keep thresholds in `EXPECTED_CONDITIONS` versioned with `SUITE_ID` when intentional contract changes are made.",
            "",
            "---",
            "",
            f"*JDMS contract version: {jdms_version} — Run timestamp (UTC): {run_ts}*",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Slice 10 — unlock regression suite (mock-enterprise synthetic).")
    p.add_argument(
        "--skip-demo-runs",
        action="store_true",
        help="Do not invoke run_mock_enterprise_demo.py; read existing engine_output_main.json / engine_output_unlock.json.",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    run_ts = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    jdms = dcv.load_jdms_contract(dcv.CONTRACT_PATH)
    jdms_version = str(jdms.get("version") or "")

    baseline_dir = dcv.GENERATED_BASE
    pilot_dir = dcv.GENERATED_BASE / "pilot_shaped_clean"
    if not baseline_dir.exists():
        print(f"Missing {baseline_dir}", file=sys.stderr)
        return 2
    if not pilot_dir.exists():
        print(f"Missing {pilot_dir} — generate with generate_mock_enterprise_pack.py --synthetic-profile pilot_shaped_clean", file=sys.stderr)
        return 2

    demo_meta: Dict[str, Any] = {"baseline_adversarial": {}, "pilot_shaped_clean": {}}

    if not args.skip_demo_runs:
        code_b, err_b = run_mock_demo("", "main")
        demo_meta["baseline_adversarial"] = {"exit_code": code_b, "stderr_tail": err_b[-1500:] if err_b else ""}
        code_p, err_p = run_mock_demo("pilot_shaped_clean", "unlock")
        demo_meta["pilot_shaped_clean"] = {"exit_code": code_p, "stderr_tail": err_p[-1500:] if err_p else ""}
    else:
        demo_meta["baseline_adversarial"] = {"skipped": True}
        demo_meta["pilot_shaped_clean"] = {"skipped": True}

    prof_b = dcv.run_profile(baseline_dir, "baseline_adversarial", jdms)
    prof_b.pop("_row_records", None)
    prof_p = dcv.run_profile(pilot_dir, "pilot_shaped_clean", jdms)
    prof_p.pop("_row_records", None)

    path_main = OUT_INTERMEDIATE / "engine_output_main.json"
    path_unlock = OUT_INTERMEDIATE / "engine_output_unlock.json"

    try:
        eng_b = load_engine_json(path_main)
        eng_p = load_engine_json(path_unlock)
    except FileNotFoundError as ex:
        print(str(ex), file=sys.stderr)
        return 2

    demo_ok_b = args.skip_demo_runs or demo_meta["baseline_adversarial"].get("exit_code") == 0
    demo_ok_p = args.skip_demo_runs or demo_meta["pilot_shaped_clean"].get("exit_code") == 0

    checks_b, ok_b = evaluate_baseline(prof_b, eng_b, EXPECTED_CONDITIONS["baseline_adversarial"], demo_ok_b)
    checks_p, ok_p = evaluate_pilot(prof_p, eng_p, EXPECTED_CONDITIONS["pilot_shaped_clean"], demo_ok_p)

    st_b = extract_engine_stats(eng_b)
    st_p = extract_engine_stats(eng_p)
    sub_b = next(
        (x for x in prof_b.get("required_field_summaries", []) if x.get("canonical_field_name") == "job_subfamily_code"),
        {},
    )
    sub_p = next(
        (x for x in prof_p.get("required_field_summaries", []) if x.get("canonical_field_name") == "job_subfamily_code"),
        {},
    )

    row_b = ProfileRegressionRow(
        dataset_profile="baseline_adversarial",
        descriptor_overall_pass=bool(prof_b.get("overall_pass")),
        subfamily_missing_count=int(sub_b.get("missing_count") or 0),
        blocker_count=int(prof_b.get("blocker_count") or 0),
        assigned_count=st_b["assigned_count"],
        assigned_rate=st_b["assigned_rate"],
        review_required_count=st_b["review_required_count"],
        metrics_gate_blocked=st_b["metrics_gate_blocked"],
        reporting_export_blocked=st_b["reporting_export_blocked"],
        regression_expectation_met=ok_b,
        notes="Synthetic baseline; JDMS gate must fail; engines must stay metrics/reporting blocked."
        if ok_b
        else "Baseline path regression — see checks.",
        checks=checks_b,
        demo_exit_code=demo_meta["baseline_adversarial"].get("exit_code"),
        demo_error=demo_meta["baseline_adversarial"].get("stderr_tail", ""),
    )
    row_p = ProfileRegressionRow(
        dataset_profile="pilot_shaped_clean",
        descriptor_overall_pass=bool(prof_p.get("overall_pass")),
        subfamily_missing_count=int(sub_p.get("missing_count") or 0),
        blocker_count=int(prof_p.get("blocker_count") or 0),
        assigned_count=st_p["assigned_count"],
        assigned_rate=st_p["assigned_rate"],
        review_required_count=st_p["review_required_count"],
        metrics_gate_blocked=st_p["metrics_gate_blocked"],
        reporting_export_blocked=st_p["reporting_export_blocked"],
        regression_expectation_met=ok_p,
        notes="Pilot-shaped unlock; JDMS gate must pass; full assign + metrics + reporting clear."
        if ok_p
        else "Unlock path regression — see checks.",
        checks=checks_p,
        demo_exit_code=demo_meta["pilot_shaped_clean"].get("exit_code"),
        demo_error=demo_meta["pilot_shaped_clean"].get("stderr_tail", ""),
    )

    rows = [row_b, row_p]
    overall = overall_suite_result(ok_b, ok_p)

    actual_conditions = {
        "baseline_adversarial": build_actual_conditions("baseline_adversarial", prof_b, eng_b),
        "pilot_shaped_clean": build_actual_conditions("pilot_shaped_clean", prof_p, eng_p),
    }

    artifact: Dict[str, Any] = {
        "suite_id": SUITE_ID,
        "jdms_version": jdms_version,
        "jdms_contract_path": dcv.CONTRACT_PATH.relative_to(REPO_ROOT).as_posix(),
        "profiles_tested": ["baseline_adversarial", "pilot_shaped_clean"],
        "expected_conditions": EXPECTED_CONDITIONS,
        "actual_conditions": actual_conditions,
        "per_profile_results": [
            {
                "dataset_profile": r.dataset_profile,
                "regression_expectation_met": r.regression_expectation_met,
                "demo_exit_code": r.demo_exit_code,
                "checks": [{"name": c.name, "passed": c.passed, "detail": c.detail} for c in r.checks],
            }
            for r in rows
        ],
        "overall_result": overall,
        "run_timestamp": run_ts,
        "demo_execution": demo_meta,
        "notes": [
            "Synthetic-only regression; not pilot evidence.",
            "Descriptor evaluation uses the same cohort rules as run_mock_enterprise_demo.py (see run_descriptor_completeness_validator.py).",
            "Engine expectations read from engine_output_main.json and engine_output_unlock.json paths under mock-enterprise/out/intermediate/.",
        ],
    }

    OUT_INTERMEDIATE.mkdir(parents=True, exist_ok=True)
    OUT_REPORTS.mkdir(parents=True, exist_ok=True)
    json_path = OUT_INTERMEDIATE / "unlock_regression_results.json"
    json_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    write_summary_csv(OUT_REPORTS / "UNLOCK_REGRESSION_SUMMARY.csv", rows)
    write_markdown_report(
        OUT_REPORTS / "UNLOCK_REGRESSION_REPORT.md",
        rows,
        overall,
        run_ts,
        jdms_version,
        args.skip_demo_runs,
    )

    print(f"Overall suite result: {overall}")
    print(f"Wrote {json_path.relative_to(REPO_ROOT)}")
    print(f"Wrote {(OUT_REPORTS / 'UNLOCK_REGRESSION_SUMMARY.csv').relative_to(REPO_ROOT)}")
    print(f"Wrote {(OUT_REPORTS / 'UNLOCK_REGRESSION_REPORT.md').relative_to(REPO_ROOT)}")

    return 0 if overall == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
