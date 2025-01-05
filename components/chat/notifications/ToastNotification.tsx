'use client'

import React from 'react'
import { Toast as ToastComponent, ToastDescription, ToastTitle } from '@/components/ui/toast'
import { useToast, type ToastType } from '@/lib/hooks/ui/useToast'

export function ToastNotification() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {toasts.map((toast: ToastType) => (
        <ToastComponent
          key={toast.id}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        >
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
        </ToastComponent>
      ))}
    </>
  )
} 