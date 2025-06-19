import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  placeholder?: string;
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  placeholder = "Start typing an address...",
  onAddressSelect,
}) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [lastSearchHadResults, setLastSearchHadResults] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Real Google Places API search function (via backend proxy)
  const performSearch = useCallback(async (query: string) => {
    console.log("🔍 Searching Google Places for:", query);

    if (query.length < 2) {
      console.log("❌ Query too short");
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      setSearchAttempted(false);
      setLastSearchHadResults(false);
      return;
    }

    // Check for demo address pattern
    const demoPattern = /123\s*demo/i;
    if (demoPattern.test(query)) {
      console.log("🎭 Demo address detected, providing demo suggestions");
      const demoSuggestions: PlacePrediction[] = [
        {
          description: "123 Demo Dr., Demo, DM 12345",
          place_id: "demo_place_123",
          structured_formatting: {
            main_text: "123 Demo Dr.",
            secondary_text: "Demo, DM 12345",
          },
        },
      ];
      setSuggestions(demoSuggestions);
      setShowSuggestions(true);
      setLastSearchHadResults(true);
      setSelectedIndex(-1);
      setIsLoading(false);
      setSearchAttempted(true);
      return;
    }

    setIsLoading(true);
    setSearchAttempted(true);

    try {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const url = `/api/places/autocomplete?input=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.predictions) {
        const predictions = data.predictions.slice(0, 8); // Limit to 8 suggestions
        console.log("✅ Found Google Places suggestions:", predictions.length);
        console.log(
          "📋 Suggestions:",
          predictions.map((p: any) => p.structured_formatting.main_text),
        );

        setSuggestions(predictions);
        setShowSuggestions(predictions.length > 0);
        setLastSearchHadResults(predictions.length > 0);
        setSelectedIndex(-1);
      } else if (data.error) {
        console.error("❌ Backend API error:", data.error);
        setSuggestions([]);
        setShowSuggestions(false);
        setLastSearchHadResults(false);
      } else {
        console.log("⚠️ No predictions found or API error:", data.status);
        setSuggestions([]);
        setShowSuggestions(false);
        setLastSearchHadResults(false);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("❌ Google Places API error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        setLastSearchHadResults(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("📝 Input changed:", newValue);
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const getPlaceDetails = async (
    placeId: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log("🎯 Getting coordinates for place ID:", placeId);

      // Handle demo place ID
      if (placeId === "demo_place_123") {
        console.log("🎭 Demo place ID detected, returning demo coordinates");
        return { lat: 40.7589, lng: -73.9851 }; // Demo coordinates (NYC area)
      }

      const url = `/api/places/details?place_id=${placeId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log("✅ Got coordinates:", { lat, lng });
        return { lat, lng };
      } else {
        console.warn("⚠️ Could not get place details:", data.status);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting place details:", error);
      return null;
    }
  };

  const handleSuggestionClick = async (suggestion: PlacePrediction) => {
    console.log("🎯 Selected suggestion:", suggestion.description);
    setInputValue(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);

    // Get coordinates from Google Places
    const coordinates = await getPlaceDetails(suggestion.place_id);

    if (coordinates) {
      console.log(
        "📞 Calling onAddressSelect with:",
        suggestion.description,
        coordinates.lat,
        coordinates.lng,
      );
      onAddressSelect(suggestion.description, coordinates.lat, coordinates.lng);
    } else {
      console.log(
        "📞 Calling onAddressSelect without coordinates:",
        suggestion.description,
      );
      // Fallback without coordinates
      onAddressSelect(suggestion.description);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && inputValue.trim().length > 5) {
        e.preventDefault();
        handleManualEntry();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (inputValue.trim().length > 5) {
          handleManualEntry();
        }
        break;
      case "Escape":
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

      // For manual entry, provide default coordinates (center of US)
      const coords = { lat: 39.8283, lng: -98.5795 };

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
    console.log("🎯 Input focused, current value:", inputValue);
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
          className="w-full bg-brand-input-bg border-brand-border rounded-lg text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary pl-10 pr-10 py-2"
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

      {/* Manual entry button - only show when search was performed but no suggestions found */}
      {!isLoading &&
        inputValue.trim().length > 5 &&
        searchAttempted &&
        !lastSearchHadResults &&
        !showSuggestions && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleManualEntry}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
            >
              ✓ Use "
              {inputValue.length > 30
                ? inputValue.substring(0, 30) + "..."
                : inputValue}
              " as address
            </button>
          </div>
        )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                index === selectedIndex ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message with manual entry option */}
      {showSuggestions &&
        suggestions.length === 0 &&
        !isLoading &&
        inputValue.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl">
            <div className="px-4 py-3">
              <div className="text-sm text-gray-600 text-center mb-2">
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
    </div>
  );
};

export default AddressAutocomplete;
