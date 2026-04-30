"use client"

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import supabase from '@/lib/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const session = supabase.auth.getSession().then(res => setUser(res.data.session?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return { user }
}
