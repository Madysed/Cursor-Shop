'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    categoryId: string;
  };
  categories: Category[];
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
  }) => Promise<void>;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
}: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const image = formData.get('image') as string;
    const categoryId = formData.get('categoryId') as string;

    try {
      await onSubmit({
        name,
        description,
        price,
        image,
        categoryId,
      });

      router.push('/admin/products');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            defaultValue={initialData?.name}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            required
            defaultValue={initialData?.description}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0"
            step="0.01"
            defaultValue={initialData?.price}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="image"
            id="image"
            required
            defaultValue={initialData?.images[0]}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <div className="mt-1">
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialData?.categoryId}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
} 