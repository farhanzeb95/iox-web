<script setup lang="ts">
import { reactive } from 'vue'
import { loginUser } from '../services/users_service';

defineProps<{ title: string }>()

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

const handleForgotPassword = () => {
  console.log('Forgot password clicked')
  // TODO: Implement forgot password functionality
  alert('Forgot password functionality coming soon!')
}

const onLoginClick = async () => {
  try {
   await loginUser(loginForm)
    emit('loginSuccess')
  } catch(error) {
    console.log(error)
  }
}
</script>

<template>
  <h1 class="page-title">{{ title }}</h1>
  <div class="login">
    <form class="card" @submit.prevent="onLoginClick">
      <input 
        v-model="loginForm.email" 
        type="email" 
        placeholder="Email" 
      />
      <input 
        v-model="loginForm.password" 
        type="password" 
        placeholder="Password" 
      />
      <div class="forgot-password">
        <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">Forgot Password?</a>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 30px 0;
  font-size: 28px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.login {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.card {
  width: 100%;
  max-width: 520px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 15px;
  font-family: inherit;
  background-color: white;
  color: #333;
  width: 100%;
}

input::placeholder {
  color: #999;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.forgot-link {
  color: #42b983;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #369f72;
  text-decoration: underline;
}

button {
  margin-top: 10px;
  padding: 14px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

button:hover:not(:disabled) {
  background: #369f72;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
