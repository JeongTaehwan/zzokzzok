import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'mint' | 'ghost' | 'rose';
  children: ReactNode;
}

export function BigButton({ variant = 'accent', className = '', children, ...rest }: Props) {
  return (
    <button type="button" className={`big-btn big-btn--${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
