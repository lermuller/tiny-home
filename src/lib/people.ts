import type { Freq, TaskStatus } from './types'

export const FREQ: Record<Freq, string> = {
  diaria: 'Todo dia',
  semanal: 'Toda semana',
  mensal: 'Todo mês',
  pontual: 'Uma vez',
}

export const STATUS: Record<TaskStatus, string> = {
  todo: 'A fazer',
  doing: 'Fazendo',
  done: 'Feito',
}

// weekday: 0=domingo .. 6=sábado — mesma convenção do Postgres (extract(dow)) e de Date#getDay().
export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

// ordem de exibição (Segunda…Domingo), já que 0 (domingo) vem por último visualmente
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
