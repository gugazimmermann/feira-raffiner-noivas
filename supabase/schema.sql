-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)
-- Script idempotente: pode rodar de novo sem erro.

create table if not exists public."leads-feiras-noivas" (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  data_casamento date,
  local_casamento text,
  num_convidados integer,
  created_at timestamptz not null default now()
);

-- Se a tabela já existia com schema antigo, alinha as colunas:
alter table public."leads-feiras-noivas"
  add column if not exists data_casamento date;
alter table public."leads-feiras-noivas"
  add column if not exists local_casamento text;
alter table public."leads-feiras-noivas"
  add column if not exists num_convidados integer;
alter table public."leads-feiras-noivas" drop column if exists instagram;
alter table public."leads-feiras-noivas" drop column if exists empresa;

alter table public."leads-feiras-noivas" enable row level security;

drop policy if exists "Anon e autenticados podem inserir leads"
  on public."leads-feiras-noivas";

create policy "Anon e autenticados podem inserir leads"
  on public."leads-feiras-noivas"
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(nome)) between 2 and 120
    and whatsapp ~ '^[0-9]{2}9[0-9]{8}$'
    and (local_casamento is null or char_length(local_casamento) <= 200)
    and (num_convidados is null or num_convidados between 1 and 9999)
  );
