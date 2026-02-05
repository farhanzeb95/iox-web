<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue'
  import type { Product } from '../../types/product';
  import { getProductById } from '../../services/products_service';
  import { addToCart, emitCartUpdated } from '../../services/cart_service'
  import { useRoute, useRouter } from 'vue-router';
  import { OnyxButton, OnyxIcon, OnyxTag } from 'sit-onyx';
  import { iconCircleCheck, iconCircleBlock, iconTruck, iconArchiveUndo } from '@sit-onyx/icons';
  import { formatPricePKR } from '../../utils/format';
  import ProductReviews from './ProductReviews.vue';

  const route = useRoute()
  const router = useRouter()
  const productId = route.params.id as string
  const product = ref<Product | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const selectedImageIndex = ref(0)
  const quantity = ref(1)
  const cartBusy = ref(false)
  const cartMessage = ref<string | null>(null)

  onMounted(async () => {
    try {
      loading.value = true
      product.value = await getProductById(productId)
      if (!product.value) {
        error.value = 'Product not found'
      }
    } catch (err) {
      error.value = 'Failed to load product details'
      console.error('Error loading product:', err)
    } finally {
      loading.value = false
    }
  })

  const productImages = computed(() => product.value?.images ?? [])
  const hasImages = computed(() => productImages.value.length > 0)
  const mainImage = computed(() =>
    hasImages.value ? productImages.value[selectedImageIndex.value] : null
  )
  const productName = computed(() => product.value?.name || product.value?.title || 'Untitled Product')
  const inStock = computed(() => (product.value?.quantity ?? 0) > 0)

  const productIdForCart = computed(() => product.value?.id ?? product.value?._id ?? productId)

  async function handleAddToCart() {
    const id = productIdForCart.value
    if (!id || cartBusy.value || !inStock.value) return
    cartMessage.value = null
    cartBusy.value = true
    try {
      await addToCart(id, quantity.value)
      emitCartUpdated()
      cartMessage.value = 'Added to cart'
      setTimeout(() => { cartMessage.value = null }, 2000)
    } catch (e) {
      cartMessage.value = e instanceof Error ? e.message : 'Failed to add to cart'
    } finally {
      cartBusy.value = false
    }
  }

  async function handleBuyNow() {
    const id = productIdForCart.value
    if (!id || cartBusy.value || !inStock.value) return
    cartMessage.value = null
    cartBusy.value = true
    try {
      await addToCart(id, quantity.value)
      emitCartUpdated()
      router.push('/checkout')
    } catch (e) {
      cartMessage.value = e instanceof Error ? e.message : 'Failed to add to cart'
    } finally {
      cartBusy.value = false
    }
  }
  </script>
  
  <template>
    <div class="product-details-wrapper">
      <div v-if="loading" class="loading">Loading product details...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else-if="product">
        <!-- TOP: Two-column section (images + add to cart) -->
        <div class="product-details">
          <div class="images-col">
            <div class="main-image">
              <img v-if="mainImage" :src="mainImage" :alt="productName"/>
              <div v-else class="no-image">No image</div>
            </div>
            <div v-if="productImages.length > 1" class="thumbnails">
              <img
                v-for="(img, i) in productImages"
                :key="i"
                :src="img"
                :alt="`${productName} ${i + 1}`"
                :class="{ active: i === selectedImageIndex }"
                @click="selectedImageIndex = i"
              />
            </div>
          </div>

          <div class="offer-col">
          <!-- Category tag -->
          <div v-if="product.category" class="category-tag-wrap">
            <OnyxTag color="primary" :label="product.category" />
          </div>
          <h1 class="title">{{ productName }}</h1>

          <!-- Price -->
          <div class="price-row">
            <span class="price">{{ formatPricePKR(product.price) }}</span>
            <span v-if="product.condition" class="condition-text">({{ product.condition }})</span>
          </div>

          <!-- Delivery & availability box (Amazon-style) -->
          <div class="delivery-box">
            <p class="delivery-line">
              <OnyxIcon :icon="iconTruck" size="16px" color="currentColor" class="delivery-icon" />
              <span><strong>FREE delivery</strong> in 3–5 days</span>
            </p>
            <p class="delivery-line stock-line" :class="inStock ? 'in-stock' : 'out-of-stock'">
              <OnyxIcon
                :icon="inStock ? iconCircleCheck : iconCircleBlock"
                size="12px"
                color="currentColor"
                class="stock-icon"
              />
              {{ inStock ? (product.quantity === 1 ? '1 item left' : `${product.quantity} in stock`) : 'Out of stock' }}
            </p>
          </div>

          <!-- Quantity + Add to Cart / Buy Now (aligned on one row) -->
          <div class="purchase-row">
            <!-- <div v-if="inStock" class="qty-wrap">
              <span class="qty-label">Quantity:</span>
              <OnyxSelect
                v-model="quantity"
                label="Quantity"
                list-label="Quantity"
                :options="quantityOptions"
                class="qty-select"
              />
            </div> -->
            <div class="action-buttons">
              <OnyxButton
                label="Add to Cart"
                :disabled="!product.isAvailable || !inStock || cartBusy"
                @click="handleAddToCart"
              />
              <OnyxButton
                label="Buy Now"
                appearance="outline"
                :disabled="!product.isAvailable || !inStock || cartBusy"
                @click="handleBuyNow"
              />
            </div>
            <p v-if="cartMessage" class="cart-message">{{ cartMessage }}</p>
          </div>

          <!-- Sold by -->
          <p class="sold-by">
            Sold by
            <router-link v-if="product.sellerId" :to="`/seller/${product.sellerId}`" class="seller-link">
              <strong>{{ product.sellerName || product.seller || 'Unknown Seller' }}</strong>
            </router-link>
            <strong v-else>{{ product.sellerName || product.seller || 'Unknown Seller' }}</strong>
          </p>

          <!-- Returns -->
          <p class="returns-line">
            <OnyxIcon :icon="iconArchiveUndo" size="16px" color="currentColor" class="returns-icon" />
            7-day return policy
          </p>
          </div>
        </div>

        <!-- BOTTOM: Full-width product description (aligned with above section) -->
        <section class="about-section">
          <div class="about-section-inner">
            <h2 class="about-heading">About this item</h2>
            <div class="about-box">
              <p class="about-text">{{ product.description || 'No description available' }}</p>
            </div>
          </div>
        </section>

        <!-- Reviews section -->
        <section class="reviews-section">
          <div class="about-section-inner">
            <ProductReviews
              :product-id="productId"
              :average-rating="product.rating"
              :review-count-from-product="product.reviewCount"
            />
          </div>
        </section>
      </template>
    </div>
  </template>
  
  <style scoped>
  .product-details-wrapper {
    width: 100%;
    min-height: 100%;
    padding: 24px 20px 24px;
  }

  .product-details {
    display: grid;
    grid-template-columns: 0.45fr 0.55fr;
    gap: 48px;
    max-width: 1280px;
    margin: 0 auto;
    padding: 10px 24px;
    align-items: start;
  }

  @media (max-width: 968px) {
    .product-details {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 20px;
    }
  }

  /* LEFT: Images */
  .images-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: 100px;
  }

  .main-image {
    width: 100%;
    max-height: 480px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--onyx-color-base-background-subtle);
    border: 1px solid var(--onyx-color-base-border-subtle);
  }

  .main-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .main-image .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--onyx-color-text-icons-neutral-soft);
    font-size: 16px;
    background: var(--onyx-color-base-background-subtle);
  }

  .thumbnails {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .thumbnails img {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    cursor: pointer;
    object-fit: cover;
    border: 2px solid var(--onyx-color-base-border-subtle);
    transition: border-color 0.2s;
    background: var(--onyx-color-base-background-subtle);
  }

  .thumbnails img:hover {
    border-color: var(--onyx-color-base-border-medium);
  }

  .thumbnails img.active {
    border-color: var(--onyx-color-base-border-strong);
    box-shadow: 0 0 0 1px var(--onyx-color-base-border-strong);
  }

  /* RIGHT: Offer & info */
  .offer-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .category-tag-wrap {
    margin: 0;
    display: flex;
    align-items: center;
  }

  .title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--onyx-color-base-text);
  }

  .price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  .price {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--onyx-color-base-text);
  }

  .condition-text {
    font-size: 14px;
    color: var(--onyx-color-base-text-secondary);
    text-transform: capitalize;
  }

  /* Delivery & availability box (Amazon-style) */
  .delivery-box {
    border: 1px solid var(--onyx-color-base-border-subtle);
    border-radius: 8px;
    background: var(--onyx-color-base-background-subtle);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .delivery-line {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--onyx-color-base-text);
  }

  .delivery-icon,
  .stock-icon,
  .returns-icon {
    flex-shrink: 0;
  }

  .stock-line.in-stock {
    color: var(--onyx-color-semantic-success);
    font-weight: 600;
  }

  .stock-line.out-of-stock {
    color: var(--onyx-color-semantic-danger);
    font-weight: 600;
  }

  /* Quantity + buttons – aligned on same row */
  .purchase-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }

  .qty-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .qty-label {
    font-size: 14px;
    color: var(--onyx-color-base-text);
    white-space: nowrap;
  }

  .qty-select {
    width: 72px;
  }

  .action-buttons {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .cart-message {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--onyx-color-base-text-success);
  }

  .sold-by {
    margin: 0;
    font-size: 13px;
    color: var(--onyx-color-base-text-secondary);
  }

  .seller-link {
    color: var(--onyx-color-base-primary);
    text-decoration: none;
  }

  .seller-link:hover {
    text-decoration: underline;
  }

  .returns-line {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--onyx-color-base-text-secondary);
  }

  /* About this item – full width, aligned with grid above */
  .about-section {
    width: 100%;
    margin-top: 0;
    padding: 32px 0 0;
    border-top: 1px solid var(--onyx-color-base-border-subtle);
  }

  .about-section-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  @media (max-width: 968px) {
    .about-section-inner {
      padding: 0 20px;
    }
  }

  .about-heading {
    margin: 0 0 10px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--onyx-color-base-text);
  }

  .about-box {
    max-height: 220px;
    overflow-y: auto;
    border-radius: 6px;
    background: var(--onyx-color-base-background-subtle);
    border: 1px solid var(--onyx-color-base-border-subtle);
  }

  .about-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--onyx-color-base-text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .reviews-section {
    width: 100%;
    margin-top: 0;
    padding: 32px 0 0;
    border-top: 1px solid var(--onyx-color-base-border-subtle);
  }

  .loading, .error {
    text-align: center;
    padding: 60px;
    font-size: 18px;
  }

  .error {
    color: var(--onyx-color-semantic-danger);
  }
  </style>
  