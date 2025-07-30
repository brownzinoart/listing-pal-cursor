import React, { useState, useEffect } from 'react';
import { Contract, ContractFinancials, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  CurrencyDollarIcon,
  HomeIcon,
  BanknotesIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ContractFinancialStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractFinancialStep: React.FC<ContractFinancialStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [financials, setFinancials] = useState<ContractFinancials>(
    contractData.financials || {
      purchasePrice: listing.price,
      earnestMoneyDeposit: 0,
      closingCostsPaidBy: 'split',
      financingType: 'conventional'
    }
  );

  // Calculate suggested earnest money (1% of purchase price, min $1000)
  const suggestedEarnestMoney = Math.max(Math.round(financials.purchasePrice * 0.01), 1000);

  // Calculate loan amount if financing
  const calculateLoanAmount = () => {
    if (financials.financingType === 'cash') return 0;
    if (financials.downPaymentAmount) {
      return financials.purchasePrice - financials.downPaymentAmount;
    }
    if (financials.downPaymentPercentage) {
      return financials.purchasePrice - (financials.purchasePrice * (financials.downPaymentPercentage / 100));
    }
    return financials.purchasePrice * 0.8; // Default 20% down
  };

  // Update contract data whenever financials change
  useEffect(() => {
    const updatedFinancials = {
      ...financials,
      loanAmount: calculateLoanAmount()
    };
    setFinancials(updatedFinancials);
    onUpdate({ financials: updatedFinancials });
  }, [financials.purchasePrice, financials.downPaymentAmount, financials.downPaymentPercentage, financials.financingType]);

  const updateFinancial = (field: keyof ContractFinancials, value: any) => {
    const updatedFinancials = { ...financials, [field]: value };
    setFinancials(updatedFinancials);
    onUpdate({ financials: updatedFinancials });
  };

  const handleDownPaymentAmountChange = (amount: number) => {
    const percentage = amount > 0 ? (amount / financials.purchasePrice) * 100 : 0;
    setFinancials(prev => ({
      ...prev,
      downPaymentAmount: amount,
      downPaymentPercentage: Math.round(percentage * 100) / 100
    }));
  };

  const handleDownPaymentPercentageChange = (percentage: number) => {
    const amount = (financials.purchasePrice * percentage) / 100;
    setFinancials(prev => ({
      ...prev,
      downPaymentAmount: Math.round(amount),
      downPaymentPercentage: percentage
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Purchase Price Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <HomeIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Purchase Price
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Purchase Price *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                value={financials.purchasePrice}
                onChange={(e) => updateFinancial('purchasePrice', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">List price: {formatCurrency(listing.price)}</p>
          </div>
          
          <div className="flex items-end">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 w-full">
              <p className="text-emerald-400 text-sm font-medium">Final Purchase Price</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(financials.purchasePrice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnest Money Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BanknotesIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Earnest Money Deposit
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deposit Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                value={financials.earnestMoneyDeposit}
                onChange={(e) => updateFinancial('earnestMoneyDeposit', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
                required
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Suggested: {formatCurrency(suggestedEarnestMoney)}</span>
              <button
                onClick={() => updateFinancial('earnestMoneyDeposit', suggestedEarnestMoney)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Use suggested
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Escrow Agent/Holder
            </label>
            <input
              type="text"
              value={financials.earnestMoneyHolder || ''}
              onChange={(e) => updateFinancial('earnestMoneyHolder', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., ABC Title Company"
            />
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm">
                <strong>NC Practice:</strong> Earnest money is typically 1-2% of the purchase price and held by the listing agent's brokerage or a title company.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalculatorIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Financing Terms
        </h3>
        
        <div className="space-y-6">
          {/* Financing Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Financing Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'cash', label: 'Cash', desc: 'No financing needed' },
                { value: 'conventional', label: 'Conventional', desc: 'Traditional mortgage' },
                { value: 'fha', label: 'FHA', desc: '3.5% down minimum' },
                { value: 'va', label: 'VA', desc: 'Veterans loan' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFinancial('financingType', type.value)}
                  className={`
                    p-4 rounded-lg border text-left transition-all duration-200
                    ${financials.financingType === type.value
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-xs text-slate-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Down Payment - Only show if not cash */}
          {financials.financingType !== 'cash' && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Down Payment</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={financials.downPaymentAmount || ''}
                      onChange={(e) => handleDownPaymentAmountChange(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={financials.downPaymentPercentage || ''}
                      onChange={(e) => handleDownPaymentPercentageChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 pr-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span className="font-semibold">{formatCurrency(calculateLoanAmount())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Closing Costs Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Closing Costs & Additional Terms
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Closing Costs Paid By</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'buyer', label: 'Buyer Pays All' },
                { value: 'seller', label: 'Seller Pays All' },
                { value: 'split', label: 'Split/Standard' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFinancial('closingCostsPaidBy', option.value)}
                  className={`
                    p-3 rounded-lg border text-center transition-all duration-200
                    ${financials.closingCostsPaidBy === option.value
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Seller Contribution (Optional)
            </label>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                value={financials.sellerContribution || ''}
                onChange={(e) => updateFinancial('sellerContribution', parseInt(e.target.value) || undefined)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Amount seller contributes toward buyer's closing costs</p>
          </div>

          {/* Home Warranty */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Home Warranty</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={financials.homeWarranty?.included || false}
                  onChange={(e) => updateFinancial('homeWarranty', {
                    ...financials.homeWarranty,
                    included: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {financials.homeWarranty?.included && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cost</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={financials.homeWarranty?.cost || ''}
                      onChange={(e) => updateFinancial('homeWarranty', {
                        ...financials.homeWarranty,
                        cost: parseInt(e.target.value) || undefined
                      })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Paid By</label>
                  <select
                    value={financials.homeWarranty?.paidBy || 'seller'}
                    onChange={(e) => updateFinancial('homeWarranty', {
                      ...financials.homeWarranty,
                      paidBy: e.target.value as 'buyer' | 'seller'
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                  </select>
                </div>
              </div>
            )}
          </div>
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
          Continue to Dates
        </Button>
      </div>
    </div>
  );
};

export default ContractFinancialStep;