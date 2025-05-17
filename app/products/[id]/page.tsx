'use client';

export const runtime = 'edge';

import { Suspense } from 'react';
import { use } from 'react';
import { ProductDetails } from '@/components/ProductDetails';

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({ params }: PageParams) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <p className="text-lg">טוען...</p>
      </div>
    }>
      <ProductDetails id={id} />
    </Suspense>
  );
}

// Adding type exports for Next.js to properly recognize the params type
export type Params = { id: string };
export type PageProps = { params: Params }; 