import React from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'light',
  size = 'md',
  ariaLabel,
  className,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-9 h-9 min-w-9 min-h-9 text-xs',
    md: 'w-11 h-11 min-w-11 min-h-11 text-sm',
    lg: 'w-13 h-13 min-w-13 min-h-13 text-base',
  };

  const variantStyles = {
    light: 'bg-white text-zinc-800 border border-zinc-200/80 shadow-xs hover:bg-zinc-50 active:bg-zinc-100',
    dark: 'bg-zinc-900 text-white border border-zinc-800 shadow-sm hover:bg-zinc-800 active:bg-zinc-950',
    outline: 'bg-transparent text-zinc-700 border border-zinc-300 hover:bg-zinc-100/70 active:bg-zinc-200',
    glass: 'glass-surface text-zinc-900 border border-white/60 shadow-sm hover:bg-white active:bg-zinc-100',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer',
        'transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
