import { IntakeColumnType } from '@enx/contracts';
import type { IntakeLayoutSpec, IntakeMappingProfile } from '@enx/contracts';
import { LogicalIntakeField } from '@enx/contracts';

/**
 * Demo-only layout: matches merged CSV produced by Python (`engine_intake_subset.csv`).
 * Isolated under mock-enterprise/ — not a production intake contract.
 */
export const MOCK_ENTERPRISE_INTAKE_LAYOUT: IntakeLayoutSpec = {
  columns: [
    { name: 'worker_id', type: IntakeColumnType.STRING, requiredNonEmpty: true },
    { name: 'base_pay', type: IntakeColumnType.NUMBER, requiredNonEmpty: true },
    { name: 'gender', type: IntakeColumnType.STRING, requiredNonEmpty: true },
    { name: 'job_title', type: IntakeColumnType.STRING, requiredNonEmpty: true },
    { name: 'job_family_code', type: IntakeColumnType.STRING, requiredNonEmpty: false },
    { name: 'job_subfamily_code', type: IntakeColumnType.STRING, requiredNonEmpty: false },
    { name: 'job_grade_or_level', type: IntakeColumnType.STRING, requiredNonEmpty: false },
  ],
};

export const MOCK_ENTERPRISE_MAPPING_PROFILE: IntakeMappingProfile = {
  profileId: 'mock_enterprise_ie_synth_v1',
  version: '1.0.0',
  columnByLogicalField: {
    [LogicalIntakeField.WORKER_EXTERNAL_ID]: 'worker_id',
    [LogicalIntakeField.BASE_PAY_AMOUNT]: 'base_pay',
    [LogicalIntakeField.GENDER]: 'gender',
    [LogicalIntakeField.JOB_TITLE]: 'job_title',
    [LogicalIntakeField.JOB_FAMILY_CODE]: 'job_family_code',
    [LogicalIntakeField.JOB_SUBFAMILY_CODE]: 'job_subfamily_code',
    [LogicalIntakeField.JOB_GRADE_OR_LEVEL]: 'job_grade_or_level',
  },
  requiredLogicalFields: [
    LogicalIntakeField.WORKER_EXTERNAL_ID,
    LogicalIntakeField.BASE_PAY_AMOUNT,
    LogicalIntakeField.GENDER,
    LogicalIntakeField.JOB_TITLE,
    LogicalIntakeField.JOB_FAMILY_CODE,
    LogicalIntakeField.JOB_GRADE_OR_LEVEL,
  ],
};
