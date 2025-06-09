import { useState, useEffect } from 'react';
import type { ContextCard, LocationContextData } from '../../types/locationContext';

interface LocationContextWidgetProps {
  address: string;
  onContextSelect: (selectedCards: ContextCard[]) => void;
  className?: string;
}

export const LocationContextWidget: React.FC<LocationContextWidgetProps> = ({
  address,
  onContextSelect,
  className = ""
}) => {
  const [contextData, setContextData] = useState<LocationContextData | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch context when address changes (debounced)
  useEffect(() => {
    if (!address || address.length < 15) {
      setContextData(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchLocationContext();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [address]);

  const fetchLocationContext = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/listings/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location context');
      }

      const data = await response.json();
      setContextData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (contextData) {
      setSelectedCards(new Set(contextData.cards.map(c => c.id)));
    }
  };

  const clearAll = () => {
    setSelectedCards(new Set());
  };

  const addSelectedToListing = () => {
    if (contextData) {
      const selected = contextData.cards.filter(card => selectedCards.has(card.id));
      onContextSelect(selected);
    }
  };

  // Update parent when selection changes
  useEffect(() => {
    if (contextData) {
      const selected = contextData.cards.filter(card => selectedCards.has(card.id));
      onContextSelect(selected);
    }
  }, [selectedCards, contextData]);

  // Loading state - matches your existing loading patterns
  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Analyzing Neighborhood</h3>
            <p className="text-blue-700 text-sm mt-1">
              Gathering walkability, demographics, schools, and amenities data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 rounded-xl p-6 border border-red-200 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Unable to fetch neighborhood data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchLocationContext}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Try again →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  if (!contextData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header section - modern card design */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Neighborhood Insights</h2>
                <p className="text-gray-600 text-sm">Select relevant data to enhance your listing</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Available insights</div>
            <div className="text-2xl font-bold text-gray-900">{contextData.cards.length}</div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <button 
              onClick={selectAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Select All
            </button>
            <button 
              onClick={clearAll}
              className="text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedCards.size} selected
            </span>
            <button
              onClick={addSelectedToListing}
              disabled={selectedCards.size === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedCards.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add to Listing
            </button>
          </div>
        </div>
      </div>

      {/* Context cards organized by category */}
      {Object.entries(contextData.categorizedCards).map(([category, cards]) => (
        cards.length > 0 && (
          <div key={category} className="space-y-4">
            {/* Category header */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CategoryIcon category={category} />
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category === 'amenities' ? 'Local Amenities' : 
                   category === 'education' ? 'Schools & Education' :
                   category === 'transportation' ? 'Transit & Transportation' :
                   category === 'community' ? 'Demographics & Community' :
                   'Location Features'}
                </h3>
              </div>
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-sm text-gray-500">{cards.length} available</span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cards.map(card => (
                <ContextCard
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.has(card.id)}
                  onToggle={() => toggleCard(card.id)}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

// Individual context card component - matches your design system
const ContextCard: React.FC<{
  card: ContextCard;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ card, isSelected, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 shadow-lg shadow-blue-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all ${
        isSelected 
          ? 'bg-blue-600 border-blue-600' 
          : 'border-gray-300 group-hover:border-gray-400'
      }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      <div className="p-5">
        {/* Card header */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
            {card.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{card.title}</h4>
            {card.preview.quickStat && (
              <div className="text-blue-600 font-bold text-lg mt-1">
                {card.preview.quickStat}
              </div>
            )}
          </div>
        </div>

        {/* Card content */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {card.preview.headline}
        </p>

        {/* Key points */}
        <div className="space-y-1.5">
          {card.preview.bullets.slice(0, isExpanded ? undefined : 2).map((bullet, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="flex-1">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Expand/collapse */}
        {card.preview.bullets.length > 2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Show less' : `Show ${card.preview.bullets.length - 2} more details`}
          </button>
        )}

        {/* Marketing copy preview when expanded */}
        {isExpanded && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
              Marketing Copy Preview
            </div>
            <div className="text-sm text-blue-800 italic">
              "{card.marketingCopy}"
            </div>
          </div>
        )}
      </div>

      {/* Selected state overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-600 bg-opacity-5 rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
};

// Category icons component
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const iconMap: Record<string, React.ReactElement> = {
    location: (
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      </div>
    ),
    community: (
      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    ),
    amenities: (
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    ),
    education: (
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
    ),
    transportation: (
      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
    )
  };

  return iconMap[category] || iconMap.location;
}; 