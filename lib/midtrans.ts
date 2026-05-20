// lib/midtrans.ts
import { MidtransPayload } from '@/types'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

const BASE_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1'

export async function createSnapTransaction(payload: MidtransPayload) {
  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')

  const body = {
    transaction_details: {
      order_id: payload.orderId,
      gross_amount: payload.amount,
    },
    customer_details: {
      first_name: payload.customerDetails.firstName,
      email: payload.customerDetails.email,
      phone: payload.customerDetails.phone,
    },
    item_details: payload.itemDetails.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    },
  }

  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error_messages?.join(', ') || 'Midtrans error')
  }

  return res.json() as Promise<{ token: string; redirect_url: string }>
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
