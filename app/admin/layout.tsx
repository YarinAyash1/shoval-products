'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Tag, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      // Auth provider will handle redirection via middleware
    }
  }, [user]);

  // Close mobile nav when path changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const navItems = [
    {
      label: 'דשבורד',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'מוצרים',
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'קטגוריות ומותגים',
      href: '/admin/categories',
      icon: Tag,
    },
  ];

  return (
    <div className="h-full flex flex-col sm:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 