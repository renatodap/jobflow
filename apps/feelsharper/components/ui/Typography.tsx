import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Heading component using Crimson Text serif font for elegance
 * Creates visual hierarchy with consistent spacing and sizing
 */
export function Heading({ 
  children, 
  className,
  ...props 
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 
      className={cn(
        'font-serif font-bold text-neutral-900 leading-tight tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

/**
 * Subheading component for section titles
 */
export function Subheading({ 
  children, 
  className,
  ...props 
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 
      className={cn(
        'font-serif font-semibold text-neutral-800 leading-snug',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

/**
 * Body text component using Inter sans-serif for clarity
 */
export function Body({ 
  children, 
  className,
  size = 'base',
  ...props 
}: TypographyProps & React.HTMLAttributes<HTMLParagraphElement> & {
  size?: 'sm' | 'base' | 'lg';
}) {
  const sizes = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  return (
    <p 
      className={cn(
        'font-sans text-neutral-700 leading-relaxed',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Caption text for small details and metadata
 */
export function Caption({ 
  children, 
  className,
  ...props 
}: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span 
      className={cn(
        'font-sans text-sm text-neutral-500 leading-normal',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Label component for form elements and categories
 */
export function Label({ 
  children, 
  className,
  ...props 
}: TypographyProps & React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label 
      className={cn(
        'font-sans text-sm font-medium text-neutral-800 leading-none',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
