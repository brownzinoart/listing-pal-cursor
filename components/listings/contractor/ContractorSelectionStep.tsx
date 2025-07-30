import React, { useState } from "react";
import { Listing, ServiceSearchResult, Contractor } from "../../../types";
import Button from "../../shared/Button";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface ContractorSelectionStepProps {
  listing: Listing;
  searchResults: ServiceSearchResult[];
  selectedContractors: string[];
  selectedContractor: Contractor | null;
  onSelect: (contractorId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractorSelectionStep: React.FC<ContractorSelectionStepProps> = ({
  listing,
  searchResults,
  selectedContractors,
  selectedContractor,
  onSelect,
  onNext,
  onPrevious,
}) => {
  const [activeTab, setActiveTab] = useState<"comparison" | "details">(
    "comparison",
  );
  const [selectedForDetails, setSelectedForDetails] = useState<string | null>(
    selectedContractor?.id || null,
  );

  const selectedResults = searchResults.filter((result) =>
    selectedContractors.includes(result.provider.id),
  );

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
          />
        ))}
        <span className="text-white font-semibold ml-2">{rating}</span>
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const detailsContractor = selectedForDetails
    ? (searchResults.find((r) => r.provider.id === selectedForDetails)
        ?.provider as Contractor)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">
          Compare & Select Contractor
        </h3>
        <p className="text-slate-400">
          Review detailed information and select your preferred contractor for
          quotes
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "comparison"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "details"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Detailed Profile
          </button>
        </div>
      </div>

      {activeTab === "comparison" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedResults.map((result) => {
            const contractor = result.provider as Contractor;
            const isSelected = selectedContractor?.id === contractor.id;

            return (
              <div
                key={contractor.id}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-400/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }
                `}
                onClick={() => onSelect(contractor.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                    <WrenchScrewdriverIcon className="h-8 w-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg">
                    {contractor.businessName}
                  </h4>
                  <p className="text-slate-400">{contractor.contactName}</p>

                  {contractor.verified && (
                    <div className="flex items-center justify-center space-x-1 text-emerald-400 mt-2">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span className="text-xs font-semibold">VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="text-center mb-6">
                  {renderStarRating(contractor.overallRating)}
                  <p className="text-slate-400 text-sm mt-1">
                    ({contractor.totalReviews} reviews)
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Hourly Rate</span>
                    <span className="text-emerald-400 font-bold">
                      {formatPrice(contractor.hourlyRate)}/hr
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Experience</span>
                    <span className="text-white font-semibold">
                      {contractor.yearsInBusiness} years
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Insurance</span>
                    <span className="text-white font-semibold">
                      $
                      {contractor.insurance[0]?.coverageAmount.toLocaleString() ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Distance</span>
                    <span className="text-white font-semibold">
                      {result.distance} miles
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-sm">Available</span>
                    <span className="text-white font-semibold">
                      {new Date(
                        contractor.availability.nextAvailableDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-6">
                  <p className="text-slate-400 text-xs mb-2">
                    Top Specialties:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties
                      .slice(0, 2)
                      .map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Button
                    variant={isSelected ? "gradient" : "glass"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedForDetails(contractor.id);
                      setActiveTab("details");
                    }}
                    className="w-full"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "details" && detailsContractor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contractor Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-4">
                Select Contractor
              </h4>
              <div className="space-y-3">
                {selectedResults.map((result) => {
                  const contractor = result.provider as Contractor;
                  const isActive = selectedForDetails === contractor.id;

                  return (
                    <div
                      key={contractor.id}
                      onClick={() => setSelectedForDetails(contractor.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${
                          isActive
                            ? "bg-orange-500/20 border-orange-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <WrenchScrewdriverIcon className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {contractor.businessName}
                          </p>
                          <div className="flex items-center space-x-1">
                            {renderStarRating(contractor.overallRating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {detailsContractor.businessName}
                  </h3>
                  <p className="text-slate-400">
                    {detailsContractor.contactName}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-slate-300">
                      {detailsContractor.city}, {detailsContractor.state}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-300">
                      {detailsContractor.yearsInBusiness} years experience
                    </span>
                  </div>
                </div>

                {detailsContractor.verified && (
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {detailsContractor.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {detailsContractor.email}
                  </span>
                </div>
                {detailsContractor.website && (
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-orange-400 text-sm hover:underline cursor-pointer">
                      Visit Website
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications & Insurance */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-4">
                Certifications & Insurance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-slate-300 font-medium mb-3">
                    Licenses & Certifications
                  </h5>
                  <div className="space-y-3">
                    {detailsContractor.certifications.map((cert) => (
                      <div key={cert.id} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white font-medium text-sm">
                          {cert.name}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {cert.issuingBody}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {cert.certificationNumber &&
                            `#${cert.certificationNumber} • `}
                          Valid until{" "}
                          {cert.expirationDate
                            ? new Date(cert.expirationDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-slate-300 font-medium mb-3">
                    Insurance Coverage
                  </h5>
                  <div className="space-y-3">
                    {detailsContractor.insurance.map((ins, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white font-medium text-sm capitalize">
                          {ins.type.replace("-", " ")}
                        </p>
                        <p className="text-slate-400 text-xs">{ins.carrier}</p>
                        <p className="text-emerald-400 text-xs font-semibold">
                          ${ins.coverageAmount.toLocaleString()} coverage
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-4">Recent Reviews</h4>
              <div className="space-y-4">
                {detailsContractor.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {review.reviewerName}
                        </p>
                        {renderStarRating(review.rating)}
                      </div>
                      <p className="text-slate-400 text-xs">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-slate-300 text-sm">{review.comment}</p>
                    {review.verified && (
                      <p className="text-emerald-400 text-xs mt-2">
                        ✓ Verified Project
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {detailsContractor.portfolio.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-white font-semibold mb-4">
                  Recent Projects
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailsContractor.portfolio.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <PhotoIcon className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                        <div>
                          <h5 className="text-white font-medium text-sm">
                            {item.title}
                          </h5>
                          <p className="text-slate-400 text-xs mb-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-400">
                          {new Date(item.completionDate).toLocaleDateString()}
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          {formatPrice(item.projectValue || 0)}
                        </span>
                      </div>
                      {item.clientTestimonial && (
                        <p className="text-slate-300 text-xs italic">
                          "{item.clientTestimonial}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Selection */}
      {selectedContractor && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-emerald-400 font-semibold">
                Ready to Request Quote
              </h4>
              <p className="text-white">
                Selected:{" "}
                <span className="font-semibold">
                  {selectedContractor.businessName}
                </span>
              </p>
              <p className="text-slate-400 text-sm">
                {formatPrice(selectedContractor.hourlyRate)}/hr • Available{" "}
                {new Date(
                  selectedContractor.availability.nextAvailableDate,
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Get Quote</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="glass"
          onClick={onPrevious}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Previous
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          disabled={!selectedContractor}
        >
          Request Quote
        </Button>
      </div>
    </div>
  );
};

export default ContractorSelectionStep;
