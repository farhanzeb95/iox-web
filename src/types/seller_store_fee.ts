export const SELLER_FEE_PAYMENT_METHODS = [
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'EASYPAISA', label: 'EasyPaisa' },
  { value: 'RAAST', label: 'Raast' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
] as const

export type SellerFeePaymentMethod = (typeof SELLER_FEE_PAYMENT_METHODS)[number]['value']

export type SellerStoreFee = {
  id: string
  sellerId: string
  amount: number
  paymentMethod: SellerFeePaymentMethod
  paymentReference: string
  status: 'PENDING' | 'PAID' | 'REJECTED'
  reviewNote?: string
  submittedAt: string
  reviewedAt?: string
  billingPeriodStart: string
  billingPeriodEnd: string
}

export type SellerStoreFeeResponse = {
  amount: number
  fee: SellerStoreFee | null
}
