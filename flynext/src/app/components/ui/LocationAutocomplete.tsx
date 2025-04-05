'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Plane } from 'lucide-react';

type LocationOption = {
  id: string;
  display: string;
  type: 'city' | 'airport';
  code?: string;
  name: string;
  country?: string;
  city?: string;
  airports?: { id: string; code: string; name: string; display: string }[];
};

interface LocationAutocompleteProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (value: string, displayValue: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}

export default function LocationAutocomplete({
  id,
  name,
  value,
  onChange,
  onSelect,
  placeholder,
  className = '',
  required = false
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    // Handle clicks outside of component to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        
        // Process cities
        const cityResults: LocationOption[] = data.cities.map((city: any) => ({
          ...city,
          // Add search tokens to help with matching
          tokens: [
            city.name.toLowerCase(),
            city.country.toLowerCase(),
            `${city.name}, ${city.country}`.toLowerCase()
          ]
        }));
        
        // Process airports
        const airportResults: LocationOption[] = data.airports.map((airport: any) => ({
          ...airport,
          // Add search tokens to help with matching
          tokens: [
            airport.code.toLowerCase(),
            airport.name.toLowerCase(),
            airport.city.toLowerCase(),
            airport.country.toLowerCase(),
            `${airport.code} - ${airport.name}`.toLowerCase(),
            `${airport.code} ${airport.name}`.toLowerCase(),
            `${airport.name} (${airport.city})`.toLowerCase()
          ]
        }));
        
        // Process city airports
        cityResults.forEach(city => {
          if (city.airports) {
            city.airports.forEach(airport => {
              airport.tokens = [
                airport.code.toLowerCase(),
                airport.name.toLowerCase(),
                `${airport.code} - ${airport.name}`.toLowerCase()
              ];
            });
          }
        });
        
        // Combine results and sort by relevance
        const queryLower = query.toLowerCase();
        const combinedResults: LocationOption[] = [
          ...cityResults,
          ...airportResults
        ].sort((a, b) => {
          // Sort by exact airport code match first (3-letter codes like LAX, JFK)
          const aHasExactAirportCode = a.type === 'airport' && a.code?.toLowerCase() === queryLower;
          const bHasExactAirportCode = b.type === 'airport' && b.code?.toLowerCase() === queryLower;
          
          if (aHasExactAirportCode && !bHasExactAirportCode) return -1;
          if (!aHasExactAirportCode && bHasExactAirportCode) return 1;
          
          // Then sort by exact city name match
          const aHasExactCityMatch = a.type === 'city' && a.name.toLowerCase() === queryLower;
          const bHasExactCityMatch = b.type === 'city' && b.name.toLowerCase() === queryLower;
          
          if (aHasExactCityMatch && !bHasExactCityMatch) return -1;
          if (!aHasExactCityMatch && bHasExactCityMatch) return 1;
          
          // Then sort by starts with
          const aStartsWith = a.type === 'city' 
            ? a.name.toLowerCase().startsWith(queryLower) 
            : a.code?.toLowerCase().startsWith(queryLower) || a.name.toLowerCase().startsWith(queryLower);
            
          const bStartsWith = b.type === 'city' 
            ? b.name.toLowerCase().startsWith(queryLower) 
            : b.code?.toLowerCase().startsWith(queryLower) || b.name.toLowerCase().startsWith(queryLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Default alphabetical sort by name
          return a.name.localeCompare(b.name);
        });
        
        setSuggestions(combinedResults);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e);
  };

  const handleSuggestionClick = (suggestion: LocationOption) => {
    let selectedValue = '';
    let displayValue = '';
    
    if (suggestion.type === 'city') {
      selectedValue = suggestion.name;
      displayValue = `${suggestion.name}, ${suggestion.country}`;
    } else if (suggestion.type === 'airport') {
      // For airports, use the code as the value but show the full name
      selectedValue = suggestion.code || '';
      displayValue = `${suggestion.code} - ${suggestion.name} (${suggestion.city})`;
    }
    
    setQuery(displayValue);
    onSelect(selectedValue, displayValue);
    setIsFocused(false);
  };

  // Handle when user presses enter or blurs the input field
  const handleInputBlur = () => {
    // If there's a clear match, select it automatically
    if (query.length >= 2 && suggestions.length > 0) {
      const exactMatch = findBestMatch(query, suggestions);
      if (exactMatch) {
        handleSuggestionClick(exactMatch);
      }
    }
    // Don't set isFocused=false here to allow users to click on suggestions
  };
  
  // Handle keyboard events for navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isFocused && suggestions.length > 0) {
      e.preventDefault();
      const exactMatch = findBestMatch(query, suggestions);
      if (exactMatch) {
        handleSuggestionClick(exactMatch);
      } else if (suggestions.length > 0) {
        // If no exact match, select the first suggestion
        handleSuggestionClick(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };
  
  // Find the best match based on the query
  const findBestMatch = (query: string, suggestions: LocationOption[]): LocationOption | null => {
    const queryLower = query.toLowerCase();
    
    // First check for exact code match (e.g., "JFK")
    const exactCodeMatch = suggestions.find(suggestion => 
      suggestion.type === 'airport' && suggestion.code?.toLowerCase() === queryLower
    );
    if (exactCodeMatch) return exactCodeMatch;
    
    // Then check for exact city name match
    const exactCityMatch = suggestions.find(suggestion => 
      suggestion.type === 'city' && suggestion.name.toLowerCase() === queryLower
    );
    if (exactCityMatch) return exactCityMatch;
    
    // Then check if query is exactly like "Airport Name (City)"
    const exactDisplayMatch = suggestions.find(suggestion => 
      suggestion.display.toLowerCase() === queryLower
    );
    if (exactDisplayMatch) return exactDisplayMatch;
    
    // No exact match found
    return null;
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 pl-10 border rounded-md text-gray-900 ${className}`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      
      {isFocused && (suggestions.length > 0 || isLoading) && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-3 text-gray-500 text-center">
              Loading suggestions...
            </div>
          )}
          
          {!isLoading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-3 text-gray-500 text-center">
              No results found
            </div>
          )}
          
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center">
                {suggestion.type === 'city' ? (
                  <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                  <Plane className="w-4 h-4 text-blue-500 mr-2" />
                )}
                <div>
                  <div className="font-medium text-gray-800">
                    {suggestion.type === 'city' 
                      ? `${suggestion.name}, ${suggestion.country}`
                      : `${suggestion.code} - ${suggestion.name}`
                    }
                  </div>
                  {suggestion.type === 'airport' && (
                    <div className="text-sm text-gray-500">
                      {suggestion.city}, {suggestion.country}
                    </div>
                  )}
                  {suggestion.type === 'city' && suggestion.airports && suggestion.airports.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {suggestion.airports.length} airport{suggestion.airports.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
