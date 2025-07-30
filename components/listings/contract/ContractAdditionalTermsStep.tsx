import React, { useState, useEffect } from 'react';
import { Contract, ContractAddendum, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface ContractAdditionalTermsStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractAdditionalTermsStep: React.FC<ContractAdditionalTermsStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [addenda, setAddenda] = useState<ContractAddendum[]>(
    contractData.addenda || []
  );
  const [specialStipulations, setSpecialStipulations] = useState<string[]>(
    contractData.specialStipulations || []
  );
  const [additionalTerms, setAdditionalTerms] = useState<string>(
    contractData.additionalTerms || ''
  );
  const [newStipulation, setNewStipulation] = useState('');

  // Standard addenda for NC contracts
  const standardAddenda = [
    {
      type: 'backup' as const,
      title: 'Backup Contract',
      description: 'This offer is contingent upon termination of existing contract'
    },
    {
      type: 'short-sale' as const,
      title: 'Short Sale',
      description: 'Property is subject to lender approval of short sale'
    },
    {
      type: 'fha-va' as const,
      title: 'FHA/VA Financing',
      description: 'Special terms for government-backed loans'
    },
    {
      type: 'new-construction' as const,
      title: 'New Construction',
      description: 'Terms specific to newly constructed properties'
    },
    {
      type: 'hoa' as const,
      title: 'Homeowners Association',
      description: 'Property is subject to HOA rules and fees'
    }
  ];

  // Common special stipulations
  const commonStipulations = [
    'Seller to provide clear title at closing',
    'Property to be delivered in broom-clean condition',
    'Seller to repair any damage occurring between contract and closing',
    'All mechanical systems to be in working order at closing',
    'Buyer to conduct final walk-through within 48 hours of closing',
    'Seller to provide all warranties and manuals for appliances and systems',
    'Any repair work to be performed by licensed contractors',
    'Utilities to remain on during inspection period'
  ];

  // Initialize with common addenda if property meets criteria
  useEffect(() => {
    if (addenda.length === 0) {
      const initialAddenda: ContractAddendum[] = [];
      
      // Add HOA addendum if listing indicates HOA
      if (listing.hoaFees && listing.hoaFees > 0) {
        initialAddenda.push({
          type: 'hoa',
          included: true,
          details: `Monthly HOA fee: $${listing.hoaFees}`
        });
      }

      // Add FHA/VA if financing type suggests it
      if (contractData.financials?.financingType === 'fha' || contractData.financials?.financingType === 'va') {
        initialAddenda.push({
          type: 'fha-va',
          included: true,
          details: `${contractData.financials.financingType.toUpperCase()} loan terms apply`
        });
      }

      if (initialAddenda.length > 0) {
        setAddenda(initialAddenda);
      }
    }
  }, []);

  // Update contract data whenever terms change
  useEffect(() => {
    onUpdate({ 
      addenda, 
      specialStipulations, 
      additionalTerms 
    });
  }, [addenda, specialStipulations, additionalTerms]);

  const updateAddendum = (index: number, updates: Partial<ContractAddendum>) => {
    const updated = addenda.map((addendum, i) => 
      i === index ? { ...addendum, ...updates } : addendum
    );
    setAddenda(updated);
  };

  const addStandardAddendum = (type: ContractAddendum['type']) => {
    const standardAddendum = standardAddenda.find(a => a.type === type);
    if (standardAddendum && !addenda.some(a => a.type === type)) {
      const newAddendum: ContractAddendum = {
        type,
        included: true,
        details: standardAddendum.description
      };
      setAddenda([...addenda, newAddendum]);
    }
  };

  const addCustomAddendum = () => {
    const newAddendum: ContractAddendum = {
      type: 'custom',
      included: true,
      details: ''
    };
    setAddenda([...addenda, newAddendum]);
  };

  const removeAddendum = (index: number) => {
    setAddenda(addenda.filter((_, i) => i !== index));
  };

  const addStipulation = (stipulation: string) => {
    if (stipulation.trim() && !specialStipulations.includes(stipulation.trim())) {
      setSpecialStipulations([...specialStipulations, stipulation.trim()]);
      setNewStipulation('');
    }
  };

  const removeStipulation = (index: number) => {
    setSpecialStipulations(specialStipulations.filter((_, i) => i !== index));
  };

  const getAddendumTitle = (addendum: ContractAddendum) => {
    const standard = standardAddenda.find(a => a.type === addendum.type);
    return standard ? standard.title : 'Custom Addendum';
  };

  return (
    <div className="space-y-8">
      {/* Information Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          About Additional Terms & Addenda
        </h4>
        <div className="text-blue-300 text-sm space-y-2">
          <p>
            <strong>Special Stipulations</strong> are custom terms specific to this transaction that supplement the standard contract language.
          </p>
          <p>
            <strong>Addenda</strong> are standardized additional forms that address specific situations like HOA properties, government financing, or short sales.
          </p>
          <p>
            <strong>Additional Terms</strong> provide space for any other contract modifications or clarifications.
          </p>
        </div>
      </div>

      {/* Standard Addenda */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <DocumentPlusIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Standard Addenda
        </h3>

        {/* Available addenda to add */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Available Addenda (click to add)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {standardAddenda
              .filter(standard => !addenda.some(a => a.type === standard.type))
              .map((standard) => (
              <button
                key={standard.type}
                onClick={() => addStandardAddendum(standard.type)}
                className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-left transition-all duration-200"
              >
                <div className="font-semibold text-emerald-300 mb-1">{standard.title}</div>
                <div className="text-xs text-emerald-400">{standard.description}</div>
              </button>
            ))}
            
            <button
              onClick={addCustomAddendum}
              className="p-4 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 rounded-lg text-left transition-all duration-200"
            >
              <div className="font-semibold text-slate-300 mb-1 flex items-center">
                <PlusIcon className="h-4 w-4 mr-1" />
                Custom Addendum
              </div>
              <div className="text-xs text-slate-400">Add a custom addendum</div>
            </button>
          </div>
        </div>

        {/* Selected addenda */}
        <div className="space-y-4">
          {addenda.map((addendum, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-semibold">{getAddendumTitle(addendum)}</h4>
                
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addendum.included}
                      onChange={(e) => updateAddendum(index, { included: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm text-slate-300">
                      {addendum.included ? 'Included' : 'Not Included'}
                    </span>
                  </label>
                  
                  <button
                    onClick={() => removeAddendum(index)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                    title="Remove addendum"
                  >
                    <TrashIcon className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>

              {addendum.included && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Addendum Details
                  </label>
                  <textarea
                    value={addendum.details || ''}
                    onChange={(e) => updateAddendum(index, { details: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Specify terms and conditions for this addendum"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special Stipulations */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Special Stipulations
        </h3>

        <div className="space-y-4">
          {/* Common stipulations */}
          <div>
            <h4 className="text-white font-medium mb-3">Common Stipulations (click to add)</h4>
            <div className="flex flex-wrap gap-2">
              {commonStipulations
                .filter(stipulation => !specialStipulations.includes(stipulation))
                .map((stipulation, index) => (
                <button
                  key={index}
                  onClick={() => addStipulation(stipulation)}
                  className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors"
                >
                  + {stipulation}
                </button>
              ))}
            </div>
          </div>

          {/* Custom stipulation input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newStipulation}
              onChange={(e) => setNewStipulation(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Add custom special stipulation"
              onKeyPress={(e) => e.key === 'Enter' && addStipulation(newStipulation)}
            />
            <Button
              variant="glass"
              size="sm"
              onClick={() => addStipulation(newStipulation)}
              disabled={!newStipulation.trim()}
            >
              Add
            </Button>
          </div>

          {/* Added stipulations */}
          {specialStipulations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-medium">Added Stipulations</h4>
              {specialStipulations.map((stipulation, index) => (
                <div key={index} className="flex items-start justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-white text-sm flex-1 mr-2">{stipulation}</span>
                  <button
                    onClick={() => removeStipulation(index)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 flex-shrink-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Terms */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Additional Terms & Modifications</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Other Contract Terms or Modifications
          </label>
          <textarea
            value={additionalTerms}
            onChange={(e) => setAdditionalTerms(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add any other terms, modifications, or clarifications to the contract..."
            rows={6}
          />
          <p className="text-xs text-slate-400 mt-2">
            Use this space for any additional contract language, modifications to standard terms, or specific agreements between parties.
          </p>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-3 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Important Legal Notice
        </h4>
        <div className="text-amber-300 text-sm space-y-2">
          <p>
            <strong>Attorney Review Required:</strong> All additional terms, stipulations, and addenda should be reviewed by a qualified North Carolina real estate attorney before contract execution.
          </p>
          <p>
            <strong>Compliance:</strong> Ensure all terms comply with North Carolina real estate law and local regulations.
          </p>
          <p>
            <strong>Clarity:</strong> Use clear, unambiguous language. Avoid conflicting terms that may contradict the standard contract language.
          </p>
        </div>
      </div>

      {/* Summary */}
      {(addenda.some(a => a.included) || specialStipulations.length > 0 || additionalTerms.trim()) && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <h4 className="text-emerald-400 font-semibold mb-3">Contract Additions Summary</h4>
          <div className="text-emerald-300 text-sm space-y-2">
            {addenda.filter(a => a.included).length > 0 && (
              <p>• {addenda.filter(a => a.included).length} addenda will be attached to this contract</p>
            )}
            {specialStipulations.length > 0 && (
              <p>• {specialStipulations.length} special stipulations added</p>
            )}
            {additionalTerms.trim() && (
              <p>• Additional contract terms specified</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <Button
          variant="glass"
          onClick={onPrevious}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
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
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default ContractAdditionalTermsStep;