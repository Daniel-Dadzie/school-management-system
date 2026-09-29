export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatMoneyMinor(value: number): string {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value / 100);
}
