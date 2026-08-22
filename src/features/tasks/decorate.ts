import type { Task } from '../../lib/types'
import { WEEKDAY_LABELS } from '../../lib/people'
import { daysBetween, monthsBetween, todayISO } from './dueDate'

export function isLate(t: Task, today = todayISO()) {
  return !!t.due_on && t.due_on < today && t.status !== 'done'
}

export function isDueToday(t: Task, today = todayISO()) {
  return t.due_on === today
}

export function taskWhen(t: Task) {
  if (t.frequency === 'diaria') return 'Todo dia'
  if (t.frequency === 'semanal') return t.weekday !== null ? WEEKDAY_LABELS[t.weekday] : ''
  if (t.frequency === 'mensal') return 'Dia ' + t.month_day
  return 'Sem prazo'
}

export function taskLateText(t: Task, today = todayISO()) {
  if (!t.due_on) return ''
  if (t.frequency === 'mensal') {
    const months = Math.max(1, monthsBetween(t.due_on, today))
    return months === 1 ? 'Era pra este mês' : `Há ${months} meses`
  }
  if (t.frequency === 'semanal') {
    const weeks = Math.max(1, Math.ceil(daysBetween(t.due_on, today) / 7))
    return weeks === 1 ? 'Era pra ontem' : `Há ${weeks} semanas`
  }
  const days = Math.max(1, daysBetween(t.due_on, today))
  return days === 1 ? 'Era pra ontem' : `Há ${days} dias`
}

export function taskMeta(t: Task, today = todayISO()) {
  const when = taskWhen(t)
  const room = t.room ?? ''
  return (isLate(t, today) ? taskLateText(t, today) + ' · ' : '') + when + (room ? ' · ' + room : '')
}

export function taskLateLabel(t: Task, today = todayISO()) {
  const room = t.room ?? ''
  return taskLateText(t, today) + (room ? ' · ' + room : '')
}

export function taskRepeatLine(t: Task) {
  if (t.frequency === 'diaria') return 'Volta sozinha todo dia de manhã'
  if (t.frequency === 'semanal') return 'Volta sozinha toda ' + (t.weekday !== null ? WEEKDAY_LABELS[t.weekday].toLowerCase() : '')
  if (t.frequency === 'mensal') return 'Volta sozinha todo dia ' + t.month_day + ' do mês'
  return 'Não repete'
}
