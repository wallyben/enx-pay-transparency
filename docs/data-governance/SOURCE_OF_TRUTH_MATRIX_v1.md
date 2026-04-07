# Source-of-Truth Matrix v1 (Field-Level) — Enterprise Hardening

**Document ID:** SOURCE_OF_TRUTH_MATRIX_v1  
**Status:** DRAFT (binding once adopted via Validation Charter decision log)  
**Applies to:** Wave H pilot-mandatory field set (Validation Charter v1 Gate **G2**)  
**Version introduced:** v1 (2026-04-07)  

## 1. Goal and scope (H02)

This document defines the **Field-Level Source-of-Truth (SoT) Matrix v1** for the enterprise-hardening phase.

It is a governed, explicit model of **field truth** for the constrained pilot: for each pilot-critical field it states:
- primary/secondary **system of record**
- permitted **systems of input**
- **derivation** and precedence (when computed)
- **ownership** (business + technical)
- **reconciliation** method/level and **tolerance**
- **failure severity** (BLOCKER vs WARNING) and impact
- **confidence inputs** (references only; no scoring logic here)
- **privacy classification**, access controls, retention, lineage, audit requirements
- **change control** for edits

### 1.1 Binding references

- Validation Charter v1: `docs/validation/VALIDATION_CHARTER_v1.md` (esp. Sections **5** and Gate **G2**)
- Redirect decision: `docs/validation/REDIRECT_DECISION.md` (SoR hardening priority and “payroll anchor truth”)

### 1.2 Where H02 stops (and H03 begins)

**H02 stops at definition.** It does not implement:
- reconciliation engine logic, exception taxonomy, or reporting outputs (H04)
- confidence scoring model or propagation rules (H05)
- methodology factor model / equal-value scoring / calibration / override governance details (H03)
- any product/application code or schemas/contracts

H03 begins where this matrix is **consumed** to define Methodology v1 artifacts and sign-off requirements; H04/H05 begin where reconciliation/confidence models are specified and turned into gates and coded exception structures.

## 2. Design principles (binding for v1)

- **Payroll is the primary truth for remuneration fields** unless explicitly justified otherwise per-field.
- **Workday is the primary truth for worker/job HR fields** unless explicitly justified otherwise per-field.
- **Fail-closed for pilot-mandatory fields**: if a pilot-mandatory field is missing/unreconciled beyond tolerance, the run is a **BLOCKER** unless an explicit exception is approved per the Validation Charter.
- **No ambiguous truth ownership**: every pilot-mandatory field must name a business owner and technical owner.
- **Not-ready fields are explicit**: fields not ready for pilot use must be clearly marked (non-mandatory and/or BLOCKER/WARNING as appropriate); they must not be implicitly treated as usable.

## 3. Required matrix columns (definitions)

Each row represents **one canonical field**.

- **field_group**: One of the required field groups in Section 4.
- **field_name_canonical**: Stable canonical name (snake_case). This is the name referenced by downstream slices.
- **business_definition**: Business meaning, including scope and boundaries (not a UI label).
- **pilot_mandatory**: `Y` or `N`.
- **system_of_record_primary**: Primary authoritative system for truth.
- **system_of_record_secondary**: Secondary/reference SoR (if any) used for cross-checking.
- **systems_of_input**: Systems that can supply the field in pilot ingestion (may include SoR plus permitted inputs).
- **derivation_logic**: How the canonical field is populated, including precedence/normalization rules.
- **business_owner**: Accountable business function/role (not engineering).
- **technical_owner**: Accountable technical role/team maintaining extraction/mapping rules.
- **reconciliation_method**: How truth is validated across systems (high-level method; no engine design).
- **reconciliation_level**: One of: `field`, `record`, `aggregate`, `mapping_reference`, `metadata`.
- **tolerance**: Numeric or categorical tolerance for reconciliation. Use explicit units (e.g., currency minor units; percentage).
- **failure_severity**: `BLOCKER` or `WARNING` for pilot use (align to Validation Charter fail-closed posture).
- **failure_impact**: Operational and compliance impact if wrong/missing.
- **confidence_inputs**: Signals used to support confidence scoring later (references only; do not define scoring).
- **privacy_classification**: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SENSITIVE_PII`, `SPECIAL_CATEGORY` (see Section 5).
- **access_control**: Minimum access rule (roles/groups), plus any masking requirements.
- **retention_requirement**: How long to retain (or rule to derive it), and deletion expectations for pilot extracts.
- **lineage_required**: `Y`/`N` plus minimum lineage elements required.
- **audit_requirement**: What access/change/audit evidence must exist.
- **legal_or_usage_notes**: Purpose limitation notes; any restrictions.
- **version_introduced**: `v1`.
- **change_control**: How changes are proposed/approved, and who can veto.

## 4. Required field groups (v1)

The matrix must include these groups (at minimum):
- worker identity / employment
- legal entity / country / payroll context
- job architecture
- pay components
- variable pay / bonus / allowances
- hours / FTE / normalization
- gender / reporting dimensions
- lineage / methodology / confidence

## 5. Privacy classification (v1 scale)

This is a governance classification for pilot artifacts; it does not implement RBAC.

- **PUBLIC**: Approved for external publication (unlikely for pilot fields).
- **INTERNAL**: Internal operational data with low sensitivity.
- **CONFIDENTIAL**: Business-sensitive; access restricted to project roles.
- **SENSITIVE_PII**: Personal data that can identify a worker or reveal pay (most worker-level fields).
- **SPECIAL_CATEGORY**: Special category personal data under GDPR (e.g., some demographics). For v1, **gender** is treated as **SENSITIVE_PII** unless the org requires SPECIAL_CATEGORY classification; this can be elevated by privacy lead via change control.

## 6. Change control (binding)

Changes to any pilot-mandatory field row require:
- proposal with rationale and impact analysis
- approvals by the field’s **business owner** and **technical owner**
- no active veto from Privacy/Security/Internal Audit/Legal/Payroll Controls where applicable (Validation Charter Section 10)
- versioned update to all three artifacts (MD/CSV/JSON) with consistent content

## 7. Field-level source-of-truth matrix (v1 rows)

The authoritative machine-readable versions are:
- CSV: `docs/data-governance/source-of-truth-matrix_v1.csv`
- JSON: `docs/data-governance/source-of-truth-matrix_v1.json`

This MD file is the human-readable reference (definitions + rationale). Use CSV/JSON for programmatic consumption.

