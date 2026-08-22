-- Tiny Home — migração inicial
-- Schema, RLS, função de conclusão de tarefa, vínculo de login e seeds.
-- Ver ARQUITETURA.md ("Esquema", "RLS", "Login simples", "Recorrência").

-- ═══════════════════════════════════════════════════════════════════════
-- Schema
-- ═══════════════════════════════════════════════════════════════════════

create table members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique,   -- login
  email text not null unique,                  -- usado pelo trigger de login para vincular a auth.users
  name text not null,                          -- 'Evelyn' | 'Leo'
  initial text not null,
  color text not null                          -- '#c67139' | '#7a8a5e'
);

create type freq as enum ('diaria', 'semanal', 'mensal', 'pontual');
create type tstatus as enum ('todo', 'doing', 'done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  frequency freq not null,
  owner_id uuid references members(id),        -- null = "Os dois"
  room text,
  weekday smallint,          -- 0..6 (domingo=0 .. sábado=6), só para 'semanal'
  month_day smallint,        -- 1..31, só para 'mensal'
  status tstatus not null default 'todo',
  remind boolean not null default true,
  due_on date,               -- próxima ocorrência (o motor de recorrência escreve aqui)
  last_done_at timestamptz,
  created_at timestamptz default now()
);

-- histórico: uma linha por conclusão (é isso que responde "quem fez o quê")
create table task_completions (
  id bigserial primary key,
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references members(id),
  completed_at timestamptz not null default now(),
  due_on date                -- a ocorrência que foi fechada (permite ver atrasos históricos)
);

create table lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tone text not null default 'accent',         -- accent | accent2 | neutral
  sectioned boolean not null default false,
  position int not null default 0
);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  name text not null,
  section text,
  done boolean not null default false,
  done_at timestamptz,
  added_by uuid references members(id),
  position int not null default 0
);

-- itens frequentes: derivados, não digitados
-- security_invoker garante que a RLS de list_items seja avaliada com o papel de quem consulta,
-- não com o dono da view (senão a política única abaixo seria contornada).
create view frequent_items
with (security_invoker = true)
as
  select list_id, name, count(*) as times
  from list_items where done group by list_id, name
  order by times desc;

-- ═══════════════════════════════════════════════════════════════════════
-- Funções auxiliares de recorrência mensal
-- (compartilhadas entre o seed e complete_task, ambos precisam do mesmo
-- clamp de fim de mês: dia 31 em fevereiro → último dia)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.clamped_month_date(p_year int, p_month int, p_day int)
returns date
language sql
immutable
as $$
  select least(
    make_date(p_year, p_month, 1) + (p_day - 1),
    (make_date(p_year, p_month, 1) + interval '1 month - 1 day')::date
  );
$$;

create or replace function public.next_month_due(p_day int, p_from date)
returns date
language plpgsql
immutable
as $$
declare
  v_this_month date;
  v_next_month_anchor date;
begin
  v_this_month := public.clamped_month_date(extract(year from p_from)::int, extract(month from p_from)::int, p_day);
  if v_this_month > p_from then
    return v_this_month;
  end if;
  v_next_month_anchor := (p_from + interval '1 month')::date;
  return public.clamped_month_date(extract(year from v_next_month_anchor)::int, extract(month from v_next_month_anchor)::int, p_day);
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- RLS — política única "é membro do domicílio"
-- ═══════════════════════════════════════════════════════════════════════

-- security definer + search_path fixo: evita recursão de RLS ao consultar
-- members de dentro da própria política de members, e evita sequestro de search_path.
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from members where user_id = auth.uid());
$$;

alter table members enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;

create policy "household_members_only" on members
  for all using (public.is_member()) with check (public.is_member());
create policy "household_members_only" on tasks
  for all using (public.is_member()) with check (public.is_member());
create policy "household_members_only" on task_completions
  for all using (public.is_member()) with check (public.is_member());
create policy "household_members_only" on lists
  for all using (public.is_member()) with check (public.is_member());
create policy "household_members_only" on list_items
  for all using (public.is_member()) with check (public.is_member());

-- ═══════════════════════════════════════════════════════════════════════
-- complete_task — passo 2 de "Recorrência": grava a conclusão e avança due_on
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.complete_task(p_task uuid, p_member uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task tasks%rowtype;
  v_next_due date;
begin
  -- security definer contorna a RLS das tabelas abaixo, então a checagem de
  -- household precisa ser refeita aqui dentro (senão qualquer authenticated chamaria isto).
  if not public.is_member() then
    raise exception 'Não autorizado.';
  end if;

  select * into v_task from tasks where id = p_task;
  if not found then
    raise exception 'Tarefa não encontrada.';
  end if;

  insert into task_completions (task_id, member_id, due_on)
  values (p_task, p_member, v_task.due_on);

  if v_task.frequency = 'pontual' then
    update tasks set status = 'done', last_done_at = now() where id = p_task;
    return;
  end if;

  v_next_due := case v_task.frequency
    when 'diaria' then coalesce(v_task.due_on, current_date) + 1
    when 'semanal' then coalesce(v_task.due_on, current_date) + 7
    when 'mensal' then public.next_month_due(v_task.month_day, coalesce(v_task.due_on, current_date))
  end;

  update tasks
  set status = 'todo', due_on = v_next_due, last_done_at = now()
  where id = p_task;
end;
$$;

revoke all on function public.complete_task(uuid, uuid) from public;
grant execute on function public.complete_task(uuid, uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- link_member — vincula auth.users a members pelo e-mail; recusa quem não está na lista
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.link_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update members
  set user_id = new.id
  where lower(email) = lower(new.email);

  if not found then
    raise exception 'E-mail % não está autorizado para o Tiny Home.', new.email;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_member();

-- ═══════════════════════════════════════════════════════════════════════
-- Seeds
-- ═══════════════════════════════════════════════════════════════════════

insert into members (email, name, initial, color) values
  ('evellynallmeida@gmail.com', 'Evelyn', 'E', '#c67139'),
  ('leo.r.muller@gmail.com', 'Leo', 'L', '#7a8a5e');

insert into lists (name, tone, sectioned, position) values
  ('Mercado', 'accent2', true, 0),
  ('Ferragem', 'accent', false, 1),
  ('Roupas', 'neutral', false, 2),
  ('Farmácia', 'accent2', false, 3);

-- due_on é calculado a partir de current_date (não de uma data fixa), para que
-- "Passou da hora" continue fazendo sentido em qualquer dia em que este arquivo seja rodado.
do $$
declare
  v_evelyn uuid;
  v_leo uuid;
begin
  select id into v_evelyn from members where email = 'evellynallmeida@gmail.com';
  select id into v_leo from members where email = 'leo.r.muller@gmail.com';

  insert into tasks (title, frequency, owner_id, room, weekday, month_day, status, remind, due_on) values
    ('Louça do jantar', 'diaria', v_evelyn, 'Cozinha', null, null, 'todo', true, current_date),
    ('Arrumar a cama', 'diaria', v_leo, 'Quarto', null, null, 'done', false, current_date + 1),
    ('Comida e água do Nino', 'diaria', null, 'Área', null, null, 'done', true, current_date + 1),
    ('Tirar o lixo', 'diaria', v_leo, 'Cozinha', null, null, 'todo', true, current_date),

    ('Aspirar a sala', 'semanal', v_leo, 'Sala', 2, null, 'done', false, current_date + 7),
    ('Lavar roupa branca', 'semanal', v_evelyn, 'Lavanderia', 5, null, 'doing', true, current_date),
    ('Trocar os lençóis', 'semanal', v_leo, 'Quarto', 0, null, 'todo', false, current_date + 2),
    ('Limpar o banheiro', 'semanal', v_evelyn, 'Banheiro', 6, null, 'todo', true, current_date + 1),
    ('Regar as plantas', 'semanal', v_leo, 'Varanda', 4, null, 'todo', true, current_date - 7),
    ('Passar pano na cozinha', 'semanal', v_evelyn, 'Cozinha', 3, null, 'todo', true, current_date - 14),

    ('Limpar a geladeira por dentro', 'mensal', v_leo, 'Cozinha', null, 5, 'todo', true, public.next_month_due(5, current_date)),
    ('Trocar o filtro do purificador', 'mensal', v_evelyn, 'Cozinha', null, 15, 'todo', true, current_date - 3),
    ('Lavar as roupas de cama pesadas', 'mensal', null, 'Lavanderia', null, 20, 'todo', false, public.next_month_due(20, current_date)),
    ('Conferir as contas do mês', 'mensal', v_evelyn, 'Escritório', null, 1, 'done', true, public.next_month_due(1, current_date)),

    ('Trocar a lâmpada do corredor', 'pontual', v_evelyn, 'Corredor', null, null, 'todo', false, null),
    ('Consertar a torneira', 'pontual', v_evelyn, 'Banheiro', null, null, 'doing', false, null),
    ('Devolver a caixa do sofá', 'pontual', v_leo, 'Sala', null, null, 'todo', false, null),
    ('Marcar o dentista', 'pontual', v_leo, 'Pessoal', null, null, 'done', false, null);
end $$;
