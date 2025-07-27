import React, { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CollapsibleSidebar from "./CollapsibleSidebar";
import { useLayout } from "../../contexts/LayoutContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ModernDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const ModernDashboardLayout: React.FC<ModernDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
}) => {
  const { isSidebarCollapsed, toggleSidebar, getMainContentMargin } =
    useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Auto-generate breadcrumbs if not provided
  const defaultBreadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: getBreadcrumbFromPath(location.pathname) },
  ];

  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 fixed inset-0 overflow-auto">
      {/* Collapsible Sidebar Navigation */}
      <CollapsibleSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${getMainContentMargin()} min-h-full`}
      >
        {/* Top Header Bar with User Menu */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Can add additional header content here */}
            <div className="flex items-center space-x-4">
              {isSidebarCollapsed && (
                <img
                  src="/logo.png"
                  alt="ListingPal"
                  className="h-10 w-auto cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                />
              )}
            </div>

            {/* Right side - User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <UserCircleIcon className="h-8 w-8 text-slate-300" />
                <div className="hidden sm:block text-left">
                  <p className="text-white font-medium text-sm">Pavano</p>
                  <p className="text-slate-400 text-xs">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white font-medium">Pavano</p>
                    <p className="text-slate-400 text-sm truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <UserCircleIcon className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-white/10 py-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full flex items-center px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="w-full space-y-8">
            {/* Header with Breadcrumb */}
            {(title || finalBreadcrumbs) && (
              <div className="flex items-center justify-between mb-8">
                <div>
                  {finalBreadcrumbs && (
                    <div className="flex items-center text-slate-400 text-sm mb-2">
                      {finalBreadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {crumb.href ? (
                            <a
                              href={crumb.href}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span
                              className={
                                index === finalBreadcrumbs.length - 1
                                  ? "text-blue-400"
                                  : ""
                              }
                            >
                              {crumb.label}
                            </span>
                          )}
                          {index < finalBreadcrumbs.length - 1 && (
                            <span className="mx-2">›</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  {title && (
                    <div>
                      <h1 className="text-3xl font-bold text-white">{title}</h1>
                      {subtitle && (
                        <p className="text-slate-400 mt-2">{subtitle}</p>
                      )}
                    </div>
                  )}
                </div>

                {actions && (
                  <div className="flex items-center space-x-4">{actions}</div>
                )}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate breadcrumb from path
function getBreadcrumbFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const pathMap: { [key: string]: string } = {
    dashboard: "Home",
    portfolio: "Portfolio Analytics",
    descriptions: "Descriptions",
    social: "Social Posts",
    email: "Email",
    ads: "Paid Ads",
    interior: "Interior Deco",
    print: "Print Materials",
    resources: "Resources",
    settings: "Settings",
  };

  return (
    pathMap[lastSegment] ||
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  );
}

export default ModernDashboardLayout;
