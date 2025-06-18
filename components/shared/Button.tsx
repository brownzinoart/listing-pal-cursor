import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "ghost"
    | "edit"
    | "custom";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  const baseStyle = `
    font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background 
    transition-all duration-200 ease-out inline-flex items-center justify-center relative overflow-hidden
    transform active:scale-95 disabled:transform-none
  `;

  let variantStyle = "";
  switch (variant) {
    case "primary":
      variantStyle = `
        bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold
        hover:opacity-90 shadow-lg hover:shadow-xl
        focus:ring-brand-primary focus:ring-opacity-50
        active:shadow-md transform hover:scale-[1.02]
        border border-transparent transition-all duration-300
      `;
      break;
    case "secondary":
      variantStyle = `
        bg-brand-panel text-brand-text-primary border border-brand-border font-medium
        hover:bg-brand-card hover:border-brand-primary/30 hover:shadow-md hover:shadow-brand-primary/10
        focus:ring-brand-primary focus:ring-opacity-30
        transform hover:scale-[1.01]
      `;
      break;
    case "tertiary":
      variantStyle = `
        bg-transparent text-brand-primary border-2 border-brand-primary/70 font-medium
        hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:shadow-md
        focus:ring-brand-primary focus:ring-opacity-40
        transform hover:scale-[1.01]
      `;
      break;
    case "ghost":
      variantStyle = `
        bg-transparent text-brand-text-secondary border border-transparent font-normal
        hover:text-brand-text-primary hover:bg-brand-panel/50
        focus:ring-brand-primary focus:ring-opacity-30
        transform hover:scale-[1.01]
      `;
      break;
    case "edit":
      variantStyle = `
        bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold
        hover:opacity-90 shadow-lg hover:shadow-xl
        focus:ring-brand-primary focus:ring-opacity-50
        transform hover:scale-[1.02] transition-all duration-300
        border border-transparent
      `;
      break;
    case "danger":
      variantStyle = `
        bg-brand-danger text-white font-semibold border border-transparent
        hover:bg-brand-danger/90 hover:shadow-lg hover:shadow-brand-danger/25
        focus:ring-brand-danger focus:ring-opacity-50
        transform hover:scale-[1.02]
      `;
      break;
    case "custom":
      variantStyle = "";
      break;
  }

  let sizeStyle = "";
  switch (size) {
    case "xs":
      sizeStyle = "py-2 px-4 text-xs";
      break;
    case "sm":
      sizeStyle = "py-2 px-5 text-sm";
      break;
    case "md":
      sizeStyle = "py-3 px-6 text-sm";
      break;
    case "lg":
      sizeStyle = "py-3 px-6 text-sm";
      break;
    case "xl":
      sizeStyle = "py-4 px-8 text-base";
      break;
  }

  const disabledStyle = `
    opacity-50 cursor-not-allowed transform-none hover:scale-100 hover:shadow-none
    hover:bg-opacity-100 hover:border-opacity-100
  `;

  const widthStyle = fullWidth ? "w-full" : "";

  const getLoadingSpinner = () => {
    const spinnerSize = size === "xs" || size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <svg
        className={`animate-spin ${spinnerSize}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  };

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${widthStyle} ${className} ${disabled || isLoading ? disabledStyle : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-inherit rounded-lg flex items-center justify-center">
          {getLoadingSpinner()}
        </div>
      )}
      <div
        className={`flex items-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children && <span className="flex-shrink-0">{children}</span>}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </div>
    </button>
  );
};

export default Button;
