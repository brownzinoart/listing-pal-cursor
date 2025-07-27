import React from 'react';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PortfolioSummaryProps {
  totalProperties: number;
  totalValue: number;
  activeFilters: {
    priceRange?: { min: number | null; max: number | null };
    propertyTypes?: string[];
    statuses?: string[];
    locations?: string[];
    marketSegments?: string[];
  };
  performanceStats: {
    totalViews: number;
    totalLeads: number;
    avgConversionRate: number;
    avgDaysOnMarket: number;
  };
  marketSegmentBreakdown: {
    luxury: number;
    midMarket: number;
    entryLevel: number;
  };
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalProperties,
  totalValue,
  activeFilters,
  performanceStats,
  marketSegmentBreakdown
}) => {
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.priceRange?.min || activeFilters.priceRange?.max) count++;
    if (activeFilters.propertyTypes?.length) count++;
    if (activeFilters.statuses?.length) count++;
    if (activeFilters.locations?.length) count++;
    if (activeFilters.marketSegments?.length) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const avgPropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;

  return (
    <div className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Portfolio Stats */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-4">
            <BuildingOfficeIcon className="h-8 w-8 text-white/90" />
            <div>
              <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
              <p className="text-white/80 text-sm">
                {totalProperties} properties • {formatPrice(totalValue)} total value
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm">Avg Value</span>
              </div>
              <div className="text-xl font-bold text-white">{formatPrice(avgPropertyValue)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm">Conversion</span>
              </div>
              <div className="text-xl font-bold text-white">{performanceStats.avgConversionRate.toFixed(1)}%</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm">Avg DOM</span>
              </div>
              <div className="text-xl font-bold text-white">{performanceStats.avgDaysOnMarket} days</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm">Total Leads</span>
              </div>
              <div className="text-xl font-bold text-white">{performanceStats.totalLeads.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Market Segments & Active Filters */}
        <div className="lg:col-span-4">
          <div className="space-y-4">
            {/* Market Segments */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Market Segments</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Luxury ($2M+)</span>
                  <span className="text-white font-medium">{marketSegmentBreakdown.luxury}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Mid-Market</span>
                  <span className="text-white font-medium">{marketSegmentBreakdown.midMarket}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Entry-Level</span>
                  <span className="text-white font-medium">{marketSegmentBreakdown.entryLevel}</span>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Active Filters</h3>
                <div className="space-y-2">
                  {activeFilters.priceRange && (activeFilters.priceRange.min || activeFilters.priceRange.max) && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-white/60" />
                      <span className="text-white/80 text-xs">
                        Price: {activeFilters.priceRange.min ? formatPrice(activeFilters.priceRange.min) : '$0'} - {activeFilters.priceRange.max ? formatPrice(activeFilters.priceRange.max) : 'No limit'}
                      </span>
                    </div>
                  )}
                  
                  {activeFilters.propertyTypes && activeFilters.propertyTypes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-white/60" />
                      <span className="text-white/80 text-xs">
                        Types: {activeFilters.propertyTypes.slice(0, 2).join(', ')}
                        {activeFilters.propertyTypes.length > 2 && ` +${activeFilters.propertyTypes.length - 2} more`}
                      </span>
                    </div>
                  )}
                  
                  {activeFilters.locations && activeFilters.locations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-white/60" />
                      <span className="text-white/80 text-xs">
                        Locations: {activeFilters.locations.slice(0, 2).join(', ')}
                        {activeFilters.locations.length > 2 && ` +${activeFilters.locations.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;