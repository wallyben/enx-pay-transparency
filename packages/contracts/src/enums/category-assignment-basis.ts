/**
 * How a comparable category was derived (S09 exact/normalized; S10 equal-value / governed override).
 */
export enum CategoryAssignmentBasis {
  EXACT = 'EXACT',
  NORMALIZED_EQUIVALENT = 'NORMALIZED_EQUIVALENT',
  EQUAL_VALUE = 'EQUAL_VALUE',
  OVERRIDE = 'OVERRIDE',
}
