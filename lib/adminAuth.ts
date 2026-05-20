// lib/adminAuth.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login?callbackUrl=/admin')

  const admin = await isAdmin(session.user.email)
  if (!admin) redirect('/?error=unauthorized')

  return session
}
