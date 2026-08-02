-- Painel admin v2: SEO, contatos, consultores, destaques
-- Rode no SQL Editor do Supabase (depois do schema.sql base).

-- Configurações gerais do site (1 linha)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_image_url text,
  -- Contatos / empresa
  company_name text,
  creci text,
  phone text,
  whatsapp text,
  email text,
  instagram text,
  address text,
  topbar_text text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  id, seo_title, seo_description, seo_keywords,
  company_name, creci, phone, whatsapp, email,
  topbar_text
) values (
  1,
  'Marcos Teodoro | Corretor de Imóveis no Litoral de SC',
  'Especialista em investimento imobiliário no litoral Norte de Santa Catarina. Imóveis à venda e para alugar em Balneário Camboriú, Itapema e Porto Belo.',
  'corretor de imóveis, Balneário Camboriú, Itapema, Porto Belo, imóveis litoral SC',
  'Marcos Teodoro',
  'CRECI SC 71914',
  '47991594019',
  '5547991594019',
  'Mestreafil@gmail.com',
  'CRECI SC 71914 | Balneário Camboriú, Itapema, Porto Belo, Bombinhas'
) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin write site settings" on public.site_settings;
create policy "Admin write site settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

-- Consultores imobiliários (WhatsApp por faixa)
create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  creci text,
  photo_url text,
  budget_band text not null check (budget_band in ('ate1m', 'de1a2', 'de2a3', 'acima3m')),
  budget_label text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists consultants_budget_band_uidx
  on public.consultants (budget_band)
  where active = true;

alter table public.consultants enable row level security;

drop policy if exists "Public read active consultants" on public.consultants;
create policy "Public read active consultants"
  on public.consultants for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Admin full consultants" on public.consultants;
create policy "Admin full consultants"
  on public.consultants for all
  to authenticated
  using (true)
  with check (true);

insert into public.consultants (name, whatsapp, budget_band, budget_label, sort_order, creci)
select * from (values
  ('Consultor faixa 1', '5547991594019', 'ate1m', 'Até 1 milhão', 1, null::text),
  ('Consultor faixa 2', '5547991594019', 'de1a2', 'De 1 a 2 milhões', 2, null::text),
  ('Consultor faixa 3', '5547991594019', 'de2a3', 'De 2 a 3 milhões', 3, null::text),
  ('Marcos Teodoro', '5547991594019', 'acima3m', 'Acima de 3 milhões', 4, 'CRECI SC 71914')
) as v(name, whatsapp, budget_band, budget_label, sort_order, creci)
where not exists (select 1 from public.consultants limit 1);

-- Destaques no site
alter table public.properties
  add column if not exists is_featured boolean not null default false;

alter table public.properties
  add column if not exists featured_order int not null default 0;

create index if not exists properties_featured_idx
  on public.properties (is_featured, featured_order)
  where is_featured = true;
