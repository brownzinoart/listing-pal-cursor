import React, { useState } from 'react';
import type { ContextCard } from '../types/locationContext';
import { LocationContextWidget } from '../components/listings/LocationContextWidget';

interface FormData {
  address: string;
  description: string;
  // ... other form fields
}

export const CreateListingFormExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    address: '',
    description: '',
  });
  
  const [selectedContextCards, setSelectedContextCards] = useState<ContextCard[]>([]);

  const handleContextSelection = (cards: ContextCard[]) => {
    setSelectedContextCards(cards);
    
    // Option 1: Auto-append to description when cards are selected
    if (cards.length > 0) {
      const contextText = cards.map(card => card.marketingCopy).join('\n\n');
      setFormData(prev => ({
        ...prev,
        description: prev.description + 
          (prev.description ? '\n\n--- Neighborhood Highlights ---\n\n' : '') + 
          contextText
      }));
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setFormData(prev => ({ ...prev, address: newAddress }));
    // Clear previous context when address changes
    setSelectedContextCards([]);
  };

  return (
    <div className="space-y-8">
      {/* Address Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Address
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Enter property address..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Location Context Widget - shows when address is entered */}
      {formData.address && (
        <LocationContextWidget
          address={formData.address}
          onContextSelect={handleContextSelection}
          className="mt-6"
        />
      )}

      {/* Selected Context Summary */}
      {selectedContextCards.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            ✅ Selected Neighborhood Insights ({selectedContextCards.length})
          </h3>
          <div className="space-y-1">
            {selectedContextCards.map(card => (
              <div key={card.id} className="text-sm text-green-700">
                {card.icon} {card.title} - {card.preview.quickStat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={8}
          placeholder="Describe the property..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Save Draft
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Publish Listing
        </button>
      </div>
    </div>
  );
};

// Alternative: Manual insertion approach
export const ManualInsertionExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    address: '',
    description: '',
  });
  
  const [availableContext, setAvailableContext] = useState<ContextCard[]>([]);

  const handleContextSelection = (cards: ContextCard[]) => {
    // Store available context, don't auto-insert
    setAvailableContext(cards);
  };

  const insertContextAtCursor = (card: ContextCard) => {
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = formData.description;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      const newText = before + '\n\n' + card.marketingCopy + '\n\n' + after;
      
      setFormData(prev => ({ ...prev, description: newText }));
      
      // Focus back to textarea
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + card.marketingCopy.length + 4, start + card.marketingCopy.length + 4);
      }, 0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form - Left Side */}
      <div className="lg:col-span-2 space-y-6">
        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter property address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Description
            <span className="text-gray-500 text-xs ml-2">
              (Click insights on the right to insert them)
            </span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={12}
            placeholder="Describe the property... Click neighborhood insights to insert them here."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Context Sidebar - Right Side */}
      <div className="lg:col-span-1">
        {formData.address ? (
          <div className="sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📍 Quick Insert
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Click any insight to insert it into your description at the cursor position.
            </p>
            
            {/* Compact context cards for sidebar */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableContext.map(card => (
                <div
                  key={card.id}
                  onClick={() => insertContextAtCursor(card)}
                  className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">{card.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{card.title}</span>
                    {card.preview.quickStat && (
                      <span className="text-xs text-blue-600 font-bold">{card.preview.quickStat}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {card.preview.headline}
                  </p>
                </div>
              ))}
            </div>

            {/* Fetch context data hidden widget */}
            <div className="hidden">
              <LocationContextWidget
                address={formData.address}
                onContextSelect={handleContextSelection}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-sm">Enter an address to see neighborhood insights</p>
          </div>
        )}
      </div>
    </div>
  );
}; 