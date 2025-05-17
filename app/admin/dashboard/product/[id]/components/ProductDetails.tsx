'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Category, type Brand } from '@/lib/supabase';

interface ProductDetailsProps {
  name: string;
  setName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  brandId: string;
  setBrandId: (value: string) => void;
  categories: Category[];
  brands: Brand[];
}

export function ProductDetails({
  name,
  setName,
  price,
  setPrice,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  brandId,
  setBrandId,
  categories,
  brands
}: ProductDetailsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base">שם המוצר *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="הזן שם מוצר"
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price" className="text-base">מחיר (₪) *</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="הזן מחיר"
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category" className="text-base">קטגוריה</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="text-base">
            <SelectValue placeholder="בחר קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">ללא קטגוריה</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="brand" className="text-base">מותג</Label>
        <Select value={brandId} onValueChange={setBrandId}>
          <SelectTrigger className="text-base">
            <SelectValue placeholder="בחר מותג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">ללא מותג</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description" className="text-base">תיאור המוצר</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="הזן תיאור מוצר"
          rows={4}
          className="text-base"
        />
      </div>
    </div>
  );
} 