<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getCart, emitCartUpdated } from '../services/cart_service'
  import { placeOrder } from '../services/order_service'
  import type { CartDto } from '../types/cart'
  import type { ShippingAddress } from '../types/order'
  import { PAYMENT_METHODS } from '../types/order'
  import { OnyxHeadline, OnyxButton, OnyxInput, OnyxLoadingIndicator } from 'sit-onyx'
  import { formatPricePKR } from '../utils/format'

  const router = useRouter()
  const cart = ref<CartDto | null>(null)
  const loading = ref(true)
  const placing = ref(false)
  const error = ref<string | null>(null)

  const address = ref<ShippingAddress>({
    City: '',
    State: '',
    Zip: '',
    Country: 'Pakistan',
  })
  const paymentMethod = ref<string>('COD')

  async function loadCart() {
    loading.value = true
    error.value = null
    try {
      cart.value = await getCart()
      if (!cart.value?.items?.length) {
        router.replace('/cart')
        return
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load cart'
      cart.value = { items: [] }
    } finally {
      loading.value = false
    }
  }

  const items = computed(() => cart.value?.items ?? [])
  const subtotal = computed(() =>
    items.value.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0)
  )
  const isEmpty = computed(() => items.value.length === 0)

  async function onPlaceOrder() {
    if (isEmpty.value) return
    const addr = address.value
    if (!addr.City?.trim()) {
      error.value = 'Please enter city'
      return
    }
    placing.value = true
    error.value = null
    try {
      const orders = await placeOrder(
        {
          City: addr.City?.trim(),
          State: addr.State?.trim(),
          Zip: addr.Zip?.trim(),
          Country: addr.Country?.trim() || 'Pakistan',
        },
        paymentMethod.value
      )
      emitCartUpdated()
      const ids = orders.map((o) => o.id).join(',')
      await router.replace({ path: '/order-confirmation', query: { orders: ids } })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to place order'
    } finally {
      placing.value = false
    }
  }

  onMounted(loadCart)
</script>

<template>
  <div class="checkout-page">
    <OnyxHeadline is="h1" class="page-title">Checkout</OnyxHeadline>
    <OnyxLoadingIndicator v-if="loading" />
    <p v-else-if="error && !placing" class="error">{{ error }}</p>
    <template v-else-if="!isEmpty">
      <div class="checkout-content">
        <section class="section shipping">
          <h2 class="section-title">Shipping address</h2>
          <div class="form-row">
            <OnyxInput
              v-model="address.City"
              label="City"
              placeholder="City"
              required
            />
            <OnyxInput
              v-model="address.State"
              label="State / Province"
              placeholder="State"
            />
          </div>
          <div class="form-row">
            <OnyxInput
              v-model="address.Zip"
              label="ZIP / Postal code"
              placeholder="ZIP"
            />
            <OnyxInput
              v-model="address.Country"
              label="Country"
              placeholder="Country"
            />
          </div>
        </section>

        <section class="section payment">
          <h2 class="section-title">Payment method</h2>
          <div class="payment-options">
            <label
              v-for="opt in PAYMENT_METHODS"
              :key="opt.value"
              class="payment-option"
            >
              <input
                v-model="paymentMethod"
                type="radio"
                :value="opt.value"
                name="payment"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </section>

        <section class="section summary">
          <h2 class="section-title">Order summary</h2>
          <ul class="summary-list">
            <li v-for="item in items" :key="item.productId" class="summary-item">
              <span>{{ item.title }} × {{ item.quantity }}</span>
              <span>{{ formatPricePKR((item.price ?? 0) * item.quantity) }}</span>
            </li>
          </ul>
          <p class="summary-total">
            <span>Total</span>
            <span>{{ formatPricePKR(subtotal) }}</span>
          </p>
          <p class="summary-note">
            One order will be created per seller. Each seller will receive their items separately.
          </p>
          <OnyxButton
            class="place-order-btn"
            label="Place order"
            :disabled="placing"
            @click="onPlaceOrder"
          />
          <p v-if="placing" class="placing">Placing order…</p>
          <p v-if="error && placing" class="error-inline">{{ error }}</p>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .checkout-page {
    width: 100%;
    padding: 24px 20px;
    min-height: 100%;
    max-width: 700px;
    margin: 0 auto;
  }

  .page-title {
    margin-bottom: 24px;
  }

  .error {
    color: var(--onyx-color-base-text-danger);
    padding: 16px 0;
  }

  .checkout-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .section-title {
    margin: 0 0 16px;
    font-size: 1.125rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .payment-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .payment-option input {
    margin: 0;
  }

  .summary-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .summary-total {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    margin: 16px 0;
  }

  .summary-note {
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
    margin: 0 0 16px;
  }

  .place-order-btn {
    width: 100%;
  }

  .placing,
  .error-inline {
    margin-top: 8px;
    font-size: 0.875rem;
  }

  .error-inline {
    color: var(--onyx-color-base-text-danger);
  }
</style>
