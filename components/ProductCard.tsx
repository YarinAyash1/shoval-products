'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="h-full flex flex-col pt-0 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 bg-white rounded-xl overflow-hidden cursor-pointer">
        {/* Product Image */}
        {product.image_urls && product.image_urls.length > 0 ? (
          <div className="relative aspect-square bg-gray-50">
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
            {/* Optional: badge for brand */}
            {product.brand && (
              <span className="absolute top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded shadow text-gray-700 font-semibold">
                {product.brand.name}
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center bg-muted text-muted-foreground text-3xl font-bold">
            <span>?</span>
          </div>
        )}

        <CardContent className="flex flex-col flex-grow p-4">
          {/* Product Name */}
          <h2 className="text-base font-semibold mb-1 line-clamp-2 text-gray-900">{product.name}</h2>
          {/* Category */}
          {product.category && (
            <div className="text-xs text-gray-500 mb-2">{product.category.name}</div>
          )}
          {/* Price */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-primary">₪{product.price.toLocaleString()}</span>
            {/* Optional: Add to cart or favorite icon could go here */}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full rounded-lg" variant="outline">
            פרטים נוספים
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}