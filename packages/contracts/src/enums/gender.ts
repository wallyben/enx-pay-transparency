/**
 * Gender values used for pay gap reporting.
 * NOT_DISCLOSED is used when a worker has not provided a gender or has opted out.
 * This field is used only for statistical aggregation — it is never used to identify individuals.
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  NOT_DISCLOSED = 'NOT_DISCLOSED',
}
