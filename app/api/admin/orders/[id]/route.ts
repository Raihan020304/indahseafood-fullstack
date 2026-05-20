// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, getOrderById, updateOrderStatus, updateAdminNotes } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, adminNotes } = await req.json()

  if (status) await updateOrderStatus(params.id, status)
  if (adminNotes !== undefined) await updateAdminNotes(params.id, adminNotes)

  return NextResponse.json({ success: true })
}
