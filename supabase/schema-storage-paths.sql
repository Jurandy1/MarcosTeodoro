-- Storage agnóstico: paths relativos + metadata das fotos
-- Rode no SQL Editor do Supabase.

-- Capa = path relativo (nunca URL completa)
alter table public.properties
  add column if not exists cover_path text;

-- Tabela de fotos com metadata (migração / R2 friendly)
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

alter table public.property_images enable row level security;

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

drop policy if exists "Admin full property images" on public.property_images;
create policy "Admin full property images"
  on public.property_images for all
  to authenticated
  using (true)
  with check (true);

-- Comentário de convenção
comment on column public.property_images.path is
  'Path relativo no bucket: imoveis/{imovel_id}/{uuid}.webp — URL = STORAGE_BASE_URL + path';

comment on column public.properties.cover_path is
  'Path relativo da capa — nunca URL completa';
