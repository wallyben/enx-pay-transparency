# CLAUDE.md
# Behavioral Contract — Euronext Pay Transparency Control Tower
# Version 1.0 — Effective from S01

This file defines exactly how every future build session must behave.
Read this before every task. Follow it without exception.

---

## 1. HOW TO WORK ON AN ACTIVE SLICE

Before writing any code or creating any file, do exactly this:

1. Read `SLICE_QUEUE.md` and identify the current active slice
2. Read the slice definition: purpose, owned files, acceptance criteria
3. Read `PROJECT_PLAN.md` sections relevant to the slice (package boundaries, country rules, ADR requirements)
4. State the slice you are working on and its acceptance criteria before starting
5. Work only within the slice's owned files and directories

Do not:
- Infer that a slice is active from context — always read `SLICE_QUEUE.md` first
- Begin a new slice because the previous one "looks done" — it must be marked ACCEPTED
- Start work if the slice status is BLOCKED — resolve the blocker first or stop and report it

---

## 2. REQUIRED OUTPUT ORDER FOR EVERY SLICE

When executing a slice, produce outputs in this order. Do not skip steps.

1. **Restate the slice**: name, ID, purpose (3–5 sentences)
2. **List owned files**: exactly what will be created or modified
3. **Call out any blockers or ambiguities** before starting — do not silently resolve significant design questions
4. **Create or modify files** in the order listed in the slice definition
5. **Run tests** (or generate test stubs if the slice defines them)
6. **Verify acceptance criteria** one by one — state pass or fail for each
7. **Update `SLICE_QUEUE.md`**: set status to ACCEPTED, record completion date, note any follow-up observations
8. **File ADR if required** (see PROJECT_PLAN.md section 11 for triggers)
9. **State what the next slice is** and confirm it is not being started

---

## 3. ANTI-DRIFT RULES

These rules exist because drift is the primary risk in a compliance system build.

### 3.1 Scope Containment
- You may only create or modify files listed in the active slice's "Owned Files" section
- If a file is needed that is not in the owned list, stop. Either it belongs to a prior slice (flag it), or the slice definition needs to be updated in `SLICE_QUEUE.md` before proceeding (update it, note the reason, then proceed)

### 3.2 No Speculative Work
- Do not create a file "just in case" it is needed later
- Do not add a function, field, or config option because it will be useful in a future slice
- Do not stub out future slices' code while working in the current slice

### 3.3 No Partial Implementations
- Every piece of code written in a slice must be complete enough to pass its tests and meet its acceptance criteria
- Placeholders like `// TODO: implement in next slice` are allowed only in files that are explicitly scaffolded by the current slice as stubs for a future slice — and only if the slice definition says so

### 3.4 Country Logic Quarantine (Waves 0–5)
- No country name may appear in shared core logic, function names, type names, or config keys
- Country names may appear in: test fixture labels, documentation strings, ADR context sections, and `docs/` files
- If core logic needs to vary by country, it must be expressed as a configuration interface that country packs will implement — not as a conditional on a country name

### 3.5 Package Boundary Enforcement
- Before importing package A from package B, verify that the import direction is permitted per PROJECT_PLAN.md section 5.2
- If the import is not permitted, stop and evaluate whether the dependency belongs in `packages/contracts/` or `packages/canonical-model/` instead
- Never create a circular dependency

---

## 4. FORBIDDEN BEHAVIORS

The following are hard stops. If you find yourself about to do any of these, stop and flag it.

| Forbidden | Reason |
|---|---|
| Starting a new slice before the current one is ACCEPTED | Prevents incomplete gates from propagating |
| Marking a slice ACCEPTED with failing tests | Compliance outputs must be verifiable |
| Skipping an acceptance criterion with a "will fix later" note | Acceptance criteria are the definition of done |
| Writing country-specific logic in a core package | Violates shared-core principle |
| Creating files outside the active slice's owned scope without a documented reason | Scope containment |
| Creating application code during governance-only steps | Wrong layer |
| Adding AI-dependent logic to any calculation or classification | Deterministic-first principle |
| Bypassing a blocking gate (unmapped workers, missing evidence, etc.) | Non-bypassable gates principle |
| Deleting or modifying a prior slice's accepted files without flagging it as a cross-slice fix | Traceability |
| Creating a PR or committing to main before the slice is ACCEPTED | Premature promotion |
| Adding docstrings, comments, or type annotations to code you did not change in the current slice | Scope creep |
| Refactoring code not in scope as a "while I'm here" improvement | Scope creep |
| Silently resolving an architectural ambiguity — resolve it, document it, and file an ADR | ADR requirement |

---

## 5. WHAT COUNTS AS DONE

A slice is done when all of the following are true. Check each one explicitly before updating `SLICE_QUEUE.md`.

- [ ] Every file in the "Owned Files" list exists and matches the slice's specification
- [ ] All acceptance criteria in `SLICE_QUEUE.md` are met — check each one individually and state the result
- [ ] All unit tests for the slice pass with no failures
- [ ] Integration tests pass (where the slice requires them)
- [ ] No TypeScript compiler errors in owned files (zero `tsc` errors)
- [ ] No ESLint errors in owned files
- [ ] No country-specific logic in any shared core package
- [ ] No files outside the owned scope were modified (or modifications are documented)
- [ ] ADR filed for any architectural decision made during the slice
- [ ] `SLICE_QUEUE.md` updated: status = ACCEPTED, completion date recorded

---

## 6. RULES ABOUT ALLOWED FILES

- You may only create files within the active slice's owned directories
- You may always update `.claude/SLICE_QUEUE.md` (status updates and blocker notes only)
- You may always update `.claude/PROJECT_PLAN.md` and `.claude/CLAUDE.md` if a governance correction is needed — but state the reason explicitly and do not modify them silently
- You may create files in `docs/adr/` at any time if an ADR is triggered
- You may NOT create files in `apps/`, `packages/`, `infra/`, `tests/`, or `docs/` unless the active slice's owned files list includes those paths

---

## 7. RULES ABOUT NOT TOUCHING UNRELATED PACKAGES

- Each package in `packages/` is owned by its defining slice
- If you are working on `packages/metrics-engine/` and notice a bug in `packages/intake-engine/`, do not fix it in the same commit
- Log it as a blocker in `SLICE_QUEUE.md` if it is blocking the current slice
- Log it as a note in the completed slice's row if it is not blocking

Touching an unrelated package for any reason other than a documented, blocking fix is a scope violation.

---

## 8. RULES ABOUT TESTS AND EVIDENCE OF DELIVERY

Every slice must produce evidence. Evidence is not optional.

- Unit tests: required for all logic-bearing code. Coverage must be sufficient to exercise all acceptance criteria.
- Integration tests: required for slices that connect two or more packages or systems
- E2E tests: required for slices that complete a user-facing workflow
- Test stubs: acceptable only if the slice explicitly defines them and names the future slice that will complete them

Evidence of delivery means:
- Tests exist in the owned test paths
- Tests pass
- Test output (or a summary of it) is included in the slice completion note

A slice with no tests is not ACCEPTED unless the slice definition explicitly states "no tests required" and gives a reason.

---

## 9. RULES ABOUT NOT STARTING FUTURE SLICES EARLY

- At the end of every slice, state the name of the next slice and confirm it is NOT being started
- Do not create placeholder files for a future slice as a "head start"
- Do not write a function that is only needed in a future slice, even if it logically belongs in the current slice's package
- If the current slice's work naturally leads into the next slice, stop at the acceptance criteria boundary and document what the next slice will pick up

---

## 10. RULES ABOUT COUNTRY LOGIC IN CORE PACKAGES

This is a hard constraint that applies from S01 onward.

Core packages are: `canonical-model`, `intake-engine`, `job-architecture`, `category-engine`, `metrics-engine`, `reporting-engine`, `casework-engine`, `remediation-engine`, `policy-registry`, `recruiting-controls`, `auth`, `audit`, `security`, `contracts`.

In core packages:
- No `if country === 'IE'` or equivalent conditional on a country name
- No hardcoded thresholds that apply to only one country
- No metric formulas specific to one country's statutory definition
- No reporting templates specific to one country
- No statutory deadlines or response windows hardcoded for one country

If a core package needs to vary behavior by country, it must:
1. Define a configuration interface or strategy interface
2. Leave the implementation of that interface to the country pack
3. Accept the country pack's implementation at runtime via injection or registration

Violations of this rule block slice acceptance.

---

## 11. RULES ABOUT STOPPING WHEN ACCEPTANCE CRITERIA ARE MET

- When all acceptance criteria for a slice are met and all tests pass, stop
- Do not add polish, extra test cases for untested edge cases outside the criteria, UI improvements, or documentation beyond what the slice requires
- Do not extend the slice's scope because you have momentum
- Update `SLICE_QUEUE.md`, state what the next slice is, and stop

The next session will handle the next slice. This session ends at the acceptance boundary.

---

## 12. ESCALATION PROTOCOL

If you encounter any of the following, stop work and report to the operator before proceeding:

- An acceptance criterion that cannot be met without modifying a prior slice's accepted files
- A package boundary that cannot be respected without restructuring the slice model
- A country-specific legal requirement that cannot be expressed through the overlay interface pattern
- A dependency on an external system or library that was not anticipated in the slice definition
- A test that reveals a fundamental design flaw in a prior slice

Escalation means: describe the problem precisely, describe the options, state your recommended option, and wait for instruction. Do not silently pick an option and proceed.
