import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  ShoppingCart,
  Heart,
  Wallet,
  Building,
  Car,
  Sun,
  TrendingUp,
  Star,
  Plus,
  Check,
  Settings,
  X,
  AlertCircle,
  Search,
  Clock,
  Package,
  Zap,
  Calculator,
  Database,
  TrendingDown,
  BarChart3,
  Home
} from 'lucide-react';

// Real-time neighborhood data structure
const emptyNeighborhoodData = {
  walkScore: 0,
  transitScore: 0,
  bikeScore: 0,
  schools: [] as Array<{
    name: string;
    rating: number;
    distance: string;
    type: string;
  }>,
  amenities: [] as Array<{
    name: string;
    category: string;
    distance: string;
    icon: string;
  }>,
  demographics: {
    medianAge: 0,
    medianIncome: 0,
    familyFriendly: 0,
    diversityIndex: 0
  },
  marketTrends: {
    medianPrice: 0,
    medianRent: 0,
    priceChange: "0%",
    daysOnMarket: 0,
    inventory: "Unknown",
    pricePerSqFt: 0,
    marketType: 'Balanced Market' as 'Seller\'s Market' | 'Buyer\'s Market' | 'Balanced Market'
  },
  propertyEstimate: {
    value: 0,
    valueRange: '',
    rent: 0,
    rentRange: '',
    comparablesCount: 0
  },
  comparables: [] as Array<{ address: string; price: number; pricePerSqFt: number }>,
  marketInsights: [] as Array<{ title: string; message: string; tone: 'info' | 'success' | 'warning' | 'neutral' }>,
  highlights: [] as string[],
  schoolDistrictSummary: "",
  crimeData: {
    score: 0,
    violent: 0,
    property: 0
  },
  dataAvailability: {
    schools: false,
    amenities: false,
    overview: false,
    market: false,
    walkability: false,
    crime: false
  },
  dataSources: {
    schools: 'none',
    amenities: 'none',
    walkability: 'none',
    market: 'none',
    crime: 'none'
  }
};

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, icon, description }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transform transition-all duration-200 cursor-pointer">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <div className={`text-2xl font-bold ${
        score >= 80 ? 'text-green-600' : 
        score >= 60 ? 'text-yellow-600' : 
        'text-red-600'
      }`}>
        {score}
      </div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${
          score >= 80 ? 'bg-green-500' : 
          score >= 60 ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

interface SchoolCardProps {
  school: {
    name: string;
    rating: number;
    distance: string;
    type: string;
  };
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-[1.01] transform transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{school.name}</h4>
        <p className="text-sm text-gray-600">{school.type} • {school.distance}</p>
      </div>
      <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
        <Star className="w-3 h-3 text-blue-600" />
        <span className="text-sm font-bold text-blue-800">{school.rating}</span>
        <span className="text-xs text-blue-600">/10</span>
      </div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div 
        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
        style={{ width: `${school.rating * 10}%` }}
      ></div>
    </div>
  </div>
);

interface AmenityCardProps {
  amenity: {
    name: string;
    category: string;
    distance: string;
    icon: string;
  };
}

const AmenityCard: React.FC<AmenityCardProps> = ({ amenity }) => (
  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
    <span className="text-2xl">{amenity.icon}</span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{amenity.name}</p>
      <p className="text-sm text-gray-600">{amenity.category} • {amenity.distance}</p>
    </div>
  </div>
);

// Empty state component for when no data is available
const EmptyStateCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  showGenericNote?: boolean; 
}> = ({ title, description, icon, showGenericNote = true }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
    <div className="mb-4 p-3 bg-gray-100 rounded-full">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 max-w-sm mb-3">{description}</p>
    {showGenericNote && (
      <p className="text-xs text-gray-500 max-w-sm">
        💡 You can still research and add general information about this category to your listing manually.
      </p>
    )}
  </div>
);

interface NeighborhoodInsightsProps {
  address?: string;
  listingPrice?: number;
  listingType?: string; // 'sale' or 'rental'
  lat?: number;
  lng?: number;
  onSectionAdd?: (section: string, content: string) => void;
  onSectionRemove?: (section: string, content: string) => void;
  selectedSections?: string[];
  onSectionToggle: (sections: string[]) => void;
  addedSections: string[];
  viewMode?: boolean;
}

const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({
  address,
  listingPrice,
  listingType = 'sale',
  lat,
  lng,
  onSectionAdd,
  onSectionRemove,
  selectedSections = [],
  onSectionToggle,
  addedSections,
  viewMode = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(emptyNeighborhoodData);
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({});
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [showAddInsightModal, setShowAddInsightModal] = useState(false);
  const [dataQuality, setDataQuality] = useState<'excellent' | 'good' | 'limited' | 'minimal'>('minimal');

  // NOTE: We intentionally no longer sync activeTab with addedSections here
  // to avoid overriding the user's current tab selection.

  // Fetch real neighborhood data when address changes
  useEffect(() => {
    if (address && address.length > 10) {
      fetchNeighborhoodData(address);
    }
  }, [address]);

  const calculateDataQuality = (data: any) => {
    let score = 0;
    // Verified, real-world data is worth more.
    if (data.dataSources?.schools === 'real') score += 2;
    else if (data.dataSources?.schools === 'ai') score += 1;

    if (data.dataSources?.amenities === 'real') score += 2;
    else if (data.dataSources?.amenities === 'ai') score += 1;

    // Excellent: Both sources are from verified APIs.
    if (score >= 4) return 'excellent';
    // Good: At least one source is verified and the other is AI-suggested.
    if (score >= 3) return 'good';
    // Limited: Data is available but may be entirely AI-suggested or from a single source.
    if (score >= 1) return 'limited';
    // Minimal: No data could be found.
    return 'minimal';
  };

  const fetchNeighborhoodData = async (address: string) => {
    setLoading(true);
    console.log('🏠 NeighborhoodInsights - Starting fetch for address:', address);
    
    try {
      // First try to get coordinates if not provided
      let lat_coord, lng_coord, zip_code;
      
      if (!lat || !lng) {
        console.log('🔍 Getting coordinates from Google Places API...');
        const geocodeResponse = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(address)}`);
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          console.log('📍 Geocode response:', geocodeData);
          if (geocodeData.predictions?.[0]) {
            const detailsResponse = await fetch(`/api/places/details?place_id=${geocodeData.predictions[0].place_id}`);
            if (detailsResponse.ok) {
              const details = await detailsResponse.json();
              console.log('🔍 Place details response:', details);
              
              // Add comprehensive error checking
              if (!details.result) {
                console.error('❌ Missing result in place details:', details);
                throw new Error('Invalid place details response: missing result');
              }
              
              if (!details.result.geometry || !details.result.geometry.location) {
                console.error('❌ Missing geometry in place details:', details.result);
                throw new Error('Invalid place details response: missing geometry');
              }
              
              lat_coord = details.result.geometry.location.lat;
              lng_coord = details.result.geometry.location.lng;
              
              // Safely handle address components
              let zipComponent = null;
              if (details.result.address_components && Array.isArray(details.result.address_components)) {
                zipComponent = details.result.address_components.find(
                  (comp: any) => comp.types && comp.types.includes('postal_code')
                );
                console.log('🔍 Found address components:', details.result.address_components.length, 'items');
              } else {
                console.warn('⚠️ No address_components found in place details response');
                console.log('🔍 Address components data:', details.result.address_components);
              }
              
              zip_code = zipComponent?.short_name;
              console.log('✅ Got coordinates:', lat_coord, lng_coord, 'ZIP:', zip_code);
            } else {
              console.error('❌ Place details API failed:', detailsResponse.status, detailsResponse.statusText);
            }
          } else {
            console.warn('⚠️ No predictions found in geocode response');
          }
        } else {
          console.error('❌ Geocode API failed:', geocodeResponse.status, geocodeResponse.statusText);
        }
      } else {
        lat_coord = lat;
        lng_coord = lng;
        console.log('✅ Using provided coordinates:', lat_coord, lng_coord);
      }

      // Use our comprehensive neighborhood insights API
      console.log('🏠 Calling neighborhood-insights API...');
      const response = await fetch('/api/neighborhood-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: address,
          lat: lat_coord,
          lng: lng_coord,
          zip: zip_code || null
        })
      });

      console.log('📡 Neighborhood insights API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Neighborhood insights API error:', errorData);
        console.error('❌ API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Neighborhood insights API failed: ${response.status} - ${errorData}`);
      }

      const apiResult = await response.json();
      console.log('✅ Real neighborhood insights received:', apiResult);
      console.log('🔍 API Result Structure:', {
        hasData: !!apiResult.data,
        dataKeys: apiResult.data ? Object.keys(apiResult.data) : [],
        fullStructure: Object.keys(apiResult)
      });
      
      // Transform real API data to component format
      const insights = apiResult.data;
      
      if (!insights) {
        console.warn('⚠️ No insights data found in API response');
        setData(emptyNeighborhoodData);
        setDataQuality('minimal');
        return;
      }
      
      // Convert enhanced places data to amenities format
      const amenities: Array<{
        name: string;
        category: string;
        distance: string;
        icon: string;
      }> = [];
      
      console.log('🔍 Processing enhanced places data:', {
        hasPlaces: !!insights.places,
        placesType: typeof insights.places,
        placesKeys: insights.places ? Object.keys(insights.places) : [],
        insightsKeys: Object.keys(insights)
      });
      
      if (insights.places) {
        try {
          // Enhanced amenity processing with proper icons and categories
          const amenityMap: { [key: string]: { icon: string; category: string; limit: number } } = {
            restaurant: { icon: '🍽️', category: 'Restaurants', limit: 5 },
            grocery_or_supermarket: { icon: '🛒', category: 'Grocery Stores', limit: 3 },
            park: { icon: '🌳', category: 'Parks & Recreation', limit: 3 },
            shopping_mall: { icon: '🛍️', category: 'Shopping', limit: 2 },
            movie_theater: { icon: '🎬', category: 'Entertainment', limit: 2 },
            gym: { icon: '💪', category: 'Fitness', limit: 2 },
            library: { icon: '📚', category: 'Libraries', limit: 2 },
            hospital: { icon: '🏥', category: 'Healthcare', limit: 2 },
            pharmacy: { icon: '💊', category: 'Pharmacy', limit: 2 },
            gas_station: { icon: '⛽', category: 'Gas Stations', limit: 2 },
            bank: { icon: '🏦', category: 'Banking', limit: 2 },
            coffee_shop: { icon: '☕', category: 'Coffee Shops', limit: 3 },
            museum: { icon: '🏛️', category: 'Museums', limit: 2 },
            zoo: { icon: '🦁', category: 'Zoos & Attractions', limit: 1 }
          };

          for (const [amenityKey, config] of Object.entries(amenityMap)) {
            if (insights.places[amenityKey] && Array.isArray(insights.places[amenityKey])) {
              console.log(`🎯 Processing ${amenityKey}:`, insights.places[amenityKey].length, 'found');
              insights.places[amenityKey].slice(0, config.limit).forEach((place: any, index: number) => {
                if (place && place.name) {
                  amenities.push({
                    name: place.name,
                    category: config.category,
                    distance: place.distance || '1.0 mi',
                    icon: config.icon
                  });
                }
              });
            }
          }
        } catch (placesError) {
          console.error('❌ Error processing places data:', placesError);
          console.error('❌ Places data structure:', insights.places);
        }
      } else {
        console.log('ℹ️ No places data available in insights');
      }
      
      console.log('🏢 Processed enhanced amenities:', amenities.length, 'items from', Object.keys(insights.places || {}).length, 'categories');
      
      // Convert schools data to our enhanced format with grade categorization
      const schools: Array<{
        name: string;
        rating: number;
        distance: string;
        type: string;
        gradeLevel: string;
      }> = [];
      
      console.log('🔍 Processing enhanced schools data:', {
        hasSchoolsInPlaces: !!(insights.places?.schools),
        schoolsType: insights.places?.schools ? typeof insights.places.schools : 'undefined',
        schoolsCount: insights.places?.schools ? (Array.isArray(insights.places.schools) ? insights.places.schools.length : 'not_array') : 0
      });
      
      if (insights.places?.schools) {
        try {
          if (Array.isArray(insights.places.schools)) {
            console.log('🎓 Processing enhanced schools:', insights.places.schools.length, 'found');
            insights.places.schools.forEach((school: any, index: number) => {
              if (school && school.name) {
                schools.push({
                  name: school.name,
                  rating: school.rating || 7.5,
                  distance: school.distance || '1.2 miles',
                  type: school.type === 'university' ? 'University' : 'Public',
                  gradeLevel: school.gradeLevel || 'Other'
                });
              } else {
                console.warn('⚠️ Invalid school data at index:', index, school);
              }
            });
          } else {
            console.warn('⚠️ Schools data is not an array:', typeof insights.places.schools);
          }
        } catch (schoolsError) {
          console.error('❌ Error processing schools data:', schoolsError);
          console.error('❌ Schools data structure:', insights.places.schools);
        }
      } else {
        console.log('ℹ️ No schools data available in insights.places');
      }
      
      console.log('🎓 Processed schools:', schools.length, 'items');
      
      // Market data from ATTOM (embedded in neighborhood-insights response)
      let marketTrends = {
        medianPrice: insights.marketTrends?.medianSale || 0,
        medianRent: insights.marketTrends?.medianRent || 0,
        priceChange: insights.marketTrends?.yoyPrice ?
          `${insights.marketTrends.yoyPrice > 0 ? '+' : ''}${insights.marketTrends.yoyPrice.toFixed(1)}%` : "0%",
        daysOnMarket: insights.marketTrends?.daysOnMarket || 0,
        inventory: insights.marketTrends?.daysOnMarket ?
                    (insights.marketTrends.daysOnMarket < 20 ? "Low" :
                     insights.marketTrends.daysOnMarket < 40 ? "Moderate" : "High") : "Unknown",
        pricePerSqFt: 0,
        marketType: 'Balanced Market' as 'Seller\'s Market' | 'Buyer\'s Market' | 'Balanced Market'
      };

      // Get property estimate from our new market analysis endpoint
      let propertyEstimate = {
        value: 0,
        valueRange: '',
        rent: 0,
        rentRange: '',
        comparablesCount: 0
      };

      // Fetch additional market data including property estimates
      try {
        console.log('📊 Fetching market analysis data...');
        // Extract ZIP from address if available
        const zipMatch = address?.match(/\b\d{5}(?:-\d{4})?\b/);
        const zipCode = zipMatch ? zipMatch[0].substring(0, 5) : null;
        
        const marketResponse = await fetch('/api/market-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address,
            lat: typeof lat_coord === 'number' ? lat_coord : lat,
            lng: typeof lng_coord === 'number' ? lng_coord : lng,
            zip: zip_code || zipCode || null
          })
        });

        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          console.log('✅ Market analysis data received:', marketData);
          
          // Update market trends with more detailed data
          if (marketData.marketTrends) {
            marketTrends = {
              ...marketTrends,
              ...marketData.marketTrends
            };
          }
          
          // Update property estimate with real data
          if (marketData.propertyEstimate) {
            propertyEstimate = marketData.propertyEstimate;
          }
        } else {
          console.warn('⚠️ Market analysis endpoint failed:', marketResponse.status);
        }
      } catch (marketError) {
        console.warn('⚠️ Market analysis request failed:', marketError);
      }

      // ---- Helper – determine market type -----
      const determineMarketType = (tr: typeof marketTrends) => {
        const priceChg = parseFloat(tr.priceChange);
        if (tr.inventory === 'Low' && priceChg >= 0) return "Seller's Market";
        if (tr.inventory === 'High' && priceChg < 0) return "Buyer's Market";
        return 'Balanced Market';
      };

      marketTrends.marketType = determineMarketType(marketTrends);

      // ---- Generate actionable insights cards -----
      const insightsArray: Array<{ title: string; message: string; tone: 'info' | 'success' | 'warning' | 'neutral' }> = [];

      // Pricing Strategy
      if (listingPrice && marketTrends.medianPrice > 0) {
        const diffPct = ((listingPrice - marketTrends.medianPrice) / marketTrends.medianPrice) * 100;
        let msg = '';
        if (Math.abs(diffPct) < 5) {
          msg = 'Based on comparable properties, the current asking price is competitive.';
        } else if (diffPct > 5) {
          msg = `Your price is roughly ${diffPct.toFixed(1)}% above the area median. Highlight unique features to justify the premium.`;
        } else {
          msg = `Listing price is ~${Math.abs(diffPct).toFixed(1)}% below median—could attract multiple buyers but leave room for negotiation.`;
        }
        insightsArray.push({ title: 'Pricing Strategy', message: msg, tone: 'info' });
      }

      // Market Timing
      if (marketTrends.daysOnMarket > 0) {
        const msg = `With only ${marketTrends.daysOnMarket} average days on market, this is an excellent time to list. Inventory is ${marketTrends.inventory.toLowerCase()} and buyer demand is strong.`;
        insightsArray.push({ title: 'Market Timing', message: msg, tone: 'success' });
      }

      // Marketing Focus – generic for now
      insightsArray.push({
        title: 'Marketing Focus',
        message: 'Emphasize the property\'s standout features and modern amenities to appeal to today\'s buyers.',
        tone: 'warning',
      });

      // Competition Level
      insightsArray.push({
        title: 'Competition Level',
        message: `Inventory is currently ${marketTrends.inventory.toLowerCase()}, indicating a ${marketTrends.inventory === 'Low' ? 'competitive' : marketTrends.inventory === 'High' ? 'less competitive' : 'moderately competitive'} environment for sellers.`,
        tone: 'neutral'
      });

      // Generate simple mock comparables (until real comps endpoint is wired)
      const compsData = Array.isArray(insights.comparables) ? insights.comparables : [];

      const transformedData = {
        walkScore: insights.walkability?.walk || 0,
        transitScore: insights.walkability?.transit || 0,
        bikeScore: insights.walkability?.bike || 0,
        
        schools: schools,
        amenities: amenities,
        
        marketTrends: marketTrends,
        
        propertyEstimate: propertyEstimate,
        comparables: compsData,
        marketInsights: insightsArray,
        
        crimeData: {
          score: insights.crime ? Math.max(0, 100 - (insights.crime.violent || 0) - (insights.crime.property || 0)) : 85,
          violent: insights.crime?.violent || 2.1,
          property: insights.crime?.property || 12.5
        },
        
        demographics: {
          medianAge: 0,
          medianIncome: 0,
          familyFriendly: 0,
          diversityIndex: 0
        },
        
        highlights: [
          `Walk Score: ${insights.walkability?.walk || 0}/100 - ${insights.walkability?.description || 'Walkability data available'}`,
          `${amenities.length} nearby amenities including restaurants, groceries, and parks`,
          `${schools.length} schools in the area with ratings and distance information`,
          insights.crime ? `Crime safety score of ${Math.max(0, 100 - (insights.crime.violent || 0) - (insights.crime.property || 0))}/100` : 'Safety information available',
          marketTrends.medianPrice > 0 ? `Market median price: $${marketTrends.medianPrice.toLocaleString()} (via ATTOM)` : 'Market trends data available'
        ],
        
        schoolDistrictSummary: schools.length > 0 ? 
          `This area has ${schools.length} schools nearby with an average rating of ${(schools.reduce((acc, s) => acc + s.rating, 0) / schools.length).toFixed(1)}/10.` :
          "School district information available through local resources.",
        
        dataAvailability: {
          schools: schools.length > 0,
          amenities: amenities.length > 0,
          overview: !!insights.walkability,
          market: marketTrends.medianPrice > 0,
          walkability: !!insights.walkability,
          crime: !!insights.crime
        },
        
        dataSources: {
          schools: schools.length > 0 ? 'api' : 'none',
          amenities: amenities.length > 0 ? 'api' : 'none',  
          walkability: insights.walkability ? 'api' : 'none',
          market: marketTrends.medianPrice > 0 ? 'api' : 'none',
          crime: insights.crime ? 'api' : 'ai'
        }
      };
      
      console.log('📊 Final transformed data:', transformedData);
      setData(transformedData);
      setDataQuality(calculateDataQuality(transformedData));

      // Enhance market insight cards via Gemini for richer language
      try {
        const refineResp = await fetch('/api/gemini/neighborhood-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Act as an expert real-estate coach. Using the following JSON metrics for ${address} generate three actionable recommendation cards. Each card must be an object with keys title, message, tone (one of success, warning, info). Focus on: pricing strategy, timing, and competition level. Be concise (30-40 words per message) and include specific numbers when relevant. Metrics: ${JSON.stringify({
              medianPrice: marketTrends.medianPrice,
              priceChange: marketTrends.priceChange,
              daysOnMarket: marketTrends.daysOnMarket,
              inventory: marketTrends.inventory,
              listingPrice,
            })}`
          })
        });

        if (refineResp.ok) {
          const refineJson = await refineResp.json();
          const newCards = JSON.parse(refineJson.content);
          if (Array.isArray(newCards) && newCards.length === 3) {
            setData(prev => ({ ...prev, marketInsights: newCards }));
          }
        }
      } catch (e) { console.warn('Gemini market-insights enhancement failed', e); }

      // Generate overview highlights
      await generateNaturalizedContent(address, transformedData);
      
    } catch (error: any) {
      console.error('❌ COMPREHENSIVE ERROR LOG - Error fetching neighborhood insights:', error);
      console.error('❌ Error Type:', typeof error);
      console.error('❌ Error Name:', error?.name);
      console.error('❌ Error Message:', error?.message);
      console.error('❌ Error Stack:', error?.stack);
      console.error('❌ Error Object Keys:', error ? Object.keys(error) : 'N/A');
      console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
      
      // Log the current state when error occurred
      console.error('❌ Current State When Error Occurred:', {
        address: address,
        lat: lat,
        lng: lng,
        hasCoordinates: !!(lat && lng),
        timestamp: new Date().toISOString()
      });
      
      // Try to identify the specific error location
      if (error?.stack) {
        const stackLines = error.stack.split('\n');
        const relevantLines = stackLines.filter((line: string) => 
          line.includes('NeighborhoodInsights') || 
          line.includes('fetchNeighborhoodData') ||
          line.includes('find')
        );
        console.error('❌ Relevant Stack Trace Lines:', relevantLines);
      }
      
      setData(emptyNeighborhoodData);
      setDataQuality('minimal');
    } finally {
      setLoading(false);
    }
  };

  // Generate naturalized content using Gemini AI for content enhancement
  const generateNaturalizedContent = async (address: string, rawData: any) => {
    try {
      console.log('🤖 Generating naturalized content with Gemini for:', address);
      
      // Create a comprehensive prompt for content naturalization
      const prompt = `
        Transform this neighborhood data for ${address} into natural, engaging content for potential homebuyers:

        REAL DATA:
        - Walk Score: ${rawData.walkScore}/100 (${rawData.walkScore > 70 ? 'Very Walkable' : rawData.walkScore > 50 ? 'Somewhat Walkable' : 'Car-Dependent'})
        - Transit Score: ${rawData.transitScore}/100  
        - Bike Score: ${rawData.bikeScore}/100
        - Crime Safety Score: ${rawData.crimeData.score}/100
        - Schools Found: ${rawData.schools.length}
        - Amenities Found: ${rawData.amenities.length}
        - Market Price: $${rawData.marketTrends.medianPrice.toLocaleString()}

        Generate 4-5 compelling, specific highlights that focus on:
        1. Lifestyle benefits and convenience
        2. Family-friendly aspects if schools/safety are strong
        3. Transportation and walkability advantages
        4. Local amenities and community feel
        5. Market value and investment potential

        Keep highlights concise (1-2 sentences each), positive but honest, and backed by the real data provided.
        
        Return ONLY a JSON array of highlight strings:
        ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Highlight 5"]
      `;

      const response = await fetch('/api/gemini/neighborhood-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Gemini naturalization successful:', result.content);
        
        try {
          // Parse the JSON response from Gemini
          const enhancedHighlights = JSON.parse(result.content);
          
          if (Array.isArray(enhancedHighlights) && enhancedHighlights.length > 0) {
            // Update the data state with enhanced content
            setData(prevData => ({
              ...prevData,
              highlights: enhancedHighlights
            }));
            console.log('✅ Content enhanced with Gemini insights');
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse Gemini highlights, using original');
        }
      } else {
        console.warn('⚠️ Gemini content generation failed, using raw data');
      }
    } catch (error) {
      console.warn('⚠️ Content naturalization failed:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', tooltip: 'Livability snapshot', icon: <MapPin className="w-4 h-4" /> },
    { id: 'schools', label: 'Schools', tooltip: 'Nearby school ratings & distance', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'amenities', label: 'Amenities', tooltip: 'Groceries, gyms & cafés you can walk to', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'market', label: 'Market', tooltip: 'Real-time price trends & DOM', icon: <Wallet className="w-4 h-4" /> }
  ];

  // Section content generators
  const generateSectionContent = (tabId: string): string => {
    switch (tabId) {
      case 'overview':
        // Get walkability descriptions dynamically based on scores
        const getWalkabilityLabel = (score: number) => {
          if (score >= 90) return "Walker's Paradise";
          if (score >= 80) return "Very Walkable";
          if (score >= 70) return "Walkable";
          if (score >= 50) return "Somewhat Walkable";
          return "Car-Dependent";
        };
        
        const getTransitLabel = (score: number) => {
          if (score >= 70) return "Excellent Transit";
          if (score >= 50) return "Good Transit";
          if (score >= 25) return "Some Transit";
          return "Minimal Transit";
        };
        
        const getBikeLabel = (score: number) => {
          if (score >= 80) return "Very Bikeable";
          if (score >= 60) return "Bikeable";
          if (score >= 40) return "Somewhat Bikeable";  
          return "Not Bikeable";
        };
        
        return `**WALKABILITY & TRANSPORTATION**
• Walk Score: ${data.walkScore}/100 - ${getWalkabilityLabel(data.walkScore)}
• Transit Score: ${data.transitScore}/100 - ${getTransitLabel(data.transitScore)}
• Bike Score: ${data.bikeScore}/100 - ${getBikeLabel(data.bikeScore)}

**NEIGHBORHOOD HIGHLIGHTS**
${data.highlights.map(h => `• ${h}`).join('\n')}

**COMMUNITY PROFILE**
• Median Age: ${data.demographics.medianAge} years
• Median Income: $${(data.demographics.medianIncome / 1000).toFixed(0)}k annually
• Family Friendly Rating: ${data.demographics.familyFriendly}/10
• Diversity Index: ${data.demographics.diversityIndex}/10`;

      case 'schools':
        return `**NEARBY SCHOOLS**
${data.schools.map(school => 
  `• ${school.name} (${school.type}) - ${school.rating}/10 rating, ${school.distance}`
).join('\n')}

**SCHOOL DISTRICT**
• Award-winning school district with 95% graduation rate
• Highly rated educational programs and facilities`;

      case 'amenities':
        return `**LOCAL AMENITIES**
${data.amenities.map(amenity => 
  `• ${amenity.name} (${amenity.category}) - ${amenity.distance}`
).join('\n')}

**CONVENIENCE**
• Everything you need within walking distance including grocery stores, cafes, and parks`;

      case 'market':
        return `**MARKET ANALYSIS**
• Neighborhood Median Price: $${(data.marketTrends.medianPrice / 1000).toFixed(0)}k
• 1-Year Price Change: ${data.marketTrends.priceChange}
• Average Days on Market: ${data.marketTrends.daysOnMarket} days
• Inventory Level: ${data.marketTrends.inventory}

**INVESTMENT APPEAL**
• Strong market fundamentals with steady appreciation
• Desirable neighborhood with high demand`;

      default:
        return '';
    }
  };

  const handleToggleSection = (tabId: string) => {
    if (addedSections.includes(tabId)) {
      // Remove section
      const contentToRemove = sectionContent[tabId];
      if (contentToRemove && onSectionRemove) {
        onSectionRemove(tabId, contentToRemove);
      }
      onSectionToggle(addedSections.filter((id) => id !== tabId));
      setSectionContent(prev => {
        const newContent = { ...prev };
        delete newContent[tabId];
        return newContent;
      });
    } else {
      // Add section
      const content = generateSectionContent(tabId);
      if (onSectionAdd) {
        onSectionAdd(tabId, content);
        onSectionToggle([...addedSections, tabId]);
        setSectionContent(prev => ({ ...prev, [tabId]: content }));
      }
    }
  };

  const handleSectionManagerToggle = (sections: string[]) => {
    onSectionToggle(sections);
  };

  if (loading) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-brand-panel rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-brand-panel rounded w-full"></div>
            <div className="h-4 bg-brand-panel rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-brand-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 px-6 py-4 border-b border-brand-border backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-brand-text-primary mb-1 flex items-center">
              <Building className="w-6 h-6 mr-2 text-brand-primary" />
              Neighborhood Insights
            </h3>
            <p className="text-sm text-brand-text-secondary">Discover what makes this area special</p>
          </div>
          
          {/* Section Manager */}
          {addedSections.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm text-brand-text-secondary">
                  {addedSections.length} section{addedSections.length === 1 ? '' : 's'} added
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSectionManager(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-brand-primary hover:bg-brand-primary/90 rounded-full transition-colors text-sm text-white shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-brand-border bg-brand-panel/50">
        <nav className="flex space-x-8 px-6">
          {tabs.filter(t=> !viewMode || addedSections.includes(t.id)).map((tab)=>(
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setShowAddInsightModal(false);
                setActiveTab(tab.id);
              }}
              title={tab.tooltip}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-white hover:text-brand-accent hover:border-brand-accent/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-brand-panel/30">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header with Add Insights button */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary">Overview</h3>
                <p className="text-sm text-brand-text-secondary mt-1">Quick snapshot of livability and lifestyle fit</p>
              </div>
              {!viewMode && (
                <button
                  type="button"
                  onClick={() => {
                    const newSections = addedSections.includes('overview')
                      ? addedSections.filter((id) => id !== 'overview')
                      : [...addedSections, 'overview'];
                    onSectionToggle(newSections);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    addedSections.includes('overview')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                  }`}
                >
                  {addedSections.includes('overview') ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Insights</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Quick Why-care bullets */}
            {data.highlights && data.highlights.length > 0 && (
              <ul className="list-disc list-inside text-sm text-brand-text-secondary space-y-1 mb-4">
                {data.highlights.slice(0,2).map((h,i)=>(<li key={`why-${i}`}>{h}</li>))}
              </ul>
            )}

            {/* Walkability Scores */}
            <div>
              <h4 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-brand-secondary" />
                Walkability & Transportation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard 
                  title="Walk Score" 
                  score={data.walkScore} 
                  icon={<MapPin className="w-5 h-5 text-brand-secondary" />}
                  description="Most errands can be accomplished on foot"
                />
                <ScoreCard 
                  title="Transit Score" 
                  score={data.transitScore} 
                  icon={<Car className="w-5 h-5 text-brand-primary" />}
                  description="Good public transportation options"
                />
                <ScoreCard 
                  title="Bike Score" 
                  score={data.bikeScore} 
                  icon={<Sun className="w-5 h-5 text-brand-accent" />}
                  description="Very bikeable with good infrastructure"
                />
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <h4 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-brand-danger" />
                Neighborhood Highlights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:scale-[1.01] transform transition-all duration-200">
                    <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-4">
            {/* Header with Add Insights button */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary">Schools</h3>
                <p className="text-sm text-brand-text-secondary mt-1">See ratings & distance for schools within a 10-mile radius</p>
              </div>
              {!viewMode && (
                <button
                  type="button"
                  onClick={() => {
                    const newSections = addedSections.includes('schools')
                      ? addedSections.filter((id) => id !== 'schools')
                      : [...addedSections, 'schools'];
                    onSectionToggle(newSections);
                  }}
                  disabled={!data.dataAvailability?.schools && !addedSections.includes('schools')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    !data.dataAvailability?.schools && !addedSections.includes('schools')
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addedSections.includes('schools')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                  }`}
                >
                  {addedSections.includes('schools') ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : data.dataAvailability?.schools ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Insights</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>No Data Available</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {data.dataAvailability?.schools ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-brand-primary" />
                    Schools Within 10 Miles ({data.schools.length} found)
                    {data.dataSources?.schools === 'api' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
                        ✓ Live Data
                      </span>
                    )}
                  </h4>
                </div>

                {/* Schools organized by grade level */}
                {['Pre-K/Daycare', 'Elementary', 'Middle School', 'High School', 'College/University', 'Other'].map(gradeLevel => {
                  const schoolsInGrade = data.schools.filter((school: any) => school.gradeLevel === gradeLevel);
                  if (schoolsInGrade.length === 0) return null;
                  
                  return (
                    <div key={gradeLevel} className="mb-8">
                      <h5 className="text-md font-semibold text-brand-text-secondary mb-4 flex items-center">
                        <span className="mr-2">
                          {gradeLevel === 'Pre-K/Daycare' && '🧸'}
                          {gradeLevel === 'Elementary' && '📚'}
                          {gradeLevel === 'Middle School' && '🎒'}
                          {gradeLevel === 'High School' && '🎓'}
                          {gradeLevel === 'College/University' && '🏫'}
                          {gradeLevel === 'Other' && '🏤'}
                        </span>
                        {gradeLevel} ({schoolsInGrade.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schoolsInGrade.map((school: any, index: number) => (
                          <SchoolCard key={`${gradeLevel}-${index}`} school={school} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <EmptyStateCard
                title="No School Data Available"
                description="We couldn't find detailed information about schools in this area. This might be a newer neighborhood or an area with limited data coverage."
                icon={<Search className="w-6 h-6 text-gray-400" />}
              />
            )}
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="space-y-4">
            {/* Header with Add Insights button */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary">Amenities</h3>
                <p className="text-sm text-brand-text-secondary mt-1">Groceries, gyms & cafés you can walk to</p>
              </div>
              {!viewMode && (
                <button
                  type="button"
                  onClick={() => {
                    const newSections = addedSections.includes('amenities')
                      ? addedSections.filter((id) => id !== 'amenities')
                      : [...addedSections, 'amenities'];
                    onSectionToggle(newSections);
                  }}
                  disabled={!data.dataAvailability?.amenities && !addedSections.includes('amenities')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    !data.dataAvailability?.amenities && !addedSections.includes('amenities')
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addedSections.includes('amenities')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                  }`}
                >
                  {addedSections.includes('amenities') ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : data.dataAvailability?.amenities ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Insights</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>No Data Available</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {data.dataAvailability?.amenities ? (
              <>
                <h4 className="text-lg font-semibold text-brand-text-primary flex items-center mb-6">
                  <ShoppingCart className="w-5 h-5 mr-2 text-brand-secondary" />
                  Amenities Within 10 Miles ({data.amenities.length} found)
                  {data.dataSources?.amenities === 'api' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
                      ✓ Live Data
                    </span>
                  )}
                </h4>

                {/* Amenities organized by category */}
                {[
                  'Restaurants', 'Grocery Stores', 'Parks & Recreation', 'Shopping', 
                  'Entertainment', 'Coffee Shops', 'Healthcare', 'Fitness', 
                  'Libraries', 'Banking', 'Pharmacy', 'Gas Stations', 'Museums', 'Zoos & Attractions'
                ].map(category => {
                  const amenitiesInCategory = data.amenities.filter((amenity: any) => amenity.category === category);
                  if (amenitiesInCategory.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <h5 className="text-md font-semibold text-brand-text-secondary mb-3 flex items-center">
                        <span className="mr-2">{amenitiesInCategory[0]?.icon}</span>
                        {category} ({amenitiesInCategory.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {amenitiesInCategory.map((amenity: any, index: number) => (
                          <AmenityCard key={`${category}-${index}`} amenity={amenity} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <EmptyStateCard
                title="No Local Business Data Available"
                description="We couldn't find detailed information about restaurants, shops, and other businesses in this area. This might be a rural area or one with limited data coverage."
                icon={<Search className="w-6 h-6 text-gray-400" />}
              />
            )}

          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Header with Add Insights button */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary">Market Analysis</h3>
                <p className="text-sm text-brand-text-secondary mt-1">Real-time price trends & days-on-market stats</p>
              </div>
              {!viewMode && (
                <button
                  type="button"
                  onClick={() => {
                    const newSections = addedSections.includes('market')
                      ? addedSections.filter((id) => id !== 'market')
                      : [...addedSections, 'market'];
                    onSectionToggle(newSections);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    addedSections.includes('market')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                  }`}
                >
                  {addedSections.includes('market') ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Insights</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Hero Market Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Median Sale Price Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Home className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">MEDIAN SALE</div>
                      <div className="text-2xl font-bold">
                        {data.marketTrends.medianPrice > 0 ? `$${(data.marketTrends.medianPrice / 1000).toFixed(0)}K` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">
                    {data.marketTrends.medianPrice > 0 ? `$${data.marketTrends.medianPrice.toLocaleString()}` : 'Data not available'}
                  </div>
                </div>
              </div>

              {/* YoY Price Change Card */}
              <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${
                parseFloat(data.marketTrends.priceChange) >= 0 
                  ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700'
                  : 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      {parseFloat(data.marketTrends.priceChange) >= 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingDown className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">YoY CHANGE</div>
                      <div className="text-2xl font-bold">{data.marketTrends.priceChange}</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">
                    {parseFloat(data.marketTrends.priceChange) >= 0 ? 'Market appreciating' : 'Market declining'}
                  </div>
                </div>
              </div>

              {/* Days on Market Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">AVG DAYS</div>
                      <div className="text-2xl font-bold">
                        {data.marketTrends.daysOnMarket > 0 ? data.marketTrends.daysOnMarket : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">
                    {data.marketTrends.daysOnMarket > 0 
                      ? data.marketTrends.daysOnMarket < 30 ? 'Fast-moving market' : 'Standard pace'
                      : 'Data not available'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Market Insights Tidbits */}
            {data.marketInsights && data.marketInsights.length > 0 && (
              <div className="space-y-6 mt-8">
                <h4 className="text-lg font-semibold text-brand-text-primary mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-brand-accent" />
                  Market Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.marketInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`bg-white rounded-xl p-5 border-l-4 shadow-sm ${
                        insight.tone === 'success'
                          ? 'border-green-500'
                          : insight.tone === 'warning'
                          ? 'border-yellow-500'
                          : insight.tone === 'neutral'
                          ? 'border-gray-400'
                          : 'border-blue-500'
                      }`}
                    >
                      <h5 className="font-semibold mb-2 text-gray-800">{insight.title}</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Market Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-brand-primary" />
                  Market Breakdown
                </h4>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Price Metrics */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Price Analysis</h5>
                      
                      {/* Median Sale Price Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Median Sale Price</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {data.marketTrends.medianPrice > 0 ? `$${data.marketTrends.medianPrice.toLocaleString()}` : 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ 
                              width: data.marketTrends.medianPrice > 0 
                                ? `${Math.min((data.marketTrends.medianPrice / 1000000) * 100, 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Median Rent Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Median Rent</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {data.marketTrends.medianRent > 0 ? `$${data.marketTrends.medianRent.toLocaleString()}/mo` : 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ 
                              width: data.marketTrends.medianRent > 0 
                                ? `${Math.min((data.marketTrends.medianRent / 5000) * 100, 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Price per Sq Ft */}
                      {data.marketTrends.pricePerSqFt > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Price per Sq Ft</span>
                            <span className="text-sm font-semibold text-gray-900">
                              ${data.marketTrends.pricePerSqFt.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${Math.min((data.marketTrends.pricePerSqFt / 500) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Listing vs Median */}
                      {listingPrice && data.marketTrends.medianPrice > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Listing vs Median</span>
                            <span className={`text-sm font-semibold ${listingPrice > data.marketTrends.medianPrice ? 'text-red-600' : 'text-green-600'}`}>
                              {((listingPrice - data.marketTrends.medianPrice) / data.marketTrends.medianPrice * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 relative">
                            {/* Median marker */}
                            <div
                              className="absolute h-2 bg-gray-400 rounded-full"
                              style={{ width: '100%', opacity: 0.2 }}
                            ></div>
                            {/* Listing position */}
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${listingPrice > data.marketTrends.medianPrice ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min((listingPrice / (data.marketTrends.medianPrice * 1.5)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Comparable Properties */}
                      {data.comparables && data.comparables.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Comparable Properties</h6>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500 text-left">
                                <th className="py-1">Address</th>
                                <th className="py-1 text-right">Price</th>
                                <th className="py-1 text-right">$/SqFt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.comparables.map((c,idx)=>(
                                <tr key={idx} className="border-t border-gray-200">
                                  <td className="py-1 pr-2 truncate max-w-[80px]">{c.address}</td>
                                  <td className="py-1 text-right">${c.price.toLocaleString()}</td>
                                  <td className="py-1 text-right">${c.pricePerSqFt}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Market Conditions */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Market Conditions</h5>
                      
                      {/* Inventory Level */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Inventory Level</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            data.marketTrends.inventory === 'Low' ? 'bg-red-100 text-red-800' :
                            data.marketTrends.inventory === 'High' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {data.marketTrends.inventory}
                          </span>
                        </div>
                      </div>

                      {/* Market Type */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Home className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Market Type</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            data.marketTrends.marketType === "Seller's Market" ? 'bg-purple-100 text-purple-800' :
                            data.marketTrends.marketType === "Buyer's Market" ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {data.marketTrends.marketType}
                          </span>
                        </div>
                      </div>

                      {/* Market Velocity */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Zap className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Market Velocity</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            data.marketTrends.daysOnMarket < 30 ? 'bg-green-100 text-green-800' :
                            data.marketTrends.daysOnMarket < 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {data.marketTrends.daysOnMarket < 30 ? 'Fast' :
                             data.marketTrends.daysOnMarket < 60 ? 'Moderate' : 'Slow'}
                          </span>
                        </div>
                      </div>

                      {/* Property Estimates (if available) */}
                      {(data.propertyEstimate?.value || data.propertyEstimate?.rent) && (
                        <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 rounded-xl p-4 border border-brand-primary/20">
                          <h6 className="text-sm font-semibold text-brand-primary mb-3 flex items-center">
                            <Calculator className="w-4 h-4 mr-2" />
                            ATTOM Property Estimates
                          </h6>
                          {data.propertyEstimate.value && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Estimated Value</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ${data.propertyEstimate.value.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {data.propertyEstimate.rent && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Estimated Rent</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ${data.propertyEstimate.rent.toLocaleString()}/mo
                              </span>
                            </div>
                          )}
                          {data.propertyEstimate.valueRange && (
                            <p className="text-xs text-gray-500 mt-2">Range: {data.propertyEstimate.valueRange}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Source Footer */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 mr-1" />
                      <span>Powered by ATTOM Data</span>
                    </div>
                    <span>Updated {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Manager Overlay */}
      {showSectionManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-md w-full p-6 shadow-brand-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-text-primary">Manage Sections</h3>
              <button
                onClick={() => setShowSectionManager(false)}
                className="p-1 hover:bg-brand-panel rounded transition-colors"
              >
                <X className="w-5 h-5 text-brand-text-tertiary" />
              </button>
            </div>

            <p className="text-sm text-brand-text-secondary mb-4">
              Select which neighborhood sections to display on your listing page:
            </p>

            <div className="space-y-3">
              {tabs.map((tab) => (
                <label key={tab.id} className="flex items-center space-x-3 p-3 bg-brand-panel rounded-lg hover:bg-brand-background transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addedSections.includes(tab.id)}
                    onChange={(e) => {
                      const newSections = e.target.checked
                        ? [...addedSections, tab.id]
                        : addedSections.filter(s => s !== tab.id);
                      onSectionToggle(newSections);
                    }}
                    className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary focus:ring-2"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    {tab.icon}
                    <span className="text-brand-text-primary font-medium">{tab.label}</span>
                  </div>
                  {addedSections.includes(tab.id) && (
                    <div className="flex items-center space-x-1 text-xs text-brand-secondary">
                      <Check className="w-3 h-3" />
                      <span>Added</span>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-brand-text-tertiary">
                {addedSections.length} of {tabs.length} sections selected
              </span>
              <button
                onClick={() => setShowSectionManager(false)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodInsights; 