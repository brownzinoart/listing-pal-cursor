import React from "react";
import {
  BuildingOffice2Icon,
  ChatBubbleOvalLeftIcon,
  ArrowPathIcon,
  HeartIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { APP_NAME } from "../../../constants";

interface XMockupProps {
  listingImage?: string | null;
  postText: string;
  charCount: number;
  maxLength?: number;
}

const XMockup: React.FC<XMockupProps> = ({
  listingImage,
  postText,
  charCount,
  maxLength = 280,
}) => {
  const profileName = APP_NAME.split(" ")[0] + "Realty";
  const handle = "@" + APP_NAME.toLowerCase().replace(/\s+/g, "") + "Homes";
  const charLimitExceeded = charCount > maxLength;

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start mb-2">
        <div className="bg-brand-primary h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <BuildingOffice2Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <p className="font-bold text-sm text-gray-900 mr-1">
              {profileName}
            </p>
            <p className="text-xs text-gray-500">{handle} · 1m</p>
          </div>
          {/* Post Text */}
          <p
            className={`text-sm text-gray-800 whitespace-pre-line break-words ${charLimitExceeded ? "text-red-400" : ""}`}
          >
            {postText}
          </p>
        </div>
      </div>

      {/* Image Card */}
      {listingImage && (
        <div className="rounded-lg overflow-hidden border border-gray-200 my-2">
          <img
            src={listingImage}
            alt="Listing"
            className="w-full h-40 object-cover"
          />
          <div className="p-2 bg-gray-50">
            <p className="text-xs text-gray-700 truncate">
              New Listing! {postText.split("\n")[0]}
            </p>
            <p className="text-xs text-gray-500">{handle}</p>
          </div>
        </div>
      )}
      {!listingImage &&
        postText.length > 10 && ( // Show a placeholder card if text exists but no image
          <div className="rounded-lg overflow-hidden border border-gray-200 my-2 p-3 bg-gray-50">
            <p className="text-xs text-gray-700 truncate">
              New Listing! {postText.split("\n")[0]}
            </p>
          </div>
        )}

      {/* Actions */}
      <div className="flex justify-around items-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
        <button className="flex items-center hover:text-blue-400">
          <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1" /> 15
        </button>
        <button className="flex items-center hover:text-green-400">
          <ArrowPathIcon className="h-4 w-4 mr-1" /> 7
        </button>
        <button className="flex items-center hover:text-red-400">
          <HeartIcon className="h-4 w-4 mr-1" /> 120
        </button>
        <button className="flex items-center hover:text-blue-400">
          <ArrowUpTrayIcon className="h-4 w-4" />
        </button>
      </div>
      {maxLength && (
        <p
          className={`text-xs mt-2 text-right ${charLimitExceeded ? "text-red-500 font-semibold" : "text-gray-500"}`}
        >
          {charCount}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default XMockup;
