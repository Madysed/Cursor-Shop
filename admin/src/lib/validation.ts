import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
})

export const orderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
})

export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type OrderFormData = z.infer<typeof orderSchema> 