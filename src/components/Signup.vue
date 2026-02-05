<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '../services/users_service'
import { userTypes } from '../types/user_types'
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
  address: {
    city: string
    state: string
    zip: string
    country: string
  }
}

const form = reactive<SignupForm>({
  firstName: '',
  lastName: '',
  email: '',
  type: '',
  contact: '',
  password: '',
  address: {
    city: '',
    state: '',
    zip: '',
    country: '',
  },
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const userTypeOptions = [
  { value: '', label: 'Select user type' },
  ...userTypes.map((t) => ({ value: t.value, label: t.label })),
]

function goToLogin() {
  router.push('/login')
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

  error.value = null
  isLoading.value = true

  try {
    const result = await createUser(form)

    if (result.error) {
      error.value = result.error
    } else {
      form.firstName = ''
      form.lastName = ''
      form.email = ''
      form.type = ''
      form.address.city = ''
      form.address.state = ''
      form.address.zip = ''
      form.address.country = ''
      form.contact = ''
      form.password = ''
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

.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}
</style>
