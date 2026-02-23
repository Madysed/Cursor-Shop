export interface SafeUser {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SafeCategory {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SafeProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: Image[]
  categoryId: string
  category: SafeCategory
  createdAt: Date
  updatedAt: Date
}

export interface SafeReview {
  id: string
  rating: number
  comment: string
  userId: string
  productId: string
  createdAt: Date
  updatedAt: Date
}

export interface SafeOrder {
  id: string
  userId: string
  total: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
}

export interface SafeOrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export interface SafeCart {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface SafeCartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Image {
  id: string
  url: string
  productId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: Image[]
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category: Category
  reviews: Review[]
}

export interface Category {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  quantity: number
  productId: string
  cartId: string
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  productId: string
  orderId: string
  product: Product
}

export interface Order {
  id: string
  userId: string
  total: number
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
  user: SafeUser
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  productId: string
  createdAt: Date
  updatedAt: Date
  user: SafeUser
} 