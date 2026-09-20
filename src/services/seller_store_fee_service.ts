import { API_BASE_URL } from '../config/api'
import { authFetch } from '../utils/authFetch'
import type { SellerFeePaymentMethod, SellerStoreFeeResponse, SellerStoreFee } from '../types/seller_store_fee'

export async function getMySellerStoreFee(): Promise<SellerStoreFeeResponse> {
  const response = await authFetch(`${API_BASE_URL}/seller-fees/me`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Failed to load store fee')
  }
  return data as SellerStoreFeeResponse
}

export async function submitSellerStoreFee(
  paymentMethod: SellerFeePaymentMethod,
  paymentReference: string,
): Promise<SellerStoreFee> {
  const response = await authFetch(`${API_BASE_URL}/seller-fees`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod, paymentReference }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Failed to submit store fee')
  }
  return (data as { fee: SellerStoreFee }).fee
}
