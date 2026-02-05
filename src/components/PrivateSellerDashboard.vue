<script setup lang="ts">
import StatCard from "./shared/StatCard.vue";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import ProductAddEditSidebar from './sidebars/ProductAddEditSidebar.vue'
import { OnyxButton, OnyxLoadingIndicator, OnyxTable, OnyxHeadline } from 'sit-onyx'
import { iconCash, iconClipboard, iconTimer, iconList } from '@sit-onyx/icons'
import type { Product } from '../types/product'
import type { OrderDto } from '../types/order'
import { formatPricePKR } from '../utils/format'
import { getMyOrders } from '../services/order_service'

const router = useRouter()
const sellerOrders = ref<OrderDto[]>([])

const stats = ref([
  { title: "Today's Sales", value: formatPricePKR(0), icon: iconCash },
  { title: "New Orders", value: 0, icon: iconClipboard },
  { title: "Pending Orders", value: 0, icon: iconTimer },
  { title: "Listed Items", value: 0, icon: iconList },
]);

function updateStatsFromData(orders: OrderDto[], productCount: number) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let todaySales = 0
  let newOrdersCount = 0
  let pendingOrdersCount = 0
  for (const o of orders) {
    const created = o.createdAt ? new Date(o.createdAt) : null
    if (created && created >= todayStart) todaySales += o.subTotal ?? 0
    if (created && created >= sevenDaysAgo) newOrdersCount += 1
    if (o.status === 'PENDING') pendingOrdersCount += 1
  }

  stats.value = [
    { title: "Today's Sales", value: formatPricePKR(todaySales), icon: iconCash },
    { title: "New Orders", value: newOrdersCount, icon: iconClipboard },
    { title: "Pending Orders", value: pendingOrdersCount, icon: iconTimer },
    { title: "Listed Items", value: productCount, icon: iconList },
  ]
}

const sidebarOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)

const loadProducts = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'}/products/my-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }
    const sellerProducts = await res.json()
    products.value = sellerProducts
    const orders = await getMyOrders().catch(() => [] as OrderDto[])
    sellerOrders.value = orders
    updateStatsFromData(orders, sellerProducts.length)
  } catch (error) {
    console.error('Error loading products:', error)
    const orders = await getMyOrders().catch(() => [] as OrderDto[])
    sellerOrders.value = orders
    updateStatsFromData(orders, products?.value?.length)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})

const openAddProductSideBar = () => {
  editingProduct.value = null
  sidebarOpen.value = true
}

const openEditProduct = (product: Product) => {
  editingProduct.value = product
  sidebarOpen.value = true
}

const saveProduct = async () => {
  await loadProducts()
  sidebarOpen.value = false
}

const productThumb = (product: Product) => product.images?.[0] ?? ''
const formatPrice = (p: number) => formatPricePKR(p)
const stockLabel = (product: Product) =>
  product.quantity != null
    ? (product.quantity > 0 ? 'In stock' : 'Out of stock')
    : '–'

function orderSummary(o: OrderDto): string {
  if (!o.items?.length) return 'No items'
  if (o.items.length === 1) return o.items[0]?.title ?? 'Item'
  return `${o.items.length} items`
}

function goToOrder(order: OrderDto) {
  router.push(`/orders/${order.id}`)
}
</script>

<template>
  <div class="dashboard">
    <div class="stats">
      <StatCard v-for="s in stats" :key="s.title" :title="s.title" :value="s.value" :icon="s.icon" />
    </div>

    <OnyxLoadingIndicator v-if="loading" />
    <div v-else-if="products?.length === 0" class="empty-state">
      <p>No products listed yet. Add your first product!</p>
      <OnyxButton label="Add Product" @click="openAddProductSideBar" />
    </div>
    <div v-else class="table-section">
      <OnyxTable>
        <template #headline>
          <OnyxHeadline is="h2">Listed Products</OnyxHeadline>
        </template>
        <template #actions>
          <OnyxButton label="Add new Product" @click="openAddProductSideBar" />
        </template>
        <template #head>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Stock</th>
            <th>Condition</th>
          </tr>
        </template>
        <template #default>
          <tr
            v-for="(product, index) in products"
            :key="product._id || product.id || index"
            class="table-row--clickable"
            role="button"
            tabindex="0"
            @click="openEditProduct(product)"
            @keydown.enter="openEditProduct(product)"
            @keydown.space.prevent="openEditProduct(product)"
          >
            <td>
              <img v-if="productThumb(product)" :src="productThumb(product)" :alt="product.title" class="thumb" />
              <div v-else class="thumb thumb-placeholder">No image</div>
            </td>
            <td>{{ product.title || product.name || '–' }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>{{ product.quantity ?? '–' }}</td>
            <td>{{ stockLabel(product) }}</td>
            <td>{{ product.condition || '–' }}</td>
          </tr>
        </template>
      </OnyxTable>
    </div>

    <div class="table-section orders-section">
      <OnyxTable>
        <template #headline>
          <OnyxHeadline is="h2">Recent Orders</OnyxHeadline>
        </template>
        <template #actions>
          <OnyxButton label="Return requests" density="compact" @click="router.push('/returns')" />
        </template>
        <template #head>
          <tr>
            <th>Order ID</th>
            <th>Summary</th>
            <th>Status</th>
          </tr>
        </template>
        <template #default>
          <tr v-if="sellerOrders.length === 0">
            <td colspan="3" class="empty-cell">No orders yet.</td>
          </tr>
          <tr
            v-for="o in sellerOrders"
            :key="o.id"
            class="table-row--clickable"
            role="button"
            tabindex="0"
            @click="goToOrder(o)"
            @keydown.enter="goToOrder(o)"
            @keydown.space.prevent="goToOrder(o)"
          >
            <td>#{{ o.id.slice(-8) }}</td>
            <td>{{ orderSummary(o) }}</td>
            <td>{{ o.status }}</td>
          </tr>
        </template>
      </OnyxTable>
    </div>
  </div>

    <!-- SIDEBAR -->
    <ProductAddEditSidebar
    :isOpen="sidebarOpen"
    :mode="editingProduct ? 'edit' : 'add'"
    :product="editingProduct"
    @close="sidebarOpen = false"
    @save="saveProduct"
  />
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
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

.orders-section .empty-cell {
  padding: 16px;
  color: var(--onyx-color-base-text-secondary);
}

.table-section :deep(.thumb) {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}

.table-section :deep(.thumb-placeholder) {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--onyx-color-text-icons-neutral-soft);
  background: var(--onyx-color-base-background-subtle);
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--onyx-color-text-icons-neutral-medium);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
</style>
