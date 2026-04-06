/**
 * Codes representing the normalised annualisation basis for a pay component.
 * Used to interpret the raw amount before FTE and period adjustments.
 */
export enum PayPeriodCode {
  ANNUAL = 'ANNUAL',
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  HOURLY = 'HOURLY',
  ONE_OFF = 'ONE_OFF',
}
