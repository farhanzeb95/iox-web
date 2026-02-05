<script setup lang="ts">
import { computed } from 'vue'
import BuyerDashboard from './BuyerDashboard.vue'
import BusinessSellerDashboard from './BusinessSellerDashboard.vue'
import PrivateSellerDashboard from './PrivateSellerDashboard.vue'
import AdminDashboard from './AdminDashboard.vue'
import { decodeToken } from '../utils/jwt'
import { UserTypes } from '../types/user_types'

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
</script>

<template>
  <div class="dashboard-layout">
    <component :is="dashboardComponent" />
  </div>
</template>