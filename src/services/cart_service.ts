import { API_BASE_URL } from '../config/api'
import { authFetch } from '../utils/authFetch'
import type { CartDto } from '../types/cart'

/** Get current user's cart with product details (requires auth, buyer). */
export async function getCart(): Promise<CartDto> {
  const res = await authFetch(`${API_BASE_URL}/cart`)
  if (!res.ok) {
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
  const res = await authFetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to add to cart: ${res.statusText}`)
  }
}

/** Update cart item quantity; use 0 to remove (requires auth, buyer). */
export async function updateCartQuantity(productId: string, quantity: number): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/cart`, {
    method: 'PATCH',
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to update cart: ${res.statusText}`)
  }
}

/** Remove item from cart (requires auth, buyer). */
export async function removeFromCart(productId: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/cart/${productId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to remove from cart: ${res.statusText}`)
  }
}

/** Clear entire cart (requires auth, buyer). */
export async function clearCart(): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
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
