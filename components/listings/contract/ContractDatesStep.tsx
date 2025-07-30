import React, { useState, useEffect } from 'react';
import { Contract, ContractDates, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ContractDatesStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractDatesStep: React.FC<ContractDatesStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [dates, setDates] = useState<ContractDates>(
    contractData.dates || {
      offerDate: new Date().toISOString().split('T')[0],
      offerExpirationDate: '',
      dueDiligenceDeadline: '',
      closingDate: '',
      possessionDate: '',
      possessionTime: '6:00 PM',
      inspectionDeadline: '',
      financingDeadline: '',
      appraisalDeadline: ''
    }
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate suggested dates based on offer date
  const calculateSuggestedDates = (offerDate: string) => {
    if (!offerDate) return {};
    
    const offer = new Date(offerDate);
    
    return {
      offerExpirationDate: new Date(offer.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
      dueDiligenceDeadline: new Date(offer.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days (NC standard)
      closingDate: new Date(offer.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days
      possessionDate: new Date(offer.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Same as closing
      inspectionDeadline: new Date(offer.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days
      financingDeadline: new Date(offer.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Same as due diligence
      appraisalDeadline: new Date(offer.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Same as due diligence
    };
  };

  // Initialize suggested dates when component mounts
  useEffect(() => {
    if (dates.offerDate && (!dates.offerExpirationDate || !dates.dueDiligenceDeadline || !dates.closingDate)) {
      const suggested = calculateSuggestedDates(dates.offerDate);
      setDates(prev => ({
        ...prev,
        offerExpirationDate: prev.offerExpirationDate || suggested.offerExpirationDate,
        dueDiligenceDeadline: prev.dueDiligenceDeadline || suggested.dueDiligenceDeadline,
        closingDate: prev.closingDate || suggested.closingDate,
        possessionDate: prev.possessionDate || suggested.possessionDate,
        inspectionDeadline: prev.inspectionDeadline || suggested.inspectionDeadline,
        financingDeadline: prev.financingDeadline || suggested.financingDeadline,
        appraisalDeadline: prev.appraisalDeadline || suggested.appraisalDeadline
      }));
    }
  }, []);

  // Update contract data whenever dates change
  useEffect(() => {
    onUpdate({ dates });
  }, [dates]);

  // Validate dates
  useEffect(() => {
    const errors: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    if (dates.offerDate && dates.offerDate < today) {
      errors.push('Offer date cannot be in the past');
    }
    
    if (dates.offerExpirationDate && dates.offerExpirationDate <= dates.offerDate) {
      errors.push('Offer expiration must be after offer date');
    }
    
    if (dates.dueDiligenceDeadline && dates.dueDiligenceDeadline <= dates.offerDate) {
      errors.push('Due diligence deadline must be after offer date');
    }
    
    if (dates.closingDate && dates.dueDiligenceDeadline && dates.closingDate <= dates.dueDiligenceDeadline) {
      errors.push('Closing date must be after due diligence deadline');
    }
    
    if (dates.possessionDate && dates.closingDate && dates.possessionDate < dates.closingDate) {
      errors.push('Possession date cannot be before closing date');
    }
    
    setValidationErrors(errors);
  }, [dates]);

  const updateDate = (field: keyof ContractDates, value: string) => {
    setDates(prev => ({ ...prev, [field]: value }));
  };

  const applySuggested = (field: keyof ContractDates) => {
    if (dates.offerDate) {
      const suggested = calculateSuggestedDates(dates.offerDate);
      if (suggested[field]) {
        updateDate(field, suggested[field]);
      }
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateDifference = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return '';
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const FieldLabel: React.FC<{ 
    children: React.ReactNode; 
    required?: boolean; 
    recommended?: boolean;
    ncSpecific?: boolean;
  }> = ({ children, required, recommended, ncSpecific }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
      {children}
      {required && <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded-full">Required</span>}
      {recommended && <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">Recommended</span>}
      {ncSpecific && <span className="text-amber-400 text-xs bg-amber-500/20 px-2 py-1 rounded-full">NC Required</span>}
    </label>
  );

  return (
    <div className="space-y-8">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-semibold mb-2">Date Issues Found:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-300 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Critical Dates Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Critical Contract Dates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offer Date */}
          <div>
            <FieldLabel required>Offer Date</FieldLabel>
            <input
              type="date"
              value={dates.offerDate}
              onChange={(e) => updateDate('offerDate', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <p className="text-xs text-slate-400 mt-1">The date this offer is made</p>
          </div>

          {/* Offer Expiration */}
          <div>
            <FieldLabel required>Offer Expiration</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={dates.offerExpirationDate}
                onChange={(e) => updateDate('offerExpirationDate', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => applySuggested('offerExpirationDate')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Use 2 days
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {dates.offerExpirationDate && `${formatDateForDisplay(dates.offerExpirationDate)} (${getDateDifference(dates.offerDate, dates.offerExpirationDate)})`}
            </p>
          </div>

          {/* Due Diligence Deadline - NC Specific */}
          <div className="md:col-span-2">
            <FieldLabel ncSpecific>Due Diligence Deadline</FieldLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={dates.dueDiligenceDeadline}
                  onChange={(e) => updateDate('dueDiligenceDeadline', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => applySuggested('dueDiligenceDeadline')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Use 21 days
                </button>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-sm font-medium">NC Due Diligence Period</p>
                <p className="text-amber-300 text-xs mt-1">
                  {dates.dueDiligenceDeadline 
                    ? `${getDateDifference(dates.offerDate, dates.dueDiligenceDeadline)} for buyer to terminate for any reason`
                    : 'Buyer can terminate for any reason during this period'
                  }
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {dates.dueDiligenceDeadline && `Ends: ${formatDateForDisplay(dates.dueDiligenceDeadline)} at 5:00 PM`}
            </p>
          </div>

          {/* Closing Date */}
          <div>
            <FieldLabel required>Closing Date</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={dates.closingDate}
                onChange={(e) => updateDate('closingDate', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => applySuggested('closingDate')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Use 45 days
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {dates.closingDate && `${formatDateForDisplay(dates.closingDate)} (${getDateDifference(dates.offerDate, dates.closingDate)})`}
            </p>
          </div>

          {/* Possession Date & Time */}
          <div>
            <FieldLabel>Possession</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dates.possessionDate || dates.closingDate}
                onChange={(e) => updateDate('possessionDate', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={dates.possessionTime}
                onChange={(e) => updateDate('possessionTime', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="6:00 PM">6:00 PM</option>
                <option value="12:00 PM">12:00 PM (Noon)</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="At Closing">At Closing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1">When buyer receives keys and possession</p>
          </div>
        </div>
      </div>

      {/* Contingency Deadlines Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Contingency Deadlines
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inspection Deadline */}
          <div>
            <FieldLabel recommended>Inspection Deadline</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={dates.inspectionDeadline || ''}
                onChange={(e) => updateDate('inspectionDeadline', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => applySuggested('inspectionDeadline')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Use 10 days
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Professional inspections must be completed</p>
          </div>

          {/* Financing Deadline */}
          <div>
            <FieldLabel recommended>Financing Deadline</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={dates.financingDeadline || ''}
                onChange={(e) => updateDate('financingDeadline', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => applySuggested('financingDeadline')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Use DD date
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Loan approval must be obtained</p>
          </div>

          {/* Appraisal Deadline */}
          <div>
            <FieldLabel recommended>Appraisal Deadline</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={dates.appraisalDeadline || ''}
                onChange={(e) => updateDate('appraisalDeadline', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => applySuggested('appraisalDeadline')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                Use DD date
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Property appraisal must be completed</p>
          </div>
        </div>
      </div>

      {/* NC Due Diligence Explanation */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          Understanding North Carolina's Due Diligence Period
        </h4>
        <div className="space-y-3 text-sm text-amber-300">
          <p>
            <strong>Unique to NC:</strong> During the due diligence period, the buyer has an unrestricted right to terminate the contract for any reason or no reason at all.
          </p>
          <p>
            <strong>Timeline:</strong> Typically 21-30 days, giving buyers time to conduct inspections, secure financing, and review all aspects of the property.
          </p>
          <p>
            <strong>Key Point:</strong> All other contingency deadlines should fall within or align with the due diligence deadline for maximum buyer protection.
          </p>
        </div>
      </div>

      {/* Timeline Visualization */}
      {dates.offerDate && dates.dueDiligenceDeadline && dates.closingDate && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">Contract Timeline</h4>
          <div className="relative">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-white font-medium">Offer</p>
                <p className="text-xs text-slate-400">{formatDateForDisplay(dates.offerDate)}</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-amber-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-white font-medium">Due Diligence Ends</p>
                <p className="text-xs text-slate-400">{formatDateForDisplay(dates.dueDiligenceDeadline)}</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-white font-medium">Closing</p>
                <p className="text-xs text-slate-400">{formatDateForDisplay(dates.closingDate)}</p>
              </div>
            </div>
            <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-blue-400 opacity-50"></div>
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
          disabled={validationErrors.length > 0 || !dates.offerDate || !dates.dueDiligenceDeadline || !dates.closingDate}
          rightIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Continue to Property Details
        </Button>
      </div>
    </div>
  );
};

export default ContractDatesStep;