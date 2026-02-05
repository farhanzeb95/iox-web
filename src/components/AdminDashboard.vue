<script setup lang="ts">
import StatCard from './shared/StatCard.vue'
import { ref, onMounted, computed } from 'vue'
import { OnyxLoadingIndicator, OnyxTable, OnyxHeadline } from 'sit-onyx'
import { iconUserGroup, iconStore, iconCheck } from '@sit-onyx/icons'
import { getUsers } from '../services/users_service'
import type { User } from '../services/users_service'

const users = ref<User[]>([])
const loading = ref(true)

const stats = computed(() => {
  const total = users.value.length
  const sellers = users.value.filter(
    (u) => u.Type === 'PRIVATE_SELLER' || u.Type === 'BUSINESS_SELLER'
  ).length
  return [
    { title: 'Total Users', value: total, icon: iconUserGroup },
    { title: 'Total Sellers', value: sellers, icon: iconStore },
    { title: 'Orders Today', value: '–', icon: iconCheck },
  ]
})

function fullName(u: User) {
  return [u.FirstName, u.LastName].filter(Boolean).join(' ') || '–'
}

function roleLabel(type: string) {
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    BUYER: 'Buyer',
    PRIVATE_SELLER: 'Private Seller',
    BUSINESS_SELLER: 'Business Seller',
  }
  return map[type] ?? type ?? '–'
}

async function loadUsers() {
  loading.value = true
  try {
    users.value = await getUsers()
  } catch (e) {
    console.error('Error loading users:', e)
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="dashboard">
    <div class="stats">
      <StatCard
        v-for="s in stats"
        :key="s.title"
        :title="s.title"
        :value="s.value"
        :icon="s.icon"
      />
    </div>

    <OnyxLoadingIndicator v-if="loading" />
    <div v-else-if="users.length === 0" class="empty-state">
      <p>No users found.</p>
    </div>
    <div v-else class="table-section">
      <OnyxTable>
        <template #headline>
          <OnyxHeadline is="h2">Users</OnyxHeadline>
        </template>
        <template #head>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </template>
        <template #default>
          <tr v-for="(u, index) in users" :key="u.id || index">
            <td>{{ fullName(u) }}</td>
            <td>{{ u.Email || '–' }}</td>
            <td>{{ roleLabel(u.Type) }}</td>
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
  padding: 100px 50px 100px 50px;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--onyx-color-text-icons-neutral-medium);
}
</style>
