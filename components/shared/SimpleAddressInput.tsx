import React, { useState } from 'react';

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

  // Sample addresses for demo
  const sampleAddresses = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210',
    '789 Pine Road, Austin, TX 78701',
    '321 Elm Street, Miami, FL 33101',
    '555 Broadway, New York, NY 10012',
    '888 Market Street, San Francisco, CA 94102'
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
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

      {/* Demo Notice */}
      <p className="text-xs text-gray-500 mt-1">
        Demo mode: Type "123", "456", "Oak", "New York", etc. to see suggestions
      </p>

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
                  <p className="text-xs text-gray-500">Demo address</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && inputValue.length > 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            Try typing: "123", "456", "Oak", "New York", "Austin", or "Miami"
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput; 