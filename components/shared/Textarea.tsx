import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
  label, 
  id, 
  error, 
  hint,
  containerClassName = '', 
  textareaClassName = '', 
  labelClassName = '', 
  variant = 'default',
  textareaSize = 'md',
  resizable = true,
  ...props 
}) => {
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
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`${labelStyle} ${labelClassName}`}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${getTextareaStyles()} ${error ? errorStyle : ''} ${textareaClassName}`}
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