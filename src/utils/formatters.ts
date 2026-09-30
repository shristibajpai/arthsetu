/**
 * Format a number as Indian Rupee currency (e.g. ₹1,00,000)
 * Safely handles 0, NaN, undefined, negative numbers.
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format large numbers in Lakhs / Crores for editorial displays
 */
export function formatLakhCrore(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}

/**
 * Clamp percentage to [0, 100] and return rounded number
 */
export function clampPercent(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Format date nicely in Indian standard (e.g. Nov 18, 2025)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
