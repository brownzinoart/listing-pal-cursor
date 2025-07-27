import React, { ReactNode } from 'react';
import Card from '../Card';

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  title,
  subtitle,
  actions,
  loading = false,
  error,
  height = 300,
  className = '',
  variant = 'default',
  padding = 'md',
}) => {
  const header = (title || subtitle || actions) ? (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-brand-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  ) : undefined;

  if (loading) {
    return (
      <Card variant={variant} padding={padding} className={className}>
        {header}
        <div 
          className="flex items-center justify-center bg-brand-background rounded-lg animate-pulse"
          style={{ height: `${height}px` }}
        >
          <div className="text-brand-text-tertiary">Loading chart...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant={variant} padding={padding} className={className}>
        {header}
        <div 
          className="flex items-center justify-center bg-red-900/10 border border-red-500/20 rounded-lg"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="text-red-500 text-sm font-medium">Chart Error</div>
            <div className="text-brand-text-tertiary text-xs mt-1">{error}</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} padding={padding} className={className}>
      {header}
      <div style={{ height: `${height}px` }}>
        {children}
      </div>
    </Card>
  );
};

export default ChartWrapper;