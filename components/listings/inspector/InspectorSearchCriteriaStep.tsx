import React from 'react';
import { InspectorSearchCriteria, Listing } from '../../../types';
import Button from '../../shared/Button';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface InspectorSearchCriteriaStepProps {
  listing: Listing;
  searchCriteria: Partial<InspectorSearchCriteria>;
  onUpdate: (updates: Partial<InspectorSearchCriteria>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const INSPECTION_TYPES = [
  { id: 'general', name: 'General Home Inspection', description: 'Comprehensive inspection of all major systems', price: '$400-600' },
  { id: 'pest', name: 'Pest Inspection', description: 'Check for termites, wood-boring insects, and other pests', price: '$75-150' },
  { id: 'radon', name: 'Radon Testing', description: 'Test for radon gas levels in the home', price: '$125-200' },
  { id: 'mold', name: 'Mold Assessment', description: 'Inspection for mold and moisture issues', price: '$200-400' },
  { id: 'structural', name: 'Structural Inspection', description: 'Detailed assessment of foundation and structural elements', price: '$300-500' },
  { id: 'electrical', name: 'Electrical Inspection', description: 'Focused inspection of electrical systems', price: '$150-250' },
  { id: 'plumbing', name: 'Plumbing Inspection', description: 'Detailed check of all plumbing systems', price: '$150-250' },
  { id: 'hvac', name: 'HVAC Inspection', description: 'Heating, ventilation, and air conditioning systems', price: '$150-300' },
];

const PROPERTY_TYPES = [
  { id: 'residential', name: 'Single Family Home', icon: '🏠' },
  { id: 'condo', name: 'Condo/Townhouse', icon: '🏢' },
  { id: 'commercial', name: 'Commercial Property', icon: '🏬' },
];

const InspectorSearchCriteriaStep: React.FC<InspectorSearchCriteriaStepProps> = ({
  listing,
  searchCriteria,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const handleInspectionTypeToggle = (typeId: string) => {
    const currentTypes = searchCriteria.inspectionTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId];
    
    onUpdate({ inspectionTypes: newTypes });
  };

  const handlePropertyTypeChange = (type: 'residential' | 'commercial') => {
    onUpdate({ propertyType: type });
  };

  return (
    <div className="space-y-8">
      {/* Property Information Display */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-300 text-sm">Address</p>
            <p className="text-white font-semibold">{listing.address}</p>
            <p className="text-slate-400 text-sm">{listing.city}, {listing.state} {listing.zipCode}</p>
          </div>
          <div>
            <p className="text-slate-300 text-sm">Property Details</p>
            <p className="text-white">{listing.bedrooms} bed / {listing.bathrooms} bath</p>
            <p className="text-slate-400 text-sm">{listing.squareFootage?.toLocaleString()} sq ft • Built {listing.yearBuilt}</p>
          </div>
        </div>
      </div>

      {/* Property Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Property Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROPERTY_TYPES.map((type) => (
            <div
              key={type.id}
              onClick={() => handlePropertyTypeChange(type.id as 'residential' | 'commercial')}
              className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${searchCriteria.propertyType === type.id
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className="text-white font-semibold">{type.name}</p>
                {searchCriteria.propertyType === type.id && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-400 mx-auto mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Types Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Inspection Services Needed</h3>
        <p className="text-slate-400 text-sm mb-6">Select all inspection types you need. Multiple inspections can often be bundled for savings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INSPECTION_TYPES.map((type) => {
            const isSelected = searchCriteria.inspectionTypes?.includes(type.id) || false;
            
            return (
              <div
                key={type.id}
                onClick={() => handleInspectionTypeToggle(type.id)}
                className={`
                  relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${isSelected
                    ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{type.name}</h4>
                    <p className="text-slate-400 text-sm mb-2">{type.description}</p>
                    <p className="text-emerald-400 text-sm font-semibold">{type.price}</p>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0 ml-3" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Considerations */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
        <h4 className="text-amber-400 font-semibold mb-2">💡 Inspection Tips</h4>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• General inspection is recommended for all property purchases</li>
          <li>• Pest inspection is often required by lenders</li>
          <li>• Consider radon testing if property is in a high-risk area</li>
          <li>• Bundle multiple inspections for potential cost savings</li>
        </ul>
      </div>

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
          disabled={!searchCriteria.inspectionTypes || searchCriteria.inspectionTypes.length === 0}
        >
          Continue to Location
        </Button>
      </div>
    </div>
  );
};

export default InspectorSearchCriteriaStep;