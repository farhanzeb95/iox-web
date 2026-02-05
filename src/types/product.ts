export type Product = {
  _id?: string // MongoDB ObjectID
  id?: string
  title: string
  name?: string // Alias for title
  description: string
  price: number
  quantity: number
  isAvailable: boolean
  images: Array<string>
  category?: string
  seller?: string
  sellerId?: string
  sellerName?: string
  sku?: string
  condition?: string
  tags?: Array<string>
  views?: number
  rating?: number
  reviewCount?: number
  /** Number of units sold (if provided by API) */
  soldCount?: number
  createdAt?: string
  updatedAt?: string
}