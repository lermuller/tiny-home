# Tiny Home — plano do app publicado

Alvo: dois usuários (Evelyn e Leo), um domicílio. Requisitos que o usuário marcou como essenciais:
**sync entre os dois celulares**, **push de verdade** (resumo do dia e atrasos), **login simples só para
eles dois**, **histórico do que já foi feito**. Offline no mercado não foi marcado como essencial, mas sai
quase de graça no caminho abaixo — vale manter.

## Recomendação de stack

**PWA instalável** (React + Vite + TypeScript) com **Supabase** (Postgres + Auth + Realtime) e um cron
diário para as notificações. Motivos:

- Um único codebase para os dois celulares, sem loja, sem revisão da Apple, deploy em segundos.
- Realtime pronto: o Postgres Changes do Supabase sincroniza as duas telas sem escrever servidor.
- Custo real ~zero nesse volume (free tier de Supabase + Vercel/Netlify).
- Push funciona em iOS **desde que o app seja instalado na tela de início** (Web Push com
  `apple-mobile-web-app-capable`, iOS 16.4+). Em Android funciona instalado ou no navegador.

Alternativa se push confiável em iOS virar prioridade absoluta: **Expo (React Native)** + Expo Push +
Supabase, publicando via TestFlight/internal testing. Mais trabalho de release, notificação mais robusta.
Não recomendo começar por aí.

## Esquema (Postgres / Supabase)

```sql
-- pessoas do domicílio
create table members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique,   -- login
  name text not null,                          -- 'Evelyn' | 'Leo'
  initial text not null,
  color text not null                          -- '#c67139' | '#7a8a5e'
);

create type freq   as enum ('diaria','semanal','mensal','pontual');
create type tstatus as enum ('todo','doing','done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  frequency freq not null,
  owner_id uuid references members(id),        -- null = "Os dois"
  room text,
  weekday smallint,          -- 0..6, só para 'semanal'
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
create view frequent_items as
  select list_id, name, count(*) as times
  from list_items where done group by list_id, name
  order by times desc;
```

**RLS:** política única "é membro do domicílio" — `exists (select 1 from members where user_id = auth.uid())`
em select/insert/update/delete de todas as tabelas. Com um domicílio só, isso já basta; se um dia houver
mais casas, adicione `household_id` em tudo e filtre por ele.

## Login simples (só vocês dois)

- Supabase Auth com **magic link** por e-mail (sem senha) ou OTP por e-mail. Zero tela de cadastro.
- Cadastro fechado: `members` é semeado com os dois e-mails; o trigger de `auth.users` só cria vínculo se o
  e-mail estiver na lista. Quem não está, não entra.
- Sessão longa (`persistSession`), então na prática nenhum dos dois vê tela de login depois da primeira vez.

## Recorrência (o ponto delicado)

Regra do protótipo: tarefa recorrente **reaparece sozinha** no dia certo e **acumula atraso visível**.
Implementação sem servidor próprio:

1. `tasks.due_on` guarda a próxima ocorrência.
2. Ao marcar feita: insere em `task_completions`, `status='todo'`, e `due_on` avança —
   diária `+1 dia`, semanal próximo `weekday`, mensal próximo `month_day` (com clamp de fim de mês:
   dia 31 em fevereiro → último dia). Pontual: `status='done'` e sai do ciclo.
3. Um **cron diário do Supabase (pg_cron, 5:00 local)** recalcula os atrasos: `due_on < today` e
   `status <> 'done'` → a UI mostra "Passou da hora" e o contador em dias/semanas/meses.
   Nada precisa "criar" tarefas — a mesma linha muda de `due_on`.
4. Fusos: guarde o fuso do domicílio em uma tabela `settings` e faça as contas com `at time zone`.

## Push

- **Web Push (VAPID)** com service worker. Assinatura por dispositivo em `push_subscriptions`
  (member_id, endpoint, keys, platform).
- Requisito iOS: o app precisa estar **instalado na tela de início**; peça permissão só depois de instalado,
  num momento com contexto (tela Nossa casa → Avisos), nunca no primeiro segundo.
- Três jobs, espelhando os switches da tela Avisos:
  - **Resumo do dia** — cron 8:00: para cada membro, o que é dele hoje. Silencia se não houver nada.
  - **Cutucão de atraso** — cron 19:00: tarefas com `due_on` 2+ dias no passado; a mensagem é a mesma da
    prévia do design ("'Regar as plantas' está esperando desde ontem. Quem pega?").
  - **Item novo na lista** — trigger de `list_items` → Edge Function, notificando **o outro** membro
    (nunca quem digitou), com agrupamento de 5 minutos para não virar metralhadora.
- Guarde as preferências em `members.notif_prefs jsonb` — são os três toggles do design.

## Offline (recomendado manter)

- Service worker com precache do app shell (Workbox) + cache das listas.
- Marcar item comprado offline: fila local (IndexedDB) e replay ao voltar a rede.
- Conflitos: last-write-wins por campo é suficiente aqui, exceto `list_items.done`, onde "comprado" ganha de
  "não comprado" (se um dos dois marcou, o item foi comprado).

## Histórico

Com `task_completions` populado, entregue na tela Nossa casa (fase 2):
- "N feitas esta semana" por pessoa — já existe no design, hoje calculado do estado local.
- Últimas 30 conclusões (quem, o quê, quando).
- Por tarefa: "feita 6 vezes nos últimos 3 meses; em média a cada 12 dias" — é o que responde
  "há quanto tempo não fazemos isso".

## Estrutura sugerida do repo (`lermuller/tiny-home`)

```
src/
  app/            rotas: hoje, quadro, compras, compras/:listId, casa
  components/     TaskRow, TaskCard, BoardColumn, ListCard, ItemRow, Sheet, Toast, Switch, Pill, Logo
  features/
    tasks/        queries, mutations, recurrence.ts (mesma regra do passo 2 no cliente, para otimismo)
    lists/
    notifications/
  design/         tokens.css (copiar de styles.css do Organic), fonts
  lib/            supabase.ts, push.ts, offline-queue.ts
supabase/
  migrations/     schema acima
  functions/      daily-digest, late-nudge, item-added
public/           manifest.webmanifest, icons (192/512/1024 do logo), sw.js
```

## Fases

1. **Semana 1 — casca real:** auth por magic link, tabelas + RLS, Hoje e Quadro lendo/escrevendo do
   Supabase, realtime ligado, PWA instalável com o ícone do logo. Recorrência no cliente.
2. **Semana 2 — compras:** listas, itens, seções, criar lista, modo mercado, itens frequentes da view,
   offline básico.
3. **Semana 3 — avisos:** VAPID, service worker, os três jobs, tela de Avisos ligada de verdade.
4. **Depois:** histórico e estatísticas, arrastar cartão entre colunas, revezamento automático de tarefa
   (já desenhado em versão anterior, fácil de reativar).

## Hospedagem e custo

Vercel ou Netlify (free) + Supabase (free até 500 MB de banco e 50k MAU) = **R$ 0/mês** nesse uso.
Domínio próprio é opcional; um `tiny-home.vercel.app` instalado na tela de início já parece um app.
Só saia do free se quiserem histórico de anos com anexos/fotos.
