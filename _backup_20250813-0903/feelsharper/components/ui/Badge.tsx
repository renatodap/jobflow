import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component for categories, tags, and status indicators
 * Provides consistent styling for small informational elements
 */
export default function Badge({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    secondary: 'bg-brand-amber-light text-amber-800 border-brand-amber',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
