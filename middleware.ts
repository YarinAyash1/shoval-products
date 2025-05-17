import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // For debugging
  console.log('Middleware handling path:', req.nextUrl.pathname);
  
  // Create a response to modify
  const res = NextResponse.next();
  
  try {
    // Create supabase middleware client
    const supabase = createMiddlewareClient({ req, res });
    
    // Check if session exists
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Middleware auth error:', error);
      throw error;
    }
    
    console.log('Session exists:', !!session);
    
    const { pathname } = req.nextUrl;
    
    // Redirect from old admin root to dashboard
    if (pathname === '/admin') {
      console.log('Redirecting from /admin to /admin/dashboard');
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Handle login page
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (session) {
        console.log('User already logged in, redirecting to dashboard');
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = '/admin/dashboard';
        return NextResponse.redirect(dashboardUrl);
      }
      return res;
    }
    
    // Protect admin routes
    if (pathname.startsWith('/admin/dashboard') && !session) {
      console.log('Unauthorized access attempt, redirecting to login');
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Important: return the modified response
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed
    return res;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}; 