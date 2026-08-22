import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Member } from '../../lib/types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('members')
      .select('id, name, initial, color')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setMembers(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { members, loading }
}
