import React from "react";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  duration?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = "md",
  strokeWidth,
  color = "primary",
  backgroundColor = "rgba(74, 85, 199, 0.1)",
  showPercentage = true,
  label,
  className = "",
  animated = true,
  duration = 1000,
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          radius: 30,
          width: 80,
          height: 80,
          defaultStroke: 4,
          fontSize: "text-xs",
        };
      case "lg":
        return {
          radius: 60,
          width: 140,
          height: 140,
          defaultStroke: 6,
          fontSize: "text-lg",
        };
      case "xl":
        return {
          radius: 80,
          width: 180,
          height: 180,
          defaultStroke: 8,
          fontSize: "text-xl",
        };
      default:
        return {
          radius: 45,
          width: 110,
          height: 110,
          defaultStroke: 5,
          fontSize: "text-sm",
        };
    }
  };

  const getColor = () => {
    switch (color) {
      case "secondary":
        return "#38A169";
      case "success":
        return "#38A169";
      case "warning":
        return "#D69E2E";
      case "danger":
        return "#E53E3E";
      case "info":
        return "#3182CE";
      default:
        return "#4A55C7";
    }
  };

  const sizeConfig = getSizeConfig();
  const actualStrokeWidth = strokeWidth || sizeConfig.defaultStroke;
  const strokeColor = getColor();

  // Calculate circle properties
  const normalizedRadius = sizeConfig.radius - actualStrokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        height={sizeConfig.height}
        width={sizeConfig.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={actualStrokeWidth}
          r={normalizedRadius}
          cx={sizeConfig.width / 2}
          cy={sizeConfig.height / 2}
        />

        {/* Progress circle */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={actualStrokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={sizeConfig.width / 2}
          cy={sizeConfig.height / 2}
          className={animated ? "transition-all duration-1000 ease-out" : ""}
          style={{
            filter: "drop-shadow(0 0 6px rgba(74, 85, 199, 0.3))",
            animationDuration: `${duration}ms`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span
            className={`font-bold text-brand-text-primary ${sizeConfig.fontSize}`}
          >
            {Math.round(clampedProgress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-brand-text-secondary mt-1 text-center max-w-full truncate">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Additional component for multiple progress rings (like in reference screenshots)
interface MultiProgressRingProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const MultiProgressRing: React.FC<MultiProgressRingProps> = ({
  data,
  size = "md",
  className = "",
}) => {
  const sizeConfig = {
    sm: { radius: 25, strokeWidth: 3, spacing: 6 },
    md: { radius: 35, strokeWidth: 4, spacing: 8 },
    lg: { radius: 50, strokeWidth: 5, spacing: 10 },
    xl: { radius: 65, strokeWidth: 6, spacing: 12 },
  }[size];

  const totalRadius =
    sizeConfig.radius + (data.length - 1) * sizeConfig.spacing;
  const svgSize = (totalRadius + sizeConfig.strokeWidth) * 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg height={svgSize} width={svgSize} className="transform -rotate-90">
        {data.map((item, index) => {
          const radius = sizeConfig.radius - index * sizeConfig.spacing;
          const circumference = radius * 2 * Math.PI;
          const strokeDasharray = `${circumference} ${circumference}`;
          const strokeDashoffset =
            circumference - (item.value / 100) * circumference;

          return (
            <circle
              key={index}
              stroke={item.color || "#4A55C7"}
              fill="transparent"
              strokeWidth={sizeConfig.strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={radius}
              cx={svgSize / 2}
              cy={svgSize / 2}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px ${item.color || "#4A55C7"}33)`,
              }}
            />
          );
        })}
      </svg>

      {/* Center labels */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {data.length === 1 && (
          <>
            <span className="font-bold text-brand-text-primary text-sm">
              {Math.round(data[0].value)}%
            </span>
            <span className="text-xs text-brand-text-secondary text-center">
              {data[0].label}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
