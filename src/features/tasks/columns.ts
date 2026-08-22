import { WEEKDAY_DISPLAY_ORDER, WEEKDAY_LABELS } from '../../lib/people'
import type { Member, Task } from '../../lib/types'

export type GroupBy = 'frequencia' | 'status' | 'dia' | 'pessoa'

export interface TaskColumn {
  key: string
  label: string
  tone: string
  tasks: Task[]
  openCount: number
}

function bucketKey(t: Task, groupBy: GroupBy): string {
  if (groupBy === 'frequencia') return t.frequency
  if (groupBy === 'status') return t.status
  if (groupBy === 'pessoa') return t.owner_id ?? 'nos'
  // dia
  if (t.frequency === 'diaria') return 'todos'
  if (t.frequency === 'semanal') return String(t.weekday)
  return 'semdia'
}

export function buildColumns(tasks: Task[], groupBy: GroupBy, members: Member[], todayWeekday: number): TaskColumn[] {
  let defs: { key: string; label: string; tone: string }[]

  if (groupBy === 'frequencia') {
    defs = [
      { key: 'diaria', label: 'Diárias', tone: '#c67139' },
      { key: 'semanal', label: 'Semanais', tone: '#7a8a5e' },
      { key: 'mensal', label: 'Mensais', tone: '#8f4d21' },
      { key: 'pontual', label: 'Pontuais', tone: '#a19786' },
    ]
  } else if (groupBy === 'status') {
    defs = [
      { key: 'todo', label: 'A fazer', tone: '#a19786' },
      { key: 'doing', label: 'Fazendo', tone: '#c67139' },
      { key: 'done', label: 'Feito', tone: '#7a8a5e' },
    ]
  } else if (groupBy === 'pessoa') {
    defs = [
      ...members.map((m) => ({ key: m.id, label: m.name, tone: m.color })),
      { key: 'nos', label: 'Os dois', tone: '#a19786' },
    ]
  } else {
    defs = [
      { key: 'todos', label: 'Todo dia', tone: '#c67139' },
      ...WEEKDAY_DISPLAY_ORDER.map((w) => ({
        key: String(w),
        label: WEEKDAY_LABELS[w],
        tone: w === todayWeekday ? '#c67139' : '#a19786',
      })),
      { key: 'semdia', label: 'Sem dia fixo', tone: '#a19786' },
    ]
  }

  let columns = defs.map((d) => {
    const ts = tasks.filter((t) => bucketKey(t, groupBy) === d.key)
    return { key: d.key, label: d.label, tone: d.tone, tasks: ts, openCount: ts.filter((t) => t.status !== 'done').length }
  })

  if (groupBy === 'dia') columns = columns.filter((c) => c.tasks.length > 0)

  return columns
}
