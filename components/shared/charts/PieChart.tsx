import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  formatTooltip?: (value: any, name: string, props: any) => React.ReactNode;
  formatLabel?: (entry: PieChartDataPoint) => string;
  centerContent?: React.ReactNode;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const defaultColors = [
  '#4A55C7', // brand-primary
  '#38A169', // brand-secondary
  '#805AD5', // brand-accent
  '#3182CE', // brand-info
  '#D69E2E', // brand-warning
  '#E53E3E', // brand-danger
  '#68D391', // green-400
  '#9F7AEA', // purple-400
  '#4FD1C7', // teal-400
  '#F6AD55', // orange-400
];

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  actions,
  height = 300,
  loading = false,
  error,
  className = '',
  variant = 'default',
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius,
  paddingAngle = 0,
  formatTooltip,
  formatLabel,
  centerContent,
  legendPosition = 'right',
}) => {
  // Add colors to data if not provided
  const dataWithColors = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
    }));
  }, [data]);

  const calculateRadius = () => {
    const baseRadius = Math.min(height, 400) / 2 - 40;
    return outerRadius || baseRadius;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-brand-panel border border-brand-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-brand-text-primary font-medium">
              {data.name}
            </span>
          </div>
          <div className="text-brand-text-secondary text-sm mt-1">
            Value: <span className="text-brand-text-primary font-medium">
              {formatTooltip ? formatTooltip(data.value, data.name, data) : data.value}
            </span>
          </div>
          <div className="text-brand-text-secondary text-sm">
            Percentage: <span className="text-brand-text-primary font-medium">
              {((data.value / dataWithColors.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const customLabel = (entry: any) => {
    if (!showLabels) return '';
    const total = dataWithColors.reduce((sum, item) => sum + item.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(1);
    return formatLabel ? formatLabel(entry) : `${percent}%`;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!showLegend) return null;
    
    const legendClasses = {
      top: 'flex flex-wrap justify-center gap-4 mb-4',
      bottom: 'flex flex-wrap justify-center gap-4 mt-4',
      left: 'flex flex-col gap-2 mr-4',
      right: 'flex flex-col gap-2 ml-4',
    };

    return (
      <div className={legendClasses[legendPosition]}>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-brand-text-secondary text-sm">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const isDonut = innerRadius > 0;

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
      <div className={`flex ${legendPosition === 'left' ? 'flex-row' : legendPosition === 'right' ? 'flex-row-reverse' : 'flex-col'} items-center justify-center h-full`}>
        {(legendPosition === 'top' || legendPosition === 'left') && (
          <CustomLegend payload={dataWithColors.map(item => ({ value: item.name, color: item.color }))} />
        )}
        
        <div className="relative flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={dataWithColors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showLabels ? customLabel : false}
                outerRadius={calculateRadius()}
                innerRadius={innerRadius}
                paddingAngle={paddingAngle}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={customTooltip} />}
            </RechartsPieChart>
          </ResponsiveContainer>
          
          {/* Center content for donut charts */}
          {isDonut && centerContent && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {centerContent}
              </div>
            </div>
          )}
        </div>

        {(legendPosition === 'bottom' || legendPosition === 'right') && (
          <CustomLegend payload={dataWithColors.map(item => ({ value: item.name, color: item.color }))} />
        )}
      </div>
    </ChartWrapper>
  );
};

export default PieChart;