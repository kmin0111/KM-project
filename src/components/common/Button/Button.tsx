import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-inverse hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed',
  outline:
    'border border-border-base text-text-body bg-bg-base hover:bg-bg-muted disabled:opacity-60 disabled:cursor-not-allowed',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`h-11 rounded-md text-sm font-semibold transition-colors ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
