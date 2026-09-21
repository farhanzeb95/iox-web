<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { loginUser } from '../services/users_service';
import { useRouter } from 'vue-router';
import { OnyxButton, OnyxInput, OnyxCard, OnyxHeadline, OnyxLink } from 'sit-onyx';
import { useToast } from '../composables/useToast'

const router = useRouter()
const toast = useToast()

const emit = defineEmits<{
  navigateToSignup: []
  loginSuccess: []
}>()

type LoginForm = {
  email: string
  password: string
}
    
const loginForm = reactive<LoginForm>({
  email: '',
  password: ''
})
const loginError = ref('')
const canSubmit = computed(() => loginForm.email.trim().length > 0 && loginForm.password.length > 0)

const handleForgotPassword = () => {
  toast.info('Password recovery', 'Forgot password is not available yet. Please contact support.')
}

const handleSignupClick = () => {
  router.push('/signup')
}

const onLoginClick = async () => {
  try {
   loginError.value = ''
   await loginUser(loginForm)
  toast.success('Welcome back', 'You are now signed in.')
   emit("loginSuccess")
    router.push('/dashboard')
  } catch(error) {
    loginError.value = error instanceof Error ? error.message : 'Unable to login'
  }
}
</script>

<template>
  <div class="login-page">
    <OnyxHeadline is="h1" class="page-title">Login</OnyxHeadline>
    <div class="login">
      <OnyxCard>
        <form @submit.prevent="onLoginClick" class="login-form">
          <OnyxInput
            v-model="loginForm.email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          <OnyxInput
            v-model="loginForm.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
          <p v-if="loginError" class="error-message">{{ loginError }}</p>
          <div class="links">
            <OnyxLink href="#" @click.prevent="handleForgotPassword">Forgot Password?</OnyxLink>
            <OnyxLink href="#" @click.prevent="handleSignupClick">Not a member yet? Sign up</OnyxLink>
          </div>
          <OnyxButton type="submit" label="Login" :disabled="!canSubmit" />
        </form>
      </OnyxCard>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  padding: 0px 20px 100px 20px; /* Top padding for header, bottom for footer */
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

.login {
  display: flex;
  justify-content: center;
  width: 100%;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.error-message {
  color: #d0392b;
  margin: 0;
  font-size: 14px;
}
</style>
