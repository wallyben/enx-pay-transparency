import type {
  CategoryAssignmentRowResult,
  EqualValueMemberKey,
  EqualValueRuleset,
  JobNormalizationRowResult,
  NormalizedJobShape,
} from '@enx/contracts';
import { CategoryAssignmentBasis, CategoryAssignmentStatus } from '@enx/contracts';
import { canonicalJsonStringify, deterministicCategoryId } from './deterministic-category-id';

function memberMatchesRow(member: EqualValueMemberKey, normalized: NormalizedJobShape): boolean {
  const pairs: readonly (readonly [keyof EqualValueMemberKey, string | null])[] = [
    ['familyCodeNormalized', normalized.familyCodeNormalized],
    ['subfamilyCodeNormalized', normalized.subfamilyCodeNormalized],
    ['gradeOrLevelNormalized', normalized.gradeOrLevelNormalized],
    ['titleNormalized', normalized.titleNormalized],
  ];
  for (const [key, rowVal] of pairs) {
    if (member[key] === undefined) continue;
    const expected = member[key] as string;
    if (rowVal === null || rowVal.length === 0) return false;
    if (rowVal !== expected) return false;
  }
  return true;
}

function memberSortKey(member: EqualValueMemberKey): string {
  return canonicalJsonStringify(member);
}

/**
 * Deterministic first match: groups ordered by `groupKey`, members ordered by canonical member key.
 */
export function findEqualValueGroupKey(
  normalized: NormalizedJobShape,
  ruleset: EqualValueRuleset,
): string | null {
  const sortedGroups = [...ruleset.groups].sort((a, b) => a.groupKey.localeCompare(b.groupKey));
  for (const group of sortedGroups) {
    const sortedMembers = [...group.members].sort((a, b) => memberSortKey(a).localeCompare(memberSortKey(b)));
    for (const member of sortedMembers) {
      if (memberMatchesRow(member, normalized)) return group.groupKey;
    }
  }
  return null;
}

export function tryEqualValueCategoryAssignment(input: {
  readonly row: JobNormalizationRowResult;
  readonly base: CategoryAssignmentRowResult;
  readonly equalValueRuleset: EqualValueRuleset;
  readonly categoryEngineRulesVersion: string;
}): CategoryAssignmentRowResult | null {
  if (input.base.status === CategoryAssignmentStatus.ASSIGNED) return null;
  if (input.row.issues.length > 0) return null;

  const groupKey = findEqualValueGroupKey(input.row.descriptor.normalized, input.equalValueRuleset);
  if (groupKey === null) return null;

  const categoryId = deterministicCategoryId({
    categoryEngineRulesVersion: input.categoryEngineRulesVersion,
    basis: 'EQUAL_VALUE',
    keyPayload: {
      groupKey,
      equalValueMethodologyVersion: input.equalValueRuleset.methodologyVersion,
      equalValueRulesVersion: input.equalValueRuleset.rulesVersion,
    },
  });

  return {
    ...input.base,
    status: CategoryAssignmentStatus.ASSIGNED,
    traceability: {
      ...input.base.traceability,
      equalValueMethodologyVersion: input.equalValueRuleset.methodologyVersion,
      equalValueRulesVersion: input.equalValueRuleset.rulesVersion,
    },
    categoryId,
    basis: CategoryAssignmentBasis.EQUAL_VALUE,
    issues: [],
    metricsCalculationBlocked: false,
    equalValueGroupKey: groupKey,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };
}
