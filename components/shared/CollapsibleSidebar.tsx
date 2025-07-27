import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  PhotoIcon,
  PrinterIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const NAV_LINKS = [
  { key: 'dashboard', label: 'Home', path: '/dashboard', icon: HomeIcon },
  { key: 'portfolio', label: 'Portfolio Analytics', path: '/dashboard/portfolio', icon: ChartBarIcon },
  { key: 'descriptions', label: 'Descriptions', path: '/dashboard/descriptions', icon: DocumentTextIcon },
  { key: 'social', label: 'Social Posts', path: '/dashboard/social', icon: ChatBubbleLeftRightIcon },
  { key: 'email', label: 'Email', path: '/dashboard/email', icon: EnvelopeIcon },
  { key: 'ads', label: 'Paid Ads', path: '/dashboard/ads', icon: MegaphoneIcon },
  { key: 'interior', label: 'Interior Deco', path: '/dashboard/interior', icon: PhotoIcon },
  { key: 'print', label: 'Print Materials', path: '/dashboard/print', icon: PrinterIcon },
  { key: 'resources', label: 'Resources', path: '/dashboard/resources', icon: BookOpenIcon },
];

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className = ''
}) => {
  const location = useLocation();

  return (
    <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } ${className}`}>
      <div className="h-full bg-white/5 backdrop-blur-lg border-r border-white/10 relative">
        
        {/* Floating Toggle Button - Positioned off the edge */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-4 top-8 z-50 p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          {!isCollapsed && (
            <div>
              <h2 className="text-white font-bold text-lg">ListingPal</h2>
              <p className="text-slate-400 text-sm">Real Estate Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            const IconComponent = link.icon;
            
            return (
              <Link
                key={link.key}
                to={link.path}
                className={`flex items-center p-3 rounded-xl transition-colors duration-150 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title={isCollapsed ? link.label : undefined}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''} ${
                  isCollapsed ? '' : 'mr-3'
                }`} />
                {!isCollapsed && (
                  <span className="font-medium">{link.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-white font-medium text-sm mb-2">Pro Tip</h4>
              <p className="text-slate-300 text-xs">
                Click the arrow button to collapse navigation for more workspace.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleSidebar;