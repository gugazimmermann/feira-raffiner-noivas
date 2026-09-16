-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)

create table if not exists public."leads-feiras-noivas" (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  instagram text,
  whatsapp text not null,
  data_casamento date,
  created_at timestamptz not null default now()
);

alter table public."leads-feiras-noivas" enable row level security;

create policy "Anon e autenticados podem inserir leads"
  on public."leads-feiras-noivas"
  for insert
  to anon, authenticated
  with check (true);

-- Migração: se a tabela já existir, rode também:
-- alter table public."leads-feiras-noivas"
--   add column if not exists data_casamento date;
-- alter table public."leads-feiras-noivas" alter column instagram drop not null;
-- alter table public."leads-feiras-noivas" alter column data_casamento drop not null;
-- alter table public."leads-feiras-noivas" alter column whatsapp set not null;
-- alter table public."leads-feiras-noivas" drop column if exists empresa;
