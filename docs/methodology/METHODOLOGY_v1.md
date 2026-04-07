# Methodology v1 — Comparable Categories & Equal-Value Decisions

**Methodology ID:** methodology_v1  
**Version:** v1.0.0  
**Status:** DRAFT (binding once approved per Section 12)  
**Effective date:** TBD (upon sign-off)  
**Applies to:** Wave H constrained pilot and any pilot run referencing `methodology_v1` `v1.0.0`  
**Determinism rule (binding):** Given the same evidence inputs and the same methodology version, factor scores, weight aggregation, category/equal-value decisions, and override applicability outcomes must be reproducible.

---

## 1. Purpose and scope

This document defines the first defensible **Methodology v1 package** for:
- Assigning and reviewing **comparable category** decisions (where deterministic assignment is not sufficient for defensibility), and
- Making **equal-value** determinations using a factor-based, evidence-backed model suitable for review by Reward, Legal, Audit, and employee representatives.

This methodology is a **governed product**, not hidden logic. It is designed to be:
- **Deterministic**: same evidence + same version ⇒ same decision.
- **Evidence-backed**: every scored factor must cite evidence that is traceable to source systems and controlled artifacts.
- **Reviewable and challengeable**: decisions can be challenged and must have an explicit path to resolution.
- **Auditable**: every decision and override has ownership, approvals, and an expiry discipline.

### Out of scope (explicit)

This slice defines the methodology artifact only. It does not:
- implement scoring engines or automation,
- implement UI workflows,
- execute a pilot,
- implement reconciliation (H04) or confidence scoring (H05),
- introduce country-specific methodology variants.

---

## 2. Covered population and exclusions

### 2.1 Covered population (v1)

Methodology v1 applies to workers included in the pilot scope (Validation Charter v1 Gate G1) where:
- required pilot-mandatory fields in the Source-of-Truth Matrix v1 are present and within tolerance, and
- the worker is eligible for inclusion in pay transparency calculations for the run period.

### 2.2 Exclusions (v1)

Exclusions are **not discretionary** and must be evidence-backed. A worker may be excluded only if:
- exclusion is required by the pilot scope definition, or
- the worker fails a **fail-closed** gate (e.g., missing pilot-mandatory fields, join integrity failure, or unresolved blocker-level reconciliation exception), and the exclusion is recorded with coded reason per Validation Charter.

This methodology does not define reconciliation exception codes (H04 owns exception taxonomy). It requires that any exclusion is linked to the applicable validation gate outcome(s).

---

## 3. Legal/operational framing

### 3.1 Defensibility posture

Equal-value decisions must be:
- based on a **factor model** that reflects credible comparability dimensions (skills/knowledge, effort, responsibility, working conditions),
- scored using **anchors** that constrain discretion,
- supported by **documented evidence**,
- subject to **challenge** and independent review.

### 3.2 Separation of duties (SoD)

To reduce bias and ensure defensibility:
- The person/team proposing a category/equal-value decision must not be the sole approver.
- Overrides are controlled exceptions and must not become an alternate source of truth.
- Overrides must **expire** and be reviewed for renewal (Section 11).

---

## 4. Factor model

### 4.1 Factor overview (minimum v1 set)

Each role under review is assessed on four factors:
1. **Skills / knowledge**
2. **Effort**
3. **Responsibility**
4. **Working conditions**

Factor scores must be based on evidence. “Title-only” assessments are not permitted.

### 4.2 Evidence types (non-exhaustive)

Evidence may include (subject to privacy/access controls):
- HRIS job profile and role description (source-of-truth fields: job title, position id, job level/grade)
- Reward job architecture artifacts (job level mapping; job family/catalog references where governed)
- Training/certification requirements explicitly tied to the role
- Safety/working environment requirements from official policies
- Management accountability or decision rights documented in role design
- On-call/shift patterns where contractually defined and in-scope

### 4.3 Scoring scale (common across all factors)

All factors use the same **0–4** ordinal scale with anchored definitions:

**Score 0 — Not evidenced / not applicable**  
- Evidence is missing or the factor is not relevant to the role as defined in-scope.
- Use is allowed only when the factor is genuinely not applicable; otherwise it indicates an evidence deficiency that must be resolved before approval.

**Score 1 — Basic**  
- Routine application of standard procedures and limited discretion.

**Score 2 — Proficient**  
- Specialized working knowledge; independent execution; moderate discretion within defined policies.

**Score 3 — Advanced**  
- Deep specialized expertise; complex problem solving; significant discretion; may guide others.

**Score 4 — Expert / critical**  
- Recognized expert or critical role-holder; high complexity and ambiguity; broad discretion or high-consequence decisions.

### 4.4 Factor-specific guidance

#### 4.4.1 Skills / knowledge

Assess the breadth and depth of knowledge required to perform the role effectively.
- Evidence must reflect role requirements (not the individual’s personal CV unless the role requires it).
- Examples: job level framework, mandatory certifications, competency matrices.

#### 4.4.2 Effort

Assess sustained mental/physical effort required by the role.
- Evidence must be stable role characteristics (not short-term spikes).
- Examples: documented workload patterns, shift work requirements, complexity assessments.

#### 4.4.3 Responsibility

Assess accountability, decision impact, supervisory/financial responsibility, and risk ownership.
- Evidence must tie to defined accountability structures.
- Examples: approval limits, delegation of authority matrices, people-management scope.

#### 4.4.4 Working conditions

Assess the conditions under which the role is performed (environmental, hazard, unsocial hours where in scope).
- Evidence must come from official policies or contractual/rostered requirements.
- Avoid assumptions based on location stereotypes; use documented requirements.

---

## 5. Scoring model

### 5.1 Unit of scoring

Scores are assigned to a **role under review** (e.g., a job profile/position + level context) and then used to:
- determine equal-value comparability for category grouping where deterministic mechanisms do not provide sufficient defensibility, or
- validate/justify equal-value grouping proposals.

The scored unit must be uniquely identified for audit (e.g., `position_id` + `job_level` + evidence bundle reference).

### 5.2 Scoring rules (binding)

- **Evidence-cited**: Every non-zero factor score must cite at least one evidence item reference.
- **No imputation**: Missing evidence may not be “filled in” with assumptions.
- **Conflicts resolved**: If evidence conflicts (e.g., HRIS vs Reward job level), the conflict must be resolved via Source-of-Truth Matrix v1 and reconciliation outcomes; unresolved conflicts block approval.
- **Anchored selection**: Scorers must select anchored scores (Section 4.3) and record a bounded rationale (reason codes + short narrative).

### 5.3 Equal-value decision rule (v1)

Two roles are considered **equal-value candidates** if:
- they are within the same comparability perimeter (Section 6.3),
- their weighted total score difference is within tolerance (Section 6.2), and
- no disqualifying perimeter constraint is triggered without escalation.

This methodology defines the thresholds and evidence requirements; it does not automate grouping.

---

## 6. Weighting model

### 6.1 Weight set (v1 default)

The v1 weighting reflects a defensibility-first posture:
- **Responsibility**: 0.35
- **Skills / knowledge**: 0.30
- **Effort**: 0.20
- **Working conditions**: 0.15

Weights must sum to 1.0.

### 6.2 Aggregation and tolerance (v1)

Compute:
- factor score \(s_f\) in {0,1,2,3,4}
- weight \(w_f\)
- weighted total \(T = \sum_f (w_f \times s_f)\)

**Equal-value tolerance band (v1):** roles are within tolerance if \(|T_A - T_B| \le 0.40\).

Any calibration change to the tolerance band is subject to change control (Section 13).

### 6.3 Comparability perimeter constraints (v1)

Even within tolerance, equal-value grouping must respect perimeter constraints:
- **Job level sanity**: a difference of more than 1 level band (as defined by Reward job architecture) requires Legal review and explicit justification.
- **Working conditions gating**: if one role has Working Conditions score \(\ge 3\) and the other \(\le 1\), grouping is not permitted without an explicit exception approval.

---

## 7. Evidence standards

### 7.1 Evidence quality tiers (v1)

Each cited evidence item is classified:
- **Tier A (authoritative)**: systems of record or governed artifacts (e.g., HRIS job profile, Reward job architecture, official policies).
- **Tier B (supporting)**: controlled but secondary evidence (e.g., training catalog, documented operating procedures).
- **Tier C (contextual)**: human statements or email threads. Tier C may inform but cannot be the sole basis for a score of 3–4.

### 7.2 Minimum evidence requirements (binding)

For each scored role:
- Each factor score **≥ 2** requires at least **one Tier A or Tier B** item.
- Any factor score **= 4** requires at least **two items**, with at least one **Tier A**.
- Any score of 0 requires an explicit designation of “not applicable” or “evidence missing”; “evidence missing” blocks approval until resolved or a formal exception is approved.

### 7.3 Traceability requirements

All evidence references must be traceable to:
- source system and extract metadata, or
- governed reference artifact identifier and version.

Evidence must be linkable to SoT Matrix v1 fields where relevant (e.g., `job_title`, `job_level`, `fte_fraction` if used).

---

## 8. Calibration process

Calibration ensures the methodology produces stable, defensible outcomes and does not drift into bias.

### 8.1 Calibration cadence (v1)

- **Initial calibration** must occur before Methodology v1 is signed off for pilot use.
- Thereafter, calibration occurs on the review cycle (Section 13.2) or upon material change.

### 8.2 Calibration dataset (v1)

Calibration uses a representative set of roles selected by Reward, including:
- roles believed to be comparable,
- roles believed not to be comparable,
- boundary cases around job level transitions,
- roles with materially different working conditions.

### 8.3 Calibration checks (minimum v1)

Calibration produces an evidence bundle including:
- distribution of totals \(T\),
- sensitivity analysis for weight deltas within ±0.05 on each factor,
- a set of “expected decisions” and methodology outcome alignment,
- rationale for any threshold/weight adjustment proposals.

### 8.4 Calibration change constraints

Calibration may propose changes to:
- weights,
- tolerance band,
- perimeter constraints,
- evidence minimums.

Any such change is a methodology change subject to Section 13 and may require re-approval by Legal.

---

## 9. Review/challenge process

### 9.1 Review stages (v1)

1. **Preparation**: compile evidence bundle; identify role unit; pre-score factors.
2. **Peer review (Reward)**: second scorer reviews factor scores and evidence.
3. **Legal review (as required)**: triggered by perimeter exceptions, high-impact grouping, or disputes.
4. **Assurance review (Audit acknowledgement)**: confirm evidence sufficiency and traceability.
5. **Decision record issuance**: publish the decision record with version references.

### 9.2 Challenge rights and window (v1)

Challenges may be raised by:
- Reward reviewers,
- Legal,
- Internal Audit/Assurance,
- employee representatives (where applicable to governance forums).

**Challenge window:** 30 calendar days from decision record issuance (or prior to pilot outputs being finalized, whichever is earlier).

### 9.3 Challenge outcomes

- **Upheld**: decision stands; evidence bundle is sufficient.
- **Amended**: scores/weights/thresholds applied incorrectly; corrected; decision reissued.
- **Rejected**: insufficient basis for challenge.
- **Escalated**: unresolved; requires VSG review (Validation Charter v1 Section 11).

All outcomes must be recorded and linked to evidence and approvals.

---

## 10. Override governance

Overrides are controlled exceptions. They do not replace the methodology.

### 10.1 When overrides are allowed (v1)

Overrides may be proposed only when:
- a deterministic decision cannot be made due to evidence conflicts or ambiguity that cannot be resolved within the pilot timeline, or
- a known exception case is identified that the methodology does not yet represent and the exception is narrowly scoped.

Overrides are not allowed to:
- bypass missing pilot-mandatory fields,
- bypass reconciliation blockers,
- create country-specific variants.

### 10.2 Override types (v1)

Allowed override types:
- **Category assignment override**: sets or adjusts comparable category.
- **Equal-value grouping override**: assigns a role to an equal-value group contrary to the factor outcome, with explicit rationale and evidence.

Each override must specify:
- scope (worker-level vs role-level vs group-level),
- affected identifiers,
- rationale (bounded reason code + short narrative),
- evidence references,
- approver identity and timestamp,
- expiry date (Section 11).

### 10.3 Separation of duties (binding)

- **Requester** cannot be the **approver**.
- Approver must be from the appropriate function (Section 12).
- Internal Audit has veto right on overrides lacking evidence/traceability.

---

## 11. Override expiry and renewal rules

### 11.1 Mandatory expiry (binding)

Every override must include an expiry date. No perpetual overrides.

**Default expiry (v1):** 90 calendar days from approval, or pilot end date (whichever comes first).

### 11.2 Renewal rules

Renewal requires:
- re-validation that underlying conditions still apply,
- updated evidence bundle if facts changed,
- re-approval by the same or higher authority as original approval,
- recording as a new decision record (no edit-in-place).

### 11.3 Expired override behavior

When an override expires:
- it is not applicable to new runs/decisions,
- baseline methodology outcome applies unless a new override is approved.

---

## 12. Approval model and SoD

### 12.1 Roles (minimum v1)

- **Methodology Owner (Reward)**: accountable owner of this methodology.
- **Legal Sign-off (Employment/Regulatory)**: approves defensibility and compliance adequacy.
- **Internal Audit / Assurance Acknowledgement**: confirms evidence sufficiency and control design.
- **Payroll Controls Owner**: consulted where methodology depends on payroll-mapped remuneration definitions (by reference to SoT Matrix v1).
- **Privacy / GDPR Lead** and **Security Lead**: veto rights where evidence handling/access breaches requirements (Validation Charter v1).

### 12.2 Minimum sign-off sequence (binding; aligned to Validation Charter v1 Section 7)

1. Reward Methodology Owner approval  
2. Legal sign-off  
3. Internal Audit / Assurance acknowledgement

Without all three, Methodology v1 remains DRAFT and must not be used as an approved gate artifact for G3.

---

## 13. Methodology versioning and change control

### 13.1 Versioning model

This methodology uses semantic versioning:
- **MAJOR**: factor model structure changes; scoring scale changes; changes that invalidate prior comparisons.
- **MINOR**: weight/tolerance changes; new reason codes; tightened evidence requirements.
- **PATCH**: clarifications that do not change outcomes.

### 13.2 Review cycle

Review cycle is **quarterly** (or sooner if challenged with upheld/amended outcome).

### 13.3 Change control (binding)

Any change must include:
- rationale and impact analysis (which decisions could change),
- updated structured artifact (`docs/methodology/methodology_v1.json`) consistent with this document,
- approval sequence per Section 12,
- explicit effective date (no retroactive changes to past runs; new runs must reference the new version).

---

## 14. Sign-off evidence requirements

To approve Methodology v1 for pilot use, the evidence bundle must include at minimum:
- this document (`docs/methodology/METHODOLOGY_v1.md`),
- structured package (`docs/methodology/methodology_v1.json`),
- calibration pack outputs (Section 8) with selected roles and results,
- at least one completed example decision record showing evidence→scores→weights→outcome trace,
- override governance template (reason codes, expiry fields, SoD enforcement expectations),
- references and alignment to Validation Charter v1 Gate G3 and SoT Matrix v1 `methodology_version` field requirements.

---

## 15. References to related control artifacts

Binding governance references:
- Validation Charter v1: `docs/validation/VALIDATION_CHARTER_v1.md` (Gate **G3**; veto/authority model)
- Enterprise Hardening Redirect: `docs/validation/REDIRECT_DECISION.md`
- Source-of-Truth Matrix v1: `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md` and machine-readable artifacts:
  - `docs/data-governance/source-of-truth-matrix_v1.csv`
  - `docs/data-governance/source-of-truth-matrix_v1.json`
