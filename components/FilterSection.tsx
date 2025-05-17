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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { type Category, type Brand } from '@/lib/supabase';
import { X, Filter } from 'lucide-react';

// Define the filter interface
interface Filters {
    searchTerm: string;
    selectedCategory: string;
    selectedBrand: string;
}

interface FilterSectionProps {
    categories: Category[];
    brands: Brand[];
    onFilterChange: (filters: Filters) => void;
    defaultFilters?: Filters;
    productsCount: number;
}

// Simple badge component for filter tags
function FilterTag({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center bg-muted text-muted-foreground rounded-full px-3 pl-0 py-1 text-xs font-medium gap-2">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="ml-2 text-muted-foreground hover:text-destructive focus:outline-none gap-2"
                aria-label="הסר סינון"
            >
                <X className="w-4 h-4" />
            </button>
        </span>
    );
}

// The filter form content component (used in both desktop and mobile views)
function FilterFormContent({
    searchTerm,
    selectedCategory,
    selectedBrand,
    categories,
    brands,
    handleFilterChange,
}: {
    searchTerm: string;
    selectedCategory: string;
    selectedBrand: string;
    categories: Category[];
    brands: Brand[];
    handleFilterChange: (filterType: string, value: string) => void;
}) {
    return (
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
    );
}

export function FilterSection({
    categories,
    brands,
    onFilterChange,
    defaultFilters,
    productsCount
}: FilterSectionProps) {
    const [searchTerm, setSearchTerm] = useState(defaultFilters?.searchTerm || '');
    const [selectedCategory, setSelectedCategory] = useState(defaultFilters?.selectedCategory || 'all');
    const [selectedBrand, setSelectedBrand] = useState(defaultFilters?.selectedBrand || 'all');
    const [isOpen, setIsOpen] = useState(false);
    
    // Update local state when defaultFilters prop changes
    useEffect(() => {
        if (defaultFilters) {
            setSearchTerm(defaultFilters.searchTerm || '');
            setSelectedCategory(defaultFilters.selectedCategory || 'all');
            setSelectedBrand(defaultFilters.selectedBrand || 'all');
        }
    }, [defaultFilters]);

    // Handle filter changes
    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'search':
                setSearchTerm(value);
                onFilterChange({
                    searchTerm: value,
                    selectedCategory,
                    selectedBrand,
                });
                break;
            case 'category':
                setSelectedCategory(value);
                onFilterChange({
                    searchTerm,
                    selectedCategory: value,
                    selectedBrand,
                });
                break;
            case 'brand':
                setSelectedBrand(value);
                onFilterChange({
                    searchTerm,
                    selectedCategory,
                    selectedBrand: value,
                });
                break;
            default:
                break;
        }
    };

    // Remove a specific filter
    const handleRemoveFilter = (filterType: string) => {
        switch (filterType) {
            case 'search':
                setSearchTerm('');
                onFilterChange({
                    searchTerm: '',
                    selectedCategory,
                    selectedBrand,
                });
                break;
            case 'category':
                setSelectedCategory('all');
                onFilterChange({
                    searchTerm,
                    selectedCategory: 'all',
                    selectedBrand,
                });
                break;
            case 'brand':
                setSelectedBrand('all');
                onFilterChange({
                    searchTerm,
                    selectedCategory,
                    selectedBrand: 'all',
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
        
        // Close the sheet on mobile
        setIsOpen(false);

        onFilterChange({
            searchTerm: '',
            selectedCategory: 'all',
            selectedBrand: 'all',
        });
    };

    // Helper to get category/brand name by id
    const getCategoryName = (id: string) => {
        if (id === 'all') return '';
        const cat = categories.find((c) => c.id === id);
        return cat ? cat.name : '';
    };
    const getBrandName = (id: string) => {
        if (id === 'all') return '';
        const brand = brands.find((b) => b.id === id);
        return brand ? brand.name : '';
    };

    // Show tags for active filters
    const filterTags = [];
    if (searchTerm) {
        filterTags.push({
            key: 'search',
            label: `חיפוש: "${searchTerm}"`,
        });
    }
    if (selectedCategory !== 'all') {
        filterTags.push({
            key: 'category',
            label: `קטגוריה: ${getCategoryName(selectedCategory)}`,
        });
    }
    if (selectedBrand !== 'all') {
        filterTags.push({
            key: 'brand',
            label: `מותג: ${getBrandName(selectedBrand)}`,
        });
    }


    const isFiltered = filterTags.length > 0;


    return (
        <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">סינון מוצרים</h2>
                {isFiltered && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="text-xs"
                    >
                        נקה מסננים
                    </Button>
                )}
            </div>

            {/* Desktop view - show filters directly */}
            <div className="hidden md:block">
                <FilterFormContent
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    selectedBrand={selectedBrand}
                    categories={categories}
                    brands={brands}
                    handleFilterChange={handleFilterChange}
                />
            </div>

            {/* Mobile view - show button to open sheet/dialog */}
            <div className="block md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex justify-between items-center">
                            <span>סנן מוצרים</span>
                            <Filter className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] overflow-y-auto pb-20">
                        <SheetHeader>
                            <SheetTitle>סינון מוצרים</SheetTitle>
                        </SheetHeader>
                        <div className="px-5 py-4">
                            <FilterFormContent
                                searchTerm={searchTerm}
                                selectedCategory={selectedCategory}
                                selectedBrand={selectedBrand}
                                categories={categories}
                                brands={brands}
                                handleFilterChange={handleFilterChange}
                            />
                            {isFiltered && (

                                <div className="grid grid-cols-1 gap-2 ">
                                    {/* Show product and close FilterSection */}
                                    <Button variant="default" size="lg" onClick={() => { 
                                        // close the sheet
                                        setIsOpen(false);
                                    }} className="text-xs mt-6 w-[100%]">
                                        הצג מוצרים
                                        <span className="count-badge">{productsCount}</span>
                                    </Button>

                                    {/* Reset filters button */}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={resetFilters}
                                        className="text-xs mt-2 w-[100%] "
                                    >
                                        נקה מסננים
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Filter tags */}
            {isFiltered && (
                <div className="flex flex-col gap-2 mt-4">
                    <h3 className="text-lg font-semibold">
                        מסננים פעילים:
                    </h3>
                    <div className="flex flex-wrap mb-4 gap-4">
                        {filterTags.map((tag) => (
                            <FilterTag
                                key={tag.key}
                                label={tag.label}
                                onRemove={() => handleRemoveFilter(tag.key)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 