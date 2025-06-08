import React from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { Listing } from '../../../types';
import Button from '../../shared/Button';

interface AdCreativeMockupProps {
  listing: Listing;
  headline: string;
  body: string;
  cta: string;
}

const AdCreativeMockup: React.FC<AdCreativeMockupProps> = ({ listing, headline, body, cta }) => {
  const primaryImage = listing.images && listing.images.length > 0 ? listing.images[0].url : null;

  return (
    <div className="w-full max-w-md mx-auto bg-brand-card border border-brand-border rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center mr-3">
          <MegaphoneIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-brand-text-primary">Sponsored Ad</p>
          <p className="text-xs text-brand-text-tertiary">{listing.address.split(',')[1]?.trim() || 'Local Area'}</p>
        </div>
      </div>

      {/* Body Text */}
      {body && (
        <p className="text-sm text-brand-text-secondary mb-3 whitespace-pre-line break-words">
          {body}
        </p>
      )}

      {/* Image and Headline */}
      <div className="rounded-md overflow-hidden border border-brand-border">
        {primaryImage && (
            <img src={primaryImage} alt="Listing" className="w-full h-48 object-cover" />
        )}
        <div className="bg-brand-panel p-3">
            <p className="text-xs text-brand-text-tertiary uppercase">YourWebsite.com</p>
            <h4 className="font-semibold text-brand-text-primary truncate">{headline}</h4>
        </div>
      </div>
      
      {/* Call to Action Button */}
      {cta && (
          <div className="mt-3">
              <Button variant="primary" size="md" className="w-full" disabled={true}>
                  {cta}
              </Button>
          </div>
      )}
    </div>
  );
};

export default AdCreativeMockup; 