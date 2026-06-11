import { create } from 'zustand'
import { TOAST_DURATION_SUCCESS_MS, TOAST_DURATION_ERROR_MS } from '@/utils/constants'

let nextId = 1

export const useToastStore = create((set, get) => ({
  toasts: [],

  show: ({ message, type = 'success' }) => {
    const id = nextId++
    const duration = type === 'error' ? TOAST_DURATION_ERROR_MS : TOAST_DURATION_SUCCESS_MS
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, duration)
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

export const showToast = (payload) => useToastStore.getState().show(payload)
