import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';
import DashboardWrapper from '../shared/DashboardWrapper';
import DashboardSection from '../shared/DashboardSection';
import MetricCard from '../shared/MetricCard';
import { LineChart } from '../shared/charts';

// Simple test data
const testData = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 150 },
  { month: 'Mar', value: 120 },
  { month: 'Apr', value: 180 },
  { month: 'May', value: 200 }
];

const PortfolioAnalyticsMinimal: React.FC = () => {
  console.log('🔍 Minimal Portfolio Analytics rendering...');

  return (
    <DashboardWrapper
      title="Portfolio Analytics - Minimal Test"
      subtitle="Testing with one simple chart"
    >
      {/* Basic metric */}
      <DashboardSection title="Test Metrics" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Test Value"
            value={1000000}
            icon={<CurrencyDollarIcon />}
            prefix="$"
            formatValue={(value) => (value as number).toLocaleString()}
            variant="elevated"
          />
        </div>
      </DashboardSection>

      {/* Test chart */}
      <DashboardSection title="Test Chart" className="mb-6">
        <div className="h-80">
          <LineChart
            data={testData}
            lines={[{ key: 'value', color: '#3B82F6', name: 'Test Values' }]}
            xAxisKey="month"
            title="Simple Line Chart Test"
          />
        </div>
      </DashboardSection>
    </DashboardWrapper>
  );
};

export default PortfolioAnalyticsMinimal;