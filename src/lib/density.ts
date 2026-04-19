export const DENSE_THRESHOLD = 7;
export const COMPACT_THRESHOLD = 8;

export function densityClass(count: number): '' | 'quadrant__list--dense' | 'quadrant__list--compact' {
  if (count >= COMPACT_THRESHOLD) return 'quadrant__list--compact';
  if (count >= DENSE_THRESHOLD) return 'quadrant__list--dense';
  return '';
}
