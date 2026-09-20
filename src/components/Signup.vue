<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createUser, uploadSignupDocument } from '../services/users_service'
import { userTypes, UserTypes } from '../types/user_types'
import {
  OnyxButton,
  OnyxInput,
  OnyxCard,
  OnyxHeadline,
  OnyxLink,
  OnyxSelect,
  OnyxLoadingIndicator,
} from 'sit-onyx'

const router = useRouter()

type SignupForm = {
  firstName: string
  lastName: string
  email: string
  type: string
  contact: string
  password: string
  address: { city: string; state: string; zip: string; country: string }
  businessRegistrationUrl?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
}

const form = reactive<SignupForm>({
  firstName: '',
  lastName: '',
  email: '',
  type: '',
  contact: '',
  password: '',
  address: { city: '', state: '', zip: '', country: '' },
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const idCardFrontFile = ref<File | null>(null)
const idCardBackFile = ref<File | null>(null)
const businessRegFile = ref<File | null>(null)

const isPrivateSeller = computed(() => form.type === UserTypes.PrivateSeller)
const isBusinessSeller = computed(() => form.type === UserTypes.BusinessSeller)

const userTypeOptions = [
  { value: '', label: 'Select user type' },
  ...userTypes.map((t) => ({ value: t.value, label: t.label })),
]

function goToLogin() {
  router.push('/login')
}

function onIdCardFrontChange(e: Event) {
  const target = e.target as HTMLInputElement
  idCardFrontFile.value = target.files?.[0] ?? null
  form.idCardFrontUrl = undefined
}
function onIdCardBackChange(e: Event) {
  const target = e.target as HTMLInputElement
  idCardBackFile.value = target.files?.[0] ?? null
  form.idCardBackUrl = undefined
}
function onBusinessRegChange(e: Event) {
  const target = e.target as HTMLInputElement
  businessRegFile.value = target.files?.[0] ?? null
  form.businessRegistrationUrl = undefined
}

async function onSignupClick() {
  if (!form.email?.trim() || !form.password) {
    error.value = 'Email and password are required'
    return
  }
  if (!form.type) {
    error.value = 'Please select a user type'
    return
  }
  if (!form.firstName?.trim() || !form.lastName?.trim()) {
    error.value = 'First name and last name are required'
    return
  }
  if (isPrivateSeller.value) {
    if (!idCardFrontFile.value || !idCardBackFile.value) {
      error.value = 'Please upload both ID card (front and back) images'
      return
    }
  }
  if (isBusinessSeller.value) {
    if (!businessRegFile.value) {
      error.value = 'Please upload your business registration document'
      return
    }
  }

  error.value = null
  isLoading.value = true

  try {
    if (isPrivateSeller.value && idCardFrontFile.value && idCardBackFile.value) {
      form.idCardFrontUrl = await uploadSignupDocument(idCardFrontFile.value)
      form.idCardBackUrl = await uploadSignupDocument(idCardBackFile.value)
    }
    if (isBusinessSeller.value && businessRegFile.value) {
      form.businessRegistrationUrl = await uploadSignupDocument(businessRegFile.value)
    }

    const result = await createUser(form)

    if (result.error) {
      error.value = result.error
    } else {
      form.firstName = ''
      form.lastName = ''
      form.email = ''
      form.type = ''
      form.address = { city: '', state: '', zip: '', country: '' }
      form.contact = ''
      form.password = ''
      form.businessRegistrationUrl = undefined
      form.idCardFrontUrl = undefined
      form.idCardBackUrl = undefined
      idCardFrontFile.value = null
      idCardBackFile.value = null
      businessRegFile.value = null
      router.push('/login')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="signup-page">
    <OnyxHeadline is="h1" class="page-title">Sign up</OnyxHeadline>
    <div class="signup">
      <OnyxCard>
        <form @submit.prevent="onSignupClick" class="signup-form">
          <OnyxLoadingIndicator v-if="isLoading" />
          <p v-else-if="error" class="error">{{ error }}</p>

          <div class="row">
            <OnyxInput
              v-model="form.firstName"
              label="First name"
              placeholder="First name"
              required
            />
            <OnyxInput
              v-model="form.lastName"
              label="Last name"
              placeholder="Last name"
              required
            />
          </div>

          <OnyxInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />

          <OnyxSelect
            v-model="form.type"
            label="User type"
            list-label="User type"
            :options="userTypeOptions"
          />

          <div v-if="isPrivateSeller" class="doc-uploads">
            <p class="doc-hint">Your account will be set to &quot;In review&quot; until we verify your ID.</p>
            <div class="file-field">
              <label class="file-label">ID card (front) <span class="required">*</span></label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="onIdCardFrontChange" class="file-input" />
              <span v-if="idCardFrontFile" class="file-name">{{ idCardFrontFile.name }}</span>
            </div>
            <div class="file-field">
              <label class="file-label">ID card (back) <span class="required">*</span></label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="onIdCardBackChange" class="file-input" />
              <span v-if="idCardBackFile" class="file-name">{{ idCardBackFile.name }}</span>
            </div>
          </div>
          <div v-else-if="isBusinessSeller" class="doc-uploads">
            <p class="doc-hint">Your account will be set to &quot;In review&quot; until we verify your business.</p>
            <div class="file-field">
              <label class="file-label">Business registration document <span class="required">*</span></label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="onBusinessRegChange" class="file-input" />
              <span v-if="businessRegFile" class="file-name">{{ businessRegFile.name }}</span>
            </div>
          </div>

          <div class="row">
            <OnyxInput
              v-model="form.address.city"
              label="City"
              placeholder="City"
            />
            <OnyxInput
              v-model="form.address.state"
              label="State"
              placeholder="State"
            />
          </div>

          <div class="row">
            <OnyxInput
              v-model="form.address.zip"
              label="ZIP"
              placeholder="ZIP"
            />
            <OnyxInput
              v-model="form.address.country"
              label="Country"
              placeholder="Country"
            />
          </div>

          <OnyxInput
            v-model="form.contact"
            label="Contact"
            placeholder="Phone or contact"
          />

          <OnyxInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Choose a password"
            required
          />

          <OnyxButton type="submit" label="Sign up" :disabled="isLoading" />

          <div class="links">
            <OnyxLink href="#" @click.prevent="goToLogin">
              Already have an account? Log in
            </OnyxLink>
          </div>
        </form>
      </OnyxCard>
    </div>
  </div>
</template>

<style scoped>
.signup-page {
  padding: 40px 20px 100px 20px;
  max-width: 520px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  text-align: center;
  margin-bottom: 32px;
}

.signup {
  display: flex;
  justify-content: center;
  width: 100%;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.error {
  margin: 0;
  color: var(--onyx-color-text-danger-intense);
  font-size: 14px;
}

.doc-uploads {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.doc-hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--onyx-color-base-text-secondary);
}

.file-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.file-label .required {
  color: var(--onyx-color-text-danger-intense);
}

.file-input {
  font-size: 0.875rem;
  padding: 8px;
  border: 1px solid var(--onyx-color-base-border-subtle);
  border-radius: 6px;
  background: var(--onyx-color-base-background);
}

.file-name {
  font-size: 0.8125rem;
  color: var(--onyx-color-base-text-secondary);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}
</style>
