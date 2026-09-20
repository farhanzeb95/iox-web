import { readonly, ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  type: ToastType
  title: string
  message?: string
}

const toasts = ref<Toast[]>([])
let nextId = 1

function show(type: ToastType, title: string, message?: string) {
  const id = nextId++
  toasts.value.push({ id, type, title, message })
  window.setTimeout(() => dismiss(id), 4500)
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    success: (title: string, message?: string) => show('success', title, message),
    error: (title: string, message?: string) => show('error', title, message),
    info: (title: string, message?: string) => show('info', title, message),
    dismiss,
  }
}
