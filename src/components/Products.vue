<script setup lang="ts">
  import { ref, watch, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import ProductCard from './shared/ProductCard.vue'
  import { getProducts } from '../services/products_service'
  import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlist_service'
  import { decodeToken } from '../utils/jwt'
  import { UserTypes } from '../types/user_types'
  import type { Product } from '../types/product'
  import { CATEGORIES } from '../config/categories'
  import { OnyxHeadline, OnyxLoadingIndicator, OnyxInput, OnyxSelect } from 'sit-onyx'

  const route = useRoute()
  const products = ref<Product[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const watchlistIds = ref<string[]>([])

  const canUseWatchlist = computed(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return false
    const decoded = decodeToken(token)
    return decoded?.type === UserTypes.Buyer
  })

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ]

  // Filters
  const searchQuery = ref('')
  const categoryFilter = ref('')
  const conditionFilter = ref<string>('')
  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' },
  ]
  const minPrice = ref<number | null>(null)
  const maxPrice = ref<number | null>(null)
  const sortBy = ref('created_at:desc')

  const loadProducts = async () => {
    try {
      loading.value = true
      error.value = null
      const filters: any = {}
      if (searchQuery.value.trim()) filters.search = searchQuery.value.trim()
      if (categoryFilter.value) filters.category = categoryFilter.value
      if (conditionFilter.value) filters.condition = conditionFilter.value
      if (minPrice.value !== null && minPrice.value > 0) filters.minPrice = minPrice.value
      if (maxPrice.value !== null && maxPrice.value > 0) filters.maxPrice = maxPrice.value
      if (sortBy.value) filters.sortBy = sortBy.value

      const response = await getProducts(filters)
      products.value = response.products || []
    } catch (err) {
      error.value = 'Failed to load products'
      console.error('Error loading products:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    const qCategory = route.query.category
    if (typeof qCategory === 'string' && qCategory.trim() && (CATEGORIES as readonly string[]).includes(qCategory)) {
      categoryFilter.value = qCategory
    }
    await loadProducts()
    try {
      watchlistIds.value = await getWatchlist()
    } catch {
      watchlistIds.value = []
    }
  })

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
    } catch (e) {
      console.error('Watchlist toggle failed:', e)
    }
  }

  // Apply filters automatically when any filter value changes (debounced for text inputs)
  let filterDebounce: ReturnType<typeof setTimeout>
  watch(
    [searchQuery, categoryFilter, conditionFilter, minPrice, maxPrice],
    () => {
      clearTimeout(filterDebounce)
      filterDebounce = setTimeout(loadProducts, 300)
    },
    { deep: true }
  )
  </script>
  
  <template>
    <div class="products-page">
      <OnyxHeadline is="h1" class="page-title">All Products</OnyxHeadline>
      
      <!-- Filters -->
      <div class="filters">
        <div class="filter-field">
          <OnyxInput
            v-model="searchQuery"
            label="Search"
            placeholder="Search products..."
          />
        </div>
        <div class="filter-field">
          <OnyxSelect
            v-model="categoryFilter"
            label="Category"
            list-label="Product category"
            :options="categoryOptions"
          />
        </div>
        <div class="filter-field">
          <OnyxSelect
            v-model="conditionFilter"
            label="Condition"
            list-label="Product condition"
            :options="conditionOptions"
          />
        </div>
        <div class="filter-field">
          <OnyxInput
            v-model.number="minPrice"
            type="number"
            label="Min Price"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div class="filter-field">
          <OnyxInput
            v-model.number="maxPrice"
            type="number"
            label="Max Price"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>
  
      <OnyxLoadingIndicator v-if="loading" />
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="products.length === 0" class="empty">No products found</div>
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
  .products-page {
    width: 100%;
    padding: 40px 40px 100px 40px; /* Top padding for header, bottom for footer */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .page-title {
    margin-bottom: 32px;
    text-align: center;
    width: 100%;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 1400px;
  }

  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr minmax(100px, 1fr) minmax(100px, 1fr);
    align-items: end;
    gap: 16px;
    margin-bottom: 32px;
    background: var(--onyx-color-base-background-elevated);
    border-radius: 8px;
    width: 100%;
    max-width: 1400px;
  }

  @media (max-width: 900px) {
    .filters {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 500px) {
    .filters {
      grid-template-columns: 1fr;
    }
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    min-height: 72px;
    justify-content: flex-end;
  }

  .filter-field :deep(.onyx-form-element),
  .filter-field :deep(.onyx-input) {
    width: 100%;
  }

  .error, .empty {
    text-align: center;
    padding: 40px;
  }
  </style>
  