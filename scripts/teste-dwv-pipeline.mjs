/**
 * Teste rápido do pipeline: GraphQL DWV → baixa 1 foto do S3 → WebP com sharp
 * Uso: node scripts/teste-dwv-pipeline.mjs
 */
import sharp from 'sharp'

const TRACKED_LINK_ID = '6f59e724-2ada-4b40-9aef-1dee02d424b1'
const S3_BASE = 'https://dwvimages.s3.amazonaws.com'

const GET_TRACKED_LINK = `
  query getTrackedLink($id: String!) {
    getTrackedLink(id: $id) {
      id
      title
      property {
        id
        name
        status
        files { pictures }
      }
      user { name pixel username email }
    }
  }
`

const res = await fetch('https://dwvapp.com.br/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://lp.dwvapp.com.br',
    Referer: 'https://lp.dwvapp.com.br/',
  },
  body: JSON.stringify({
    operationName: 'getTrackedLink',
    variables: { id: TRACKED_LINK_ID },
    query: GET_TRACKED_LINK,
  }),
})

const json = await res.json()
if (json.errors) {
  console.error('ERRO GraphQL:', JSON.stringify(json.errors, null, 2))
  process.exit(1)
}

const link = json.data.getTrackedLink
const pics = link.property?.files?.pictures || []
console.log('OK GraphQL')
console.log('  título:', (link.property?.name || link.title || '').trim())
console.log('  fotos:', pics.length)
console.log('  corretor:', link.user?.name?.trim())

if (!pics[0]) {
  console.error('Sem fotos')
  process.exit(1)
}

const url = S3_BASE + pics[0]
console.log('Baixando:', url)
const imgRes = await fetch(url, { headers: { Referer: 'https://lp.dwvapp.com.br/' } })
if (!imgRes.ok) {
  console.error('Falha S3:', imgRes.status)
  process.exit(1)
}

const input = Buffer.from(await imgRes.arrayBuffer())
const webp = await sharp(input)
  .rotate()
  .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82 })
  .toBuffer()
const meta = await sharp(webp).metadata()

console.log('OK WebP')
console.log('  original bytes:', input.byteLength)
console.log('  webp bytes:', webp.byteLength)
console.log('  dim:', meta.width, 'x', meta.height)
console.log('Pipeline pronto — pode usar POST /api/admin/import-dwv')
