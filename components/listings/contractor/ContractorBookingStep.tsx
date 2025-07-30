import React, { useState } from "react";
import {
  Listing,
  Contractor,
  ServiceQuoteRequest,
  ContractorSearchCriteria,
} from "../../../types";
import Button from "../../shared/Button";
import {
  ArrowLeftIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface ContractorBookingStepProps {
  listing: Listing;
  contractor: Contractor;
  quoteRequest: ServiceQuoteRequest | null;
  searchCriteria: Partial<ContractorSearchCriteria>;
  onRequest: (quoteData: Partial<ServiceQuoteRequest>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractorBookingStep: React.FC<ContractorBookingStepProps> = ({
  listing,
  contractor,
  quoteRequest,
  searchCriteria,
  onRequest,
  onNext,
  onPrevious,
}) => {
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [projectUrgency, setProjectUrgency] = useState<
    "flexible" | "moderate" | "urgent"
  >("flexible");
  const [contactMethod, setContactMethod] = useState<
    "phone" | "email" | "text"
  >("email");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [materialsIncluded, setMaterialsIncluded] = useState(false);
  const [permitRequired, setPermitRequired] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getEstimatedProjectCost = () => {
    const baseHours = 40; // Estimate 40 hours for average project
    const urgencyMultiplier =
      projectUrgency === "urgent"
        ? 1.3
        : projectUrgency === "moderate"
          ? 1.1
          : 1.0;
    return contractor.hourlyRate * baseHours * urgencyMultiplier;
  };

  const handleQuoteRequest = () => {
    if (!preferredStartDate) {
      alert("Please select a preferred start date for your project.");
      return;
    }

    onRequest({
      projectDescription: searchCriteria.projectDescription,
      projectType: searchCriteria.projectType,
      budgetRange: searchCriteria.budgetRange,
      timeframe: searchCriteria.timeframe,
      preferredStartDate,
      projectUrgency,
      contactMethod,
      additionalRequirements,
      materialsIncluded,
      permitRequired,
      estimatedCost: getEstimatedProjectCost(),
    });
  };

  // Generate available start dates (next 30 days)
  const getAvailableStartDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  if (quoteRequest) {
    return (
      <div className="space-y-8">
        {/* Success Message */}
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Quote Request Sent Successfully!
            </h3>
            <p className="text-emerald-400 font-semibold mb-6">
              Request #: {quoteRequest.id.split("-")[1].toUpperCase()}
            </p>
          </div>

          {/* Quote Request Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h4 className="text-white font-semibold mb-4">
              Quote Request Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Project Type</p>
                  <p className="text-white font-semibold capitalize">
                    {searchCriteria.projectType?.replace("-", " ") ||
                      "General Project"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Preferred Start Date</p>
                  <p className="text-white font-semibold">
                    {new Date(
                      quoteRequest.preferredStartDate || "",
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Project Urgency</p>
                  <p className="text-white font-semibold capitalize">
                    {quoteRequest.projectUrgency}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Estimated Cost</p>
                  <p className="text-white font-semibold">
                    {formatPrice(
                      quoteRequest.estimatedCost || getEstimatedProjectCost(),
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Contact Method</p>
                  <p className="text-white font-semibold capitalize">
                    {quoteRequest.contactMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Property Location</p>
                  <p className="text-white font-semibold">
                    {listing.city}, {listing.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Description */}
            {searchCriteria.projectDescription && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-slate-400 text-sm mb-2">
                  Project Description
                </p>
                <p className="text-white bg-white/5 rounded-lg p-3">
                  {searchCriteria.projectDescription}
                </p>
              </div>
            )}

            {/* Additional Requirements */}
            {quoteRequest.additionalRequirements && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">
                  Additional Requirements
                </p>
                <p className="text-white bg-white/5 rounded-lg p-3">
                  {quoteRequest.additionalRequirements}
                </p>
              </div>
            )}
          </div>

          {/* Contractor Info */}
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4">
              Your Selected Contractor
            </h4>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {contractor.businessName}
                </p>
                <p className="text-slate-400">{contractor.contactName}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-3 w-3 ${star <= contractor.overallRating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
                    />
                  ))}
                  <span className="text-slate-400 text-sm ml-2">
                    ({contractor.totalReviews} reviews)
                  </span>
                  {contractor.verified && (
                    <div className="flex items-center space-x-1 text-emerald-400 ml-3">
                      <ShieldCheckIcon className="h-3 w-3" />
                      <span className="text-xs font-semibold">VERIFIED</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Contact</p>
                <p className="text-white font-semibold">{contractor.phone}</p>
                <p className="text-slate-400 text-sm">{contractor.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
          <h4 className="text-orange-400 font-semibold mb-3">
            What Happens Next?
          </h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Initial Contact
                </p>
                <p className="text-slate-400 text-xs">
                  The contractor will contact you within 4 hours to discuss your
                  project
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Site Assessment
                </p>
                <p className="text-slate-400 text-xs">
                  Schedule an on-site visit to provide accurate project
                  estimates
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Detailed Quote</p>
                <p className="text-slate-400 text-xs">
                  Receive comprehensive quote with timeline and material costs
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Project Start</p>
                <p className="text-slate-400 text-xs">
                  Begin work according to agreed timeline and specifications
                </p>
              </div>
            </div>
          </div>
        </div>

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
            onClick={() => (window.location.href = `/listings/${listing.id}`)}
            rightIcon={<CheckIcon className="h-5 w-5" />}
          >
            Complete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contractor Summary */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Request Your Quote
        </h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">
              {contractor.businessName}
            </p>
            <p className="text-slate-400">{contractor.contactName}</p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-3 w-3 ${star <= contractor.overallRating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
                  />
                ))}
                <span className="text-slate-400 text-sm ml-2">
                  {contractor.overallRating}
                </span>
              </div>
              {contractor.verified && (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span className="text-xs font-semibold">VERIFIED</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Hourly Rate</p>
            <p className="text-emerald-400 font-bold text-lg">
              {formatPrice(contractor.hourlyRate)}/hr
            </p>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Project Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Project Type</p>
            <p className="text-white font-semibold capitalize">
              {searchCriteria.projectType?.replace("-", " ") ||
                "General Project"}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Budget Range</p>
            <p className="text-white font-semibold">
              {searchCriteria.budgetRange || "To be discussed"}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Timeline</p>
            <p className="text-white font-semibold">
              {searchCriteria.timeframe || "Flexible"}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Property</p>
            <p className="text-white font-semibold">
              {listing.city}, {listing.state}
            </p>
          </div>
        </div>

        {searchCriteria.projectDescription && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Project Description</p>
            <p className="text-white">{searchCriteria.projectDescription}</p>
          </div>
        )}
      </div>

      {/* Project Timeline */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Project Timeline</h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Preferred Start Date
            </label>
            <input
              type="date"
              value={preferredStartDate}
              onChange={(e) => setPreferredStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Project Urgency
            </label>
            <select
              value={projectUrgency}
              onChange={(e) =>
                setProjectUrgency(
                  e.target.value as "flexible" | "moderate" | "urgent",
                )
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="flexible">Flexible - Within 2-4 weeks</option>
              <option value="moderate">Moderate - Within 1-2 weeks</option>
              <option value="urgent">
                Urgent - ASAP (rush fees may apply)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Requirements */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Project Requirements</h4>

        <div className="space-y-4 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={materialsIncluded}
              onChange={(e) => setMaterialsIncluded(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <span className="text-white font-medium">
                Materials Included in Quote
              </span>
              <p className="text-slate-400 text-sm">
                Contractor will provide all necessary materials
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={permitRequired}
              onChange={(e) => setPermitRequired(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <span className="text-white font-medium">Permits Required</span>
              <p className="text-slate-400 text-sm">
                Project may require building permits or approvals
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Additional Requirements or Special Instructions
          </label>
          <textarea
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            placeholder="Any specific requirements, access restrictions, preferred materials, or other details the contractor should know..."
            className="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </div>
      </div>

      {/* Contact Preferences */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Contact Preferences</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(["phone", "email", "text"] as const).map((method) => {
            const isSelected = contactMethod === method;
            const icons = {
              phone: PhoneIcon,
              email: EnvelopeIcon,
              text: ChatBubbleLeftIcon,
            };
            const Icon = icons[method];

            return (
              <button
                key={method}
                onClick={() => setContactMethod(method)}
                className={`
                  flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200
                  ${
                    isSelected
                      ? "bg-orange-500/20 border-orange-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <Icon className="h-5 w-5 text-orange-400" />
                <span className="text-white font-medium capitalize">
                  {method}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">
          Estimated Project Cost
        </h4>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">Base Estimate (40 hours)</span>
            <span className="text-white">
              {formatPrice(contractor.hourlyRate * 40)}
            </span>
          </div>
          {projectUrgency !== "flexible" && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Urgency Adjustment</span>
              <span className="text-white">
                +{projectUrgency === "urgent" ? "30" : "10"}%
              </span>
            </div>
          )}
          <div className="border-t border-orange-500/20 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-orange-400 font-bold text-lg">
                Total Estimate
              </span>
              <span className="text-orange-400 font-bold text-lg">
                {formatPrice(getEstimatedProjectCost())}
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            *This is a preliminary estimate. Final cost will be determined after
            site assessment.
          </p>
        </div>
      </div>

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
          onClick={handleQuoteRequest}
          rightIcon={<PaperAirplaneIcon className="h-5 w-5" />}
          disabled={!preferredStartDate}
        >
          Send Quote Request
        </Button>
      </div>
    </div>
  );
};

export default ContractorBookingStep;
