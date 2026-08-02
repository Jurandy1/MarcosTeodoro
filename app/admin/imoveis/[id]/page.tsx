import { PropertyAdminForm } from '@/components/admin/property-admin-form'

export default async function AdminImoveisEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PropertyAdminForm propertyId={id} />
}
