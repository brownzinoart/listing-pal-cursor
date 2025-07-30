import React, { useState } from "react";
import {
  InspectorSearchCriteria,
  Listing,
  ServiceSearchResult,
  Inspector,
} from "../../../types";
import Button from "../../shared/Button";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface InspectorResultsStepProps {
  listing: Listing;
  searchCriteria: Partial<InspectorSearchCriteria>;
  searchResults: ServiceSearchResult[];
  isSearching: boolean;
  selectedInspectors: string[];
  onUpdate: (updates: Partial<InspectorSearchCriteria>) => void;
  onSearch: () => void;
  onSelect: (inspectorIds: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InspectorResultsStep: React.FC<InspectorResultsStepProps> = ({
  listing,
  searchCriteria,
  searchResults,
  isSearching,
  selectedInspectors,
  onUpdate,
  onSearch,
  onSelect,
  onNext,
  onPrevious,
}) => {
  const [sortBy, setSortBy] = useState<
    "rating" | "price" | "distance" | "availability"
  >("rating");
  const [showFilters, setShowFilters] = useState(false);

  const handleInspectorToggle = (inspectorId: string) => {
    const newSelected = selectedInspectors.includes(inspectorId)
      ? selectedInspectors.filter((id) => id !== inspectorId)
      : [...selectedInspectors, inspectorId];
    onSelect(newSelected);
  };

  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.provider.overallRating - a.provider.overallRating;
      case "price":
        const aPrice = (a.provider as Inspector).standardInspectionFee;
        const bPrice = (b.provider as Inspector).standardInspectionFee;
        return aPrice - bPrice;
      case "distance":
        return a.distance - b.distance;
      case "availability":
        return (
          new Date(a.provider.availability.nextAvailableDate).getTime() -
          new Date(b.provider.availability.nextAvailableDate).getTime()
        );
      default:
        return 0;
    }
  });

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
          />
        ))}
        <span className="text-white font-semibold ml-2">{rating}</span>
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isSearching) {
    return (
      <div className="space-y-8">
        <div className="bg-white/5 rounded-2xl p-12 border border-white/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Searching for Inspectors
            </h3>
            <p className="text-slate-400">
              Finding the best certified inspectors in your area...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Summary and Controls */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Found {searchResults.length} Certified Inspectors
            </h3>
            <p className="text-slate-400">
              Showing inspectors within {searchCriteria.maxDistance} miles of{" "}
              {listing.address}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
              <option value="distance">Sort by Distance</option>
              <option value="availability">Sort by Availability</option>
            </select>

            <Button
              variant="glass"
              onClick={onSearch}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              size="sm"
            >
              Refine Search
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedResults.map((result) => {
          const inspector = result.provider as Inspector;
          const isSelected = selectedInspectors.includes(inspector.id);

          return (
            <div
              key={inspector.id}
              onClick={() => handleInspectorToggle(inspector.id)}
              className={`
                relative p-6 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]
                ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-lg font-bold">
                      {inspector.businessName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      {inspector.businessName}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {inspector.contactName}
                    </p>
                  </div>
                </div>

                {inspector.verified && (
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center justify-between mb-4">
                {renderStarRating(inspector.overallRating)}
                <span className="text-slate-400 text-sm">
                  ({inspector.totalReviews} reviews)
                </span>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {result.distance} mi away
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {result.estimatedResponseTime}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">
                    Standard Inspection
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(inspector.standardInspectionFee)}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {inspector.reportTurnaroundHours}hr report delivery
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-slate-400 text-xs mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {inspector.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
                    >
                      {specialty}
                    </span>
                  ))}
                  {inspector.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
                      +{inspector.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="text-center pt-3 border-t border-white/10">
                <p className="text-slate-400 text-xs mb-1">Next Available</p>
                <p className="text-white font-semibold">
                  {new Date(
                    inspector.availability.nextAvailableDate,
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* Match Score */}
              <div className="absolute top-4 left-4">
                <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                  {result.matchScore}% Match
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedInspectors.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 font-semibold">
                {selectedInspectors.length} inspector(s) selected for comparison
              </p>
              <p className="text-slate-400 text-sm">
                Compare credentials, pricing, and reviews side-by-side
              </p>
            </div>
            <Button variant="glass" onClick={() => onSelect([])} size="sm">
              Clear Selection
            </Button>
          </div>
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
          disabled={selectedInspectors.length === 0}
        >
          Compare Selected ({selectedInspectors.length})
        </Button>
      </div>
    </div>
  );
};

export default InspectorResultsStep;
