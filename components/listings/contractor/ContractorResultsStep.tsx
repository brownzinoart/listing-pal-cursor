import React, { useState } from 'react';
import { ContractorSearchCriteria, Listing, ServiceSearchResult, Contractor } from '../../../types';
import Button from '../../shared/Button';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface ContractorResultsStepProps {
  listing: Listing;
  searchCriteria: Partial<ContractorSearchCriteria>;
  searchResults: ServiceSearchResult[];
  isSearching: boolean;
  selectedContractors: string[];
  onUpdate: (updates: Partial<ContractorSearchCriteria>) => void;
  onSearch: () => void;
  onSelect: (contractorIds: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

type SortOption = 'rating' | 'price' | 'distance' | 'experience';

const ContractorResultsStep: React.FC<ContractorResultsStepProps> = ({
  listing,
  searchCriteria,
  searchResults,
  isSearching,
  selectedContractors,
  onUpdate,
  onSearch,
  onSelect,
  onNext,
  onPrevious
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [maxDistanceFilter, setMaxDistanceFilter] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredResults = searchResults.filter(result => {
    const contractor = result.provider as Contractor;
    if (ratingFilter > 0 && contractor.overallRating < ratingFilter) return false;
    if (result.distance > maxDistanceFilter) return false;
    if (verifiedOnly && !contractor.verified) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const contractorA = a.provider as Contractor;
    const contractorB = b.provider as Contractor;
    
    switch (sortBy) {
      case 'rating':
        return contractorB.overallRating - contractorA.overallRating;
      case 'price':
        return contractorA.hourlyRate - contractorB.hourlyRate;
      case 'distance':
        return a.distance - b.distance;
      case 'experience':
        return contractorB.yearsInBusiness - contractorA.yearsInBusiness;
      default:
        return 0;
    }
  });

  const handleContractorToggle = (contractorId: string) => {
    const newSelection = selectedContractors.includes(contractorId)
      ? selectedContractors.filter(id => id !== contractorId)
      : [...selectedContractors, contractorId];
    onSelect(newSelection);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-400'}`}
          />
        ))}
        <span className="text-white text-sm ml-1">{rating}</span>
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Contractor Search Results</h3>
            <p className="text-slate-400">
              Found {filteredResults.length} contractors {searchCriteria.projectType ? `for ${searchCriteria.projectType}` : ''}
            </p>
          </div>
          {isSearching && (
            <div className="flex items-center space-x-2 text-orange-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
                <option value="distance">Closest</option>
                <option value="experience">Most Experience</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
            >
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300 text-sm">Filters</span>
            </button>
          </div>
          
          <p className="text-slate-400 text-sm">
            {selectedContractors.length} selected for comparison
          </p>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Minimum Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={5}>5 Stars Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Max Distance: {maxDistanceFilter} miles</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={maxDistanceFilter}
                  onChange={(e) => setMaxDistanceFilter(Number(e.target.value))}
                  className="w-full slider"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 text-sm">Verified contractors only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedResults.map((result) => {
          const contractor = result.provider as Contractor;
          const isSelected = selectedContractors.includes(contractor.id);
          
          return (
            <div
              key={contractor.id}
              className={`
                relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
              onClick={() => handleContractorToggle(contractor.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">{contractor.businessName}</h4>
                  <p className="text-slate-400">{contractor.contactName}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    {renderStarRating(contractor.overallRating)}
                    <span className="text-slate-400 text-sm">({contractor.totalReviews} reviews)</span>
                    {contractor.verified && (
                      <div className="flex items-center space-x-1 text-emerald-400">
                        <ShieldCheckIcon className="h-3 w-3" />
                        <span className="text-xs font-semibold">VERIFIED</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-400 text-sm">Hourly Rate</span>
                  </div>
                  <p className="text-emerald-400 font-bold">{formatPrice(contractor.hourlyRate)}/hr</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <ClockIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-400 text-sm">Experience</span>
                  </div>
                  <p className="text-white font-bold">{contractor.yearsInBusiness} years</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPinIcon className="h-4 w-4 text-purple-400" />
                    <span className="text-slate-400 text-sm">Distance</span>
                  </div>
                  <p className="text-white font-bold">{result.distance} miles</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-slate-400 text-sm">Available</span>
                  </div>
                  <p className="text-white font-bold text-sm">
                    {new Date(contractor.availability.nextAvailableDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-md font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                  {contractor.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
                      +{contractor.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 text-sm font-semibold">
                    {result.matchScore}% match
                  </span>
                </div>
                <span className="text-slate-400 text-sm">
                  {isSelected ? 'Selected for comparison' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No contractors found</h3>
          <p className="text-slate-400 mb-4">Try adjusting your filters or search criteria</p>
          <Button variant="glass" onClick={() => setShowFilters(true)}>
            Adjust Filters
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="glass"
          onClick={onPrevious}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Previous
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          disabled={selectedContractors.length === 0}
        >
          Compare Selected ({selectedContractors.length})
        </Button>
      </div>
    </div>
  );
};

export default ContractorResultsStep;