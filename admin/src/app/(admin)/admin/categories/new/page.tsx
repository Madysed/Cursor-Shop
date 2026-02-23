'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiSave, FiUpload, FiArrowLeft, FiX } from 'react-icons/fi';
import Link from 'next/link';

// Helper component to display images (both regular URLs and data URLs)
const ImageDisplay = ({ src }: { src: string }) => {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-600">
      <img 
        src={src} 
        alt="Category" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
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
      setImageFile(file);
      
      // Use FileReader for immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Failed to process image');
      setImageFile(null);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      toast.loading('Uploading image...');
      
      // Compress image before upload
      const compressedBlob = await compressImage(imageFile);
      const compressedFile = new File([compressedBlob], imageFile.name, {
        type: 'image/jpeg',
      });

      console.log('Uploading category image, size:', compressedFile.size); // Debug log

      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Category image upload response status:', res.status); // Debug log

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Upload error response:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      console.log('Upload success data:', data); // Debug log
      
      toast.dismiss();
      
      if (!data.success || !data.url) {
        throw new Error('Invalid response from server');
      }
      
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (!name) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    try {
      // Show loading toast for category creation
      toast.loading('Creating category...');
      
      let imageUrl = null;
      if (imageFile) {
        try {
          const imageData = await uploadImage();
          imageUrl = imageData.url; // Just use the url property
        } catch (imgError) {
          console.error('Image upload failed during category creation:', imgError);
          toast.dismiss();
          toast.error('Image upload failed. Please try again.');
          setLoading(false);
          return; // Stop the submission if image upload fails
        }
      }

      const categoryData = {
        name,
        imageUrl,
      };
      
      console.log('Creating category with data:', categoryData); // Debug log

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      console.log('Category creation response status:', response.status); // Debug log
      const responseData = await response.json();
      toast.dismiss();

      if (!response.ok) {
        console.error('Category creation error:', responseData); // Debug log
        throw new Error(responseData.error || 'Failed to create category');
      }

      toast.success('Category created successfully');
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin/categories" 
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-blue-400">Add New Category</h1>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>

            {/* Category Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Image <span className="text-gray-400">(Optional)</span>
              </label>
              
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative group w-24 h-24 flex-shrink-0">
                    <ImageDisplay src={imagePreview} />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <label
                  htmlFor="image"
                  className={`cursor-pointer flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-600 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingImage ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></span>
                  ) : (
                    <FiUpload className="h-5 w-5 text-gray-400" />
                  )}
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
              <Link
                href="/admin/categories"
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
                    <span>Create Category</span>
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