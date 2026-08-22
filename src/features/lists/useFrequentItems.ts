import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useFrequentItems(listId: string | null) {
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    if (!listId) {
      setNames([])
      return
    }

    let cancelled = false

    supabase
      .from('frequent_items')
      .select('name, times')
      .eq('list_id', listId)
      .order('times', { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setNames(data.map((row) => row.name))
      })

    return () => {
      cancelled = true
    }
  }, [listId])

  return names
}
