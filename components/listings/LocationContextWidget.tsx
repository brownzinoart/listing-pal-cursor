import React, { useState, useEffect } from 'react';
import { ContextCard, LocationContextData } from '../../types/locationContext.js';

export const LocationContextWidget: React.FC<{
  address: string;
  onContextSelect: (selectedCards: ContextCard[]) => void;
}> = ({ address, onContextSelect }) => {
  const [contextData, setContextData] = useState<LocationContextData | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch all context when address changes
  useEffect(() => {
    if (address.length > 15) {
      fetchAllContext();
    }
  }, [address]);

  const fetchAllContext = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/listings/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      setContextData(data);
    } catch (error) {
      console.error('Failed to fetch context:', error);
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

  const addSelectedToListing = () => {
    if (contextData) {
      const selected = contextData.cards.filter(card => selectedCards.has(card.id));
      onContextSelect(selected);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="animate-pulse">Gathering neighborhood data...</div>
      </div>
    );
  }

  if (!contextData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">📍 Available Neighborhood Insights</h3>
          <p className="text-sm text-gray-600">Select insights to include in your listing</p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedCards.size} selected
        </div>
      </div>

      {/* Organized by category */}
      {Object.entries(contextData.categorizedCards).map(([category, cards]) => (
        cards.length > 0 && (
          <div key={category}>
            <h4 className="text-md font-medium text-gray-700 mb-3 capitalize">
              {category === 'amenities' ? '🏪' : category === 'education' ? '🎓' : category === 'transportation' ? '🚌' : category === 'community' ? '👥' : '📍'} {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map(card => (
                <ContextCardComponent
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

      {/* Bottom action */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-3">
          <button 
            onClick={() => setSelectedCards(new Set(contextData.cards.map(c => c.id)))}
            className="text-sm text-blue-600 hover:underline"
          >
            Select All
          </button>
          <button 
            onClick={() => setSelectedCards(new Set())}
            className="text-sm text-gray-600 hover:underline"
          >
            Clear All
          </button>
        </div>
        
        <button
          onClick={addSelectedToListing}
          disabled={selectedCards.size === 0}
          className={`px-4 py-2 rounded font-medium ${
            selectedCards.size > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Add {selectedCards.size} to Listing
        </button>
      </div>
    </div>
  );
};

// Individual context card - simplified
const ContextCardComponent: React.FC<{
  card: ContextCard;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ card, isSelected, onToggle }) => {
  return (
    <div 
      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{card.icon}</span>
            <h4 className="font-medium">{card.title}</h4>
            {card.preview.quickStat && (
              <span className="text-blue-600 font-bold">{card.preview.quickStat}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{card.preview.headline}</p>
          
          <div className="mt-2 space-y-1">
            {card.preview.bullets.slice(0, 2).map((bullet, idx) => (
              <div key={idx} className="text-xs text-gray-500">• {bullet}</div>
            ))}
          </div>
        </div>
        
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="ml-2"
        />
      </div>
    </div>
  );
}; 