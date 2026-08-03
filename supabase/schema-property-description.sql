-- Coluna de descrição livre do imóvel (Sobre o imóvel)
-- Rode no SQL Editor do Supabase.

alter table public.properties
  add column if not exists description text;
