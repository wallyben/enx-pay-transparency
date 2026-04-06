// ---------------------------------------------------------------------------
// Baseline RBAC Role Definitions
// Minimal and extensible. Fine-grained permissions matrix is deferred to S34.
// No country-specific role variants are permitted here.
// ---------------------------------------------------------------------------

export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  DATA_STEWARD = 'DATA_STEWARD',
  ANALYST = 'ANALYST',
  AUDITOR = 'AUDITOR',
  CASEWORK_HANDLER = 'CASEWORK_HANDLER',
  READ_ONLY = 'READ_ONLY',
}

// ---------------------------------------------------------------------------
// Role Assignment
// Records that a principal holds a role, with optional scope and provenance.
// ---------------------------------------------------------------------------

export interface RoleAssignment {
  readonly assignmentId: string;
  readonly actorId: string;
  readonly role: Role;
  readonly assignedAt: string;
  readonly assignedBy: string;
  readonly expiresAt?: string;
  readonly scopeEntityType?: string;
  readonly scopeEntityId?: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && Object.values(Role).includes(value as Role);
}

export function isValidRoleAssignment(value: unknown): value is RoleAssignment {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['assignmentId'] === 'string' &&
    v['assignmentId'].length > 0 &&
    typeof v['actorId'] === 'string' &&
    v['actorId'].length > 0 &&
    isValidRole(v['role']) &&
    typeof v['assignedAt'] === 'string' &&
    v['assignedAt'].length > 0 &&
    typeof v['assignedBy'] === 'string' &&
    v['assignedBy'].length > 0
  );
}

export const ALL_ROLES: ReadonlyArray<Role> = Object.values(Role);
