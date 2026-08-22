import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface RecentCompletion {
  id: number
  completedAt: string
  taskTitle: string
  memberName: string | null
  memberInitial: string | null
  memberColor: string | null
}

interface CompletionRow {
  id: number
  completed_at: string
  tasks: { title: string } | null
  members: { name: string; initial: string; color: string } | null
}

export function useRecentCompletions(limit = 30) {
  const [completions, setCompletions] = useState<RecentCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('task_completions')
      .select('id, completed_at, tasks(title), members(name, initial, color)')
      .order('completed_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          setCompletions(
            (data as unknown as CompletionRow[]).map((row) => ({
              id: row.id,
              completedAt: row.completed_at,
              taskTitle: row.tasks?.title ?? 'Tarefa removida',
              memberName: row.members?.name ?? null,
              memberInitial: row.members?.initial ?? null,
              memberColor: row.members?.color ?? null,
            })),
          )
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { completions, loading }
}
