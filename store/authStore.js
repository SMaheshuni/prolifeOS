import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.user),
      isInitializing: false,
    }),

  clearSession: () =>
    set({
      session: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    }),

  finishInitializing: () => set({ isInitializing: false }),
}))
