# ADR-009: Category engine equal-value grouping and governed overrides

## Status

Accepted (S10)

## Context

S09 established exact and normalized-equivalent comparable category assignment with traceability. Some rows remain unassigned or review-required without speculative matching. Compliance requires explicit equal-value grouping (reviewable rules, versioned methodology) and governed overrides that cannot silently become final truth until approved.

## Decision

1. **Equal-value** is a separate assignment basis (`EQUAL_VALUE`) with deterministic category IDs derived from explicit `EqualValueRuleset` definitions (methodology version, rules version, declared groups and member keys). Matching is deterministic (sorted group keys and member keys). Equal-value runs only after S09 logic, only for rows with clean job normalization, and only when S09 did not produce `ASSIGNED`.

2. **Governed overrides** are first-class `CategoryOverrideRecord` values with status `PENDING` | `APPROVED` | `REJECTED`. Pending overrides force `REVIEW_REQUIRED`, clear category/basis, set `metricsCalculationBlocked`, and add an explicit issue. Approved overrides set `ASSIGNED` with basis `OVERRIDE` and the proposed category id. Rejected overrides do not change the base assignment; a rejection issue is appended for traceability.

3. **Metrics gating** is expressed on each row as `metricsCalculationBlocked` and aggregated as `metricsCalculationBlockedCount` on the snapshot result for S11+ consumption without implementing metrics in this slice.

4. **Audit**: override approve/reject decisions emit `GOVERNANCE` events with reviewer metadata via `writeCategoryOverrideDecisionAudit`. Extended assignment runs emit `DATA` `UPDATE` with `extendedPipeline: S10` and blocked-row counts.

## Consequences

- Contracts and Zod schemas for category assignment gain S10 fields; consumers must supply new row/snapshot fields when constructing results by hand.
- Duplicate override records for the same `rowIndex` are rejected with an explicit error after deterministic ordering by `overrideId`.
- Country-specific equal-value law is not embedded; rulesets are supplied as data at runtime.
