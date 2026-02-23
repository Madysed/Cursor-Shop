// Direct Prisma usage causes issues in the browser
// Using fetch API instead

export async function getCategories() {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoryById(id: string) {
  try {
    const response = await fetch(`/api/categories/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category ${id}`);
    }
    const category = await response.json();
    return category;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
} 