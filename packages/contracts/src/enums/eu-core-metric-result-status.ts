export enum EuCoreMetricResultStatus {
  /** Value computed from eligible rows using the documented EU-style formulas. */
  Computed = 'COMPUTED',
  /** Snapshot-level gate: category assignment is not complete for all workers. */
  BlockedClassificationIncomplete = 'BLOCKED_CLASSIFICATION_INCOMPLETE',
  /** Not enough eligible rows in the required gender/pay slices (e.g. missing male or female). */
  InsufficientEligibleData = 'INSUFFICIENT_ELIGIBLE_DATA',
  /** Denominator or inputs prevent a defined percentage (e.g. mean male pay is zero). */
  NotComputable = 'NOT_COMPUTABLE',
  /** Variable/bonus track not present for this run (no supplemental values supplied). */
  NoVariablePayInput = 'NO_VARIABLE_PAY_INPUT',
}
