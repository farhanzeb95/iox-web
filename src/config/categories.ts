/**
 * Predefined categories for Daraz-style browsing.
 * Used on the homepage "Shop by category" and on the Products page filter.
 */
export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports & Outdoors',
  'Books & Stationery',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Baby & Kids',
  'Groceries',
] as const

export type Category = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}
