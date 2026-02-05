/**
 * Format price in PKR (Pakistani Rupee).
 * Use for all product and sales amounts in the app.
 */
export function formatPricePKR(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '–'
  return `Rs. ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
