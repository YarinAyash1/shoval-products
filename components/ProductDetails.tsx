'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Share2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { getProductById, getSettings, type Product, type Settings } from '@/lib/supabase';

interface ProductDetailsProps {
  id: string;
}

export function ProductDetails({ id }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product and settings in parallel
        const [fetchedProduct, fetchedSettings] = await Promise.all([
          getProductById(id),
          getSettings()
        ]);
        
        if (!fetchedProduct) {
          setError('המוצר המבוקש לא נמצא');
        } else {
          setProduct(fetchedProduct);
        }
        
        setSettings(fetchedSettings);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת המוצר');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'שיתוף מוצר',
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('הקישור הועתק ללוח'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <p className="text-lg">טוען...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col justify-center items-center min-h-[50vh]">
        <p className="text-lg text-red-500 mb-4">{error || 'המוצר לא נמצא'}</p>
        <Button asChild>
          <Link href="/">חזרה לקטלוג</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-6 text-muted-foreground">
        <Link href="/" className="hover:underline">
          קטלוג
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        {product.category && (
          <>
            <span>{product.category.name}</span>
            <ChevronRight className="h-4 w-4 mx-2" />
          </>
        )}
        <span className="font-medium text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            {product.image_urls && product.image_urls.length > 0 ? (
              <Image
                src={product.image_urls[currentImage]}
                alt={product.name}
                className="object-contain w-full h-full"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">אין תמונה</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pb-2">
              {product.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                    currentImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                  type="button"
                >
                  <Image
                    src={url}
                    alt={`${product.name} - תמונה ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            {product.brand && (
              <p className="text-muted-foreground">מותג: {product.brand.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">₪{product.price.toLocaleString()}</div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleShare}
              title="שתף מוצר"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">תיאור המוצר</h2>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Product Variables/Attributes */}
          {product.variables && product.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">מפרט טכני</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {product.variables.map((variable) => (
                    <li key={variable.id} className="py-2 flex justify-between">
                      <span className="font-medium">{variable.name}</span>
                      <span>{variable.value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg" 
              asChild={!!settings?.contact_phone}
            >
              {settings?.contact_phone ? (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  יצירת קשר להזמנה
                </a>
              ) : (
                <span>יצירת קשר להזמנה</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Back to Catalog */}
      <div className="mt-12">
        <Button variant="outline" asChild>
          <Link href="/">
            <ChevronRight className="mr-2 h-4 w-4" />
            חזרה לקטלוג המוצרים
          </Link>
        </Button>
      </div>
    </div>
  );
} 