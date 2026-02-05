export type ShippingAddress = {
  City?: string
  State?: string
  Zip?: string
  Country?: string
}

export const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'EASYPAISA', label: 'EasyPaisa' },
  { value: 'CARD', label: 'Credit/Debit Card' },
] as const

export type OrderLineDto = {
  productId: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

export type OrderDto = {
  id: string
  buyerId?: string
  sellerId: string
  sellerName: string
  items: OrderLineDto[]
  subTotal: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress: ShippingAddress
  createdAt: string
}
