export type Review = {
  id?: string
  productId?: string
  author: string
  rating: number // 1-5
  /** Review text (API may send as "comment" or "Comment") */
  comment?: string
  createdAt?: string
}

export type ReviewsResponse = {
  reviews: Review[]
}
