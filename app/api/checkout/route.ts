// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSnapTransaction } from '@/lib/midtrans'
import { createOrder } from '@/lib/db'
import { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingAddress, shippingOption, subtotal, shippingCost, total, customer } = body

    if (!items?.length || !shippingAddress || !shippingOption) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const orderId = `IS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const itemDetails = [
      ...items.map((item: CartItem) => ({
        id: item.product.id,
        name: item.product.name.substring(0, 50),
        price: item.product.price,
        quantity: item.quantity,
      })),
      {
        id: `shipping-${shippingOption.provider}`,
        name: shippingOption.serviceName,
        price: shippingCost,
        quantity: 1,
      },
    ]

    // Buat Snap token Midtrans
    const snap = await createSnapTransaction({
      orderId,
      amount: total,
      customerDetails: {
        firstName: customer.name || shippingAddress.fullName,
        email: customer.email || '',
        phone: shippingAddress.phone,
      },
      itemDetails,
    })

    // Simpan order ke Supabase
    await createOrder({
      id: orderId,
      userEmail: session.user.email!,
      userName: session.user.name || null,
      items,
      shippingAddress,
      shippingOption,
      subtotal,
      total,
      snapToken: snap.token,
      paymentUrl: snap.redirect_url,
    })

    return NextResponse.json({
      orderId,
      snapToken: snap.token,
      paymentUrl: snap.redirect_url,
    })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
