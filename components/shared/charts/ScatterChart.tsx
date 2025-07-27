import React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartWrapper from "./ChartWrapper";

export interface ScatterChartDataPoint {
  x: number;
  y: number;
  name?: string;
  size?: number;
  category?: string;
}

interface ScatterChartProps {
  data: ScatterChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  sizeKey?: string;
  categoryKey?: string;
  colors?: string[];
  formatTooltip?: (payload: any) => string;
  className?: string;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  title,
  subtitle,
  height = 400,
  xAxisLabel = "",
  yAxisLabel = "",
  xAxisKey = "x",
  yAxisKey = "y",
  sizeKey = "size",
  categoryKey = "category",
  colors = ["#4A55C7", "#38A169", "#805AD5", "#F59E0B", "#EF4444"],
  formatTooltip,
  className = "",
}) => {
  // Group data by category if categoryKey is provided
  const groupedData = React.useMemo(() => {
    if (!categoryKey) {
      return [{ name: "Data", data, color: colors[0] }];
    }

    const groups = data.reduce(
      (acc, item) => {
        const category =
          item[categoryKey as keyof ScatterChartDataPoint] || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, ScatterChartDataPoint[]>,
    );

    return Object.entries(groups).map(([name, groupData], index) => ({
      name,
      data: groupData,
      color: colors[index % colors.length],
    }));
  }, [data, categoryKey, colors]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      if (formatTooltip) {
        return (
          <div className="bg-brand-panel border border-brand-border rounded-lg p-3 shadow-lg">
            <div className="text-sm text-brand-text-primary">
              {formatTooltip(data)}
            </div>
          </div>
        );
      }

      return (
        <div className="bg-brand-panel border border-brand-border rounded-lg p-3 shadow-lg">
          {data.name && (
            <p className="text-sm font-medium text-brand-text-primary mb-1">
              {data.name}
            </p>
          )}
          <p className="text-xs text-brand-text-secondary">
            {xAxisLabel}: {data[xAxisKey]?.toLocaleString?.() || data[xAxisKey]}
          </p>
          <p className="text-xs text-brand-text-secondary">
            {yAxisLabel}: {data[yAxisKey]?.toLocaleString?.() || data[yAxisKey]}
          </p>
          {sizeKey && data[sizeKey] && (
            <p className="text-xs text-brand-text-secondary">
              Size: {data[sizeKey]?.toLocaleString?.() || data[sizeKey]}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--brand-border)"
            opacity={0.3}
          />
          <XAxis
            type="number"
            dataKey={xAxisKey}
            name={xAxisLabel}
            tick={{ fontSize: 12, fill: "var(--brand-text-secondary)" }}
            tickLine={{ stroke: "var(--brand-border)" }}
            axisLine={{ stroke: "var(--brand-border)" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            type="number"
            dataKey={yAxisKey}
            name={yAxisLabel}
            tick={{ fontSize: 12, fill: "var(--brand-text-secondary)" }}
            tickLine={{ stroke: "var(--brand-border)" }}
            axisLine={{ stroke: "var(--brand-border)" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {groupedData.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
                color: "var(--brand-text-secondary)",
              }}
            />
          )}

          {groupedData.map((group, index) => (
            <Scatter
              key={group.name}
              name={group.name}
              data={group.data}
              fill={group.color}
              fillOpacity={0.7}
              stroke={group.color}
              strokeWidth={1}
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default ScatterChart;
