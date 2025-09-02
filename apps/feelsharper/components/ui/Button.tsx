'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Fixed Button component with proper functionality and high-contrast styling
 * Supports all interactive states, WCAG AA+ contrast, and consistent behavior
 * Fixed: Proper event handling, accessible focus states, and reliable styling
 */
export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children,
  href,
  target,
  rel,
  onClick,
  disabled,
  type = 'button',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none rounded-lg';
  
  // Feel Sharper Brand Colors - WCAG AA+ compliance
  const variants = {
    primary: 'bg-sharp-blue hover:bg-blue-700 active:bg-blue-800 text-clean-white focus:ring-sharp-blue shadow-sm hover:shadow-md',
    secondary: 'bg-energy-orange hover:bg-orange-700 active:bg-orange-800 text-clean-white focus:ring-energy-orange shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-steel-gray hover:text-sharp-blue focus:ring-sharp-blue border border-transparent',
    outline: 'border-2 border-sharp-blue hover:border-blue-700 bg-transparent hover:bg-sharp-blue hover:text-clean-white text-sharp-blue focus:ring-sharp-blue'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[32px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]'
  };

  const buttonClasses = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );

  // Fixed: Proper event handling with preventDefault for better UX
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  // If href is provided, render as a link-styled button
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={buttonClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
