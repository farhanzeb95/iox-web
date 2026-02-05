<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type { Review } from '../../types/review'
  import { getProductReviews, getCanReviewProduct } from '../../services/reviews_service'
  import { decodeToken } from '../../utils/jwt'
  import { UserTypes } from '../../types/user_types'
  import StarRating from './StarRating.vue'
  import ReviewCard from './ReviewCard.vue'
  import ReviewForm from './ReviewForm.vue'

  const props = defineProps<{
    productId: string
    /** Optional: average rating from product (e.g. product.rating) */
    averageRating?: number
    /** Optional: total count from product (e.g. product.reviewCount) */
    reviewCountFromProduct?: number
  }>()

  const reviews = ref<Review[]>([])
  const loading = ref(true)
  const canReview = ref(false)
  const canReviewLoading = ref(false)

  const isBuyer = computed(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return false
    const decoded = decodeToken(token)
    return decoded?.type === UserTypes.Buyer
  })

  /** Show review form only if buyer and has received this product (delivered order) */
  const canWriteReview = computed(() => isBuyer.value && canReview.value)

  const displayRating = computed(() => {
    if (reviews.value.length === 0) return props.averageRating ?? 0
    const sum = reviews.value.reduce((s, r) => s + r.rating, 0)
    return Math.round((sum / reviews.value.length) * 10) / 10
  })

  const displayCount = computed(() => {
    const fromList = reviews.value.length
    const fromProduct = props.reviewCountFromProduct ?? 0
    return Math.max(fromList, fromProduct)
  })

  async function loadReviews() {
    loading.value = true
    try {
      reviews.value = await getProductReviews(props.productId)
    } finally {
      loading.value = false
    }
  }

  async function loadCanReview() {
    if (!isBuyer.value || !props.productId) return
    canReviewLoading.value = true
    try {
      canReview.value = await getCanReviewProduct(props.productId)
    } catch {
      canReview.value = false
    } finally {
      canReviewLoading.value = false
    }
  }

  function onSubmitted() {
    loadReviews()
    canReview.value = false
  }

  onMounted(() => {
    loadReviews()
    loadCanReview()
  })
</script>

<template>
  <section class="product-reviews">
    <h2 class="product-reviews__title">Reviews</h2>
    <div class="product-reviews__summary">
      <StarRating :rating="displayRating" :size="20" readonly />
      <span class="product-reviews__count">{{ displayCount }} {{ displayCount === 1 ? 'review' : 'reviews' }}</span>
    </div>

    <div v-if="isBuyer && canReviewLoading" class="product-reviews__form product-reviews__muted">
      Checking if you can review…
    </div>
    <div v-else-if="isBuyer && !canReview" class="product-reviews__form product-reviews__muted">
      You can review this product after you receive your order.
    </div>
    <div v-else-if="canWriteReview" class="product-reviews__form">
      <h3 class="product-reviews__form-title">Write a review</h3>
      <ReviewForm :product-id="productId" submit-label="Submit review" @submitted="onSubmitted" />
    </div>

    <div v-if="loading" class="product-reviews__loading">Loading reviews...</div>
    <div v-else-if="reviews.length === 0" class="product-reviews__empty">No reviews yet. Be the first to review!</div>
    <div v-else class="product-reviews__list">
      <ReviewCard v-for="r in reviews" :key="r.id || r.createdAt + r.author" :review="r" />
    </div>
  </section>
</template>

<style scoped>
  .product-reviews {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--onyx-color-base-border-subtle);
  }

  .product-reviews__title {
    margin: 0 0 12px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--onyx-color-base-text);
  }

  .product-reviews__summary {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .product-reviews__count {
    font-size: 14px;
    color: var(--onyx-color-base-text-secondary);
  }

  .product-reviews__form {
    margin-bottom: 24px;
    border-radius: 8px;
    background: var(--onyx-color-base-background-subtle);
    border: 1px solid var(--onyx-color-base-border-subtle);
  }

  .product-reviews__muted {
    font-size: 14px;
    color: var(--onyx-color-base-text-secondary);
  }

  .product-reviews__form-title {
    margin: 0 0 12px 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--onyx-color-base-text);
  }

  .product-reviews__loading,
  .product-reviews__empty {
    font-size: 14px;
    color: var(--onyx-color-base-text-secondary);
    padding: 12px 0;
  }

  .product-reviews__list {
    display: flex;
    flex-direction: column;
  }
</style>
