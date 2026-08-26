/**
 * Intent: Date-of-birth helpers shared by the onboarding sheet and the
 * Account edit screen.
 * Why: Both surfaces render the same three-column DOB wheel with the same
 * 18+ rule; one module keeps month names and date maths identical.
 */
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function isAtLeast18(year: number, month: number, day: number): boolean {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return new Date(year, month - 1, day) <= cutoff;
}

export function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
