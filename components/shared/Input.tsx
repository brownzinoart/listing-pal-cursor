import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: 'default' | 'glass' | 'gradient';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  id, 
  error, 
  hint,
  containerClassName = '', 
  inputClassName = '', 
  labelClassName = '', 
  variant = 'default',
  inputSize = 'md',
  leftIcon,
  rightIcon,
  ...props 
}) => {
  const getSizeClasses = () => {
    switch (inputSize) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-base';
      case 'lg':
        return 'px-5 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getInputStyles = () => {
    const baseStyle = `block w-full ${getSizeClasses()} text-brand-text-primary placeholder-brand-text-tertiary border rounded-lg focus:outline-none transition-all duration-200`;
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    switch (variant) {
      case 'glass':
        return `${baseStyle} ${iconPadding} bg-brand-panel/80 backdrop-blur border-brand-border/60 hover:border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
      
      case 'gradient':
        return `${baseStyle} ${iconPadding} bg-gradient-to-r from-brand-panel to-brand-card border-brand-border hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
      
      default:
        return `${baseStyle} ${iconPadding} bg-brand-input-bg border-brand-border hover:border-brand-border/90 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`;
    }
  };
  
  const errorStyle = "border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger";
  const labelStyle = "block text-sm font-medium text-brand-text-secondary mb-2";

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`${labelStyle} ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-brand-text-tertiary">
              {leftIcon}
            </div>
          </div>
        )}
        <input
          id={id}
          className={`${getInputStyles()} ${error ? errorStyle : ''} ${inputClassName}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-brand-text-tertiary">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
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

export default Input;