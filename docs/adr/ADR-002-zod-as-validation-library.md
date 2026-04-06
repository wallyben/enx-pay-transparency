# ADR-002 — Zod as the Runtime Validation Library

**Status:** Accepted  
**Date:** 2026-04-05  
**Slice:** S02 — core_contracts_and_enums

---

## Context

The `packages/contracts` package defines shared enums, types, and schemas used across the entire platform. At runtime, these schemas must be capable of validating untrusted input — from API request bodies, intake file rows, and inter-service payloads — and producing typed, safe values.

The platform is built on TypeScript. A validation library must:
1. Derive TypeScript types from schema definitions (single source of truth)
2. Produce clear, structured error messages on validation failure
3. Be actively maintained, widely adopted, and stable
4. Have zero external dependencies (to avoid transitive risk in a compliance-sensitive codebase)
5. Be suitable for use on Node.js (server-side only — no browser bundle constraints at this layer)

Options evaluated:

| Library | Type inference | Zero deps | Maintenance | Notes |
|---|---|---|---|---|
| Zod | Yes — `z.infer<>` | Yes | Very active | De-facto standard in TypeScript ecosystem |
| Yup | Partial | No | Active | Less ergonomic TS inference; has deps |
| io-ts | Yes — FP style | Yes | Moderate | Requires `fp-ts`; steep learning curve |
| class-validator | Class-based only | No | Active | Requires decorators; not composable |
| Custom type guards | Manual only | — | N/A | Does not scale; no error messages |

---

## Decision

Use **Zod v3** as the runtime validation library for all schemas in `packages/contracts` and all downstream packages that define validation logic.

Zod is added as a production dependency of `packages/contracts`. Downstream packages that need validation import from `@enx/contracts` (which re-exports Zod schemas) rather than depending on Zod directly, unless they define new schemas.

The pattern established in S02 is:
- TypeScript types are defined as plain interfaces (in `src/types/`)
- Enums are native TypeScript enums (in `src/enums/`)
- Zod schemas validate against those enums and types at runtime (in `src/schemas/`)
- `z.nativeEnum()` is used to create enum schemas so TypeScript enum members are the source of truth

---

## Consequences

**Positive:**
- Single source of truth: enum members drive both the TypeScript type and the Zod schema
- Clear validation error messages at all system boundaries
- `z.infer<>` can be used in future slices to derive types from schema where the schema is primary
- No transitive dependencies added

**Negative / Accepted risks:**
- Downstream packages that define new schemas must install Zod directly (or import it transitively via `@enx/contracts` — this is acceptable as a peer)
- Zod v3 and v4 are not fully compatible; any future Zod upgrade is a coordinated change

**Pattern commitment:**
All future validation schemas in core packages must use Zod. Deviating from this pattern in a future slice requires a new ADR or an amendment to this one.
