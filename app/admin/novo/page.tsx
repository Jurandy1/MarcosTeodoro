import { redirect } from 'next/navigation'

export default function LegacyAdminNovoRedirect() {
  redirect('/admin/imoveis/novo')
}
