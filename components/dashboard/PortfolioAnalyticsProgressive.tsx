import React, { useState, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  CurrencyDollarIcon,
  HomeIcon,
  EyeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import PortfolioErrorBoundary from "../shared/PortfolioErrorBoundary";
import DashboardWrapper from "../shared/DashboardWrapper";
import DashboardSection from "../shared/DashboardSection";
import MetricCard from "../shared/MetricCard";
import Button from "../shared/Button";

// Import mock data with ES6 imports
import {
  mockListings,
  generateTimeSeriesData,
  generatePropertyPerformanceData,
} from "../../data/mockPortfolioData";

// Generate data with error handling
let timeSeriesData: any[] = [];
let propertyPerformanceData: any[] = [];

try {
  console.log("🔍 Testing mock data imports...");
  timeSeriesData = generateTimeSeriesData();
  propertyPerformanceData = generatePropertyPerformanceData();
  console.log("✅ Mock data loaded successfully:", {
    mockListings: mockListings.length,
    timeSeriesData: timeSeriesData.length,
    propertyPerformanceData: propertyPerformanceData.length,
  });
} catch (error) {
  console.error("🚨 Error generating mock data:", error);
  timeSeriesData = [];
  propertyPerformanceData = [];
}

const PortfolioAnalyticsProgressive: React.FC = () => {
  console.log("🔍 Progressive component rendering...");

  const [testStep, setTestStep] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate basic metrics with error handling
  const basicMetrics = useMemo(() => {
    try {
      if (mockListings.length === 0) {
        return {
          totalRevenue: 0,
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          totalLeads: 0,
          conversionRate: 0,
        };
      }

      const totalRevenue = mockListings.reduce(
        (sum, l) => sum + (l.price || 0),
        0,
      );
      const activeListings = mockListings.filter(
        (l) => l.status === "active",
      ).length;
      const totalViews = timeSeriesData.reduce(
        (sum, d) => sum + (d.views || 0),
        0,
      );
      const totalLeads = timeSeriesData.reduce(
        (sum, d) => sum + (d.leads || 0),
        0,
      );
      const conversionRate =
        totalViews > 0
          ? Number(((totalLeads / totalViews) * 100).toFixed(1))
          : 0;

      return {
        totalRevenue,
        totalListings: mockListings.length,
        activeListings,
        totalViews,
        totalLeads,
        conversionRate,
      };
    } catch (error) {
      console.error("🚨 Error calculating metrics:", error);
      return {
        totalRevenue: 0,
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalLeads: 0,
        conversionRate: 0,
      };
    }
  }, []);

  const renderStepContent = () => {
    switch (testStep) {
      case 1:
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h2 className="text-xl font-bold mb-2">
              ✅ Step 1: Basic Component Structure
            </h2>
            <p>DashboardWrapper and basic structure is working!</p>
            <p className="mt-2">
              Data loaded: {mockListings.length} properties
            </p>
          </div>
        );

      case 2:
        return (
          <PortfolioErrorBoundary>
            <DashboardSection
              title="Step 2: Metric Cards Test"
              className="mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Portfolio Value"
                  value={basicMetrics.totalRevenue}
                  icon={<CurrencyDollarIcon />}
                  prefix="$"
                  formatValue={(value) => (value as number).toLocaleString()}
                  variant="elevated"
                />

                <MetricCard
                  title="Active Properties"
                  value={basicMetrics.activeListings}
                  icon={<HomeIcon />}
                  variant="elevated"
                  suffix={` of ${basicMetrics.totalListings}`}
                />

                <MetricCard
                  title="Total Page Views"
                  value={basicMetrics.totalViews}
                  icon={<EyeIcon />}
                  formatValue={(value) => (value as number).toLocaleString()}
                  variant="elevated"
                />

                <MetricCard
                  title="Lead Conversion"
                  value={basicMetrics.conversionRate}
                  suffix="%"
                  icon={<ChartBarIcon />}
                  variant="elevated"
                />
              </div>
            </DashboardSection>
          </PortfolioErrorBoundary>
        );

      case 3:
        return (
          <PortfolioErrorBoundary>
            <div className="space-y-6">
              <DashboardSection title="Step 3: Data Table Test">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {mockListings.slice(0, 5).map((listing) => (
                        <tr
                          key={listing.id}
                          className="hover:bg-brand-background/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-brand-text-primary">
                                {listing.address?.split(",")[0] || "Unknown"}
                              </p>
                              <p className="text-xs text-brand-text-secondary">
                                {listing.city && listing.state
                                  ? `${listing.city}, ${listing.state}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
                              {listing.status || "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-brand-text-primary">
                            ${(listing.price || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardSection>
            </div>
          </PortfolioErrorBoundary>
        );

      default:
        return (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <h2 className="text-xl font-bold mb-2">
              🎉 All Basic Tests Passed!
            </h2>
            <p>Ready to test full Portfolio Analytics Dashboard.</p>
          </div>
        );
    }
  };

  return (
    <PortfolioErrorBoundary>
      <DashboardWrapper
        title="Portfolio Analytics - Progressive Test"
        subtitle={`Testing step ${testStep} of 3`}
        showFilters={false}
        showExport={false}
        onFilterToggle={() => setShowFilters(!showFilters)}
        onExport={() => alert("Export test")}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTestStep(Math.max(1, testStep - 1))}
              disabled={testStep === 1}
            >
              Previous Step
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setTestStep(Math.min(4, testStep + 1))}
              disabled={testStep === 4}
            >
              Next Step
            </Button>
          </div>
        }
      >
        <div className="mb-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h2 className="font-semibold">🧪 Progressive Testing Mode</h2>
            <p className="text-sm">
              Testing Portfolio Analytics components step by step. Current step:{" "}
              {testStep}/3. Check console for detailed logs.
            </p>
          </div>
        </div>

        {renderStepContent()}

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">📊 Debug Info:</h3>
          <ul className="text-sm space-y-1">
            <li>Properties loaded: {mockListings.length}</li>
            <li>Time series data points: {timeSeriesData.length}</li>
            <li>Performance data entries: {propertyPerformanceData.length}</li>
            <li>
              Total portfolio value: $
              {basicMetrics.totalRevenue.toLocaleString()}
            </li>
          </ul>
        </div>
      </DashboardWrapper>
    </PortfolioErrorBoundary>
  );
};

export default PortfolioAnalyticsProgressive;
