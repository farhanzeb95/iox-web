<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { UserType } from '../services/users_service'
import { UserTypes } from '../types/user_types'
import { useTheme } from '../composables/useTheme'
import { OnyxBadge, OnyxIconButton, OnyxIcon } from 'sit-onyx'
import { iconCart, iconUser } from '@sit-onyx/icons'
import { getWatchlist } from '../services/watchlist_service'
import { getCart, CART_UPDATED_EVENT } from '../services/cart_service'
import { getCurrentUser } from '../services/users_service'
import type { User } from '../services/users_service'

const props = defineProps<{
  isLoggedIn: boolean
  userType: UserType
}>()

const emit = defineEmits(['logout'])
const router = useRouter()
const route = useRoute()
const { effectiveTheme, toggleTheme } = useTheme()
const cartCount = ref(0)
const watchlistCount = ref(0)
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const profile = ref<User | null>(null)

const isBuyer = computed(() => props.userType === UserTypes.Buyer)

const initials = computed(() => {
  const u = profile.value
  if (!u) return ''
  const first = (u.FirstName?.trim() || '')[0] || ''
  const last = (u.LastName?.trim() || '')[0] || ''
  return (first + last).toUpperCase() || '?'
})

async function fetchWatchlistCount() {
  if (!isBuyer.value) return
  const ids = await getWatchlist()
  watchlistCount.value = ids.length
}

async function fetchCartCount() {
  if (!isBuyer.value) return
  try {
    const cart = await getCart()
    const total = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
    cartCount.value = total
  } catch {
    cartCount.value = 0
  }
}

function closeDropdown() {
  dropdownOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

async function fetchProfile() {
  if (!props.isLoggedIn) {
    profile.value = null
    return
  }
  profile.value = await getCurrentUser()
}

onMounted(() => {
  fetchWatchlistCount()
  fetchCartCount()
  fetchProfile()
  window.addEventListener(CART_UPDATED_EVENT, fetchCartCount)
})

watch(dropdownOpen, (open) => {
  if (open) {
    setTimeout(() => document.addEventListener('click', onClickOutside), 0)
  } else {
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener(CART_UPDATED_EVENT, fetchCartCount)
})

watch(
  () => route.path,
  () => {
    fetchWatchlistCount()
    fetchCartCount()
    closeDropdown()
  }
)

watch(
  () => props.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) fetchProfile()
    else profile.value = null
  }
)

function handleLogoutClick() {
  emit('logout')
  closeDropdown()
  router.push('/login')
}

function handleLoginClick() {
  closeDropdown()
  router.push('/login')
}

function handleIconClick() {
  router.push(props.isLoggedIn && props.userType !== UserTypes.Buyer ? '/dashboard' : '/products-view')
}

function goToCart() {
  router.push('/cart')
  closeDropdown()
}

function goToWatchlist() {
  router.push('/watchlist')
  closeDropdown()
}

function goToProfile() {
  router.push('/profile')
  closeDropdown()
}

function onThemeClick() {
  toggleTheme()
  closeDropdown()
}
</script>

<template>
  <header class="top-header">
    <div class="header-content">
      <span class="logo-text" @click="handleIconClick">IOX</span>

      <div class="header-actions">
        <!-- Cart only: always visible for buyers, with count badge -->
        <div v-if="isBuyer" class="cart-button-wrapper">
          <OnyxIconButton
            :icon="iconCart"
            label="Shopping cart"
            color="neutral"
            @click="goToCart"
          />
          <span class="cart-count-badge" :aria-label="`${cartCount} items in cart`">{{ cartCount }}</span>
        </div>

        <!-- Profile avatar (circle): photo or initials, opens dropdown -->
        <div ref="dropdownRef" class="dropdown-wrap">
          <button
            type="button"
            class="avatar-trigger"
            aria-label="Account menu"
            @click="dropdownOpen = !dropdownOpen"
          >
            <img
              v-if="profile?.avatarUrl"
              :src="profile.avatarUrl"
              alt=""
              class="avatar-img"
            />
            <span v-else-if="initials" class="avatar-initials">{{ initials }}</span>
            <OnyxIcon v-else :icon="iconUser" size="24px" color="currentColor" class="avatar-icon" />
          </button>
          <div v-show="dropdownOpen" class="dropdown-panel">
            <template v-if="isLoggedIn">
              <button type="button" class="dropdown-item" @click="goToProfile">
                My Profile
              </button>
              <button
                v-if="isBuyer"
                type="button"
                class="dropdown-item"
                @click="goToWatchlist"
              >
                Watchlist
                <OnyxBadge v-if="watchlistCount > 0" class="item-badge" :label="String(watchlistCount)" />
              </button>
              <button type="button" class="dropdown-item" @click="onThemeClick">
                {{ effectiveTheme === 'dark' ? 'Light mode' : 'Dark mode' }}
              </button>
              <button type="button" class="dropdown-item dropdown-item--danger" @click="handleLogoutClick">
                Logout
              </button>
            </template>
            <template v-else>
              <button type="button" class="dropdown-item" @click="onThemeClick">
                {{ effectiveTheme === 'dark' ? 'Light mode' : 'Dark mode' }}
              </button>
              <button type="button" class="dropdown-item" @click="handleLoginClick">
                Login
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-header {
  height: var(--app-header-height, 64px);
  min-height: var(--app-header-height, 64px);
  padding: 0 24px;
  display: flex;
  align-items: center;
  background: var(--onyx-color-base-background);
  border-bottom: 1px solid var(--onyx-color-base-border-subtle);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  color: var(--onyx-color-base-text);
}

.cart-button-wrapper {
  position: relative;
  display: inline-flex;
}

.cart-count-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  color: #fff;
  background: var(--onyx-color-background-danger-default, #c00);
  border-radius: 10px;
  border: 2px solid var(--onyx-color-base-background);
  box-sizing: border-box;
  z-index: 1;
  pointer-events: none;
}

.dropdown-wrap {
  position: relative;
}

.avatar-trigger {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--onyx-color-base-border-subtle);
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--onyx-color-base-background-subtle);
  color: var(--onyx-color-base-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.avatar-trigger:hover {
  border-color: var(--onyx-color-base-border-strong);
  box-shadow: 0 0 0 2px var(--onyx-color-base-border-subtle);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}

.avatar-icon {
  flex-shrink: 0;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  padding: 8px 0;
  background: var(--onyx-color-base-background);
  background-color: var(--onyx-color-base-background);
  border: 1px solid var(--onyx-color-base-border-subtle);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--onyx-color-base-shadow);
  z-index: 10000;
  /* Fully opaque so content behind does not show through */
  opacity: 1;
}

[data-theme="light"] .dropdown-panel {
  background: #fff;
  background-color: #fff;
}

[data-theme="dark"] .dropdown-panel {
  background: #1c1c1e;
  background-color: #1c1c1e;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--onyx-color-base-text);
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--onyx-color-base-background-hover);
}

.dropdown-item--danger {
  color: var(--onyx-color-text-danger-intense);
}

.item-badge {
  margin-left: 8px;
  font-size: 11px;
}
</style>

<style>
[data-theme="light"] .top-header {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .top-header {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}
</style>
