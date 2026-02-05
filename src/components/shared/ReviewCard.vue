<script setup lang="ts">
  import { computed } from 'vue'
  import type { Review } from '../../types/review'
  import StarRating from './StarRating.vue'

  const props = defineProps<{
    review: Review
  }>()

  const commentText = computed(() => {
    const r = props.review as Record<string, unknown>
    const raw = r?.comment ?? r?.Comment ?? ''
    return typeof raw === 'string' ? raw.trim() : ''
  })

  function formatDate(iso?: string) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
</script>

<template>
  <article class="review-card">
    <div class="review-card__header">
      <StarRating :rating="review.rating" :size="16" readonly />
      <span class="review-card__author">{{ review.author }}</span>
      <span v-if="review.createdAt" class="review-card__date">{{ formatDate(review.createdAt) }}</span>
    </div>
    <p class="review-card__comment">{{ commentText || '—' }}</p>
  </article>
</template>

<style scoped>
  .review-card {
    padding: 14px 0;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .review-card:last-child {
    border-bottom: none;
  }

  .review-card__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .review-card__author {
    font-weight: 600;
    font-size: 14px;
    color: var(--onyx-color-base-text);
  }

  .review-card__date {
    font-size: 13px;
    color: var(--onyx-color-base-text-secondary);
  }

  .review-card__comment {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--onyx-color-base-text);
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
