import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:leo.r.muller@gmail.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

export interface PushSubscriptionRow {
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

// Se a assinatura expirou/foi revogada (404/410), devolve false pro chamador decidir se apaga a linha.
export async function sendPush(sub: PushSubscriptionRow, payload: PushPayload): Promise<boolean> {
  const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 404 || status === 410) return false
    console.error('push failed', sub.endpoint, err)
    return true // erro passageiro — não apaga a assinatura
  }
}
