import React from "react";
import { AiDesignStyle } from "../../../types"; // Assuming AiDesignStyle type is defined
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface AiDesignStyleCardProps {
  style: AiDesignStyle;
  isSelected: boolean;
  onSelect: () => void;
}

const AiDesignStyleCard: React.FC<AiDesignStyleCardProps> = ({
  style,
  isSelected,
  onSelect,
}) => {
  const IconComponent = style.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative w-full text-left p-4 rounded-lg border-2 transition-all duration-150 group
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background
        ${
          isSelected
            ? "bg-brand-card border-brand-primary shadow-lg ring-1 ring-brand-primary"
            : "bg-brand-card border-brand-border hover:border-brand-primary hover:bg-brand-panel"
        }
      `}
      aria-pressed={isSelected}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-md ${isSelected ? "bg-brand-primary/20" : "bg-brand-border/30 group-hover:bg-brand-primary/10"}`}
        >
          <IconComponent
            className={`h-6 w-6 ${isSelected ? "text-brand-primary" : "text-brand-text-secondary group-hover:text-brand-primary"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-brand-text-primary ${isSelected ? "text-brand-primary" : ""} break-words leading-tight`}
          >
            {style.name}
          </h4>
          <p className="text-xs text-brand-text-secondary mt-1 leading-tight break-words">
            {style.description}
          </p>
        </div>
      </div>
      {isSelected && (
        <CheckCircleIcon className="absolute top-3 right-3 h-6 w-6 text-brand-primary" />
      )}
    </button>
  );
};

export default AiDesignStyleCard;
