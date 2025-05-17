'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Tag, LogOut, Menu, X, Loader2, Home, Settings } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, session, signOut, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user && !session) {
      console.log('Not authenticated, redirecting to login');
      router.push('/admin/login');
    }
  }, [user, session, authLoading, router]);

  // Close mobile nav when path changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);
  
  // Close mobile nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileNavOpen && !target.closest('.mobile-nav') && !target.closest('.mobile-nav-toggle')) {
        setIsMobileNavOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileNavOpen]);

  const navItems = [
    {
      label: 'דשבורד',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'מוצרים',
      href: '/admin/dashboard/product',
      icon: Package,
    },
    {
      label: 'קטגוריות ומותגים',
      href: '/admin/dashboard/categories',
      icon: Tag,
    },
    {
      label: 'הגדרות',
      href: '/admin/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not logged in, don't render the content
  if (!user && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>מעביר אותך לדף ההתחברות...</p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col sm:flex-row">


      {/* Sidebar for mobile - overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 sm:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`border-l bg-card z-40 mobile-nav
          ${isMobileNavOpen 
            ? 'fixed inset-y-0 right-0 w-3/4 max-w-xs shadow-xl transition-transform duration-200 transform translate-x-0' 
            : 'fixed inset-y-0 right-0 w-3/4 max-w-xs shadow-xl transition-transform duration-200 transform translate-x-full'
          } 
          sm:static sm:translate-x-0 sm:w-64 sm:shadow-none sm:block sm:flex-shrink-0`}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">ניהול קטלוג</h1>
          <p className="text-sm text-muted-foreground mt-1">ברוך הבא!</p>
        </div>

        <nav className="space-y-2 p-4 min-h-[calc(100vh-10rem)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>התנתק</span>
          </Button>
        </div>
      </div>

      {/* Bottom mobile navigation - visible only on mobile */}
      <div className="sm:hidden fixed bottom-0 right-0 left-0 z-40 bg-card border-t flex justify-around p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-md ${
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-16 sm:pb-0">
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
} 