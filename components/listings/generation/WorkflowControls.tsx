import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WorkflowControlsProps {
  workflowTools: string[];
  currentToolId: string;
  isInWorkflow: boolean;
  workflowParam: string;
}

const WorkflowControls: React.FC<WorkflowControlsProps> = ({ 
  workflowTools, 
  currentToolId,
  isInWorkflow,
  workflowParam
}) => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!isInWorkflow || workflowTools.length <= 1) return null;
  
  const currentIndex = workflowTools.indexOf(currentToolId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === workflowTools.length - 1;
  
  const previousTool = !isFirst ? TOOLKIT_TOOLS.find(tool => tool.id === workflowTools[currentIndex - 1]) : null;
  const nextTool = !isLast ? TOOLKIT_TOOLS.find(tool => tool.id === workflowTools[currentIndex + 1]) : null;

  return (
    <>
      {/* Top Right Exit Button */}
      <div className="flex justify-end mb-4">
        <Link to={`/listings/${listingId}`}>
          <Button 
            variant="secondary" 
            size="sm" 
            leftIcon={<XMarkIcon className="h-4 w-4" />}
            className="bg-red-500/10 backdrop-blur-sm hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300"
          >
            Exit Workflow
          </Button>
        </Link>
      </div>

      {/* Bottom Navigation - Previous and Next */}
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-panel/80 to-brand-card/80 backdrop-blur-sm border border-brand-border/50 rounded-xl p-4 mt-6 shadow-lg">
        {/* Left - Previous Button */}
        <div>
          {previousTool ? (
            <Link to={`/listings/${listingId}${previousTool.pathSuffix}?workflow=${workflowParam}`}>
              <Button 
                variant="secondary" 
                size="md" 
                leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-brand-text-primary"
              >
                Back
              </Button>
            </Link>
          ) : (
            <Link to={`/listings/${listingId}`}>
              <Button 
                variant="secondary" 
                size="md" 
                leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-brand-text-primary"
              >
                Back
              </Button>
            </Link>
          )}
        </div>
        
        {/* Right - Next or Complete Button */}
        <div>
          {isLast ? (
            <Link to={`/listings/${listingId}`}>
              <Button 
                variant="primary" 
                size="md" 
                leftIcon={<CheckIcon className="h-4 w-4" />}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
              >
                Complete Workflow
              </Button>
            </Link>
          ) : nextTool ? (
            <Link to={`/listings/${listingId}${nextTool.pathSuffix}?workflow=${workflowParam}`}>
              <Button 
                variant="primary" 
                size="md" 
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 shadow-lg shadow-brand-primary/25"
              >
                Continue to {nextTool.name}
              </Button>
            </Link>
          ) : (
            <Link to={`/listings/${listingId}`}>
              <Button 
                variant="primary" 
                size="md" 
                leftIcon={<CheckIcon className="h-4 w-4" />}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
              >
                Complete Workflow
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkflowControls; 