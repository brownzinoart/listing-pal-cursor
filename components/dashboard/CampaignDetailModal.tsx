import React from "react";
import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";
import { AdCampaign } from "./PaidAdsDashboard";
import Button from "../shared/Button";
import AdCreativeMockup from "../listings/generation/AdCreativeMockup";

interface CampaignDetailModalProps {
  campaign: AdCampaign;
  onClose: () => void;
}

const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  onClose,
}) => {
  const getPlatformIcon = (platform: AdCampaign["platform"]) => {
    switch (platform) {
      case "facebook":
        return <FaFacebook className="h-5 w-5 text-blue-600" />;
      case "linkedin":
        return <FaLinkedin className="h-5 w-5 text-sky-700" />;
      case "google":
        return <FaGoogle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: AdCampaign["status"]) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800 border-gray-300",
      running: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const mockListing = {
    id: campaign.listingId,
    userId: "1",
    address: campaign.listingAddress,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2500,
    yearBuilt: 2020,
    price: 850000,
    keyFeatures: "",
    images: [],
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl w-full bg-brand-panel rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-brand-border">
            <div className="flex items-center gap-4">
              <Dialog.Title className="text-2xl font-bold text-brand-text-primary">
                Campaign Details
              </Dialog.Title>
              {getStatusBadge(campaign.status)}
            </div>
            <button
              onClick={onClose}
              className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
                    Campaign Information
                  </h3>
                  <div className="bg-brand-background rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-secondary">
                        Listing
                      </span>
                      <span className="text-sm font-medium text-brand-text-primary">
                        {campaign.listingAddress}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-secondary">
                        Platform
                      </span>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(campaign.platform)}
                        <span className="text-sm font-medium text-brand-text-primary capitalize">
                          {campaign.platform}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-secondary">
                        Objective
                      </span>
                      <span className="text-sm font-medium text-brand-text-primary">
                        {campaign.objective}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-secondary">
                        Budget
                      </span>
                      <span className="text-sm font-medium text-brand-text-primary">
                        ${campaign.budget}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-secondary">
                        Duration
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-brand-text-tertiary" />
                        <span className="text-brand-text-primary">
                          {formatDate(campaign.startDate)} -{" "}
                          {campaign.endDate
                            ? formatDate(campaign.endDate)
                            : "Ongoing"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Impressions
                      </p>
                      <p className="text-2xl font-bold text-brand-text-primary">
                        {campaign.metrics.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Clicks
                      </p>
                      <p className="text-2xl font-bold text-brand-text-primary">
                        {campaign.metrics.clicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        CTR
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-brand-text-primary">
                          {campaign.metrics.ctr.toFixed(2)}%
                        </p>
                        {campaign.metrics.ctr > 5 ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                        ) : campaign.metrics.ctr < 3 ? (
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Conversions
                      </p>
                      <p className="text-2xl font-bold text-brand-text-primary">
                        {campaign.metrics.conversions}
                      </p>
                    </div>
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Total Spend
                      </p>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-brand-text-tertiary" />
                        <p className="text-2xl font-bold text-brand-text-primary">
                          ${campaign.metrics.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-brand-background rounded-lg p-4">
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Cost per Click
                      </p>
                      <p className="text-2xl font-bold text-brand-text-primary">
                        ${campaign.metrics.costPerClick.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
                    Ad Copy
                  </h3>
                  <div className="bg-brand-background rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Headline
                      </p>
                      <p className="text-sm font-medium text-brand-text-primary">
                        {campaign.headline}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Body
                      </p>
                      <p className="text-sm text-brand-text-primary">
                        {campaign.body}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-text-secondary mb-1">
                        Call to Action
                      </p>
                      <p className="text-sm font-medium text-brand-primary">
                        {campaign.cta}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
                    Ad Preview
                  </h3>
                  <div className="bg-brand-background rounded-lg p-6 flex items-center justify-center min-h-[400px]">
                    <AdCreativeMockup
                      listing={mockListing}
                      headline={campaign.headline}
                      body={campaign.body}
                      cta={campaign.cta}
                      platform={campaign.platform}
                    />
                  </div>
                </div>

                <div className="bg-brand-card rounded-lg p-4 border border-brand-primary/20">
                  <h4 className="text-sm font-semibold text-brand-text-primary mb-2">
                    Performance Insights
                  </h4>
                  <ul className="space-y-2 text-sm text-brand-text-secondary">
                    {campaign.metrics.ctr > 5 && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        Excellent CTR! This ad is performing above industry
                        average.
                      </li>
                    )}
                    {campaign.metrics.costPerClick < 1 && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        Great CPC efficiency. You're getting quality traffic at
                        a low cost.
                      </li>
                    )}
                    {campaign.metrics.conversions > 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        High conversion volume indicates strong ad-to-landing
                        page alignment.
                      </li>
                    )}
                    {campaign.metrics.engagementRate > 7 && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        Above-average engagement rate shows your content
                        resonates with the audience.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary">Duplicate Campaign</Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CampaignDetailModal;
