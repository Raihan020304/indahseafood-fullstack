// lib/db.ts
// Helper functions untuk query Supabase
import { createServiceClient } from '@/lib/supabase/server'
import { CartItem, ShippingAddress, ShippingOption } from '@/types'

// ─── TYPES ────────────────────────────────────────────────────

export interface DbOrder {
  id: string
  user_id: string | null
  user_email: string
  user_name: string | null
  shipping_address: ShippingAddress
  shipping_provider: string
  shipping_service: string
  shipping_cost: number
  shipping_distance: number | null
  shipping_eta: string | null
  subtotal: number
  total: number
  status: string
  payment_status: string
  midtrans_order_id: string | null
  snap_token: string | null
  payment_url: string | null
  payment_method: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  order_items?: DbOrderItem[]
}

export interface DbOrderItem {
  id: string
  order_id: string
  product_id: string
  name: string
  price: number
  quantity: number
  unit: string
  weight: number
  thumbnail: string | null
  notes: string | null
}

export interface DbUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'customer' | 'admin'
  created_at: string
}

// ─── USER ──────────────────────────────────────────────────────

export async function upsertUser(data: {
  email: string
  name?: string | null
  image?: string | null
}) {
  const supabase = createServiceClient()
  const { data: user, error } = await supabase
    .from('users')
    .upsert(
      { email: data.email, name: data.name, image: data.image },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) console.error('upsertUser error:', error)
  return user as DbUser | null
}

export async function getUserByEmail(email: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  return data as DbUser | null
}

export async function isAdmin(email: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  return user?.role === 'admin'
}

// ─── ORDERS ────────────────────────────────────────────────────

export async function createOrder(params: {
  id: string
  userEmail: string
  userName: string | null
  items: CartItem[]
  shippingAddress: ShippingAddress
  shippingOption: ShippingOption
  subtotal: number
  total: number
  snapToken: string
  paymentUrl: string
}) {
  const supabase = createServiceClient()

  // Upsert user dulu
  await upsertUser({ email: params.userEmail, name: params.userName })

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: params.id,
      user_email: params.userEmail,
      user_name: params.userName,
      shipping_address: params.shippingAddress,
      shipping_provider: params.shippingOption.provider,
      shipping_service: params.shippingOption.serviceName,
      shipping_cost: params.shippingOption.price,
      shipping_distance: params.shippingOption.distance,
      shipping_eta: params.shippingOption.estimatedTime,
      subtotal: params.subtotal,
      total: params.total,
      status: 'pending',
      payment_status: 'pending',
      snap_token: params.snapToken,
      payment_url: params.paymentUrl,
    })
    .select()
    .single()

  if (orderError) throw new Error(`Create order failed: ${orderError.message}`)

  // Insert order items
  const items = params.items.map(item => ({
    order_id: params.id,
    product_id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    unit: item.product.unit,
    weight: item.product.weight,
    thumbnail: item.product.thumbnail,
    notes: item.notes || null,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items)

  if (itemsError) throw new Error(`Create order items failed: ${itemsError.message}`)

  return order as DbOrder
}

export async function getOrdersByEmail(email: string): Promise<DbOrder[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_email', email)
    .order('created_at', { ascending: false })

  if (error) console.error('getOrdersByEmail error:', error)
  return (data || []) as DbOrder[]
}

export async function getOrderById(id: string): Promise<DbOrder | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  return data as DbOrder | null
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentMethod?: string
) {
  const supabase = createServiceClient()
  const newStatus = paymentStatus === 'paid' ? 'processing' : undefined

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      ...(newStatus && { status: newStatus }),
      ...(paymentMethod && { payment_method: paymentMethod }),
    })
    .eq('id', orderId)

  if (error) console.error('updateOrderPaymentStatus error:', error)
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}

export async function updateAdminNotes(orderId: string, notes: string) {
  const supabase = createServiceClient()
  await supabase.from('orders').update({ admin_notes: notes }).eq('id', orderId)
}

// ─── ADMIN QUERIES ─────────────────────────────────────────────

export async function getAllOrders(params?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<{ data: DbOrder[]; count: number }> {
  const supabase = createServiceClient()
  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params?.limit) query = query.limit(params.limit)
  if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1)

  const { data, error, count } = await query
  if (error) console.error('getAllOrders error:', error)
  return { data: (data || []) as DbOrder[], count: count || 0 }
}

export async function getDashboardStats() {
  const supabase = createServiceClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalOrders },
    { count: todayOrders },
    { data: revenueData },
    { count: pendingOrders },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('users').select('*', { count: 'exact', head: true })
      .eq('role', 'customer'),
  ])

  const totalRevenue = (revenueData || []).reduce((sum, o) => sum + (o.total || 0), 0)

  return {
    totalOrders: totalOrders || 0,
    todayOrders: todayOrders || 0,
    totalRevenue,
    pendingOrders: pendingOrders || 0,
    totalCustomers: totalCustomers || 0,
  }
}

export async function getRecentOrders(limit = 10): Promise<DbOrder[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as DbOrder[]
}

// ─── PRODUCTS (DB) ─────────────────────────────────────────────

export async function getAllProductsFromDb() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateProductStock(productId: string, stock: number) {
  const supabase = createServiceClient()
  await supabase.from('products').update({ stock }).eq('id', productId)
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const supabase = createServiceClient()
  await supabase.from('products').update({ is_active: isActive }).eq('id', productId)
}
