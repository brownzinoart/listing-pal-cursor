import React from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface SocialMediaMockupProps {
  content: string;
  listingImage?: string;
  platform: "facebook" | "instagram" | "twitter";
}

const FacebookMockupMini: React.FC<{
  content: string;
  listingImage?: string;
}> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg p-3 text-xs shadow-sm w-full max-w-sm mx-auto overflow-hidden">
    <div className="flex items-center mb-2 overflow-hidden">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="ml-2 min-w-0 flex-1">
        <div className="font-semibold text-gray-900 break-words">
          Real Estate Agent
        </div>
        <div className="text-gray-500 text-xs">2 hours ago</div>
      </div>
    </div>
    <p
      className="text-gray-800 mb-2 break-words"
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {content}
    </p>
    {listingImage && (
      <div className="mb-2 overflow-hidden rounded">
        <img
          src={listingImage}
          alt="Property"
          className="w-full aspect-[4/3] object-cover"
        />
      </div>
    )}
    <div className="flex items-center justify-between text-gray-500 pt-2 border-t overflow-hidden">
      <div className="flex items-center space-x-4">
        <span className="flex items-center">
          <HeartIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Like
        </span>
        <span className="flex items-center">
          <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1 flex-shrink-0" />{" "}
          Comment
        </span>
        <span className="flex items-center">
          <ShareIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Share
        </span>
      </div>
    </div>
  </div>
);

const InstagramMockupMini: React.FC<{
  content: string;
  listingImage?: string;
}> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm w-full max-w-sm mx-auto">
    <div className="flex items-center p-3 overflow-hidden">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="ml-2 min-w-0 flex-1">
        <div className="font-semibold text-gray-900 text-sm break-words">
          realestate_agent
        </div>
      </div>
    </div>
    {listingImage && (
      <div className="overflow-hidden">
        <img
          src={listingImage}
          alt="Property"
          className="w-full aspect-square object-cover"
        />
      </div>
    )}
    <div className="p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <HeartIcon className="w-5 h-5 flex-shrink-0" />
          <ChatBubbleOvalLeftIcon className="w-5 h-5 flex-shrink-0" />
          <ShareIcon className="w-5 h-5 flex-shrink-0" />
        </div>
      </div>
      <p
        className="text-gray-800 text-sm break-words"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {content}
      </p>
    </div>
  </div>
);

const TwitterMockupMini: React.FC<{
  content: string;
  listingImage?: string;
}> = ({ content, listingImage }) => (
  <div className="bg-white rounded-lg p-3 shadow-sm w-full max-w-sm mx-auto overflow-hidden">
    <div className="flex items-start space-x-2 overflow-hidden">
      <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">RE</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center space-x-1 mb-1 overflow-hidden">
          <span className="font-semibold text-gray-900 text-sm break-words">
            Real Estate Agent
          </span>
          <span className="text-gray-500 text-xs break-words">
            @realestate · 2h
          </span>
        </div>
        <p
          className="text-gray-800 text-sm mb-2 break-words"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {content}
        </p>
        {listingImage && (
          <div className="mb-2 overflow-hidden rounded-lg">
            <img
              src={listingImage}
              alt="Property"
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}
        <div className="flex items-center justify-between text-gray-500 overflow-hidden">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs">
              <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1 flex-shrink-0" />{" "}
              12
            </span>
            <span className="flex items-center text-xs">
              <ShareIcon className="w-4 h-4 mr-1 flex-shrink-0" /> 8
            </span>
            <span className="flex items-center text-xs">
              <HeartIcon className="w-4 h-4 mr-1 flex-shrink-0" /> 25
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SocialMediaMockup: React.FC<SocialMediaMockupProps> = ({
  content,
  listingImage,
  platform,
}) => {
  switch (platform) {
    case "facebook":
      return (
        <FacebookMockupMini content={content} listingImage={listingImage} />
      );
    case "instagram":
      return (
        <InstagramMockupMini content={content} listingImage={listingImage} />
      );
    case "twitter":
      return (
        <TwitterMockupMini content={content} listingImage={listingImage} />
      );
    default:
      return null;
  }
};

export default SocialMediaMockup;
