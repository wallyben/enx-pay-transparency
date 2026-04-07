import {
  JobNormalizationIssueCode,
  type JobNormalizationIssue,
  type JobNormalizationRowResult,
  type NormalizedIntakeRowResult,
} from '@enx/contracts';
import { extractRawJobInputsFromRow, extractWorkerExternalId } from './extract-raw-job-inputs';
import { normalizeJobHierarchyCode } from './normalize-code';
import { normalizeGradeOrLevelRaw } from './normalize-grade';
import { normalizeJobTitle } from './normalize-title';

function compareJobIssues(a: JobNormalizationIssue, b: JobNormalizationIssue): number {
  const byCode = a.code.localeCompare(b.code);
  if (byCode !== 0) return byCode;
  return (a.detail ?? '').localeCompare(b.detail ?? '');
}

export function normalizeJobRow(
  row: NormalizedIntakeRowResult,
  jobNormalizationRulesVersion: string,
): JobNormalizationRowResult {
  const extracted = extractRawJobInputsFromRow(row);
  const issues: JobNormalizationIssue[] = [...extracted.issues];
  const { raw } = extracted;

  const titleScalarWrong = issues.some(
    (i) =>
      i.code === JobNormalizationIssueCode.JOB_NORM_JOB_FIELD_WRONG_SCALAR_KIND &&
      i.detail === 'JOB_TITLE',
  );

  const titleNormalized = raw.jobTitle !== undefined ? normalizeJobTitle(raw.jobTitle) : null;
  if (titleNormalized === null && !titleScalarWrong) {
    issues.push({
      code: JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE,
      rowIndex: row.rowIndex,
    });
  }

  let familyCodeNormalized: string | null = null;
  if (raw.jobFamilyCode !== undefined) {
    const out = normalizeJobHierarchyCode(raw.jobFamilyCode);
    if (!out.ok) {
      issues.push({
        code: JobNormalizationIssueCode.JOB_NORM_INVALID_FAMILY_CODE,
        rowIndex: row.rowIndex,
        detail: raw.jobFamilyCode,
      });
    } else {
      familyCodeNormalized = out.value;
    }
  }

  let subfamilyCodeNormalized: string | null = null;
  if (raw.jobSubfamilyCode !== undefined) {
    const out = normalizeJobHierarchyCode(raw.jobSubfamilyCode);
    if (!out.ok) {
      issues.push({
        code: JobNormalizationIssueCode.JOB_NORM_INVALID_SUBFAMILY_CODE,
        rowIndex: row.rowIndex,
        detail: raw.jobSubfamilyCode,
      });
    } else {
      subfamilyCodeNormalized = out.value;
    }
  }

  let gradeOrLevelNormalized: string | null = null;
  if (raw.jobGradeOrLevel !== undefined) {
    const g = normalizeGradeOrLevelRaw(raw.jobGradeOrLevel);
    if (g.kind === 'ambiguous') {
      issues.push({
        code: JobNormalizationIssueCode.JOB_NORM_AMBIGUOUS_GRADE_OR_LEVEL,
        rowIndex: row.rowIndex,
        detail: raw.jobGradeOrLevel,
      });
    } else if (g.kind === 'unmapped') {
      issues.push({
        code: JobNormalizationIssueCode.JOB_NORM_UNMAPPED_GRADE_OR_LEVEL,
        rowIndex: row.rowIndex,
        detail: raw.jobGradeOrLevel,
      });
    } else {
      gradeOrLevelNormalized = g.value;
    }
  }

  const sortedIssues = [...issues].sort(compareJobIssues);

  return {
    rowIndex: row.rowIndex,
    workerExternalId: extractWorkerExternalId(row),
    issues: sortedIssues,
    descriptor: {
      jobNormalizationRulesVersion,
      raw,
      normalized: {
        titleNormalized,
        familyCodeNormalized,
        subfamilyCodeNormalized,
        gradeOrLevelNormalized,
      },
    },
  };
}
