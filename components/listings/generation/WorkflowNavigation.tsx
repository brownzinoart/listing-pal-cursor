import React from "react";
import { TOOLKIT_TOOLS } from "../../../constants";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface WorkflowNavigationProps {
  workflowTools: string[];
  currentToolId: string;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  workflowTools,
  currentToolId,
}) => {
  if (workflowTools.length <= 1) return null;

  const currentIndex = workflowTools.indexOf(currentToolId);
  const progressPercentage = ((currentIndex + 1) / workflowTools.length) * 100;

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 mb-6 shadow-brand">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-2 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-text-primary">
              Content Workflow
            </h3>
            <p className="text-sm text-brand-text-tertiary">
              Step {currentIndex + 1} of {workflowTools.length}
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="flex items-center space-x-3">
          <div className="w-24 h-2 bg-brand-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-brand-text-secondary">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Step Progress */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-brand-border/30"></div>

        {/* Active Progress Line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300 ease-out"
          style={{
            width: `${(currentIndex / (workflowTools.length - 1)) * 100}%`,
          }}
        />

        <div className="relative flex justify-between">
          {workflowTools.map((toolId, index) => {
            const tool = TOOLKIT_TOOLS.find((t) => t.id === toolId);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={toolId}
                className="flex flex-col items-center space-y-2"
              >
                {/* Step Circle */}
                <div
                  className={`
                  h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 border-2
                  ${
                    isCompleted
                      ? "bg-brand-primary border-brand-primary text-white"
                      : isCurrent
                        ? "bg-gradient-to-r from-brand-primary to-brand-accent border-brand-primary text-white"
                        : "bg-brand-panel border-brand-border text-brand-text-tertiary"
                  }
                `}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Tool Name */}
                <div className="text-center max-w-16">
                  <span
                    className={`
                    text-xs font-medium leading-tight block
                    ${
                      isCurrent
                        ? "text-white"
                        : isCompleted
                          ? "text-brand-primary"
                          : "text-brand-text-tertiary"
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
