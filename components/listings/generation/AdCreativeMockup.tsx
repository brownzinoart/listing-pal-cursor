import React from 'react';
import { BriefcaseIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { Listing } from '../../../types';
import { FaFacebook, FaLinkedin, FaGoogle } from 'react-icons/fa';

type AdPlatform = 'facebook' | 'linkedin' | 'google';

interface AdCreativeMockupProps {
  listing: Listing;
  headline: string;
  body: string;
  cta: string;
  platform: AdPlatform;
}

// Social Media Post Mockup (for Facebook & LinkedIn)
const SocialPostMockup: React.FC<Omit<AdCreativeMockupProps, 'platform'> & { platform: 'facebook' | 'linkedin' }> = ({
  listing,
  headline,
  body,
  cta,
  platform,
}) => {
  const primaryImage = listing.images && listing.images.length > 0 ? listing.images[0].url : `https://via.placeholder.com/600x400?text=${encodeURIComponent(listing.address.split(',')[0])}`;
  
  const platformConfig = {
    facebook: {
      icon: <FaFacebook className="h-6 w-6 text-white" />,
      iconBg: 'bg-blue-600',
      actionText: 'Sponsored',
      profileName: 'Your Real Estate Page',
    },
    linkedin: {
      icon: <FaLinkedin className="h-5 w-5 text-white" />,
      iconBg: 'bg-sky-700',
      actionText: 'Promoted',
      profileName: 'Your Professional Profile',
    },
  };

  const config = platformConfig[platform];

  return (
    <div className="w-full max-w-sm mx-auto bg-brand-card border border-brand-border rounded-lg shadow-lg p-0 font-sans">
      <div className="p-3">
        <div className="flex items-center mb-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <p className="font-bold text-sm text-brand-text-primary">{config.profileName}</p>
            <p className="text-xs text-brand-text-tertiary">{config.actionText}</p>
          </div>
        </div>
        <p className="text-sm text-brand-text-secondary mb-3 whitespace-pre-line break-words">
          {body || "Your engaging ad copy will appear here. It should be compelling enough to make users stop scrolling!"}
        </p>
      </div>
      <div className="bg-brand-panel border-t border-b border-brand-border cursor-pointer">
        <img src={primaryImage} alt="Listing" className="w-full h-48 object-cover" />
        <div className="p-3">
          <p className="text-xs text-brand-text-tertiary uppercase">yourwebsite.com</p>
          <h4 className="font-semibold text-brand-text-primary truncate">{headline || 'Your Catchy Headline Here'}</h4>
        </div>
      </div>
      <div className="p-2">
        <button className="w-full bg-brand-primary/10 border border-brand-primary/50 text-brand-primary font-bold py-2 px-4 rounded-md text-sm text-center cursor-not-allowed">
          {cta || 'Call to Action'}
        </button>
      </div>
    </div>
  );
};

// Google Ad Mockup
const GoogleAdMockup: React.FC<Omit<AdCreativeMockupProps, 'platform'>> = ({ headline, body, cta, listing }) => {
    return (
        <div className="w-full max-w-sm mx-auto bg-brand-card border border-brand-border rounded-lg shadow-lg p-4 font-sans">
            <div className="flex items-center mb-2">
                <div className="w-7 h-7 flex items-center justify-center bg-green-600 rounded-full mr-2 shrink-0">
                    <GlobeAltIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-semibold text-sm text-brand-text-primary">yourwebsite.com</p>
                    <p className="text-xs text-brand-text-tertiary">Ad · https://www.yourwebsite.com/listings/{listing.id || '123'}</p>
                </div>
            </div>
            <h3 className="text-xl text-blue-400 hover:underline cursor-pointer mb-2 font-medium">
              {headline || 'Real Estate in Your Area'}
            </h3>
            <p className="text-sm text-brand-text-secondary">
              {body || 'Find your dream home with us. We have a wide range of properties available for you.'}
            </p>
        </div>
    );
};


const AdCreativeMockup: React.FC<AdCreativeMockupProps> = (props) => {
  switch (props.platform) {
    case 'facebook':
      return <SocialPostMockup {...props} platform="facebook" />;
    case 'linkedin':
      return <SocialPostMockup {...props} platform="linkedin" />;
    case 'google':
        return <GoogleAdMockup {...props} />;
    default:
      return <SocialPostMockup {...props} platform="facebook" />;
  }
};

export default AdCreativeMockup; 