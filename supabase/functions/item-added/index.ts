// Duas formas de chamar esta function, ambas autenticadas pelo mesmo CRON_SECRET:
// 1. Database Webhook em list_items (insert) → enfileira o item em pending_item_notifications.
// 2. pg_cron, a cada minuto, sem corpo de webhook → despacha os grupos cuja janela de 5 min já
//    passou e manda UMA notificação por grupo. É esse desenho que implementa o "agrupando 5 minutos"
//    do ARQUITETURA.md > Push > "Item novo na lista".
import { checkCronAuth } from '../_shared/cronAuth.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { sendPush } from '../_shared/webpush.ts'

const GROUP_WINDOW_MS = 5 * 60 * 1000

interface ListItemRecord {
  list_id: string
  name: string
  added_by: string | null
}

Deno.serve(async (req) => {
  const authError = checkCronAuth(req)
  if (authError) return authError

  const supabase = supabaseAdmin()
  const payload = await req.json().catch(() => null)
  const record = payload?.record as ListItemRecord | undefined

  // chamada do pg_cron: despacha grupos vencidos
  if (!record) {
    const cutoff = new Date(Date.now() - GROUP_WINDOW_MS).toISOString()
    const { data: due } = await supabase
      .from('pending_item_notifications')
      .select('id, notify_member_id, item_names, lists(name)')
      .eq('notified', false)
      .lte('first_added_at', cutoff)

    let sent = 0
    for (const group of due ?? []) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('member_id', group.notify_member_id)

      const names = group.item_names as string[]
      const listName = (group.lists as unknown as { name: string } | null)?.name ?? 'lista'
      const body = names.length === 1 ? `${names[0]} foi adicionado na lista do ${listName}.` : `${names.length} itens novos na lista do ${listName}.`

      const deadSubscriptionIds: string[] = []
      for (const sub of subs ?? []) {
        const ok = await sendPush(sub, { title: 'Tiny Home', body, url: '/compras' })
        if (!ok) deadSubscriptionIds.push(sub.id)
        else sent++
      }
      if (deadSubscriptionIds.length > 0) {
        await supabase.from('push_subscriptions').delete().in('id', deadSubscriptionIds)
      }

      await supabase.from('pending_item_notifications').update({ notified: true }).eq('id', group.id)
    }

    return new Response(JSON.stringify({ dispatched: due?.length ?? 0, sent }), { headers: { 'Content-Type': 'application/json' } })
  }

  // chamada do Database Webhook: enfileira
  const { data: members } = await supabase
    .from('members')
    .select('id, notif_prefs')
    .neq('id', record.added_by ?? '00000000-0000-0000-0000-000000000000')

  for (const member of members ?? []) {
    if (!member.notif_prefs?.mercado) continue

    const { data: existing } = await supabase
      .from('pending_item_notifications')
      .select('id, item_names')
      .eq('list_id', record.list_id)
      .eq('notify_member_id', member.id)
      .eq('notified', false)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('pending_item_notifications')
        .update({ item_names: [...(existing.item_names as string[]), record.name] })
        .eq('id', existing.id)
    } else {
      await supabase.from('pending_item_notifications').insert({
        list_id: record.list_id,
        notify_member_id: member.id,
        item_names: [record.name],
      })
    }
  }

  return new Response(JSON.stringify({ queued: true }), { headers: { 'Content-Type': 'application/json' } })
})
