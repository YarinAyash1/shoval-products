import './globals.css';
import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-provider';
import { ToastProvider } from '@/components/ui/use-toast';

const heebo = Heebo({ subsets: ['latin', 'hebrew'] });

export const metadata: Metadata = {
  title: 'קטלוג מוצרים | שובל חכם',
  description: 'קטלוג מוצרים - שובל חכם',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
