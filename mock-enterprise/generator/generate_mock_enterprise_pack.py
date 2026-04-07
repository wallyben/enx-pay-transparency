"""
SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE
NOT FOR LEGAL OR REGULATORY RELIANCE

Deterministic generator for a synthetic Ireland-based enterprise perimeter dataset pack.

No real personal data. No external APIs. Writes reproducible CSV outputs.
"""

from __future__ import annotations

import csv
import dataclasses
import datetime as dt
import math
import os
import random
import sys
from collections import Counter, defaultdict
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


# =========================
# Deterministic seed (binding for this pack)
# =========================
SEED = 20260407


# =========================
# Perimeter constants (synthetic / mock only)
# =========================
COUNTRY_CODE = "IE"
LEGAL_ENTITY_ID = "LE-IE-SYNTH-001"
PAYROLL_PROVIDER_ID = "PAYPROV-IE-SYNTH-001"
PAYROLL_PROVIDER_SOURCE = "SYNTH_PAYROLL"
PAYROLL_PROVIDER_INSTANCE = "IE-INSTANCE-A"
DEFAULT_CURRENCY_CODE = "EUR"

PAY_PERIOD_START = dt.date(2026, 2, 1)
PAY_PERIOD_END = dt.date(2026, 2, 28)

METHODOLOGY_VERSION_REFERENCE = "methodology_v1@v1.0.0"
MAPPING_VERSION = "earning_mapping_v1.0.0"
CROSSWALK_VERSION = "xwalk_v1.0.0"


OUTPUT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
GENERATED_DIR = os.path.join(OUTPUT_ROOT, "generated")


def iso(d: Optional[dt.date]) -> str:
    return "" if d is None else d.isoformat()


def ensure_dir(p: str) -> None:
    os.makedirs(p, exist_ok=True)


def write_csv(path: str, fieldnames: Sequence[str], rows: Iterable[Dict[str, object]]) -> int:
    ensure_dir(os.path.dirname(path))
    count = 0
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: ("" if v is None else v) for k, v in r.items()})
            count += 1
    return count


def weighted_choice(rng: random.Random, items: Sequence[Tuple[str, float]]) -> str:
    total = sum(w for _, w in items)
    x = rng.random() * total
    acc = 0.0
    for value, w in items:
        acc += w
        if x <= acc:
            return value
    return items[-1][0]


def random_date(rng: random.Random, start: dt.date, end: dt.date) -> dt.date:
    delta = (end - start).days
    return start + dt.timedelta(days=rng.randint(0, max(delta, 0)))


def clamp(x: float, lo: float, hi: float) -> float:
    return lo if x < lo else hi if x > hi else x


def round2(x: float) -> float:
    return float(f"{x:.2f}")


def normal(rng: random.Random, mean: float, std: float) -> float:
    # Box-Muller, deterministic given rng
    u1 = max(rng.random(), 1e-12)
    u2 = rng.random()
    z = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
    return mean + std * z


def lognormal(rng: random.Random, mean: float, sigma: float) -> float:
    return math.exp(normal(rng, mean, sigma))


@dataclasses.dataclass(frozen=True)
class Scenario:
    scenario_id: str
    scenario_name: str
    scenario_type: str  # CLEAN | EDGE | FAILURE
    expected_join_outcome: str
    expected_reconciliation_outcome: str
    expected_confidence_outcome: str
    expected_category_or_methodology_outcome: str
    expected_export_or_run_gate_outcome: str
    related_exception_codes: str


SCENARIOS: List[Scenario] = [
    # 1. Clean happy-path workers
    Scenario(
        "SCN-001",
        "Clean happy-path workers",
        "CLEAN",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 2. Missing payroll join
    Scenario(
        "SCN-002",
        "Missing payroll join",
        "FAILURE",
        "BLOCKER",
        "BLOCKER_EXCEPTION",
        "FAIL_CLOSED(JOIN_MISSING)",
        "BLOCKED",
        "BLOCK_EXPORT",
        "JOIN_MISSING_PAYROLL",
    ),
    # 3. Duplicate join key
    Scenario(
        "SCN-003",
        "Duplicate join key",
        "FAILURE",
        "BLOCKER",
        "BLOCKER_EXCEPTION",
        "FAIL_CLOSED(JOIN_AMBIGUOUS)",
        "BLOCKED",
        "BLOCK_EXPORT",
        "JOIN_DUPLICATE_KEY",
    ),
    # 4. Missing mandatory gender
    Scenario(
        "SCN-004",
        "Missing mandatory gender",
        "FAILURE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "FAIL_CLOSED(FIELD_MISSING:gendar)",
        "PASS",
        "BLOCK_EXPORT",
        "",
    ),
    # 5. Missing FTE
    Scenario(
        "SCN-005",
        "Missing FTE fraction",
        "FAILURE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "FAIL_CLOSED(FIELD_MISSING:fte_fraction)",
        "PASS",
        "BLOCK_EXPORT",
        "",
    ),
    # 6. Unmapped earning code
    Scenario(
        "SCN-006",
        "Unmapped earning code",
        "FAILURE",
        "PASS",
        "BLOCKER_EXCEPTION",
        "FAIL_CLOSED(RECON_BLOCKER:EARNING_CODE_UNMAPPED)",
        "PASS",
        "BLOCK_EXPORT",
        "EARNING_CODE_UNMAPPED",
    ),
    # 7. Suspected earning-code misclassification
    Scenario(
        "SCN-007",
        "Suspected earning-code misclassification",
        "EDGE",
        "PASS",
        "WARNING_EXCEPTION",
        "LOW(RECON_WARNING:EARNING_CODE_MISCLASSIFIED_SUSPECTED)",
        "REVIEW_REQUIRED",
        "BLOCK_EXPORT",
        "EARNING_CODE_MISCLASSIFIED_SUSPECTED",
    ),
    # 8. Pending override scenario
    Scenario(
        "SCN-008",
        "Pending override blocks downstream truth",
        "FAILURE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "FAIL_CLOSED(OVERRIDE_PENDING)",
        "BLOCKED",
        "BLOCK_EXPORT",
        "",
    ),
    # 9. Approved override scenario
    Scenario(
        "SCN-009",
        "Approved override with evidence",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 10. Methodology version mismatch
    Scenario(
        "SCN-010",
        "Methodology version mismatch",
        "FAILURE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "FAIL_CLOSED(METHODOLOGY_VERSION_MISMATCH)",
        "BLOCKED",
        "BLOCK_EXPORT",
        "",
    ),
    # 11. Ambiguous job evidence
    Scenario(
        "SCN-011",
        "Ambiguous job evidence",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "LOW(EVIDENCE_CONFLICT)",
        "REVIEW_REQUIRED",
        "BLOCK_EXPORT",
        "",
    ),
    # 12. Run-level blocked-record threshold breach
    Scenario(
        "SCN-012",
        "Run-level blocked-record threshold breach",
        "FAILURE",
        "MIXED",
        "MIXED",
        "FAIL_CLOSED(FC-R1:blocked_rate)",
        "MIXED",
        "BLOCK_RUN_VALIDITY",
        "",
    ),
    # 13. Run-level low-confidence threshold breach
    Scenario(
        "SCN-013",
        "Run-level low-confidence threshold breach",
        "FAILURE",
        "MIXED",
        "MIXED",
        "FAIL_CLOSED(FC-R1:low_confidence_rate)",
        "MIXED",
        "BLOCK_RUN_VALIDITY",
        "",
    ),
    # 14. Off-cycle rows present but excluded
    Scenario(
        "SCN-014",
        "Off-cycle rows present but excluded",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 15. Retro rows present but excluded
    Scenario(
        "SCN-015",
        "Retro rows present but excluded",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 16. Allowance rows present but excluded
    Scenario(
        "SCN-016",
        "Allowance rows present but excluded",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 17. Base pay clean cases
    Scenario(
        "SCN-017",
        "Base pay clean cases",
        "CLEAN",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 18. Variable pay / bonus cases
    Scenario(
        "SCN-018",
        "Variable pay / bonus cases",
        "CLEAN",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 19. Multi-assignment workers where only primary assignment should count
    Scenario(
        "SCN-019",
        "Multi-assignment primary-only should count",
        "EDGE",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
    # 20. Worker-level explainability traceable cases
    Scenario(
        "SCN-020",
        "Worker-level explainability trace complete",
        "CLEAN",
        "PASS",
        "PASS_WITHIN_TOLERANCE",
        "PASS",
        "PASS",
        "ALLOW",
        "",
    ),
]


def scenario_by_id(scenario_id: str) -> Scenario:
    for s in SCENARIOS:
        if s.scenario_id == scenario_id:
            return s
    raise KeyError(scenario_id)


def build_job_catalog(rng: random.Random) -> List[Dict[str, object]]:
    # 6 job families, 6 levels, 240 positions total.
    families = [
        ("ENG", "Engineering"),
        ("OPS", "Operations"),
        ("FIN", "Finance"),
        ("HR", "People"),
        ("SAL", "Sales"),
        ("TEC", "Technology"),
    ]
    levels = ["L1", "L2", "L3", "L4", "L5", "L6"]

    rows: List[Dict[str, object]] = []
    pos_idx = 1
    for fam_code, fam_name in families:
        for lvl in levels:
            # multiple job codes per family/level
            for j in range(1, 7):  # 6
                job_code = f"JOB-{fam_code}-{lvl}-{j:02d}"
                job_title = f"{fam_name} {lvl} Role {j:02d}"
                position_id = f"POS-{fam_code}-{lvl}-{pos_idx:04d}"
                pos_idx += 1

                # factor scores 0-4 with realistic-ish correlation to level
                base_level = int(lvl[1])
                skills = int(clamp(round(normal(rng, mean=0.8 + 0.5 * base_level, std=0.7)), 0, 4))
                effort = int(clamp(round(normal(rng, mean=0.6 + 0.45 * base_level, std=0.8)), 0, 4))
                resp = int(clamp(round(normal(rng, mean=0.9 + 0.55 * base_level, std=0.7)), 0, 4))
                workc = int(clamp(round(normal(rng, mean=0.4 + 0.25 * base_level, std=0.9)), 0, 4))

                rows.append(
                    {
                        "position_id": position_id,
                        "job_code": job_code,
                        "job_title": job_title,
                        "job_family": fam_code,
                        "job_level": lvl,
                        "factor_skills_score": skills,
                        "factor_effort_score": effort,
                        "factor_responsibility_score": resp,
                        "factor_working_conditions_score": workc,
                        "methodology_version_reference": METHODOLOGY_VERSION_REFERENCE,
                    }
                )
    return rows


def sample_gender(rng: random.Random) -> str:
    return weighted_choice(
        rng,
        [
            ("F", 0.44),
            ("M", 0.52),
            ("NB", 0.02),
            ("UNDISCLOSED", 0.02),
        ],
    )


def sample_employment_status(rng: random.Random) -> str:
    return weighted_choice(rng, [("ACTIVE", 0.96), ("TERMINATED", 0.04)])


def sample_employment_type(rng: random.Random) -> str:
    return weighted_choice(rng, [("EMPLOYEE", 0.93), ("CONTRACTOR", 0.07)])


def sample_contract_type(rng: random.Random) -> str:
    return weighted_choice(rng, [("PERMANENT", 0.78), ("FIXED_TERM", 0.18), ("APPRENTICE", 0.04)])


def sample_department(rng: random.Random) -> str:
    return weighted_choice(
        rng,
        [
            ("Engineering", 0.30),
            ("Operations", 0.18),
            ("Finance", 0.12),
            ("People", 0.10),
            ("Sales", 0.20),
            ("Technology", 0.10),
        ],
    )


def sample_location(rng: random.Random) -> str:
    return weighted_choice(
        rng,
        [
            ("Dublin", 0.55),
            ("Cork", 0.15),
            ("Galway", 0.10),
            ("Limerick", 0.08),
            ("Remote-IE", 0.12),
        ],
    )


def level_base_monthly_eur(level: str) -> float:
    # Rough enterprise-like monthly base ranges by level (synthetic).
    # L1 ~ 2600, L6 ~ 14000 with spread.
    band = {
        "L1": (2400, 3400),
        "L2": (3200, 4600),
        "L3": (4400, 6200),
        "L4": (6000, 8200),
        "L5": (7800, 11000),
        "L6": (10500, 16000),
    }[level]
    return float(band[0]), float(band[1])


def sample_fte(rng: random.Random) -> float:
    # realistic mix: mostly full-time, some part-time.
    return float(
        weighted_choice(
            rng,
            [
                ("1.0", 0.78),
                ("0.8", 0.10),
                ("0.6", 0.06),
                ("0.5", 0.04),
                ("0.4", 0.02),
            ],
        )
    )


def build_workers_and_assignments(
    rng: random.Random,
    worker_count: int,
    job_rows: List[Dict[str, object]],
    scenario_plan: Dict[str, int],
) -> Tuple[List[Dict[str, object]], List[Dict[str, object]], Dict[str, str], Dict[str, str]]:
    """
    Returns:
      workers rows
      assignments rows
      worker_id -> scenario_id
      assignment_id -> scenario_id (for traceability)
    """
    job_by_position = {r["position_id"]: r for r in job_rows}
    positions = list(job_by_position.keys())

    workers: List[Dict[str, object]] = []
    assignments: List[Dict[str, object]] = []
    worker_to_scn: Dict[str, str] = {}
    assignment_to_scn: Dict[str, str] = {}

    # deterministic ordering for scenario allocation: create an explicit list
    scenario_allocation: List[str] = []
    for scn_id, n in scenario_plan.items():
        scenario_allocation.extend([scn_id] * n)
    if len(scenario_allocation) != worker_count:
        raise ValueError(f"scenario plan totals {len(scenario_allocation)} != worker_count {worker_count}")

    # stable shuffle to avoid scenario clumping but remain deterministic
    rng.shuffle(scenario_allocation)

    for i in range(worker_count):
        hris_worker_id = f"HRIS-WKR-{i+1:06d}"
        worker_public_id = f"WKR-PUB-{i+1:06d}"
        scn_id = scenario_allocation[i]
        worker_to_scn[hris_worker_id] = scn_id

        employment_status = sample_employment_status(rng)
        employment_type = sample_employment_type(rng)
        contract_type = sample_contract_type(rng)

        # hire date: skew earlier for most workers
        hire_date = random_date(rng, dt.date(2014, 1, 1), PAY_PERIOD_END - dt.timedelta(days=7))
        termination_date: Optional[dt.date] = None
        if employment_status == "TERMINATED":
            # ensure some termination dates can be within or after period; synthetic only
            termination_date = random_date(rng, PAY_PERIOD_START, dt.date(2026, 12, 31))

        gender = sample_gender(rng)
        if scn_id == "SCN-004":
            gender = ""  # missing mandatory gender

        dept = sample_department(rng)
        loc = sample_location(rng)
        cost_center = f"CC-IE-{(rng.randint(1, 40)):03d}"

        workers.append(
            {
                "hris_worker_id": hris_worker_id,
                "worker_public_id": worker_public_id,
                "country_code": COUNTRY_CODE,
                "legal_entity_id": LEGAL_ENTITY_ID,
                "employment_status": employment_status,
                "employment_type": employment_type,
                "contract_type": contract_type,
                "hire_date": iso(hire_date),
                "termination_date": iso(termination_date),
                "gender": gender,
                "department": dept,
                "location": loc,
                "cost_center": cost_center,
            }
        )

        # Assignments: most 1, some multi-assignment (SCN-019 forces multi)
        multi = rng.random() < 0.08
        if scn_id == "SCN-019":
            multi = True

        assignment_count = 2 if multi else 1
        primary_idx = 0
        if multi:
            primary_idx = 0

        # pick a base position for primary
        position_id_primary = rng.choice(positions)
        job_primary = job_by_position[position_id_primary]

        fte = sample_fte(rng)
        if scn_id == "SCN-005":
            # missing FTE
            fte_value: Optional[float] = None
        else:
            fte_value = fte

        std_hours = None if fte_value is None else round2(39.0 * float(fte_value))

        for a in range(assignment_count):
            assignment_id = f"ASN-{i+1:06d}-{a+1:02d}"
            if a == 0:
                position_id = position_id_primary
                job = job_primary
                primary = "Y"
                fte_frac = fte_value
                hours = std_hours
            else:
                # secondary assignment: different position; non-primary flag
                position_id = rng.choice(positions)
                job = job_by_position[position_id]
                primary = "N"
                # secondary typically smaller fraction; still deterministic
                fte_frac = round2(float(weighted_choice(rng, [("0.2", 0.5), ("0.3", 0.3), ("0.4", 0.2)])))
                hours = round2(39.0 * float(fte_frac))

            # effective dating: active through pay period
            eff_start = random_date(rng, dt.date(2018, 1, 1), PAY_PERIOD_START)
            eff_end = None

            # ambiguous job evidence scenario: create internal inconsistency between assignment job_level and job_arch job_level
            job_level = str(job["job_level"])
            if scn_id == "SCN-011" and a == 0:
                # mismatch by +/- 2 levels to force review
                lvl_num = int(job_level[1])
                lvl_num2 = int(clamp(lvl_num + rng.choice([-2, 2]), 1, 6))
                job_level = f"L{lvl_num2}"

            assignments.append(
                {
                    "assignment_id": assignment_id,
                    "hris_worker_id": hris_worker_id,
                    "position_id": position_id,
                    "job_code": job["job_code"],
                    "job_title": job["job_title"],
                    "job_family": job["job_family"],
                    "job_level": job_level,
                    "primary_assignment_flag": primary,
                    "fte_fraction": "" if fte_frac is None else round2(float(fte_frac)),
                    "standard_hours_per_week": "" if hours is None else round2(float(hours)),
                    "effective_start_date": iso(eff_start),
                    "effective_end_date": iso(eff_end),
                }
            )
            assignment_to_scn[assignment_id] = scn_id

    return workers, assignments, worker_to_scn, assignment_to_scn


def build_crosswalk(
    rng: random.Random,
    workers: List[Dict[str, object]],
    worker_to_scn: Dict[str, str],
) -> Tuple[List[Dict[str, object]], Dict[str, str]]:
    rows: List[Dict[str, object]] = []
    hris_to_payroll: Dict[str, str] = {}

    payroll_id_counter = 1
    duplicate_pair: Optional[Tuple[str, str]] = None

    # pick two workers for duplicate join key scenario (share same payroll_worker_id)
    dup_candidates = [w["hris_worker_id"] for w in workers if worker_to_scn[w["hris_worker_id"]] == "SCN-003"]
    if len(dup_candidates) >= 2:
        duplicate_pair = (dup_candidates[0], dup_candidates[1])

    duplicate_payroll_worker_id = "PAY-WKR-DUP-000001"

    for w in workers:
        hris_worker_id = str(w["hris_worker_id"])
        scn_id = worker_to_scn[hris_worker_id]

        if scn_id == "SCN-002":
            # missing payroll join: crosswalk exists but status indicates missing/inactive mapping (still join failure)
            payroll_worker_id = ""
            status = "MISSING"
        elif duplicate_pair is not None and hris_worker_id in duplicate_pair:
            payroll_worker_id = duplicate_payroll_worker_id
            status = "ACTIVE"
        else:
            payroll_worker_id = f"PAY-WKR-{payroll_id_counter:06d}"
            payroll_id_counter += 1
            status = "ACTIVE"

        hris_to_payroll[hris_worker_id] = payroll_worker_id
        rows.append(
            {
                "hris_worker_id": hris_worker_id,
                "payroll_worker_id": payroll_worker_id,
                "legal_entity_id": LEGAL_ENTITY_ID,
                "crosswalk_status": status,
                "crosswalk_version": CROSSWALK_VERSION,
            }
        )

    return rows, hris_to_payroll


def build_payroll_runs() -> List[Dict[str, object]]:
    return [
        {
            "payroll_run_id": "RUN-IE-2026-02-REG-001",
            "payroll_provider_id": PAYROLL_PROVIDER_ID,
            "legal_entity_id": LEGAL_ENTITY_ID,
            "pay_period_start_date": iso(PAY_PERIOD_START),
            "pay_period_end_date": iso(PAY_PERIOD_END),
            "off_cycle_flag": "N",
            "retro_flag": "N",
            "run_status": "CLOSED",
            "currency_code": DEFAULT_CURRENCY_CODE,
        }
    ]


def build_earning_code_mapping() -> List[Dict[str, object]]:
    # Map a small set of codes; include unmapped + suspicious/misclassified marker.
    # mapped_component_family: BASE | VARIABLE | ALLOWANCE | EXCLUDED
    rows = [
        {
            "earning_code": "BASE",
            "earning_description": "Base salary",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "BASE",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "",
        },
        {
            "earning_code": "BONUS",
            "earning_description": "Bonus payment",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "VARIABLE",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "",
        },
        {
            "earning_code": "ALLOW_TRAVEL",
            "earning_description": "Travel allowance (excluded in perimeter)",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "EXCLUDED",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "Excluded component family for this mock perimeter.",
        },
        {
            "earning_code": "OFFCYCLE_ADJ",
            "earning_description": "Off-cycle adjustment (excluded in perimeter)",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "EXCLUDED",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "Off-cycle excluded.",
        },
        {
            "earning_code": "RETRO_ADJ",
            "earning_description": "Retro adjustment (excluded in perimeter)",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "EXCLUDED",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "Retro excluded.",
        },
        {
            "earning_code": "SUSPECT_BASE",
            "earning_description": "Suspected misclassified base-like code",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "MAPPED",
            "mapped_component_family": "VARIABLE",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "N",
            "notes": "Intentionally mapped to VARIABLE to simulate suspected misclassification for review.",
        },
        {
            "earning_code": "UNMAPPED_X",
            "earning_description": "Intentionally unmapped code (blocker)",
            "source_payroll_provider": PAYROLL_PROVIDER_SOURCE,
            "source_instance": PAYROLL_PROVIDER_INSTANCE,
            "mapping_status": "UNMAPPED",
            "mapped_component_family": "",
            "mapping_version": MAPPING_VERSION,
            "blocker_flag": "Y",
            "notes": "Intentionally unmapped to trigger mapping blocker scenario.",
        },
    ]
    return rows


def earnings_for_worker(
    rng: random.Random,
    payroll_worker_id: str,
    payroll_run_id: str,
    primary_job_level: str,
    fte_fraction: Optional[float],
    scn_id: str,
) -> List[Dict[str, object]]:
    rows: List[Dict[str, object]] = []

    # base pay line is present for most paid employees except join-missing cases (handled upstream).
    lo, hi = level_base_monthly_eur(primary_job_level)
    base = rng.uniform(lo, hi)
    if fte_fraction is not None:
        base *= float(fte_fraction)
    base = round2(base)

    # Apply scenario-based perturbations
    earning_code = "BASE"
    component_family_candidate = "BASE"
    amount = base

    # variable pay subset
    has_bonus = rng.random() < 0.18
    # force variable pay for scenario 18
    if scn_id == "SCN-018":
        has_bonus = True

    # allowance / off-cycle / retro rows present but excluded: include rows with flags and excluded mapping
    add_allowance = rng.random() < 0.05 or scn_id == "SCN-016"
    add_offcycle = rng.random() < 0.03 or scn_id == "SCN-014"
    add_retro = rng.random() < 0.03 or scn_id == "SCN-015"

    # scenario 6 unmapped earning code: add an unmapped line that is otherwise in-scope flags (regular)
    if scn_id == "SCN-006":
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "UNMAPPED_X",
                "earning_description": "Intentionally unmapped code (blocker)",
                "amount": round2(rng.uniform(25, 250)),
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "UNKNOWN",
                "off_cycle_flag": "N",
                "retro_flag": "N",
            }
        )

    # scenario 7 suspected misclassification: add SUSPECT_BASE as variable mapping though base-like amount
    if scn_id == "SCN-007":
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "SUSPECT_BASE",
                "earning_description": "Suspected misclassified base-like code",
                "amount": round2(rng.uniform(400, 1200)),
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "BASE",
                "off_cycle_flag": "N",
                "retro_flag": "N",
            }
        )

    # base line
    rows.append(
        {
            "payroll_line_id": "",
            "payroll_run_id": payroll_run_id,
            "payroll_worker_id": payroll_worker_id,
            "earning_code": earning_code,
            "earning_description": "Base salary",
            "amount": amount,
            "currency_code": DEFAULT_CURRENCY_CODE,
            "component_family_candidate": component_family_candidate,
            "off_cycle_flag": "N",
            "retro_flag": "N",
        }
    )

    if has_bonus:
        # bonus size scales by level
        lvl_num = int(primary_job_level[1])
        bonus = round2(rng.uniform(0.05, 0.35) * base * (0.6 + 0.1 * lvl_num))
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "BONUS",
                "earning_description": "Bonus payment",
                "amount": bonus,
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "VARIABLE",
                "off_cycle_flag": "N",
                "retro_flag": "N",
            }
        )

    if add_allowance:
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "ALLOW_TRAVEL",
                "earning_description": "Travel allowance (excluded)",
                "amount": round2(rng.uniform(20, 150)),
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "ALLOWANCE",
                "off_cycle_flag": "N",
                "retro_flag": "N",
            }
        )

    if add_offcycle:
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "OFFCYCLE_ADJ",
                "earning_description": "Off-cycle adjustment (excluded)",
                "amount": round2(rng.uniform(-200, 400)),
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "EXCLUDED",
                "off_cycle_flag": "Y",
                "retro_flag": "N",
            }
        )

    if add_retro:
        rows.append(
            {
                "payroll_line_id": "",
                "payroll_run_id": payroll_run_id,
                "payroll_worker_id": payroll_worker_id,
                "earning_code": "RETRO_ADJ",
                "earning_description": "Retro adjustment (excluded)",
                "amount": round2(rng.uniform(-400, 600)),
                "currency_code": DEFAULT_CURRENCY_CODE,
                "component_family_candidate": "EXCLUDED",
                "off_cycle_flag": "N",
                "retro_flag": "Y",
            }
        )

    return rows


def build_payroll_earnings(
    rng: random.Random,
    payroll_run_id: str,
    assignments: List[Dict[str, object]],
    worker_to_scn: Dict[str, str],
    hris_to_payroll: Dict[str, str],
) -> List[Dict[str, object]]:
    # primary assignment job level and fte drive base pay.
    primary_by_worker: Dict[str, Dict[str, object]] = {}
    for a in assignments:
        if str(a["primary_assignment_flag"]) == "Y":
            primary_by_worker[str(a["hris_worker_id"])] = a

    rows: List[Dict[str, object]] = []
    line_id = 1

    for hris_worker_id, primary in primary_by_worker.items():
        scn_id = worker_to_scn[hris_worker_id]
        payroll_worker_id = hris_to_payroll.get(hris_worker_id, "")

        # Missing payroll join scenario: no earning lines because payroll_worker_id missing
        if scn_id == "SCN-002" or payroll_worker_id == "":
            continue

        # Extract fte
        fte_raw = primary.get("fte_fraction", "")
        fte = None
        if isinstance(fte_raw, (int, float)):
            fte = float(fte_raw)
        elif isinstance(fte_raw, str) and fte_raw.strip() != "":
            try:
                fte = float(fte_raw)
            except ValueError:
                fte = None

        job_level = str(primary["job_level"])
        e_rows = earnings_for_worker(rng, payroll_worker_id, payroll_run_id, job_level, fte, scn_id)
        for r in e_rows:
            r["payroll_line_id"] = f"LINE-{line_id:09d}"
            line_id += 1
            rows.append(r)

    return rows


def build_expected_scenario_manifest(
    scenario_counts: Dict[str, int],
) -> List[Dict[str, object]]:
    out: List[Dict[str, object]] = []
    for s in SCENARIOS:
        out.append(
            {
                "scenario_id": s.scenario_id,
                "scenario_name": s.scenario_name,
                "scenario_type": s.scenario_type,
                "affected_record_count": int(scenario_counts.get(s.scenario_id, 0)),
                "expected_join_outcome": s.expected_join_outcome,
                "expected_reconciliation_outcome": s.expected_reconciliation_outcome,
                "expected_confidence_outcome": s.expected_confidence_outcome,
                "expected_category_or_methodology_outcome": s.expected_category_or_methodology_outcome,
                "expected_export_or_run_gate_outcome": s.expected_export_or_run_gate_outcome,
                "related_exception_codes": s.related_exception_codes,
            }
        )
    return out


def validate_internal_consistency(
    workers: List[Dict[str, object]],
    assignments: List[Dict[str, object]],
    jobs: List[Dict[str, object]],
    crosswalk: List[Dict[str, object]],
    payroll_runs: List[Dict[str, object]],
    payroll_earnings: List[Dict[str, object]],
) -> List[str]:
    errors: List[str] = []

    worker_ids = {str(w["hris_worker_id"]) for w in workers}
    assignment_worker_ids = {str(a["hris_worker_id"]) for a in assignments}
    if not assignment_worker_ids.issubset(worker_ids):
        missing = sorted(list(assignment_worker_ids - worker_ids))[:10]
        errors.append(f"Assignments reference unknown workers (sample): {missing}")

    position_ids = {str(j["position_id"]) for j in jobs}
    assignment_position_ids = {str(a["position_id"]) for a in assignments}
    if not assignment_position_ids.issubset(position_ids):
        missing = sorted(list(assignment_position_ids - position_ids))[:10]
        errors.append(f"Assignments reference unknown positions (sample): {missing}")

    # crosswalk keys
    crosswalk_worker_ids = {str(x["hris_worker_id"]) for x in crosswalk}
    if crosswalk_worker_ids != worker_ids:
        errors.append("Crosswalk does not cover exactly the worker population.")

    # payroll run IDs
    run_ids = {str(r["payroll_run_id"]) for r in payroll_runs}
    for e in payroll_earnings:
        if str(e["payroll_run_id"]) not in run_ids:
            errors.append(f"Payroll earning references unknown payroll_run_id: {e['payroll_run_id']}")
            break

    # duplicate payroll_line_id
    line_ids = [str(e["payroll_line_id"]) for e in payroll_earnings]
    if len(line_ids) != len(set(line_ids)):
        errors.append("Duplicate payroll_line_id detected.")

    # duplicate assignment_id
    asn_ids = [str(a["assignment_id"]) for a in assignments]
    if len(asn_ids) != len(set(asn_ids)):
        errors.append("Duplicate assignment_id detected.")

    # mandatory fields present for most records; scenario-driven empties allowed
    for w in workers[:200]:  # sample
        if str(w.get("country_code", "")) != COUNTRY_CODE:
            errors.append("Worker country_code not IE in sample.")
            break
        if str(w.get("legal_entity_id", "")) != LEGAL_ENTITY_ID:
            errors.append("Worker legal_entity_id mismatch in sample.")
            break

    return errors


def main(argv: List[str]) -> int:
    rng = random.Random(SEED)

    # worker population size: enterprise scale target (3k–10k)
    worker_count = 8000

    # Scenario distribution guidance:
    # - 60–70% clean happy path
    # - 30–40% edge/failure combined
    #
    # We allocate per-worker "primary scenario" deterministically. Some scenarios also generate extra payroll lines.
    scenario_plan = {
        "SCN-001": int(worker_count * 0.58),  # clean happy path
        "SCN-002": int(worker_count * 0.03),  # missing payroll join
        "SCN-003": int(worker_count * 0.02),  # duplicate join key (needs >=2)
        "SCN-004": int(worker_count * 0.03),  # missing gender
        "SCN-005": int(worker_count * 0.03),  # missing FTE
        "SCN-006": int(worker_count * 0.03),  # unmapped earning code
        "SCN-007": int(worker_count * 0.04),  # suspected misclassification
        "SCN-008": int(worker_count * 0.03),  # pending override
        "SCN-009": int(worker_count * 0.03),  # approved override
        "SCN-010": int(worker_count * 0.02),  # methodology mismatch
        "SCN-011": int(worker_count * 0.04),  # ambiguous job evidence
        "SCN-014": int(worker_count * 0.02),  # off-cycle present excluded
        "SCN-015": int(worker_count * 0.02),  # retro present excluded
        "SCN-016": int(worker_count * 0.02),  # allowance present excluded
        "SCN-017": int(worker_count * 0.03),  # base pay clean emphasis
        "SCN-018": int(worker_count * 0.03),  # variable pay emphasis
        "SCN-019": int(worker_count * 0.02),  # multi-assignment
        "SCN-020": int(worker_count * 0.03),  # explainability sample
    }

    # Top off to exact worker_count by adding to clean happy path.
    assigned = sum(scenario_plan.values())
    if assigned < worker_count:
        scenario_plan["SCN-001"] += worker_count - assigned
    elif assigned > worker_count:
        scenario_plan["SCN-001"] -= assigned - worker_count

    # Ensure duplicate join key scenario has >=2 workers
    if scenario_plan["SCN-003"] < 2:
        delta = 2 - scenario_plan["SCN-003"]
        scenario_plan["SCN-003"] = 2
        scenario_plan["SCN-001"] = max(0, scenario_plan["SCN-001"] - delta)

    jobs = build_job_catalog(rng)
    workers, assignments, worker_to_scn, assignment_to_scn = build_workers_and_assignments(
        rng, worker_count, jobs, scenario_plan
    )

    crosswalk, hris_to_payroll = build_crosswalk(rng, workers, worker_to_scn)
    payroll_runs = build_payroll_runs()
    earning_map = build_earning_code_mapping()

    payroll_run_id = payroll_runs[0]["payroll_run_id"]
    payroll_earnings = build_payroll_earnings(rng, str(payroll_run_id), assignments, worker_to_scn, hris_to_payroll)

    # Add a small volume of "run-level breach" markers by *manifest*, not by mutating data volumes.
    # These scenarios exist to demonstrate gating when blocked/low-confidence rates exceed thresholds.
    # The mock-run plan explains how to simulate the breach by filtering toggles or increasing edge-case allocation.
    scenario_counts = Counter(worker_to_scn.values())
    scenario_counts["SCN-012"] = 0
    scenario_counts["SCN-013"] = 0

    # Build HRIS->Payroll crosswalk join table already done; now write outputs
    ensure_dir(GENERATED_DIR)

    paths = {
        "hris_workers.csv": os.path.join(GENERATED_DIR, "hris_workers.csv"),
        "hris_assignments.csv": os.path.join(GENERATED_DIR, "hris_assignments.csv"),
        "job_architecture.csv": os.path.join(GENERATED_DIR, "job_architecture.csv"),
        "payroll_runs.csv": os.path.join(GENERATED_DIR, "payroll_runs.csv"),
        "payroll_earnings.csv": os.path.join(GENERATED_DIR, "payroll_earnings.csv"),
        "hris_payroll_crosswalk.csv": os.path.join(GENERATED_DIR, "hris_payroll_crosswalk.csv"),
        "earning_code_mapping.csv": os.path.join(GENERATED_DIR, "earning_code_mapping.csv"),
        "expected_scenario_manifest.csv": os.path.join(GENERATED_DIR, "expected_scenario_manifest.csv"),
    }

    # Validate before write
    errors = validate_internal_consistency(workers, assignments, jobs, crosswalk, payroll_runs, payroll_earnings)
    if errors:
        print("VALIDATION FAILED (internal consistency). Errors:")
        for e in errors:
            print(f"- {e}")
        return 2

    # Write
    n_workers = write_csv(
        paths["hris_workers.csv"],
        [
            "hris_worker_id",
            "worker_public_id",
            "country_code",
            "legal_entity_id",
            "employment_status",
            "employment_type",
            "contract_type",
            "hire_date",
            "termination_date",
            "gender",
            "department",
            "location",
            "cost_center",
        ],
        workers,
    )

    n_assignments = write_csv(
        paths["hris_assignments.csv"],
        [
            "assignment_id",
            "hris_worker_id",
            "position_id",
            "job_code",
            "job_title",
            "job_family",
            "job_level",
            "primary_assignment_flag",
            "fte_fraction",
            "standard_hours_per_week",
            "effective_start_date",
            "effective_end_date",
        ],
        assignments,
    )

    n_jobs = write_csv(
        paths["job_architecture.csv"],
        [
            "position_id",
            "job_code",
            "job_title",
            "job_family",
            "job_level",
            "factor_skills_score",
            "factor_effort_score",
            "factor_responsibility_score",
            "factor_working_conditions_score",
            "methodology_version_reference",
        ],
        jobs,
    )

    n_runs = write_csv(
        paths["payroll_runs.csv"],
        [
            "payroll_run_id",
            "payroll_provider_id",
            "legal_entity_id",
            "pay_period_start_date",
            "pay_period_end_date",
            "off_cycle_flag",
            "retro_flag",
            "run_status",
            "currency_code",
        ],
        payroll_runs,
    )

    n_lines = write_csv(
        paths["payroll_earnings.csv"],
        [
            "payroll_line_id",
            "payroll_run_id",
            "payroll_worker_id",
            "earning_code",
            "earning_description",
            "amount",
            "currency_code",
            "component_family_candidate",
            "off_cycle_flag",
            "retro_flag",
        ],
        payroll_earnings,
    )

    n_cross = write_csv(
        paths["hris_payroll_crosswalk.csv"],
        [
            "hris_worker_id",
            "payroll_worker_id",
            "legal_entity_id",
            "crosswalk_status",
            "crosswalk_version",
        ],
        crosswalk,
    )

    n_map = write_csv(
        paths["earning_code_mapping.csv"],
        [
            "earning_code",
            "earning_description",
            "source_payroll_provider",
            "source_instance",
            "mapping_status",
            "mapped_component_family",
            "mapping_version",
            "blocker_flag",
            "notes",
        ],
        earning_map,
    )

    manifest_rows = build_expected_scenario_manifest(scenario_counts)
    n_manifest = write_csv(
        paths["expected_scenario_manifest.csv"],
        [
            "scenario_id",
            "scenario_name",
            "scenario_type",
            "affected_record_count",
            "expected_join_outcome",
            "expected_reconciliation_outcome",
            "expected_confidence_outcome",
            "expected_category_or_methodology_outcome",
            "expected_export_or_run_gate_outcome",
            "related_exception_codes",
        ],
        manifest_rows,
    )

    # Summary
    print("SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE")
    print(f"Seed: {SEED}")
    print(f"Perimeter: country={COUNTRY_CODE} legal_entity_id={LEGAL_ENTITY_ID} payroll_provider_id={PAYROLL_PROVIDER_ID}")
    print(f"Pay period: {PAY_PERIOD_START.isoformat()}..{PAY_PERIOD_END.isoformat()} currency={DEFAULT_CURRENCY_CODE}")
    print("")
    print("Generated counts:")
    print(f"- workers: {n_workers}")
    print(f"- assignments: {n_assignments} (primary assignments: {sum(1 for a in assignments if a['primary_assignment_flag']=='Y')})")
    print(f"- job architecture positions: {n_jobs}")
    print(f"- payroll runs: {n_runs}")
    print(f"- payroll earning lines: {n_lines}")
    print(f"- crosswalk rows: {n_cross}")
    print(f"- earning code mapping rows: {n_map}")
    print(f"- expected scenario manifest rows: {n_manifest}")
    print("")
    print("Scenario worker counts:")
    for scn in SCENARIOS:
        print(f"- {scn.scenario_id} {scn.scenario_name}: {scenario_counts.get(scn.scenario_id, 0)}")
    print("")
    print("Intentional exception counts (high-level):")
    print(f"- crosswalk_status=MISSING: {sum(1 for x in crosswalk if x['crosswalk_status']=='MISSING')}")
    print(f"- duplicate payroll_worker_id values: {len([k for k,v in Counter(x['payroll_worker_id'] for x in crosswalk if x['payroll_worker_id']).items() if v>1])}")
    print(f"- unmapped earning lines: {sum(1 for e in payroll_earnings if e['earning_code']=='UNMAPPED_X')}")
    print(f"- off-cycle lines (excluded): {sum(1 for e in payroll_earnings if e['off_cycle_flag']=='Y')}")
    print(f"- retro lines (excluded): {sum(1 for e in payroll_earnings if e['retro_flag']=='Y')}")
    print(f"- allowance lines (excluded): {sum(1 for e in payroll_earnings if e['earning_code']=='ALLOW_TRAVEL')}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

