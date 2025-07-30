import React from 'react';
import { ContractorSearchCriteria, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  ArrowRightIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  PaintBrushIcon,
  BoltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ContractorProjectScopeStepProps {
  listing: Listing;
  searchCriteria: Partial<ContractorSearchCriteria>;
  onUpdate: (updates: Partial<ContractorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PROJECT_TYPES = [
  {
    id: 'kitchen-renovation',
    label: 'Kitchen Renovation',
    icon: HomeIcon,
    description: 'Complete or partial kitchen remodel'
  },
  {
    id: 'bathroom-renovation',
    label: 'Bathroom Renovation', 
    icon: SparklesIcon,
    description: 'Bathroom remodel and upgrades'
  },
  {
    id: 'flooring',
    label: 'Flooring Installation',
    icon: BuildingOfficeIcon,
    description: 'Hardwood, tile, carpet, or vinyl flooring'
  },
  {
    id: 'painting',
    label: 'Interior/Exterior Painting',
    icon: PaintBrushIcon,
    description: 'Interior and exterior painting services'
  },
  {
    id: 'electrical',
    label: 'Electrical Work',
    icon: BoltIcon,
    description: 'Wiring, outlets, lighting, electrical repairs'
  },
  {
    id: 'plumbing',
    label: 'Plumbing Services',
    icon: CogIcon,
    description: 'Pipe repair, fixture installation, drain cleaning'
  },
  {
    id: 'general-repairs',
    label: 'General Repairs',
    icon: WrenchScrewdriverIcon,
    description: 'Maintenance and repair work'
  },
  {
    id: 'custom',
    label: 'Other/Custom Project',
    icon: CogIcon,
    description: 'Describe your specific project needs'
  }
];

const ContractorProjectScopeStep: React.FC<ContractorProjectScopeStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const handleProjectTypeSelect = (projectType: string) => {
    onUpdate({ projectType });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({ projectDescription: description });
  };

  const isProjectSelected = Boolean(searchCriteria.projectType);
  const hasDescription = Boolean(searchCriteria.projectDescription?.trim());
  const canContinue = isProjectSelected && (searchCriteria.projectType !== 'custom' || hasDescription);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">What type of project do you need help with?</h3>
        <p className="text-slate-400">
          Select the type of work you need done at {listing.address}
        </p>
      </div>

      {/* Project Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = searchCriteria.projectType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => handleProjectTypeSelect(type.id)}
              className={`
                p-6 rounded-2xl border transition-all duration-200 text-left
                ${isSelected
                  ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-400/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-orange-500/30' : 'bg-orange-500/20'
                }`}>
                  <Icon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{type.label}</h4>
                  <p className="text-slate-400 text-sm">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Project Description (always show, required for custom) */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">
          {searchCriteria.projectType === 'custom' ? 'Describe Your Project *' : 'Additional Project Details (Optional)'}
        </h4>
        <textarea
          value={searchCriteria.projectDescription || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder={
            searchCriteria.projectType === 'custom'
              ? 'Please describe the work you need done in detail...'
              : 'Add any specific details about your project, materials preferences, timeline, or special requirements...'
          }
          className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        />
        {searchCriteria.projectType === 'custom' && !hasDescription && (
          <p className="text-orange-400 text-sm mt-2">* Description required for custom projects</p>
        )}
      </div>

      {/* Selected Project Summary */}
      {isProjectSelected && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
          <h4 className="text-orange-400 font-semibold mb-2">Project Summary</h4>
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="h-5 w-5 text-orange-400" />
            <div>
              <p className="text-white font-medium">
                {PROJECT_TYPES.find(t => t.id === searchCriteria.projectType)?.label}
              </p>
              <p className="text-slate-400 text-sm">at {listing.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="glass"
          onClick={onPrevious}
          disabled={true}
          className="opacity-50 cursor-not-allowed"
        >
          Previous
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          disabled={!canContinue}
        >
          Continue to Timeline
        </Button>
      </div>
    </div>
  );
};

export default ContractorProjectScopeStep;