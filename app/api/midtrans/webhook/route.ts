// app/api/midtrans/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateOrderPaymentStatus } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSig = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Tentukan status pembayaran
    let paymentStatus = 'pending'
    if (transaction_status === 'capture' && fraud_status === 'accept') {
      paymentStatus = 'paid'
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'paid'
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      paymentStatus = 'failed'
    } else if (transaction_status === 'refund') {
      paymentStatus = 'refunded'
    }

    // Update order di Supabase
    await updateOrderPaymentStatus(order_id, paymentStatus, payment_type)

    console.log(`[Midtrans] Order ${order_id} → ${paymentStatus} (${payment_type})`)

    return NextResponse.json({ status: 'ok', orderId: order_id, paymentStatus })
  } catch (error) {
    console.error('[Midtrans webhook error]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
