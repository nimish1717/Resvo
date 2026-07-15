import * as React from 'react';

export const Button = React.forwardRef(
  ({ className = '', variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-muted hover:text-foreground',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    };

    const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.default} ${className}`;

    return <button ref={ref} className={combinedClassName} {...props} />;
  }
);

Button.displayName = 'Button';
