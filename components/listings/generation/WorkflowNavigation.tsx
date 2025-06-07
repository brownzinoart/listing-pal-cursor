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
    <div className="relative bg-gradient-to-br from-brand-panel via-brand-card to-brand-panel border border-brand-border/50 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-sm">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-brand-secondary/5 to-brand-accent/5 rounded-2xl animate-pulse-slow"></div>
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-r from-brand-primary to-brand-secondary p-3 rounded-full">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-brand-text-primary to-brand-text-secondary bg-clip-text text-transparent">
              Content Workflow
            </h3>
            <p className="text-sm text-brand-text-tertiary">
              Step {currentIndex + 1} of {workflowTools.length} • {Math.round(progressPercentage)}% Complete
            </p>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="flex items-center space-x-3">
          <div className="w-32 h-2 bg-brand-border/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-brand-text-secondary">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Modern Step Progress */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-brand-border via-brand-border/50 to-brand-border"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent transition-all duration-1000 ease-out"
          style={{ width: `${(currentIndex / (workflowTools.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {workflowTools.map((toolId, index) => {
            const tool = TOOLKIT_TOOLS.find(t => t.id === toolId);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;
            
            return (
              <div key={toolId} className="flex flex-col items-center space-y-3 relative">
                {/* Step Circle */}
                <div className={`
                  relative transition-all duration-500 ease-out transform
                  ${isCurrent ? 'scale-110' : 'scale-100'}
                `}>
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full blur-lg opacity-60 animate-pulse"></div>
                  )}
                  
                  <div className={`
                    relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 border-2
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-500/25' 
                      : isCurrent 
                      ? 'bg-gradient-to-br from-brand-primary to-brand-secondary border-brand-primary shadow-xl shadow-brand-primary/30' 
                      : 'bg-brand-card border-brand-border/50 shadow-sm'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6 text-white drop-shadow-sm" />
                    ) : (
                      <span className={`
                        text-sm font-bold transition-colors duration-300
                        ${isCurrent ? 'text-white drop-shadow-sm' : 'text-brand-text-tertiary'}
                      `}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Tool Name */}
                <div className="text-center max-w-20">
                  <span className={`
                    text-xs font-medium transition-all duration-300 leading-tight block
                    ${isCurrent 
                      ? 'text-brand-primary font-semibold' 
                      : isCompleted 
                      ? 'text-green-400 font-medium' 
                      : 'text-brand-text-tertiary'
                    }
                  `}>
                    {tool?.name || toolId}
                  </span>
                  
                  {/* Status indicator */}
                  <div className={`
                    mt-1 h-1 w-8 mx-auto rounded-full transition-all duration-500
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : isCurrent 
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' 
                      : 'bg-brand-border/30'
                    }
                  `} />
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