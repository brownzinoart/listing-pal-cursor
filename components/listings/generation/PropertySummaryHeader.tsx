
import React from 'react';
import { Listing } from '../../../types';
import { BuildingOffice2Icon } from '@heroicons/react/24/solid'; 

interface PropertySummaryHeaderProps {
  listing: Listing | null;
}

const PropertySummaryHeader: React.FC<PropertySummaryHeaderProps> = ({ listing }) => {
  if (!listing) {
    return null; 
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const propertyType = listing.propertyType || 'Property'; 

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="bg-blue-600 text-white p-3 rounded-xl mr-4 hidden sm:flex items-center justify-center w-16 h-16 flex-shrink-0">
           <BuildingOffice2Icon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{listing.address.split(',')[0]}</h2>
          <p className="text-sm text-slate-400">
            {listing.propertyType || 'Residential'} • {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''} • {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''} • {listing.squareFootage.toLocaleString()} sq ft
          </p>
        </div>
      </div>
      <div className="text-emerald-400 text-2xl sm:text-3xl font-bold mt-2 sm:mt-0 whitespace-nowrap">
        {formatPrice(listing.price)}
      </div>
    </div>
  );
};

export default PropertySummaryHeader;