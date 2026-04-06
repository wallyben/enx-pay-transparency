import { LogicalIntakeField, type IntakeMappingProfile } from '@enx/contracts';

export const DEFAULT_INTAKE_MAPPING_PROFILE: IntakeMappingProfile = {
  profileId: 'default_csv_v1',
  version: '1.0.0',
  columnByLogicalField: {
    [LogicalIntakeField.WORKER_EXTERNAL_ID]: 'worker_id',
    [LogicalIntakeField.BASE_PAY_AMOUNT]: 'base_pay',
    [LogicalIntakeField.GENDER]: 'gender',
  },
  requiredLogicalFields: [
    LogicalIntakeField.WORKER_EXTERNAL_ID,
    LogicalIntakeField.BASE_PAY_AMOUNT,
    LogicalIntakeField.GENDER,
  ],
};
