<script setup lang="ts">
import StatCard from './shared/StatCard.vue'
import { ref, onMounted, computed } from 'vue'
import { OnyxButton, OnyxLoadingIndicator, OnyxTable, OnyxHeadline } from 'sit-onyx'
import { iconUserGroup, iconStore, iconCheck } from '@sit-onyx/icons'
import { getUsers, updateSellerStatus } from '../services/users_service'
import type { User } from '../services/users_service'
import { getSellerStoreFees, reviewSellerStoreFee } from '../services/seller_store_fee_service'
import type { SellerStoreFee } from '../types/seller_store_fee'
import { formatPricePKR } from '../utils/format'
import { useToast } from '../composables/useToast'
import AppDialog from './shared/AppDialog.vue'

const users = ref<User[]>([])
const loading = ref(true)
const fees = ref<SellerStoreFee[]>([])
const feesLoading = ref(true)
const feeError = ref<string | null>(null)
const reviewingFeeId = ref<string | null>(null)
const toast = useToast()
const dialogOpen = ref(false)
const dialogFee = ref<SellerStoreFee | null>(null)
const dialogStatus = ref<'PAID' | 'REJECTED'>('PAID')

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

async function loadFees() {
  feesLoading.value = true
  feeError.value = null
  try {
    fees.value = await getSellerStoreFees()
  } catch (e) {
    feeError.value = e instanceof Error ? e.message : 'Failed to load seller fees'
  } finally {
    feesLoading.value = false
  }
}

async function setSellerStatus(user: User, status: 'ACTIVE' | 'REJECTED') {
  if (!user.id) return
  const result = await updateSellerStatus(user.id, status)
  if (result.error) {
    feeError.value = result.error
    return
  }
  const updatedUser = result.data
  if (updatedUser) {
    const index = users.value.findIndex((item) => item.id === updatedUser.id)
    if (index >= 0) users.value[index] = updatedUser
    toast.success('Seller status updated', `Seller is now ${status.toLowerCase()}.`)
  }
}

async function reviewFee(fee: SellerStoreFee, status: 'PAID' | 'REJECTED') {
  dialogFee.value = fee
  dialogStatus.value = status
  dialogOpen.value = true
}

async function submitFeeReview(note: string) {
  if (!dialogFee.value) return
  const fee = dialogFee.value
  const status = dialogStatus.value
  dialogOpen.value = false
  reviewingFeeId.value = fee.id
  feeError.value = null
  try {
    const updated = await reviewSellerStoreFee(fee.id, status, note)
    const index = fees.value.findIndex((item) => item.id === updated.id)
    if (index >= 0) fees.value[index] = updated
    toast.success(status === 'PAID' ? 'Fee approved' : 'Fee rejected', 'The seller fee review has been saved.')
  } catch (e) {
    feeError.value = e instanceof Error ? e.message : 'Failed to review seller fee'
    toast.error('Fee review failed', feeError.value)
  } finally {
    reviewingFeeId.value = null
  }
}

onMounted(() => {
  loadUsers()
  loadFees()
})
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </template>
        <template #default>
          <tr v-for="(u, index) in users" :key="u.id || index">
            <td>{{ fullName(u) }}</td>
            <td>{{ u.Email || '–' }}</td>
            <td>{{ roleLabel(u.Type) }}</td>
            <td>{{ u.status || '–' }}</td>
            <td class="actions">
              <template v-if="(u.Type === 'PRIVATE_SELLER' || u.Type === 'BUSINESS_SELLER') && u.status !== 'ACTIVE'">
                <OnyxButton label="Approve seller" density="compact" @click="setSellerStatus(u, 'ACTIVE')" />
              </template>
              <template v-if="(u.Type === 'PRIVATE_SELLER' || u.Type === 'BUSINESS_SELLER') && u.status !== 'REJECTED'">
                <OnyxButton label="Reject" density="compact" @click="setSellerStatus(u, 'REJECTED')" />
              </template>
            </td>
          </tr>
        </template>
      </OnyxTable>
    </div>

    <div class="table-section fee-section">
      <OnyxTable>
        <template #headline>
          <OnyxHeadline is="h2">Seller store fee submissions</OnyxHeadline>
        </template>
        <template #head>
          <tr>
            <th>Seller ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Reference</th>
            <th>Billing month</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </template>
        <template #default>
          <tr v-if="feesLoading">
            <td colspan="7"><OnyxLoadingIndicator /></td>
          </tr>
          <tr v-else-if="fees.length === 0">
            <td colspan="7" class="empty-cell">No seller fee submissions.</td>
          </tr>
          <tr v-for="fee in fees" v-else :key="fee.id">
            <td>{{ fee.sellerId.slice(-8) }}</td>
            <td>{{ formatPricePKR(fee.amount) }}</td>
            <td>{{ fee.paymentMethod }}</td>
            <td>{{ fee.paymentReference }}</td>
            <td>{{ fee.billingPeriodStart }}</td>
            <td>{{ fee.status }}</td>
            <td class="actions">
              <template v-if="fee.status === 'PENDING'">
                <OnyxButton
                  label="Approve"
                  density="compact"
                  :disabled="reviewingFeeId === fee.id"
                  @click="reviewFee(fee, 'PAID')"
                />
                <OnyxButton
                  label="Reject"
                  density="compact"
                  :disabled="reviewingFeeId === fee.id"
                  @click="reviewFee(fee, 'REJECTED')"
                />
              </template>
              <span v-else>{{ fee.reviewNote || 'Reviewed' }}</span>
            </td>
          </tr>
        </template>
      </OnyxTable>
      <p v-if="feeError" class="error">{{ feeError }}</p>
    </div>
  </div>
  <AppDialog
    :open="dialogOpen"
    :title="dialogStatus === 'PAID' ? 'Approve store fee' : 'Reject store fee'"
    :description="dialogStatus === 'PAID' ? 'Confirm that the payment reference has been verified.' : 'Add a reason so the seller knows what to correct.'"
    input-label="Review note"
    input-placeholder="Write a short note"
    confirm-label="Save review"
    :required="dialogStatus === 'REJECTED'"
    @confirm="submitFeeReview"
    @cancel="dialogOpen = false"
  />
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

.fee-section {
  overflow-x: auto;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-cell {
  padding: 16px;
  color: var(--onyx-color-base-text-secondary);
}

.error {
  color: var(--onyx-color-base-text-danger);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--onyx-color-text-icons-neutral-medium);
}
</style>
