'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils/utils';

interface InputFieldProps extends Omit<React.ComponentProps<typeof TextareaAutosize>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCompositionStart?: () => void;
  onCompositionEnd?: () => void;
  minRows?: number;
  maxRows?: number;
}

export const InputField = React.forwardRef<HTMLTextAreaElement, InputFieldProps>(
  ({
    value,
    onChange,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    className,
    minRows = 1,
    maxRows = 5,
    disabled,
    placeholder,
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = useCombinedRefs(ref, internalRef);

    // Auto-focus on mount
    useEffect(() => {
      if (!disabled) {
        internalRef.current?.focus();
      }
    }, [disabled]);

    return (
      <div className="relative">
        <TextareaAutosize
          ref={combinedRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          disabled={disabled}
          placeholder={placeholder}
          minRows={minRows}
          maxRows={maxRows}
          className={cn(
            "w-full resize-none bg-transparent py-2.5 px-3",
            "text-base placeholder:text-muted-foreground",
            "focus:outline-none disabled:opacity-50",
            "rounded-md border border-input",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

InputField.displayName = 'InputField';

// Helper to combine refs
function useCombinedRefs<T>(...refs: (React.Ref<T> | null | undefined)[]) {
  return useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(element);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T>).current = element;
      }
    });
  }, [refs]);
} 