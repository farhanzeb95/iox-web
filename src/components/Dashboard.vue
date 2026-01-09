<script setup lang="ts">
  import { computed } from 'vue'
  import BuyerDashboard from './BuyerDashboard.vue'
  import SellerDashboard from './SellerDashboard.vue'
  import AdminDashboard from './AdminDashboard.vue'
  import { decodeToken } from '../utils/jwt'
  
  const dashboardComponent = computed(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return BuyerDashboard
    const userType = decodeToken(token)?.type
    switch (userType) {
      case 1:
        return AdminDashboard
      case 2:
        return SellerDashboard
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
  