import React from "react";
import { InspectorSearchCriteria, Listing } from "../../../types";
import Button from "../../shared/Button";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface InspectorRequirementsStepProps {
  listing: Listing;
  searchCriteria: Partial<InspectorSearchCriteria>;
  onUpdate: (updates: Partial<InspectorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InspectorRequirementsStep: React.FC<InspectorRequirementsStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Inspector Requirements
        </h3>
        <p className="text-slate-400">
          This step will allow users to set certification and insurance
          requirements.
        </p>
      </div>

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
          Search Inspectors
        </Button>
      </div>
    </div>
  );
};

export default InspectorRequirementsStep;
