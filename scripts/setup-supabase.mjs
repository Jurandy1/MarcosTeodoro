/**
 * Setup inicial: cria usuário admin e verifica tabelas.
 * Uso: node --env-file=.env.local scripts/setup-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureAdminUser() {
  if (!email || !password) {
    console.log('ADMIN_EMAIL/PASSWORD não definidos — pulando usuário.')
    return
  }

  const list = await admin.auth.admin.listUsers({ perPage: 200 })
  const existing = list.data?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  )

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    })
    if (error) throw error
    console.log('✓ Usuário admin atualizado:', email)
    return
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  console.log('✓ Usuário admin criado:', email)
}

async function tryApplySchema() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sql = readFileSync(join(__dirname, '../supabase/schema.sql'), 'utf8')

  // Tenta endpoint interno do Studio (pode falhar conforme plano/projeto)
  const endpoints = [
    `${url}/pg/query`,
    `${url.replace('https://', 'https://')}/pg-meta/default/query`,
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })
      if (res.ok) {
        console.log('✓ Schema aplicado via', endpoint)
        return true
      }
    } catch {
      /* next */
    }
  }
  return false
}

async function checkTables() {
  const { error } = await admin.from('properties').select('id').limit(1)
  if (error) {
    console.log('⚠ Tabela properties ainda não existe.')
    console.log('  Abra o Supabase → SQL Editor e rode o arquivo supabase/schema.sql')
    return false
  }
  console.log('✓ Tabela properties OK')
  return true
}

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets()
  const exists = buckets?.some((b) => b.id === 'property-photos')
  if (!exists) {
    const { error } = await admin.storage.createBucket('property-photos', {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
    })
    if (error) {
      console.log('⚠ Bucket:', error.message)
      return
    }
  }
  console.log('✓ Bucket property-photos OK')
}

async function seedEmpreendimentos() {
  const seeds = [
    'Atlantic Paradise',
    'Emerald Bay Residence',
    'Horizon Tower',
    'Bella Vista Residence Club',
  ]
  const { error } = await admin.from('catalog_empreendimentos').upsert(
    seeds.map((name) => ({ name })),
    { onConflict: 'name' },
  )
  if (error) {
    console.log('⚠ Catálogo empreendimentos:', error.message)
    return
  }
  console.log('✓ Empreendimentos seed OK')
}

try {
  await ensureAdminUser()
  const applied = await tryApplySchema()
  if (!applied) {
    console.log('ℹ Schema automático indisponível neste projeto.')
  }
  const ok = await checkTables()
  if (ok) {
    await ensureBucket()
    await seedEmpreendimentos()
  }
  console.log('\nPronto. Login do painel: /admin/login')
} catch (err) {
  console.error('Setup falhou:', err)
  process.exit(1)
}
