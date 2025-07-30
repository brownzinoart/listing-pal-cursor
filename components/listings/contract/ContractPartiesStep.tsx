import React, { useState, useEffect } from 'react';
import { Contract, ContractParty, Listing } from '../../../types';
import Button from '../../shared/Button';
import { 
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  ScaleIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ContractPartiesStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractPartiesStep: React.FC<ContractPartiesStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [buyers, setBuyers] = useState<ContractParty[]>(contractData.buyers || []);
  const [sellers, setSellers] = useState<ContractParty[]>(contractData.sellers || []);
  const [listingAgent, setListingAgent] = useState<ContractParty | undefined>(contractData.listingAgent);
  const [sellingAgent, setSellingAgent] = useState<ContractParty | undefined>(contractData.sellingAgent);
  const [buyerAttorney, setBuyerAttorney] = useState<ContractParty | undefined>(contractData.buyerAttorney);
  const [sellerAttorney, setSellerAttorney] = useState<ContractParty | undefined>(contractData.sellerAttorney);

  // Initialize with at least one buyer if none exist
  useEffect(() => {
    if (buyers.length === 0) {
      const initialBuyer: ContractParty = {
        id: `buyer_${Date.now()}`,
        type: 'buyer',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: 'NC',
        zipCode: ''
      };
      setBuyers([initialBuyer]);
    }

    // Initialize seller from listing if available
    if (sellers.length === 0) {
      const initialSeller: ContractParty = {
        id: `seller_${Date.now()}`,
        type: 'seller',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: listing.address,
        city: listing.city || '',
        state: listing.state || 'NC',
        zipCode: listing.zipCode || ''
      };
      setSellers([initialSeller]);
    }
  }, []);

  // Update contract data whenever parties change
  useEffect(() => {
    onUpdate({
      buyers,
      sellers,
      listingAgent,
      sellingAgent,
      buyerAttorney,
      sellerAttorney
    });
  }, [buyers, sellers, listingAgent, sellingAgent, buyerAttorney, sellerAttorney]);

  const addBuyer = () => {
    const newBuyer: ContractParty = {
      id: `buyer_${Date.now()}`,
      type: 'buyer',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'NC',
      zipCode: ''
    };
    setBuyers([...buyers, newBuyer]);
  };

  const removeBuyer = (index: number) => {
    if (buyers.length > 1) {
      setBuyers(buyers.filter((_, i) => i !== index));
    }
  };

  const updateBuyer = (index: number, field: keyof ContractParty, value: string) => {
    const updatedBuyers = buyers.map((buyer, i) => 
      i === index ? { ...buyer, [field]: value } : buyer
    );
    setBuyers(updatedBuyers);
  };

  const addSeller = () => {
    const newSeller: ContractParty = {
      id: `seller_${Date.now()}`,
      type: 'seller',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: listing.address,
      city: listing.city || '',
      state: listing.state || 'NC',
      zipCode: listing.zipCode || ''
    };
    setSellers([...sellers, newSeller]);
  };

  const removeSeller = (index: number) => {
    if (sellers.length > 1) {
      setSellers(sellers.filter((_, i) => i !== index));
    }
  };

  const updateSeller = (index: number, field: keyof ContractParty, value: string) => {
    const updatedSellers = sellers.map((seller, i) => 
      i === index ? { ...seller, [field]: value } : seller
    );
    setSellers(updatedSellers);
  };

  const renderPersonForm = (
    person: ContractParty, 
    index: number, 
    updateFn: (index: number, field: keyof ContractParty, value: string) => void,
    canRemove: boolean,
    removeFn?: (index: number) => void
  ) => (
    <div key={person.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold capitalize">{person.type} {index + 1}</h4>
        {canRemove && removeFn && (
          <button
            onClick={() => removeFn(index)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
            title="Remove"
          >
            <TrashIcon className="h-4 w-4 text-red-400" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
          <input
            type="text"
            value={person.firstName}
            onChange={(e) => updateFn(index, 'firstName', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter first name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
          <input
            type="text"
            value={person.lastName}
            onChange={(e) => updateFn(index, 'lastName', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter last name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            value={person.email || ''}
            onChange={(e) => updateFn(index, 'email', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
          <input
            type="tel"
            value={person.phone || ''}
            onChange={(e) => updateFn(index, 'phone', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
          <input
            type="text"
            value={person.address || ''}
            onChange={(e) => updateFn(index, 'address', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Street address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
          <input
            type="text"
            value={person.city || ''}
            onChange={(e) => updateFn(index, 'city', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="City"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
            <select
              value={person.state || 'NC'}
              onChange={(e) => updateFn(index, 'state', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="NC">NC</option>
              <option value="SC">SC</option>
              <option value="VA">VA</option>
              <option value="GA">GA</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ZIP</label>
            <input
              type="text"
              value={person.zipCode || ''}
              onChange={(e) => updateFn(index, 'zipCode', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="12345"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Buyers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-emerald-400" />
            Buyers
          </h3>
          <Button
            variant="glass"
            size="sm"
            onClick={addBuyer}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Buyer
          </Button>
        </div>
        
        <div className="space-y-4">
          {buyers.map((buyer, index) => 
            renderPersonForm(buyer, index, updateBuyer, buyers.length > 1, removeBuyer)
          )}
        </div>
      </div>

      {/* Sellers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-emerald-400" />
            Sellers
          </h3>
          <Button
            variant="glass"
            size="sm"
            onClick={addSeller}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Seller
          </Button>
        </div>
        
        <div className="space-y-4">
          {sellers.map((seller, index) => 
            renderPersonForm(seller, index, updateSeller, sellers.length > 1, removeSeller)
          )}
        </div>
      </div>

      {/* NC Attorney Requirement Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-2 flex items-center">
          <ScaleIcon className="h-5 w-5 mr-2" />
          North Carolina Attorney Requirement
        </h4>
        <p className="text-amber-300 text-sm mb-4">
          North Carolina law requires that an attorney licensed in North Carolina must oversee the closing of all real estate transactions. While not required at contract signing, having attorney information helps ensure a smooth closing process.
        </p>
        
        {/* Buyer Attorney */}
        <div className="mb-4">
          <h5 className="text-white font-medium mb-2">Buyer's Attorney (Recommended)</h5>
          {!buyerAttorney ? (
            <Button
              variant="glass"
              size="sm"
              onClick={() => setBuyerAttorney({
                id: `buyer_attorney_${Date.now()}`,
                type: 'attorney',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                barNumber: '',
                firm: ''
              })}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Buyer's Attorney
            </Button>
          ) : (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-white font-medium">Buyer's Attorney</h6>
                <button
                  onClick={() => setBuyerAttorney(undefined)}
                  className="p-1 rounded text-slate-400 hover:text-red-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={buyerAttorney.firstName}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, firstName: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={buyerAttorney.lastName}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, lastName: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Law Firm</label>
                  <input
                    type="text"
                    value={buyerAttorney.firm || ''}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, firm: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bar Number</label>
                  <input
                    type="text"
                    value={buyerAttorney.barNumber || ''}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, barNumber: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={buyerAttorney.email || ''}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, email: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={buyerAttorney.phone || ''}
                    onChange={(e) => setBuyerAttorney({...buyerAttorney, phone: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
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
          Continue to Financial Terms
        </Button>
      </div>
    </div>
  );
};

export default ContractPartiesStep;