import React, { useState, useMemo } from "react";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import CampaignDetailModal from "./CampaignDetailModal";
import Button from "../shared/Button";
import PropertySelector from "../shared/PropertySelector";
import { Listing } from "../../types";

export interface AdCampaign {
  id: string;
  listingId: string;
  listingAddress: string;
  platform: "facebook" | "linkedin" | "google";
  status: "draft" | "running" | "completed" | "paused";
  objective: string;
  headline: string;
  body: string;
  cta: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cost: number;
    costPerClick: number;
    engagementRate: number;
  };
  startDate: string;
  endDate?: string;
  budget: number;
}

const mockCampaigns: AdCampaign[] = [
  {
    id: "1",
    listingId: "listing-1",
    listingAddress: "123 Maple Street, Sunnyvale, CA",
    platform: "facebook",
    status: "running",
    objective: "Lead Generation",
    headline: "Dream Home Alert! Modern 4BR in Sunnyvale",
    body: "Stunning newly renovated home with smart features, solar panels, and a gorgeous backyard. Perfect for families!",
    cta: "Schedule Tour",
    metrics: {
      impressions: 15420,
      clicks: 892,
      ctr: 5.79,
      conversions: 47,
      cost: 450.25,
      costPerClick: 0.5,
      engagementRate: 8.2,
    },
    startDate: "2025-01-15",
    budget: 1000,
  },
  {
    id: "2",
    listingId: "listing-2",
    listingAddress: "456 Oak Avenue, Palo Alto, CA",
    platform: "google",
    status: "completed",
    objective: "Website Traffic",
    headline: "Luxury Estate in Palo Alto",
    body: "Experience elevated living in this architectural masterpiece. 6 bedrooms, infinity pool, wine cellar.",
    cta: "View Gallery",
    metrics: {
      impressions: 28930,
      clicks: 1456,
      ctr: 5.03,
      conversions: 89,
      cost: 1250.0,
      costPerClick: 0.86,
      engagementRate: 6.1,
    },
    startDate: "2025-01-01",
    endDate: "2025-01-14",
    budget: 1500,
  },
  {
    id: "3",
    listingId: "listing-3",
    listingAddress: "789 Pine Lane, Mountain View, CA",
    platform: "linkedin",
    status: "running",
    objective: "Brand Awareness",
    headline: "Investment Opportunity: Prime Mountain View Property",
    body: "Exceptional ROI potential. Walking distance to tech campuses. Perfect for investors or professionals.",
    cta: "Get Details",
    metrics: {
      impressions: 8765,
      clicks: 234,
      ctr: 2.67,
      conversions: 15,
      cost: 320.5,
      costPerClick: 1.37,
      engagementRate: 4.8,
    },
    startDate: "2025-01-10",
    budget: 800,
  },
  {
    id: "4",
    listingId: "listing-1",
    listingAddress: "123 Maple Street, Sunnyvale, CA",
    platform: "linkedin",
    status: "draft",
    objective: "Lead Generation",
    headline: "Executive Home in Silicon Valley",
    body: "Prestigious property perfect for tech executives. Home office, EV charging, premium finishes throughout.",
    cta: "Book Private Tour",
    metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      cost: 0,
      costPerClick: 0,
      engagementRate: 0,
    },
    startDate: "2025-01-25",
    budget: 600,
  },
  {
    id: "5",
    listingId: "listing-4",
    listingAddress: "321 Elm Street, San Jose, CA",
    platform: "facebook",
    status: "paused",
    objective: "Website Traffic",
    headline: "Charming Starter Home - Move-in Ready!",
    body: "Perfect first home! Updated kitchen, hardwood floors, great schools nearby. FHA approved.",
    cta: "See Virtual Tour",
    metrics: {
      impressions: 12450,
      clicks: 567,
      ctr: 4.55,
      conversions: 28,
      cost: 289.75,
      costPerClick: 0.51,
      engagementRate: 5.9,
    },
    startDate: "2025-01-05",
    budget: 700,
  },
];

// Mock listings for property filtering
const mockListings: Listing[] = [
  {
    id: "listing-1",
    userId: "user-1",
    address: "123 Maple Street, Sunnyvale, CA",
    city: "Sunnyvale",
    state: "CA",
    zipCode: "94085",
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2100,
    price: 1250000,
    propertyType: "single-family",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-2",
    userId: "user-1",
    address: "456 Oak Avenue, Palo Alto, CA",
    city: "Palo Alto",
    state: "CA",
    zipCode: "94301",
    bedrooms: 5,
    bathrooms: 4,
    squareFootage: 3200,
    price: 2850000,
    propertyType: "single-family",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-3",
    userId: "user-1",
    address: "789 Pine Lane, Mountain View, CA",
    city: "Mountain View",
    state: "CA",
    zipCode: "94041",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    price: 1650000,
    propertyType: "townhome",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-4",
    userId: "user-1",
    address: "321 Elm Street, San Jose, CA",
    city: "San Jose",
    state: "CA",
    zipCode: "95110",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    price: 950000,
    propertyType: "condo",
    status: "sold",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const PaidAdsDashboard: React.FC = () => {
  const [campaigns] = useState<AdCampaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedListings, setSelectedListings] = useState<string[]>(
    mockListings.map((l) => l.id),
  );
  const [sortField, setSortField] = useState<
    keyof AdCampaign["metrics"] | "status"
  >("ctr");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateCampaign, setDuplicateCampaign] = useState<AdCampaign | null>(
    null,
  );

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((campaign) => {
        const matchesSearch =
          campaign.listingAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaign.headline.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || campaign.status === statusFilter;
        const matchesPlatform =
          platformFilter === "all" || campaign.platform === platformFilter;
        const matchesListing =
          selectedListings.length === 0 ||
          selectedListings.includes(campaign.listingId);
        return (
          matchesSearch && matchesStatus && matchesPlatform && matchesListing
        );
      })
      .sort((a, b) => {
        if (sortField === "status") {
          return sortDirection === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        const aValue = a.metrics[sortField];
        const bValue = b.metrics[sortField];
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
  }, [
    campaigns,
    searchTerm,
    statusFilter,
    platformFilter,
    sortField,
    sortDirection,
  ]);

  const overallMetrics = useMemo(() => {
    const activeCampaigns = campaigns.filter((c) => c.status !== "draft");
    return {
      totalSpend: activeCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0),
      avgCTR:
        activeCampaigns.length > 0
          ? activeCampaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) /
            activeCampaigns.length
          : 0,
      totalConversions: activeCampaigns.reduce(
        (sum, c) => sum + c.metrics.conversions,
        0,
      ),
      totalImpressions: activeCampaigns.reduce(
        (sum, c) => sum + c.metrics.impressions,
        0,
      ),
    };
  }, [campaigns]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDuplicate = (campaign: AdCampaign) => {
    setDuplicateCampaign(campaign);
    setShowDuplicateModal(true);
  };

  const getPlatformIcon = (platform: AdCampaign["platform"]) => {
    switch (platform) {
      case "facebook":
        return <FaFacebook className="h-4 w-4 text-blue-600" />;
      case "linkedin":
        return <FaLinkedin className="h-4 w-4 text-sky-700" />;
      case "google":
        return <FaGoogle className="h-4 w-4 text-red-600" />;
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
        className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">Total Spend</p>
              <p className="text-2xl font-bold text-brand-text-primary">
                ${overallMetrics.totalSpend.toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-brand-primary opacity-50" />
          </div>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">Avg. CTR</p>
              <p className="text-2xl font-bold text-brand-text-primary">
                {overallMetrics.avgCTR.toFixed(2)}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-brand-primary opacity-50" />
          </div>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">
                Total Conversions
              </p>
              <p className="text-2xl font-bold text-brand-text-primary">
                {overallMetrics.totalConversions}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-secondary">
                Total Impressions
              </p>
              <p className="text-2xl font-bold text-brand-text-primary">
                {overallMetrics.totalImpressions.toLocaleString()}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-brand-primary opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-brand-panel border border-brand-border rounded-lg">
        <div className="p-6 border-b border-brand-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Active Campaigns
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-brand-background border border-brand-border rounded-md text-brand-text-primary placeholder-brand-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<FunnelIcon className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 space-y-4 pt-4 border-t border-brand-border">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm text-brand-text-secondary mb-1 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-brand-background border border-brand-border rounded-md px-3 py-1.5 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-brand-text-secondary mb-1 block">
                    Platform
                  </label>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="bg-brand-background border border-brand-border rounded-md px-3 py-1.5 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="google">Google</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-brand-text-secondary mb-1 block">
                  Properties
                </label>
                <div className="w-full max-w-md">
                  <PropertySelector
                    listings={mockListings}
                    selectedListings={selectedListings}
                    onSelectionChange={setSelectedListings}
                    placeholder="Filter by properties..."
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-background border-b border-brand-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Listing
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Platform
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("ctr")}
                >
                  <div className="flex items-center gap-1">
                    CTR
                    {sortField === "ctr" &&
                      (sortDirection === "desc" ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronUpIcon className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("cost")}
                >
                  <div className="flex items-center gap-1">
                    Cost
                    {sortField === "cost" &&
                      (sortDirection === "desc" ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronUpIcon className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("conversions")}
                >
                  <div className="flex items-center gap-1">
                    Conversions
                    {sortField === "conversions" &&
                      (sortDirection === "desc" ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronUpIcon className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-brand-background/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-brand-text-primary">
                        {campaign.listingAddress}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {campaign.headline}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <span className="text-sm text-brand-text-primary capitalize">
                        {campaign.platform}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-brand-text-primary">
                        {campaign.metrics.ctr.toFixed(2)}%
                      </span>
                      {campaign.metrics.ctr > 5 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : campaign.metrics.ctr < 3 ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-text-primary">
                    ${campaign.metrics.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-text-primary">
                    {campaign.metrics.conversions}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="p-1.5 text-brand-text-secondary hover:text-brand-primary transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(campaign)}
                        className="p-1.5 text-brand-text-secondary hover:text-brand-primary transition-colors"
                        title="Duplicate Campaign"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      {campaign.status === "running" ? (
                        <button
                          className="p-1.5 text-brand-text-secondary hover:text-yellow-600 transition-colors"
                          title="Pause Campaign"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      ) : campaign.status === "paused" ? (
                        <button
                          className="p-1.5 text-brand-text-secondary hover:text-green-600 transition-colors"
                          title="Resume Campaign"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {showDuplicateModal && duplicateCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setShowDuplicateModal(false)}
          />
          <div className="relative bg-brand-panel rounded-xl shadow-xl max-w-2xl w-full p-6 z-10">
            <h3 className="text-xl font-bold text-brand-text-primary mb-4">
              Duplicate Campaign Strategy
            </h3>
            <div className="mb-6">
              <p className="text-sm text-brand-text-secondary mb-4">
                You're about to duplicate the campaign strategy from:
              </p>
              <div className="bg-brand-background rounded-lg p-4 mb-4">
                <p className="font-medium text-brand-text-primary">
                  {duplicateCampaign.listingAddress}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-brand-text-secondary">
                  <span className="flex items-center gap-1">
                    {getPlatformIcon(duplicateCampaign.platform)}
                    <span className="capitalize">
                      {duplicateCampaign.platform}
                    </span>
                  </span>
                  <span>CTR: {duplicateCampaign.metrics.ctr.toFixed(2)}%</span>
                  <span>
                    {duplicateCampaign.metrics.conversions} conversions
                  </span>
                </div>
              </div>
              <p className="text-sm text-brand-text-secondary mb-4">
                Select which listings you'd like to apply this successful
                campaign to:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campaigns
                  .filter((c) => c.listingId !== duplicateCampaign.listingId)
                  .map((listing) => (
                    <label
                      key={listing.id}
                      className="flex items-center gap-3 p-3 bg-brand-background rounded-lg hover:bg-brand-card transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-brand-text-primary">
                        {listing.listingAddress}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDuplicateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert("Campaign strategy duplicated successfully!");
                  setShowDuplicateModal(false);
                }}
              >
                Duplicate to Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidAdsDashboard;
