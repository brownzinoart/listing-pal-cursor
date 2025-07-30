import React, { useState, useEffect } from 'react';
import { Contract, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ContractBasicInfoStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SUPPORTED_STATES = [
  { code: 'NC', name: 'North Carolina', available: true },
  { code: 'SC', name: 'South Carolina', available: false },
  { code: 'GA', name: 'Georgia', available: false },
  { code: 'VA', name: 'Virginia', available: false },
  { code: 'FL', name: 'Florida', available: false },
  { code: 'TX', name: 'Texas', available: false },
  { code: 'CA', name: 'California', available: false },
  { code: 'NY', name: 'New York', available: false },
];

const CONTRACT_TYPES = [
  { 
    id: 'purchase', 
    name: 'Purchase Agreement', 
    description: 'Standard offer to purchase real estate',
    icon: BuildingOfficeIcon
  },
  { 
    id: 'lease', 
    name: 'Lease Agreement', 
    description: 'Rental/lease contract for tenants',
    icon: DocumentTextIcon,
    available: false
  },
  { 
    id: 'listing', 
    name: 'Listing Agreement', 
    description: 'Agreement between seller and agent',
    icon: DocumentTextIcon,
    available: false
  },
  { 
    id: 'buyer-representation', 
    name: 'Buyer Representation', 
    description: 'Agreement between buyer and agent',
    icon: DocumentTextIcon,
    available: false
  },
];

const ContractBasicInfoStep: React.FC<ContractBasicInfoStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [selectedState, setSelectedState] = useState(contractData.state || 'NC');
  const [selectedType, setSelectedType] = useState(contractData.contractType || 'purchase');
  const [showStateInfo, setShowStateInfo] = useState(false);

  useEffect(() => {
    // Update contract data when selections change
    onUpdate({
      state: selectedState,
      contractType: selectedType as Contract['contractType']
    });
  }, [selectedState, selectedType]);

  return (
    <div className="space-y-8">
      {/* Property Summary */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Property Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Address</p>
            <p className="text-white font-medium">{listing.address}</p>
          </div>
          <div>
            <p className="text-slate-400">List Price</p>
            <p className="text-white font-medium">
              ${listing.price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Property Type</p>
            <p className="text-white font-medium">{listing.propertyType || 'Residential'}</p>
          </div>
          <div>
            <p className="text-slate-400">Size</p>
            <p className="text-white font-medium">
              {listing.bedrooms} bed / {listing.bathrooms} bath / {listing.squareFootage.toLocaleString()} sq ft
            </p>
          </div>
        </div>
      </div>

      {/* State Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-emerald-400" />
            Select State
          </h3>
          <button
            onClick={() => setShowStateInfo(!showStateInfo)}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
          >
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            Why does state matter?
          </button>
        </div>
        
        {showStateInfo && (
          <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300">
              Real estate contracts vary significantly by state. Each state has specific requirements,
              disclosures, and procedures. We've tailored our contracts to comply with state-specific
              regulations and common practices.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUPPORTED_STATES.map((state) => (
            <button
              key={state.code}
              onClick={() => state.available && setSelectedState(state.code)}
              disabled={!state.available}
              className={`
                relative p-4 rounded-xl border transition-all duration-200
                ${selectedState === state.code
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                  : state.available
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <div className="text-lg font-bold">{state.code}</div>
              <div className="text-xs mt-1">{state.name}</div>
              {!state.available && (
                <div className="absolute top-1 right-1 text-xs text-slate-500">Coming Soon</div>
              )}
              {state.code === 'NC' && state.available && (
                <div className="absolute top-1 right-1">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Pilot
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Contract Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTRACT_TYPES.map((type) => {
            const Icon = type.icon;
            const isAvailable = type.available !== false;
            
            return (
              <button
                key={type.id}
                onClick={() => isAvailable && setSelectedType(type.id)}
                disabled={!isAvailable}
                className={`
                  relative p-6 rounded-xl border transition-all duration-200 text-left
                  ${selectedType === type.id
                    ? 'bg-emerald-500/20 border-emerald-500/50'
                    : isAvailable
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    : 'bg-white/5 border-white/10 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div className="flex items-start space-x-4">
                  <Icon className={`h-8 w-8 flex-shrink-0 ${
                    selectedType === type.id ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                  <div>
                    <h4 className={`font-semibold ${
                      selectedType === type.id ? 'text-white' : 'text-slate-300'
                    }`}>
                      {type.name}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">{type.description}</p>
                  </div>
                </div>
                {!isAvailable && (
                  <div className="absolute top-2 right-2 text-xs text-slate-500">Coming Soon</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* North Carolina Specific Info */}
      {selectedState === 'NC' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <h4 className="text-amber-400 font-semibold mb-2 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            North Carolina Contract Requirements
          </h4>
          <ul className="space-y-2 text-sm text-amber-300">
            <li>• Attorney review is required for all real estate closings</li>
            <li>• Due diligence period allows buyers to terminate for any reason</li>
            <li>• Earnest money is typically 1-2% of purchase price</li>
            <li>• Standard closing time is 30-45 days</li>
            <li>• Property disclosure statement is required from sellers</li>
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <Button
          variant="glass"
          onClick={() => window.history.back()}
          disabled={true}
          className="opacity-50 cursor-not-allowed"
        >
          Previous
        </Button>
        
        <Button
          variant="gradient"
          onClick={onNext}
          rightIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Continue to Parties
        </Button>
      </div>
    </div>
  );
};

export default ContractBasicInfoStep;