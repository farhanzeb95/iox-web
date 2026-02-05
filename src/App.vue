<script setup lang="ts">
  import { ref, onMounted, provide } from 'vue'
  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import { decodeToken } from './utils/jwt'
  
  const isLoggedIn = ref(false)
  const userType = ref()
  const mainContentRef = ref<HTMLElement | null>(null)
  provide('mainContentRef', mainContentRef)

  const syncAuth = () => {
    const token = localStorage.getItem('authToken')
    isLoggedIn.value = !!localStorage.getItem('authToken')
    userType.value = token ? decodeToken(token)?.type : undefined
  }
  
  onMounted(syncAuth)
  
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    syncAuth()
  }
  </script>
  
  <template>
    <Header :is-logged-in="isLoggedIn" :user-type="userType" @logout="handleLogout" />
    <div class="page-wrapper">
      <main ref="mainContentRef" class="main-content">
        <router-view @loginSuccess="syncAuth" />
      </main>
      <Footer />
    </div>
  </template>

  <style>
  /* Layout: header, content, footer in normal flow; whole page scrolls */
  :root {
    --app-header-height: 64px;
    --app-footer-height: 64px;
  }

  * {
    margin: 0;
    box-sizing: border-box;
  }

  html,
  body {
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    width: 100%;
  }
  </style>
  