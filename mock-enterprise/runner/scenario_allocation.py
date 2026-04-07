"""
Deterministic replica of `generate_mock_enterprise_pack.py` scenario allocation (SEED + scenario_plan).
Used to map HRIS-WKR-###### -> primary scenario_id without a separate worker->scenario CSV in generated/.
"""

from __future__ import annotations

import random
from typing import Dict, List

SEED = 20260407


def scenario_plan_for(worker_count: int) -> Dict[str, int]:
    scenario_plan = {
        "SCN-001": int(worker_count * 0.58),
        "SCN-002": int(worker_count * 0.03),
        "SCN-003": int(worker_count * 0.02),
        "SCN-004": int(worker_count * 0.03),
        "SCN-005": int(worker_count * 0.03),
        "SCN-006": int(worker_count * 0.03),
        "SCN-007": int(worker_count * 0.04),
        "SCN-008": int(worker_count * 0.03),
        "SCN-009": int(worker_count * 0.03),
        "SCN-010": int(worker_count * 0.02),
        "SCN-011": int(worker_count * 0.04),
        "SCN-014": int(worker_count * 0.02),
        "SCN-015": int(worker_count * 0.02),
        "SCN-016": int(worker_count * 0.02),
        "SCN-017": int(worker_count * 0.03),
        "SCN-018": int(worker_count * 0.03),
        "SCN-019": int(worker_count * 0.02),
        "SCN-020": int(worker_count * 0.03),
    }
    assigned = sum(scenario_plan.values())
    if assigned < worker_count:
        scenario_plan["SCN-001"] += worker_count - assigned
    elif assigned > worker_count:
        scenario_plan["SCN-001"] -= assigned - worker_count
    if scenario_plan["SCN-003"] < 2:
        delta = 2 - scenario_plan["SCN-003"]
        scenario_plan["SCN-003"] = 2
        scenario_plan["SCN-001"] = max(0, scenario_plan["SCN-001"] - delta)
    return scenario_plan


def build_worker_primary_scenario(worker_count: int, seed: int = SEED) -> Dict[str, str]:
    rng = random.Random(seed)
    plan = scenario_plan_for(worker_count)
    allocation: List[str] = []
    for scn_id, n in plan.items():
        allocation.extend([scn_id] * n)
    if len(allocation) != worker_count:
        raise ValueError(f"allocation length {len(allocation)} != worker_count {worker_count}")
    rng.shuffle(allocation)
    out: Dict[str, str] = {}
    for i in range(worker_count):
        wid = f"HRIS-WKR-{i+1:06d}"
        out[wid] = allocation[i]
    return out
