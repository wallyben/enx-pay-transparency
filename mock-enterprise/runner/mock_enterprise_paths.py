"""Shared path helpers for mock-enterprise runners (synthetic demo only)."""

from __future__ import annotations

import os
from pathlib import Path

RUNNER_DIR = Path(__file__).resolve().parent
REPO_ROOT = RUNNER_DIR.parents[1]
MOCK_ENT_ROOT = REPO_ROOT / "mock-enterprise"
GENERATED_BASE = MOCK_ENT_ROOT / "generated"
OUT = MOCK_ENT_ROOT / "out"
REPORTS = OUT / "reports"
INTERMEDIATE = OUT / "intermediate"


def resolve_generated_dir(subdir: str) -> Path:
    s = (subdir or "").strip()
    if not s:
        return GENERATED_BASE
    return GENERATED_BASE / s


def generated_subdir_from_env() -> str:
    return os.environ.get("MOCK_ENTERPRISE_GENERATED_SUBDIR", "").strip()
