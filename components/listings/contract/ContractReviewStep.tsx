import React, { useState, useEffect } from 'react';
import { Contract, Listing } from '../../../types';
import { ContractGenerationService } from '../../../services/contractGenerationService';
import { ContractPDFService } from '../../../services/contractPDFService';
import Button from '../../shared/Button';
import { 
  DocumentCheckIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ContractReviewStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onJumpToStep: (stepId: string) => void;
}

const ContractReviewStep: React.FC<ContractReviewStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious,
  onJumpToStep
}) => {
  const [generatedContract, setGeneratedContract] = useState<Contract | null>(null);
  const [contractPreview, setContractPreview] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Validate contract on load
  useEffect(() => {
    const validation = ContractGenerationService.validateContract(contractData);
    setValidationResult(validation);
  }, [contractData]);

  const handleGenerateContract = async () => {
    setIsGenerating(true);
    try {
      const finalContract = await ContractGenerationService.generateContract(contractData);
      setGeneratedContract(finalContract);
      
      // Generate preview text
      const template = { id: 'nc-purchase-2024', name: 'North Carolina Offer to Purchase and Contract' } as any;
      const preview = ContractGenerationService.formatContractForDisplay(finalContract, template);
      setContractPreview(preview);
      
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating contract:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await ContractPDFService.generateContractPDF(contractData, listing);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getSectionSummary = (sectionTitle: string, data: any, fields: { label: string; value: any }[]) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-semibold">{sectionTitle}</h4>
        <button
          onClick={() => onJumpToStep(sectionTitle.toLowerCase().replace(' ', ''))}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="Edit this section"
        >
          <PencilIcon className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-slate-400">{field.label}:</span>
            <span className="text-white">{field.value || 'Not specified'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Validation Status */}
      <div className={`rounded-xl p-4 ${validationResult.isValid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <div className="flex items-start space-x-3">
          {validationResult.isValid ? (
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0" />
          )}
          <div>
            <h3 className={`font-semibold ${validationResult.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
              {validationResult.isValid ? 'Contract Ready for Generation' : 'Contract Issues Found'}
            </h3>
            {validationResult.isValid ? (
              <p className="text-emerald-300 text-sm mt-1">All required information has been provided. You can generate your North Carolina purchase contract.</p>
            ) : (
              <div className="mt-2">
                <p className="text-red-300 text-sm mb-2">Please address the following issues before generating:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-red-300 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Summary */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <DocumentCheckIcon className="h-6 w-6 mr-2 text-emerald-400" />
          Contract Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          {getSectionSummary('Basic Information', contractData, [
            { label: 'State', value: contractData.state },
            { label: 'Contract Type', value: contractData.contractType },
            { label: 'Property Address', value: listing.address }
          ])}

          {/* Parties */}
          {getSectionSummary('Parties', contractData, [
            { label: 'Buyers', value: contractData.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') },
            { label: 'Sellers', value: contractData.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') },
            { label: 'Buyer Attorney', value: contractData.buyerAttorney ? `${contractData.buyerAttorney.firstName} ${contractData.buyerAttorney.lastName}` : 'None specified' }
          ])}

          {/* Financial Terms */}
          {getSectionSummary('Financial Terms', contractData.financials, [
            { label: 'Purchase Price', value: contractData.financials?.purchasePrice ? formatCurrency(contractData.financials.purchasePrice) : 'Not set' },
            { label: 'Earnest Money', value: contractData.financials?.earnestMoneyDeposit ? formatCurrency(contractData.financials.earnestMoneyDeposit) : 'Not set' },
            { label: 'Financing Type', value: contractData.financials?.financingType },
            { label: 'Down Payment', value: contractData.financials?.downPaymentAmount ? formatCurrency(contractData.financials.downPaymentAmount) : 'Not specified' }
          ])}

          {/* Important Dates */}
          {getSectionSummary('Important Dates', contractData.dates, [
            { label: 'Offer Date', value: formatDate(contractData.dates?.offerDate || '') },
            { label: 'Due Diligence Deadline', value: formatDate(contractData.dates?.dueDiligenceDeadline || '') },
            { label: 'Closing Date', value: formatDate(contractData.dates?.closingDate || '') },
            { label: 'Possession Date', value: formatDate(contractData.dates?.possessionDate || '') }
          ])}
        </div>
      </div>

      {/* North Carolina Specific Summary */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-4">North Carolina Contract Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-300">Due Diligence Period:</span>
              <span className="text-white">
                {contractData.dates?.dueDiligenceDeadline 
                  ? `${Math.ceil((new Date(contractData.dates.dueDiligenceDeadline).getTime() - new Date(contractData.dates.offerDate || '').getTime()) / (1000 * 60 * 60 * 24))} days`
                  : 'Not set'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-300">Attorney Required:</span>
              <span className="text-white">Yes (NC Law)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-300">Buyer Attorney:</span>
              <span className="text-white">
                {contractData.buyerAttorney ? '✓ Specified' : '⚠️ Recommended'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-300">Standard Disclosures:</span>
              <span className="text-white">✓ Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Generation */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Generate Contract</h4>
        
        {!showPreview ? (
          <div className="text-center space-y-4">
            <p className="text-slate-300">
              Ready to generate your North Carolina Offer to Purchase and Contract. 
              This will create a legally formatted document based on the information you've provided.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="gradient"
                onClick={handleGenerateContract}
                disabled={!validationResult.isValid || isGenerating}
                leftIcon={<DocumentCheckIcon className="h-5 w-5" />}
                size="lg"
              >
                {isGenerating ? 'Generating Contract...' : 'Generate Preview'}
              </Button>
              
              <Button
                variant="glass"
                onClick={handleDownloadPDF}
                disabled={!validationResult.isValid || isGeneratingPDF}
                leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
                size="lg"
                glowColor="emerald"
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-white font-medium">Contract Generated Successfully</h5>
              <div className="flex gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  leftIcon={<EyeIcon className="h-4 w-4" />}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                >
                  {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </div>
            
            {showPreview && (
              <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                  {contractPreview}
                </pre>
              </div>
            )}
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <p className="text-emerald-300 text-sm">
                <strong>Next Steps:</strong> Review the generated contract carefully. This document should be reviewed by your attorney before presentation to ensure it meets all legal requirements and your specific needs.
              </p>
            </div>
          </div>
        )}
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
          onClick={() => window.location.href = `/listings/${listing.id}`}
          disabled={!generatedContract}
        >
          Complete & Return to Listing
        </Button>
      </div>
    </div>
  );
};

export default ContractReviewStep;