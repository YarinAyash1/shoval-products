'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { type Category, type Brand } from '@/lib/supabase';

// Define the filter interface
interface Filters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  priceRange: { min: number; max: number };
}

interface FilterSectionProps {
  categories: Category[];
  brands: Brand[];
  onFilterChange: (filters: Filters) => void;
  defaultFilters?: Filters;
}

export function FilterSection({ 
  categories, 
  brands, 
  onFilterChange,
  defaultFilters
}: FilterSectionProps) {
  const [searchTerm, setSearchTerm] = useState(defaultFilters?.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState(defaultFilters?.selectedCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState(defaultFilters?.selectedBrand || 'all');
  const [priceRange, setPriceRange] = useState(defaultFilters?.priceRange || { min: 0, max: 1000000 });

  const [priceSlider, setPriceSlider] = useState([0, 100]);
  const [maxPrice, setMaxPrice] = useState(1000000);

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    const min = Math.floor((values[0] / 100) * maxPrice);
    const max = Math.ceil((values[1] / 100) * maxPrice);
    
    setPriceSlider(values);
    const newPriceRange = { min, max };
    setPriceRange(newPriceRange);
    
    onFilterChange({
      searchTerm,
      selectedCategory,
      selectedBrand,
      priceRange: newPriceRange
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        onFilterChange({
          searchTerm: value,
          selectedCategory,
          selectedBrand,
          priceRange
        });
        break;
      case 'category':
        setSelectedCategory(value);
        onFilterChange({
          searchTerm,
          selectedCategory: value,
          selectedBrand,
          priceRange
        });
        break;
      case 'brand':
        setSelectedBrand(value);
        onFilterChange({
          searchTerm,
          selectedCategory,
          selectedBrand: value,
          priceRange
        });
        break;
      default:
        break;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceSlider([0, 100]);
    const defaultPriceRange = { min: 0, max: 1000000 };
    setPriceRange(defaultPriceRange);
    
    onFilterChange({
      searchTerm: '',
      selectedCategory: 'all',
      selectedBrand: 'all',
      priceRange: defaultPriceRange
    });
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">סינון מוצרים</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetFilters}
          className="text-xs"
        >
          נקה מסננים
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">חיפוש</Label>
          <Input 
            id="search"
            placeholder="חפש לפי שם מוצר..."
            value={searchTerm}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        {/* Category filter */}
        <div className="space-y-2">
          <Label htmlFor="category">קטגוריה</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Brand filter */}
        <div className="space-y-2">
          <Label htmlFor="brand">מותג</Label>
          <Select
            value={selectedBrand}
            onValueChange={(value) => handleFilterChange('brand', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל המותגים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המותגים</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 