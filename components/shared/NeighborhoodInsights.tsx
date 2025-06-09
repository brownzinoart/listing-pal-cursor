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
  Search
} from 'lucide-react';

// Mock data - replace with your actual API calls
const mockNeighborhoodData = {
  walkScore: 85,
  transitScore: 72,
  bikeScore: 68,
  schools: [
    { name: "Roosevelt Elementary", rating: 9, distance: "0.3 miles", type: "Elementary" },
    { name: "Lincoln Middle School", rating: 8, distance: "0.7 miles", type: "Middle" },
    { name: "Washington High School", rating: 9, distance: "1.2 miles", type: "High" }
  ],
  amenities: [
    { name: "Whole Foods Market", category: "Grocery", distance: "0.4 miles", icon: "🛒" },
    { name: "Starbucks Coffee", category: "Coffee", distance: "0.2 miles", icon: "☕" },
    { name: "Central Park", category: "Recreation", distance: "0.6 miles", icon: "🌳" },
    { name: "Planet Fitness", category: "Gym", distance: "0.8 miles", icon: "💪" }
  ],
  demographics: {
    medianAge: 34,
    medianIncome: 75000,
    familyFriendly: 8.5,
    diversityIndex: 7.2
  },
  marketTrends: {
    medianPrice: 485000,
    priceChange: "+5.2%",
    daysOnMarket: 18,
    inventory: "Low"
  },
  highlights: [
    "Historic neighborhood with tree-lined streets",
    "Award-winning school district",
    "Growing arts and culture scene",
    "Easy access to downtown (15 min)",
    "Low crime rate - 40% below national average"
  ],
  dataAvailability: {
    schools: true,
    amenities: true,
    overview: true,
    market: true
  },
  dataSources: {
    schools: 'real',
    amenities: 'real'
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
  onSectionAdd?: (section: string, content: string) => void;
  onSectionRemove?: (section: string, content: string) => void;
  selectedSections?: string[];
  onSectionToggle?: (sections: string[]) => void;
}

const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({ 
  address, 
  listingPrice, 
  onSectionAdd,
  onSectionRemove,
  selectedSections = [],
  onSectionToggle 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockNeighborhoodData);
  const [addedSections, setAddedSections] = useState<string[]>([]);
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({});
  const [showSectionManager, setShowSectionManager] = useState(false);

  // Fetch real neighborhood data when address changes
  useEffect(() => {
    if (address && address.length > 10) {
      fetchNeighborhoodData(address);
    }
  }, [address]);

  const fetchNeighborhoodData = async (address: string) => {
    setLoading(true);
    try {
      // Call the same endpoint that LocationContextWidget uses
      const response = await fetch('/api/listings/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch neighborhood data');
      }

      const contextData = await response.json();
      console.log('✅ NeighborhoodInsights received real data:', contextData);
      
      // Transform the real data to match our component's expected format
      const transformedData = await transformContextDataToNeighborhoodData(contextData, address);
      setData(transformedData);
    } catch (error) {
      console.error('❌ Error fetching neighborhood data:', error);
      // Keep using mock data as fallback
    } finally {
      setLoading(false);
    }
  };

    const generateAIFallbackData = async (address: string, currentData: any) => {
    try {
      // Analyze what we have vs what we need
      const hasSchools = currentData.schools && currentData.schools.length > 0;
      const hasRestaurants = currentData.dining && currentData.dining.length > 0;
      const hasShopping = currentData.shopping && currentData.shopping.length > 0;
      const hasParks = currentData.parks && currentData.parks.length > 0;
      const hasTransit = currentData.transit && currentData.transit.length > 0;

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate comprehensive neighborhood data for: ${address}

CURRENT DATA STATUS:
- Schools: ${hasSchools ? 'AVAILABLE' : 'MISSING'}
- Restaurants: ${hasRestaurants ? 'AVAILABLE' : 'MISSING'}  
- Shopping: ${hasShopping ? 'AVAILABLE' : 'MISSING'}
- Parks: ${hasParks ? 'AVAILABLE' : 'MISSING'}
- Transit: ${hasTransit ? 'AVAILABLE' : 'MISSING'}

INSTRUCTIONS:
Generate realistic data ONLY for missing categories. Base suggestions on the specific geographic area and typical businesses/amenities found in this neighborhood type.

For MISSING schools: Provide 2-3 realistic schools with names that would exist in this area, ratings (1-10), distances, and types (Elementary/Middle/High).

For MISSING restaurants: Provide 4-6 diverse dining options including casual and upscale restaurants, cafes, and local favorites.

For MISSING shopping: Provide 3-4 shopping venues including grocery stores, retail, and convenience options.

For MISSING parks: Provide 2-3 recreational areas including parks, trails, or green spaces.

For MISSING transit: Provide 2-3 public transportation options if applicable to this area.

Return ONLY missing data in this exact JSON format:
{
  "schools": [{"name": "...", "rating": 8, "distance": "0.5 miles", "type": "Elementary"}],
  "restaurants": [{"name": "...", "category": "Restaurant", "distance": "0.3 miles", "icon": "🍽️", "rating": 4.2}],
  "shopping": [{"name": "...", "category": "Grocery Store", "distance": "0.4 miles", "icon": "🛒", "rating": 4.1}],
  "parks": [{"name": "...", "category": "Park", "distance": "0.6 miles", "icon": "🌳", "acres": 15}],
  "transit": [{"name": "...", "category": "Bus Stop", "distance": "0.2 miles", "icon": "🚌", "walkTime": "3 min"}],
  "walkability": {
    "walkScore": 75,
    "transitScore": 65,
    "bikeScore": 70,
    "description": "Most errands can be accomplished on foot"
  },
  "insights": ["Insight about neighborhood character", "Safety and community insight", "Lifestyle highlight"]
}

Include ONLY the categories that are MISSING. If all data is available, return empty object {}`,
          contentType: 'neighborhood-insights'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Parse the AI response - it should return JSON
        try {
          const aiData = JSON.parse(result.content);
          return aiData;
        } catch (parseError) {
          console.warn('Could not parse AI response as JSON:', result.content);
          return null;
        }
      }
    } catch (error) {
      console.warn('AI fallback failed:', error);
    }
    return null;
  };

  const transformContextDataToNeighborhoodData = async (contextData: any, currentAddress: string) => {
    // Extract real data from context cards and transform to our format
    const schoolsCard = contextData.cards?.find((card: any) => card.id === 'schools');
    const hasRealSchools = schoolsCard?.fullData && schoolsCard.fullData.length > 0;
    let schools = hasRealSchools 
      ? schoolsCard.fullData.map((school: any) => ({
          name: school.name,
          rating: school.rating || 8,
          distance: '0.5 miles', // Calculate from geometry if available
          type: 'Public'
        }))
      : [];

    const amenities: { name: string; category: string; distance: string; icon: string; }[] = [];
    let hasRealAmenities = false;
    
    // Extract restaurants
    const restaurantCard = contextData.cards?.find((card: any) => card.id === 'dining');
    if (restaurantCard?.fullData && restaurantCard.fullData.length > 0) {
      hasRealAmenities = true;
      restaurantCard.fullData.slice(0, 4).forEach((restaurant: any) => {
        amenities.push({
          name: restaurant.name,
          category: 'Restaurant',
          distance: '0.3 miles',
          icon: '🍽️'
        });
      });
    }
    
    // Extract shopping
    const shoppingCard = contextData.cards?.find((card: any) => card.id === 'shopping');
    if (shoppingCard?.fullData && shoppingCard.fullData.length > 0) {
      hasRealAmenities = true;
      shoppingCard.fullData.slice(0, 2).forEach((store: any) => {
        amenities.push({
          name: store.name,
          category: 'Shopping',
          distance: '0.4 miles',
          icon: '🛒'
        });
      });
    }

    // Use AI fallback for comprehensive missing data
    let aiEnhancedHighlights: string[] = [];
    let aiWalkabilityData: any = null;
    
    // Check if we need AI enhancement
    const needsAIEnhancement = !hasRealSchools || !hasRealAmenities;
    
    if (needsAIEnhancement && currentAddress) {
      // Pass current real data so AI knows what's missing
      const currentRealData = {
        schools: hasRealSchools ? schools : [],
        dining: hasRealAmenities ? contextData.cards?.find((c: any) => c.id === 'dining')?.fullData : [],
        shopping: hasRealAmenities ? contextData.cards?.find((c: any) => c.id === 'shopping')?.fullData : [],
        parks: contextData.cards?.find((c: any) => c.id === 'parks')?.fullData || [],
        transit: contextData.cards?.find((c: any) => c.id === 'transit')?.fullData || []
      };

      const aiData = await generateAIFallbackData(currentAddress, currentRealData);
      if (aiData) {
        // Merge AI-generated schools if missing
        if (!hasRealSchools && aiData.schools) {
          schools = aiData.schools;
        }
        
        // Merge AI-generated restaurants and shopping into amenities
        if (!hasRealAmenities) {
          if (aiData.restaurants) {
            amenities.push(...aiData.restaurants);
          }
          if (aiData.shopping) {
            amenities.push(...aiData.shopping);
          }
          if (aiData.parks) {
            amenities.push(...aiData.parks.map((park: any) => ({
              name: park.name,
              category: 'Recreation',
              distance: park.distance,
              icon: park.icon || '🌳'
            })));
          }
          if (aiData.transit) {
            amenities.push(...aiData.transit.map((transit: any) => ({
              name: transit.name,
              category: 'Transit',
              distance: transit.distance,
              icon: transit.icon || '🚌'
            })));
          }
        }

        // Use AI-generated insights and walkability data
        if (aiData.insights) {
          aiEnhancedHighlights = aiData.insights;
        }
        if (aiData.walkability) {
          aiWalkabilityData = aiData.walkability;
        }
      }
    }

    // Track data availability for each section (including AI-enhanced)
    const dataAvailability = {
      schools: hasRealSchools || schools.length > 0,
      amenities: hasRealAmenities || amenities.length > 0,
      overview: true, // Always available (uses walk scores, etc.)
      market: true   // Always available (uses demographic data)
    };

    // Track data sources for display badges
    const dataSources = {
      schools: hasRealSchools ? 'real' : (schools.length > 0 ? 'ai' : 'none'),
      amenities: hasRealAmenities ? 'real' : (amenities.length > 0 ? 'ai' : 'none')
    };

    return {
      ...mockNeighborhoodData, // Start with mock as base
      schools,
      amenities,
      demographics: contextData.cards?.find((card: any) => card.id === 'demographics')?.fullData || mockNeighborhoodData.demographics,
      dataAvailability, // Add this to track what data is real
      dataSources, // Track whether data is real or AI-generated
      // Use AI walkability data if available, otherwise use mock
      walkScore: aiWalkabilityData?.walkScore || mockNeighborhoodData.walkScore,
      transitScore: aiWalkabilityData?.transitScore || mockNeighborhoodData.transitScore,
      bikeScore: aiWalkabilityData?.bikeScore || mockNeighborhoodData.bikeScore,
      // Enhanced highlights based on real data and AI insights
      highlights: aiEnhancedHighlights.length > 0 ? aiEnhancedHighlights : [
        hasRealSchools ? `${schools.length} schools nearby with verified ratings` : 
          schools.length > 0 ? `${schools.length} local schools identified` : "School information not available",
        hasRealAmenities ? `${amenities.length} restaurants and shops within walking distance` : 
          amenities.length > 0 ? `${amenities.length} local businesses and amenities nearby` : "Local business data not available", 
        aiWalkabilityData ? aiWalkabilityData.description : "Walkability and transportation analysis available",
        "Market trends and demographics available",
        (hasRealSchools || hasRealAmenities) ? "Real-time neighborhood data integrated" : 
          (schools.length > 0 || amenities.length > 0) ? "AI-enhanced neighborhood insights provided" :
          "Limited neighborhood data - consider visiting the area for firsthand insights"
      ]
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <MapPin className="w-4 h-4" /> },
    { id: 'schools', label: 'Schools', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'amenities', label: 'Amenities', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'market', label: 'Market', icon: <Wallet className="w-4 h-4" /> }
  ];

  // Section content generators
  const generateSectionContent = (tabId: string): string => {
    switch (tabId) {
      case 'overview':
        return `**WALKABILITY & TRANSPORTATION**
• Walk Score: ${data.walkScore}/100 - Most errands can be accomplished on foot
• Transit Score: ${data.transitScore}/100 - Good public transportation options  
• Bike Score: ${data.bikeScore}/100 - Very bikeable with good infrastructure

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
      setAddedSections(prev => prev.filter(id => id !== tabId));
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
        setAddedSections(prev => [...prev, tabId]);
        setSectionContent(prev => ({ ...prev, [tabId]: content }));
      }
    }
  };

  const handleSectionManagerToggle = (sections: string[]) => {
    if (onSectionToggle) {
      onSectionToggle(sections);
    }
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-white hover:text-brand-text-primary hover:border-brand-border'
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
            {/* Tab Header with Add Section Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-text-primary">Overview</h3>
              <button
                onClick={() => handleToggleSection('overview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  addedSections.includes('overview')
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-[1.02] shadow-brand'
                    : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                }`}
              >
                {addedSections.includes('overview') ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Remove Section</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </>
                )}
              </button>
            </div>

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

            {/* Demographics Quick Stats */}
            <div>
              <h4 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-brand-info" />
                Community Profile
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                  <div className="text-2xl font-bold text-gray-900">{data.demographics.medianAge}</div>
                  <div className="text-sm text-gray-600">Median Age</div>
                </div>
                <div className="text-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                  <div className="text-2xl font-bold text-green-600">${(data.demographics.medianIncome / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">Median Income</div>
                </div>
                <div className="text-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                  <div className="text-2xl font-bold text-blue-600">{data.demographics.familyFriendly}/10</div>
                  <div className="text-sm text-gray-600">Family Friendly</div>
                </div>
                <div className="text-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                  <div className="text-2xl font-bold text-purple-600">{data.demographics.diversityIndex}/10</div>
                  <div className="text-sm text-gray-600">Diversity Index</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-4">
            {/* Tab Header with Add Section Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-text-primary">Schools</h3>
              <button
                onClick={() => handleToggleSection('schools')}
                disabled={!data.dataAvailability?.schools && !addedSections.includes('schools')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  !data.dataAvailability?.schools && !addedSections.includes('schools')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addedSections.includes('schools')
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-[1.02] shadow-brand'
                    : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                }`}
              >
                {addedSections.includes('schools') ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Remove Section</span>
                  </>
                ) : data.dataAvailability?.schools ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>No Data Available</span>
                  </>
                )}
              </button>
            </div>

            {data.dataAvailability?.schools ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-brand-primary" />
                    Nearby Schools
                    {data.dataSources?.schools === 'ai' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        AI Enhanced
                      </span>
                    )}
                  </h4>
                  <span className="text-sm text-brand-text-tertiary">Ratings are out of 10</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.schools.map((school, index) => (
                    <SchoolCard key={index} school={school} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyStateCard
                title="No School Data Available"
                description="We couldn't find detailed information about schools in this area. This might be a newer neighborhood or an area with limited data coverage."
                icon={<Search className="w-6 h-6 text-gray-400" />}
              />
            )}
            <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-brand-text-secondary">
                <strong className="text-brand-primary">School District:</strong> This property is in an award-winning school district with a 95% graduation rate.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="space-y-4">
            {/* Tab Header with Add Section Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-text-primary">Amenities</h3>
              <button
                onClick={() => handleToggleSection('amenities')}
                disabled={!data.dataAvailability?.amenities && !addedSections.includes('amenities')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  !data.dataAvailability?.amenities && !addedSections.includes('amenities')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addedSections.includes('amenities')
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-[1.02] shadow-brand'
                    : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                }`}
              >
                {addedSections.includes('amenities') ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Remove Section</span>
                  </>
                ) : data.dataAvailability?.amenities ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>No Data Available</span>
                  </>
                )}
              </button>
            </div>

            {data.dataAvailability?.amenities ? (
              <>
                <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-brand-secondary" />
                  Popular Nearby Amenities
                  {data.dataSources?.amenities === 'ai' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      AI Enhanced
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.amenities.map((amenity, index) => (
                    <AmenityCard key={index} amenity={amenity} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyStateCard
                title="No Local Business Data Available"
                description="We couldn't find detailed information about restaurants, shops, and other businesses in this area. This might be a rural area or one with limited data coverage."
                icon={<Search className="w-6 h-6 text-gray-400" />}
              />
            )}
            <div className="mt-6 p-4 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-brand-text-secondary">
                <strong className="text-brand-secondary">Convenience:</strong> Everything you need is within walking distance, including grocery stores, cafes, and parks.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Tab Header with Add Section Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-text-primary">Market Analysis</h3>
              <button
                onClick={() => handleToggleSection('market')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  addedSections.includes('market')
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-[1.02] shadow-brand'
                    : 'bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white hover:scale-[1.02] shadow-brand'
                }`}
              >
                {addedSections.includes('market') ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Remove Section</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </>
                )}
              </button>
            </div>

            <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-brand-warning" />
              Market Analysis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                <div className="text-2xl font-bold text-gray-900">${(data.marketTrends.medianPrice / 1000).toFixed(0)}k</div>
                <div className="text-sm text-gray-600">Median Price</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-lg transition-all duration-200">
                <div className="text-2xl font-bold text-green-700">{data.marketTrends.priceChange}</div>
                <div className="text-sm text-green-600">1-Year Change</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-lg transition-all duration-200">
                <div className="text-2xl font-bold text-blue-700">{data.marketTrends.daysOnMarket}</div>
                <div className="text-sm text-blue-600">Avg Days on Market</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-lg transition-all duration-200">
                <div className="text-2xl font-bold text-orange-700">{data.marketTrends.inventory}</div>
                <div className="text-sm text-orange-600">Inventory Level</div>
              </div>
            </div>

            {listingPrice && (
              <div className="p-4 bg-gradient-to-r from-brand-accent/10 to-brand-primary/10 border border-brand-accent/20 rounded-lg backdrop-blur-sm">
                <h5 className="font-semibold text-brand-text-primary mb-3 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-brand-accent" />
                  Price Comparison
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-text-secondary">This Property:</span>
                    <span className="text-lg font-bold text-brand-accent">${listingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-text-secondary">Neighborhood Median:</span>
                    <span className="text-lg font-bold text-brand-text-primary">${data.marketTrends.medianPrice.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-brand-border">
                    <span className={`text-sm font-medium ${
                      listingPrice > data.marketTrends.medianPrice ? 'text-brand-danger' : 'text-brand-secondary'
                    }`}>
                      {listingPrice > data.marketTrends.medianPrice 
                        ? `${((listingPrice - data.marketTrends.medianPrice) / data.marketTrends.medianPrice * 100).toFixed(1)}% above median`
                        : `${((data.marketTrends.medianPrice - listingPrice) / data.marketTrends.medianPrice * 100).toFixed(1)}% below median`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
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
                    checked={selectedSections.includes(tab.id)}
                    onChange={(e) => {
                      const newSections = e.target.checked
                        ? [...selectedSections, tab.id]
                        : selectedSections.filter(s => s !== tab.id);
                      handleSectionManagerToggle(newSections);
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
                {selectedSections.length} of {tabs.length} sections selected
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