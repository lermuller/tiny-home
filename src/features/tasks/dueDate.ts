// Datas de tarefas são 'date' do Postgres (YYYY-MM-DD, sem fuso). Comparamos como string
// (funciona porque o formato é lexicograficamente ordenável) e usamos a data local do
// aparelho como "hoje" — o cron do Supabase (fase 3) é quem decide o que é "atrasado" no servidor.

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00')
  const b = new Date(toISO + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function monthsBetween(fromISO: string, toISO: string): number {
  const [fy, fm] = fromISO.split('-').map(Number)
  const [ty, tm] = toISO.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}
