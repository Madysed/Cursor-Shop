import Image from 'next/image';
import Link from 'next/link';
import { Product, Category } from '@prisma/client';
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: Product & {
    category?: Category | null;
    images: any[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const getImageUrl = (image: any): string => {
    if (typeof image === 'string') {
      return image;
    } else if (image && typeof image === 'object') {
      return image.url || image.imageUrl || '';
    }
    return '';
  };

  const firstImageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-transform duration-200 hover:scale-105 group">
      {/* Product Image */}
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            {firstImageUrl ? (
              <Image
                src={firstImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
              <p className="text-sm font-semibold">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>
            
            {/* Category Tag - Only if category exists */}
            {product.category?.name && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link 
          href={`/products/${product.id}`}
          className="block"
        >
          <h3 className="font-medium text-gray-900 text-lg line-clamp-1 transition-colors group-hover:text-indigo-600">
            {product.name}
          </h3>
          <p className="mt-1 text-gray-500 text-sm line-clamp-2">
            {product.description}
          </p>
        </Link>
        
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm flex-shrink-0"
          >
            View Details
          </Link>
          <div className="flex-grow">
            <AddToCartButton 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images.map(getImageUrl).filter(Boolean)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 