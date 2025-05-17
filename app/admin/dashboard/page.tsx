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
import { Package, Tag, Briefcase } from 'lucide-react';

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">דשבורד</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <Card key={index}>
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
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 