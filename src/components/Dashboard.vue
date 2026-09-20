<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import BuyerDashboard from './BuyerDashboard.vue'
import BusinessSellerDashboard from './BusinessSellerDashboard.vue'
import PrivateSellerDashboard from './PrivateSellerDashboard.vue'
import AdminDashboard from './AdminDashboard.vue'
import { decodeToken } from '../utils/jwt'
import { UserTypes } from '../types/user_types'
import { getCurrentUser } from '../services/users_service'
import type { User } from '../services/users_service'

const currentUser = ref<User | null>(null)
const dashboardComponent = computed(() => {
  const token = localStorage.getItem('authToken')
  if (!token) return BuyerDashboard
  const userType = decodeToken(token)?.type
  switch (userType) {
    case UserTypes.Admin:
      return AdminDashboard
    case UserTypes.BusinessSeller:
      return BusinessSellerDashboard
    case UserTypes.PrivateSeller:
      return PrivateSellerDashboard
    default:
      return BuyerDashboard
  }
})

const isSellerDashboard = computed(
  () =>
    dashboardComponent.value === BusinessSellerDashboard ||
    dashboardComponent.value === PrivateSellerDashboard
)
const isInReview = computed(() => currentUser.value?.status === 'IN_REVIEW')

async function loadUser() {
  if (!isSellerDashboard.value) return
  currentUser.value = await getCurrentUser()
}

onMounted(loadUser)
watch(dashboardComponent, loadUser)
</script>

<template>
  <div class="dashboard-layout">
    <div v-if="isSellerDashboard && isInReview" class="in-review-banner">
      Your seller account is under review. We will notify you once it is approved. You can still sign in and view this page.
    </div>
    <component :is="dashboardComponent" />
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.in-review-banner {
  padding: 14px 20px;
  margin: 16px 20px 0;
  background: var(--onyx-color-base-background-warning-subtle);
  border: 1px solid var(--onyx-color-base-border-warning);
  border-radius: 8px;
  color: var(--onyx-color-base-text-warning);
  font-size: 0.9375rem;
}
</style>