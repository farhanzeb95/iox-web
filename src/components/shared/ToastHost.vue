<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <article v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        <div class="toast-mark" aria-hidden="true">{{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i' }}</div>
        <div class="toast-content">
          <strong>{{ toast.title }}</strong>
          <p v-if="toast.message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" type="button" aria-label="Dismiss notification" @click="dismiss(toast.id)">×</button>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  z-index: 1000;
  inset: 76px 20px auto auto;
  width: min(380px, calc(100vw - 40px));
  pointer-events: none;
}

.toast-list {
  display: grid;
  gap: 10px;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-left: 4px solid var(--toast-accent);
  border-radius: 10px;
  background: var(--app-surface-raised);
  box-shadow: 0 14px 34px rgba(20, 32, 42, 0.16);
}

.toast--success { --toast-accent: #20845a; }
.toast--error { --toast-accent: #c34b43; }
.toast--info { --toast-accent: #3d6f9d; }

.toast-mark {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: var(--toast-accent);
  font-weight: 700;
}

.toast-content { flex: 1; min-width: 0; }
.toast-content strong { display: block; color: var(--app-text); font-size: 0.92rem; }
.toast-content p { margin: 3px 0 0; color: var(--app-text-muted); font-size: 0.82rem; line-height: 1.4; }
.toast-close { border: 0; background: transparent; color: var(--app-text-muted); font-size: 1.25rem; cursor: pointer; line-height: 1; }
.toast-close:hover { color: var(--app-text); }
.toast-enter-active, .toast-leave-active { transition: all 0.22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px) translateX(12px); }

@media (max-width: 600px) {
  .toast-region { inset: 70px 16px auto; width: auto; }
}
</style>
