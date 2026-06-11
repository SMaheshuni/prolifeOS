import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export const upsertToCloud = async (table, record, onConflict = 'id') => {
  if (!supabase) return { skipped: true }
  const { error } = await supabase.from(table).upsert(record, { onConflict })
  if (error) throw error
  return { skipped: false }
}

export const deleteFromCloud = async (table, id) => {
  if (!supabase) return { skipped: true }
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
  return { skipped: false }
}

export const fetchFromCloud = async (table, userId) => {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
  if (error) throw error
  return data || []
}
