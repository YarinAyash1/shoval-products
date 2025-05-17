'use client';

import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ToastContextProps {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({
  children,
  position = 'bottom-right',
}: {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);

    // Remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, props.duration || 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport position={position}>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const getPositionClasses = (position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => {
  // Always use the correct fixed position for all screen sizes
  switch (position) {
    case 'top-right':
      return 'fixed top-4 right-4';
    case 'top-left':
      return 'fixed top-4 left-4';
    case 'bottom-right':
      return 'fixed bottom-4 right-4';
    case 'bottom-left':
      return 'fixed bottom-4 left-4';
    default:
      return 'fixed bottom-4 right-4';
  }
};

const ToastViewport = ({
  children,
  position = 'bottom-right',
}: {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) => {
  return (
    <ToastPrimitives.Provider>
      <ToastPrimitives.Viewport
        className={cn(
          'z-50 flex flex-col p-4 gap-2 w-full max-w-xs md:max-w-sm',
          getPositionClasses(position)
        )}
      />
      {children}
    </ToastPrimitives.Provider>
  );
};

const ToastComponent = ({
  title,
  description,
  variant = 'default',
  duration = 5000,
}: ToastProps) => {
  return (
    <ToastPrimitives.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mt-2',
        variant === 'destructive'
          ? 'destructive border-destructive bg-destructive text-destructive-foreground'
          : 'border-border bg-background text-foreground'
      )}
      duration={duration}
    >
      <div className="grid gap-1">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="text-sm opacity-90">
            {description}
          </ToastPrimitives.Description>
        )}
      </div>
      <ToastPrimitives.Close className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
};