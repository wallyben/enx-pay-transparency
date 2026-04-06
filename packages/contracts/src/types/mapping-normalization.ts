import type { Gender } from '../enums/gender';
import type { LogicalIntakeField } from '../enums/logical-intake-field';
import type { MappingNormalizationIssueCode } from '../enums/mapping-normalization-issue-code';

export interface MappingNormalizationIssue {
  readonly code: MappingNormalizationIssueCode;
  readonly logicalField?: LogicalIntakeField;
  readonly sourceColumn?: string;
  readonly rowIndex?: number;
  readonly expected?: string;
  readonly actual?: string;
}

export type NormalizedScalar =
  | { readonly kind: 'STRING'; readonly value: string }
  | { readonly kind: 'DECIMAL'; readonly value: string }
  | { readonly kind: 'GENDER'; readonly value: Gender };

export interface NormalizedIntakeRowResult {
  readonly rowIndex: number;
  readonly values: Partial<Record<LogicalIntakeField, NormalizedScalar>>;
  readonly issues: readonly MappingNormalizationIssue[];
}

export interface IntakeMappingProfile {
  readonly profileId: string;
  readonly version: string;
  readonly columnByLogicalField: Partial<Record<LogicalIntakeField, string>>;
  readonly requiredLogicalFields: readonly LogicalIntakeField[];
}

export interface MappingNormalizationResult {
  readonly intakeFileId: string;
  readonly profileId: string;
  readonly profileVersion: string;
  readonly gated: boolean;
  readonly gateIssue?: MappingNormalizationIssue;
  readonly ok: boolean;
  readonly fileIssues: readonly MappingNormalizationIssue[];
  readonly rows: readonly NormalizedIntakeRowResult[];
}
