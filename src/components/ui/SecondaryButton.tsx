import React from 'react';
import { cn } from '@/lib/utils';

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'h-10 px-4 text-xs font-semibold rounded-full gap-1.5',
    md: 'h-12 px-5 text-sm font-semibold rounded-2xl gap-2',
    lg: 'h-14 px-6 text-base font-semibold rounded-2xl gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-tight',
        'bg-zinc-100 text-zinc-800 hover:bg-zinc-200/90 active:bg-zinc-300',
        'border border-zinc-200/70 shadow-2xs hover:shadow-xs transition-all duration-200',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};
