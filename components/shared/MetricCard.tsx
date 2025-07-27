import React, { ReactNode } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import Card from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: 'default' | 'elevated' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: string | number) => string;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  miniChart?: ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  changeLabel,
  icon,
  variant = 'default',
  size = 'md',
  loading = false,
  className = '',
  valueClassName = '',
  onClick,
  prefix = '',
  suffix = '',
  formatValue,
  showTrend = true,
  trendDirection,
  miniChart,
}) => {
  const formattedValue = formatValue ? formatValue(value) : value;
  
  // Calculate trend if change is provided
  const calculatedTrendDirection = trendDirection || (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');
  
  const getTrendColor = () => {
    switch (calculatedTrendDirection) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-brand-text-tertiary';
    }
  };

  const getTrendIcon = () => {
    if (!showTrend || calculatedTrendDirection === 'neutral') return null;
    
    return calculatedTrendDirection === 'up' ? (
      <ArrowTrendingUpIcon className="h-4 w-4" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4" />
    );
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          value: 'text-xl',
          title: 'text-xs',
          icon: 'h-6 w-6',
          change: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-8',
          value: 'text-4xl',
          title: 'text-base',
          icon: 'h-10 w-10',
          change: 'text-sm'
        };
      default:
        return {
          container: 'p-6',
          value: 'text-2xl',
          title: 'text-sm',
          icon: 'h-8 w-8',
          change: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <Card variant={variant} padding="none" className={`${className} animate-pulse`} onClick={onClick}>
        <div className={sizeClasses.container}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-brand-panel rounded w-20"></div>
            <div className={`${sizeClasses.icon} bg-brand-panel rounded`}></div>
          </div>
          <div className={`h-8 bg-brand-panel rounded w-24 mb-2`}></div>
          <div className="h-3 bg-brand-panel rounded w-16"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant={variant} 
      padding="none" 
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      hover={!!onClick}
      onClick={onClick}
    >
      <div className={sizeClasses.container}>
        {/* Header with title and icon */}
        <div className="flex items-center justify-between mb-4">
          <p className={`${sizeClasses.title} font-medium text-brand-text-secondary uppercase tracking-wider`}>
            {title}
          </p>
          {icon && (
            <div className={`${sizeClasses.icon} text-brand-primary opacity-70`}>
              {icon}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="mb-2">
          <p className={`${sizeClasses.value} font-bold text-brand-text-primary ${valueClassName}`}>
            {prefix}{formattedValue}{suffix}
          </p>
        </div>

        {/* Change indicator and mini chart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(change !== undefined || trendDirection) && showTrend && (
              <div className={`flex items-center gap-1 ${sizeClasses.change} ${getTrendColor()}`}>
                {getTrendIcon()}
                {change !== undefined && (
                  <span className="font-medium">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-brand-text-tertiary ml-1">{changeLabel}</span>
                )}
              </div>
            )}
            
            {previousValue && (
              <span className={`${sizeClasses.change} text-brand-text-tertiary`}>
                vs {formatValue ? formatValue(previousValue) : previousValue}
              </span>
            )}
          </div>

          {/* Mini chart */}
          {miniChart && (
            <div className="flex-shrink-0">
              {miniChart}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;