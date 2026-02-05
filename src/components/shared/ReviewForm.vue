<script setup lang="ts">
  import { ref, computed } from 'vue'
  import StarRating from './StarRating.vue'
  import { OnyxButton, OnyxTextarea } from 'sit-onyx'

  const props = defineProps<{
    productId: string
    submitLabel?: string
  }>()

  const emit = defineEmits<{
    (e: 'submitted'): void
  }>()

  const rating = ref(0)
  const comment = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const canSubmit = computed(() => rating.value >= 1 && rating.value <= 5)

  async function onSubmit() {
    if (!canSubmit.value || loading.value) return
    error.value = null
    loading.value = true
    try {
      const { createReview } = await import('../../services/reviews_service')
      await createReview(props.productId, {
        rating: rating.value,
        comment: comment.value.trim() || undefined,
      })
      rating.value = 0
      comment.value = ''
      emit('submitted')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to submit review'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <form class="review-form" @submit.prevent="onSubmit">
    <div class="review-form__row">
      <span class="review-form__label">Rating</span>
      <StarRating v-model:rating="rating" :max="5" :readonly="false" :size="24" />
    </div>
    <div class="review-form__row">
      <label class="review-form__label">Comment (optional)</label>
      <OnyxTextarea
        v-model="comment"
        placeholder="Write your review..."
        :rows="4"
        class="review-form__textarea"
      />
    </div>
    <p v-if="error" class="review-form__error">{{ error }}</p>
    <OnyxButton
      type="submit"
      :label="submitLabel || 'Submit review'"
      :disabled="!canSubmit || loading"
    />
  </form>
</template>

<style scoped>
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .review-form__row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .review-form__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--onyx-color-base-text);
  }

  .review-form__textarea {
    width: 100%;
  }

  .review-form__error {
    margin: 0;
    font-size: 14px;
    color: var(--onyx-color-semantic-danger);
  }
</style>
