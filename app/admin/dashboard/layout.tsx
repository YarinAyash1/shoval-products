'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Tag, LogOut, Menu, X, Loader2 } from 'lucide-react';

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
      {/* Mobile Nav Toggle */}
      <div className="flex items-center justify-between p-4 border-b sm:hidden">
        <h1 className="text-lg font-semibold">ניהול קטלוג</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          {isMobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`border-l bg-card w-full sm:w-64 flex-shrink-0 ${
          isMobileNavOpen ? 'block' : 'hidden'
        } sm:block`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold hidden sm:block">ניהול קטלוג</h1>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-3 pt-6">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 