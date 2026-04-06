# ADR-002 — Audit and Security Baseline Structure

**Status:** Accepted  
**Date:** 2026-04-06  
**Slice:** S04 — audit_and_security_baseline  
**Author:** S04 build session

---

## Context

S04 must establish the shared audit and security baseline that all later slices depend on for traceability, access governance, and evidence handling. Several structural decisions were made during this slice that will constrain all downstream work.

Key questions resolved:
1. Where should ActorIdentity live — in `audit` or `security`?
2. How should role model be structured at baseline?
3. Should encryption use a real algorithm or a stub in S04?
4. Where should EvidenceManifest live?
5. Should the audit writer use in-memory or a real persistence layer at baseline?
6. Should the packages use Zod schemas or TypeScript-first validation at S04?

---

## Decisions

### 1. ActorIdentity belongs in `packages/audit`

**Decision:** `ActorIdentity` and `ActorType` are defined in `packages/audit/src/types.ts`.

**Rationale:** Audit events are the primary consumer of actor identity at baseline. Security (`access-reason`) references actors by `actorId` (string), not by the full `ActorIdentity` shape. This avoids a cross-package dependency between `audit` and `security` at the baseline level, since neither is declared the authoritative importer of the other by the package boundary rules.

**Consequences:** Later slices that need `ActorIdentity` in a security context will import from `@enx/audit`. This is acceptable because `audit` is declared cross-cutting (`packages/auth/` and `packages/audit/` are cross-cutting — any package may depend on them) per PROJECT_PLAN.md §5.2.

---

### 2. Minimal flat Role enum — no hierarchical permissions at baseline

**Decision:** The `Role` enum in `packages/security/src/roles.ts` is a flat enum of 7 named roles. No hierarchical inheritance, no permissions matrix, no country-specific roles.

**Rationale:** A flat enum is the minimal correct structure. The full permissions matrix (which role can perform which action on which entity) is deferred to S34 (`security_hardening_and_role_matrix`) as explicitly defined in the slice queue. Building a permissions engine now would violate the no-speculative-work rule.

**Consequences:** Downstream slices that need to gate actions by role will perform simple role membership checks (`actor.role === Role.COMPLIANCE_OFFICER`). The S34 slice will replace or extend this with a proper permissions engine.

---

### 3. Encryption is a round-trip stub using base64 in S04

**Decision:** `encrypt()` and `decrypt()` in `packages/security/src/encryption.ts` use base64 encoding as a placeholder. The `EncryptionAlgorithm.STUB` value marks this unambiguously. Real AES-256-GCM (or equivalent) and key management infrastructure are deferred to S34.

**Rationale:** The SLICE_QUEUE.md acceptance criterion explicitly says "key management stubbed for now". Implementing real encryption in S04 would require choosing and wiring an infrastructure component (KMS, secrets manager, key rotation strategy) that belongs to the security hardening wave. Doing so now would introduce an unplanned dependency on external infrastructure.

**Consequences:** Any S04 code that calls `encrypt()` produces base64 — not real ciphertext. This is acceptable for baseline structure. All callers must be updated in S34. The `STUB` algorithm label makes this easy to find and replace.

---

### 4. EvidenceManifest belongs in `packages/audit`

**Decision:** `EvidenceManifest`, `EvidenceItem`, and `EvidenceItemType` are defined in `packages/audit/src/types.ts`.

**Rationale:** Evidence manifests are a traceability and audit concern — they record what evidence exists for a compliance output, who created it, what snapshot it covers, and whether it has been sealed. This is fundamentally an audit-layer concept. Placing it in `audit` keeps the evidence structure co-located with the audit event model and avoids splitting traceability concerns across packages.

**Consequences:** Later slices (`reporting-engine`, `casework-engine`) that build or read evidence manifests will import from `@enx/audit`. This is the correct dependency direction (downstream packages depend on the cross-cutting audit package, not the reverse).

---

### 5. In-memory writer and query engine at S04 baseline

**Decision:** `InMemoryAuditWriter` and `InMemoryAuditQueryEngine` are the concrete implementations provided. Both operate on an in-memory array.

**Rationale:** No database schema has been defined yet (that belongs to a future infrastructure slice). The in-memory implementations are sufficient to satisfy the acceptance criteria: the interfaces are defined, tests pass, and downstream slices can depend on the `AuditWriter` and `AuditQueryEngine` interfaces without coupling to a specific persistence mechanism. The concrete implementations will be replaced with database-backed ones in a later slice when the infrastructure is available.

**Consequences:** S04 implementations are not production-safe (events are lost on process restart). This is expected and documented. The interface contracts defined in `writer.ts` and `query.ts` will remain stable — only the implementations will change.

---

### 6. TypeScript-first validation, no Zod in S04

**Decision:** Validation is implemented using TypeScript type guards (`isValidAuditEvent`, `isValidActorIdentity`, etc.) rather than Zod schemas.

**Rationale:** Zod schemas were planned for `packages/contracts` (S02), which has not yet been implemented. Adding a Zod dependency to S04 would be a speculative cross-slice dependency and would require updating the workspace before S02 is accepted. The TypeScript type guards are sufficient to satisfy the validation acceptance criteria and can be replaced or supplemented with Zod-based schemas in a later slice if required.

**Consequences:** Validation in S04 is not as ergonomic as Zod (no parse/safeParse pattern, no error message enrichment). This is acceptable for the baseline. S05+ slices that need runtime validation of external inputs should use the Zod schemas from `contracts` (once S02 is accepted).

---

## Affected Packages

- `packages/audit` — new source files, owned by S04
- `packages/security` — new source files, owned by S04

## Packages NOT affected

- `packages/contracts` — no changes (no cross-cutting types were identified as genuinely required from contracts at this baseline)
- `packages/canonical-model` — no changes
- All `apps/` — no changes

---

## Status

All decisions above are accepted and reflected in the S04 implementation. The structure will be reviewed in S34 (security hardening) and may be extended. No decision may be reversed without a new ADR.
