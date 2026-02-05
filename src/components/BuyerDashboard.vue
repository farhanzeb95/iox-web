<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import StatCard from './shared/StatCard.vue'
  import { useRouter } from 'vue-router'
  import { OnyxButton, OnyxTable, OnyxHeadline, OnyxLoadingIndicator } from 'sit-onyx'
  import { iconCart, iconBox, iconHeart } from '@sit-onyx/icons'
  import { getWatchlist } from '../services/watchlist_service'
  import { getMyOrders } from '../services/order_service'
  import type { OrderDto } from '../types/order'

  const watchlistCount = ref(0)
  const orders = ref<OrderDto[]>([])
  const ordersLoading = ref(true)

  const activeCount = computed(() =>
    orders.value.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
  )
  const deliveredCount = computed(() => orders.value.filter((o) => o.status === 'DELIVERED').length)

  const stats = computed(() => [
    { title: 'Active Orders', value: activeCount.value, icon: iconCart },
    { title: 'Delivered Orders', value: deliveredCount.value, icon: iconBox },
    { title: 'Wishlist Items', value: watchlistCount.value, icon: iconHeart },
  ])

  function orderSummary(order: OrderDto): string {
    if (!order.items?.length) return 'No items'
    if (order.items.length === 1) return order.items[0]?.title ?? 'Item'
    return `${order.items.length} items`
  }

  onMounted(async () => {
    ordersLoading.value = true
    try {
      const [ids, orderList] = await Promise.all([getWatchlist(), getMyOrders()])
      watchlistCount.value = ids.length
      orders.value = orderList ?? []
    } catch {
      watchlistCount.value = 0
      orders.value = []
    } finally {
      ordersLoading.value = false
    }
  })

  const router = useRouter()

  const onBrowseProductsClick = () => {
    router.push('/products-view')
  }

  const onOrderRowClick = (order: OrderDto) => {
    router.push(`/orders/${order.id}`)
  }
</script>

<template>
  <div class="dashboard">
    <div class="stats">
      <StatCard v-for="s in stats" :key="s.title" v-bind="s" />
    </div>

    <div class="table-section">
      <OnyxTable>
        <template #headline>
          <OnyxHeadline is="h2">Recent Orders</OnyxHeadline>
        </template>
        <template #actions>
          <OnyxButton label="Browse Products" @click="onBrowseProductsClick" />
          <OnyxButton label="My returns" density="compact" @click="router.push('/returns')" />
        </template>
        <template #head>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Status</th>
          </tr>
        </template>
        <template #default>
          <tr v-if="ordersLoading">
            <td colspan="3" class="loading-cell"><OnyxLoadingIndicator /> Loading orders…</td>
          </tr>
          <tr v-else-if="!orders.length">
            <td colspan="3" class="empty-cell">No recent orders.</td>
          </tr>
          <tr
            v-else
            v-for="order in orders"
            :key="order.id"
            class="table-row--clickable"
            role="button"
            tabindex="0"
            @click="onOrderRowClick(order)"
            @keydown.enter="onOrderRowClick(order)"
            @keydown.space.prevent="onOrderRowClick(order)"
          >
            <td>#{{ order.id.slice(-8) }}</td>
            <td>{{ orderSummary(order) }}</td>
            <td>{{ order.status }}</td>
          </tr>
        </template>
      </OnyxTable>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 100px 50px 100px 50px; /* Top padding for header, bottom for footer */
  min-height: 100vh;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }
}

.table-section {
  width: 100%;
}

.table-section :deep(.table-row--clickable) {
  cursor: pointer;
}

.table-section :deep(.table-row--clickable:hover) {
  background: var(--onyx-color-base-background-hover);
}

.loading-cell,
.empty-cell {
  padding: 16px;
  color: var(--onyx-color-base-text-secondary);
}

.loading-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
