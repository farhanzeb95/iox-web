<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import ProductCard from './shared/ProductCard.vue'
  import { getWatchlist, removeFromWatchlist } from '../services/watchlist_service'
  import { getProductById } from '../services/products_service'
  import type { Product } from '../types/product'
  import { OnyxHeadline, OnyxLoadingIndicator } from 'sit-onyx'

  const products = ref<Product[]>([])
  const loading = ref(true)
  const watchlistIds = ref<string[]>([])

  async function loadWatchlist() {
    loading.value = true
    try {
      const ids = await getWatchlist()
      watchlistIds.value = ids
      const items = await Promise.all(ids.map((id) => getProductById(id)))
      products.value = items.filter((p): p is Product => p != null)
    } catch {
      products.value = []
      watchlistIds.value = []
    } finally {
      loading.value = false
    }
  }

  function isInWatchlist(product: Product): boolean {
    const id = product.id || product._id
    return id ? watchlistIds.value.includes(id) : false
  }

  async function onToggleWatchlist(product: Product) {
    const id = product.id || product._id
    if (!id) return
    try {
      await removeFromWatchlist(id)
      await loadWatchlist()
    } catch (e) {
      console.error('Remove from watchlist failed:', e)
    }
  }

  onMounted(loadWatchlist)
</script>

<template>
  <div class="watchlist-page">
    <OnyxHeadline is="h1" class="page-title">My Watchlist</OnyxHeadline>
    <OnyxLoadingIndicator v-if="loading" />
    <p v-else-if="products.length === 0" class="empty">Your watchlist is empty. Add items from the products page.</p>
    <div v-else class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product._id || product.id"
        :product="product"
        :in-watchlist="true"
        :show-watchlist="true"
        @toggle-watchlist="onToggleWatchlist(product)"
      />
    </div>
  </div>
</template>

<style scoped>
  .watchlist-page {
    width: 100%;
    padding: 24px 20px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-title {
    margin-bottom: 24px;
    width: 100%;
    max-width: 1200px;
  }

  .empty {
    padding: 40px;
    color: var(--onyx-color-base-text-secondary);
    text-align: center;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 1200px;
  }
</style>
