import { redirect } from 'next/navigation'

export default async function LegacyAdminEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Evita capturar rotas estáticas se cair aqui
  if (['imoveis', 'seo', 'contatos', 'consultores', 'destaques', 'login', 'novo'].includes(id)) {
    redirect(`/admin/${id}`)
  }
  redirect(`/admin/imoveis/${id}`)
}
