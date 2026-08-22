// Cron 19:00 América/São Paulo (22:00 UTC). Ver ARQUITETURA.md > Push > "Cutucão de atraso".
// Mesmo texto da prévia da notificação em Nossa casa > Avisos: uma única tarefa, a mais atrasada.
import { checkCronAuth } from '../_shared/cronAuth.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { sendPush } from '../_shared/webpush.ts'

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00Z')
  const b = new Date(toISO + 'T00:00:00Z')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

Deno.serve(async (req) => {
  const authError = checkCronAuth(req)
  if (authError) return authError

  const supabase = supabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)

  const { data: oldest } = await supabase
    .from('tasks')
    .select('title, due_on')
    .lte('due_on', cutoff)
    .neq('status', 'done')
    .order('due_on', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!oldest) return new Response(JSON.stringify({ sent: 0, reason: 'sem atrasadas' }), { headers: { 'Content-Type': 'application/json' } })

  const days = daysBetween(oldest.due_on, today)
  const body = `"${oldest.title}" está esperando desde ${days === 1 ? 'ontem' : `${days} dias`}. Quem pega?`

  const [{ data: members }, { data: subs }] = await Promise.all([
    supabase.from('members').select('id, notif_prefs'),
    supabase.from('push_subscriptions').select('id, member_id, endpoint, p256dh, auth'),
  ])

  let sent = 0
  const deadSubscriptionIds: string[] = []

  for (const member of members ?? []) {
    if (!member.notif_prefs?.atraso) continue
    const memberSubs = (subs ?? []).filter((s) => s.member_id === member.id)
    for (const sub of memberSubs) {
      const ok = await sendPush(sub, { title: 'Tiny Home', body, url: '/hoje' })
      if (!ok) deadSubscriptionIds.push(sub.id)
      else sent++
    }
  }

  if (deadSubscriptionIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', deadSubscriptionIds)
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
