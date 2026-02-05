<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      /** Rating value 0–5 (can be decimal for average) */
      rating: number
      /** Maximum stars to show */
      max?: number
      /** Display only (no hover/click) */
      readonly?: boolean
      /** Size in px */
      size?: number
    }>(),
    { max: 5, readonly: true, size: 18 }
  )

  const emit = defineEmits<{
    (e: 'update:rating', value: number): void
  }>()

  const fullStars = computed(() => Math.floor(props.rating))
  const hasHalf = computed(() => props.rating % 1 >= 0.5)
  const emptyStars = computed(() => props.max - fullStars.value - (hasHalf.value ? 1 : 0))

  function onStarClick(value: number) {
    if (!props.readonly) emit('update:rating', value)
  }
</script>

<template>
  <div class="star-rating" :class="{ 'star-rating--editable': !readonly }" role="img" :aria-label="`${rating} out of ${max} stars`">
    <template v-for="n in fullStars" :key="'full-' + n">
      <span class="star star--full" :style="{ fontSize: size + 'px' }" @click="onStarClick(n)">★</span>
    </template>
    <span v-if="hasHalf" class="star star--half" :style="{ fontSize: size + 'px' }" @click="onStarClick(fullStars + 1)">★</span>
    <template v-for="n in emptyStars" :key="'empty-' + n">
      <span class="star star--empty" :style="{ fontSize: size + 'px' }" @click="onStarClick(fullStars + (hasHalf ? 1 : 0) + n)">☆</span>
    </template>
  </div>
</template>

<style scoped>
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .star {
    color: var(--onyx-color-base-text-icons-neutral-soft);
    line-height: 1;
  }

  .star--full {
    color: var(--onyx-color-semantic-warning, #e6a800);
  }

  .star--half {
    color: var(--onyx-color-semantic-warning, #e6a800);
    opacity: 0.7;
  }

  .star-rating--editable .star {
    cursor: pointer;
  }

  .star-rating--editable .star:hover {
    color: var(--onyx-color-semantic-warning, #e6a800);
  }
</style>
