import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { TOOLKIT_TOOLS } from '../../constants';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Listing } from '../../types';

interface ToolkitPlaceholderProps {
  listing?: Listing;
}

const ToolkitPlaceholder: React.FC<ToolkitPlaceholderProps> = ({ listing }) => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (toolId: string) => {
    const tool = TOOLKIT_TOOLS.find(t => t.id === toolId);
    if (!tool?.enabled) return;
    setSelected(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    
    // Create workflow params to pass selected tools
    const workflowParams = selected.join(',');
    
    // If only one tool is selected, navigate directly to that tool's page
    if (selected.length === 1) {
      const selectedTool = TOOLKIT_TOOLS.find(tool => tool.id === selected[0]);
      if (selectedTool && selectedTool.pathSuffix && listingId) {
        navigate(`/listings/${listingId}${selectedTool.pathSuffix}?workflow=${workflowParams}`);
      }
    } else {
      // For multiple selections, navigate to the first enabled tool with workflow params
      const firstSelectedTool = TOOLKIT_TOOLS.find(tool => selected.includes(tool.id) && tool.enabled && tool.pathSuffix);
      if (firstSelectedTool && listingId) {
        navigate(`/listings/${listingId}${firstSelectedTool.pathSuffix}?workflow=${workflowParams}`);
      }
    }
  };

  const canGenerate = selected.length > 0;

  // Map tool id to icon background color (matching the specification)
  const iconBg: Record<string, string> = {
    desc: 'bg-blue-600',
    fb: 'bg-blue-700', 
    ig: 'bg-purple-600',
    x: 'bg-sky-600',
    email: 'bg-teal-600',
    interior: 'bg-pink-600',
    flyer: 'bg-orange-600',
    print: 'bg-indigo-600',
    paid_ads: 'bg-green-600',
  };

  // Content type descriptions matching the specification
  const getDescription = (toolId: string): string => {
    switch(toolId) {
      case 'desc': return 'MLS-ready descriptions';
      case 'fb': return 'Engaging Facebook posts';
      case 'ig': return 'Instagram captions';
      case 'x': return 'Concise X posts';
      case 'email': return 'Professional email campaigns';
      case 'flyer': return 'Custom marketing flyers';
      case 'print': return 'Lawn signs, postcards & more';
      case 'interior': return 'AI interior styling';
      case 'paid_ads': return 'Generate paid ad copy';
      default: return 'Generate content for your listing';
    }
  };

  // Determine which tools have generated content based on listing data
  const generatedContent: string[] = listing ? [
    ...(listing.generatedDescription ? ['desc'] : []),
    ...(listing.generatedFacebookPost ? ['fb'] : []),
    ...(listing.generatedInstagramCaption ? ['ig'] : []),
    ...(listing.generatedXPost ? ['x'] : []),
    ...(listing.generatedEmail ? ['email'] : []),
    ...(listing.generatedRoomDesigns && listing.generatedRoomDesigns.length > 0 ? ['interior'] : []),
    ...(listing.generatedFlyers && listing.generatedFlyers.length > 0 ? ['flyer'] : []),
    ...(listing.generatedAdCopy && listing.generatedAdCopy.length > 0 ? ['paid_ads'] : []),
    // Add other generated content types as they become available
  ] : [];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 mt-12">
        <h3 className="text-xl font-bold text-brand-text-primary text-center mb-6">Generate New Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 w-full">
          {TOOLKIT_TOOLS.filter(t=>t.enabled).map((tool) => {
            const isEnabled = tool.enabled;
            const isSelected = selected.includes(tool.id);
            const Icon = tool.icon;
            const hasGeneratedContent = generatedContent.includes(tool.id);
            
            return (
              <div
                key={tool.id}
                className={`tool-card ${isEnabled ? 'enabled' : 'disabled'} ${
                  isSelected ? 'border-brand-primary bg-brand-primary/20' : ''
                }`}
                onClick={() => handleToggle(tool.id)}
              >
                                 <div className="flex items-center space-x-3 mb-2 min-w-0 w-full">
                   {/* Icon Container */}
                   <div className={`p-2 rounded flex-shrink-0 ${iconBg[tool.id] || 'bg-brand-primary'}`}>
                     <Icon className={`w-5 h-5 ${isEnabled ? 'text-white' : 'text-gray-500'}`} />
                   </div>
                   
                   {/* Content - Fixed width to prevent stretching */}
                   <div className="flex-1 min-w-0 max-w-[160px]">
                     <h4 className={`font-medium text-sm ${isEnabled ? 'text-brand-text-primary' : 'text-gray-500'} truncate`}>
                       {tool.name}{!isEnabled && ' (Coming Soon)'}
                     </h4>
                     <p className={`text-xs ${isEnabled ? 'text-brand-text-secondary' : 'text-gray-600'} truncate`}>
                       {getDescription(tool.id)}
                     </p>
                   </div>
                   
                   {/* Status Indicators - Fixed positioning */}
                   <div className="flex items-center space-x-1 flex-shrink-0 ml-auto">
                     {/* Generated Content Indicators */}
                     {hasGeneratedContent && isEnabled && (
                       <div className="generated-indicator">
                         <div className="generated-dot"></div>
                         <span className="text-xs text-green-400 whitespace-nowrap hidden sm:inline">Generated</span>
                       </div>
                     )}
                     
                     {/* Selection Checkmark */}
                     {isSelected && (
                       <div className="selection-indicator">
                         <CheckIcon className="w-2.5 h-2.5 text-white" />
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <button
        type="button"
        className="start-workflow-btn max-w-sm w-full"
        disabled={!canGenerate}
        onClick={handleStart}
      >
        Start Content Generation
      </button>
    </div>
  );
};

export default ToolkitPlaceholder;