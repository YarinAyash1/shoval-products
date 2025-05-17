'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ProductImageUploaderProps {
  imageUrls: string[];
  imagePreviewUrls: string[];
  isNewProduct: boolean;
  removeExistingImage: (index: number) => void;
  removeNewImage: (index: number) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductImageUploader({
  imageUrls,
  imagePreviewUrls,
  isNewProduct,
  removeExistingImage,
  removeNewImage,
  handleImageChange
}: ProductImageUploaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {/* Existing images (edit mode only) */}
        {!isNewProduct && imageUrls.map((url, index) => (
          <div key={`existing-${index}`} className="relative rounded-md overflow-hidden w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]">
            <Image
              src={url}
              alt={`תמונה ${index + 1}`}
              width={120}
              height={120}
              className="object-contain w-full h-full"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => removeExistingImage(index)}
              aria-label="מחק תמונה"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* New images */}
        {imagePreviewUrls.map((url, index) => (
          <div key={`new-${index}`} className="relative rounded-md overflow-hidden w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]">
            <Image
              src={url}
              alt={`תמונה חדשה ${index + 1}`}
              width={120}
              height={120}
              className="object-contain w-full h-full"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => removeNewImage(index)}
              aria-label="מחק תמונה"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Add image button */}
        {(isNewProduct ? imagePreviewUrls.length : (imageUrls.length + imagePreviewUrls.length)) < 5 && (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-xs sm:text-sm">העלה תמונה</span>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleImageChange}
            />
          </Label>
        )}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground text-center">ניתן להעלות עד 5 תמונות. פורמטים נתמכים: JPG, PNG.</p>
    </div>
  );
} 