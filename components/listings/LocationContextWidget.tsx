import { useState, useEffect, useRef } from "react";
import type {
  ContextCard,
  LocationContextData,
} from "../../types/locationContext";

interface LocationContextWidgetProps {
  address: string;
  latitude?: number;
  longitude?: number;
  onContextSelect: (selectedCards: ContextCard[]) => void;
  className?: string;
}

export const LocationContextWidget: React.FC<LocationContextWidgetProps> = ({
  address,
  latitude,
  longitude,
  onContextSelect,
  className = "",
}) => {
  const [contextData, setContextData] = useState<LocationContextData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSelected = useRef(false);

  // Fetch context when address changes (debounced)
  useEffect(() => {
    if (!address || address.length < 10) {
      setContextData(null);
      hasAutoSelected.current = false; // Reset auto-selection flag
      return;
    }

    // Reset auto-selection flag for new address
    hasAutoSelected.current = false;

    const timeoutId = setTimeout(() => {
      fetchLocationContext();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [address, latitude, longitude]);

  const fetchLocationContext = async () => {
    setLoading(true);
    setError(null);

    try {
      // Enhanced API call with coordinates for real data
      const requestBody: any = { address };
      if (latitude && longitude) {
        requestBody.lat = latitude;
        requestBody.lng = longitude;
        console.log(
          `🌍 Fetching real data for ${address} at coordinates (${latitude}, ${longitude})`,
        );
      } else {
        console.log(
          `📍 Fetching data for ${address} (no coordinates available)`,
        );
      }

      const response = await fetch("/api/listings/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch location context");
      }

      const data = await response.json();
      console.log(`✅ Retrieved ${data.cards?.length || 0} context cards`);
      setContextData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Location context fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update parent when selection changes - prevent infinite loops
  useEffect(() => {
    if (contextData && !hasAutoSelected.current) {
      // Auto-select all cards for immediate integration (only once)
      onContextSelect(contextData.cards);
      hasAutoSelected.current = true;
    }
  }, [contextData, onContextSelect]);

  // Loading state - matches brand design system
  if (loading) {
    return (
      <div
        className={`bg-gradient-to-r from-brand-card to-brand-panel rounded-xl p-6 border border-brand-border ${className}`}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-text-primary">
              Analyzing Neighborhood
            </h3>
            <p className="text-brand-text-secondary text-sm mt-1">
              Gathering walkability, demographics, schools, and amenities
              data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - brand design system
  if (error) {
    return (
      <div
        className={`bg-brand-card rounded-xl p-6 border border-brand-danger/30 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-brand-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-brand-text-primary">
              Unable to fetch neighborhood data
            </h3>
            <p className="text-sm text-brand-text-secondary mt-1">{error}</p>
            <button
              onClick={fetchLocationContext}
              className="mt-3 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
            >
              Try again →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  if (!contextData || !contextData.cards) return null;

  // Helper function to categorize cards on the client-side
  const categorizeCards = (cards: ContextCard[]) => {
    return {
      location: cards.filter((c) => ["walkability", "climate"].includes(c.id)),
      community: cards.filter((c) => ["demographics", "safety"].includes(c.id)),
      amenities: cards.filter((c) =>
        ["dining", "shopping", "parks", "recreation"].includes(c.id),
      ),
      education: cards.filter((c) => ["schools", "libraries"].includes(c.id)),
      transportation: cards.filter((c) =>
        ["transit", "commute"].includes(c.id),
      ),
    };
  };

  const categorizedCards = categorizeCards(contextData.cards);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Header section - matching Property Details style */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-2xl font-bold text-brand-text-primary mb-2">
              Neighborhood Insights
            </h3>
            <div className="flex items-center">
              <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-brand-secondary">
                Automatically enhancing your listing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed height container with scroll for content overflow protection */}
      <div className="w-full max-h-[500px] overflow-y-auto overflow-x-hidden rounded-xl border border-brand-border bg-brand-card p-4">
        {/* Context cards organized by category */}
        <div className="space-y-6 w-full">
          {Object.entries(categorizedCards).map(
            ([category, cards]) =>
              cards.length > 0 && (
                <div key={category} className="space-y-4 w-full">
                  {/* Category header - improved visibility */}
                  <div className="flex items-center space-x-4 py-3 sticky top-0 bg-brand-card z-10 border-b border-brand-border">
                    <div className="flex items-center space-x-3">
                      <CategoryIcon category={category} />
                      <h3 className="text-lg font-bold text-brand-text-primary capitalize">
                        {category === "amenities"
                          ? "Local Amenities"
                          : category === "education"
                            ? "Schools & Education"
                            : category === "transportation"
                              ? "Transit & Transportation"
                              : category === "community"
                                ? "Demographics & Community"
                                : "Location Features"}
                      </h3>
                    </div>
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-sm text-gray-700 font-semibold bg-gray-200 px-3 py-1 rounded-full">
                      {cards.length} insights
                    </span>
                  </div>

                  {/* Cards grid - controlled sizing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 w-full">
                    {cards.map((card) => (
                      <ContextCard
                        key={card.id}
                        card={card}
                        isSelected={true}
                        onToggle={() => {}} // No-op since auto-selected
                      />
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};

// Individual context card component - enhanced with better contrast and tertiary styles
const ContextCard: React.FC<{
  card: ContextCard;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ card, isSelected, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`relative w-full bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer group transform max-h-[400px] overflow-hidden ${
        isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/15 ring-1 ring-blue-100"
          : "border-gray-200 hover:border-blue-600 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
      }`}
      onClick={onToggle}
    >
      {/* Selection indicator - smaller */}
      <div
        className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all z-10 ${
          isSelected
            ? "bg-blue-500 border-blue-500 shadow-sm"
            : "border-gray-300 group-hover:border-blue-400 bg-white"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3 text-white absolute top-0.5 left-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="p-6 w-full h-full overflow-hidden">
        {/* Card header */}
        <div className="flex items-start space-x-4 mb-4 w-full">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              isSelected
                ? "bg-blue-100 text-blue-600 border border-blue-200"
                : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-500"
            }`}
          >
            <CardIcon cardId={card.id} />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <h4 className="font-bold text-gray-900 text-base mb-1 leading-tight truncate">
              {card.title}
            </h4>
            {card.preview?.quickStat && (
              <div
                className={`font-bold text-xl ${
                  isSelected ? "text-blue-600" : "text-blue-500"
                }`}
              >
                {card.preview.quickStat}
              </div>
            )}
          </div>
        </div>

        {/* Card content */}
        <p
          className="text-gray-700 text-sm mb-4 leading-relaxed w-full"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.preview?.headline || ""}
        </p>

        {/* Key points - with scrollable area when expanded */}
        <div
          className={`space-y-2 w-full ${isExpanded ? "max-h-32 overflow-y-auto" : ""}`}
        >
          {(card.preview?.bullets || [])
            .slice(0, isExpanded ? undefined : 2)
            .map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 text-sm w-full"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isSelected ? "bg-blue-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="flex-1 text-gray-600 leading-relaxed">
                  {bullet}
                </span>
              </div>
            ))}
        </div>

        {/* Expand/collapse */}
        {(card.preview?.bullets || []).length > 2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 w-full"
          >
            <span>
              {isExpanded
                ? "Show less"
                : `Show ${(card.preview?.bullets || []).length - 2} more details`}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Marketing copy preview when expanded - constrained height */}
        {isExpanded && (
          <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 max-h-24 overflow-y-auto w-full">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Marketing Copy Preview</span>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed">
              <span className="text-gray-500">"</span>
              {card.marketingCopy || ""}
              <span className="text-gray-500">"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual card icons component
const CardIcon: React.FC<{ cardId: string }> = ({ cardId }) => {
  const iconMap: Record<string, React.ReactElement> = {
    walkability: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    demographics: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    schools: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
    restaurants: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    shopping: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    parks: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    transit: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    safety: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    climate: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
  };

  return iconMap[cardId] || iconMap.walkability;
};

// Category icons component
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const iconMap: Record<string, React.ReactElement> = {
    location: (
      <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        </svg>
      </div>
    ),
    community: (
      <div className="w-8 h-8 bg-brand-accent/20 rounded-lg flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
    ),
    amenities: (
      <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
    ),
    education: (
      <div className="w-8 h-8 bg-brand-accent/20 rounded-lg flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
      </div>
    ),
    transportation: (
      <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </div>
    ),
  };

  return iconMap[category] || iconMap.location;
};
