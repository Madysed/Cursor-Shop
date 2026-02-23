import { Role, OrderStatus } from '@prisma/client';

export interface Admin {
  id: string;
  email: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  userId: string;
  user?: User;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
} 