'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      return;
    }

    setDeleting(categoryId);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors duration-200"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add New Category</span>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <div className="space-y-2">
                <p className="text-red-400">No categories matching "{searchTerm}" were found</p>
                <p className="text-gray-400 text-sm">Try searching with different keywords</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400">No categories found</p>
                <Link
                  href="/admin/categories/new"
                  className="text-blue-400 hover:text-blue-300 font-medium mt-4 inline-block"
                >
                  Add your first category
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500 transition-colors duration-300"
              >
                <div className="aspect-square relative">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-600 text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-200 text-lg mb-2">{category.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Added {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors duration-200 inline-flex items-center space-x-1"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deleting === category.id}
                      className={`px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-200 inline-flex items-center space-x-1 ${
                        deleting === category.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deleting === category.id ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-t-2 border-red-400 rounded-full mr-1"></span>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 