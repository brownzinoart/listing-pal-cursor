import React, { useState, useEffect } from 'react';

interface SimpleAddressInputProps {
  value?: string;
  placeholder?: string;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const SimpleAddressInput: React.FC<SimpleAddressInputProps> = ({
  value = '',
  placeholder = 'Start typing the property address...',
  onAddressSelect,
  className = '',
  disabled = false,
  error
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync input value with value prop
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Sample addresses for demo
  const sampleAddresses = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210',
    '789 Pine Road, Austin, TX 78701',
    '321 Elm Street, Miami, FL 33101',
    '555 Broadway, New York, NY 10012',
    '888 Market Street, San Francisco, CA 94102',
    '999 First Avenue, Seattle, WA 98101',
    '777 Second Street, Boston, MA 02101',
    '111 Third Boulevard, Chicago, IL 60601',
    '222 Fourth Avenue, Denver, CO 80201'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length > 2) {
      // Filter sample addresses based on input
      const filtered = sampleAddresses.filter(addr => 
        addr.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setInputValue(selectedAddress);
    setIsOpen(false);
    setSuggestions([]);
    
    // Mock coordinates for demo
    const mockCoordinates = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, 
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    };
    
    onAddressSelect(selectedAddress, mockCoordinates.lat, mockCoordinates.lng);
  };

  const handleManualEntry = () => {
    if (inputValue.trim().length > 5) {
      setIsOpen(false);
      setSuggestions([]);
      
      // Generate reasonable mock coordinates based on common US city centers
      const cityCoordinates = {
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'phoenix': { lat: 33.4484, lng: -112.0740 },
        'philadelphia': { lat: 39.9526, lng: -75.1652 },
        'san antonio': { lat: 29.4241, lng: -98.4936 },
        'san diego': { lat: 32.7157, lng: -117.1611 },
        'dallas': { lat: 32.7767, lng: -96.7970 },
        'san jose': { lat: 37.3382, lng: -121.8863 },
        'austin': { lat: 30.2672, lng: -97.7431 },
        'miami': { lat: 25.7617, lng: -80.1918 },
        'seattle': { lat: 47.6062, lng: -122.3321 },
        'boston': { lat: 42.3601, lng: -71.0589 },
        'denver': { lat: 39.7392, lng: -104.9903 }
      };
      
      // Try to match city in the input
      const inputLower = inputValue.toLowerCase();
      let coords = { lat: 39.8283, lng: -98.5795 }; // Default to center of US
      
      for (const [city, cityCoords] of Object.entries(cityCoordinates)) {
        if (inputLower.includes(city)) {
          coords = {
            lat: cityCoords.lat + (Math.random() - 0.5) * 0.1,
            lng: cityCoords.lng + (Math.random() - 0.5) * 0.1
          };
          break;
        }
      }
      
      onAddressSelect(inputValue, coords.lat, coords.lng);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAddressSelect(suggestions[0]);
      } else {
        handleManualEntry();
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.length > 2 && suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          ${error 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Manual entry button */}
      {inputValue.trim().length > 5 && !isOpen && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleManualEntry}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
          >
            ✓ Use "{inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue}" as address
          </button>
        </div>
      )}

      {/* Helper text */}
      {!inputValue && (
        <p className="text-xs text-gray-500 mt-1">
          Type any address or try: "123 Main", "456 Oak", "New York", "Austin", etc.
        </p>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddressSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion}
                  </p>
                  <p className="text-xs text-gray-500">Quick option</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Manual entry prompt for longer addresses */}
      {isOpen && inputValue.length > 10 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <button
            type="button"
            onClick={handleManualEntry}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ✓ Use "{inputValue}" as your address
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput; 