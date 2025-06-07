import React from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SocialMediaMockupProps {
  content: string;
  listingImage?: string;
  platform: 'facebook' | 'instagram' | 'twitter';
}

const FacebookMockupMini: React.FC<{ content: string; listingImage?: string }> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg p-3 text-xs shadow-sm max-w-sm">
    <div className="flex items-center mb-2">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="ml-2">
        <div className="font-semibold text-gray-900">Real Estate Agent</div>
        <div className="text-gray-500 text-xs">2 hours ago</div>
      </div>
    </div>
    <p className="text-gray-800 mb-2 line-clamp-3">{content}</p>
    {listingImage && (
      <img src={listingImage} alt="Property" className="w-full h-24 object-cover rounded mb-2" />
    )}
    <div className="flex items-center justify-between text-gray-500 pt-2 border-t">
      <div className="flex items-center space-x-4">
        <span className="flex items-center"><HeartIcon className="w-4 h-4 mr-1" /> Like</span>
        <span className="flex items-center"><ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1" /> Comment</span>
        <span className="flex items-center"><ShareIcon className="w-4 h-4 mr-1" /> Share</span>
      </div>
    </div>
  </div>
);

const InstagramMockupMini: React.FC<{ content: string; listingImage?: string }> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm max-w-sm">
    <div className="flex items-center p-3">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="ml-2">
        <div className="font-semibold text-gray-900 text-sm">realestate_agent</div>
      </div>
    </div>
    {listingImage && (
      <img src={listingImage} alt="Property" className="w-full h-32 object-cover" />
    )}
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <HeartIcon className="w-5 h-5" />
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <ShareIcon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-gray-800 text-sm line-clamp-2">{content}</p>
    </div>
  </div>
);

const TwitterMockupMini: React.FC<{ content: string; listingImage?: string }> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg p-3 shadow-sm max-w-sm">
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-1 mb-1">
          <span className="font-semibold text-gray-900 text-sm">Real Estate Agent</span>
          <span className="text-gray-500 text-xs">@realestate · 2h</span>
        </div>
        <p className="text-gray-800 text-sm mb-2 line-clamp-3">{content}</p>
        {listingImage && (
          <img src={listingImage} alt="Property" className="w-full h-24 object-cover rounded-lg mb-2" />
        )}
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs"><ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1" /> 12</span>
            <span className="flex items-center text-xs"><ShareIcon className="w-4 h-4 mr-1" /> 8</span>
            <span className="flex items-center text-xs"><HeartIcon className="w-4 h-4 mr-1" /> 25</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SocialMediaMockup: React.FC<SocialMediaMockupProps> = ({ content, listingImage, platform }) => {
  switch (platform) {
    case 'facebook':
      return <FacebookMockupMini content={content} listingImage={listingImage} />;
    case 'instagram':
      return <InstagramMockupMini content={content} listingImage={listingImage} />;
    case 'twitter':
      return <TwitterMockupMini content={content} listingImage={listingImage} />;
    default:
      return null;
  }
};

export default SocialMediaMockup; 