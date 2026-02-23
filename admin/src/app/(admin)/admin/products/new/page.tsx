'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiSave, FiUpload, FiArrowLeft, FiX, FiImage } from 'react-icons/fi';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

// Helper component to render images appropriately based on URL type
const ProductImage = ({ src }: { src: string }) => {
  return (
    <img 
      src={src} 
      alt="Product" 
      className="w-full h-full object-cover"
    />
  );
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              resolve(blob);
            },
            'image/jpeg',
            0.7 // Quality (0.7 = 70% quality)
          );
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null); // Reset error state

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const price = parseFloat(formData.get('price') as string);
      const stock = parseInt(formData.get('stock') as string);
      const categoryId = formData.get('categoryId') as string;

      // Validate required fields
      if (!name || !description || isNaN(price) || isNaN(stock)) {
        throw new Error('Please fill in all required fields');
      }

      // Validate price and stock
      if (price < 0) throw new Error('Price cannot be negative');
      if (stock < 0) throw new Error('Stock cannot be negative');

      const productData = {
        name,
        description,
        price,
        stock,
        ...(categoryId && categoryId !== "" && { categoryId }),
        images,
      };

      console.log('Sending product data:', JSON.stringify(productData)); // Detailed debug log

      // Show loading toast
      toast.loading('Creating product...');
      
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('API response:', responseData); // Debug log
        toast.dismiss();

        if (!response.ok) {
          throw new Error(responseData.error || responseData.details || 'Failed to create product');
        }

        toast.success('Product created successfully');
        router.push('/admin/products');
        router.refresh();
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(fetchError instanceof Error ? fetchError.message : 'Network error occurred');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
      setError(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      toast.loading('Uploading image...');

      // First create a temporary preview for immediate feedback
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgPreview = event.target?.result as string;
        // Add temporary preview
        setImagePreviews(prev => [...prev, imgPreview]);
        
        // Continue with upload
        compressAndUploadImage(file, imgPreview);
      };
      reader.readAsDataURL(file);
      
      // Clear file input
      e.target.value = '';
    } catch (error) {
      console.error('Error preparing image:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const compressAndUploadImage = async (file: File, tempPreview: string) => {
    try {
      // Compress image
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
      });

      // Upload compressed image
      const formData = new FormData();
      formData.append('file', compressedFile);

      console.log('Uploading image, size:', compressedFile.size); // Debug log

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData); // Debug log
        throw new Error(errorData.error || errorData.details || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload success data:', data); // Debug log

      if (!data.success || !data.url) {
        throw new Error('Invalid response from server');
      }

      // Replace the temporary preview with the actual server URL
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        const tempIndex = newPreviews.indexOf(tempPreview);
        if (tempIndex !== -1) {
          newPreviews[tempIndex] = data.url;
        }
        return newPreviews;
      });
      
      setImages(prev => [...prev, data.url]);
      toast.dismiss();
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      
      // Remove the temporary preview if upload failed
      setImagePreviews(prev => prev.filter(p => p !== tempPreview));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Removing image at index:', index);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin/products" 
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-blue-400">Add New Product</h1>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                  Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
                  Stock <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  required
                  min="0"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter stock quantity"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Images <span className="text-gray-400">(Optional)</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-600">
                        <ProductImage src={url} />
                        <button
                          type="button"
                          onClick={(e) => handleRemoveImage(e, index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-md transition-colors duration-200"
                          aria-label="Remove image"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <label
                    htmlFor="imageUpload"
                    className={`cursor-pointer aspect-square rounded-lg border-2 border-dashed border-gray-600 bg-gray-700 flex flex-col items-center justify-center hover:bg-gray-600/30 transition-colors duration-200 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      <>
                        <FiImage className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Add Image</span>
                      </>
                    )}
                    <input
                      id="imageUpload"
                      name="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                
                <p className="text-xs text-gray-400">
                  Upload product images (max 5MB each). PNG, JPG, GIF accepted.
                </p>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
              <Link
                href="/admin/products"
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-500/50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>Create Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 