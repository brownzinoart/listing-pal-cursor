import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import CollapsibleSidebar from "./CollapsibleSidebar";
import { useLayout } from "../../contexts/LayoutContext";

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
  };

  return (
    pathMap[lastSegment] ||
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  );
}

export default ModernDashboardLayout;
