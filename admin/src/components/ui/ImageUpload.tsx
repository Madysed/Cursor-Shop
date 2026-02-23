import { useState } from 'react'
import Image from 'next/image'
import { LoadingSpinner } from './LoadingSpinner'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {value.map((url) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemove(url)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            multiple
            className="hidden"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Add Images'}
            </span>
          </div>
        </label>
      </div>
      {isUploading && (
        <div className="flex items-center text-sm text-gray-500">
          <LoadingSpinner />
          <span className="ml-2">Uploading images...</span>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Drag and drop images or click to select. Supports multiple uploads.
      </p>
    </div>
  )
} 