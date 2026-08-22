import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from './useAuth'

export interface NotifPrefs {
  manha: boolean
  atraso: boolean
  mercado: boolean
}

export interface Me {
  id: string
  name: string
  initial: string
  color: string
  notif_prefs: NotifPrefs
}

export function useMe() {
  const { session } = useAuth()
  const [me, setMe] = useState<Me | null>(null)
  const [fetching, setFetching] = useState(() => !!session)

  useEffect(() => {
    if (!session) return

    let cancelled = false
    setFetching(true)

    supabase
      .from('members')
      .select('id, name, initial, color, notif_prefs')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setMe(error ? null : data)
        setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  async function toggleNotifPref(key: keyof NotifPrefs) {
    if (!me) return
    const prevPrefs = me.notif_prefs
    const nextPrefs = { ...prevPrefs, [key]: !prevPrefs[key] }
    setMe({ ...me, notif_prefs: nextPrefs })

    const { error } = await supabase.from('members').update({ notif_prefs: nextPrefs }).eq('id', me.id)
    if (error) setMe((prev) => (prev ? { ...prev, notif_prefs: prevPrefs } : prev))
  }

  return { me: session ? me : null, loading: !!session && fetching, toggleNotifPref }
}
