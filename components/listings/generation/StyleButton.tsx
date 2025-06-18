import React from "react";

interface StyleButtonProps {
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const StyleButton: React.FC<StyleButtonProps> = ({
  name,
  description,
  isSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full text-left p-4 rounded-lg border-2 transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background
        ${
          isSelected
            ? "bg-brand-card border-brand-secondary shadow-lg ring-1 ring-brand-secondary" // Green border for selected
            : "bg-brand-card border-brand-border hover:border-brand-text-tertiary hover:bg-brand-panel"
        }
      `}
      aria-pressed={isSelected}
    >
      <h4
        className={`font-semibold text-brand-text-primary ${isSelected ? "text-brand-secondary" : ""}`}
      >
        {name}
      </h4>
      <p className="text-sm text-brand-text-secondary mt-1">{description}</p>
      {isSelected && (
        <span className="absolute top-2 right-2 bg-brand-secondary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          Selected
        </span>
      )}
    </button>
  );
};

export default StyleButton;
