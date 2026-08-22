import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function startOfWeekISO(): string {
  const d = new Date()
  const day = d.getDay() // 0=domingo..6=sábado
  const diffToMonday = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function useWeeklyCompletions() {
  const [countByMember, setCountByMember] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false

    supabase
      .from('task_completions')
      .select('member_id')
      .gte('completed_at', startOfWeekISO())
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const counts: Record<string, number> = {}
        for (const row of data) {
          if (!row.member_id) continue
          counts[row.member_id] = (counts[row.member_id] ?? 0) + 1
        }
        setCountByMember(counts)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return countByMember
}
