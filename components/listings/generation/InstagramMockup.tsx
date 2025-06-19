import React from "react";
import {
  BuildingOffice2Icon,
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline"; // Using outline for IG style
import { APP_NAME } from "../../../constants";

interface InstagramMockupProps {
  listingImage?: string | null;
  captionText: string;
}

const InstagramMockup: React.FC<InstagramMockupProps> = ({
  listingImage,
  captionText,
}) => {
  const profileName = APP_NAME.toLowerCase().replace(/\s+/g, "_") + "_realty";
  const displayedCaption =
    captionText.length > 100
      ? `${captionText.substring(0, 100)}... more`
      : captionText;

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200">
        <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 h-9 w-9 rounded-full flex items-center justify-center mr-3 p-0.5">
          <div className="bg-white h-full w-full rounded-full flex items-center justify-center">
            <BuildingOffice2Icon className="h-5 w-5 text-gray-800" />
          </div>
        </div>
        <p className="font-semibold text-sm text-gray-900">{profileName}</p>
        {/* Optionally add three dots icon here */}
      </div>

      {/* Image */}
      <div className="aspect-square w-full bg-gray-50">
        {listingImage ? (
          <img
            src={listingImage}
            alt="Listing"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingOffice2Icon className="h-20 w-20 text-gray-400 opacity-50" />
          </div>
        )}
      </div>

      {/* Actions & Caption */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-3.5">
            <HeartIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-600" />
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-600" />
            <PaperAirplaneIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-600" />
          </div>
          <BookmarkIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">1,024 likes</p>
        {captionText && (
          <p className="text-sm text-gray-900 whitespace-pre-line break-words">
            <span className="font-semibold">{profileName}</span>{" "}
            <span className="text-gray-700">{displayedCaption}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline">
          View all 35 comments
        </p>
        <p className="text-xs text-gray-500 mt-1">2 HOURS AGO</p>
      </div>
    </div>
  );
};

export default InstagramMockup;
