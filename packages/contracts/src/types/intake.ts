import type { IntakeColumnType } from '../enums/intake-column-type';
import type { IntakeFileStatus } from '../enums/intake-file-status';
import type { StructuralIssueCode } from '../enums/structural-issue-code';

export interface IntakeColumnDefinition {
  readonly name: string;
  readonly type: IntakeColumnType;
  readonly requiredNonEmpty: boolean;
}

export interface IntakeLayoutSpec {
  readonly columns: readonly IntakeColumnDefinition[];
}

export interface StructuralIssue {
  readonly code: StructuralIssueCode;
  readonly column?: string;
  readonly rowIndex?: number;
  readonly expected?: string;
  readonly actual?: string;
}

export interface StructuralValidationResult {
  readonly ok: boolean;
  readonly issues: readonly StructuralIssue[];
}

export interface IntakeFileRecord {
  readonly intakeFileId: string;
  readonly originalFilename: string;
  readonly contentType: string;
  readonly byteLength: number;
  readonly status: IntakeFileStatus;
  readonly validation: StructuralValidationResult;
  readonly createdAt: string;
  readonly contentSha256: string;
}
