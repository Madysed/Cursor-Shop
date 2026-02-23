'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product, Category, Review } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';

type ProductWithDetails = Product & {
  category: Category;
  images: string[];
  reviews: (Review & {
    user: {
      name: string | null;
      image: string | null;
    };
  })[];
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setProduct(data);
        if (data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!session) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={selectedImage || product.images[0] || '/no-image.jpg'}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`relative h-24 w-full rounded-lg overflow-hidden ${
                  selectedImage === image ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl text-indigo-600">${product.price}</p>
          <div className="prose max-w-none">
            <p className="text-gray-600">{product.description}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              Category: <span className="font-medium">{product.category?.name || 'Uncategorized'}</span>
            </p>
            <p className="text-gray-700">
              Stock: <span className="font-medium">{product.stock}</span>
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className={`w-full bg-indigo-600 text-white py-3 px-6 rounded-lg transition-colors ${
              addingToCart || product.stock === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {addingToCart 
              ? 'Adding...' 
              : product.stock === 0 
                ? 'Out of Stock' 
                : 'Add to Cart'
            }
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                  <div className="ml-4">
                    <p className="font-medium">{review.user.name || 'Anonymous'}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 