import React from "react";
import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/24/outline";

type ViewMode = "cards" | "table";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center bg-white/10 rounded-xl p-1 ${className}`}
    >
      <button
        onClick={() => onViewModeChange("cards")}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === "cards"
            ? "bg-white/20 text-white shadow-lg"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        }`}
        title="Card View"
      >
        <Squares2X2Icon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={`p-2 rounded-lg transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white/20 text-white shadow-lg"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        }`}
        title="Table View"
      >
        <TableCellsIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ViewToggle;
export type { ViewMode };
