export const UserTypes = {
  Admin: 'ADMIN',
  PrivateSeller: 'PRIVATE_SELLER',
  BusinessSeller: 'BUSINESS_SELLER',
  Buyer: 'BUYER'
} as const

export type UserType = typeof UserTypes[keyof typeof UserTypes]

// Array for form dropdown options
export const userTypes = [
  { label: 'Admin', value: UserTypes.Admin },
  { label: 'Private Seller', value: UserTypes.PrivateSeller },
  { label: 'Business Seller', value: UserTypes.BusinessSeller },
  { label: 'Buyer', value: UserTypes.Buyer }
]