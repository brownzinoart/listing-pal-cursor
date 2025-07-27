import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, HomeIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Listing } from '../../types';

export interface PropertySelectorProps {
  listings: Listing[];
  selectedListings: string[];
  onSelectionChange: (listingIds: string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  maxDisplayItems?: number;
  showAllOption?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  listings,
  selectedListings,
  onSelectionChange,
  placeholder = "Select properties...",
  multiSelect = true,
  maxDisplayItems = 50,
  showAllOption = true,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          trigger: 'px-3 py-1.5 text-sm',
          dropdown: 'text-sm',
          option: 'px-3 py-2',
          search: 'px-3 py-2 text-sm',
        };
      case 'lg':
        return {
          trigger: 'px-4 py-3 text-base',
          dropdown: 'text-base',
          option: 'px-4 py-3',
          search: 'px-4 py-3 text-base',
        };
      default:
        return {
          trigger: 'px-3 py-2 text-sm',
          dropdown: 'text-sm',
          option: 'px-3 py-2.5',
          search: 'px-3 py-2 text-sm',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Filter listings based on search term
  const filteredListings = useMemo(() => {
    if (!searchTerm) return listings.slice(0, maxDisplayItems);
    
    return listings
      .filter(listing => 
        listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.state?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, maxDisplayItems);
  }, [listings, searchTerm, maxDisplayItems]);

  // Calculate display text
  const getDisplayText = () => {
    if (selectedListings.length === 0) {
      return placeholder;
    }
    
    if (showAllOption && selectedListings.length === listings.length) {
      return 'All Properties';
    }
    
    if (selectedListings.length === 1) {
      const listing = listings.find(l => l.id === selectedListings[0]);
      return listing?.address || 'Unknown Property';
    }
    
    return `${selectedListings.length} Properties Selected`;
  };

  const handleToggleListing = (listingId: string) => {
    if (!multiSelect) {
      onSelectionChange([listingId]);
      setIsOpen(false);
      return;
    }

    if (selectedListings.includes(listingId)) {
      onSelectionChange(selectedListings.filter(id => id !== listingId));
    } else {
      onSelectionChange([...selectedListings, listingId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(listings.map(l => l.id));
    }
  };

  const isSelected = (listingId: string) => selectedListings.includes(listingId);
  const isAllSelected = selectedListings.length === listings.length && listings.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses.trigger}
          w-full
          bg-brand-panel
          border
          border-brand-border
          rounded-lg
          text-left
          text-brand-text-primary
          hover:bg-brand-card
          hover:border-brand-primary/30
          focus:outline-none
          focus:ring-2
          focus:ring-brand-primary
          focus:border-brand-primary
          transition-all
          duration-200
          flex
          items-center
          justify-between
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <HomeIcon className="h-4 w-4 text-brand-text-tertiary flex-shrink-0" />
          <span className="truncate">
            {getDisplayText()}
          </span>
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 text-brand-text-tertiary transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-1 bg-brand-panel border border-brand-border rounded-lg shadow-xl max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-brand-border">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    ${sizeClasses.search}
                    w-full
                    pl-9
                    bg-brand-background
                    border
                    border-brand-border
                    rounded-md
                    text-brand-text-primary
                    placeholder-brand-text-tertiary
                    focus:outline-none
                    focus:ring-2
                    focus:ring-brand-primary
                    focus:border-brand-primary
                  `}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto">
              {/* Select All Option */}
              {multiSelect && showAllOption && listings.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`
                    ${sizeClasses.option}
                    w-full
                    text-left
                    hover:bg-brand-background
                    transition-colors
                    duration-150
                    flex
                    items-center
                    gap-3
                    border-b
                    border-brand-border
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded border border-brand-border flex items-center justify-center
                    ${isAllSelected ? 'bg-brand-primary border-brand-primary' : 'bg-brand-background'}
                  `}>
                    {isAllSelected && (
                      <CheckIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4 text-brand-text-tertiary" />
                    <span className="font-medium text-brand-text-primary">All Properties</span>
                  </div>
                </button>
              )}

              {/* Property Options */}
              {filteredListings.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => handleToggleListing(listing.id)}
                  className={`
                    ${sizeClasses.option}
                    w-full
                    text-left
                    hover:bg-brand-background
                    transition-colors
                    duration-150
                    flex
                    items-center
                    gap-3
                  `}
                >
                  {multiSelect && (
                    <div className={`
                      w-4 h-4 rounded border border-brand-border flex items-center justify-center
                      ${isSelected(listing.id) ? 'bg-brand-primary border-brand-primary' : 'bg-brand-background'}
                    `}>
                      {isSelected(listing.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-brand-text-tertiary flex-shrink-0" />
                      <span className="font-medium text-brand-text-primary truncate">
                        {listing.address}
                      </span>
                    </div>
                    {(listing.city || listing.state) && (
                      <div className="text-xs text-brand-text-secondary mt-1">
                        {[listing.city, listing.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {filteredListings.length === 0 && (
                <div className={`${sizeClasses.option} text-brand-text-tertiary text-center`}>
                  {searchTerm ? 'No properties found' : 'No properties available'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertySelector;