<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Product } from '../../types/product'
  import { addToCart, emitCartUpdated } from '../../services/cart_service'
  import { OnyxCard, OnyxBadge, OnyxIconButton } from 'sit-onyx'
  import { iconCart, iconHeart } from '@sit-onyx/icons'
  import { formatPricePKR } from '../../utils/format'
  import StarRating from './StarRating.vue'

  const { product } = defineProps<{
    product: Product
    inWatchlist?: boolean
    /** Show buyer-only UI: rating, watchlist heart, and cart (only for buyers) */
    showWatchlist?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'toggle-watchlist'): void
  }>()

  const router = useRouter()
  const cartBusy = ref(false)
  const onProductClicked = () => {
    if (product.id || product._id) {
      router.push({
        name: 'product-details',
        params: { id: product.id || product._id }
      })
    }
  }

  const productImage = product.images?.[0] ?? null
  const productName = product.name || product.title || 'Untitled Product'
  const rating = product.rating ?? 0
  const reviewCount = product.reviewCount ?? 0
  const soldCount = product.soldCount ?? 0

  function onWatchlistClick(e: Event) {
    e.stopPropagation()
    emit('toggle-watchlist')
  }

  async function onAddToCart(e: Event) {
    e.stopPropagation()
    const id = product.id || product._id
    if (!id || cartBusy.value || !product.isAvailable || product.quantity === 0) return
    cartBusy.value = true
    try {
      await addToCart(id, 1)
      emitCartUpdated()
    } catch (err) {
      console.error('Add to cart failed:', err)
    } finally {
      cartBusy.value = false
    }
  }
</script>
  
  <template>
    <OnyxCard class="product-card" @click="onProductClicked">
      <div class="image-wrapper">
        <img
          v-if="productImage"
          :src="productImage"
          :alt="productName"
        />
        <div v-else class="no-image">No image</div>
      </div>
  
      <h3 class="title">{{ productName }}</h3>
      <p class="seller">Seller: {{ product.seller || 'Unknown' }}</p>
      <p class="price">{{ formatPricePKR(product.price) }}</p>
      <OnyxBadge v-if="product.quantity !== undefined" :color="product.quantity > 0 ? 'success' : 'danger'">
        {{ product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock' }}
      </OnyxBadge>

      <div v-if="showWatchlist" class="card-footer">
        <div class="card-actions-row">
          <span class="sold-tag">Sold: {{ soldCount }}</span>
          <div class="card-actions">
            <OnyxIconButton
              :icon="iconHeart"
              :label="inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
              :color="inWatchlist ? 'danger' : 'neutral'"
              class="watchlist-btn"
              aria-label="Watchlist"
              @click="onWatchlistClick"
            />
            <OnyxIconButton
              :icon="iconCart"
              label="Add to Cart"
              :disabled="!product.isAvailable || product.quantity === 0 || cartBusy"
              class="add-to-cart-btn"
              @click="onAddToCart"
            />
          </div>
        </div>
        <div class="reviews">
          <StarRating :rating="rating" :size="12" readonly />
          <span class="reviews-count">{{ reviewCount }} {{ reviewCount === 1 ? 'review' : 'reviews' }}</span>
        </div>
      </div>
    </OnyxCard>
  </template>
  
  <style scoped>
  .product-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .card-footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .sold-tag {
    font-size: 11px;
    color: var(--onyx-color-base-text-secondary);
    background: var(--onyx-color-base-background-subtle);
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .reviews {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .reviews-count {
    font-size: 11px;
    color: var(--onyx-color-base-text-secondary);
    white-space: nowrap;
  }

  .add-to-cart-btn {
    flex-shrink: 0;
  }

  .product-card:hover {
    transform: translateY(-2px);
  }
  
  .image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-height: 100px;
    overflow: hidden;
    border-radius: 6px;
    background: var(--onyx-color-base-background-subtle);
  }

  .watchlist-btn {
    flex-shrink: 0;
  }

  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-wrapper .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--onyx-color-text-icons-neutral-soft);
    font-size: 14px;
    background: var(--onyx-color-base-background-subtle);
  }
  
  .title {
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price {
    font-weight: 600;
    font-size: 14px;
    margin: 0;
  }

  .seller {
    margin: 0;
    font-size: 12px;
    color: var(--onyx-color-base-text-secondary);
  }
  </style>
  