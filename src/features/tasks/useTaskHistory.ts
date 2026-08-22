import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface TaskHistoryStats {
  count: number
  avgDays: number | null
}

export function useTaskHistory(taskId: string | null) {
  const [stats, setStats] = useState<TaskHistoryStats | null>(null)

  useEffect(() => {
    if (!taskId) {
      setStats(null)
      return
    }

    let cancelled = false
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    supabase
      .from('task_completions')
      .select('completed_at')
      .eq('task_id', taskId)
      .gte('completed_at', threeMonthsAgo.toISOString())
      .order('completed_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const count = data.length
        let avgDays: number | null = null
        if (count >= 2) {
          const first = new Date(data[0].completed_at).getTime()
          const last = new Date(data[count - 1].completed_at).getTime()
          avgDays = Math.round((last - first) / 86400000 / (count - 1))
        }
        setStats({ count, avgDays })
      })

    return () => {
      cancelled = true
    }
  }, [taskId])

  return stats
}
