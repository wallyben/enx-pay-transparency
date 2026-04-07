# ADR-005: Intake engine package (`@enx/intake-engine`)

## Status

Accepted — 2026-04-06 (S05)

## Context

Wave 1 requires a controlled file intake path with structural validation, quarantine, and auditability. The project plan targets `packages/intake-engine` for upload, validation, and (later) mapping. S05 implements only intake registration and structural validation; mapping and normalization belong to S06.

## Decision

Introduce `packages/intake-engine` as the home for deterministic CSV structural validation, in-memory intake registration (until persistence is introduced), and the orchestration helper `registerIntakeFile` that emits audit events for upload and validation outcome.

`apps/api` exposes a minimal multipart HTTP entrypoint that delegates to `@enx/intake-engine` and `@enx/audit`.

## Consequences

- Intake logic remains testable without HTTP; the API layer stays thin.
- Shared intake contracts (statuses, issue codes, validation shapes) live in `@enx/contracts` for stable interfaces into S06.
- A future persistence layer can replace `InMemoryIntakeFileStore` without changing validation or audit semantics.
- CSV parsing is intentionally minimal (unquoted comma-separated rows); richer formats are out of scope for S05.
