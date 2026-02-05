import { ref, watch, computed } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const THEME_STORAGE_KEY = 'iox-theme'

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Load theme from storage or default
const loadSavedTheme = (): Theme => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      return saved
    }
  }
  return 'light'
}

// Initialize current theme
const currentTheme = ref<Theme>(loadSavedTheme())

// Compute effective theme (light or dark)
const effectiveTheme = computed<'light' | 'dark'>(() => {
  if (currentTheme.value === 'auto') {
    return getSystemTheme()
  }
  return currentTheme.value
})

// Apply theme to document (Onyx uses data-theme attribute)
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
    // Remove old class and add new one if needed
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }
}

// Update effective theme based on current theme setting
const updateEffectiveTheme = () => {
  applyTheme(effectiveTheme.value)
}

// Set theme
const setTheme = (theme: Theme) => {
  currentTheme.value = theme
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
  updateEffectiveTheme()
}

// Toggle between light and dark (skips auto)
const toggleTheme = () => {
  const newTheme = effectiveTheme.value === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
}

// Watch for theme changes and apply immediately
watch(effectiveTheme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

// Listen for system theme changes if using auto
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (currentTheme.value === 'auto') {
      updateEffectiveTheme()
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
  }
}

// Initialize theme immediately
updateEffectiveTheme()

export function useTheme() {
  return {
    currentTheme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  }
}
