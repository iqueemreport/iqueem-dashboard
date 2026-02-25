import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

// LockManager timeout hatasını önlemek için lock devre dışı (tek sekme kullanımda güvenli)
const noOpLock = <R>(_name: string, _timeout: number, fn: () => Promise<R>) => fn()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { lock: noOpLock },
})

export function getSupabaseConfig() {
  if (!supabaseUrl.startsWith("http") || supabaseAnonKey.length < 20) {
    return { ok: false as const, error: "VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY production ortamında tanımlı olmalı (Vercel → Settings → Environment Variables)" }
  }
  return { ok: true as const }
}
