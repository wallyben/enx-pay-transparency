# Data Governance Artifacts (v1)

This folder contains the **Field-Level Source-of-Truth (SoT) Matrix v1** produced in Wave H (enterprise hardening).

## Files

- `SOURCE_OF_TRUTH_MATRIX_v1.md`
  - Human-readable governance document: principles, column definitions, privacy classification scale, and change control.
- `source-of-truth-matrix_v1.csv`
  - Machine-readable table for spreadsheets and review workflows. **One row per field**.
- `source-of-truth-matrix_v1.json`
  - Machine-readable artifact intended for downstream programmatic consumption. Includes columns, enums, and rows.

## Consistency rule (binding for H02)

All three artifacts must represent the **same matrix**:
- same required column set
- same set of populated field rows for pilot-critical fields
- same SoR/ownership/reconciliation/tolerance/severity/privacy/retention content

If the matrix is updated, update all three in the same change and follow the `change_control` rules defined in the matrix.

