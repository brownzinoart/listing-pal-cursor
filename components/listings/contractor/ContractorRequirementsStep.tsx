import React from 'react';
import { ContractorSearchCriteria, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  StarIcon,
  AcademicCapIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface ContractorRequirementsStepProps {
  listing: Listing;
  searchCriteria: Partial<ContractorSearchCriteria>;
  onUpdate: (updates: Partial<ContractorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const BUDGET_RANGES = [
  { value: 'under-1k', label: 'Under $1,000', description: 'Small repairs and quick fixes' },
  { value: '1k-5k', label: '$1,000 - $5,000', description: 'Minor renovations and improvements' },
  { value: '5k-15k', label: '$5,000 - $15,000', description: 'Moderate projects and upgrades' },
  { value: '15k-50k', label: '$15,000 - $50,000', description: 'Major renovations and remodels' },
  { value: 'over-50k', label: '$50,000+', description: 'Large-scale projects and custom work' },
  { value: 'flexible', label: 'Get quotes first', description: 'Flexible based on contractor estimates' }
];

const ContractorRequirementsStep: React.FC<ContractorRequirementsStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const handleBudgetChange = (budgetRange: string) => {
    onUpdate({ budgetRange });
  };

  const handleRequirementToggle = (requirement: string, enabled: boolean) => {
    const current = searchCriteria.contractorRequirements || [];
    const updated = enabled
      ? [...current, requirement]
      : current.filter(r => r !== requirement);
    onUpdate({ contractorRequirements: updated });
  };

  const isRequirementSelected = (requirement: string) => {
    return searchCriteria.contractorRequirements?.includes(requirement) || false;
  };

  const canContinue = Boolean(searchCriteria.budgetRange);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Contractor Requirements</h3>
        <p className="text-slate-400">
          Set your budget and preferred contractor qualifications
        </p>
      </div>

      {/* Budget Range */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">What's your project budget?</h4>
        <div className="space-y-3">
          {BUDGET_RANGES.map((budget) => {
            const isSelected = searchCriteria.budgetRange === budget.value;
            
            return (
              <button
                key={budget.value}
                onClick={() => handleBudgetChange(budget.value)}
                className={`
                  w-full p-4 rounded-lg border transition-all duration-200 text-left
                  ${isSelected
                    ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{budget.label}</p>
                      <p className="text-slate-400 text-sm">{budget.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contractor Qualifications */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Preferred contractor qualifications (optional)</h4>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequirementSelected('licensed-insured')}
              onChange={(e) => handleRequirementToggle('licensed-insured', e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="text-white font-medium">Licensed & Insured</span>
                <p className="text-slate-400 text-sm">Contractors with valid licenses and insurance coverage</p>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequirementSelected('highly-rated')}
              onChange={(e) => handleRequirementToggle('highly-rated', e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center space-x-3">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <div>
                <span className="text-white font-medium">Highly Rated (4.5+ stars)</span>
                <p className="text-slate-400 text-sm">Only show contractors with excellent customer reviews</p>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequirementSelected('experienced')}
              onChange={(e) => handleRequirementToggle('experienced', e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center space-x-3">
              <TrophyIcon className="h-5 w-5 text-purple-400" />
              <div>
                <span className="text-white font-medium">Experienced (5+ years)</span>
                <p className="text-slate-400 text-sm">Contractors with significant industry experience</p>
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequirementSelected('certified')}
              onChange={(e) => handleRequirementToggle('certified', e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-5 w-5 text-blue-400" />
              <div>
                <span className="text-white font-medium">Professionally Certified</span>
                <p className="text-slate-400 text-sm">Contractors with industry certifications and specializations</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Search Summary */}
      {canContinue && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
          <h4 className="text-orange-400 font-semibold mb-3">Ready to Search</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-slate-400">Project:</span>
              <span className="text-white">
                {searchCriteria.projectType?.replace('-', ' ')} at {listing.city}, {listing.state}
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-slate-400">Budget:</span>
              <span className="text-white">
                {BUDGET_RANGES.find(b => b.value === searchCriteria.budgetRange)?.label}
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-slate-400">Timeline:</span>
              <span className="text-white">{searchCriteria.timeframe?.replace('-', ' ')}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-slate-400">Search radius:</span>
              <span className="text-white">{searchCriteria.searchRadius} miles</span>
            </div>
            {searchCriteria.contractorRequirements && searchCriteria.contractorRequirements.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="text-slate-400">Requirements:</span>
                <span className="text-white">
                  {searchCriteria.contractorRequirements.length} qualification{searchCriteria.contractorRequirements.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
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
          Search Contractors
        </Button>
      </div>
    </div>
  );
};

export default ContractorRequirementsStep;