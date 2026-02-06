import { type PropRecommendation, type OfferedProp } from '../types';

export function normalizePropType(propType: string): string {
  return propType.toLowerCase().trim();
}

export function matchesOfferedProp(
  recommendation: PropRecommendation,
  offeredProp: OfferedProp
): boolean {
  return (
    normalizePropType(recommendation.propType) === normalizePropType(offeredProp.propType) &&
    recommendation.threshold === offeredProp.threshold
  );
}

export function formatPropLabel(propType: string, threshold: number): string {
  const formatted = propType.charAt(0).toUpperCase() + propType.slice(1);
  return `${formatted} ${threshold}+`;
}
