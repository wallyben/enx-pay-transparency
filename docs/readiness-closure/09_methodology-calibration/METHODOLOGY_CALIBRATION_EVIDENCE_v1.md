# METHODOLOGY_CALIBRATION_EVIDENCE_v1 — Readiness-Closure (Wave R / R10)
**Artifact ID:** R10-METHODOLOGY-CALIBRATION-EVIDENCE-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute calibration, does **not** score real jobs, does **not** implement workflows/product code, does **not** authorize pilot entry/execution, and does **not** fabricate evidence or results.

---

## 1. Purpose and scope

This document defines the governance requirements for **Methodology v1 calibration evidence** so that methodology sign-off cannot occur without a **reviewable, version-bound calibration evidence pack**.

It specifies:
- the calibration-evidence bundle structure and required contents,
- required calibration inputs, outputs, and evidence references,
- challenge and review expectations (including how disagreements remain visible),
- sign-off requirements for Reward / Legal / Audit acknowledgement,
- and required linkage to Methodology v1 versioning and decision records.

**In scope (R10):**
- calibration evidence governance document (this file)
- calibration evidence pack template (R10 companion artifact)
- required input/output sections and evidence reference expectations
- reviewer/challenge expectations and unresolved-disagreement visibility rules
- sign-off expectations and minimum approver roles
- explicit mock/test vs real pilot distinction

**Out of scope (R10):**
- executing any calibration sessions (mock or real)
- generating calibration results, factor scores, weights, tolerances, or “passed” outcomes
- building any workflow tooling, UI, pipelines, or product features
- authorizing pilot entry or pilot execution (pilot entry remains prohibited until R17 passes)

**Binding principle:** **No Methodology v1 sign-off without calibration evidence.** Methodology approval (Validation Charter Gate G3) requires calibration evidence outputs to exist and be referenceable (Methodology v1 §14).

---

## 2. Calibration-evidence principles

These principles are binding for readiness-closure calibration evidence governance:

- **Version-bound**: calibration evidence MUST reference a specific methodology version (e.g., `methodology_v1` `v1.0.0`). Calibration is invalid if it is not tied to a versioned methodology definition.
- **Perimeter-bound**: calibration evidence MUST reference the locked perimeter record (currently MOCK/SYNTHETIC). Calibration evidence must not silently broaden scope (entities, periods, roles, or evidence sources).
- **Explicit, reviewable, and reproducible**: calibration decisions must be described with inputs and decision rationale sufficient for a later readiness review (R17) to understand what was calibrated and why.
- **Challenge handling is first-class**: disagreements, challenges, and escalations must be recorded explicitly; they must not be implied via “final numbers”.
- **Unresolved items stay visible**: unresolved calibration disagreements MUST remain visible in the pack and MUST block sign-off unless explicitly dispositioned via the governing authority model (do not fabricate such decisions).
- **No fabricated outputs**: readiness-closure mode defines structure only; it must not include invented calibration scores, thresholds, sensitivities, or approvals.
- **Fail-closed posture**: missing calibration evidence, missing references, or missing sign-off must be treated as a blocker for methodology sign-off.

---

## 3. Required calibration inputs

Every calibration evidence pack MUST enumerate the inputs used (or placeholders in mock/test mode) and must reference them with stable identifiers/pointers. At minimum:

### 3.1 Perimeter and population inputs (required)
- **Perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md` (MOCK/SYNTHETIC interpretation applies).
- **Calibration population definition**: explicit statement of what roles/records are eligible for calibration (role-under-review unit; grain).
- **Sample selection reference**: a named calibration sample definition (see 3.2) with selection rationale aligned to Methodology v1 §8.2.

### 3.2 Calibration sample definition (required; structure)
Calibration sample selection MUST be documented as a controlled input, including:
- inclusion criteria (what types of roles are included),
- exclusion criteria (what is excluded and why),
- representation requirements (minimum coverage of required dataset requirements from Methodology v1 §8.2):
  - roles believed comparable,
  - roles believed not comparable,
  - boundary cases around job level transitions,
  - roles with materially different working conditions,
- sample size and composition (counts by role family/level bands if applicable),
- how the sample avoids “cherry-picking” (bias controls at governance level).

**Rule (binding):** calibration evidence must reference the sample definition, not just list roles ad hoc.

### 3.3 Factor set reference (required)
- A reference to the factor set used for Methodology v1:
  - skills/knowledge
  - effort
  - responsibility
  - working conditions
- The reference MUST point to Methodology v1 artifacts:
  - `docs/methodology/METHODOLOGY_v1.md` (factor definitions and scoring anchors)
  - `docs/methodology/methodology_v1.json` (machine-readable factor identifiers and scoring scale)

### 3.4 Weighting reference (required)
- A reference to the weight set used (e.g., `v1_default`) and the declared weights/tolerance band as defined by Methodology v1.

**Rule (binding):** if calibration proposes changing weights/tolerances/perimeter constraints/evidence minimums, the pack must mark these as **proposed changes**, not “applied”, unless sign-off exists and the methodology version is updated per change control.

### 3.5 Evidence inputs used (required)
Calibration must list the evidence inputs used to justify factor scoring and calibration checks, including:
- evidence types and tiers per Methodology v1 §7 (Tier A/B/C)
- controlled evidence references (artifact IDs, extract manifest pointers, policy docs, or access-controlled locations)
- any SoT Matrix v1 references used to resolve conflicts (e.g., job level truth)

**Rule (binding):** do not embed sensitive employee-level rows in-repo; use stable pointers.

### 3.6 Participants and session metadata inputs (required)
Calibration governance must record:
- participants (roles, and names where permissible; otherwise `NOT AVAILABLE (MOCK/TEST)`)
- facilitator role
- session dates and time window(s)
- scoring approach used (peer scoring, consensus, independent scoring then reconcile)

---

## 4. Required calibration outputs

Calibration evidence must package outputs required by Methodology v1 §8.3 and must be explicit about whether outputs are:
- **present as real results** (future, real pilot mode), or
- **present as empty placeholders** (current mock/test governance mode).

At minimum, the pack MUST include sections for:

### 4.1 Distribution of weighted totals \(T\) (required)
- distribution summary structure (e.g., counts by score band)
- definition of \(T = \sum_f (w_f \times s_f)\) referencing Methodology v1 §6.2
- notes on outliers and how they were handled (if applicable)

### 4.2 Sensitivity analysis (required)
- sensitivity plan and results structure for weight deltas within ±0.05 per factor (Methodology v1 §8.3)
- statement of what “material change” means for calibration evaluation (governance definition)

### 4.3 Expected decisions and alignment (required)
- list of “expected comparable” and “expected not comparable” exemplars (as governed, not asserted as truth)
- alignment summary structure indicating where methodology outcomes match vs diverge from expectations

### 4.4 Calibration decisions and change proposals (required)
Calibration packs MUST explicitly record:
- decisions reached (e.g., “retain weights”, “propose tolerance band change”, “tighten evidence minimums”)
- decision rationale and evidence references
- any proposed parameter changes (weights, tolerance band, perimeter constraints, evidence minimums)
- whether each proposal is **accepted** / **rejected** / **requires further review**

### 4.5 Unresolved items register (required)
The pack MUST include an unresolved items list capturing:
- item description
- owner role
- what evidence is missing
- what decision is pending
- whether it blocks methodology sign-off
- target review date (if applicable)

**Binding rule:** unresolved calibration disagreements must remain visible and must not be removed to “clean up the pack”.

---

## 5. Required evidence references

Calibration evidence is only reviewable if it is referenceable. Each pack MUST include a references section with stable pointers for:

### 5.1 Governing control artifacts (required)
- Methodology v1 artifacts:
  - `docs/methodology/METHODOLOGY_v1.md`
  - `docs/methodology/methodology_v1.json`
- Validation Charter v1 (authority/veto model; Methodology sign-off path):
  - `docs/validation/VALIDATION_CHARTER_v1.md`
- Confidence Model v1 (fail-closed triggers relevant to methodology/override status):
  - `docs/confidence/CONFIDENCE_MODEL_v1.md`
- Locked perimeter record:
  - `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`

### 5.2 Input evidence pointers (required)
For each evidence input used (job profiles, policies, job architecture references, etc.), the pack must provide:
- evidence item identifier
- tier (A/B/C)
- storage location pointer (access-controlled reference)
- retrieval constraints (who can access; privacy notes)

### 5.3 Decision record references (required)
Any calibration decision that changes methodology meaning (weights/tolerance/perimeter constraints/evidence minimums) must reference:
- decision record IDs (append-only discipline; see R11 for decision pack indexing, but references must exist as placeholders if R11 not yet defined)
- supersession links if the decision replaces prior calibration decisions

**Rule (binding):** calibration decisions must not be “signed off” in-place without a referenced decision record entry.

---

## 6. Challenge and review expectations

Calibration evidence must support challenge and review consistent with Methodology v1 §9 and Validation Charter governance posture.

### 6.1 Minimum reviewer audiences (required)
Calibration evidence packs must be reviewable by, at minimum:
- Reward methodology owner (primary)
- Legal (employment/regulatory)
- Internal Audit / Assurance (acknowledgement of evidence sufficiency)
- Payroll controls owner (consulted where methodology depends on remuneration definitions)

### 6.2 Challenge expectations (required)
The pack MUST include:
- a list of challenged items (what is challenged and by whom/role)
- challenge rationale and evidence references
- outcome status per challenged item: UPHELD | AMENDED | REJECTED | ESCALATED (Methodology v1 §9.3)
- escalation path reference (VSG) where unresolved (Validation Charter §11)

### 6.3 Disagreement visibility rule (binding)
- Disagreements must remain visible as records in the pack (or linked references).
- “Consensus” must not be assumed; it must be evidenced by recorded outcomes and sign-off status.

### 6.4 No implied approval rule (binding)
- The presence of a pack does not imply approvals.
- Any missing review/sign-off must be explicit and blocks methodology sign-off in real pilot mode.

---

## 7. Sign-off and approval expectations

Calibration evidence is a prerequisite to Methodology v1 sign-off (Methodology v1 §14; Validation Charter Gate G3).

### 7.1 Minimum sign-off roles (required)
No methodology sign-off may occur without explicit sign-off status fields for:
- **Reward Methodology Owner** (approval)
- **Legal (employment/regulatory)** (sign-off)
- **Internal Audit / Assurance** (acknowledgement)

Optional but expected reviewer acknowledgements where relevant:
- Payroll controls owner (consulted acknowledgement)
- Privacy/Security leads (only where evidence handling/access conditions are part of calibration evidence handling)

### 7.2 Sign-off content requirements (required)
Sign-off entries must state:
- pack id and methodology version being approved
- date/time (ISO)
- approver identity (or `NOT AVAILABLE (MOCK/TEST)`)
- explicit status: NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)
- any conditions of approval and required follow-ups

### 7.3 Blocking rule (binding)
If calibration evidence is missing, incomplete, or has unresolved blocker items:
- Methodology v1 must remain DRAFT and must not be treated as approved for Gate G3.

---

## 8. Relationship to methodology versioning and decision records

Calibration is part of methodology change control and must be version-bound.

### 8.1 Version binding (required)
Each calibration pack MUST reference:
- `methodology_id` and `methodology_version`
- factor identifiers and scoring scale id (from `methodology_v1.json`)
- weight_set_id and declared tolerance band

### 8.2 What constitutes a methodology-changing calibration outcome (required)
Calibration outcomes that MUST be treated as methodology changes (and therefore require version increment + approvals) include:
- weight changes
- tolerance band changes
- perimeter constraint changes (e.g., job level sanity or working conditions gating rules)
- evidence minimum requirement changes

### 8.3 Decision record linkage expectations (required)
Any calibration decision that changes methodology meaning must be recorded as an append-only decision record and referenced from the calibration pack.

**Note (boundary):** R11 will define the decision record pack format and indexing. R10 requires that calibration packs contain references/placeholder fields for decision record IDs, but R10 does not define the full decision record pack system.

---

## 9. Mock/test vs real pilot distinction

### 9.1 Mock/test readiness-closure mode (current)
R10 is complete in mock/test governance mode when:
- this governance document exists and is consistent with Methodology v1 and Validation Charter requirements,
- the calibration pack template exists and is usable for future real calibration evidence packaging,
- all required sections exist with explicit `NOT AVAILABLE (MOCK/TEST)` placeholders where needed,
- and no fabricated calibration results, approvals, or “passed” outcomes appear.

Mock/test mode must:
- reference the MOCK/SYNTHETIC locked perimeter record,
- avoid any implication that real calibration sessions were held or that Methodology v1 is approved,
- keep sign-off fields present but explicitly unfulfilled.

### 9.2 Real pilot mode (future; not executed here)
Real calibration evidence (outside readiness-closure) requires:
- real scope/perimeter approval (Gate G1) and privacy/security clearance (Gate G4),
- executed calibration sessions with evidence inputs and outputs populated,
- recorded challenges/disagreements and their disposition,
- sign-offs from Reward/Legal/Audit with real identities/timestamps,
- and, where calibration outcomes change methodology meaning, an updated methodology version and change-control record.

**Binding rule:** Nothing in this document alone can be used to claim Gate G3 is passed or to permit pilot entry.

---

## 10. References to governing artifacts

Binding / governing references:
- Authoritative queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R10)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Validation Charter v1 (Gate G3; authority/veto model): `docs/validation/VALIDATION_CHARTER_v1.md`
- Methodology v1 (calibration requirements; sign-off evidence requirements):
  - `docs/methodology/METHODOLOGY_v1.md`
  - `docs/methodology/methodology_v1.json`
- Confidence Model v1 (fail-closed triggers related to methodology version and overrides): `docs/confidence/CONFIDENCE_MODEL_v1.md`
- Exception register governance (linkability for unresolved items and disposition where needed): `docs/readiness-closure/07_exceptions/EXCEPTION_REGISTER_v1.md`

