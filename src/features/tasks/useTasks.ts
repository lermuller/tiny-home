import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Task, TaskStatus } from '../../lib/types'

const TASK_COLUMNS = 'id, title, frequency, owner_id, room, weekday, month_day, status, remind, due_on'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    const { data, error } = await supabase.from('tasks').select(TASK_COLUMNS).order('created_at')
    if (error) setError(error.message)
    else setTasks(data ?? [])
    if (!opts?.silent) setLoading(false)
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  // canal único: qualquer mudança em tasks (de qualquer aparelho) revalida a lista inteira
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-changes-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        void loadTasks({ silent: true })
      })
      .subscribe()

    function revalidate() {
      if (document.visibilityState === 'visible') void loadTasks({ silent: true })
    }
    document.addEventListener('visibilitychange', revalidate)
    window.addEventListener('online', revalidate)
    window.addEventListener('focus', revalidate)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', revalidate)
      window.removeEventListener('online', revalidate)
      window.removeEventListener('focus', revalidate)
    }
  }, [loadTasks])

  function patchLocal(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  async function setStatus(id: string, status: TaskStatus) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return
    patchLocal(id, { status })

    const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
    if (error) {
      patchLocal(id, { status: prev.status })
      setError(error.message)
    }
  }

  async function completeTask(id: string, memberId: string) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return
    patchLocal(id, { status: 'done' })

    const { error } = await supabase.rpc('complete_task', { p_task: id, p_member: memberId })
    if (error) {
      patchLocal(id, prev)
      setError(error.message)
      return
    }

    const { data } = await supabase.from('tasks').select(TASK_COLUMNS).eq('id', id).single()
    if (data) patchLocal(id, data)
  }

  async function toggleTask(id: string, memberId: string) {
    const t = tasks.find((x) => x.id === id)
    if (!t) return
    if (t.status === 'done') {
      await setStatus(id, 'todo')
    } else {
      await completeTask(id, memberId)
    }
  }

  async function setOwner(id: string, ownerId: string | null) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return
    patchLocal(id, { owner_id: ownerId })

    const { error } = await supabase.from('tasks').update({ owner_id: ownerId }).eq('id', id)
    if (error) {
      patchLocal(id, { owner_id: prev.owner_id })
      setError(error.message)
    }
  }

  async function toggleRemind(id: string) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return
    patchLocal(id, { remind: !prev.remind })

    const { error } = await supabase.from('tasks').update({ remind: !prev.remind }).eq('id', id)
    if (error) {
      patchLocal(id, { remind: prev.remind })
      setError(error.message)
    }
  }

  return { tasks, loading, error, setStatus, completeTask, toggleTask, setOwner, toggleRemind }
}
