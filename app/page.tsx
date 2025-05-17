'use client';

import { useState, useEffect } from 'react';
import { getProducts, getCategories, getBrands, type Product, type Category, type Brand } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { FilterSection } from '@/components/FilterSection';
import { Button } from '@/components/ui/button';

// Define filter type for better type safety
interface ProductFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  priceRange: { min: number; max: number };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedBrand: 'all',
    priceRange: { min: 0, max: 1000000 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedBrands] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ]);
        
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    // Filter by search term
    const matchesSearch = filters.searchTerm === '' || 
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = filters.selectedCategory === 'all' || 
      product.category_id === filters.selectedCategory;
    
    // Filter by brand
    const matchesBrand = filters.selectedBrand === 'all' || 
      product.brand_id === filters.selectedBrand;
    
    // Filter by price range
    const matchesPrice = 
      product.price >= filters.priceRange.min && 
      product.price <= filters.priceRange.max;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Update filters
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto pt-4 pb-8 px-4 sm:pt-6 md:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">קטלוג מוצרים</h1>
      
      {/* Filters */}
      <FilterSection 
        categories={categories}
        brands={brands}
        onFilterChange={handleFilterChange}
        defaultFilters={filters}
      />
      
      {/* Products grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4"></div>
            <p>טוען מוצרים...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">לא נמצאו מוצרים מתאימים</p>
          <Button 
            onClick={() => setFilters({
              searchTerm: '',
              selectedCategory: 'all',
              selectedBrand: 'all',
              priceRange: { min: 0, max: 1000000 }
            })}
          >
            נקה מסננים
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {/* Product count */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          מציג {filteredProducts.length} מוצרים מתוך {products.length}
        </div>
      )}
    </div>
  );
}
