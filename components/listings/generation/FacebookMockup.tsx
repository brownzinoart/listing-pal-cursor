
import React from 'react';
import { BuildingOffice2Icon, HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { APP_NAME } from '../../../constants';

interface FacebookMockupProps {
  listingImage?: string | null;
  postText: string;
}

const FacebookMockup: React.FC<FacebookMockupProps> = ({ listingImage, postText }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-brand-card border border-brand-border rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="bg-brand-primary h-10 w-10 rounded-full flex items-center justify-center mr-3">
          <BuildingOffice2Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-brand-text-primary">{APP_NAME} Realty</p>
          <p className="text-xs text-brand-text-tertiary">Sponsored · Just now</p>
        </div>
      </div>

      {/* Post Text */}
      {postText && (
        <p className="text-sm text-brand-text-secondary mb-3 whitespace-pre-line break-words">
          {postText.length > 200 ? `${postText.substring(0, 200)}...` : postText}
        </p>
      )}

      {/* Image */}
      {listingImage && (
        <div className="rounded-md overflow-hidden mb-3 border border-brand-border aspect-video">
          <img src={listingImage} alt="Listing" className="w-full h-full object-cover" />
        </div>
      )}
      {!listingImage && (
         <div className="rounded-md overflow-hidden mb-3 border border-brand-border aspect-video bg-brand-panel flex items-center justify-center">
            <BuildingOffice2Icon className="h-16 w-16 text-brand-text-tertiary opacity-50"/>
         </div>
      )}


      {/* Engagement Stats (Placeholder) */}
      <div className="flex justify-between items-center text-xs text-brand-text-tertiary mb-2 border-b border-brand-border pb-2">
        <span>1.2K Likes</span>
        <span>34 Comments · 15 Shares</span>
      </div>

      {/* Action Buttons (Placeholder) */}
      <div className="grid grid-cols-3 gap-1 text-sm font-medium text-brand-text-secondary">
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-brand-panel transition-colors">
          <HandThumbUpIcon className="h-5 w-5 mr-1.5" /> Like
        </button>
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-brand-panel transition-colors">
          <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" /> Comment
        </button>
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-brand-panel transition-colors">
          <ShareIcon className="h-5 w-5 mr-1.5" /> Share
        </button>
      </div>
    </div>
  );
};

export default FacebookMockup;
