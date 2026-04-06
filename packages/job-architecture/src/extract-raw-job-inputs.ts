import {
  JobNormalizationIssueCode,
  LogicalIntakeField,
  type JobNormalizationIssue,
  type NormalizedIntakeRowResult,
  type NormalizedJobRawInputs,
  type NormalizedScalar,
} from '@enx/contracts';

function stringScalarOrIssue(
  scalar: NormalizedScalar | undefined,
  rowIndex: number,
  fieldName: string,
): { ok: true; value?: string } | { ok: false; issue: JobNormalizationIssue } {
  if (scalar === undefined) {
    return { ok: true };
  }
  if (scalar.kind !== 'STRING') {
    return {
      ok: false,
      issue: {
        code: JobNormalizationIssueCode.JOB_NORM_JOB_FIELD_WRONG_SCALAR_KIND,
        rowIndex,
        detail: fieldName,
      },
    };
  }
  return { ok: true, value: scalar.value };
}

export function extractRawJobInputsFromRow(
  row: NormalizedIntakeRowResult,
): { readonly raw: NormalizedJobRawInputs; readonly issues: JobNormalizationIssue[] } {
  const issues: JobNormalizationIssue[] = [];

  const title = stringScalarOrIssue(row.values[LogicalIntakeField.JOB_TITLE], row.rowIndex, 'JOB_TITLE');
  if (title.ok === false) issues.push(title.issue);

  const family = stringScalarOrIssue(
    row.values[LogicalIntakeField.JOB_FAMILY_CODE],
    row.rowIndex,
    'JOB_FAMILY_CODE',
  );
  if (family.ok === false) issues.push(family.issue);

  const sub = stringScalarOrIssue(
    row.values[LogicalIntakeField.JOB_SUBFAMILY_CODE],
    row.rowIndex,
    'JOB_SUBFAMILY_CODE',
  );
  if (sub.ok === false) issues.push(sub.issue);

  const grade = stringScalarOrIssue(
    row.values[LogicalIntakeField.JOB_GRADE_OR_LEVEL],
    row.rowIndex,
    'JOB_GRADE_OR_LEVEL',
  );
  if (grade.ok === false) issues.push(grade.issue);

  const raw: NormalizedJobRawInputs = {
    ...(title.ok === true && title.value !== undefined ? { jobTitle: title.value } : {}),
    ...(family.ok === true && family.value !== undefined ? { jobFamilyCode: family.value } : {}),
    ...(sub.ok === true && sub.value !== undefined ? { jobSubfamilyCode: sub.value } : {}),
    ...(grade.ok === true && grade.value !== undefined ? { jobGradeOrLevel: grade.value } : {}),
  };

  return { raw, issues };
}

export function extractWorkerExternalId(row: NormalizedIntakeRowResult): string | null {
  const s = row.values[LogicalIntakeField.WORKER_EXTERNAL_ID];
  if (s === undefined || s.kind !== 'STRING') return null;
  return s.value;
}
