# ADR-002 — Canonical Model Structure and Storage Schema Design

**Status:** Accepted  
**Slice:** S03 — canonical_worker_and_pay_models  
**Date:** 2026-04-06  
**Deciders:** Platform governance (automated — no disputed alternatives)

---

## Context

S03 required defining the canonical data model: the stable, shared structural representation of workers, jobs, pay components, and snapshots that all later slices depend on.

Several structural decisions required explicit recording to prevent drift in future slices.

---

## Decisions

### 1. Entity decomposition: five first-class entities

The canonical model is decomposed into five named entities:

| Entity | Responsibility |
|---|---|
| `LegalEntity` | Organisational unit; holds workers; subject to reporting obligations |
| `Job` | Normalised job definition (title, level, family, function); effective-dated |
| `Worker` | Canonical person record normalised from a source system; effective-dated |
| `PayComponent` | A single typed pay element for a worker in a snapshot period |
| `PaySnapshot` | Immutable record of a reporting population at a point in time |

Two supporting entities are also defined:
- `SnapshotManifest` — aggregate counts and integrity metadata, generated at seal time (1:1 with snapshot)
- `SourceLineageRef` — traceability link from snapshot back to source data (N:1 with snapshot)

**Rejected alternatives:**
- Single `Pay` table with a JSON blob for components: rejected because it prevents typed component-level reporting required by the EU directive (base pay vs variable pay vs bonuses).
- Embedding worker data inside the snapshot: rejected because workers may appear in multiple snapshots and effective-dating is cleaner as a separate concern.

### 2. Effective-dating at the entity level (not audit-log only)

`LegalEntity`, `Worker`, and `Job` carry `effectiveFrom` / `effectiveTo` columns directly. Changes create new rows rather than mutating existing rows.

This is distinct from an audit log (written in S04). Effective dates answer "what was true at reporting time?" while audit logs answer "who changed what and when?"

Snapshot immutability depends on being able to resolve the exact `Job` and `LegalEntity` version active at snapshot creation time. Without effective-dating on these entities, historical snapshots cannot be reproduced.

**Consequence:** The intake layer (S05–S07) must record `jobId` as a FK to the specific effective-period row, not a stable code.

### 3. Raw SQL DDL migrations; no ORM in S03

Migration files are plain SQL DDL targeting PostgreSQL 15+, stored in `infra/migrations/`. No ORM (Prisma, Drizzle, Knex) is introduced in S03.

Rationale: The intake engine (S05/S06) is the appropriate slice to choose and integrate a query layer. Selecting an ORM here would force that decision before the intake pattern is designed. Raw DDL migrations are portable and do not constrain the later ORM choice.

**Consequence:** S05/S06 must choose the query layer and integrate it with the existing DDL. The migration runner must be chosen and configured at that point.

### 4. Currency code as a closed enum at the TypeScript level; VARCHAR(3) in SQL

The TypeScript model uses a closed `SUPPORTED_CURRENCY_CODES` tuple (not an open `string`). The SQL schema uses `VARCHAR(3)` rather than a PostgreSQL enum type for `currency_code` on `pay_components`.

Rationale: Currency codes change rarely but do change (ISO 4217 additions, country adoptions). A PostgreSQL enum requires a DDL migration to add values; VARCHAR(3) + application-level validation is more flexible. The TypeScript closed tuple provides compile-time safety for the values we know today.

**Consequence:** Future slices must not bypass the `CurrencyCodeSchema` Zod validation when inserting pay components.

### 5. Gender stored as a typed enum; treated as PII at the security layer (S04)

`gender` is stored as a native enum (`Gender`) on the `Worker` entity. The value `NOT_DISCLOSED` is used when a worker has not provided a value or has opted out.

The canonical model defines the structure. Access controls and PII masking are implemented in the security layer (S04). No masking or access logic belongs in S03.

**Consequence:** S04 must tag `gender` on `Worker` as a PII field. Any query layer that reads workers must apply the masking rules defined in S04 before returning results to consumers.

### 6. No country-specific fields in any core entity

No core entity carries a field that is specific to one country's legal requirements (e.g. no `irishReportingCategoryCode`, no `ukGenderPayGapBand`). 

Country-specific classifications, thresholds, and derived fields belong in country packs (Wave 6) as extensions, not in the canonical schema.

`registeredCountryCode` on `LegalEntity` is a two-character ISO 3166-1 alpha-2 code. It is a structural field (which country's laws apply to this entity) — not a conditional branch that drives core logic.

---

## Consequences

- All future slices that reference workers, jobs, pay, or snapshots must import from `@enx/canonical-model`, not define local copies.
- The intake engine (S05–S07) must map source records to these exact entity structures. No new canonical entities may be added without a new ADR.
- The metrics engine (S11) must read pay components by `componentType` and use `periodCode` + `isFteProratable` for annualisation — these are the structural hooks for that calculation.
- The snapshot immutability contract (`SEALED → no component mutations`) must be enforced at the application layer in S07 and at the DB layer via triggers or application-level guards.
