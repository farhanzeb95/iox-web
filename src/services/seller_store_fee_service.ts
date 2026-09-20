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

export async function getSellerStoreFees(): Promise<SellerStoreFee[]> {
  const response = await authFetch(`${API_BASE_URL}/seller-fees`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Failed to load seller fees')
  }
  return (data as { fees?: SellerStoreFee[] }).fees ?? []
}

export async function reviewSellerStoreFee(
  feeId: string,
  status: 'PAID' | 'REJECTED',
  note = '',
): Promise<SellerStoreFee> {
  const response = await authFetch(`${API_BASE_URL}/seller-fees/${feeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Failed to review seller fee')
  }
  return (data as { fee: SellerStoreFee }).fee
}
