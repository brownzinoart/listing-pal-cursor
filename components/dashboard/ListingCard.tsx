import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Listing } from "../../types";
import Button from "../shared/Button";
import Card from "../shared/Card";
import {
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface ListingCardProps {
  listing: Listing;
  onDelete: (listingId: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onDelete }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const primaryImage =
    listing.images && listing.images.length > 0 ? listing.images[0].url : null;
  const cityState =
    listing.address.split(",").slice(1, 3).join(",").trim() || "N/A";

  return (
    <Card
      variant="default"
      padding="none"
      hover={true}
      className="overflow-hidden flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.address}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-brand-gradient flex items-center justify-center">
            <BuildingOfficeIcon className="w-16 h-16 text-white opacity-75" />
          </div>
        )}
        <span className="absolute top-3 right-3 bg-brand-success text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
          Active
        </span>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-3">
          <h3
            className="text-lg font-semibold text-brand-text-primary truncate flex-1 mr-2"
            title={listing.address}
          >
            {listing.address.split(",")[0]}
          </h3>
          <div className="flex space-x-2">
            <Link
              to={`/listings/${listing.id}/edit`}
              className="p-1.5 rounded-md hover:bg-brand-panel text-brand-text-secondary hover:text-brand-primary transition-colors"
              title="Edit Listing"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(listing.id)}
              className="p-1.5 rounded-md hover:bg-brand-panel text-brand-text-secondary hover:text-brand-danger transition-colors"
              title="Delete Listing"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-brand-text-secondary mb-3">
          <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{cityState}</span>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-brand-success mb-4">
          {formatPrice(listing.price)}
        </p>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-brand-text-tertiary mb-6 border-t border-brand-border pt-4 mt-auto">
          <div className="flex justify-between">
            <span>Bedrooms:</span>
            <span className="font-medium">{listing.bedrooms}</span>
          </div>
          <div className="flex justify-between">
            <span>Bathrooms:</span>
            <span className="font-medium">{listing.bathrooms}</span>
          </div>
          <div className="flex justify-between">
            <span>Sq Ft:</span>
            <span className="font-medium">
              {listing.squareFootage.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Built:</span>
            <span className="font-medium">{listing.yearBuilt}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth={true}
          onClick={() => navigate(`/listings/${listing.id}`)}
        >
          Manage Listing
        </Button>
      </div>
    </Card>
  );
};

export default ListingCard;
