import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { key: 'dashboard', label: 'Home', path: '/dashboard', icon: HomeIcon },
  { key: 'portfolio', label: 'Portfolio Analytics', path: '/dashboard/portfolio', icon: ChartBarIcon },
  { key: 'descriptions', label: 'Descriptions', path: '/dashboard/descriptions', icon: DocumentTextIcon },
  { key: 'social', label: 'Social Posts', path: '/dashboard/social', icon: ChatBubbleLeftRightIcon },
  { key: 'videos', label: 'Video Studio', path: '/dashboard/videos', icon: VideoCameraIcon },
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } ${className}`}>
      <div className="h-full bg-white/5 backdrop-blur-lg border-r border-white/10 relative">
        
        {/* Floating Toggle Button - Positioned to align with header */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-4 top-[24px] z-50 p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
        
        {/* Logo Header - Match the exact height of main content header (85px) */}
        <div className="h-[85px] border-b border-white/10">
          {!isCollapsed && (
            <Link to="/dashboard" className="block h-full hover:bg-white/5 transition-colors">
              <div className="flex items-center h-full px-6">
                <img 
                  src="/logo.png" 
                  alt="ListingPal" 
                  className="h-10 w-auto"
                />
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="flex items-center h-full px-6">
              <div className="h-10 w-auto" />
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

        {/* User Profile Section */}
        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              <UserCircleIcon className={`h-8 w-8 text-slate-300 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium text-sm">Pavano</p>
                    <p className="text-slate-400 text-xs truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserCircleIcon className="h-4 w-4 mr-3" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/10"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {/* Pro Tip - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-white font-medium text-sm mb-2">Pro Tip</h4>
              <p className="text-slate-300 text-xs">
                Click the arrow button to collapse navigation for more workspace.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;