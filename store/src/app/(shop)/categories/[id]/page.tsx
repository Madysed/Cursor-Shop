'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@prisma/client';
import ProductGrid from '@/components/products/ProductGrid';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { SafeProduct } from '@/types';

interface CategoryPageProps {
  params: {
    id: string;
  };
}

type ProductWithDetails = Product & {
  category: Category;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productsRes] = await Promise.all([
          fetch(`/api/categories/${params.id}`),
          fetch(`/api/categories/${params.id}/products`)
        ]);

        if (!categoryRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [categoryData, productsData] = await Promise.all([
          categoryRes.json(),
          productsRes.json()
        ]);

        setCategory(categoryData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}