import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Task, TaskStatus } from '../../lib/types'
import { todayISO } from './dueDate'

const TASK_COLUMNS = 'id, title, frequency, owner_id, room, weekday, month_day, status, remind, due_on'

export function useTasks() {
  const [rawTasks, setRawTasks] = useState<Task[]>([])
  // tasks cujo due_on fechado hoje já avançou pro próximo ciclo (complete_task já rodou), mas que
  // ainda devem aparecer como "feitas" em Hoje/Quadro pelo resto do dia — ver overlay em `tasks` abaixo.
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    const today = todayISO()

    const [{ data: taskRows, error: taskError }, { data: completionRows, error: complError }] = await Promise.all([
      supabase.from('tasks').select(TASK_COLUMNS).order('created_at'),
      supabase.from('task_completions').select('task_id').eq('due_on', today),
    ])

    if (taskError) setError(taskError.message)
    else setRawTasks(taskRows ?? [])
    if (!complError && completionRows) setCompletedTodayIds(new Set(completionRows.map((r) => r.task_id)))
    if (!opts?.silent) setLoading(false)
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  // canal único: qualquer mudança em tasks (de qualquer aparelho) revalida tasks + conclusões de hoje
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

  // due_on já avançou no banco (é assim que a recorrência funciona), mas pros olhos de quem usa o
  // app a tarefa continua "de hoje, feita" até a meia-noite — sem isso ela some da lista e do
  // contador no instante em que é marcada.
  const tasks = useMemo(() => {
    if (completedTodayIds.size === 0) return rawTasks
    const today = todayISO()
    return rawTasks.map((t) => (completedTodayIds.has(t.id) ? { ...t, status: 'done' as const, due_on: today } : t))
  }, [rawTasks, completedTodayIds])

  function patchRaw(id: string, patch: Partial<Task>) {
    setRawTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  async function plainStatusUpdate(id: string, status: TaskStatus) {
    const prev = rawTasks.find((t) => t.id === id)
    if (!prev) return
    patchRaw(id, { status })

    const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
    if (error) {
      patchRaw(id, { status: prev.status })
      setError(error.message)
    }
  }

  async function completeTask(id: string, memberId: string) {
    const raw = rawTasks.find((t) => t.id === id)
    if (!raw) return
    const wasDueToday = raw.due_on === todayISO()

    patchRaw(id, { status: 'done' })
    if (wasDueToday) setCompletedTodayIds((prev) => new Set(prev).add(id))

    const { error } = await supabase.rpc('complete_task', { p_task: id, p_member: memberId })
    if (error) {
      patchRaw(id, raw)
      if (wasDueToday) setCompletedTodayIds((prev) => { const next = new Set(prev); next.delete(id); return next })
      setError(error.message)
      return
    }

    const { data } = await supabase.from('tasks').select(TASK_COLUMNS).eq('id', id).single()
    if (data) patchRaw(id, data)
  }

  // desfaz uma conclusão de hoje: apaga o registro em task_completions e devolve o due_on pra hoje
  async function undoTodayCompletion(id: string) {
    const raw = rawTasks.find((t) => t.id === id)
    if (!raw) return
    const today = todayISO()

    setCompletedTodayIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    patchRaw(id, { status: 'todo', due_on: today })

    const [{ error: delError }, { error: updError }] = await Promise.all([
      supabase.from('task_completions').delete().eq('task_id', id).eq('due_on', today),
      supabase.from('tasks').update({ status: 'todo', due_on: today }).eq('id', id),
    ])

    if (delError || updError) {
      setCompletedTodayIds((prev) => new Set(prev).add(id))
      patchRaw(id, raw)
      setError((delError ?? updError)?.message ?? 'Não foi possível desfazer.')
    }
  }

  async function toggleTask(id: string, memberId: string) {
    const raw = rawTasks.find((t) => t.id === id)
    if (!raw) return

    if (raw.frequency === 'pontual') {
      if (raw.status === 'done') await plainStatusUpdate(id, 'todo')
      else await completeTask(id, memberId)
      return
    }

    if (completedTodayIds.has(id)) await undoTodayCompletion(id)
    else await completeTask(id, memberId)
  }

  async function setStatus(id: string, status: TaskStatus, memberId: string) {
    const raw = rawTasks.find((t) => t.id === id)
    if (!raw) return

    if (raw.frequency === 'pontual') {
      if (status === 'done' && raw.status !== 'done') await completeTask(id, memberId)
      else await plainStatusUpdate(id, status)
      return
    }

    if (status === 'done') {
      if (!completedTodayIds.has(id)) await completeTask(id, memberId)
      return
    }

    if (completedTodayIds.has(id)) await undoTodayCompletion(id)
    if (status === 'doing') await plainStatusUpdate(id, 'doing')
  }

  async function setOwner(id: string, ownerId: string | null) {
    const prev = rawTasks.find((t) => t.id === id)
    if (!prev) return
    patchRaw(id, { owner_id: ownerId })

    const { error } = await supabase.from('tasks').update({ owner_id: ownerId }).eq('id', id)
    if (error) {
      patchRaw(id, { owner_id: prev.owner_id })
      setError(error.message)
    }
  }

  async function toggleRemind(id: string) {
    const prev = rawTasks.find((t) => t.id === id)
    if (!prev) return
    patchRaw(id, { remind: !prev.remind })

    const { error } = await supabase.from('tasks').update({ remind: !prev.remind }).eq('id', id)
    if (error) {
      patchRaw(id, { remind: prev.remind })
      setError(error.message)
    }
  }

  async function deleteTask(id: string) {
    const prev = rawTasks.find((t) => t.id === id)
    if (!prev) return
    setRawTasks((list) => list.filter((t) => t.id !== id))
    setCompletedTodayIds((set) => {
      if (!set.has(id)) return set
      const next = new Set(set)
      next.delete(id)
      return next
    })

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      setRawTasks((list) => [...list, prev].sort((a, b) => a.id.localeCompare(b.id)))
      setError(error.message)
    }
  }

  // apaga todas as tarefas do domicílio — usado em Nossa casa > "Limpar o quadro"
  async function clearBoard() {
    const prev = rawTasks
    setRawTasks([])
    setCompletedTodayIds(new Set())

    const { error } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      setRawTasks(prev)
      setError(error.message)
      return { error: error.message }
    }
    return { error: null }
  }

  return { tasks, loading, error, setStatus, toggleTask, setOwner, toggleRemind, deleteTask, clearBoard }
}
