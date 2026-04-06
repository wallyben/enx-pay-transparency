/**
 * Logical intake fields are stable names for intermediate mapping/normalization.
 * They are not canonical persistence keys; downstream slices bind them to canonical models.
 */
export enum LogicalIntakeField {
  WORKER_EXTERNAL_ID = 'WORKER_EXTERNAL_ID',
  BASE_PAY_AMOUNT = 'BASE_PAY_AMOUNT',
  GENDER = 'GENDER',
}
