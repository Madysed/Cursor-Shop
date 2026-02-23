export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
} 