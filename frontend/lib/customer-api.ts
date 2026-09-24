import { ownerRequest, type Restaurant } from './menu-api'
import { readSession } from './session'

export type MarketplaceListing = {
  surplusListingId: number
  menuId: number
  menuName: string
  description: string
  category: string
  normalPrice: number
  rescuePrice: number
  discountPercent: number
  photos: string[]
  allergens: string[]
  dietTags: string[]
  allergenNote: string | null
  restaurant: Pick<Restaurant, 'restaurantId' | 'name'> & {
    address: string
    latitude: number | null
    longitude: number | null
    logoUrl: string | null
  }
  availableQuantity: number
  pickupStart: string
  pickupEnd: string
  pickupDirections: string | null
}

export type CustomerOrder = {
  orderId: number
  status: string
  totalAmount: number
  orderedAt: string
  pickupCode: string | null
  estimatedPickupAt: string | null
  items: Array<{ menuName: string; quantity: number; unitPrice: number; subtotal: number }>
}

export const customerRequest = ownerRequest
export function customerToken() {
  const session = readSession()
  return session?.role === 'Customer' ? session.token : null
}

export const cartStorageKey = 'replate-cart-v1'
export type CartLine = { surplusListingId: number; quantity: number }
export function readCart(): CartLine[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(cartStorageKey) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter((item): item is CartLine =>
      typeof item?.surplusListingId === 'number' && Number.isSafeInteger(item.surplusListingId) && item.surplusListingId > 0 &&
      typeof item?.quantity === 'number' && Number.isSafeInteger(item.quantity) && item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function saveCart(items: CartLine[]) {
  localStorage.setItem(cartStorageKey, JSON.stringify(items))
}
