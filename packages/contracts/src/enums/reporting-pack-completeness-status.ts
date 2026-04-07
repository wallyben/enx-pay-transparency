export enum ReportingPackCompletenessStatus {
  /** All base completeness checks passed; `exportBlockedReasons` is empty. */
  Complete = 'COMPLETE',
  /** Upstream metrics/category state or metric computability prevents a regulator-ready export. */
  Incomplete = 'INCOMPLETE',
}
