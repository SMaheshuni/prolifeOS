import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase.client'
import { clearLocalDataForUser } from '@/db/dexie.client'

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const finishInitializing = useAuthStore((state) => state.finishInitializing)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      finishInitializing()
      return
    }

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch {
        finishInitializing()
      }
    }
    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      subscription?.subscription?.unsubscribe?.()
    }
  }, [setSession, finishInitializing])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session)
    return data.session
  }

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.session) setSession(data.session)
    return data.session
  }

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured')
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const signOut = async () => {
    const userId = user?.id
    if (isSupabaseConfigured) await supabase.auth.signOut()
    clearSession()
    if (userId) await clearLocalDataForUser(userId)
  }

  return {
    user,
    session,
    isAuthenticated,
    isInitializing,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
  }
}
