import React, { useState, useEffect } from 'react';
import { Contract, ContractContingency, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface ContractContingenciesStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractContingenciesStep: React.FC<ContractContingenciesStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [contingencies, setContingencies] = useState<ContractContingency[]>(
    contractData.contingencies || []
  );

  // Initialize with standard contingencies if none exist
  useEffect(() => {
    if (contingencies.length === 0) {
      const standardContingencies: ContractContingency[] = [
        {
          type: 'inspection',
          included: true,
          deadline: contractData.dates?.inspectionDeadline || '',
          details: 'Professional home inspection',
          inspectionTypes: ['general', 'pest', 'radon'],
          repairLimit: 2500
        },
        {
          type: 'financing',
          included: contractData.financials?.financingType !== 'cash',
          deadline: contractData.dates?.financingDeadline || '',
          details: 'Loan approval contingency',
          loanType: contractData.financials?.financingType || 'conventional'
        },
        {
          type: 'appraisal',
          included: contractData.financials?.financingType !== 'cash',
          deadline: contractData.dates?.appraisalDeadline || '',
          details: 'Property must appraise at or above purchase price'
        }
      ];
      setContingencies(standardContingencies);
    }
  }, []);

  // Update contract data whenever contingencies change
  useEffect(() => {
    onUpdate({ contingencies });
  }, [contingencies]);

  const updateContingency = (index: number, updates: Partial<ContractContingency>) => {
    const updated = contingencies.map((contingency, i) => 
      i === index ? { ...contingency, ...updates } : contingency
    );
    setContingencies(updated);
  };

  const addContingency = (type: ContractContingency['type']) => {
    const newContingency: ContractContingency = {
      type,
      included: true,
      deadline: '',
      details: ''
    };

    // Set defaults based on type
    switch (type) {
      case 'inspection':
        newContingency.inspectionTypes = ['general'];
        newContingency.repairLimit = 2500;
        break;
      case 'financing':
        newContingency.loanType = contractData.financials?.financingType || 'conventional';
        break;
      case 'sale':
        newContingency.propertyAddress = '';
        newContingency.expectedSaleDate = '';
        break;
    }

    setContingencies([...contingencies, newContingency]);
  };

  const removeContingency = (index: number) => {
    setContingencies(contingencies.filter((_, i) => i !== index));
  };

  const getContingencyIcon = (type: ContractContingency['type']) => {
    switch (type) {
      case 'inspection': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'financing': return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'appraisal': return <HomeIcon className="h-5 w-5" />;
      case 'sale': return <HomeIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getContingencyTitle = (type: ContractContingency['type']) => {
    switch (type) {
      case 'inspection': return 'Inspection Contingency';
      case 'financing': return 'Financing Contingency';
      case 'appraisal': return 'Appraisal Contingency';
      case 'sale': return 'Sale of Buyer Property';
      case 'other': return 'Other Contingency';
      default: return 'Contingency';
    }
  };

  const inspectionTypes = [
    { value: 'general', label: 'General Home Inspection' },
    { value: 'pest', label: 'Pest/Termite Inspection' },
    { value: 'radon', label: 'Radon Testing' },
    { value: 'well', label: 'Well Water Testing' },
    { value: 'septic', label: 'Septic System Inspection' },
    { value: 'roof', label: 'Roof Inspection' },
    { value: 'hvac', label: 'HVAC Inspection' },
    { value: 'foundation', label: 'Foundation Inspection' }
  ];

  const FieldLabel: React.FC<{ 
    children: React.ReactNode; 
    required?: boolean; 
    recommended?: boolean;
  }> = ({ children, required, recommended }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
      {children}
      {required && <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded-full">Required</span>}
      {recommended && <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">Recommended</span>}
    </label>
  );

  return (
    <div className="space-y-8">
      {/* Information Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          About Contract Contingencies
        </h4>
        <div className="text-blue-300 text-sm space-y-2">
          <p>
            <strong>Contingencies</strong> are conditions that must be met for the contract to proceed. 
            If a contingency is not satisfied, the buyer can typically terminate the contract and receive their earnest money back.
          </p>
          <p>
            <strong>NC Note:</strong> All contingency deadlines should fall within the due diligence period for maximum buyer protection.
          </p>
        </div>
      </div>

      {/* Contingencies List */}
      <div className="space-y-6">
        {contingencies.map((contingency, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="text-emerald-400 mr-2">
                  {getContingencyIcon(contingency.type)}
                </span>
                {getContingencyTitle(contingency.type)}
              </h3>
              
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contingency.included}
                    onChange={(e) => updateContingency(index, { included: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm text-slate-300">
                    {contingency.included ? 'Included' : 'Not Included'}
                  </span>
                </label>
                
                {contingencies.length > 1 && (
                  <button
                    onClick={() => removeContingency(index)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                    title="Remove contingency"
                  >
                    <TrashIcon className="h-4 w-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>

            {contingency.included && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel recommended>Deadline</FieldLabel>
                    <input
                      type="date"
                      value={contingency.deadline || ''}
                      onChange={(e) => updateContingency(index, { deadline: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <FieldLabel>Details</FieldLabel>
                    <input
                      type="text"
                      value={contingency.details || ''}
                      onChange={(e) => updateContingency(index, { details: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Additional details or requirements"
                    />
                  </div>
                </div>

                {/* Inspection-specific fields */}
                {contingency.type === 'inspection' && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Inspection Types</FieldLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {inspectionTypes.map((type) => (
                          <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={contingency.inspectionTypes?.includes(type.value) || false}
                              onChange={(e) => {
                                const current = contingency.inspectionTypes || [];
                                const updated = e.target.checked
                                  ? [...current, type.value]
                                  : current.filter(t => t !== type.value);
                                updateContingency(index, { inspectionTypes: updated });
                              }}
                              className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-300">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Repair Limit</FieldLabel>
                      <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          value={contingency.repairLimit || ''}
                          onChange={(e) => updateContingency(index, { repairLimit: parseInt(e.target.value) || undefined })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Maximum amount seller agrees to pay for repairs</p>
                    </div>
                  </div>
                )}

                {/* Financing-specific fields */}
                {contingency.type === 'financing' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Loan Type</FieldLabel>
                      <select
                        value={contingency.loanType || ''}
                        onChange={(e) => updateContingency(index, { loanType: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select loan type</option>
                        <option value="conventional">Conventional</option>
                        <option value="fha">FHA</option>
                        <option value="va">VA</option>
                        <option value="usda">USDA</option>
                        <option value="jumbo">Jumbo</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Interest Rate Cap</FieldLabel>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.125"
                          value={contingency.interestRate || ''}
                          onChange={(e) => updateContingency(index, { interestRate: parseFloat(e.target.value) || undefined })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 pr-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="0.000"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-400">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Maximum acceptable interest rate</p>
                    </div>
                  </div>
                )}

                {/* Sale contingency-specific fields */}
                {contingency.type === 'sale' && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel required>Property Address to be Sold</FieldLabel>
                      <input
                        type="text"
                        value={contingency.propertyAddress || ''}
                        onChange={(e) => updateContingency(index, { propertyAddress: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Address of buyer's property to be sold"
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel>Expected Sale Date</FieldLabel>
                      <input
                        type="date"
                        value={contingency.expectedSaleDate || ''}
                        onChange={(e) => updateContingency(index, { expectedSaleDate: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Contingency Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add Additional Contingencies</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { type: 'inspection' as const, label: 'Inspection', disabled: contingencies.some(c => c.type === 'inspection') },
            { type: 'financing' as const, label: 'Financing', disabled: contingencies.some(c => c.type === 'financing') },
            { type: 'appraisal' as const, label: 'Appraisal', disabled: contingencies.some(c => c.type === 'appraisal') },
            { type: 'sale' as const, label: 'Sale of Property', disabled: false },
            { type: 'other' as const, label: 'Custom', disabled: false }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => addContingency(item.type)}
              disabled={item.disabled}
              className={`
                p-3 rounded-lg border text-center transition-all duration-200
                ${item.disabled
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-500/30'
                }
              `}
            >
              <PlusIcon className={`h-4 w-4 mx-auto mb-1 ${item.disabled ? 'text-slate-500' : 'text-emerald-400'}`} />
              <div className="text-sm font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* NC Due Diligence Reminder */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-3 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Important: NC Due Diligence Period
        </h4>
        <div className="text-amber-300 text-sm space-y-2">
          <p>
            In North Carolina, the due diligence period provides buyers with an unrestricted right to terminate 
            the contract for any reason. For maximum protection:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All contingency deadlines should fall within the due diligence period</li>
            <li>The due diligence period serves as a backup protection if contingencies aren't met</li>
            <li>Consider extending the due diligence period if you need more time for contingencies</li>
          </ul>
        </div>
      </div>

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
          Continue to Additional Terms
        </Button>
      </div>
    </div>
  );
};

export default ContractContingenciesStep;