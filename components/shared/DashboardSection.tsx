import React, { ReactNode } from "react";
import Card from "./Card";

interface DashboardSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  variant?: "default" | "elevated" | "outline" | "glass" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  children,
  title,
  subtitle,
  actions,
  variant = "default",
  padding = "none",
  className = "",
  headerClassName = "",
  contentClassName = "",
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const header =
    title || subtitle || actions ? (
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${headerClassName}`}
      >
        <div className="flex items-center gap-3">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-brand-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-brand-text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && !isCollapsed && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    ) : undefined;

  const content = (
    <div className={`${contentClassName} ${isCollapsed ? "hidden" : ""}`}>
      {children}
    </div>
  );

  return (
    <Card
      variant={variant}
      padding={padding}
      className={className}
      header={header}
    >
      {content}
    </Card>
  );
};

export default DashboardSection;
