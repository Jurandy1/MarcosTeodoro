-- Corrige nomes duplicados: "PORTO BELO ALL RESORT — PORTO BELO ALL RESORT"
-- Rode no SQL Editor do Supabase (opcional; o site já limpa na leitura).

-- 1) Unidade igual ao empreendimento → limpa
UPDATE properties
SET unidade = NULL,
    updated_at = now()
WHERE unidade IS NOT NULL
  AND lower(trim(unidade)) = lower(trim(coalesce(empreendimento, unit_name, '')));

-- 2) Título "X — X" (mesmo texto dos dois lados) → só o primeiro
UPDATE properties
SET title = trim(both FROM split_part(regexp_replace(title, '\s+[—–\-]\s+', ' — '), ' — ', 1)),
    updated_at = now()
WHERE title ~ '[—–\-]'
  AND lower(trim(split_part(regexp_replace(title, '\s+[—–\-]\s+', ' — '), ' — ', 1)))
    = lower(trim(split_part(regexp_replace(title, '\s+[—–\-]\s+', ' — '), ' — ', 2)));

-- 3) Preferir título = empreendimento quando unidade ficou vazia
UPDATE properties
SET title = coalesce(nullif(trim(empreendimento), ''), nullif(trim(unit_name), ''), title),
    updated_at = now()
WHERE (unidade IS NULL OR trim(unidade) = '')
  AND nullif(trim(empreendimento), '') IS NOT NULL
  AND title ILIKE '%' || trim(empreendimento) || '%—%' || trim(empreendimento) || '%';
