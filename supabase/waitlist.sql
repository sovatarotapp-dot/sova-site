-- Sova: таблица листа ожидания.
-- Выполнить один раз в Supabase: SQL Editor → New query → вставить → Run.

create table if not exists public.waitlist (
  id          bigint generated always as identity primary key,
  email       text        not null unique,
  source      text,
  consent_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- Защита: включаем RLS и не создаём ни одной политики.
-- Так таблицу не может читать или менять никто из браузера,
-- только сервер сайта с секретным ключом.
alter table public.waitlist enable row level security;
