import type { Freq } from '../../lib/types'

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function clampedMonthDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function nextWeekdayOnOrAfter(weekday: number, from: Date): string {
  const d = new Date(from)
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7))
  return toISODate(d)
}

function nextMonthDayOnOrAfter(monthDay: number, from: Date): string {
  const thisMonth = clampedMonthDate(from.getFullYear(), from.getMonth(), monthDay)
  if (thisMonth >= new Date(from.getFullYear(), from.getMonth(), from.getDate())) return toISODate(thisMonth)
  const next = new Date(from.getFullYear(), from.getMonth() + 1, 1)
  return toISODate(clampedMonthDate(next.getFullYear(), next.getMonth(), monthDay))
}

// Próxima ocorrência de uma tarefa recém-criada — inclui hoje (diferente do avanço em
// complete_task, que pula pro próximo ciclo porque o atual acabou de fechar).
export function computeInitialDueOn(freq: Freq, weekday: number | null, monthDay: number | null): string | null {
  const today = new Date()
  if (freq === 'diaria') return toISODate(today)
  if (freq === 'semanal' && weekday !== null) return nextWeekdayOnOrAfter(weekday, today)
  if (freq === 'mensal' && monthDay !== null) return nextMonthDayOnOrAfter(monthDay, today)
  return null // pontual — sem recorrência
}
