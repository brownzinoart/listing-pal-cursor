import React from "react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface ProgressBarProps {
  progress: number;
  label: string;
  showPercentage?: boolean;
  color?: "purple" | "blue" | "emerald" | "pink";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = "purple",
}) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-teal-500",
    pink: "from-pink-500 to-rose-500",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white font-medium">{label}</span>
        {showPercentage && (
          <span className="text-sm text-slate-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${colorClasses[color]} h-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

interface PlatformStatus {
  platform: "tiktok" | "instagram" | "youtube";
  status: "waiting" | "processing" | "uploading" | "complete" | "error";
  progress?: number;
  message?: string;
}

interface PlatformProgressProps {
  statuses: PlatformStatus[];
}

export const PlatformProgress: React.FC<PlatformProgressProps> = ({
  statuses,
}) => {
  const platformIcons = {
    tiktok: <FaTiktok className="h-5 w-5" />,
    instagram: <FaInstagram className="h-5 w-5" />,
    youtube: <FaYoutube className="h-5 w-5" />,
  };

  const platformNames = {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube",
  };

  const getStatusColor = (status: PlatformStatus["status"]) => {
    switch (status) {
      case "waiting":
        return "text-slate-400";
      case "processing":
        return "text-blue-400";
      case "uploading":
        return "text-purple-400";
      case "complete":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: PlatformStatus["status"]) => {
    if (status === "complete") {
      return <CheckCircleIcon className="h-5 w-5 text-emerald-400" />;
    }
    if (status === "processing" || status === "uploading") {
      return (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {statuses.map((status) => (
        <div key={status.platform} className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={getStatusColor(status.status)}>
                {platformIcons[status.platform]}
              </div>
              <span className="text-white font-medium">
                {platformNames[status.platform]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${getStatusColor(status.status)}`}>
                {status.message || status.status}
              </span>
              {getStatusIcon(status.status)}
            </div>
          </div>

          {status.progress !== undefined && status.status !== "complete" && (
            <ProgressBar
              progress={status.progress}
              label=""
              showPercentage={false}
              color="purple"
            />
          )}
        </div>
      ))}
    </div>
  );
};

interface VideoProcessingStepsProps {
  currentStep: number;
  steps: string[];
}

export const VideoProcessingSteps: React.FC<VideoProcessingStepsProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/10"></div>
      <div
        className="absolute left-6 top-8 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 transition-all duration-500"
        style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
      ></div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div key={index} className="flex items-center gap-4">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300
                ${
                  isComplete
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : isActive
                      ? "bg-white/20 border-2 border-purple-400"
                      : "bg-white/10 border-2 border-white/20"
                }
              `}
              >
                {isComplete ? (
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                ) : (
                  <span
                    className={`text-sm font-bold ${isActive ? "text-purple-400" : "text-slate-400"}`}
                  >
                    {index + 1}
                  </span>
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping"></div>
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium transition-colors duration-300 ${
                    isComplete || isActive ? "text-white" : "text-slate-400"
                  }`}
                >
                  {step}
                </p>
                {isActive && (
                  <p className="text-sm text-purple-400 mt-1">Processing...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
