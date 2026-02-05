<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getCart, updateCartQuantity, removeFromCart, emitCartUpdated } from '../services/cart_service'
  import type { CartDto, CartItemDto } from '../types/cart'
  import { OnyxHeadline, OnyxButton, OnyxLoadingIndicator, OnyxSelect } from 'sit-onyx'
  import { formatPricePKR } from '../utils/format'

  const router = useRouter()
  const cart = ref<CartDto | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const updatingId = ref<string | null>(null)

  async function loadCart() {
    loading.value = true
    error.value = null
    try {
      cart.value = await getCart()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load cart'
      cart.value = { items: [] }
    } finally {
      loading.value = false
    }
  }

  const items = computed(() => cart.value?.items ?? [])
  const totalItems = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal = computed(() =>
    items.value.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0)
  )
  const isEmpty = computed(() => items.value.length === 0)

  function quantityOptions(item: CartItemDto) {
    const max = Math.min(item.quantityAvailable ?? 99, 99)
    return Array.from({ length: max }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
  }

  async function onQuantityChange(item: CartItemDto, newQty: number) {
    if (newQty === item.quantity) return
    updatingId.value = item.productId
    try {
      await updateCartQuantity(item.productId, newQty)
      await loadCart()
      emitCartUpdated()
    } catch (e) {
      console.error('Update cart failed:', e)
    } finally {
      updatingId.value = null
    }
  }

  async function onRemove(item: CartItemDto) {
    updatingId.value = item.productId
    try {
      await removeFromCart(item.productId)
      await loadCart()
      emitCartUpdated()
    } catch (e) {
      console.error('Remove failed:', e)
    } finally {
      updatingId.value = null
    }
  }

  function goToCheckout() {
    router.push('/checkout')
  }

  onMounted(loadCart)
</script>

<template>
  <div class="cart-page">
    <OnyxHeadline is="h1" class="page-title">Shopping Cart</OnyxHeadline>
    <OnyxLoadingIndicator v-if="loading" />
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="isEmpty">
      <p class="empty">Your cart is empty.</p>
      <OnyxButton label="Browse products" @click="router.push('/products-view')" />
    </template>
    <template v-else>
      <div class="cart-content">
        <ul class="cart-list">
          <li v-for="item in items" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img
                v-if="item.images?.length"
                :src="item.images[0]"
                :alt="item.title"
              />
              <div v-else class="no-image">No image</div>
            </div>
            <div class="item-details">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-seller">Sold by {{ item.seller || 'Unknown' }}</p>
              <p class="item-price">{{ formatPricePKR(item.price) }} × {{ item.quantity }}</p>
              <div class="item-actions">
                <OnyxSelect
                  :model-value="item.quantity"
                  label="Qty"
                  list-label="Quantity"
                  :options="quantityOptions(item)"
                  :disabled="updatingId === item.productId"
                  @update:model-value="(v: number | string) => onQuantityChange(item, Number(v))"
                />
                <OnyxButton
                  label="Remove"
                  appearance="outline"
                  :disabled="updatingId === item.productId"
                  @click="onRemove(item)"
                />
              </div>
            </div>
            <div class="item-line-total">
              {{ formatPricePKR((item.price ?? 0) * item.quantity) }}
            </div>
          </li>
        </ul>
        <div class="cart-summary">
          <p class="summary-line">
            <span>Items ({{ totalItems }})</span>
            <span>{{ formatPricePKR(subtotal) }}</span>
          </p>
          <OnyxButton
            class="checkout-btn"
            label="Proceed to Checkout"
            @click="goToCheckout"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .cart-page {
    width: 100%;
    padding: 24px 20px;
    min-height: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-title {
    margin-bottom: 24px;
  }

  .error {
    color: var(--onyx-color-base-text-danger);
    padding: 16px 0;
  }

  .empty {
    padding: 40px 0;
    color: var(--onyx-color-base-text-secondary);
  }

  .cart-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cart-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 16px;
    align-items: start;
    padding: 16px 0;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .item-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--onyx-color-base-background-subtle);
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-image .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--onyx-color-base-text-secondary);
  }

  .item-details {
    min-width: 0;
  }

  .item-title {
    margin: 0 0 4px;
    font-size: 1rem;
  }

  .item-seller,
  .item-price {
    margin: 0 0 8px;
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
  }

  .item-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 8px;
  }

  .item-line-total {
    font-weight: 600;
    white-space: nowrap;
  }

  .cart-summary {
    padding: 16px;
    background: var(--onyx-color-base-background-subtle);
    border-radius: 8px;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    margin: 0 0 16px;
    font-size: 1rem;
  }

  .checkout-btn {
    width: 100%;
  }
</style>
