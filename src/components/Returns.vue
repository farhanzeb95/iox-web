<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getMyReturns, updateReturnStatus } from '../services/returns_service'
  import type { OrderReturnDto } from '../types/return'
  import { decodeToken } from '../utils/jwt'
  import { UserTypes } from '../types/user_types'
  import { OnyxHeadline, OnyxButton, OnyxLoadingIndicator, OnyxTable } from 'sit-onyx'

  const router = useRouter()
  const returns = ref<OrderReturnDto[]>([])
  const loading = ref(true)
  const updatingId = ref<string | null>(null)

  const isSeller = computed(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return false
    const t = decodeToken(token)?.type
    return t === UserTypes.PrivateSeller || t === UserTypes.BusinessSeller
  })

  async function loadReturns() {
    try {
      returns.value = await getMyReturns()
    } catch {
      returns.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadReturns)

  async function setReturnStatus(r: OrderReturnDto, status: string) {
    updatingId.value = r.id
    try {
      await updateReturnStatus(r.id, status)
      await loadReturns()
    } finally {
      updatingId.value = null
    }
  }

  function goToOrder(orderId: string) {
    router.push(`/orders/${orderId}`)
  }
</script>

<template>
  <div class="returns-page">
    <OnyxHeadline is="h1" class="page-title">{{ isSeller ? 'Return requests' : 'My returns' }}</OnyxHeadline>
    <p v-if="loading" class="loading"><OnyxLoadingIndicator /> Loading…</p>
    <div v-else-if="returns.length === 0" class="empty">No return requests.</div>
    <div v-else class="table-section">
      <OnyxTable>
        <template #head>
          <tr>
            <th>Order ID</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Requested</th>
            <th v-if="isSeller">Actions</th>
          </tr>
        </template>
        <template #default>
          <tr
            v-for="r in returns"
            :key="r.id"
            class="table-row--clickable"
            role="button"
            tabindex="0"
            @click="!isSeller ? goToOrder(r.orderId) : null"
            @keydown.enter="!isSeller ? goToOrder(r.orderId) : null"
            @keydown.space.prevent="!isSeller ? goToOrder(r.orderId) : null"
          >
            <td @click.stop="goToOrder(r.orderId)">#{{ r.orderId.slice(-8) }}</td>
            <td>{{ r.reason || '–' }}</td>
            <td>{{ r.status }}</td>
            <td>{{ new Date(r.requestedAt).toLocaleDateString() }}</td>
            <td v-if="isSeller" @click.stop>
              <template v-if="r.status === 'PENDING'">
                <OnyxButton
                  label="Approve"
                  density="compact"
                  :disabled="updatingId === r.id"
                  @click="setReturnStatus(r, 'APPROVED')"
                />
                <OnyxButton
                  label="Reject"
                  density="compact"
                  :disabled="updatingId === r.id"
                  @click="setReturnStatus(r, 'REJECTED')"
                />
              </template>
              <span v-else>–</span>
            </td>
          </tr>
        </template>
      </OnyxTable>
    </div>
  </div>
</template>

<style scoped>
  .returns-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 20px 100px;
  }
  .page-title {
    margin-bottom: 24px;
  }
  .loading,
  .empty {
    padding: 24px 0;
  }
  .empty {
    color: var(--onyx-color-base-text-secondary);
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
</style>
