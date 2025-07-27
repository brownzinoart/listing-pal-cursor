import React, { useState } from 'react';
import { 
  FunnelIcon, 
  MapIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import Button from './Button';

export interface FilterOptions {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  propertyTypes: string[];
  statuses: string[];
  locations: string[];
  marketSegments: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availablePropertyTypes: string[];
  availableStatuses: string[];
  availableLocations: string[];
  onClearAll: () => void;
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availablePropertyTypes,
  availableStatuses,
  availableLocations,
  onClearAll,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    updateFilters({ propertyTypes: newTypes });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    updateFilters({ statuses: newStatuses });
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    updateFilters({ locations: newLocations });
  };

  const toggleMarketSegment = (segment: string) => {
    const newSegments = filters.marketSegments.includes(segment)
      ? filters.marketSegments.filter(s => s !== segment)
      : [...filters.marketSegments, segment];
    updateFilters({ marketSegments: newSegments });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value.replace(/,/g, ''));
    updateFilters({
      priceRange: {
        ...filters.priceRange,
        [type]: numValue
      }
    });
  };

  const formatPrice = (price: number | null) => {
    return price ? price.toLocaleString() : '';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.locations.length > 0) count++;
    if (filters.marketSegments.length > 0) count++;
    return count;
  };

  const FilterCheckbox: React.FC<{ 
    checked: boolean; 
    onChange: () => void; 
    label: string;
    count?: number;
  }> = ({ checked, onChange, label, count }) => (
    <label className="flex items-center justify-between p-2 hover:bg-brand-background rounded-md cursor-pointer">
      <div className="flex items-center">
        <div className={`
          flex items-center justify-center w-4 h-4 border rounded
          ${checked 
            ? 'bg-brand-primary border-brand-primary text-white' 
            : 'border-brand-border bg-brand-panel'
          }
        `}>
          {checked && <CheckIcon className="w-3 h-3" />}
        </div>
        <span className="ml-2 text-sm text-brand-text-primary">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-brand-text-secondary">{count}</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );

  return (
    <div className={`bg-brand-panel border border-brand-border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-brand-text-secondary" />
          <span className="font-medium text-brand-text-primary">Advanced Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-brand-primary text-white text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              leftIcon={<XMarkIcon className="h-4 w-4" />}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CurrencyDollarIcon className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text-primary">Price Range</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-brand-text-secondary mb-1">Min Price</label>
                <input
                  type="text"
                  value={formatPrice(filters.priceRange.min)}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  placeholder="$0"
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-brand-panel text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-text-secondary mb-1">Max Price</label>
                <input
                  type="text"
                  value={formatPrice(filters.priceRange.max)}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-brand-panel text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Market Segments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CurrencyDollarIcon className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text-primary">Market Segments</span>
            </div>
            <div className="space-y-1">
              {['Luxury ($2M+)', 'Mid-Market ($500K-$2M)', 'Entry-Level (<$500K)'].map((segment) => (
                <FilterCheckbox
                  key={segment}
                  checked={filters.marketSegments.includes(segment)}
                  onChange={() => toggleMarketSegment(segment)}
                  label={segment}
                />
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HomeIcon className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text-primary">Property Types</span>
            </div>
            <div className="space-y-1">
              {availablePropertyTypes.map((type) => (
                <FilterCheckbox
                  key={type}
                  checked={filters.propertyTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  label={type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text-primary">Status</span>
            </div>
            <div className="space-y-1">
              {availableStatuses.map((status) => (
                <FilterCheckbox
                  key={status}
                  checked={filters.statuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                  label={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapIcon className="h-4 w-4 text-brand-text-secondary" />
              <span className="text-sm font-medium text-brand-text-primary">Locations</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {availableLocations.map((location) => (
                <FilterCheckbox
                  key={location}
                  checked={filters.locations.includes(location)}
                  onChange={() => toggleLocation(location)}
                  label={location}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;