export type ListingStatus = 'Active' | 'Draft' | 'Closed'
export type SurplusListing = {
  surplusListingId: number
  productionRecordId: number
  restaurantId: number
  menuId: number
  menuName: string
  productionDate: string
  normalPrice: number
  rescuePrice: number
  initialQuantity: number
  availableQuantity: number
  pickupStart: string
  pickupEnd: string
  pickupInstructions: string | null
  status: ListingStatus
  createdAt: string
}

export type SurplusListingInput = {
  productionRecordId: number
  rescuePrice: number
  initialQuantity: number
  pickupStart: string
  pickupEnd: string
  pickupInstructions: string
  status: 'Active' | 'Draft'
}
