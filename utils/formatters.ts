export function formatCurrency(amount: number, symbol: string = '£'): string {
  if (isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${Math.abs(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function formatMonth(yyyyMM: string): string {
  try {
    const [year, month] = yyyyMM.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return yyyyMM;
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
