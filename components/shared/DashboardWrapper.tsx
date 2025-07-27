import React, { ReactNode } from 'react';
import { FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface DashboardWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
  showFilters?: boolean;
  showExport?: boolean;
  onFilterToggle?: () => void;
  onExport?: () => void;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  children,
  title,
  subtitle,
  actions,
  filters,
  headerContent,
  className = '',
  showFilters = false,
  showExport = false,
  onFilterToggle,
  onExport,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        {/* Title and Actions Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-brand-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Actions Row */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {showFilters && (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<FunnelIcon className="h-4 w-4" />}
                onClick={onFilterToggle}
              >
                Filters
              </Button>
            )}
            
            {showExport && (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                onClick={onExport}
              >
                Export
              </Button>
            )}
            
            {actions}
          </div>
        </div>

        {/* Filters Section */}
        {filters && (
          <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
            {filters}
          </div>
        )}

        {/* Additional Header Content */}
        {headerContent && (
          <div>{headerContent}</div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardWrapper;