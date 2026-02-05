<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getOrder, updateOrderStatus, requestReturn } from '../services/order_service'
  import { getMyReturns } from '../services/returns_service'
  import type { OrderDto, ShippingAddress } from '../types/order'
  import { decodeToken } from '../utils/jwt'
  import { UserTypes } from '../types/user_types'
  import { OnyxHeadline, OnyxButton, OnyxLoadingIndicator, OnyxInput } from 'sit-onyx'
  import { formatPricePKR } from '../utils/format'

  const route = useRoute()
  const router = useRouter()
  const order = ref<OrderDto | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const statusActionLoading = ref(false)
  const statusError = ref<string | null>(null)

  const orderId = computed(() => (route.params.id as string) ?? '')

  const userType = computed(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return ''
    return decodeToken(token)?.type ?? ''
  })
  const isBuyer = computed(() => userType.value === UserTypes.Buyer)
  const isSeller = computed(() =>
    userType.value === UserTypes.PrivateSeller || userType.value === UserTypes.BusinessSeller
  )

  const canCancel = computed(() => isBuyer.value && order.value?.status === 'PENDING')
  const canConfirm = computed(() => isSeller.value && order.value?.status === 'PENDING')
  const canMarkShipped = computed(() => isSeller.value && order.value?.status === 'CONFIRMED')
  const canMarkDelivered = computed(() => isSeller.value && order.value?.status === 'SHIPPED')

  const returnRequested = ref(false)
  const returnReason = ref('')
  const returnSubmitting = ref(false)
  const returnError = ref<string | null>(null)
  const canRequestReturn = computed(
    () => isBuyer.value && order.value?.status === 'DELIVERED' && !returnRequested.value
  )

  function formatAddress(addr: ShippingAddress | undefined): string {
    if (!addr) return '–'
    const parts = [addr.City, addr.State, addr.Zip, addr.Country].filter(Boolean)
    return parts.length ? parts.join(', ') : '–'
  }

  async function loadOrder() {
    if (!orderId.value) {
      error.value = 'Order ID missing'
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      order.value = await getOrder(orderId.value)
      if (order.value && isBuyer.value && order.value.status === 'DELIVERED') {
        const returns = await getMyReturns().catch(() => [])
        returnRequested.value = returns.some((r) => r.orderId === order.value?.id)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load order'
      order.value = null
    } finally {
      loading.value = false
    }
  }

  async function submitReturn() {
    if (!orderId.value) return
    returnSubmitting.value = true
    returnError.value = null
    try {
      await requestReturn(orderId.value, returnReason.value.trim() || 'No reason provided')
      returnRequested.value = true
      returnReason.value = ''
    } catch (e) {
      returnError.value = e instanceof Error ? e.message : 'Failed to request return'
    } finally {
      returnSubmitting.value = false
    }
  }

  async function setStatus(newStatus: string) {
    if (!orderId.value) return
    statusActionLoading.value = true
    statusError.value = null
    try {
      order.value = await updateOrderStatus(orderId.value, newStatus)
    } catch (e) {
      statusError.value = e instanceof Error ? e.message : 'Failed to update status'
    } finally {
      statusActionLoading.value = false
    }
  }

  onMounted(loadOrder)
  watch(orderId, loadOrder)

  const goBack = () => router.push('/dashboard')
</script>

<template>
  <div class="order-detail-page">
    <OnyxHeadline is="h1" class="page-title">Order details</OnyxHeadline>
    <p v-if="loading" class="loading"><OnyxLoadingIndicator /> Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="order">
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Order #{{ order.id.slice(-8) }}</span>
          <span class="order-status">{{ order.status }}</span>
        </div>
        <p class="seller-line">Seller: {{ order.sellerName }}</p>

        <h2 class="section-title">Items</h2>
        <ul class="order-items">
          <li v-for="line in order.items" :key="line.productId" class="order-item">
            <img v-if="line.imageUrl" :src="line.imageUrl" :alt="line.title" class="item-image" />
            <span class="item-placeholder" v-else>No image</span>
            <div class="item-info">
              <span class="item-title">{{ line.title }}</span>
              <span class="item-meta">{{ formatPricePKR(line.price) }} × {{ line.quantity }}</span>
            </div>
            <span class="item-total">{{ formatPricePKR(line.price * line.quantity) }}</span>
          </li>
        </ul>
        <div class="order-subtotal">Subtotal: {{ formatPricePKR(order.subTotal) }}</div>

        <h2 class="section-title">Shipping address</h2>
        <p class="shipping-address">{{ formatAddress(order.shippingAddress) }}</p>

        <h2 class="section-title">Payment</h2>
        <p class="payment-method">{{ order.paymentMethod }}</p>

        <div v-if="canRequestReturn" class="actions return-section">
          <h2 class="section-title">Request return</h2>
          <p v-if="returnError" class="status-error">{{ returnError }}</p>
          <OnyxInput v-model="returnReason" label="Reason (optional)" placeholder="e.g. Defective item" class="return-reason" />
          <OnyxButton label="Submit return request" density="compact" :disabled="returnSubmitting" @click="submitReturn" />
        </div>
        <p v-else-if="returnRequested" class="return-requested">Return requested for this order.</p>

        <div v-if="canCancel || canConfirm || canMarkShipped || canMarkDelivered" class="actions">
          <p v-if="statusError" class="status-error">{{ statusError }}</p>
          <div class="action-buttons">
            <OnyxButton
              v-if="canCancel"
              label="Cancel order"
              density="compact"
              @click="setStatus('CANCELLED')"
              :disabled="statusActionLoading"
            />
            <OnyxButton
              v-if="canConfirm"
              label="Mark Ready to Ship"
              density="compact"
              @click="setStatus('CONFIRMED')"
              :disabled="statusActionLoading"
            />
            <OnyxButton
              v-if="canMarkShipped"
              label="Mark Shipped"
              density="compact"
              @click="setStatus('SHIPPED')"
              :disabled="statusActionLoading"
            />
            <OnyxButton
              v-if="canMarkDelivered"
              label="Mark Delivered"
              density="compact"
              @click="setStatus('DELIVERED')"
              :disabled="statusActionLoading"
            />
          </div>
        </div>
      </div>
      <OnyxButton label="Back to dashboard" class="back-btn" @click="goBack" />
    </template>
  </div>
</template>

<style scoped>
  .order-detail-page {
    width: 100%;
    padding: 24px 20px;
    min-height: 100%;
    max-width: 700px;
    margin: 0 auto;
  }

  .page-title {
    margin-bottom: 24px;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--onyx-color-base-text-secondary);
  }

  .error {
    color: var(--onyx-color-base-text-critical);
    margin-bottom: 16px;
  }

  .order-card {
    padding: 20px;
    border: 1px solid var(--onyx-color-base-border-subtle);
    border-radius: 8px;
    background: var(--onyx-color-base-background-subtle);
    margin-bottom: 24px;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .order-id {
    font-weight: 600;
  }

  .order-status {
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  .seller-line {
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
    margin: 0 0 16px;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 16px 0 8px;
  }

  .section-title:first-of-type {
    margin-top: 0;
  }

  .order-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .order-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .order-item:last-child {
    border-bottom: none;
  }

  .item-image {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 4px;
  }

  .item-placeholder {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--onyx-color-base-background-hover);
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--onyx-color-base-text-secondary);
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-title {
    display: block;
    font-weight: 500;
  }

  .item-meta {
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
  }

  .item-total {
    font-weight: 600;
  }

  .order-subtotal {
    margin-top: 12px;
    font-weight: 600;
  }

  .shipping-address,
  .payment-method {
    margin: 0;
    font-size: 0.9375rem;
  }

  .actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--onyx-color-base-border-subtle);
  }

  .status-error {
    color: var(--onyx-color-base-text-critical);
    font-size: 0.875rem;
    margin: 0 0 8px;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .return-section .return-reason {
    max-width: 320px;
    margin-bottom: 8px;
  }

  .return-requested {
    margin: 16px 0 0;
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
  }

  .back-btn {
    margin-top: 8px;
  }
</style>
