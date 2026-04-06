# ADR-007: Job architecture package for intake job normalization

## Status

Accepted — 2026-04-07 (S08)

## Context

Sealed intake snapshots (S07) carry row-level normalized logical fields from the mapping pipeline (S06). Comparable worker categories and equal-value logic (S09+) need stable, reviewable job descriptors derived from those rows without mixing in classification or metrics concerns.

## Decision

Introduce `packages/job-architecture` (`@enx/job-architecture`) as the home for S08 job normalization: deterministic helpers, structured job-normalization issue codes (defined in `@enx/contracts`), a pipeline over `IntakeSealedSnapshot.normalizedRows`, and optional audit emission when a run is executed through the service helper.

## Consequences

- Job normalization stays country-agnostic and does not assign comparable categories or compute pay metrics.
- `packages/intake-engine` gains optional mapped logical fields for job-related columns so snapshots can carry job inputs when profiles include those mappings; required-field behavior and default CSV profiles remain backward compatible when job columns are omitted.
- Downstream slices consume `JobNormalizationSnapshotResult` and per-row descriptors as inputs to category logic.
