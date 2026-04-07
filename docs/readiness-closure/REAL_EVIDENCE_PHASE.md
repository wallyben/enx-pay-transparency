# REAL_EVIDENCE_PHASE.md
# Wave P — Real-Evidence Pilot-Readiness (controlling narrative; binding)

---
artifact_id: "WAVE-P-REAL-EVIDENCE-PHASE"
status: "BINDING (governance/program-control; no pilot execution)"
date: "2026-04-07"
precedence:
  - ".claude/SLICE_QUEUE.md (authoritative queue; Wave P P01–P13)"
  - ".claude/PROJECT_PLAN.md (binding phase constraints)"
  - "docs/validation/VALIDATION_CHARTER_v1.md (gates, authority, veto, fail-closed posture)"
binding_notes:
  - "This document defines the meaning and proof standard of Wave P."
  - "This document does not create approvals, execute pilot actions, or produce evidence."
---

## 1. Purpose and scope

Wave P exists to close the blockers identified in R17 by requiring **real executed evidence** and **real approvals** for pilot-readiness.

**In scope (Wave P):**
- Governance/program-control work to define required evidence, require controlled pointers to executed proof, index artifacts, and enforce authorization boundaries.
- Evidence bundling and re-review preparation culminating in **P13** (third pilot readiness review).

**Out of scope (Wave P):**
- Pilot execution.
- Product code work or downstream feature delivery.
- Fabrication of approvals, sign-offs, or operational results.

**Binding:** Wave P documentation progress alone does not authorize pilot entry or feature resumption.

## 2. Why Wave R was insufficient for real pilot entry

Wave R (R01–R17) produced governance structure and mock/test readiness-closure artifacts. R17 explicitly concluded **NOT READY** for real pilot execution.

R17’s binding interpretation applies:
- The perimeter and artifacts were **MOCK/TEST GOVERNANCE ONLY**.
- The artifact set represented **structure and intent**, not executed operational proof.
- Real pilot authorization requires executed evidence for gates (per Validation Charter), including real scope approval, controlled extracts, measured join integrity, payroll-anchored reconciliation results, confidence outputs, and real privacy/security/access approvals.

**Binding:** Wave R artifacts remain part of the audit trail, but they do not satisfy Wave P real-evidence requirements.

## 3. What Wave P is for

Wave P is for producing a **real-evidence readiness record** that can support an explicit READY/GO decision at **P13**.

Wave P requires:
- Real approvals under the authority/veto model.
- Executed proof in controlled systems.
- Stable, reviewable pointers to that proof.
- A consolidated bundle indexing all required evidence for re-review.

## 4. What Wave P is not for

Wave P is not for:
- Re-labeling mock/test artifacts as “done”.
- Completing templates as a substitute for executed proof.
- Creating new governance templates unless strictly necessary to remove a blocker that prevents producing or reviewing real evidence.

**Binding (template discipline):**
- Template-only completion is not sufficient in Wave P unless explicitly justified as a **blocker-clearing support artifact**.
- Any support artifact must be explicitly labeled as support-only and must not be treated as evidence of an executed control or approval.

## 5. Standard of proof for Wave P

Wave P uses a fail-closed standard of proof:

**Required proof form:** pointers to executed evidence (not the evidence itself) unless the evidence is safe and intended to be stored in-repo.

**Binding requirements for evidence pointers:**
- Each pointer must be stable and reviewable (e.g., run ID, checksum/digest, storage location classification, access boundary, and owner role).
- Each pointer must state what it proves, what perimeter it applies to, and which versions it binds to (scope/perimeter identifier, SoT matrix version where applicable, methodology version, reconciliation framework version, confidence model version).
- Pointers must not imply approval. Approval must be evidenced separately as real approval records (or pointers to them).

**Not acceptable as proof in Wave P:**
- Empty templates, unpopulated reports, or narrative claims without executed-run identifiers and controlled pointers.
- Mock/synthetic placeholders where the workstream explicitly requires real perimeter, real inputs, or real approvals.

## 6. Required real-evidence workstreams

Wave P requires the following real-evidence workstreams to exist as executed evidence + approval records (or controlled pointers to them). These are mandatory readiness components, not optional enhancements:

- **Real perimeter approval**
  - Approved real pilot perimeter (systems/entities/population/period/exclusions) under the charter authority model (quorum + veto-aware).

- **Real source extracts**
  - Controlled extract proof instances for in-scope systems, consistent with the approved perimeter.

- **Real join integrity results**
  - Populated join integrity reports with measured counts, ambiguity/duplicate/orphan rates, and threshold pass/fail against the locked perimeter.

- **Real mapping lock**
  - Locked mapping version state supported by real earning-code inventory evidence and governed change discipline.

- **Real reconciliation results**
  - Populated, payroll-anchored reconciliation reports with tolerances, coded exception taxonomy usage, and disposition evidence.

- **Real exception handling**
  - A populated exception register with owners, dispositions, and evidence pointers; unresolved blockers remain visible and block authorization.

- **Real confidence outputs**
  - Executed confidence output packs and fail-closed trigger registers tied to real inputs and versions.

- **Real methodology calibration evidence**
  - Executed calibration pack and sign-offs required for pilot use (Reward approval, Legal sign-off, Internal Audit/Assurance acknowledgement).

- **Real privacy/security/access approvals**
  - Real privacy clearance evidence (lawful basis/DPIA where applicable, minimization, retention, approvals).
  - Real security clearance evidence (review outcomes, findings closure, control evidence).
  - Real access evidence (approved groups/roles, access grants, and logging evidence exports), consistent with the approved perimeter.

- **Consolidated real readiness bundle**
  - A consolidated bundle that indexes all required evidence pointers and approvals with clear traceability to perimeter and versions.

- **Final real readiness review**
  - A readiness review at **P13** that evaluates the above evidence and issues an explicit READY/GO or NOT READY decision.

## 7. Authorization boundaries

**Binding (pilot):**
- **Pilot entry is prohibited** and **pilot execution is blocked** unless and until **P13** records a READY/GO decision basis under the charter authority model and there is no active veto.

**Binding (feature work):**
- **Downstream feature work remains frozen/unauthorized** unless and until **P13** passes with an explicit resumption authorization basis.

**Binding (non-bypassable gates):**
- No authorization may be inferred from partial evidence. Any missing required workstream evidence is a block unless explicitly dispositioned under the authority/veto rules and recorded as such.

## 8. Relationship to P01–P13

Wave P is executed through P01–P13 as defined in `.claude/SLICE_QUEUE.md`.

**Binding:**
- P01–P12 exist to produce and index the required real-evidence workstreams.
- P13 is the only readiness review step that may recommend READY/GO for pilot entry, and only on the basis of executed evidence and real approvals.
- Work is performed in queue order with fail-closed posture; completion labeling must not imply pilot authorization.

## 9. Fail-closed operating rules

The following rules apply across Wave P:

- **No fabricated evidence or approvals**: evidence must be real and executed; approvals must be real and recorded; placeholders must be labeled as such.
- **Pointer discipline**: store controlled pointers to executed proof; do not commit raw extracts or sensitive operational evidence into the repo unless explicitly approved and safe.
- **Audit-trail preservation**: do not rewrite Wave R artifacts; treat them as immutable audit trail inputs.
- **No “template-only” substitution**: templates may support execution but do not satisfy proof requirements unless explicitly justified as blocker-clearing support artifacts.
- **Fail closed**: if evidence is missing, ambiguous, or not bound to the real perimeter and required versions, readiness remains NOT READY.

## 10. References to governing artifacts

Binding governance sources:
- `.claude/SLICE_QUEUE.md` (Wave P queue and current active slice)
- `.claude/PROJECT_PLAN.md` (phase constraints and authorization boundaries)
- `.claude/CLAUDE.md` (anti-drift rules and forbidden behaviors)
- `docs/validation/VALIDATION_CHARTER_v1.md` (gates, authority model, veto rights, fail-closed posture)
- `docs/readiness-closure/99_review-bundle/SECOND_PILOT_READINESS_REVIEW_v1.md` (R17 decision: NOT READY; rationale and blockers)

Audit-trail note:
- Wave R readiness-closure artifacts (R01–R17) remain authoritative as the record of mock/test governance work, and are referenced but not treated as sufficient proof for real pilot authorization in Wave P.

