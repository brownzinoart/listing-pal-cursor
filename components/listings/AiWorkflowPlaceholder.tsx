import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { TOOLKIT_TOOLS } from "../../constants";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Listing } from "../../types";

interface ToolkitPlaceholderProps {
  listing?: Listing;
}

const ToolkitPlaceholder: React.FC<ToolkitPlaceholderProps> = ({ listing }) => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (toolId: string) => {
    const tool = TOOLKIT_TOOLS.find((t) => t.id === toolId);
    if (!tool?.enabled) return;
    setSelected((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId],
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;

    // Create workflow params to pass selected tools
    const workflowParams = selected.join(",");

    // If only one tool is selected, navigate directly to that tool's page
    if (selected.length === 1) {
      const selectedTool = TOOLKIT_TOOLS.find(
        (tool) => tool.id === selected[0],
      );
      if (selectedTool && selectedTool.pathSuffix && listingId) {
        navigate(
          `/listings/${listingId}${selectedTool.pathSuffix}?workflow=${workflowParams}`,
        );
      }
    } else {
      // For multiple selections, navigate to the first enabled tool with workflow params
      const firstSelectedTool = TOOLKIT_TOOLS.find(
        (tool) => selected.includes(tool.id) && tool.enabled && tool.pathSuffix,
      );
      if (firstSelectedTool && listingId) {
        navigate(
          `/listings/${listingId}${firstSelectedTool.pathSuffix}?workflow=${workflowParams}`,
        );
      }
    }
  };

  const canGenerate = selected.length > 0;

  // Map tool id to icon background color (matching the specification)
  const iconBg: Record<string, string> = {
    desc: "bg-blue-600",
    fb: "bg-blue-700",
    ig: "bg-purple-600",
    x: "bg-sky-600",
    email: "bg-teal-600",
    interior: "bg-pink-600",
    flyer: "bg-orange-600",
    print: "bg-indigo-600",
    paid_ads: "bg-green-600",
    contract: "bg-amber-600",
  };

  // Content type descriptions matching the specification
  const getDescription = (toolId: string): string => {
    switch (toolId) {
      case "desc":
        return "MLS-ready descriptions";
      case "fb":
        return "Engaging Facebook posts";
      case "ig":
        return "Instagram captions";
      case "x":
        return "Concise X posts";
      case "email":
        return "Professional email campaigns";
      case "flyer":
        return "Custom marketing flyers";
      case "print":
        return "Lawn signs, postcards & more";
      case "interior":
        return "AI interior styling";
      case "paid_ads":
        return "Generate paid ad copy";
      case "contract":
        return "Generate purchase contracts";
      default:
        return "Generate content for your listing";
    }
  };

  // Determine which tools have generated content based on listing data
  const generatedContent: string[] = listing
    ? [
        ...(listing.generatedDescription ? ["desc"] : []),
        ...(listing.generatedFacebookPost ? ["fb"] : []),
        ...(listing.generatedInstagramCaption ? ["ig"] : []),
        ...(listing.generatedXPost ? ["x"] : []),
        ...(listing.generatedEmail ? ["email"] : []),
        ...(listing.generatedRoomDesigns &&
        listing.generatedRoomDesigns.length > 0
          ? ["interior"]
          : []),
        ...(listing.generatedFlyers && listing.generatedFlyers.length > 0
          ? ["flyer"]
          : []),
        ...(listing.generatedAdCopy && listing.generatedAdCopy.length > 0
          ? ["paid_ads"]
          : []),
        // Add other generated content types as they become available
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Generate New Content
        </h3>
        <p className="text-slate-400">
          Select content types to generate for your listing
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {TOOLKIT_TOOLS.filter((t) => t.enabled).map((tool) => {
          const isEnabled = tool.enabled;
          const isSelected = selected.includes(tool.id);
          const Icon = tool.icon;
          const hasGeneratedContent = generatedContent.includes(tool.id);

          return (
            <div
              key={tool.id}
              className={`relative cursor-pointer transition-all duration-200 group ${
                isEnabled ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => handleToggle(tool.id)}
            >
              <div
                className={`bg-white/10 backdrop-blur-lg border rounded-2xl p-6 text-center transition-all duration-200 ${
                  isSelected
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-white/20 hover:border-white/30 hover:bg-white/15"
                }`}
              >
                <div
                  className={`w-12 h-12 ${iconBg[tool.id] || "bg-blue-600"} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h4 className="font-semibold text-white text-sm mb-2">
                  {tool.name}
                </h4>
                <p className="text-slate-300 text-xs mb-4">
                  {getDescription(tool.id)}
                </p>

                <div className="flex items-center justify-center space-x-2">
                  {hasGeneratedContent && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-emerald-400">
                        Generated
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          type="button"
          className={`px-12 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-200 ${
            canGenerate
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              : "bg-slate-600 cursor-not-allowed opacity-50"
          }`}
          disabled={!canGenerate}
          onClick={handleStart}
        >
          Start Content Generation
        </button>
      </div>
    </div>
  );
};

export default ToolkitPlaceholder;
