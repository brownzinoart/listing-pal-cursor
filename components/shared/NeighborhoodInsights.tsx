import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  ShoppingCart,
  Heart,
  Shield,
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
  Home,
  Users,
  DollarSign,
  Activity,
  Train
} from 'lucide-react';

import { neighborhoodDataService, ComprehensiveNeighborhoodData } from '../../services/api/neighborhoodDataService';

interface NeighborhoodInsightsProps {
  address?: string;
  listingPrice?: number;
  listingType?: string;
  lat?: number;
  lng?: number;
  onSectionAdd?: (section: string, content: string) => void;
  onSectionRemove?: (section: string, content: string) => void;
  onSectionToggle: (sections: string[]) => void;
  addedSections: string[];
  viewMode?: boolean;
}

interface TabInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: TabInfo[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Home className="w-4 h-4" />,
    description: 'Walkability, highlights, and agent tips'
  },
  {
    id: 'places',
    label: 'Places',
    icon: <MapPin className="w-4 h-4" />,
    description: 'Restaurants, shopping, and amenities'
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: <Shield className="w-4 h-4" />,
    description: 'Crime data and safety services'
  },
  {
    id: 'demographics',
    label: 'Demographics',
    icon: <Users className="w-4 h-4" />,
    description: 'Population, income, and market data'
  },
  {
    id: 'schools',
    label: 'Schools',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Educational institutions and family appeal'
  }
];

const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({
  address,
  listingPrice,
  listingType = 'sale',
  lat,
  lng,
  onSectionAdd,
  onSectionRemove,
  onSectionToggle,
  addedSections,
  viewMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    viewMode && addedSections.length > 0 ? addedSections[0] : 'overview'
  );
  const [data, setData] = useState<ComprehensiveNeighborhoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [showSectionManager, setShowSectionManager] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log('showSectionManager state changed to:', showSectionManager);
  }, [showSectionManager]);

  // Fetch data when address or coordinates change
  useEffect(() => {
    if (address && lat && lng) {
      fetchNeighborhoodData();
    }
  }, [address, lat, lng]);

  // Update activeTab when in viewMode and addedSections change
  useEffect(() => {
    if (viewMode && addedSections.length > 0 && !addedSections.includes(activeTab)) {
      setActiveTab(addedSections[0]);
    }
  }, [viewMode, addedSections, activeTab]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSectionManager) {
        setShowSectionManager(false);
      }
    };

    if (showSectionManager) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showSectionManager]);

  const fetchNeighborhoodData = async () => {
    if (!address || !lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching neighborhood data for:', { address, lat, lng });
      
      // Add simulated delay for demo addresses to show loading animation
      const isDemoAddress = /123\s+demo\s+dr\.?.*demo.*dm\s+12345/i.test(address.toLowerCase());
      if (isDemoAddress) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      }
      
      const result = await neighborhoodDataService.fetchComprehensiveData(lat, lng, address);
      setData(result);
    } catch (err) {
      console.error('Error fetching neighborhood data:', err);
      setError('Unable to load neighborhood data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tabId: string) => {
    if (tabId === activeTab) return;
    
    // Show tab-specific loading animation
    setTabLoading(prev => ({ ...prev, [tabId]: true }));
    
    // Simulate data loading delay for better UX
    const isDemoAddress = address && /123\s+demo\s+dr\.?.*demo.*dm\s+12345/i.test(address.toLowerCase());
    const delay = isDemoAddress ? 800 : 300; // Longer delay for demo to show off the animation
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setActiveTab(tabId);
    setTabLoading(prev => ({ ...prev, [tabId]: false }));
  };

  const generateSectionContent = (tabId: string): string => {
    if (!data) return '';

    switch (tabId) {
      case 'overview':
        return `**Neighborhood Overview for ${address}**

**Walkability Scores:**
• Walk Score: ${data.overview.walkScore.walkScore}/100 (${data.overview.walkScore.walkDescription})
• Transit Score: ${data.overview.walkScore.transitScore}/100 (${data.overview.walkScore.transitDescription})
• Bike Score: ${data.overview.walkScore.bikeScore}/100 (${data.overview.walkScore.bikeDescription})

**Key Highlights:**
${data.overview.highlights.map(highlight => `• ${highlight}`).join('\n')}

**Agent Tips:**
${data.overview.agentTips.map(tip => `• ${tip}`).join('\n')}

**Data Quality:** ${data.overview.dataQuality}% (${data.overview.dataQuality > 70 ? 'High' : data.overview.dataQuality > 40 ? 'Medium' : 'Low'} reliability)`;

      case 'places':
        return `**Places & Amenities near ${address}**

**Dining Options (${data.places.restaurants.length}):**
${data.places.restaurants.slice(0, 5).map(r => `• ${r.name} - ${r.categories?.[0] || 'Restaurant'}`).join('\n')}

**Shopping (${data.places.shopping.length}):**
${data.places.shopping.slice(0, 5).map(s => `• ${s.name} - ${s.categories?.[0] || 'Retail'}`).join('\n')}

**Entertainment (${data.places.entertainment.length}):**
${data.places.entertainment.slice(0, 5).map(e => `• ${e.name} - ${e.categories?.[0] || 'Entertainment'}`).join('\n')}

**Agent Talking Points:**
${data.places.agentTalkingPoints.map(point => `• ${point}`).join('\n')}`;

      case 'safety':
        return `**Safety Information for ${address}**

**Crime Statistics:**
• Safety Score: ${data.safety.crimeData.safetyScore}/100 (${data.safety.crimeData.safetyScore > 70 ? 'Very Safe' : data.safety.crimeData.safetyScore > 50 ? 'Generally Safe' : 'Use Caution'})
• Crime Rate: ${data.safety.crimeData.crimeRate} per 100,000 residents
• Trend: ${data.safety.crimeData.trend}
• Compared to National Average: ${data.safety.crimeData.comparedToNational}

**Nearby Safety Services (${data.safety.safetyServices.length}):**
${data.safety.safetyServices.slice(0, 3).map(s => `• ${s.name}`).join('\n')}

**Agent Safety Pitch:**
${data.safety.agentSafetyPitch.map(pitch => `• ${pitch}`).join('\n')}`;

      case 'demographics':
        return `**Demographics & Market Data for ${address}**

**Population Demographics:**
• Total Population: ${data.demographics.censusData.population.total.toLocaleString()}
• Median Age: ${data.demographics.censusData.population.medianAge} years
• College Educated: ${data.demographics.censusData.education.bachelorsOrHigher}%

**Economic Profile:**
• Median Household Income: $${data.demographics.censusData.economics.medianHouseholdIncome.toLocaleString()}
• Unemployment Rate: ${data.demographics.censusData.economics.unemploymentRate}%
• Home Ownership: ${data.demographics.censusData.housing.ownerOccupied}%

**Market Data:**
• Median Sale Price: $${data.demographics.marketData.medianSalePrice.toLocaleString()}
• Average Days on Market: ${data.demographics.marketData.averageDaysOnMarket} days
• Market Trend: ${data.demographics.marketData.marketTrend}
• Price Change: ${data.demographics.marketData.priceChangePercent > 0 ? '+' : ''}${data.demographics.marketData.priceChangePercent}%

**Target Buyer Profiles:**
${data.demographics.targetBuyerProfiles.map(profile => `• ${profile}`).join('\n')}`;

      case 'schools':
        return `**Schools & Education near ${address}**

**Educational Institutions (${data.schools.schools.length}):**
${data.schools.schools.slice(0, 5).map(school => `• ${school.name} - ${school.categories?.[0] || 'Educational Institution'}`).join('\n')}

**Educational Demographics:**
• College Educated in Area: ${data.schools.educationalDemographics.collegeEducated}%
• Median Age: ${data.schools.educationalDemographics.medianAge} years

**Family Appeal:**
${data.schools.familyAppeal.map(appeal => `• ${appeal}`).join('\n')}

**Marketing Angles:**
${data.schools.marketingAngles.map(angle => `• ${angle}`).join('\n')}`;

      default:
        return 'No content available for this section.';
    }
  };

  const handleToggleSection = (tabId: string) => {
    const content = generateSectionContent(tabId);
    const tabLabel = tabs.find(tab => tab.id === tabId)?.label || tabId;
    
    let newSections;
    if (addedSections.includes(tabId)) {
      // Remove the section
      newSections = addedSections.filter(section => section !== tabId);
      onSectionRemove?.(tabLabel, content);
    } else {
      // Add the section
      newSections = [...addedSections, tabId];
      onSectionAdd?.(tabLabel, content);
    }
    
    // Update the parent component's state
    onSectionToggle(newSections);
  };

  const handleSectionManagerToggle = (sections: string[]) => {
    console.log('handleSectionManagerToggle called with sections:', sections);
    onSectionToggle(sections);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading neighborhood insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button 
              onClick={fetchNeighborhoodData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center text-center">
            <Search className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-gray-600 text-sm">Enter an address to view neighborhood insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Neighborhood Insights</h3>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode ? 
                (addedSections.length > 0 ? 
                  `${addedSections.length} section${addedSections.length === 1 ? '' : 's'} selected for ${address}` : 
                  'No sections selected'
                ) :
                (address && `Comprehensive data for ${address}`)
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!viewMode ? (
              <>
                {addedSections.length > 0 && (
                  <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                    {addedSections.length} section{addedSections.length === 1 ? '' : 's'} added
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Manage Sections button clicked! Current state:', showSectionManager);
                    setShowSectionManager(!showSectionManager);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Sections</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('View mode manage button clicked!');
                  setShowSectionManager(!showSectionManager);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold rounded-lg hover:opacity-90 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 border border-transparent"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </button>
            )}
          </div>
        </div>


      </div>

      {/* Inline Section Manager */}
      {showSectionManager && (
        <div className="border-b border-gray-200 bg-blue-50 p-6 -mx-6 sm:-mx-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Select Sections to Include</h4>
            <button
              type="button"
              onClick={() => setShowSectionManager(false)}
              className="p-1 hover:bg-blue-100 rounded text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <label key={tab.id} className="flex items-start space-x-3 cursor-pointer hover:bg-blue-100 p-3 rounded-lg border border-blue-200 bg-white">
                <input
                  type="checkbox"
                  checked={addedSections.includes(tab.id)}
                  onChange={(e) => {
                    const newSections = e.target.checked
                      ? [...addedSections, tab.id]
                      : addedSections.filter(s => s !== tab.id);
                    handleSectionManagerToggle(newSections);
                  }}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="text-blue-600">
                      {tab.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{tab.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{tab.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {addedSections.length} section{addedSections.length === 1 ? '' : 's'} selected
            </p>
            <button
              type="button"
              onClick={() => setShowSectionManager(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {(viewMode ? addedSections.length > 0 : true) && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs
              .filter(tab => viewMode ? addedSections.includes(tab.id) : true)
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {viewMode && addedSections.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No neighborhood insights added</p>
            <p className="text-sm text-gray-500">Edit this listing to add neighborhood sections</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading neighborhood insights...</span>
            </div>
          </div>
        ) : tabLoading[activeTab] ? (
          <TabLoadingAnimation tabId={activeTab} />
        ) : data ? (
          <TabContent activeTab={activeTab} data={data} address={address || ''} />
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Enter an address to see neighborhood insights</p>
          </div>
        )}
        
        {/* Add to Listing Button */}
        {!viewMode && data && !loading && !tabLoading[activeTab] && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleToggleSection(activeTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                addedSections.includes(activeTab)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {addedSections.includes(activeTab) ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Remove from Listing</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Listing</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Content Component
interface TabContentProps {
  activeTab: string;
  data: ComprehensiveNeighborhoodData;
  address: string;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, data, address }) => {
  const renderScoreCard = (title: string, score: number, description: string, icon: React.ReactNode) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <span className={`text-2xl font-bold ${
          score >= 80 ? 'text-green-600' : 
          score >= 60 ? 'text-yellow-600' : 
          'text-red-600'
        }`}>
          {score}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${
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

  const renderListItem = (item: any, category: string) => (
    <div key={item.name || item.formatted} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm">
      <h4 className="font-medium text-gray-900 text-sm">{item.name || 'Unknown'}</h4>
      <p className="text-xs text-gray-600 mt-1">
        {item.categories?.[0] || category} • {item.formatted || 'Location data unavailable'}
      </p>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6">
          {/* Walkability Scores */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Walkability Scores</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderScoreCard(
                'Walk Score', 
                data.overview.walkScore.walkScore, 
                data.overview.walkScore.walkDescription,
                <Activity className="w-4 h-4 text-gray-600" />
              )}
              {renderScoreCard(
                'Transit Score', 
                data.overview.walkScore.transitScore, 
                data.overview.walkScore.transitDescription,
                <Train className="w-4 h-4 text-gray-600" />
              )}
              {renderScoreCard(
                'Bike Score', 
                data.overview.walkScore.bikeScore, 
                data.overview.walkScore.bikeDescription,
                <Car className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </div>

          {/* Highlights */}
          {data.overview.highlights.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Neighborhood Highlights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.overview.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Tips */}
          {data.overview.agentTips.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Tips</h4>
              <div className="space-y-3">
                {data.overview.agentTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-700">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.overview}
            </p>
          </div>
        </div>
      );

    case 'places':
      return (
        <div className="space-y-6">
          {/* Show data availability notice */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Places Data Status</p>
                <p className="text-xs text-green-600 mt-1">
                  Using Geoapify Places API for comprehensive neighborhood amenities
                </p>
              </div>
            </div>
          </div>

          {/* Restaurants */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Dining ({data.places.restaurants.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.places.restaurants.map((restaurant) => renderListItem(restaurant, 'Restaurant'))}
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping ({data.places.shopping.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.places.shopping.map((shop) => renderListItem(shop, 'Shopping'))}
            </div>
          </div>

          {/* Entertainment */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>Entertainment ({data.places.entertainment.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.places.entertainment.map((venue) => renderListItem(venue, 'Entertainment'))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Services ({data.places.services.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.places.services.map((service) => renderListItem(service, 'Service'))}
            </div>
          </div>

          {/* Healthcare */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Healthcare ({(data.places as any).healthcare?.length || 0})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {((data.places as any).healthcare || []).map((facility: any) => renderListItem(facility, 'Healthcare'))}
            </div>
          </div>

          {/* Recreation */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recreation ({(data.places as any).recreation?.length || 0})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {((data.places as any).recreation || []).map((facility: any) => renderListItem(facility, 'Recreation'))}
            </div>
          </div>

          {/* Agent Talking Points */}
          {data.places.agentTalkingPoints.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Talking Points</h4>
              <div className="space-y-2">
                {data.places.agentTalkingPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.places}
            </p>
          </div>
        </div>
      );

    case 'safety':
      return (
        <div className="space-y-6">
          {/* Show data availability notice */}
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Safety Data Status</p>
                <p className="text-xs text-red-600 mt-1">
                  Using FBI Crime Data API for comprehensive safety analysis
                </p>
              </div>
            </div>
          </div>

          {/* Crime Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Crime Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderScoreCard(
                'Safety Score', 
                data.safety.crimeData.safetyScore, 
                `${data.safety.crimeData.comparedToNational} compared to national average`,
                <Shield className="w-4 h-4 text-gray-600" />
              )}
            </div>
            
            {/* Detailed Crime Stats */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Detailed Statistics</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 font-medium">Crime Rate</p>
                  <p className="text-blue-700 font-semibold">{data.safety.crimeData.crimeRate} per 100k</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Violent Crime</p>
                  <p className="text-blue-700 font-semibold">{(data.safety.crimeData as any).violentCrimeRate || data.safety.crimeData.violentCrime || 1.1} per 100k</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Property Crime</p>
                  <p className="text-blue-700 font-semibold">{(data.safety.crimeData as any).propertyCrimeRate || data.safety.crimeData.propertyCrime || 7.1} per 100k</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Trend</p>
                  <p className="text-green-700 font-semibold">{data.safety.crimeData.trend}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Services */}
          {data.safety.safetyServices.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.safety.safetyServices.map((service) => renderListItem(service, 'Safety Service'))}
              </div>
            </div>
          )}

          {/* Agent Safety Pitch */}
          {data.safety.agentSafetyPitch.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Safety Talking Points</h4>
              <div className="space-y-2">
                {data.safety.agentSafetyPitch.map((pitch, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{pitch}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.safety}
            </p>
          </div>
        </div>
      );

    case 'demographics':
      return (
        <div className="space-y-6">
          {/* Show data availability notice */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Census & Market Data Status</p>
                <p className="text-xs text-green-600 mt-1">
                  {data.demographics.censusData.dataAvailable 
                    ? 'Using real US Census API and ATTOM market data'
                    : 'Using estimated demographic and market data'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Population Demographics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Population Demographics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Population</h5>
                <p className="text-2xl font-bold text-blue-600">
                  {data.demographics.censusData.population.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Total residents</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Median Age</h5>
                <p className="text-2xl font-bold text-blue-600">
                  {data.demographics.censusData.population.medianAge}
                </p>
                <p className="text-xs text-gray-600">Years old</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">College Educated</h5>
                <p className="text-2xl font-bold text-blue-600">
                  {data.demographics.censusData.education.bachelorsOrHigher}%
                </p>
                <p className="text-xs text-gray-600">Bachelor's degree or higher</p>
              </div>
            </div>
          </div>

          {/* Economic Profile */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Economic Profile</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 font-medium">Median Income</p>
                  <p className="text-green-700 font-bold text-lg">${data.demographics.censusData.economics.medianHouseholdIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Unemployment</p>
                  <p className="text-blue-700 font-bold text-lg">{data.demographics.censusData.economics.unemploymentRate}%</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Home Ownership</p>
                  <p className="text-purple-700 font-bold text-lg">{data.demographics.censusData.housing.ownerOccupied}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Market Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Median Sale Price</h5>
                <p className="text-2xl font-bold text-blue-600">${data.demographics.marketData.medianSalePrice.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Average Days on Market</h5>
                <p className="text-2xl font-bold text-blue-600">{data.demographics.marketData.averageDaysOnMarket} days</p>
              </div>
            </div>
          </div>

          {/* Target Buyer Profiles */}
          {data.demographics.targetBuyerProfiles.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Target Buyer Profiles</h4>
              <div className="space-y-2">
                {data.demographics.targetBuyerProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">{profile}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.demographics}
            </p>
          </div>
        </div>
      );

    case 'schools':
      return (
        <div className="space-y-6">
          {/* Show data availability notice */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Education Data Status</p>
                <p className="text-xs text-purple-600 mt-1">
                  Using Geoapify Places API to identify educational institutions in the area
                </p>
              </div>
            </div>
          </div>

          {/* Schools List */}
          {data.schools.schools.length > 0 ? (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Educational Institutions ({data.schools.schools.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.schools.schools.map(school => 
                  renderListItem(school, 'Educational Institution')
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No school data available yet</p>
              <p className="text-xs text-gray-400 mt-1">Educational institution data loading</p>
            </div>
          )}

          {/* Educational Demographics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Educational Demographics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">College Educated</h5>
                <p className="text-2xl font-bold text-green-600">
                  {data.schools.educationalDemographics.collegeEducated}%
                </p>
                <p className="text-xs text-gray-600">Bachelor's degree or higher</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Median Age</h5>
                <p className="text-2xl font-bold text-green-600">
                  {data.schools.educationalDemographics.medianAge}
                </p>
                <p className="text-xs text-gray-600">Years old</p>
              </div>
            </div>
          </div>

          {/* Marketing Angles */}
          {data.schools.marketingAngles.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Marketing Angles</h4>
              <div className="space-y-2">
                {data.schools.marketingAngles.map((angle, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{angle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.schools}
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Select a tab to view neighborhood insights</p>
        </div>
      );
  }
};

// Tab Loading Animation Component
interface TabLoadingAnimationProps {
  tabId: string;
}

const TabLoadingAnimation: React.FC<TabLoadingAnimationProps> = ({ tabId }) => {
  const getTabLoadingContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return {
          title: 'Loading walkability scores...',
          items: ['Walk Score', 'Transit Score', 'Bike Score', 'Neighborhood highlights']
        };
      case 'places':
        return {
          title: 'Finding nearby places...',
          items: ['Restaurants & dining', 'Shopping centers', 'Entertainment venues', 'Essential services', 'Healthcare facilities', 'Recreation centers']
        };
      case 'safety':
        return {
          title: 'Analyzing safety data...',
          items: ['Crime statistics', 'Safety ratings', 'Emergency services', 'Community safety']
        };
      case 'demographics':
        return {
          title: 'Processing demographic data...',
          items: ['Population statistics', 'Income levels', 'Education data', 'Market trends']
        };
      case 'schools':
        return {
          title: 'Researching school information...',
          items: ['Elementary schools', 'Middle schools', 'High schools', 'Educational ratings']
        };
      default:
        return {
          title: 'Loading data...',
          items: ['Gathering information', 'Processing data', 'Analyzing results']
        };
    }
  };

  const content = getTabLoadingContent(tabId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-lg font-medium text-gray-900">{content.title}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.items.map((item, index) => (
          <div
            key={item}
            className="bg-gray-50 rounded-lg p-4 animate-pulse"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-200 rounded-full animate-bounce"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center py-4">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Analyzing neighborhood data from multiple sources...</span>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodInsights; 