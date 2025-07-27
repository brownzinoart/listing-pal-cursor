import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

export interface LineChartDataPoint {
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  lines?: Array<{
    key: string;
    color?: string;
    name?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  xAxisKey?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  smooth?: boolean;
  formatTooltip?: (value: any, name: string, props: any) => React.ReactNode;
  formatXAxisLabel?: (value: any) => string;
  formatYAxisLabel?: (value: any) => string;
}

const defaultColors = [
  '#4A55C7', // brand-primary
  '#38A169', // brand-secondary
  '#805AD5', // brand-accent
  '#3182CE', // brand-info
  '#D69E2E', // brand-warning
  '#E53E3E', // brand-danger
];

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines = [],
  xAxisKey = 'date',
  title,
  subtitle,
  actions,
  height = 300,
  loading = false,
  error,
  className = '',
  variant = 'default',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  smooth = true,
  formatTooltip,
  formatXAxisLabel,
  formatYAxisLabel,
}) => {
  // Auto-generate lines if not provided
  const autoLines = React.useMemo(() => {
    if (lines.length > 0) return lines;
    
    if (data.length === 0) return [];
    
    const firstDataPoint = data[0];
    const keys = Object.keys(firstDataPoint).filter(key => key !== xAxisKey && typeof firstDataPoint[key] === 'number');
    
    return keys.map((key, index) => ({
      key,
      color: defaultColors[index % defaultColors.length],
      name: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }, [data, lines, xAxisKey]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-panel border border-brand-border rounded-lg p-3 shadow-lg">
          <p className="text-brand-text-primary font-medium mb-2">
            {formatXAxisLabel ? formatXAxisLabel(label) : label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-brand-text-secondary text-sm">
                {entry.name}:
              </span>
              <span className="text-brand-text-primary font-medium">
                {formatTooltip ? formatTooltip(entry.value, entry.name, entry) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      actions={actions}
      height={height}
      loading={loading}
      error={error}
      className={className}
      variant={variant}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(74, 85, 199, 0.1)"
              horizontal={true}
              vertical={false}
            />
          )}
          <XAxis 
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickFormatter={formatYAxisLabel}
          />
          {showTooltip && <Tooltip content={customTooltip} />}
          {showLegend && (
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                color: '#A0AEC0'
              }}
            />
          )}
          {autoLines.map((line) => (
            <Line 
              key={line.key}
              type={smooth ? "monotone" : "linear"}
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#1A2236' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default LineChart;