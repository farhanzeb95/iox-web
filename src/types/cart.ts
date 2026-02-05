export type CartItemDto = {
  productId: string
  quantity: number
  title?: string
  price?: number
  images?: string[]
  sellerId?: string
  seller?: string
  quantityAvailable?: number
}

export type CartDto = {
  id?: string
  userId?: string
  items: CartItemDto[]
  updatedAt?: string
}
