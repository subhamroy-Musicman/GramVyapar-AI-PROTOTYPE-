
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPreviewCurrency(amount: number): string {
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return formatCurrency(amount);
  
  if (Math.abs(amount) >= 100000000) { // >= 10 Crores
    const cr = amount / 10000000;
    const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(cr);
    return `₹${formatted} Cr`;
  }
  
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    maximumFractionDigits: 1
  }).format(value);
}
