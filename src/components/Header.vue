<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentView: 'login' | 'signup' | 'dashboard'
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  navigateToLogin: []
  navigateToSignup: []
  navigateToDashboard: []
  logout: []
}>()

const buttonText = computed(() => {
  if (props.isLoggedIn) return 'Logout'
  return props.currentView === 'login' ? 'Sign Up' : 'Login'
})

const handleClick = () => {
  if (props.isLoggedIn) {
    emit('logout')
  } else if (props.currentView === 'login') {
    emit('navigateToSignup')
  } else {
    emit('navigateToLogin')
  }
}

const handleIconClick = () => {
  if (props.currentView !== 'dashboard') {
    emit('navigateToDashboard')
  }
}

</script>

<template>
  <header class="top-header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-text" @click="handleIconClick">IOX</span>
      </div>
      <button type="button" class="nav-button" @click="handleClick">
        {{ buttonText }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #42b983;
  letter-spacing: 1px;
  cursor: pointer;
}

.nav-button {
  padding: 8px 20px;
  background: transparent;
  color: #42b983;
  border: 2px solid #42b983;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-button:hover {
  background: #42b983;
  color: white;
}
</style>
