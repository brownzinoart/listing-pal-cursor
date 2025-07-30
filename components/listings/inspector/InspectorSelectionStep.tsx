import React, { useState } from "react";
import { Listing, ServiceSearchResult, Inspector } from "../../../types";
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
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface InspectorSelectionStepProps {
  listing: Listing;
  searchResults: ServiceSearchResult[];
  selectedInspectors: string[];
  selectedInspector: Inspector | null;
  onSelect: (inspectorId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InspectorSelectionStep: React.FC<InspectorSelectionStepProps> = ({
  listing,
  searchResults,
  selectedInspectors,
  selectedInspector,
  onSelect,
  onNext,
  onPrevious,
}) => {
  const [activeTab, setActiveTab] = useState<"comparison" | "details">(
    "comparison",
  );
  const [selectedForDetails, setSelectedForDetails] = useState<string | null>(
    selectedInspector?.id || null,
  );

  const selectedResults = searchResults.filter((result) =>
    selectedInspectors.includes(result.provider.id),
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

  const detailsInspector = selectedForDetails
    ? (searchResults.find((r) => r.provider.id === selectedForDetails)
        ?.provider as Inspector)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">
          Compare & Select Inspector
        </h3>
        <p className="text-slate-400">
          Review detailed information and select your preferred inspector
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "comparison"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "details"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
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
            const inspector = result.provider as Inspector;
            const isSelected = selectedInspector?.id === inspector.id;

            return (
              <div
                key={inspector.id}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-400/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }
                `}
                onClick={() => onSelect(inspector.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 text-2xl font-bold">
                      {inspector.businessName[0]}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg">
                    {inspector.businessName}
                  </h4>
                  <p className="text-slate-400">{inspector.contactName}</p>

                  {inspector.verified && (
                    <div className="flex items-center justify-center space-x-1 text-emerald-400 mt-2">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span className="text-xs font-semibold">VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="text-center mb-6">
                  {renderStarRating(inspector.overallRating)}
                  <p className="text-slate-400 text-sm mt-1">
                    ({inspector.totalReviews} reviews)
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Standard Fee</span>
                    <span className="text-emerald-400 font-bold">
                      {formatPrice(inspector.standardInspectionFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Experience</span>
                    <span className="text-white font-semibold">
                      {inspector.yearsInBusiness} years
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Report Time</span>
                    <span className="text-white font-semibold">
                      {inspector.reportTurnaroundHours} hours
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
                        inspector.availability.nextAvailableDate,
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
                    {inspector.specialties
                      .slice(0, 2)
                      .map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
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
                      setSelectedForDetails(inspector.id);
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

      {activeTab === "details" && detailsInspector && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inspector Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-4">
                Select Inspector
              </h4>
              <div className="space-y-3">
                {selectedResults.map((result) => {
                  const inspector = result.provider as Inspector;
                  const isActive = selectedForDetails === inspector.id;

                  return (
                    <div
                      key={inspector.id}
                      onClick={() => setSelectedForDetails(inspector.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${
                          isActive
                            ? "bg-blue-500/20 border-blue-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-bold">
                            {inspector.businessName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {inspector.businessName}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {renderStarRating(inspector.overallRating)}
                          </p>
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
                    {detailsInspector.businessName}
                  </h3>
                  <p className="text-slate-400">
                    {detailsInspector.contactName}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-slate-300">
                      {detailsInspector.city}, {detailsInspector.state}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-300">
                      {detailsInspector.yearsInBusiness} years experience
                    </span>
                  </div>
                </div>

                {detailsInspector.verified && (
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
                    {detailsInspector.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {detailsInspector.email}
                  </span>
                </div>
                {detailsInspector.website && (
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-blue-400 text-sm hover:underline cursor-pointer">
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
                    Certifications
                  </h5>
                  <div className="space-y-3">
                    {detailsInspector.certifications.map((cert) => (
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
                    {detailsInspector.insurance.map((ins, index) => (
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
                {detailsInspector.reviews.slice(0, 3).map((review) => (
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
                        ✓ Verified Purchase
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {detailsInspector.portfolio.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-white font-semibold mb-4">Recent Work</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailsInspector.portfolio.slice(0, 2).map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4">
                      <h5 className="text-white font-medium text-sm mb-2">
                        {item.title}
                      </h5>
                      <p className="text-slate-400 text-xs mb-3">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">
                          {new Date(item.completionDate).toLocaleDateString()}
                        </span>
                      </div>
                      {item.clientTestimonial && (
                        <p className="text-slate-300 text-xs mt-2 italic">
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
      {selectedInspector && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-emerald-400 font-semibold">Ready to Book</h4>
              <p className="text-white">
                Selected:{" "}
                <span className="font-semibold">
                  {selectedInspector.businessName}
                </span>
              </p>
              <p className="text-slate-400 text-sm">
                {formatPrice(selectedInspector.standardInspectionFee)} •
                Available{" "}
                {new Date(
                  selectedInspector.availability.nextAvailableDate,
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">
                Schedule Inspection
              </span>
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
          disabled={!selectedInspector}
        >
          Book Inspection
        </Button>
      </div>
    </div>
  );
};

export default InspectorSelectionStep;
