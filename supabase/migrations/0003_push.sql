-- Tiny Home — Web Push
-- Ver ARQUITETURA.md, seção "Push".

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  platform text,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
create policy "household_members_only" on push_subscriptions
  for all using (public.is_member()) with check (public.is_member());

-- fila de agrupamento do aviso "Item novo na lista": cada linha acumula os nomes dos itens
-- adicionados numa lista, para um membro, dentro da janela de 5 min; a função item-added
-- (chamada por cron a cada minuto) despacha e fecha as linhas cuja janela já passou.
create table pending_item_notifications (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  notify_member_id uuid not null references members(id) on delete cascade,
  item_names text[] not null default '{}',
  first_added_at timestamptz not null default now(),
  notified boolean not null default false
);

alter table pending_item_notifications enable row level security;
create policy "household_members_only" on pending_item_notifications
  for all using (public.is_member()) with check (public.is_member());
