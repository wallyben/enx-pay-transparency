# ADR-011 — `reporting-engine` package (base evidence pack slice)

## Status

Accepted (S12 — 2026-04-07)

## Context

Wave 3 requires an audit-oriented **evidence container** that assembles accepted upstream outputs (EU core metrics run plus category assignment snapshot) into a structured, reviewable pack. Country-specific regulator templates, dashboards, and publication workflows are explicitly deferred.

## Decision

- Add `packages/reporting-engine` as the home for **country-agnostic** base reporting-pack assembly in S12.
- Depend only on `@enx/contracts` (types/schemas) and `@enx/audit` (assembly audit helper).
- Model a **manifest** (run identity, completeness/blockers, traceability refs, rendering placeholders) separate from **evidence sections** (snapshot summary, embedded metrics run, category summary, data quality notes).
- Treat **export** as gated: a pack may exist in `INCOMPLETE` state with first-class `ReportingPackExportBlockedReason` codes; `assertReportingPackExportable` enforces “no export” for blocked packs.
- Include a **PDF slot** in the manifest as a non-produced placeholder (`NOT_PRODUCED`) so structure is explicit without implementing rendering.
- Add minimal **reviewer/management attestation shells** (`PENDING`, null fields) without a workflow engine.

## Consequences

- S13 dashboards and later country packs can consume `ReportingEvidencePack` JSON as a stable input.
- Regulator-specific layouts and PDF generation remain additive; they must not hardcode country logic into this package.
