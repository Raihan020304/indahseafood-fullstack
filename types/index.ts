// types/index.ts

export interface Product {
  id: string
  name: string
  slug: string
  category: ProductCategory
  description: string
  price: number          // harga per kg atau per pack
  unit: string           // 'kg' | 'pack' | 'ekor'
  stock: number
  images: string[]
  thumbnail: string
  weight: number         // berat dalam gram untuk ongkir
  isFresh: boolean
  isFrozen: boolean
  isPopular: boolean
  rating: number
  reviewCount: number
  tags: string[]
}

export type ProductCategory =
  | 'ikan-segar'
  | 'udang'
  | 'cumi'
  | 'kepiting-rajungan'
  | 'olahan-frozen'

export interface CartItem {
  product: Product
  quantity: number
  notes?: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalWeight: number    // gram
  subtotal: number
}

export interface ShippingOption {
  provider: 'gosend' | 'grabexpress'
  serviceType: string    // 'instant' | 'same-day'
  serviceName: string
  price: number
  estimatedTime: string  // '30-60 menit'
  distance: number       // km
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  district: string
  city: string
  province: string
  postalCode: string
  notes?: string
  lat?: number
  lng?: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  shippingAddress: ShippingAddress
  shippingOption: ShippingOption
  subtotal: number
  shippingCost: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentToken?: string
  paymentUrl?: string
  midtransOrderId?: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

export interface MidtransPayload {
  orderId: string
  amount: number
  customerDetails: {
    firstName: string
    email: string
    phone: string
  }
  itemDetails: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}
