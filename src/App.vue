<script setup lang="ts">
import { onMounted, ref } from "vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import Login from "./components/Login.vue";
import Signup from "./components/Signup.vue";
import Dashboard from "./components/Dashboard.vue";

const currentView = ref<"login" | "signup" | "dashboard">("dashboard");
const isLoggedIn = ref(false);

const navigateToLogin = () => {
  currentView.value = "login";
};

const navigateToSignup = () => {
  currentView.value = "signup";
};

const navigateToDashboard = () => {
  const token = localStorage.getItem("authToken");
  currentView.value = "dashboard";
  isLoggedIn.value = !!token;
};

const logout = () => {
  localStorage.removeItem("authToken"); // remove stored token
  isLoggedIn.value = false;
  currentView.value = "login"; // navigate back to login
};

onMounted(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    isLoggedIn.value = !!token;
    currentView.value = "dashboard"; // user is logged in, show dashboard
  }
});
</script>

<template>
  <div class="app-wrapper">
    <Header
      :current-view="currentView"
      :is-logged-in="isLoggedIn"
      @navigate-to-login="navigateToLogin"
      @navigate-to-signup="navigateToSignup"
      @navigate-to-dashboard="navigateToDashboard"
      @logout="logout"
    />

    <main class="main-content">
      <Login
        v-if="currentView === 'login'"
        title="Login"
        @navigateToSignup="navigateToSignup"
        @loginSuccess="navigateToDashboard"
      />
      <Signup
        v-else-if="currentView === 'signup'"
        title="Signup"
        @navigateToLogin="navigateToLogin"
      />
      <Dashboard v-else-if="currentView === 'dashboard'" />
    </main>

    <Footer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

.app-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 70px;
  padding-bottom: 70px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: calc(100vh - 70px - 70px);
}
</style>
