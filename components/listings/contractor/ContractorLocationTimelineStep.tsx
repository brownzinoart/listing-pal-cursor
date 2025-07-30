import React from 'react';
import { ContractorSearchCriteria, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface ContractorLocationTimelineStepProps {
  listing: Listing;
  searchCriteria: Partial<ContractorSearchCriteria>;
  onUpdate: (updates: Partial<ContractorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SEARCH_RADIUS_OPTIONS = [
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 75, label: '75 miles' },
  { value: 100, label: '100+ miles' }
];

const TIMEFRAME_OPTIONS = [
  { value: 'asap', label: 'ASAP (Within 1 week)', urgent: true },
  { value: '1-2-weeks', label: '1-2 weeks', urgent: false },
  { value: '1-month', label: 'Within 1 month', urgent: false },
  { value: '2-3-months', label: '2-3 months', urgent: false },
  { value: 'flexible', label: 'Flexible timeline', urgent: false }
];

const ContractorLocationTimelineStep: React.FC<ContractorLocationTimelineStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const handleRadiusChange = (searchRadius: number) => {
    onUpdate({ searchRadius });
  };

  const handleTimeframeChange = (timeframe: string) => {
    onUpdate({ timeframe });
  };

  const canContinue = Boolean(searchCriteria.searchRadius && searchCriteria.timeframe);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Location & Timeline Preferences</h3>
        <p className="text-slate-400">
          Set your search area and project timeline for {searchCriteria.projectType?.replace('-', ' ')} work
        </p>
      </div>

      {/* Property Location */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MapPinIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Project Location</h4>
            <p className="text-slate-300">{listing.address}</p>
            <p className="text-slate-400 text-sm">{listing.city}, {listing.state} {listing.zipCode}</p>
          </div>
        </div>
      </div>

      {/* Search Radius */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">How far should we search for contractors?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SEARCH_RADIUS_OPTIONS.map((option) => {
            const isSelected = searchCriteria.searchRadius === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleRadiusChange(option.value)}
                className={`
                  p-4 rounded-lg border transition-all duration-200 text-center
                  ${isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <p className="text-white font-semibold">{option.label}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {option.value === 10 ? 'Local only' : 
                   option.value === 25 ? 'Nearby' :
                   option.value === 50 ? 'Regional' :
                   option.value === 75 ? 'Extended' : 'Statewide'}
                </p>
              </button>
            );
          })}
        </div>
        {searchCriteria.searchRadius && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              ✓ Searching within {searchCriteria.searchRadius} miles of {listing.city}, {listing.state}
            </p>
          </div>
        )}
      </div>

      {/* Project Timeline */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">When do you need this project completed?</h4>
        <div className="space-y-3">
          {TIMEFRAME_OPTIONS.map((option) => {
            const isSelected = searchCriteria.timeframe === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleTimeframeChange(option.value)}
                className={`
                  w-full p-4 rounded-lg border transition-all duration-200 text-left
                  ${isSelected
                    ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      option.urgent ? 'bg-red-500/20' : 'bg-orange-500/20'
                    }`}>
                      <ClockIcon className={`h-4 w-4 ${
                        option.urgent ? 'text-red-400' : 'text-orange-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      {option.urgent && (
                        <p className="text-red-400 text-xs">Rush fees may apply</p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {canContinue && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <h4 className="text-emerald-400 font-semibold mb-3">Search Preferences Set</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-white">
                Searching within {searchCriteria.searchRadius} miles of {listing.city}, {listing.state}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-white">
                Timeline: {TIMEFRAME_OPTIONS.find(t => t.value === searchCriteria.timeframe)?.label}
              </span>
            </div>
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
          disabled={!canContinue}
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
};

export default ContractorLocationTimelineStep;