-- Tiny Home — preferências de aviso por pessoa
-- Ver ARQUITETURA.md, seção "Push": "Guarde as preferências em members.notif_prefs jsonb —
-- são os três toggles do design." Não estava no schema inicial (0001), só citado ali.

alter table members
  add column notif_prefs jsonb not null default '{"manha": true, "atraso": true, "mercado": false}'::jsonb;
