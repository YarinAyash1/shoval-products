'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Bold, AlignJustify } from 'lucide-react';
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
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  
  const addBold = () => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = description.substring(start, end);
    
    // Skip if no text is selected
    if (start === end) return;
    
    const newText = description.substring(0, start) + 
                   `<b>${selectedText}</b>` + 
                   description.substring(end);
                   
    setDescription(newText);
    
    // Restore focus after state update
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(start, end + 7); // +7 for the <b></b> tags
      }
    }, 0);
  };
  
  const preprocessDescription = (text: string) => {
    // Convert newlines to <br> tags when form is submitted
    return text.replace(/\n/g, '<br>');
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

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
        <div className="flex gap-2 mb-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addBold}
            title="הדגש טקסט"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">סמן טקסט ולחץ על כפתור ההדגשה. שורות חדשות יישמרו אוטומטית.</p>
        </div>
        <Textarea
          id="description"
          ref={setTextareaRef}
          value={description}
          onChange={handleDescriptionChange}
          onBlur={() => setDescription(preprocessDescription(description))}
          placeholder="הזן תיאור מוצר"
          rows={6}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground mt-1">ניתן להדגיש טקסט, וגם להוסיף שורות חדשות.</p>
      </div>
    </div>
  );
} 