import React from "react";
import { TOOLKIT_TOOLS } from "../../../constants";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface WorkflowNavigationProps {
  workflowTools: string[];
  currentToolId: string;
  isCompleted?: boolean;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  workflowTools,
  currentToolId,
  isCompleted = false,
}) => {
  if (workflowTools.length <= 1) return null;

  const currentIndex = workflowTools.indexOf(currentToolId);
  const progressPercentage =
    isCompleted || currentIndex === workflowTools.length - 1
      ? 100
      : ((currentIndex + 1) / workflowTools.length) * 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl shadow-lg backdrop-blur-lg border border-white/20 ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500/80 to-teal-500/80"
                : "bg-gradient-to-r from-purple-500/80 to-indigo-500/80"
            }`}
          >
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Content Workflow
            </h3>
            <p className="text-sm text-slate-400">
              {isCompleted
                ? "Completed!"
                : `Step ${currentIndex + 1} of ${workflowTools.length}`}
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="flex items-center space-x-4">
          <div className="w-32 h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                  : "bg-gradient-to-r from-purple-400 to-indigo-400"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span
            className={`text-sm font-semibold min-w-[3rem] text-right ${
              isCompleted ? "text-emerald-400" : "text-purple-400"
            }`}
          >
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Step Progress - Segmented lines between circles */}
      <div className="relative max-w-4xl mx-auto">
        {/* Individual segments between steps */}
        {workflowTools.map((toolId, index) => {
          if (index === workflowTools.length - 1) return null; // No line after last step

          const isSegmentActive = isCompleted || index < currentIndex;
          const segmentWidth = 100 / (workflowTools.length - 1);
          const leftPosition = index * segmentWidth;

          return (
            <div
              key={`segment-${index}`}
              className={`absolute top-6 h-0.5 transition-all duration-700 ease-in-out rounded-full z-10 ${
                isSegmentActive
                  ? isCompleted
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 opacity-100"
                    : "bg-gradient-to-r from-purple-400 to-indigo-400 opacity-100"
                  : "bg-white/10 opacity-50"
              }`}
              style={{
                left: `calc(${leftPosition}% + 1.5rem)`,
                width: `calc(${segmentWidth}% - 3rem)`,
                transformOrigin: "left center",
                transform: isSegmentActive ? "scaleX(1)" : "scaleX(0.95)",
              }}
            />
          );
        })}

        <div className="flex justify-between items-center">
          {workflowTools.map((toolId, index) => {
            const tool = TOOLKIT_TOOLS.find((t) => t.id === toolId);
            const isStepCompleted = isCompleted || index < currentIndex;
            const isCurrent = !isCompleted && index === currentIndex;

            return (
              <div
                key={toolId}
                className="flex flex-col items-center space-y-2 flex-1 min-w-0"
              >
                {/* Step Circle */}
                <div
                  className={`
                  h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative z-20 flex-shrink-0
                  ${
                    isStepCompleted
                      ? isCompleted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-emerald-300 text-white transform scale-105 shadow-emerald-500/30"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-purple-300 text-white transform scale-105 shadow-purple-500/30"
                      : isCurrent
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-purple-300 text-white shadow-xl ring-4 ring-purple-400/30 animate-pulse"
                        : "bg-slate-700 border-2 border-slate-500 text-slate-400 hover:border-slate-400 hover:bg-slate-600"
                  }
                `}
                >
                  {isStepCompleted ? (
                    <CheckIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Tool Name - Better text handling */}
                <div className="text-center px-1 min-h-[2.5rem] flex items-center justify-center">
                  <span
                    className={`
                    text-xs font-medium leading-tight block text-center
                    ${
                      isCurrent
                        ? "text-purple-400 font-semibold"
                        : isStepCompleted
                          ? isCompleted
                            ? "text-emerald-400 font-medium"
                            : "text-indigo-400 font-medium"
                          : "text-slate-500"
                    }
                  `}
                  >
                    {tool?.name || toolId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowNavigation;
