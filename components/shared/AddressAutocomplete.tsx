import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  placeholder?: string;
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
  className?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Mock data that represents real addresses
const mockAddresses: PlacePrediction[] = [
  {
    description: "123 Main Street, New York, NY 10001, USA",
    place_id: "1",
    structured_formatting: {
      main_text: "123 Main Street",
      secondary_text: "New York, NY 10001, USA"
    }
  },
  {
    description: "456 Oak Avenue, Los Angeles, CA 90210, USA", 
    place_id: "2",
    structured_formatting: {
      main_text: "456 Oak Avenue",
      secondary_text: "Los Angeles, CA 90210, USA"
    }
  },
  {
    description: "789 Pine Road, Austin, TX 78701, USA",
    place_id: "3", 
    structured_formatting: {
      main_text: "789 Pine Road",
      secondary_text: "Austin, TX 78701, USA"
    }
  },
  {
    description: "321 Elm Street, Miami, FL 33101, USA",
    place_id: "4",
    structured_formatting: {
      main_text: "321 Elm Street", 
      secondary_text: "Miami, FL 33101, USA"
    }
  },
  {
    description: "555 Broadway, New York, NY 10012, USA",
    place_id: "5",
    structured_formatting: {
      main_text: "555 Broadway",
      secondary_text: "New York, NY 10012, USA"
    }
  },
  {
    description: "888 Market Street, San Francisco, CA 94102, USA",
    place_id: "6",
    structured_formatting: {
      main_text: "888 Market Street",
      secondary_text: "San Francisco, CA 94102, USA"
    }
  },
  {
    description: "999 First Avenue, Seattle, WA 98101, USA",
    place_id: "7",
    structured_formatting: {
      main_text: "999 First Avenue",
      secondary_text: "Seattle, WA 98101, USA"
    }
  },
  {
    description: "777 Second Street, Boston, MA 02101, USA",
    place_id: "8",
    structured_formatting: {
      main_text: "777 Second Street",
      secondary_text: "Boston, MA 02101, USA"
    }
  },
  {
    description: "100 Apex Drive, Apex, NC 27502, USA",
    place_id: "9",
    structured_formatting: {
      main_text: "100 Apex Drive",
      secondary_text: "Apex, NC 27502, USA"
    }
  },
  {
    description: "200 Raleigh Street, Raleigh, NC 27601, USA",
    place_id: "10",
    structured_formatting: {
      main_text: "200 Raleigh Street",
      secondary_text: "Raleigh, NC 27601, USA"
    }
  },
  // Add more realistic addresses for common searches
  {
    description: "9307 Reedybrook Crossing, Charlotte, NC 28277, USA",
    place_id: "11",
    structured_formatting: {
      main_text: "9307 Reedybrook Crossing",
      secondary_text: "Charlotte, NC 28277, USA"
    }
  },
  {
    description: "1234 Reedybrook Lane, Raleigh, NC 27612, USA",
    place_id: "12",
    structured_formatting: {
      main_text: "1234 Reedybrook Lane",
      secondary_text: "Raleigh, NC 27612, USA"
    }
  },
  {
    description: "5678 Brook Crossing Drive, Apex, NC 27539, USA",
    place_id: "13",
    structured_formatting: {
      main_text: "5678 Brook Crossing Drive",
      secondary_text: "Apex, NC 27539, USA"
    }
  },
  {
    description: "1111 Crossing Pointe Lane, Cary, NC 27519, USA",
    place_id: "14",
    structured_formatting: {
      main_text: "1111 Crossing Pointe Lane",
      secondary_text: "Cary, NC 27519, USA"
    }
  },
  {
    description: "2222 Ridge Brook Court, Durham, NC 27705, USA",
    place_id: "15",
    structured_formatting: {
      main_text: "2222 Ridge Brook Court",
      secondary_text: "Durham, NC 27705, USA"
    }
  },
  {
    description: "3333 Stone Brook Way, Chapel Hill, NC 27514, USA",
    place_id: "16",
    structured_formatting: {
      main_text: "3333 Stone Brook Way",
      secondary_text: "Chapel Hill, NC 27514, USA"
    }
  },
  {
    description: "4444 Creek Crossing Blvd, Wake Forest, NC 27587, USA",
    place_id: "17",
    structured_formatting: {
      main_text: "4444 Creek Crossing Blvd",
      secondary_text: "Wake Forest, NC 27587, USA"
    }
  },
  {
    description: "5555 Willow Brook Circle, Morrisville, NC 27560, USA",
    place_id: "18",
    structured_formatting: {
      main_text: "5555 Willow Brook Circle",
      secondary_text: "Morrisville, NC 27560, USA"
    }
  }
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  placeholder = "Start typing an address...",
  onAddressSelect,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Simplified search function
  const performSearch = useCallback((query: string) => {
    console.log('🔍 Performing search for:', query);
    
    if (query.length < 2) {
      console.log('❌ Query too short');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Filter suggestions
    const filtered = mockAddresses.filter(suggestion => 
      suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.structured_formatting.main_text.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.structured_formatting.secondary_text.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('✅ Found suggestions:', filtered.length);
    console.log('📋 Suggestions:', filtered.map(s => s.structured_formatting.main_text));
    
    // Simulate API delay
    setTimeout(() => {
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 200);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('📝 Input changed:', newValue);
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handleSuggestionClick = async (suggestion: PlacePrediction) => {
    console.log('🎯 Selected suggestion:', suggestion.description);
    setInputValue(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Generate realistic coordinates based on city
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'austin': { lat: 30.2672, lng: -97.7431 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'apex': { lat: 35.7321, lng: -78.8503 },
      'raleigh': { lat: 35.7796, lng: -78.6382 },
      'nc': { lat: 35.7596, lng: -79.0193 }
    };
    
    const city = suggestion.structured_formatting.secondary_text.toLowerCase();
    let coordinates = { lat: 39.8283, lng: -98.5795 }; // Default center US
    
    for (const [cityName, coords] of Object.entries(cityCoordinates)) {
      if (city.includes(cityName)) {
        coordinates = {
          lat: coords.lat + (Math.random() - 0.5) * 0.01,
          lng: coords.lng + (Math.random() - 0.5) * 0.01
        };
        break;
      }
    }
    
    onAddressSelect(suggestion.description, coordinates.lat, coordinates.lng);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && inputValue.trim().length > 5) {
        e.preventDefault();
        handleManualEntry();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (inputValue.trim().length > 5) {
          handleManualEntry();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleManualEntry = () => {
    if (inputValue.trim().length > 5) {
      setShowSuggestions(false);
      setSuggestions([]);
      
      // Smart coordinate assignment based on common US cities
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'austin': { lat: 30.2672, lng: -97.7431 },
        'miami': { lat: 25.7617, lng: -80.1918 },
        'seattle': { lat: 47.6062, lng: -122.3321 },
        'boston': { lat: 42.3601, lng: -71.0589 },
        'denver': { lat: 39.7392, lng: -104.9903 },
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'apex': { lat: 35.7321, lng: -78.8503 },
        'raleigh': { lat: 35.7796, lng: -78.6382 },
        'nc': { lat: 35.7596, lng: -79.0193 }
      };
      
      const inputLower = inputValue.toLowerCase();
      let coords = { lat: 39.8283, lng: -98.5795 }; // Default to center of US
      
      for (const [city, cityCoords] of Object.entries(cityCoordinates)) {
        if (inputLower.includes(city)) {
          coords = {
            lat: cityCoords.lat + (Math.random() - 0.5) * 0.01,
            lng: cityCoords.lng + (Math.random() - 0.5) * 0.01
          };
          break;
        }
      }
      
      onAddressSelect(inputValue, coords.lat, coords.lng);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    console.log('🎯 Input focused, current value:', inputValue);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (inputValue.length >= 2) {
      debouncedSearch(inputValue);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 ${className}`}
          autoComplete="off"
        />
        
        {/* Address icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <MapPin className="w-5 h-5 text-brand-text-tertiary" />
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1">
          🐛 Debug: {suggestions.length} suggestions, showing: {showSuggestions ? 'yes' : 'no'}, loading: {isLoading ? 'yes' : 'no'}
        </div>
      )}

      {/* Manual entry button */}
      {!showSuggestions && !isLoading && inputValue.trim().length > 5 && (
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

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-brand-panel border border-brand-border rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-brand-input-bg transition-colors border-b border-brand-border last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                index === selectedIndex ? 'bg-brand-input-bg' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-text-tertiary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-brand-text-primary truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-brand-text-secondary truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message with manual entry option */}
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-brand-panel border border-brand-border rounded-xl shadow-2xl">
          <div className="px-4 py-3">
            <div className="text-sm text-brand-text-tertiary text-center mb-2">
              No matching addresses found
            </div>
            {inputValue.length > 5 && (
              <button
                type="button"
                onClick={handleManualEntry}
                className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ✓ Use "{inputValue}" as your address
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helper text */}
      {!inputValue && (
        <p className="text-xs text-brand-text-secondary mt-1">
          💡 Start typing or try: "123 Main", "456 Oak", "New York", "Austin"
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete; 