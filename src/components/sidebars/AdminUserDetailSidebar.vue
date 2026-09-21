<script setup lang="ts">
import { computed } from 'vue'
import { OnyxButton, OnyxIconButton, OnyxTag } from 'sit-onyx'
import { iconX } from '@sit-onyx/icons'
import type { User } from '../../services/users_service'

const props = defineProps<{
  open: boolean
  user: User | null
  busy?: boolean
}>()

const emit = defineEmits<{
  close: []
  setStatus: [status: 'ACTIVE' | 'REJECTED' | 'SUSPENDED']
}>()

const isSeller = computed(() => props.user?.Type === 'PRIVATE_SELLER' || props.user?.Type === 'BUSINESS_SELLER')
const statusColor = computed(() => {
  switch (props.user?.status) {
    case 'ACTIVE': return 'success'
    case 'SUSPENDED': return 'danger'
    case 'REJECTED': return 'danger'
    default: return 'warning'
  }
})

function displayStatus(status?: string) {
  return status?.replace('_', ' ') || 'UNKNOWN'
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="sidebar-backdrop" @click.self="emit('close')">
      <aside class="user-sidebar" aria-label="User details">
        <header class="sidebar-header">
          <div>
            <p class="eyebrow">ACCOUNT REVIEW</p>
            <h2>{{ user ? `${user.FirstName} ${user.LastName}` : 'User details' }}</h2>
          </div>
          <OnyxIconButton :icon="iconX" label="Close user details" @click="emit('close')" />
        </header>

        <template v-if="user">
          <div class="tag-row">
            <OnyxTag color="primary" :label="user.Type.replace('_', ' ')" />
            <OnyxTag :color="statusColor" :label="displayStatus(user.status)" />
          </div>

          <dl class="details-list">
            <div><dt>Name</dt><dd>{{ user.FirstName }} {{ user.LastName }}</dd></div>
            <div><dt>Email</dt><dd>{{ user.Email }}</dd></div>
            <div><dt>Contact</dt><dd>{{ user.Contact || 'Not provided' }}</dd></div>
            <div><dt>Address</dt><dd>{{ user.Address?.City || 'Not provided' }}, {{ user.Address?.Country || '' }}</dd></div>
            <div><dt>Created</dt><dd>{{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available' }}</dd></div>
          </dl>

          <section v-if="isSeller" class="documents">
            <h3>Submitted documents</h3>
            <a v-if="user.idCardFrontUrl" :href="user.idCardFrontUrl" target="_blank" rel="noopener">View ID card front</a>
            <a v-if="user.idCardBackUrl" :href="user.idCardBackUrl" target="_blank" rel="noopener">View ID card back</a>
            <a v-if="user.businessRegistrationUrl" :href="user.businessRegistrationUrl" target="_blank" rel="noopener">View business registration</a>
            <p v-if="!user.idCardFrontUrl && !user.idCardBackUrl && !user.businessRegistrationUrl">No documents submitted.</p>
          </section>

          <section class="status-actions">
            <h3>Account access</h3>
            <p>Suspending an account temporarily blocks seller tools and account operations until it is restored.</p>
            <div class="action-row">
              <OnyxButton v-if="user.status !== 'ACTIVE'" label="Set active" :disabled="busy" @click="emit('setStatus', 'ACTIVE')" />
              <OnyxButton v-if="user.status === 'ACTIVE'" label="Temporarily suspend" appearance="outline" :disabled="busy" @click="emit('setStatus', 'SUSPENDED')" />
              <OnyxButton v-if="user.status !== 'REJECTED'" label="Reject" appearance="outline" :disabled="busy" @click="emit('setStatus', 'REJECTED')" />
            </div>
          </section>
        </template>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.sidebar-backdrop { position: fixed; z-index: 1050; inset: 0; display: flex; justify-content: flex-end; background: color-mix(in srgb, var(--app-ink) 42%, transparent); }
.user-sidebar { width: min(460px, 100vw); height: 100%; overflow-y: auto; padding: 24px; background: var(--app-surface-raised); color: var(--app-text); box-shadow: -18px 0 50px color-mix(in srgb, var(--app-ink) 22%, transparent); }
.sidebar-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
.eyebrow { margin: 0 0 6px; color: var(--app-accent); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; }
h2, h3 { margin: 0; }
h2 { font-size: 1.45rem; }
h3 { margin-bottom: 10px; font-size: 1rem; }
.tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
.details-list { display: grid; gap: 0; margin: 0; border-top: 1px solid var(--app-border); }
.details-list div { display: grid; grid-template-columns: 110px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--app-border); }
dt { color: var(--app-text-muted); font-size: 0.8rem; } dd { margin: 0; overflow-wrap: anywhere; }
.documents, .status-actions { margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--app-border); }
.documents { display: grid; gap: 9px; } .documents a { color: var(--app-accent); } .documents p, .status-actions p { margin: 0; color: var(--app-text-muted); font-size: 0.88rem; line-height: 1.45; }
.action-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
</style>
