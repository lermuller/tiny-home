import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

function detectPlatform() {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

// Chamada só a partir de um toque num switch de Nossa casa > Avisos — nunca no load.
// Idempotente: se já existe assinatura pra este aparelho, é um no-op.
export async function ensurePushSubscription(memberId: string): Promise<'ok' | 'unsupported' | 'denied' | 'error'> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  try {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const json = subscription.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'error'

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        member_id: memberId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        platform: detectPlatform(),
      },
      { onConflict: 'endpoint' },
    )
    if (error) return 'error'
    return 'ok'
  } catch {
    return 'error'
  }
}
