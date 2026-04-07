import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  CategoryOverrideStatus,
  type CategoryAssignmentRowResult,
  type CategoryOverrideRecord,
} from '@enx/contracts';
import { applyGovernedCategoryOverride } from '../governed-override';

const trace = {
  methodologyVersion: 'm1',
  rulePackVersion: 'r1',
  jobNormalizationRulesVersion: 'jn1',
  categoryEngineRulesVersion: 'ce1',
};

function baseAssigned(): CategoryAssignmentRowResult {
  return {
    rowIndex: 0,
    workerExternalId: 'w1',
    status: CategoryAssignmentStatus.ASSIGNED,
    traceability: trace,
    categoryId: 'cat_exact',
    basis: CategoryAssignmentBasis.EXACT,
    issues: [],
    jobNormalizationIssueCodes: [],
    metricsCalculationBlocked: false,
    equalValueGroupKey: null,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };
}

function baseUnassigned(): CategoryAssignmentRowResult {
  return {
    rowIndex: 0,
    workerExternalId: 'w1',
    status: CategoryAssignmentStatus.UNASSIGNED,
    traceability: trace,
    categoryId: null,
    basis: null,
    issues: [{ code: CategoryAssignmentIssueCode.CAT_ASN_DESCRIPTOR_EMPTY }],
    jobNormalizationIssueCodes: [],
    metricsCalculationBlocked: true,
    equalValueGroupKey: null,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };
}

describe('applyGovernedCategoryOverride', () => {
  it('PENDING does not apply proposed category and blocks metrics', () => {
    const ovr: CategoryOverrideRecord = {
      overrideId: 'ovr_p',
      rowIndex: 0,
      proposedCategoryId: 'cat_proposed',
      status: CategoryOverrideStatus.PENDING,
      proposedAtIso: '2026-04-07T10:00:00.000Z',
    };
    const out = applyGovernedCategoryOverride({
      rowIndex: 0,
      baseRowResult: baseAssigned(),
      override: ovr,
    });
    expect(out.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);
    expect(out.categoryId).toBeNull();
    expect(out.basis).toBeNull();
    expect(out.metricsCalculationBlocked).toBe(true);
    expect(out.governedOverrideId).toBe('ovr_p');
    expect(out.governedOverrideStatus).toBe(CategoryOverrideStatus.PENDING);
    expect(out.issues.some((i) => i.code === CategoryAssignmentIssueCode.CAT_ASN_GOVERNED_OVERRIDE_PENDING)).toBe(
      true,
    );
  });

  it('APPROVED applies proposed category and clears metrics block', () => {
    const ovr: CategoryOverrideRecord = {
      overrideId: 'ovr_a',
      rowIndex: 0,
      proposedCategoryId: 'cat_manual',
      status: CategoryOverrideStatus.APPROVED,
      proposedAtIso: '2026-04-07T10:00:00.000Z',
      decidedAtIso: '2026-04-07T11:00:00.000Z',
      reviewerActorId: 'rev-1',
    };
    const out = applyGovernedCategoryOverride({
      rowIndex: 0,
      baseRowResult: baseUnassigned(),
      override: ovr,
    });
    expect(out.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(out.categoryId).toBe('cat_manual');
    expect(out.basis).toBe(CategoryAssignmentBasis.OVERRIDE);
    expect(out.metricsCalculationBlocked).toBe(false);
    expect(out.governedOverrideStatus).toBe(CategoryOverrideStatus.APPROVED);
  });

  it('REJECTED leaves an assigned base row unchanged and records rejection explicitly', () => {
    const ovr: CategoryOverrideRecord = {
      overrideId: 'ovr_r',
      rowIndex: 0,
      proposedCategoryId: 'cat_bad',
      status: CategoryOverrideStatus.REJECTED,
      proposedAtIso: '2026-04-07T10:00:00.000Z',
      decidedAtIso: '2026-04-07T11:00:00.000Z',
      reviewerActorId: 'rev-1',
    };
    const out = applyGovernedCategoryOverride({
      rowIndex: 0,
      baseRowResult: baseAssigned(),
      override: ovr,
    });
    expect(out.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(out.categoryId).toBe('cat_exact');
    expect(out.basis).toBe(CategoryAssignmentBasis.EXACT);
    expect(out.metricsCalculationBlocked).toBe(false);
    expect(out.issues.some((i) => i.code === CategoryAssignmentIssueCode.CAT_ASN_GOVERNED_OVERRIDE_REJECTED)).toBe(
      true,
    );
  });

  it('ignores override when rowIndex does not match', () => {
    const ovr: CategoryOverrideRecord = {
      overrideId: 'ovr_x',
      rowIndex: 99,
      proposedCategoryId: 'cat_x',
      status: CategoryOverrideStatus.APPROVED,
      proposedAtIso: '2026-04-07T10:00:00.000Z',
    };
    const base = baseAssigned();
    const out = applyGovernedCategoryOverride({ rowIndex: 0, baseRowResult: base, override: ovr });
    expect(out).toEqual(base);
  });
});
