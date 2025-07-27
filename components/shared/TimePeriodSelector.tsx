import React from 'react';

export type TimePeriod = '1D' | '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL' | 'custom';

interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  days?: number;
}

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  options?: TimePeriodOption[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pills' | 'buttons' | 'dropdown';
  className?: string;
  disabled?: boolean;
  showCustom?: boolean;
  onCustomRangeClick?: () => void;
}

const defaultOptions: TimePeriodOption[] = [
  { value: '1D', label: '1D', days: 1 },
  { value: '7D', label: '7D', days: 7 },
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: '1Y', label: '1Y', days: 365 },
  { value: 'ALL', label: 'All', days: undefined },
];

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  options = defaultOptions,
  size = 'md',
  variant = 'pills',
  className = '',
  disabled = false,
  showCustom = false,
  onCustomRangeClick,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-xs',
          container: 'gap-1',
        };
      case 'lg':
        return {
          button: 'px-4 py-3 text-base',
          container: 'gap-2',
        };
      default:
        return {
          button: 'px-3 py-2 text-sm',
          container: 'gap-1.5',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getButtonClasses = (isSelected: boolean, isCustom = false) => {
    const baseClasses = `
      ${sizeClasses.button}
      font-medium
      transition-all
      duration-200
      border
      focus:outline-none
      focus:ring-2
      focus:ring-brand-primary
      focus:ring-opacity-50
      disabled:opacity-50
      disabled:cursor-not-allowed
    `;

    if (variant === 'pills') {
      const pillClasses = `
        rounded-full
        ${isSelected 
          ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
          : 'bg-brand-panel text-brand-text-secondary border-brand-border hover:bg-brand-card hover:text-brand-text-primary hover:border-brand-primary/30'
        }
      `;
      return `${baseClasses} ${pillClasses}`;
    }

    if (variant === 'buttons') {
      const buttonClasses = `
        ${isSelected 
          ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
          : 'bg-brand-panel text-brand-text-secondary border-brand-border hover:bg-brand-card hover:text-brand-text-primary hover:border-brand-primary/30'
        }
        first:rounded-l-md
        last:rounded-r-md
        -ml-px
        first:ml-0
      `;
      return `${baseClasses} ${buttonClasses}`;
    }

    return baseClasses;
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
          disabled={disabled}
          className={`
            ${sizeClasses.button}
            bg-brand-panel
            border
            border-brand-border
            text-brand-text-primary
            rounded-md
            focus:outline-none
            focus:ring-2
            focus:ring-brand-primary
            focus:border-brand-primary
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {showCustom && <option value="custom">Custom Range</option>}
        </select>
      </div>
    );
  }

  return (
    <div className={`flex ${sizeClasses.container} ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onPeriodChange(option.value)}
          disabled={disabled}
          className={getButtonClasses(selectedPeriod === option.value)}
        >
          {option.label}
        </button>
      ))}
      
      {showCustom && (
        <button
          onClick={() => {
            if (onCustomRangeClick) {
              onCustomRangeClick();
            } else {
              onPeriodChange('custom');
            }
          }}
          disabled={disabled}
          className={getButtonClasses(selectedPeriod === 'custom', true)}
        >
          Custom
        </button>
      )}
    </div>
  );
};

// Helper hook for managing time periods
export const useTimePeriod = (initialPeriod: TimePeriod = '7D') => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>(initialPeriod);
  const [customRange, setCustomRange] = React.useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const getDateRange = () => {
    if (selectedPeriod === 'custom') {
      return customRange;
    }

    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7D':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'ALL':
        return { startDate: null, endDate: null };
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return { startDate, endDate };
  };

  return {
    selectedPeriod,
    setSelectedPeriod,
    customRange,
    setCustomRange,
    getDateRange,
  };
};

export default TimePeriodSelector;