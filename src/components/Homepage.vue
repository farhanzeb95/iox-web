<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import ProductCard from './shared/ProductCard.vue'
  import { getProducts } from '../services/products_service'
  import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlist_service'
  import { decodeToken } from '../utils/jwt'
  import { UserTypes } from '../types/user_types'
  import type { Product } from '../types/product'
  import { CATEGORIES } from '../config/categories'
  import { OnyxHeadline, OnyxLoadingIndicator } from 'sit-onyx'

  const router = useRouter()
  const featuredProducts = ref<Product[]>([])
  const featuredLoading = ref(true)

  const canUseWatchlist = ref(false)
  const watchlistIds = ref<string[]>([])

  onMounted(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        const decoded = decodeToken(token)
        canUseWatchlist.value = decoded?.type === UserTypes.Buyer
        if (canUseWatchlist.value) {
          watchlistIds.value = await getWatchlist()
        }
      }
    } catch {
      watchlistIds.value = []
    }

    try {
      const res = await getProducts({ sortBy: 'rating:desc', limit: 8 })
      featuredProducts.value = res.products ?? []
    } catch {
      featuredProducts.value = []
    } finally {
      featuredLoading.value = false
    }
  })

  function goToCategory(category: string) {
    router.push({ path: '/products-view', query: { category } })
  }

  function goToProducts() {
    router.push('/products-view')
  }

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
  <div class="homepage">
    <section class="hero">
      <div class="hero-content">
        <OnyxHeadline is="h1" class="hero-title">Welcome to IOX</OnyxHeadline>
        <p class="hero-subtitle">Shop the best deals across categories. Find what you need, sell what you don’t.</p>
        <button type="button" class="hero-cta" @click="goToProducts">Shop now</button>
      </div>
    </section>

    <section class="section shop-by-category">
      <OnyxHeadline is="h2" class="section-title">Shop by category</OnyxHeadline>
      <div class="category-grid">
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          type="button"
          class="category-tile"
          @click="goToCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <section class="section featured">
      <OnyxHeadline is="h2" class="section-title">Featured products</OnyxHeadline>
      <OnyxLoadingIndicator v-if="featuredLoading" />
      <div v-else-if="featuredProducts.length === 0" class="empty">No featured products yet.</div>
      <div v-else class="products-grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product._id || product.id || Math.random()"
          :product="product"
          :in-watchlist="isInWatchlist(product)"
          :show-watchlist="canUseWatchlist"
          @toggle-watchlist="onToggleWatchlist(product)"
        />
      </div>
      <button type="button" class="view-all-btn" @click="goToProducts">View all products</button>
    </section>
  </div>
</template>

<style scoped>
  .homepage {
    width: 100%;
    min-height: 100vh;
    padding-bottom: 100px;
  }

  .hero {
    background: linear-gradient(135deg, var(--onyx-color-base-background-elevated) 0%, var(--onyx-color-base-background-subtle) 100%);
    padding: 60px 24px;
    text-align: center;
    border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  }

  .hero-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .hero-title {
    margin-bottom: 12px;
  }

  .hero-subtitle {
    color: var(--onyx-color-base-text-secondary);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .hero-cta {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--onyx-color-base-text-inverse);
    background: var(--onyx-color-base-primary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .hero-cta:hover {
    opacity: 0.9;
  }

  .section {
    padding: 40px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-title {
    margin-bottom: 24px;
    text-align: center;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .category-tile {
    padding: 16px;
    font-size: 0.9375rem;
    font-weight: 500;
    text-align: center;
    background: var(--onyx-color-base-background-elevated);
    border: 1px solid var(--onyx-color-base-border-subtle);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .category-tile:hover {
    background: var(--onyx-color-base-background-hover);
    border-color: var(--onyx-color-base-border-strong);
  }

  .featured .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .empty {
    text-align: center;
    color: var(--onyx-color-base-text-secondary);
    padding: 24px;
  }

  .view-all-btn {
    display: block;
    margin: 0 auto;
    padding: 12px 24px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--onyx-color-base-primary);
    background: transparent;
    border: 2px solid var(--onyx-color-base-primary);
    border-radius: 8px;
    cursor: pointer;
  }

  .view-all-btn:hover {
    background: var(--onyx-color-base-background-hover);
  }
</style>
