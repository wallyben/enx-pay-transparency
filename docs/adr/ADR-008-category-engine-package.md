# ADR-008: Category engine package for exact and normalized comparable categories

## Status

Accepted — 2026-04-07 (S09)

## Context

After job normalization (S08), sealed snapshots expose per-row `NormalizedJobDescriptor` values. Comparable-worker category assignment must be deterministic, traceable to methodology and rule-pack versions, and must surface explicit review-required and unassigned outcomes without mixing in equal-value logic, metrics, or country overlays.

## Decision

Introduce `packages/category-engine` (`@enx/category-engine`) as the home for S09 category assignment: contracts for assignment status, basis, and issue codes; deterministic category IDs from explicit exact vs normalized-equivalent keys; a pipeline over `JobNormalizationSnapshotResult`; and optional audit emission when a run is executed through the service helper.

## Consequences

- Category assignment stays country-agnostic and does not compute pay metrics, equal-value groupings, or reporting outputs.
- Equal-value grouping and governed overrides remain explicitly deferred to S10.
- Downstream consumers can gate metrics (S11+) on `CategoryAssignmentStatus` and structured issues without silent unassigned rows.
