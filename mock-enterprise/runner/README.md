# Mock enterprise demo runner (synthetic only)

**Synthetic / demonstration only — not real pilot evidence — not for legal or regulatory reliance.**

## What this is

- `run_mock_enterprise_demo.py` — validates the generated CSV pack, runs **join + mapping + reconciliation logic** in Python (demo adapter), writes artifacts under `mock-enterprise/out/`, and invokes the repo TypeScript engines via `run_engines.ts`.
- `run_engines.ts` — **demo-only** bridge that calls existing packages: `@enx/intake-engine` (register + seal snapshot), `@enx/job-architecture`, `@enx/category-engine`, `@enx/metrics-engine`, `@enx/reporting-engine`.
- `mock-intake-profile.ts` — demo CSV layout + mapping profile (not the production default three-column intake).

## Preconditions

- Node 22+ and `pnpm` on `PATH` (Windows: ensure `pnpm` is discoverable by Python subprocesses).
- Python 3.10+.
- Generated synthetic pack present: run `python mock-enterprise/generator/generate_mock_enterprise_pack.py` if `mock-enterprise/generated/` is missing.

## Reproducible commands (from repository root)

```bash
python mock-enterprise/generator/generate_mock_enterprise_pack.py
python mock-enterprise/runner/run_mock_enterprise_demo.py
```

### Run TypeScript engine only (optional)

From repo root (paths adjusted for your machine):

```bash
cd mock-enterprise/runner
pnpm exec tsx run_engines.ts --csv="C:/path/to/mock-enterprise/out/intermediate/engine_intake_main.csv" --meta="C:/path/to/mock-enterprise/out/intermediate/engine_meta_main.json" --out="C:/path/to/mock-enterprise/out/intermediate/engine_output_main.json"
```

## Outputs

See `mock-enterprise/out/reports/` and `mock-enterprise/out/intermediate/`. The run log is `mock-enterprise/out/logs/mock-enterprise-demo.log`.

## Honest limits (read before interpreting)

- **Mixed mandatory-field failures** cannot be sealed in a single intake file with the stock pipeline; the demo uses a **cohort CSV** where each row maps cleanly (see `MOCK_ENTERPRISE_RUN_REPORT.md`).
- **`job_architecture.csv` is not consumed by `@enx/job-architecture`** — ambiguous “assignment vs catalog” scenarios are **not** enforced as engine-level cross-checks; see scenario notes in `SCENARIO_OUTCOME_MATRIX.csv`.
- **H04 reconciliation**, **H05 confidence engine**, and **country packs** are **not** implemented as executable engines in this repo snapshot; governance docs describe intent only.
