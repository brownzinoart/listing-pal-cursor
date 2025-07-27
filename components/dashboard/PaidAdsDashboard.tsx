import React, { useState, useMemo, useEffect } from "react";
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
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { SparklesIcon } from "@heroicons/react/24/outline";
import CampaignDetailModal from "./CampaignDetailModal";
import Button from "../shared/Button";
import PropertySelector from "../shared/PropertySelector";
import ViewToggle, { ViewMode } from "../shared/ViewToggle";
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

type DisplayMode = ViewMode;

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    // Default to cards on mobile, allow saved preference on desktop
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return "cards";

      const savedView = localStorage.getItem("paidAdsDisplayMode");
      return (savedView as DisplayMode) || "cards";
    }
    return "cards";
  });

  // Save display preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paidAdsDisplayMode", displayMode);
    }
  }, [displayMode]);

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
      draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      running: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Table rendering for campaigns
  const renderCampaignsTable = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">
            Campaign Performance
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Listing & Campaign
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Platform
                </th>
                <th
                  className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("ctr")}
                >
                  <div className="flex items-center justify-center gap-1">
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
                  className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("cost")}
                >
                  <div className="flex items-center justify-center gap-1">
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
                  className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("conversions")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Conversions
                    {sortField === "conversions" &&
                      (sortDirection === "desc" ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronUpIcon className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-semibold">
                        {campaign.listingAddress}
                      </p>
                      <p className="text-slate-300 text-sm line-clamp-1">
                        {campaign.headline}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {campaign.objective}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <span className="text-white text-sm capitalize">
                        {campaign.platform}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white font-bold">
                        {campaign.metrics.ctr.toFixed(2)}%
                      </span>
                      {campaign.metrics.ctr > 5 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400" />
                      ) : campaign.metrics.ctr < 3 ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-rose-400" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-400 font-bold">
                      ${campaign.metrics.cost.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-white font-bold">
                      {campaign.metrics.conversions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(campaign)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Duplicate Campaign"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                      </button>
                      {campaign.status === "running" ? (
                        <button
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title="Pause Campaign"
                        >
                          <PauseIcon className="h-4 w-4 text-amber-400" />
                        </button>
                      ) : campaign.status === "paused" ? (
                        <button
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title="Resume Campaign"
                        >
                          <PlayIcon className="h-4 w-4 text-emerald-400" />
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
    </div>
  );

  // Card rendering for campaigns
  const renderCampaignsCards = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">
          Campaign Performance
        </h3>

        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-semibold text-white">
                      {campaign.headline}
                    </h4>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {getPlatformIcon(campaign.platform)}{" "}
                      {campaign.platform.charAt(0).toUpperCase() +
                        campaign.platform.slice(1)}
                    </span>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <p className="text-slate-400 text-sm mb-3">
                    {campaign.listingAddress}
                  </p>
                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                    {campaign.body}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <span>{campaign.objective}</span>
                    <span>${campaign.budget} budget</span>
                    <span>{campaign.metrics.ctr.toFixed(2)}% CTR</span>
                    <span>${campaign.metrics.cost.toFixed(2)} spent</span>
                    <span>{campaign.metrics.conversions} conversions</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4 text-slate-400 hover:text-white" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                    title="Copy campaign"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 text-slate-400 hover:text-white" />
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<DocumentDuplicateIcon className="h-4 w-4" />}
                  >
                    Duplicate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Paid Advertising Center
              </h2>
              <p className="text-slate-400">
                Optimize and track your digital advertising campaigns
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="glass"
                glowColor="emerald"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
              >
                AI Optimize
              </Button>
              <Button
                variant="gradient"
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Campaign
              </Button>
            </div>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CurrencyDollarIcon className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold text-white">
                  ${overallMetrics.totalSpend.toFixed(2)}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Spend</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {overallMetrics.avgCTR.toFixed(2)}%
                </span>
              </div>
              <p className="text-slate-400 text-sm">Avg. CTR</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {overallMetrics.totalConversions}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Conversions</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="h-8 w-8 text-amber-400" />
                <span className="text-2xl font-bold text-white">
                  {overallMetrics.totalImpressions.toLocaleString()}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Impressions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                variant="glass"
                size="sm"
                leftIcon={<FunnelIcon className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>

            {/* Display Mode Toggle */}
            <ViewToggle
              viewMode={displayMode}
              onViewModeChange={setDisplayMode}
            />
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Platform
                  </label>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-slate-300 mb-2 block">
                    Properties
                  </label>
                  <div className="w-full">
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
            </div>
          )}
        </div>
      </div>

      {/* Campaign Content - Conditional Rendering */}
      {displayMode === "table"
        ? renderCampaignsTable()
        : renderCampaignsCards()}

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-white mb-2">No campaigns found</p>
              <p className="text-slate-400 mb-6">
                {searchTerm ||
                statusFilter !== "all" ||
                platformFilter !== "all" ||
                selectedListings.length < mockListings.length
                  ? "Try adjusting your filters or search terms."
                  : "Start by creating your first advertising campaign."}
              </p>
              <Button
                variant="gradient"
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {showDuplicateModal && duplicateCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDuplicateModal(false)}
          />
          <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full p-8 z-10">
            <h3 className="text-2xl font-bold text-white mb-6">
              Duplicate Campaign Strategy
            </h3>
            <div className="mb-6">
              <p className="text-slate-300 mb-4">
                You're about to duplicate the campaign strategy from:
              </p>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
                <p className="font-semibold text-white text-lg">
                  {duplicateCampaign.listingAddress}
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    {getPlatformIcon(duplicateCampaign.platform)}
                    <span className="capitalize">
                      {duplicateCampaign.platform}
                    </span>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    CTR: {duplicateCampaign.metrics.ctr.toFixed(2)}%
                  </span>
                  <span className="text-slate-300">
                    {duplicateCampaign.metrics.conversions} conversions
                  </span>
                  <span className="text-slate-300">
                    ${duplicateCampaign.metrics.cost.toFixed(2)} spent
                  </span>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                Select which listings you'd like to apply this successful
                campaign to:
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {campaigns
                  .filter((c) => c.listingId !== duplicateCampaign.listingId)
                  .map((listing) => (
                    <label
                      key={listing.id}
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-white">
                        {listing.listingAddress}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="glass"
                onClick={() => setShowDuplicateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
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
