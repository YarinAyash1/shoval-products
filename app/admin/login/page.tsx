'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';
  const { signIn, user, session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && (user || session)) {
      console.log("User or session detected, redirecting to:", redirectTo);
      try {
        router.push(redirectTo);
        
        // If router.push doesn't work, use a fallback with window.location
        // after a short delay to allow Next.js router to work first
        const timeout = setTimeout(() => {
          setRedirectAttempts(prev => prev + 1);
          if (redirectAttempts >= 1) {
            console.log("Fallback redirect using window.location");
            window.location.href = redirectTo;
          }
        }, 1000);
        
        return () => clearTimeout(timeout);
      } catch (e) {
        console.error("Redirect error:", e);
        // Absolute fallback
        window.location.href = redirectTo;
      }
    }
  }, [user, session, authLoading, router, redirectTo, redirectAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);
      const result = await signIn(email, password);
      console.log("Sign in result:", result);
      
      // Force a redirect after successful login
      setTimeout(() => {
        console.log("Forced redirect to:", redirectTo);
        router.push(redirectTo);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      }, 500);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || 'התרחשה שגיאה בהתחברות');
      setLoading(false);
    }
  };

  // Don't render login form if already logged in or still checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user || session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>אתה מחובר, מעביר אותך לדף הבקרה...</p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mt-4" />
          <div className="mt-4">
            <Button
              onClick={() => {
                window.location.href = redirectTo;
              }}
            >
              לחץ כאן אם אינך מועבר אוטומטית
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">כניסה למנהל</CardTitle>
          <CardDescription className="text-center">התחבר לניהול קטלוג המוצרים</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 