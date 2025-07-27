import React, { useState, useMemo } from "react";
import PortfolioErrorBoundary from "../shared/PortfolioErrorBoundary";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { PlusIcon, FunnelIcon, MapIcon } from "@heroicons/react/24/outline";
import DashboardWrapper from "../shared/DashboardWrapper";
import DashboardSection from "../shared/DashboardSection";
import MetricCard from "../shared/MetricCard";
import TimePeriodSelector, {
  useTimePeriod,
} from "../shared/TimePeriodSelector";
import PropertySelector from "../shared/PropertySelector";
import AdvancedFilters, { FilterOptions } from "../shared/AdvancedFilters";
import PortfolioSummary from "../shared/PortfolioSummary";
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ScatterChart,
} from "../shared/charts";
import Button from "../shared/Button";
import { Listing } from "../../types";
import {
  mockListings,
  generateTimeSeriesData,
  generatePropertyPerformanceData,
  getMarketSegments,
  getGeographicData,
  generateAIInsights,
  generateLeadQualityData,
  getMarketingChannelData,
} from "../../data/mockPortfolioData";

// Enhanced data from centralized mock data with error handling
let timeSeriesData: any[] = [];
let propertyPerformanceData: any[] = [];
let marketSegments: any[] = [];
let geographicData: any[] = [];
let aiInsights: any[] = [];
let leadQualityData: any[] = [];
let marketingChannelData: any[] = [];

try {
  console.log("🔍 Generating portfolio data...");
  timeSeriesData = generateTimeSeriesData() || [];
  propertyPerformanceData = generatePropertyPerformanceData() || [];
  marketSegments = getMarketSegments() || [];
  geographicData = getGeographicData() || [];
  aiInsights = generateAIInsights() || [];
  leadQualityData = generateLeadQualityData() || [];
  marketingChannelData = getMarketingChannelData() || [];

  console.log("✅ Portfolio data generated:", {
    timeSeriesData: timeSeriesData.length,
    propertyPerformanceData: propertyPerformanceData.length,
    marketSegments: marketSegments.length,
    geographicData: geographicData.length,
    aiInsights: aiInsights.length,
    leadQualityData: leadQualityData.length,
    marketingChannelData: marketingChannelData.length,
  });
} catch (error) {
  console.error("🚨 Error generating portfolio data:", error);
}

// Calculate portfolio metrics from comprehensive data
const calculatePortfolioMetrics = (selectedListings: string[]) => {
  const selectedProperties = mockListings.filter((l) =>
    selectedListings.includes(l.id),
  );
  const totalValue = selectedProperties.reduce((sum, l) => sum + l.price, 0);
  const activeCount = selectedProperties.filter(
    (l) => l.status === "active",
  ).length;
  const soldCount = selectedProperties.filter(
    (l) => l.status === "sold",
  ).length;
  const pendingCount = selectedProperties.filter(
    (l) => l.status === "pending",
  ).length;

  // Calculate performance metrics from time series and property data
  const totalViews = timeSeriesData.reduce((sum, d) => sum + d.views, 0);
  const totalLeads = timeSeriesData.reduce((sum, d) => sum + d.leads, 0);
  const avgDaysOnMarket =
    timeSeriesData.reduce((sum, d) => sum + d.avgDaysOnMarket, 0) /
    timeSeriesData.length;

  return {
    totalRevenue: totalValue,
    totalViews,
    totalLeads,
    avgDaysOnMarket: Math.round(avgDaysOnMarket),
    conversionRate: Number(((totalLeads / totalViews) * 100).toFixed(1)),
    activeListings: activeCount,
    soldListings: soldCount,
    pendingListings: pendingCount,
    totalListings: selectedProperties.length,
    avgPricePerSqFt: Math.round(
      selectedProperties.reduce(
        (sum, l) => sum + l.price / l.squareFootage,
        0,
      ) / selectedProperties.length,
    ),
    totalSquareFootage: selectedProperties.reduce(
      (sum, l) => sum + l.squareFootage,
      0,
    ),
  };
};

// Property type distribution
const getPropertyTypeData = (selectedListings: string[]) => {
  const selectedProperties = mockListings.filter((l) =>
    selectedListings.includes(l.id),
  );
  const typeCount = selectedProperties.reduce(
    (acc, property) => {
      const type = property.propertyType || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const colors = {
    "single-family": "#4A55C7",
    condo: "#38A169",
    townhome: "#805AD5",
    other: "#F59E0B",
  };

  return Object.entries(typeCount).map(([type, count]) => ({
    name: type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    value: Math.round((count / selectedProperties.length) * 100),
    count,
    color: colors[type as keyof typeof colors] || colors.other,
  }));
};

// Price range analysis
const getPriceAnalysisData = (selectedListings: string[]) => {
  const selectedProperties = mockListings.filter((l) =>
    selectedListings.includes(l.id),
  );
  const ranges = [
    { label: "$500K-$1M", min: 500000, max: 1000000 },
    { label: "$1M-$1.5M", min: 1000000, max: 1500000 },
    { label: "$1.5M-$2M", min: 1500000, max: 2000000 },
    { label: "$2M-$3M", min: 2000000, max: 3000000 },
    { label: "$3M+", min: 3000000, max: Infinity },
  ];

  return ranges
    .map((range) => {
      const propertiesInRange = selectedProperties.filter(
        (p) => p.price >= range.min && p.price < range.max,
      );
      const avgDays =
        propertiesInRange.length > 0
          ? Math.round(
              propertiesInRange.reduce((sum, p) => {
                const performance = propertyPerformanceData.find(
                  (perf) => perf.listingId === p.id,
                );
                return sum + (performance?.daysOnMarket || 30);
              }, 0) / propertiesInRange.length,
            )
          : 0;

      return {
        range: range.label,
        count: propertiesInRange.length,
        avgDays,
        avgPrice:
          propertiesInRange.length > 0
            ? Math.round(
                propertiesInRange.reduce((sum, p) => sum + p.price, 0) /
                  propertiesInRange.length,
              )
            : 0,
      };
    })
    .filter((range) => range.count > 0);
};

const PortfolioAnalyticsDashboard: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod } = useTimePeriod("30D");
  const [selectedListings, setSelectedListings] = useState<string[]>(
    mockListings.map((l) => l.id),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    priceRange: { min: null, max: null },
    propertyTypes: [],
    statuses: [],
    locations: [],
    marketSegments: [],
    dateRange: { start: null, end: null },
  });

  // Get available filter options from data with defensive programming
  const availablePropertyTypes = Array.from(
    new Set(mockListings.map((l) => l.propertyType).filter(Boolean)),
  );
  const availableStatuses = Array.from(
    new Set(mockListings.map((l) => l.status).filter(Boolean)),
  );
  const availableLocations = Array.from(
    new Set(
      mockListings
        .filter((l) => l.city && l.state)
        .map((l) => `${l.city}, ${l.state}`),
    ),
  );

  // Apply advanced filters to listings
  const filteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
      // Price range filter
      if (
        advancedFilters.priceRange.min &&
        listing.price < advancedFilters.priceRange.min
      )
        return false;
      if (
        advancedFilters.priceRange.max &&
        listing.price > advancedFilters.priceRange.max
      )
        return false;

      // Property type filter
      if (
        advancedFilters.propertyTypes.length > 0 &&
        !advancedFilters.propertyTypes.includes(listing.propertyType || "")
      )
        return false;

      // Status filter with defensive programming
      if (
        advancedFilters.statuses.length > 0 &&
        listing.status &&
        !advancedFilters.statuses.includes(listing.status)
      )
        return false;

      // Location filter with defensive programming
      if (advancedFilters.locations.length > 0) {
        if (!listing.city || !listing.state) return false;
        const location = `${listing.city}, ${listing.state}`;
        if (!advancedFilters.locations.includes(location)) return false;
      }

      // Market segment filter
      if (advancedFilters.marketSegments.length > 0) {
        const price = listing.price;
        const segments = [];
        if (price >= 2000000) segments.push("Luxury ($2M+)");
        if (price >= 500000 && price < 2000000)
          segments.push("Mid-Market ($500K-$2M)");
        if (price < 500000) segments.push("Entry-Level (<$500K)");

        if (
          !segments.some((segment) =>
            advancedFilters.marketSegments.includes(segment),
          )
        )
          return false;
      }

      return true;
    });
  }, [advancedFilters]);

  // Update selected listings when filters change
  const finalSelectedListings = useMemo(() => {
    const filteredIds = filteredListings.map((l) => l.id);
    return selectedListings.filter((id) => filteredIds.includes(id));
  }, [selectedListings, filteredListings]);

  const clearAllFilters = () => {
    setAdvancedFilters({
      priceRange: { min: null, max: null },
      propertyTypes: [],
      statuses: [],
      locations: [],
      marketSegments: [],
      dateRange: { start: null, end: null },
    });
    setSelectedListings(mockListings.map((l) => l.id));
  };

  // Enhanced filtered metrics with comprehensive calculations
  const filteredMetrics = useMemo(() => {
    return calculatePortfolioMetrics(finalSelectedListings);
  }, [finalSelectedListings]);

  // Dynamic data based on current selections
  const propertyTypeData = useMemo(
    () => getPropertyTypeData(finalSelectedListings),
    [finalSelectedListings],
  );
  const priceAnalysisData = useMemo(
    () => getPriceAnalysisData(finalSelectedListings),
    [finalSelectedListings],
  );

  // Filter performance data based on selected listings
  const filteredPerformanceData = useMemo(() => {
    return propertyPerformanceData.filter((perf) =>
      finalSelectedListings.includes(perf.listingId),
    );
  }, [finalSelectedListings]);

  // Market segment data for selected properties
  const selectedMarketSegments = useMemo(() => {
    const selectedProperties = mockListings.filter((l) =>
      finalSelectedListings.includes(l.id),
    );
    const luxury = selectedProperties.filter((l) => l.price >= 2000000);
    const midMarket = selectedProperties.filter(
      (l) => l.price >= 500000 && l.price < 2000000,
    );
    const entryLevel = selectedProperties.filter((l) => l.price < 500000);

    return [
      {
        name: "Luxury ($2M+)",
        value: luxury.length,
        color: "#4A55C7",
        percentage: Math.round(
          (luxury.length / selectedProperties.length) * 100,
        ),
      },
      {
        name: "Mid-Market",
        value: midMarket.length,
        color: "#38A169",
        percentage: Math.round(
          (midMarket.length / selectedProperties.length) * 100,
        ),
      },
      {
        name: "Entry-Level",
        value: entryLevel.length,
        color: "#805AD5",
        percentage: Math.round(
          (entryLevel.length / selectedProperties.length) * 100,
        ),
      },
    ].filter((segment) => segment.value > 0);
  }, [finalSelectedListings]);

  // Enhanced insights with current data
  const currentInsights = useMemo(() => {
    const insights = generateAIInsights();
    // Add dynamic insights based on current selection
    const topPerformer = filteredPerformanceData.reduce(
      (max, current) =>
        current.conversionRate > max.conversionRate ? current : max,
      filteredPerformanceData[0] || { conversionRate: 0, property: "N/A" },
    );

    return {
      ...insights,
      topPerformer: {
        ...insights.topPerformer,
        property: topPerformer?.property || "N/A",
        insight: `${topPerformer?.property || "N/A"} is leading with ${topPerformer?.conversionRate || 0}% conversion rate and ${topPerformer?.leads || 0} leads generated.`,
      },
    };
  }, [filteredPerformanceData]);

  // Scatter plot data for price vs performance analysis
  const pricePerformanceData = useMemo(() => {
    return mockListings
      .filter((l) => finalSelectedListings.includes(l.id))
      .map((listing) => {
        const performance = propertyPerformanceData.find(
          (p) => p.listingId === listing.id,
        );
        return {
          x: listing.price,
          y: performance?.conversionRate || 0,
          name: listing.address.split(",")[0],
          size: performance?.views || 0,
          category: listing.propertyType,
          daysOnMarket: performance?.daysOnMarket || 0,
          leads: performance?.leads || 0,
        };
      });
  }, [finalSelectedListings]);

  const getListingDisplayName = (listing: Listing) => {
    return `${listing.address?.split(",")[0] || "Unknown"} - ${listing.city || ""}`;
  };

  // Helper functions for status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "withdrawn":
        return "bg-red-100 text-red-800 border-red-300";
      case "coming_soon":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "sold":
        return "Sold";
      case "pending":
        return "Pending";
      case "withdrawn":
        return "Withdrawn";
      case "coming_soon":
        return "Coming Soon";
      default:
        return "Unknown";
    }
  };

  return (
    <PortfolioErrorBoundary>
      <DashboardWrapper
        title="Portfolio Analytics"
        subtitle="Comprehensive view of your property portfolio performance"
        showFilters={true}
        showExport={true}
        onFilterToggle={() => setShowFilters(!showFilters)}
        onExport={() =>
          alert(
            "Export portfolio report functionality would be implemented here",
          )
        }
        actions={
          <Button variant="primary" leftIcon={<PlusIcon className="h-4 w-4" />}>
            Add Property
          </Button>
        }
        filters={
          showFilters ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-brand-text-secondary">
                    Time Period:
                  </label>
                  <TimePeriodSelector
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    variant="pills"
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-brand-text-secondary">
                    Properties:
                  </label>
                  <div className="min-w-[300px]">
                    <PropertySelector
                      listings={filteredListings}
                      selectedListings={selectedListings}
                      onSelectionChange={setSelectedListings}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={showAdvancedFilters ? "primary" : "secondary"}
                    size="sm"
                    leftIcon={<FunnelIcon className="h-4 w-4" />}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    Advanced Filters
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-4">
                  <AdvancedFilters
                    filters={advancedFilters}
                    onFiltersChange={setAdvancedFilters}
                    availablePropertyTypes={availablePropertyTypes}
                    availableStatuses={availableStatuses}
                    availableLocations={availableLocations}
                    onClearAll={clearAllFilters}
                  />
                </div>
              )}

              {/* Filter Summary */}
              {(finalSelectedListings.length !== mockListings.length ||
                Object.values(advancedFilters).some((v) =>
                  Array.isArray(v) ? v.length > 0 : v !== null,
                )) && (
                <div className="text-sm text-brand-text-secondary mt-2">
                  Showing data for {finalSelectedListings.length} of{" "}
                  {mockListings.length} properties
                  {filteredListings.length !== mockListings.length && (
                    <span>
                      {" "}
                      • {filteredListings.length} match current filters
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : undefined
        }
      >
        {/* Portfolio Summary */}
        <PortfolioSummary
          totalProperties={finalSelectedListings.length}
          totalValue={filteredMetrics.totalRevenue}
          activeFilters={{
            priceRange: advancedFilters.priceRange,
            propertyTypes: advancedFilters.propertyTypes,
            statuses: advancedFilters.statuses,
            locations: advancedFilters.locations,
            marketSegments: advancedFilters.marketSegments,
          }}
          performanceStats={{
            totalViews: filteredMetrics.totalViews,
            totalLeads: filteredMetrics.totalLeads,
            avgConversionRate: filteredMetrics.conversionRate,
            avgDaysOnMarket: filteredMetrics.avgDaysOnMarket,
          }}
          marketSegmentBreakdown={{
            luxury: mockListings.filter(
              (l) => finalSelectedListings.includes(l.id) && l.price >= 2000000,
            ).length,
            midMarket: mockListings.filter(
              (l) =>
                finalSelectedListings.includes(l.id) &&
                l.price >= 500000 &&
                l.price < 2000000,
            ).length,
            entryLevel: mockListings.filter(
              (l) => finalSelectedListings.includes(l.id) && l.price < 500000,
            ).length,
          }}
        />

        {/* Portfolio Overview Metrics */}
        <DashboardSection title="Portfolio Overview" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Portfolio Value"
              value={filteredMetrics.totalRevenue}
              change={12.5}
              changeLabel="vs last month"
              icon={<CurrencyDollarIcon />}
              prefix="$"
              formatValue={(value) => (value as number).toLocaleString()}
              variant="elevated"
            />

            <MetricCard
              title="Active Listings"
              value={filteredMetrics.activeListings}
              previousValue={filteredMetrics.activeListings + 1}
              icon={<HomeIcon />}
              variant="elevated"
              suffix={` of ${filteredMetrics.totalListings}`}
            />

            <MetricCard
              title="Total Page Views"
              value={filteredMetrics.totalViews}
              change={8.7}
              changeLabel="this month"
              icon={<EyeIcon />}
              formatValue={(value) => (value as number).toLocaleString()}
              variant="elevated"
            />

            <MetricCard
              title="Lead Conversion"
              value={filteredMetrics.conversionRate}
              change={1.2}
              suffix="%"
              icon={<ChartBarIcon />}
              variant="elevated"
            />
          </div>
        </DashboardSection>

        {/* Performance Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardSection>
            <LineChart
              data={timeSeriesData}
              title="Portfolio Performance Trends"
              subtitle="12-month view of views, leads, and revenue"
              height={350}
              lines={[
                { key: "views", color: "#4A55C7", name: "Page Views" },
                { key: "leads", color: "#38A169", name: "Leads" },
                { key: "showings", color: "#805AD5", name: "Showings" },
              ]}
              formatTooltip={(value, name) => {
                if (name === "Page Views") return value.toLocaleString();
                if (name === "Leads") return `${value} leads`;
                if (name === "Showings") return `${value} showings`;
                return value.toString();
              }}
            />
          </DashboardSection>

          <DashboardSection>
            <BarChart
              data={filteredPerformanceData.slice(0, 8)}
              title="Property Performance Comparison"
              subtitle={`Top ${Math.min(8, filteredPerformanceData.length)} performing properties`}
              height={350}
              xAxisKey="property"
              bars={[
                { key: "views", color: "#805AD5", name: "Views" },
                { key: "leads", color: "#38A169", name: "Leads" },
                { key: "showings", color: "#F59E0B", name: "Showings" },
              ]}
              formatTooltip={(value) => value.toLocaleString()}
            />
          </DashboardSection>
        </div>

        {/* Marketing Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardSection>
            <BarChart
              data={marketingChannelData}
              title="Marketing Channel Performance"
              subtitle="Lead generation and ROI by channel"
              height={350}
              xAxisKey="channel"
              bars={[
                { key: "leads", color: "#38A169", name: "Leads" },
                { key: "roi", color: "#4A55C7", name: "ROI" },
              ]}
              formatTooltip={(value, name) => {
                if (name === "ROI")
                  return typeof value === "string" ? value : `${value}x`;
                return value.toLocaleString();
              }}
            />
          </DashboardSection>

          <DashboardSection>
            <PieChart
              data={leadQualityData}
              title="Lead Quality Distribution"
              subtitle="Hot, warm, and cold lead breakdown"
              height={350}
              showLabels={true}
              legendPosition="bottom"
              dataKey="count"
              nameKey="quality"
            />
          </DashboardSection>
        </div>

        {/* Performance Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <DashboardSection>
            <PieChart
              data={propertyTypeData}
              title="Portfolio Composition"
              subtitle="Distribution by property type"
              height={300}
              showLabels={true}
              legendPosition="bottom"
            />
          </DashboardSection>

          <DashboardSection>
            <ScatterChart
              data={pricePerformanceData}
              title="Price vs Performance Analysis"
              subtitle="Relationship between price and conversion rate"
              height={300}
              xAxisLabel="Price ($)"
              yAxisLabel="Conversion Rate (%)"
              categoryKey="category"
              formatTooltip={(data) => `
              ${data.name}
              Price: $${data.x?.toLocaleString()}
              Conversion: ${data.y}%
              Views: ${data.size?.toLocaleString()}
              Days on Market: ${data.daysOnMarket}
            `}
            />
          </DashboardSection>

          <DashboardSection title="Key Insights" padding="md">
            <div className="space-y-4">
              <div className="p-4 bg-brand-background rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-brand-text-primary">
                    Top Performer
                  </span>
                </div>
                <p className="text-sm text-brand-text-secondary">
                  456 Oak Avenue is generating 52 leads with highest engagement
                  rate at 4.2%
                </p>
              </div>

              <div className="p-4 bg-brand-background rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-brand-text-primary">
                    Market Timing
                  </span>
                </div>
                <p className="text-sm text-brand-text-secondary">
                  Properties in $2M+ range are selling 25% faster than average
                  market time
                </p>
              </div>

              <div className="p-4 bg-brand-background rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingDownIcon className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-brand-text-primary">
                    Attention Needed
                  </span>
                </div>
                <p className="text-sm text-brand-text-secondary">
                  321 Elm Street views down 15% - consider refreshing photos or
                  adjusting price
                </p>
              </div>
            </div>
          </DashboardSection>
        </div>

        {/* Property Details Table */}
        <DashboardSection
          title="Property Performance Details"
          subtitle={`${finalSelectedListings.length} properties selected`}
          actions={
            <Button variant="secondary" size="sm">
              Export Details
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-background border-b border-brand-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Property
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {mockListings
                  .filter((listing) =>
                    finalSelectedListings.includes(listing.id),
                  )
                  .map((listing) => {
                    const performance = propertyPerformanceData.find(
                      (p) => p.listingId === listing.id,
                    );

                    return (
                      <tr
                        key={listing.id}
                        className="hover:bg-brand-background/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-brand-text-primary">
                              {listing.address?.split(",")[0]}
                            </p>
                            <p className="text-xs text-brand-text-secondary">
                              {listing.city && listing.state
                                ? `${listing.city}, ${listing.state}`
                                : "Location not specified"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              listing.status || "unknown",
                            )}`}
                          >
                            {getStatusLabel(listing.status || "unknown")}
                          </span>
                          {performance && performance.daysOnMarket > 0 && (
                            <div className="text-xs text-brand-text-tertiary mt-1">
                              {performance.daysOnMarket} days on market
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-brand-text-primary">
                          ${listing.price?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-brand-text-primary">
                          {performance?.views.toLocaleString() || "0"}
                        </td>
                        <td className="px-4 py-3 text-sm text-brand-text-primary">
                          {performance?.leads || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-brand-text-primary">
                          {performance?.conversionRate || 0}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      </DashboardWrapper>
    </PortfolioErrorBoundary>
  );
};

export default PortfolioAnalyticsDashboard;
