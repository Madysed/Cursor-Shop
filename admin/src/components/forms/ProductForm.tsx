'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormData } from '@/lib/validation'
import { ImageUpload } from '../ui/ImageUpload'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface ProductFormProps {
  initialData?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { errors: apiErrors, handleError, clearErrors } = useErrorHandler()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  })

  const onSubmitHandler = async (data: ProductFormData) => {
    try {
      setIsLoading(true)
      clearErrors()
      await onSubmit(data)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {apiErrors && <ErrorMessage message={apiErrors.message} />}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('name')}
          className="mt-1 block w-full border rounded-md shadow-sm"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full border rounded-md shadow-sm"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="mt-1 block w-full border rounded-md shadow-sm"
          disabled={isLoading}
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Images
        </label>
        <ImageUpload
          value={watch('images')}
          onChange={(urls) => setValue('images', urls)}
        />
        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner /> : 'Save Product'}
      </button>
    </form>
  )
} 