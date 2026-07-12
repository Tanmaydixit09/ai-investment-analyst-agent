/**
 * Formatting helpers, centralized here rather than duplicated at each
 * MetricCard call site in DashboardPage. Every function tolerates
 * null/undefined (returns a plain "—") since fundamentals fields can be
 * legitimately missing per company (see investmentScoringService on the
 * backend, which already treats missing metrics as "unknown," not "zero").
 */

const PLACEHOLDER = '—';

export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return PLACEHOLDER;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
      value
    );
  } catch {
    return `${value}`;
  }
}

export function formatMarketCap(value) {
  if (value === null || value === undefined) return PLACEHOLDER;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

export function formatPercent(fraction, { signed = false } = {}) {
  if (fraction === null || fraction === undefined) return PLACEHOLDER;
  const pct = fraction * 100;
  const sign = signed && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatRatio(value, suffix = '') {
  if (value === null || value === undefined) return PLACEHOLDER;
  return `${value.toFixed(2)}${suffix}`;
}

export function formatChange(change, changePercent) {
  if (change === null || change === undefined) return PLACEHOLDER;
  const sign = change > 0 ? '+' : '';
  const pct = changePercent !== null && changePercent !== undefined ? ` (${sign}${changePercent.toFixed(2)}%)` : '';
  return `${sign}${change.toFixed(2)}${pct}`;
}
