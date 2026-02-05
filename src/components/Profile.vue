<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  OnyxHeadline,
  OnyxCard,
  OnyxInput,
  OnyxButton,
  OnyxLoadingIndicator,
} from 'sit-onyx'
import { getCurrentUser, updateUser } from '../services/users_service'
import type { User } from '../services/users_service'

const profile = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const form = ref({
  FirstName: '',
  LastName: '',
  Contact: '',
  Address: {
    City: '',
    State: '',
    Zip: '',
    Country: '',
  },
})

async function load() {
  loading.value = true
  error.value = null
  try {
    profile.value = await getCurrentUser()
    if (profile.value) {
      form.value = {
        FirstName: profile.value.FirstName ?? '',
        LastName: profile.value.LastName ?? '',
        Contact: profile.value.Contact ?? '',
        Address: {
          City: profile.value.Address?.City ?? '',
          State: profile.value.Address?.State ?? '',
          Zip: profile.value.Address?.Zip ?? '',
          Country: profile.value.Address?.Country ?? '',
        },
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!profile.value?.id) return
  saving.value = true
  error.value = null
  success.value = false
  try {
    const res = await updateUser(profile.value.id, {
      FirstName: form.value.FirstName,
      LastName: form.value.LastName,
      Contact: form.value.Contact,
      Address: form.value.Address,
    })
    if (res.error) {
      error.value = res.error
    } else {
      success.value = true
      if (res.data) profile.value = res.data
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update'
  } finally {
    saving.value = false
  }
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

onMounted(load)
</script>

<template>
  <div class="profile-page">
    <OnyxHeadline is="h1" class="page-title">My Profile</OnyxHeadline>
    <OnyxLoadingIndicator v-if="loading" />
    <p v-else-if="!profile" class="error">You must be logged in to view your profile.</p>
    <OnyxCard v-else class="profile-card">
      <form @submit.prevent="onSave" class="profile-form">
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">Profile updated successfully.</p>

        <div class="read-only">
          <p><strong>Email</strong> {{ profile.Email }}</p>
          <p><strong>Role</strong> {{ roleLabel(profile.Type) }}</p>
        </div>

        <div class="form-row">
          <OnyxInput v-model="form.FirstName" label="First name" placeholder="First name" />
          <OnyxInput v-model="form.LastName" label="Last name" placeholder="Last name" />
        </div>
        <OnyxInput v-model="form.Contact" label="Contact" placeholder="Phone or contact" />
        <h3 class="section-title">Address</h3>
        <div class="form-row">
          <OnyxInput v-model="form.Address.City" label="City" placeholder="City" />
          <OnyxInput v-model="form.Address.State" label="State" placeholder="State" />
        </div>
        <div class="form-row">
          <OnyxInput v-model="form.Address.Zip" label="ZIP" placeholder="ZIP" />
          <OnyxInput v-model="form.Address.Country" label="Country" placeholder="Country" />
        </div>

        <OnyxButton type="submit" label="Save changes" :disabled="saving" />
      </form>
    </OnyxCard>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 100px 20px 100px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
}

.profile-card {
  padding: 24px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.read-only {
  padding: 12px 0;
  border-bottom: 1px solid var(--onyx-color-base-border-subtle);
}
.read-only p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--onyx-color-base-text);
}

.section-title {
  font-size: 16px;
  margin: 8px 0 0;
  color: var(--onyx-color-base-text);
}

.error {
  color: var(--onyx-color-text-danger-intense);
  margin: 0;
}
.success {
  color: var(--onyx-color-text-success-intense);
  margin: 0;
}
</style>
