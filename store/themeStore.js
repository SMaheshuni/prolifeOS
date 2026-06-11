import { create } from 'zustand'

const STORAGE_KEY = 'lifeos-theme'

const readStoredMode = () => {
  if (typeof window === 'undefined') return 'light'
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const applyClass = (mode) => {
  if (typeof document === 'undefined') return
  if (mode === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

const persistMode = (mode) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // storage unavailable; in-memory mode still applies
  }
}

const initialMode = readStoredMode()
applyClass(initialMode)

export const useThemeStore = create((set) => ({
  mode: initialMode,
  setMode: (mode) => {
    applyClass(mode)
    persistMode(mode)
    set({ mode })
  },
}))
