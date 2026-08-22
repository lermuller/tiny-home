// Estas functions são chamadas só por pg_cron e pelo Database Webhook de list_items — nunca pelo
// cliente. Como são publicadas com --no-verify-jwt (pg_cron não manda um JWT do Supabase), a própria
// function confere um segredo compartilhado no header Authorization.
export function checkCronAuth(req: Request): Response | null {
  const expected = Deno.env.get('CRON_SECRET')
  const got = req.headers.get('Authorization')
  if (!expected || got !== `Bearer ${expected}`) {
    return new Response('unauthorized', { status: 401 })
  }
  return null
}
