import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  HomeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import DashboardWrapper from "../shared/DashboardWrapper";
import DashboardSection from "../shared/DashboardSection";
import MetricCard from "../shared/MetricCard";
import ProgressRing, { MultiProgressRing } from "../shared/ProgressRing";
import TimePeriodSelector, {
  useTimePeriod,
  TimePeriod,
} from "../shared/TimePeriodSelector";
import { LineChart, BarChart, PieChart, AreaChart } from "../shared/charts";
import Button from "../shared/Button";

// Mock data for charts
const revenueData = [
  { date: "Jan", revenue: 4000, profit: 2400, expenses: 1600 },
  { date: "Feb", revenue: 3000, profit: 1398, expenses: 1602 },
  { date: "Mar", revenue: 2000, profit: 9800, expenses: 2000 },
  { date: "Apr", revenue: 2780, profit: 3908, expenses: 1780 },
  { date: "May", revenue: 1890, profit: 4800, expenses: 1890 },
  { date: "Jun", revenue: 2390, profit: 3800, expenses: 2390 },
  { date: "Jul", revenue: 3490, profit: 4300, expenses: 3490 },
];

const propertyTypeData = [
  { name: "Single Family", value: 45, color: "#4A55C7" },
  { name: "Condos", value: 30, color: "#38A169" },
  { name: "Townhomes", value: 15, color: "#805AD5" },
  { name: "Multi-Family", value: 10, color: "#D69E2E" },
];

const monthlyLeadsData = [
  { month: "Jan", leads: 120 },
  { month: "Feb", leads: 98 },
  { month: "Mar", leads: 145 },
  { month: "Apr", leads: 167 },
  { month: "May", leads: 189 },
  { month: "Jun", leads: 203 },
];

const conversionData = [
  { date: "Week 1", conversions: 24, inquiries: 120 },
  { date: "Week 2", conversions: 35, inquiries: 145 },
  { date: "Week 3", conversions: 42, inquiries: 167 },
  { date: "Week 4", conversions: 38, inquiries: 189 },
];

const trafficChannels = [
  { label: "Organic Search", value: 65, color: "#4A55C7" },
  { label: "Direct", value: 85, color: "#38A169" },
  { label: "Social Media", value: 45, color: "#805AD5" },
];

const EnhancedDashboardDemo: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod } = useTimePeriod("7D");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <DashboardWrapper
      title="Enhanced Dashboard Demo"
      subtitle="Showcasing the new dashboard components and design patterns"
      showFilters={true}
      showExport={true}
      onFilterToggle={() => setShowFilters(!showFilters)}
      onExport={() => alert("Export functionality would be implemented here")}
      actions={<Button variant="primary">Create New</Button>}
      filters={
        showFilters ? (
          <div className="flex flex-wrap items-center gap-4">
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              variant="pills"
              size="sm"
            />
            <select className="bg-brand-panel border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary">
              <option>All Properties</option>
              <option>Active Listings</option>
              <option>Sold Properties</option>
            </select>
          </div>
        ) : undefined
      }
    >
      {/* Overview Metrics */}
      <DashboardSection title="Overview Metrics" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={125340}
            change={12.5}
            changeLabel="vs last month"
            icon={<CurrencyDollarIcon />}
            prefix="$"
            formatValue={(value) => value.toLocaleString()}
            variant="elevated"
          />

          <MetricCard
            title="Active Listings"
            value={47}
            change={-3.2}
            changeLabel="vs last week"
            icon={<HomeIcon />}
            trendDirection="down"
            variant="elevated"
          />

          <MetricCard
            title="Page Views"
            value={89234}
            change={8.7}
            icon={<EyeIcon />}
            formatValue={(value) => value.toLocaleString()}
            variant="elevated"
          />

          <MetricCard
            title="Conversion Rate"
            value={3.4}
            change={1.2}
            suffix="%"
            icon={<ChartBarIcon />}
            variant="elevated"
          />
        </div>
      </DashboardSection>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardSection>
          <LineChart
            data={revenueData}
            title="Revenue & Profit Trends"
            subtitle="Monthly performance over time"
            height={300}
            lines={[
              { key: "revenue", color: "#4A55C7", name: "Revenue" },
              { key: "profit", color: "#38A169", name: "Profit" },
            ]}
            formatTooltip={(value) => `$${value.toLocaleString()}`}
          />
        </DashboardSection>

        <DashboardSection>
          <BarChart
            data={monthlyLeadsData}
            title="Monthly Leads"
            subtitle="Lead generation performance"
            height={300}
            xAxisKey="month"
            bars={[{ key: "leads", color: "#805AD5", name: "Leads" }]}
          />
        </DashboardSection>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <DashboardSection>
          <PieChart
            data={propertyTypeData}
            title="Properties by Type"
            height={300}
            showLabels={true}
            legendPosition="bottom"
          />
        </DashboardSection>

        <DashboardSection>
          <AreaChart
            data={conversionData}
            title="Conversion Trends"
            height={300}
            areas={[
              { key: "conversions", color: "#38A169", name: "Conversions" },
              {
                key: "inquiries",
                color: "#4A55C7",
                name: "Inquiries",
                fillOpacity: 0.2,
              },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Performance Indicators" padding="md">
          <div className="space-y-6">
            {/* Single Progress Ring */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-brand-text-secondary mb-3">
                Satisfaction Rate
              </h4>
              <ProgressRing
                progress={87}
                size="lg"
                color="success"
                label="Customer Satisfaction"
              />
            </div>

            {/* Multi Progress Ring */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-brand-text-secondary mb-3">
                Traffic Sources
              </h4>
              <MultiProgressRing data={trafficChannels} size="md" />
              <div className="mt-3 space-y-1">
                {trafficChannels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-brand-text-secondary">
                        {channel.label}
                      </span>
                    </div>
                    <span className="text-brand-text-primary font-medium">
                      {channel.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardSection>
      </div>

      {/* Additional Features */}
      <DashboardSection
        title="Recent Activity"
        subtitle="Latest updates and notifications"
        actions={
          <Button variant="ghost" size="sm">
            View All
          </Button>
        }
        collapsible={true}
      >
        <div className="space-y-4">
          {[
            {
              icon: <HomeIcon className="h-5 w-5" />,
              title: "New listing added",
              time: "2 hours ago",
              color: "text-blue-500",
            },
            {
              icon: <UserGroupIcon className="h-5 w-5" />,
              title: "Client meeting scheduled",
              time: "4 hours ago",
              color: "text-green-500",
            },
            {
              icon: <ChartBarIcon className="h-5 w-5" />,
              title: "Monthly report generated",
              time: "1 day ago",
              color: "text-purple-500",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-brand-background rounded-lg"
            >
              <div className={`${item.color}`}>{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text-primary">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ClockIcon className="h-3 w-3 text-brand-text-tertiary" />
                  <span className="text-xs text-brand-text-tertiary">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>
    </DashboardWrapper>
  );
};

export default EnhancedDashboardDemo;
