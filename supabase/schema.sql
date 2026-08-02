-- Marcos Teodoro — schema do painel admin
-- Rode no SQL Editor do Supabase se o script automático falhar.

create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id text primary key,
  kind text not null check (kind in ('apartamento', 'casa')),
  mode text not null check (mode in ('venda', 'aluguel')),
  status text not null default 'rascunho' check (status in ('rascunho', 'pronto')),
  badge text,
  badge_variant text,
  location text not null default '',
  city text not null default '',
  city_key text not null default '',
  title text not null,
  unit_name text,
  empreendimento text,
  unidade text,
  bedrooms numeric not null default 0,
  bathrooms numeric not null default 0,
  suites numeric,
  parking numeric not null default 0,
  area numeric not null default 0,
  area_private numeric,
  area_total numeric,
  price text not null,
  price_value numeric,
  entrada text,
  reforco text,
  parcelamento text,
  unit_features jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  address text,
  cep text,
  source_url text,
  lat double precision,
  lng double precision,
  -- Legado: não gravar URL completa. Use cover_path + property_images.
  cover_url text,
  images jsonb not null default '[]'::jsonb,
  -- Path relativo da capa (ex: imoveis/{id}/{uuid}.webp)
  cover_path text,
  videos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_city_key_idx on public.properties (city_key);
create index if not exists properties_mode_kind_idx on public.properties (mode, kind);

-- Fotos: só path relativo + metadata (URL = STORAGE_BASE_URL + path)
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  path text not null,
  width int not null default 0,
  height int not null default 0,
  size_bytes int not null default 0,
  mime_type text not null default 'image/webp',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (property_id, path)
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

comment on column public.property_images.path is
  'Path relativo: imoveis/{imovel_id}/{uuid}.webp — nunca URL completa';
comment on column public.properties.cover_path is
  'Path relativo da capa — nunca URL completa';

create table if not exists public.catalog_empreendimentos (
  name text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_unidades (
  id bigserial primary key,
  empreendimento text not null references public.catalog_empreendimentos(name) on delete cascade,
  unidade text not null,
  unique (empreendimento, unidade)
);

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.catalog_empreendimentos enable row level security;
alter table public.catalog_unidades enable row level security;

-- Leitura pública só de imóveis prontos (site)
drop policy if exists "Public read ready properties" on public.properties;
create policy "Public read ready properties"
  on public.properties for select
  to anon, authenticated
  using (status = 'pronto');

drop policy if exists "Public read property images" on public.property_images;
create policy "Public read property images"
  on public.property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'pronto'
    )
  );

-- Admin autenticado: CRUD completo
drop policy if exists "Admin full access properties" on public.properties;
create policy "Admin full access properties"
  on public.properties for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full property images" on public.property_images;
create policy "Admin full property images"
  on public.property_images for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin read empreendimentos" on public.catalog_empreendimentos;
create policy "Admin read empreendimentos"
  on public.catalog_empreendimentos for select
  to authenticated
  using (true);

drop policy if exists "Admin write empreendimentos" on public.catalog_empreendimentos;
create policy "Admin write empreendimentos"
  on public.catalog_empreendimentos for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin read unidades" on public.catalog_unidades;
create policy "Admin read unidades"
  on public.catalog_unidades for select
  to authenticated
  using (true);

drop policy if exists "Admin write unidades" on public.catalog_unidades;
create policy "Admin write unidades"
  on public.catalog_unidades for all
  to authenticated
  using (true)
  with check (true);

-- Storage bucket para fotos
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read property photos" on storage.objects;
create policy "Public read property photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-photos');

drop policy if exists "Admin upload property photos" on storage.objects;
create policy "Admin upload property photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-photos');

drop policy if exists "Admin update property photos" on storage.objects;
create policy "Admin update property photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-photos');

drop policy if exists "Admin delete property photos" on storage.objects;
create policy "Admin delete property photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-photos');
