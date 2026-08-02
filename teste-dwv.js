const TRACKED_LINK_ID = '6f59e724-2ada-4b40-9aef-1dee02d424b1'

const GET_TRACKED_LINK = `
  query getTrackedLink($id: String!) {
    getTrackedLink(id: $id) {
      id
      title
      property {
        id
        name
        propertyType
        status
        files { pictures }
      }
      user {
        id
        name
        email
        pixel
        username
        files { profile }
      }
    }
  }
`

async function testar() {
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
  console.log(JSON.stringify(json, null, 2))
}

testar().catch((err) => {
  console.error('Falha na requisição:', err)
  process.exit(1)
})
