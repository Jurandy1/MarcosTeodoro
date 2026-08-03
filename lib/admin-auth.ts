/** E-mails autorizados no painel (vírgula). Fallback: ADMIN_EMAIL. */
export function allowedAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const list = allowedAdminEmails()
  // Sem lista configurada: qualquer usuário Auth autenticado (compatibilidade)
  if (list.length === 0) return true
  return list.includes(email.trim().toLowerCase())
}
