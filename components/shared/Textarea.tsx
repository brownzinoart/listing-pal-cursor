import React, { TextareaHTMLAttributes, useId } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const textareaVariants = cva(
  'w-full bg-brand-card transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 rounded-lg border',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 border-gray-300 focus:ring-brand-primary focus:border-brand-primary',
        gradient: 'bg-transparent text-white border-brand-border/50 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-tertiary',
      },
      resizable: {
        true: 'resize',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      resizable: false,
    },
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  hint?: string;
  textareaClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: 'default' | 'glass' | 'gradient';
  textareaSize?: 'sm' | 'md' | 'lg';
  resizable?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  className,
  containerClassName,
  variant,
  label,
  id,
  resizable,
  error,
  hint,
  textareaClassName = '',
  labelClassName = '',
  textareaSize = 'md',
  ...props
}) => {
  const generatedId = id || useId();

  const getSizeClasses = () => {
    switch (textareaSize) {
      case 'sm':
        return 'px-3 py-2 text-sm min-h-[80px]';
      case 'md':
        return 'px-4 py-3 text-base min-h-[120px]';
      case 'lg':
        return 'px-5 py-4 text-lg min-h-[160px]';
      default:
        return 'px-4 py-3 text-base min-h-[120px]';
    }
  };

  const getTextareaStyles = () => {
    const baseStyle = `block w-full ${getSizeClasses()} text-brand-text-primary placeholder-brand-text-tertiary border rounded-lg focus:outline-none transition-all duration-200 ${resizable ? 'resize-y' : 'resize-none'}`;
    
    switch (variant) {
      case 'glass':
        return `${baseStyle} bg-brand-panel/80 backdrop-blur border-brand-border/60 hover:border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
      
      case 'gradient':
        return `${baseStyle} bg-gradient-to-br from-brand-panel to-brand-card border-brand-border hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
      
      default:
        return `${baseStyle} bg-brand-input-bg border-brand-border hover:border-brand-border/90 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
    }
  };
  
  const errorStyle = "border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger";
  const labelStyle = "block text-sm font-medium text-brand-text-secondary mb-2";

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label htmlFor={generatedId} className={`${labelStyle} ${labelClassName}`}>
          {label}
        </label>
      )}
      <textarea
        id={generatedId}
        className={cn(textareaVariants({ variant, resizable, className }))}
        rows={props.rows || 4}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-brand-text-tertiary">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-brand-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;