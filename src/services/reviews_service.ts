import type { Review, ReviewsResponse } from '../types/review'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`)
    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error(`Failed to fetch reviews: ${res.statusText}`)
    }
    const data: ReviewsResponse = await res.json()
    return data.reviews ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

/** Returns whether the current buyer can review this product (has a delivered order containing it). Auth required, buyer only. */
export async function getCanReviewProduct(productId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/can-review`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) return false
  const data = await res.json()
  return data.canReview === true
}

export type CreateReviewInput = {
  rating: number
  comment?: string
}

export async function createReview(
  productId: string,
  input: CreateReviewInput
): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      rating: input.rating,
      comment: input.comment || '',
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to submit review: ${res.statusText}`)
  }
  const data: Review = await res.json()
  return data
}
