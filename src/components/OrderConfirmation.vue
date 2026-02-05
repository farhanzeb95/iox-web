<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getMyOrders } from '../services/order_service'
  import type { OrderDto } from '../types/order'
  import { OnyxHeadline, OnyxButton } from 'sit-onyx'
  import { formatPricePKR } from '../utils/format'

  const route = useRoute()
  const router = useRouter()
  const orders = ref<OrderDto[]>([])
  const loading = ref(true)

  const orderIdsQuery = computed(() => {
    const q = route.query.orders
    if (typeof q !== 'string') return []
    return q.split(',').filter(Boolean)
  })

  async function loadOrders() {
    loading.value = true
    try {
      const list = await getMyOrders()
      const ids = orderIdsQuery.value
      if (ids.length > 0) {
        orders.value = list.filter((o) => ids.includes(o.id))
        if (orders.value.length === 0) orders.value = list.slice(0, 10)
      } else {
        orders.value = list.slice(0, 10)
      }
    } catch {
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadOrders)
</script>

<template>
  <div class="confirmation-page">
    <OnyxHeadline is="h1" class="page-title">Order confirmation</OnyxHeadline>
    <p v-if="loading" class="loading">Loading…</p>
    <template v-else>
      <p class="success-message">Your orders have been placed successfully.</p>
      <p class="info-message">Each order is sent to the respective seller. You can track them below.</p>
      <div v-if="orders.length === 0" class="empty">No orders to show.</div>
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-id">Order #{{ order.id.slice(-8) }}</span>
            <span class="order-seller">Seller: {{ order.sellerName }}</span>
            <span class="order-status">{{ order.status }}</span>
          </div>
          <ul class="order-items">
            <li v-for="line in order.items" :key="line.productId" class="order-item">
              <span>{{ line.title }} × {{ line.quantity }}</span>
              <span>{{ formatPricePKR(line.price * line.quantity) }}</span>
            </li>
          </ul>
          <div class="order-footer">
            <span class="order-total">Subtotal: {{ formatPricePKR(order.subTotal) }}</span>
            <span class="order-payment">{{ order.paymentMethod }}</span>
          </div>
        </div>
      </div>
      <OnyxButton label="Back to products" class="back-btn" @click="router.push('/products-view')" />
    </template>
  </div>
</template>

<style scoped>
  .confirmation-page {
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
    color: var(--onyx-color-base-text-secondary);
  }

  .success-message {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .info-message {
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
    margin-bottom: 24px;
  }

  .empty {
    padding: 24px 0;
    color: var(--onyx-color-base-text-secondary);
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .order-card {
    padding: 16px;
    border: 1px solid var(--onyx-color-base-border-subtle);
    border-radius: 8px;
    background: var(--onyx-color-base-background-subtle);
  }

  .order-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .order-id {
    font-weight: 600;
  }

  .order-seller {
    font-size: 0.875rem;
    color: var(--onyx-color-base-text-secondary);
  }

  .order-status {
    margin-left: auto;
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  .order-items {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
  }

  .order-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 0.875rem;
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .order-total {
    font-weight: 600;
  }

  .back-btn {
    margin-top: 16px;
  }
</style>
