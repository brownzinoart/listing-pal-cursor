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
  const [initError, setInitError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with value prop
  useEffect(() => {
    if (value !== inputValue) {
      console.log('🔄 AddressAutocomplete: Syncing value prop:', value);
      setInputValue(value);
    }
  }, [value]);

    // Initialize Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('🔍 AddressAutocomplete: API Key available:', !!apiKey);
    console.log('🔍 AddressAutocomplete: API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      setInitError('Google Maps API key not found in environment variables');
      console.error('❌ VITE_GOOGLE_MAPS_API_KEY not set in environment');
      return;
    }

    const initGoogleMaps = () => {
      console.log('🔍 AddressAutocomplete: Checking existing Google Maps...', {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasPlaces: !!(window.google && window.google.maps && window.google.maps.places),
        hasAutoService: !!(window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService)
      });
      
      if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
        console.log('✅ AddressAutocomplete: Google Maps already loaded and ready!');
        setIsGoogleMapsReady(true);
        setInitError(null);
        return;
      }

      // Simplified loading approach - don't check for existing scripts, just load fresh
      console.log('🔄 AddressAutocomplete: Loading Google Maps Script...');
      
      const callbackName = `initAddressAutocomplete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      (window as any)[callbackName] = () => {
        console.log('📞 AddressAutocomplete: Google Maps callback triggered');
        
        // Add a small delay to ensure everything is loaded
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
            console.log('✅ AddressAutocomplete: Google Maps loaded successfully!');
            setIsGoogleMapsReady(true);
            setInitError(null);
          } else {
            console.error('❌ AddressAutocomplete: Google Maps not properly loaded in callback');
            setInitError('Google Maps failed to load properly - you can still type addresses manually');
          }
          
          // Clean up the callback
          delete (window as any)[callbackName];
        }, 100);
      };

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
      
      script.onerror = (error) => {
        console.error('❌ AddressAutocomplete: Failed to load Google Maps script:', error);
        setInitError('Failed to load Google Maps - you can still type addresses manually');
        delete (window as any)[callbackName];
      };

      // Simplified timeout - just give up gracefully
      setTimeout(() => {
        if (!isGoogleMapsReady && (window as any)[callbackName]) {
          console.error('❌ AddressAutocomplete: Script loading timeout after 15 seconds');
          setInitError('Autocomplete unavailable - you can still type addresses manually');
          delete (window as any)[callbackName];
          script.remove();
        }
      }, 15000);

      document.head.appendChild(script);
    };

    initGoogleMaps();
  }, []);

  // Handle input changes and fetch suggestions
  useEffect(() => {
    console.log(`🔍 AddressAutocomplete: Effect triggered - Ready: ${isGoogleMapsReady}, Input: "${inputValue}"`);
    
    if (!isGoogleMapsReady || !inputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    const timeoutId = setTimeout(async () => {
      console.log(`🔍 AddressAutocomplete: Fetching suggestions for: "${inputValue}"`);
      console.log(`🔍 AddressAutocomplete: Google Maps availability check:`, {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasPlaces: !!(window.google && window.google.maps && window.google.maps.places),
        hasAutoService: !!(window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService)
      });
      
      try {
        // Always use the working AutocompleteService for now
        // The new AutocompleteSuggestion API is not fully available yet
        if (window.google?.maps?.places?.AutocompleteService) {
          console.log('✅ AddressAutocomplete: Using AutocompleteService API (working solution)');
          
          const autocompleteService = new window.google.maps.places.AutocompleteService();
          console.log('✅ AddressAutocomplete: AutocompleteService instance created');
          
          autocompleteService.getPlacePredictions(
            {
              input: inputValue,
              componentRestrictions: { country: 'us' },
            },
            (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
              setIsLoading(false);
              console.log('📍 AddressAutocomplete: AutocompleteService Response:', { 
                status, 
                statusName: Object.keys(window.google.maps.places.PlacesServiceStatus).find(
                  key => (window.google.maps.places.PlacesServiceStatus as any)[key] === status
                ),
                predictionsCount: predictions?.length || 0,
                inputValue
              });
              
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
                setIsOpen(true);
                console.log(`✅ AddressAutocomplete: Found ${predictions.length} suggestions for "${inputValue}"`);
                console.log('✅ AddressAutocomplete: First suggestion:', predictions[0]?.description);
              } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                setSuggestions([]);
                setIsOpen(false);
                console.log(`ℹ️ AddressAutocomplete: No suggestions found for "${inputValue}"`);
              } else {
                setSuggestions([]);
                setIsOpen(false);
                console.error(`❌ AddressAutocomplete: AutocompleteService error for "${inputValue}":`, status);
                
                if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                  setInitError('Google Places API request denied - check API key and billing');
                } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                  setInitError('Google Places API quota exceeded');
                } else {
                  setInitError(`Places API error: ${status}`);
                }
              }
            }
          );
        } else {
          console.error('❌ AddressAutocomplete: Google Places AutocompleteService not available');
          throw new Error('Google Places AutocompleteService not available');
        }
      } catch (error) {
        console.error('❌ AddressAutocomplete: Places API error:', error);
        setIsLoading(false);
        setSuggestions([]);
        setIsOpen(false);
        setInitError('Failed to fetch address suggestions');
      }
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

    console.log('📍 Selected address:', selectedAddress);

    // Get detailed place information including coordinates
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          console.log('✅ Geocoded coordinates:', { lat, lng });
          onAddressSelect(selectedAddress, lat, lng);
        } else {
          console.log('⚠️ Geocoding failed, using address without coordinates:', status);
          onAddressSelect(selectedAddress, 0, 0);
        }
      });
    } else {
      console.log('⚠️ Google Maps not available for geocoding');
      onAddressSelect(selectedAddress, 0, 0);
    }
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
        placeholder={isGoogleMapsReady ? placeholder : initError ? 'Type address manually (autocomplete unavailable)' : 'Type address (loading autocomplete...)'}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          ${error || initError
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
      />

      {/* Show warning if Google Maps isn't working, but don't disable input */}
      {!isGoogleMapsReady && !initError && (
        <p className="text-amber-600 text-xs mt-1">⚠️ Autocomplete loading... You can still type addresses manually.</p>
      )}

      {/* Manual address entry option when autocomplete isn't working */}
      {!isGoogleMapsReady && inputValue.trim().length > 5 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => handleAddressSelect(inputValue)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
          >
            ✓ Use "{inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue}" as address
          </button>
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Include city, state, and ZIP for best results
          </p>
        </div>
      )}

      {(error || initError) && (
        <p className="text-red-500 text-xs mt-1">{error || initError} - You can still type addresses manually.</p>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1 space-y-1">
          <div>Status: {isGoogleMapsReady ? '✅ Ready' : initError ? '❌ Error' : '🔄 Loading'}</div>
          {initError && <div className="text-red-500">Error: {initError}</div>}
          {isGoogleMapsReady && (
            <div className="text-green-600">
              API: AutocompleteService (working)
            </div>
          )}
          {!isGoogleMapsReady && !initError && (
            <div className="text-blue-600">
              ⏳ Loading... (Manual entry available if this takes too long)
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {(isLoading || (!isGoogleMapsReady && !initError)) && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown Suggestions - Only show if Google Maps is ready */}
      {isOpen && suggestions.length > 0 && isGoogleMapsReady && (
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