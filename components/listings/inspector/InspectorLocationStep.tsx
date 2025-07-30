import React from 'react';
import { InspectorSearchCriteria, Listing } from '../../../types';
import Button from '../../shared/Button';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface InspectorLocationStepProps {
  listing: Listing;
  searchCriteria: Partial<InspectorSearchCriteria>;
  onUpdate: (updates: Partial<InspectorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InspectorLocationStep: React.FC<InspectorLocationStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious
}) => {
  return (
    <div className="space-y-8">
      {/* Placeholder content */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Location & Timing Preferences</h3>
        <p className="text-slate-400">This step will allow users to set search radius and urgency preferences.</p>
      </div>

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
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
};

export default InspectorLocationStep;