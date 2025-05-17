'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { getProducts, getCategories, getBrands } from '@/lib/supabase';
import { Package, Tag, Briefcase, BarChart } from 'lucide-react';

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [brandCount, setBrandCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, categories, brands] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ]);

        setProductCount(products.length);
        setCategoryCount(categories.length);
        setBrandCount(brands.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dashboardCards = [
    {
      title: 'מוצרים',
      description: 'סך הכל מוצרים בקטלוג',
      value: productCount,
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'קטגוריות',
      description: 'סך הכל קטגוריות',
      value: categoryCount,
      icon: Tag,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'מותגים',
      description: 'סך הכל מותגים',
      value: brandCount,
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">דשבורד</h1>
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground hidden sm:inline">סטטיסטיקות</span>
        </div>
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-7 w-12 bg-muted animate-pulse rounded-md"></div>
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 border rounded-lg p-4 bg-card">
        <h2 className="font-semibold mb-2">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-2">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/dashboard/product/new'}>
            <CardContent className="p-3 flex flex-col items-center">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-sm">הוסף מוצר</span>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/dashboard/categories'}>
            <CardContent className="p-3 flex flex-col items-center">
              <Tag className="h-5 w-5 mb-1" />
              <span className="text-sm">נהל קטגוריות</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 