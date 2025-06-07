import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick,
  header,
  footer,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-brand-card shadow-brand-lg border border-brand-border/50';
      case 'outline':
        return 'bg-transparent border-2 border-brand-border';
      case 'glass':
        return 'bg-brand-panel/90 backdrop-blur-sm border border-brand-border/50 shadow-brand';
      case 'gradient':
        return 'bg-gradient-to-br from-brand-panel to-brand-card border border-brand-border/30 shadow-brand-md';
      default:
        return 'bg-brand-card border border-brand-border shadow-brand';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  const hoverClasses = hover ? 'hover:shadow-brand-lg hover:scale-[1.02] transform transition-all duration-200' : 'transition-shadow duration-200';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const cardClasses = `
    ${getVariantClasses()}
    ${hoverClasses}
    ${clickableClasses}
    rounded-lg
    ${className}
  `.trim();

  const contentClasses = `
    ${getPaddingClasses()}
    ${header || footer ? '' : 'h-full'}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {header && (
        <div className="px-6 py-4 border-b border-brand-border">
          {header}
        </div>
      )}
      <div className={contentClasses}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-brand-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 