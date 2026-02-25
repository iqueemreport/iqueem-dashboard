import { useEffect } from "react"
import { useStore } from "@/stores/auth-store"
import { supabase } from "@/lib/supabase/client"

export function useAuth() {
  const { user, profile, setUser, setProfile, isLoading, setIsLoading } =
    useStore()

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        setUser(session?.user ?? null)
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          if (!cancelled) setProfile(profileData)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error("Auth session error:", err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      if (event === "TOKEN_REFRESHED") {
        if (!cancelled) setIsLoading(false)
        return
      }
      try {
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          if (!cancelled) setProfile(profileData)
        } else {
          setProfile(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })

    const timeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false)
    }, 5000)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setIsLoading])

  return { user, profile, isLoading }
}

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Profile fetch error:", error)
    return null
  }

  return data
}

export function useSignIn() {
  return async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }
}

export function useSignOut() {
  return async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
