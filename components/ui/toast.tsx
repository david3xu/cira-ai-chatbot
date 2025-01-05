'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils/utils';

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: 'default' | 'success' | 'error';
    onClose?: () => void;
  }
>(({ className, variant = 'default', onClose, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'rounded-md border px-6 py-4 shadow-lg',
      variant === 'success' && 'bg-green-50 border-green-200',
      variant === 'error' && 'bg-red-50 border-red-200',
      className
    )}
    onOpenChange={onClose}
    {...props}
  />
));

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));

export { Toast, ToastTitle, ToastDescription }; 