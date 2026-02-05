const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

import type { CartDto } from '../types/cart'

/** Get current user's cart with product details (requires auth, buyer). */
export async function getCart(): Promise<CartDto> {
  const res = await fetch(`${API_BASE_URL}/cart`, { headers: getAuthHeaders() })
  if (!res.ok) {
    if (res.status === 401) return { items: [] }
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to get cart: ${res.statusText}`)
  }
  const data = await res.json()
  return {
    id: data.id,
    userId: data.userId,
    items: data.items ?? [],
    updatedAt: data.updatedAt,
  }
}

/** Add product to cart (requires auth, buyer). */
export async function addToCart(productId: string, quantity: number = 1): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to add to cart: ${res.statusText}`)
  }
}

/** Update cart item quantity; use 0 to remove (requires auth, buyer). */
export async function updateCartQuantity(productId: string, quantity: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to update cart: ${res.statusText}`)
  }
}

/** Remove item from cart (requires auth, buyer). */
export async function removeFromCart(productId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to remove from cart: ${res.statusText}`)
  }
}

/** Clear entire cart (requires auth, buyer). */
export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to clear cart: ${res.statusText}`)
  }
}

/** Event name for header to listen to refresh cart count */
export const CART_UPDATED_EVENT = 'iox-cart-updated'

/** Call after add/update/remove cart so the header badge updates. */
export function emitCartUpdated(): void {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}
