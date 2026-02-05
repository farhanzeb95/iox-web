const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

import type { ShippingAddress, OrderDto } from '../types/order'
import type { OrderReturnDto } from '../types/return'

/** Place order from cart; creates one order per seller (requires auth, buyer). */
export async function placeOrder(
  shippingAddress: ShippingAddress,
  paymentMethod: string
): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ shippingAddress, paymentMethod }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to place order: ${res.statusText}`)
  }
  const data = await res.json()
  return data.orders ?? []
}

/** Get my orders: buyer sees orders they placed, seller sees orders for them (requires auth). */
export async function getMyOrders(): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to get orders: ${res.statusText}`)
  }
  const data = await res.json()
  return data.orders ?? []
}

/** Get a single order by ID (buyer or seller of that order; requires auth). */
export async function getOrder(id: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to get order: ${res.statusText}`)
  }
  const data = await res.json()
  return data.order
}

/** Update order status (seller: CONFIRMED/SHIPPED/DELIVERED; buyer/seller: CANCELLED when PENDING). */
export async function updateOrderStatus(orderId: string, status: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to update status: ${res.statusText}`)
  }
  const data = await res.json()
  return data.order
}

/** Request a return for a delivered order (buyer only). */
export async function requestReturn(orderId: string, reason: string): Promise<OrderReturnDto> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/return`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to request return: ${res.statusText}`)
  }
  const data = await res.json()
  return data.return
}
