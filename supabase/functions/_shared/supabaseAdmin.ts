import { createClient } from 'npm:@supabase/supabase-js@2'

// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetadas automaticamente em toda Edge Function.
export function supabaseAdmin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
