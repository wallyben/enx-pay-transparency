## SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE

**SYNTHETIC DATA ONLY**  
**NOT REAL PILOT EVIDENCE**  
**NOT FOR LEGAL OR REGULATORY RELIANCE**

This folder contains a **fully synthetic**, deterministic, enterprise-scale mock dataset pack and a generator intended to exercise the **Euronext Pay Transparency Control Tower** end to end for **demonstration** purposes only.

### What this is (and is not)
- **This is**: a synthetic/mock enterprise demonstration pack to prove **system behavior** (joins, mapping gates, reconciliation blockers, confidence gating, methodology/override review states, export gating).
- **This is not**: real pilot evidence, real payroll proof, a privacy/security approval substitute, or a claim of pilot readiness/authorization.
- **No real personal data is used** and no real identifiers, names, emails, or payroll IDs appear in these files.

### Contents
- `generator/generate_mock_enterprise_pack.py`: deterministic generator (fixed seed) that produces all CSVs under `generated/`.
- `generated/`: generated CSV inputs + scenario manifest.
- `docs/DATASET_DICTIONARY.md`: schema, allowed values, conventions, assumptions, seed.
- `docs/MOCK_RUN_PLAN.md`: how to use the datasets to exercise controls and what scenarios are expected to pass/fail.

### Determinism
The generator uses a **fixed random seed** at the top of the script:
- `SEED = 20260407`

Running the generator multiple times with the same seed produces identical outputs.

### Quick start
From repo root:

```bash
python mock-enterprise/generator/generate_mock_enterprise_pack.py
```

Outputs are written to `mock-enterprise/generated/`.

