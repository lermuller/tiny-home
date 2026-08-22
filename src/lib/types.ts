export type Freq = 'diaria' | 'semanal' | 'mensal' | 'pontual'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type ListTone = 'accent' | 'accent2' | 'neutral'

export interface Member {
  id: string
  name: string
  initial: string
  color: string
}

export interface Task {
  id: string
  title: string
  frequency: Freq
  owner_id: string | null // null = "Os dois"
  room: string | null
  weekday: number | null // 0..6 (domingo=0 .. sábado=6), só 'semanal'
  month_day: number | null // 1..31, só 'mensal'
  status: TaskStatus
  remind: boolean
  due_on: string | null // date ISO 'YYYY-MM-DD'
}

export interface ListItem {
  id: string
  name: string
  sec: string
  done: boolean
}

export interface ShoppingList {
  id: string
  name: string
  tone: ListTone
  sections: boolean
  items: ListItem[]
}
