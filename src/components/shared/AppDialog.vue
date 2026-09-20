<script setup lang="ts">
import { ref, watch } from 'vue'
import { OnyxButton, OnyxInput } from 'sit-onyx'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  inputLabel?: string
  inputPlaceholder?: string
  required?: boolean
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  inputLabel: '',
  inputPlaceholder: '',
  required: false,
})

const value = ref('')
const emit = defineEmits<{ confirm: [value: string]; cancel: [] }>()
watch(() => props.open, (open) => { if (open) value.value = '' })

function confirm() {
  if (props.required && !value.value.trim()) return
  emit('confirm', value.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="$emit('cancel')">
      <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${title}-dialog-title`">
        <div class="dialog-header">
          <div>
            <p class="dialog-eyebrow">IOX ADMIN</p>
            <h2 :id="`${title}-dialog-title`">{{ title }}</h2>
            <p v-if="description" class="dialog-description">{{ description }}</p>
          </div>
          <button class="dialog-close" type="button" aria-label="Close dialog" @click="$emit('cancel')">×</button>
        </div>
        <OnyxInput
          v-if="inputLabel"
          v-model="value"
          :label="inputLabel"
          :placeholder="inputPlaceholder"
          :required="required"
          @keyup.enter="confirm"
        />
        <div class="dialog-actions">
          <OnyxButton label="Cancel" appearance="outline" @click="$emit('cancel')" />
          <OnyxButton :label="confirmLabel" :disabled="required && !value.trim()" @click="confirm" />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop { position: fixed; z-index: 1100; inset: 0; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--app-ink) 48%, transparent); backdrop-filter: blur(4px); }
.dialog { width: min(480px, 100%); padding: 24px; border: 1px solid var(--app-border); border-radius: 14px; background: var(--app-surface-raised); box-shadow: 0 24px 70px color-mix(in srgb, var(--app-ink) 28%, transparent); }
.dialog-header { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.dialog-eyebrow { margin: 0 0 6px; color: var(--app-accent); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; }
h2 { margin: 0; color: var(--app-text); font-size: 1.35rem; }
.dialog-description { margin: 8px 0 0; color: var(--app-text-muted); line-height: 1.45; }
.dialog-close { border: 0; background: transparent; color: var(--app-text-muted); font-size: 1.6rem; cursor: pointer; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
</style>
