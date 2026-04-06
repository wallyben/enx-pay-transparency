# ADR-006 — Intake sealed snapshot control boundary

## Status

Accepted — 2026-04-07 (S07)

## Context

Wave 1 needs an explicit, immutable handoff from intake mapping/normalization (S06) to later job architecture and classification work (S08+). The existing `PaySnapshot` model (S03) describes the long-lived reporting snapshot header for legal entities and periods; it is not the right shape for sealing **intermediate normalized intake rows** immediately after mapping.

## Decision

Introduce **`IntakeSealedSnapshot`** in `packages/canonical-model/` as a narrow, sealed value object that:

- Carries **first-class lineage** (intake file id, content hash, filename, structural status at seal, mapping profile id/version, methodology and rule pack version strings supplied at creation).
- Embeds a **frozen copy** of normalized rows produced by the S06 pipeline (no canonical worker/pay persistence in S07).
- Uses a **deterministic** `snapshotId` and `manifestDigest` derived from a canonical JSON serialization of the manifest payload (schema version, lineage inputs, and row content in stable order).
- Sets **`status: SEALED`** at creation time; the object is **deep-frozen** so consumers cannot mutate it in process memory.

Snapshot **creation** and **gating** live in `packages/intake-engine/` (`collectIntakeSnapshotBlockedReasons`, `runStoredIntakeSnapshotCreation`) with **audit** events using `AuditAction.SEAL` for both success (target `INTAKE_SNAPSHOT`) and failure (target `INTAKE_FILE`). Structured blocking reasons are enumerated in `packages/contracts` as `IntakeSnapshotBlockedReason`.

The API exposes **`POST /v1/intake/files/:intakeFileId/snapshots`** with a minimal JSON body for methodology and rule pack version strings.

## Consequences

- Downstream slices consume a **stable, reviewable seal** without re-running mapping, while remaining free to bind rows to canonical entities later (S08+).
- `PaySnapshot` and `IntakeSealedSnapshot` coexist: the former remains the reporting-period snapshot header; the latter is the **intake control-tower seal** for a single mapped file.
- Additional persistence (database) can store `IntakeSealedSnapshot` JSON or manifest digest without changing the seal semantics.
