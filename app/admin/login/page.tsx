'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';

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
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus email input on mount (mobile-friendly)
  useEffect(() => {
    if (!authLoading && !user && !session && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [authLoading, user, session]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && (user || session)) {
      try {
        router.push(redirectTo);
        const timeout = setTimeout(() => {
          setRedirectAttempts(prev => prev + 1);
          if (redirectAttempts >= 1) {
            window.location.href = redirectTo;
          }
        }, 1000);
        return () => clearTimeout(timeout);
      } catch (e) {
        window.location.href = redirectTo;
      }
    }
  }, [user, session, authLoading, router, redirectTo, redirectAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      setTimeout(() => {
        router.push(redirectTo);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'התרחשה שגיאה בהתחברות');
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Already logged in
  if (user || session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="text-center w-full max-w-xs mx-auto">
          <p className="text-lg font-medium mb-2">אתה מחובר, מעביר אותך לדף הבקרה...</p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mt-4 text-primary" />
          <div className="mt-6">
            <Button
              className="w-full"
              size="lg"
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
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-2 py-8">
      <Card className="w-full max-w-sm shadow-lg border-0 rounded-2xl bg-white/95">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-center font-bold mb-1">כניסה למנהל</CardTitle>
          <CardDescription className="text-center text-base text-muted-foreground">
            התחבר לניהול קטלוג המוצרים
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} autoComplete="on">
          <CardContent className="space-y-4 pt-2">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  ref={emailInputRef}
                  className="pl-10 pr-3 py-2 text-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  inputMode="email"
                  placeholder="your@email.com"
                  aria-label="אימייל"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-3 py-2 text-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  aria-label="סיסמה"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="w-full py-3 text-base rounded-lg font-semibold"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 