import React, { useRef, useEffect, useState } from 'react';

interface AddressAutocompleteProps {
  value?: string;
  placeholder?: string;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = '',
  placeholder = 'Start typing the property address...',
  onAddressSelect,
  className = '',
  disabled = false,
  error
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        setIsGoogleMapsReady(true);
        console.log('✅ Google Maps Places API ready for autocomplete');
      } else {
        // Load Google Maps if not already loaded
        const script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAddressAutocomplete`;
        
        (window as any).initAddressAutocomplete = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            setIsGoogleMapsReady(true);
            console.log('✅ Google Maps Places API loaded and ready');
          }
        };

        script.onerror = () => {
          console.error('❌ Failed to load Google Maps');
        };

        document.head.appendChild(script);
      }
    };

    initGoogleMaps();
  }, []);

  // Handle input changes and fetch suggestions
  useEffect(() => {
    if (!isGoogleMapsReady || !autocompleteServiceRef.current || !inputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    const timeoutId = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: inputValue,
          componentRestrictions: { country: 'us' },
        },
        (predictions: any[], status: any) => {
          setIsLoading(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setIsOpen(true);
            console.log(`Found ${predictions.length} suggestions for "${inputValue}"`);
          } else {
            setSuggestions([]);
            setIsOpen(false);
            console.log(`No suggestions found for "${inputValue}" (Status: ${status})`);
          }
        }
      );
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue, isGoogleMapsReady]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  // Handle address selection
  const handleAddressSelect = async (selectedAddress: string) => {
    setInputValue(selectedAddress);
    setIsOpen(false);
    setSuggestions([]);

    console.log('Selected address:', selectedAddress);

    // Get detailed place information including coordinates
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: selectedAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        console.log('Geocoded coordinates:', { lat, lng });
        onAddressSelect(selectedAddress, lat, lng);
      } else {
        console.log('Geocoding failed, using address without coordinates');
        onAddressSelect(selectedAddress, 0, 0);
      }
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue && suggestions.length > 0 && setIsOpen(true)}
        placeholder={isGoogleMapsReady ? placeholder : 'Loading Google Maps...'}
        disabled={disabled || !isGoogleMapsReady}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          ${error 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
          ${disabled || !isGoogleMapsReady ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Loading indicator */}
      {(isLoading || !isGoogleMapsReady) && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              onClick={() => handleAddressSelect(suggestion.description)}
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
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.structured_formatting?.secondary_text || ''}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && !isLoading && suggestions.length === 0 && inputValue.trim() && isGoogleMapsReady && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No addresses found. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 