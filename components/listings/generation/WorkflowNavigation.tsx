import React from 'react';
import { TOOLKIT_TOOLS } from '../../../constants';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WorkflowNavigationProps {
  workflowTools: string[];
  currentToolId: string;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({ 
  workflowTools, 
  currentToolId
}) => {
  
  if (workflowTools.length <= 1) return null;
  
  const currentIndex = workflowTools.indexOf(currentToolId);
  const progressPercentage = ((currentIndex + 1) / workflowTools.length) * 100;

  return (
    <div className="bg-brand-panel border border-brand-border rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-lg shadow-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-text-primary">
              Content Workflow
            </h3>
            <p className="text-sm text-brand-text-secondary">
              Step {currentIndex + 1} of {workflowTools.length}
            </p>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="flex items-center space-x-4">
          <div className="w-32 h-2.5 bg-brand-border/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-purple-600 min-w-[3rem] text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Step Progress - Fixed spacing */}
      <div className="relative max-w-md mx-auto">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-brand-border/20 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
          style={{ 
            width: workflowTools.length > 1 
              ? `calc(${(currentIndex / (workflowTools.length - 1)) * 100}% - 1.5rem + ${(currentIndex / (workflowTools.length - 1)) * 3}rem)`
              : '0%'
          }}
        />

        <div className="flex justify-between items-center">
          {workflowTools.map((toolId, index) => {
            const tool = TOOLKIT_TOOLS.find(t => t.id === toolId);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={toolId} className="flex flex-col items-center space-y-3 flex-1 max-w-[120px]">
                {/* Step Circle */}
                <div className={`
                  h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative z-10
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-500 text-white transform scale-105' 
                    : isCurrent 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-500 text-white shadow-xl ring-4 ring-purple-200/50' 
                    : 'bg-brand-card border-2 border-brand-border text-brand-text-tertiary hover:border-brand-border/60'
                  }
                `}>
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Tool Name */}
                <div className="text-center">
                  <span className={`
                    text-sm font-medium leading-tight block
                    ${isCurrent 
                      ? 'text-purple-600 font-semibold' 
                      : isCompleted 
                      ? 'text-indigo-600 font-medium' 
                      : 'text-brand-text-tertiary'
                    }
                  `}>
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