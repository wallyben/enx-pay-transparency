export {
  Role,
  ALL_ROLES,
  isValidRole,
  isValidRoleAssignment,
} from './roles';

export type { RoleAssignment } from './roles';

export {
  AccessReason,
  ALL_ACCESS_REASONS,
  buildAccessReasonRecord,
  isValidAccessReason,
  isValidAccessReasonRecord,
} from './access-reason';

export type { AccessReasonRecord, AccessReasonInput } from './access-reason';

export {
  tagAsPii,
  tagAsSensitive,
  tagAsPiiAndSensitive,
  isPiiField,
  maskPiiField,
  maskPiiString,
  maskAllPiiFields,
  extractPiiFieldKeys,
} from './pii';

export type { PiiTag, PiiField, PiiMasked } from './pii';

export {
  EncryptionAlgorithm,
  encrypt,
  decrypt,
  encryptRoundTrip,
} from './encryption';

export type { EncryptionKey, EncryptedValue, KeyResolver } from './encryption';
