# Mapping Governance (R06) — Readiness-Closure (Wave R)

This folder contains **governance-only** artifacts for **R06 — earning code inventory and mapping lock**.

**Binding constraints (repeated):**
- **Pilot entry remains prohibited.**
- Current perimeter is **MOCK / SYNTHETIC only**.
- Readiness-closure continues in **mock/test governance mode**.
- **No product feature work is authorized.**
- These artifacts **define governance and evidence expectations** only. They do **not** execute mapping, classify real earning codes, or produce reconciliation results.

## Artifacts

- `EARNING_CODE_INVENTORY_v1.md`
  - Governance model for maintaining an earning-code inventory, a mapping status taxonomy, and explicit **blocker vs warning** rules that prevent downstream “truth” when remuneration earning codes are unmapped or ambiguous.

- `EARNING_CODE_INVENTORY_TEMPLATE_v1.md`
  - Template for a governed inventory entry set (intended to be populated later with **synthetic examples only** during readiness-closure, and with real data only after approvals outside Wave R).

- `MAPPING_VERSION_LOCK_v1.md`
  - Governance definition of a **mapping version lock** (what it means, required approvals, change control, and what the lock authorizes / does not authorize).

## Governing references

- Readiness-closure phase definition: `docs/readiness-closure/README.md`
- Locked pilot perimeter (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Validation gates + veto/authority model: `docs/validation/VALIDATION_CHARTER_v1.md`
- Payroll-anchored reconciliation framework (mapping is a reconciliation prerequisite): `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
- Field-level truth discipline (remuneration fields must be governed): `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`

