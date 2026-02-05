<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import ProductCard from './shared/ProductCard.vue'
  import { getProducts } from '../services/products_service'
  import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlist_service'
  import { decodeToken } from '../utils/jwt'
  import { UserTypes } from '../types/user_types'
  import type { Product } from '../types/product'
  import { OnyxHeadline, OnyxLoadingIndicator } from 'sit-onyx'

  const route = useRoute()
  const products = ref<Product[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const watchlistIds = ref<string[]>([])

  const sellerId = computed(() => (route.params.sellerId as string) ?? '')
  const sellerName = computed(() => products.value[0]?.sellerName ?? products.value[0]?.seller ?? 'Seller')

  const canUseWatchlist = ref(false)

  async function loadProducts() {
    if (!sellerId.value) {
      error.value = 'Seller ID missing'
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await getProducts({ sellerId: sellerId.value })
      products.value = res.products ?? []
    } catch {
      error.value = 'Failed to load store'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      const decoded = decodeToken(token)
      canUseWatchlist.value = decoded?.type === UserTypes.Buyer
      if (canUseWatchlist.value) {
        try {
          watchlistIds.value = await getWatchlist()
        } catch {
          watchlistIds.value = []
        }
      }
    }
    await loadProducts()
  })
  watch(sellerId, loadProducts)

  function isInWatchlist(product: Product): boolean {
    const id = product.id || product._id
    return id ? watchlistIds.value.includes(id) : false
  }

  async function onToggleWatchlist(product: Product) {
    const id = product.id || product._id
    if (!id) return
    const inList = watchlistIds.value.includes(id)
    try {
      if (inList) {
        await removeFromWatchlist(id)
        watchlistIds.value = watchlistIds.value.filter((x) => x !== id)
      } else {
        await addToWatchlist(id)
        watchlistIds.value = [...watchlistIds.value, id]
      }
    } catch {
      // ignore
    }
  }
</script>

<template>
  <div class="seller-store-page">
    <OnyxHeadline is="h1" class="page-title">{{ sellerName }}’s store</OnyxHeadline>
    <p v-if="loading" class="loading"><OnyxLoadingIndicator /> Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="products.length === 0" class="empty">No products from this seller yet.</div>
    <div v-else class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product._id || product.id || Math.random()"
        :product="product"
        :in-watchlist="isInWatchlist(product)"
        :show-watchlist="canUseWatchlist"
        @toggle-watchlist="onToggleWatchlist(product)"
      />
    </div>
  </div>
</template>

<style scoped>
  .seller-store-page {
    width: 100%;
    padding: 40px 40px 100px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .page-title {
    margin-bottom: 24px;
    text-align: center;
    width: 100%;
  }
  .loading,
  .error,
  .empty {
    text-align: center;
    padding: 24px;
  }
  .error {
    color: var(--onyx-color-base-text-critical);
  }
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 1400px;
  }
</style>
