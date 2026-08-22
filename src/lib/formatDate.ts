const MONTHS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

export function formatRelativeDateTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)

  if (diffDays === 0) return `Hoje às ${time}`
  if (diffDays === 1) return `Ontem às ${time}`
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} às ${time}`
}
