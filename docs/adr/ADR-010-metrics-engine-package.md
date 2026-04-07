# ADR-010 — `metrics-engine` package (EU core slice)

## Status

Accepted (S11 — 2026-04-07)

## Context

Wave 3 introduces pay-transparency metrics on top of sealed intake normalization and accepted category assignment outputs. The project plan places metric calculations in `packages/metrics-engine/`, separate from reporting packs (S12+) and country overlays (Wave 6).

## Decision

- Add `packages/metrics-engine` as the home for **shared, country-agnostic** EU core metric calculations in S11.
- Depend only on `@enx/contracts` (types/schemas) and `@enx/audit` (optional emission helper).
- Express EU core formulas explicitly in small pure helpers; gate metrics when classification is incomplete (`unassigned` / `review-required` counts) and exclude `metricsCalculationBlocked` rows from numeric aggregates without silent blending.
- Keep variable/bonus pay on an **optional supplemental input track** keyed by intake row index when deployments capture variable pay outside current logical intake fields.

## Consequences

- S12 reporting can consume structured `EuCoreMetricsRunResult` values without re-implementing formulas.
- Country-specific statutory variants remain out of this package until country packs supply configuration via the overlay pattern.
- Additional metric families should extend this package with new modules rather than pushing math into `apps/api`.
