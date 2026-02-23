import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group relative"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={category.imageUrl || '/placeholder.jpg'}
                alt={category.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold text-white px-4 py-2 rounded">
                {category.name}
              </h3>
            </div>
            <div className="mt-2 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
        {categories.length === 0 && (
          <p className="col-span-3 text-center text-gray-500">
            No categories found. Add some categories in the admin panel!
          </p>
        )}
      </div>
    </div>
  )
}