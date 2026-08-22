// Cron 8:00 América/São Paulo (11:00 UTC). Ver ARQUITETURA.md > Push > "Resumo do dia".
import { checkCronAuth } from '../_shared/cronAuth.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { sendPush } from '../_shared/webpush.ts'

Deno.serve(async (req) => {
  const authError = checkCronAuth(req)
  if (authError) return authError

  const supabase = supabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: members }, { data: tasks }, { data: subs }] = await Promise.all([
    supabase.from('members').select('id, notif_prefs'),
    supabase.from('tasks').select('id, title, owner_id').eq('due_on', today).neq('status', 'done'),
    supabase.from('push_subscriptions').select('id, member_id, endpoint, p256dh, auth'),
  ])

  let sent = 0
  const deadSubscriptionIds: string[] = []

  for (const member of members ?? []) {
    if (!member.notif_prefs?.manha) continue

    const mine = (tasks ?? []).filter((t) => t.owner_id === member.id || t.owner_id === null)
    if (mine.length === 0) continue // silencia se não houver nada

    const body = mine.length === 1 ? `"${mine[0].title}" é sua hoje.` : `${mine.length} tarefas são suas hoje.`

    const memberSubs = (subs ?? []).filter((s) => s.member_id === member.id)
    for (const sub of memberSubs) {
      const ok = await sendPush(sub, { title: 'Hoje em casa', body, url: '/hoje' })
      if (!ok) deadSubscriptionIds.push(sub.id)
      else sent++
    }
  }

  if (deadSubscriptionIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', deadSubscriptionIds)
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
