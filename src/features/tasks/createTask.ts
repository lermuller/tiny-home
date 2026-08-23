import { supabase } from '../../lib/supabase'
import type { Freq } from '../../lib/types'
import { computeInitialDueOn } from './computeInitialDueOn'

export interface NewTaskInput {
  title: string
  frequency: Freq
  ownerId: string | null
  weekday: number | null
  monthDay: number | null
}

export async function createTask(input: NewTaskInput) {
  const due_on = computeInitialDueOn(input.frequency, input.weekday, input.monthDay)

  const { error } = await supabase.from('tasks').insert({
    title: input.title,
    frequency: input.frequency,
    owner_id: input.ownerId,
    room: 'Casa',
    weekday: input.frequency === 'semanal' ? input.weekday : null,
    month_day: input.frequency === 'mensal' ? input.monthDay : null,
    status: 'todo',
    remind: true,
    due_on,
  })

  return { error }
}
