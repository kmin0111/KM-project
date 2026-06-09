import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, required, className = '', ...props }: InputProps) {
  return (
    <>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-heading mb-2">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <input
        id={id}
        required={required}
        className={`w-full h-11 px-4 rounded-md border border-border-base bg-bg-base text-sm text-text-heading placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors ${className}`}
        {...props}
      />
    </>
  );
}
