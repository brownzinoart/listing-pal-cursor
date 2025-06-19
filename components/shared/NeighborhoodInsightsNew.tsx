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
  },
  {
    id: 'transportation',
    label: 'Transit',
    icon: <Train className="w-4 h-4" />,
    description: 'Public transport and commute options'
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
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [data, setData] = useState<ComprehensiveNeighborhoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSectionManager, setShowSectionManager] = useState(false);

  // Fetch data when address or coordinates change
  useEffect(() => {
    if (address && lat && lng) {
      fetchNeighborhoodData();
    }
  }, [address, lat, lng]);

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
      const result = await neighborhoodDataService.fetchComprehensiveData(lat, lng, address);
      setData(result);
    } catch (err) {
      console.error('Error fetching neighborhood data:', err);
      setError('Unable to load neighborhood data. Please try again.');
    } finally {
      setLoading(false);
    }
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

      case 'transportation':
        return `**Transportation & Commute for ${address}**

**Transit Scores:**
• Transit Score: ${data.transportation.transitData.transitScore}/100
• Description: ${data.transportation.transitData.transitDescription}

**Commute Options (${data.transportation.commuteOptions.length}):**
${data.transportation.commuteOptions.slice(0, 5).map(option => `• ${option.name} - ${option.categories?.[0] || 'Transportation'}`).join('\n')}

**Transportation Benefits:**
${data.transportation.transportationBenefits.map(benefit => `• ${benefit}`).join('\n')}`;

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
              {address && `Comprehensive data for ${address}`}
            </p>
          </div>
          {!viewMode && (
            <div className="flex items-center space-x-3">
              {addedSections.length > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                  {addedSections.length} section{addedSections.length === 1 ? '' : 's'} added
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowSectionManager(!showSectionManager)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Sections</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Quality Indicator */}
        {data && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data Quality:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.overview.dataQuality > 70 ? 'bg-green-500' : 
                      data.overview.dataQuality > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.overview.dataQuality}%` }}
                  ></div>
                </div>
                <span className={`font-medium ${
                  data.overview.dataQuality > 70 ? 'text-green-600' : 
                  data.overview.dataQuality > 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.overview.dataQuality}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Manager Modal */}
      {showSectionManager && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSectionManager(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Manage Sections</h4>
              <button
                type="button"
                onClick={() => setShowSectionManager(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {tabs.map((tab) => (
                <label key={tab.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={addedSections.includes(tab.id)}
                    onChange={(e) => {
                      const newSections = e.target.checked
                        ? [...addedSections, tab.id]
                        : addedSections.filter((s: string) => s !== tab.id);
                      handleSectionManagerToggle(newSections);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <div>
                      <span className="text-sm font-medium">{tab.label}</span>
                      <p className="text-xs text-gray-500">{tab.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setShowSectionManager(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowSectionManager(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <div className="p-6">
        {data && <TabContent activeTab={activeTab} data={data} address={address || ''} />}
        
        {/* Add to Listing Button */}
        {!viewMode && data && (
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
    <div className="bg-gray-50 rounded-lg p-4">
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
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
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
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
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
          {/* Restaurants */}
          {data.places.restaurants.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Dining Options ({data.places.restaurants.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.places.restaurants.slice(0, 6).map(restaurant => 
                  renderListItem(restaurant, 'Restaurant')
                )}
              </div>
            </div>
          )}

          {/* Shopping */}
          {data.places.shopping.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Shopping ({data.places.shopping.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.places.shopping.slice(0, 6).map(shop => 
                  renderListItem(shop, 'Retail')
                )}
              </div>
            </div>
          )}

          {/* Entertainment */}
          {data.places.entertainment.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Entertainment ({data.places.entertainment.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.places.entertainment.slice(0, 6).map(entertainment => 
                  renderListItem(entertainment, 'Entertainment')
                )}
              </div>
            </div>
          )}

          {/* Agent Talking Points */}
          {data.places.agentTalkingPoints.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Talking Points</h4>
              <div className="space-y-2">
                {data.places.agentTalkingPoints.map((point, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
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
          {/* Crime Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Crime Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderScoreCard(
                'Safety Score', 
                data.safety.crimeData.safetyScore, 
                `${data.safety.crimeData.safetyScore > 70 ? 'Very Safe' : data.safety.crimeData.safetyScore > 50 ? 'Generally Safe' : 'Use Caution'} neighborhood`,
                <Shield className="w-4 h-4 text-gray-600" />
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Crime Rate Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crime Rate:</span>
                    <span className="font-medium">{data.safety.crimeData.crimeRate}/100k residents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <span className="font-medium capitalize">{data.safety.crimeData.trend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">vs National:</span>
                    <span className="font-medium capitalize">{data.safety.crimeData.comparedToNational}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Services */}
          {data.safety.safetyServices.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Nearby Safety Services ({data.safety.safetyServices.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.safety.safetyServices.map(service => 
                  renderListItem(service, 'Safety Service')
                )}
              </div>
            </div>
          )}

          {/* Agent Safety Pitch */}
          {data.safety.agentSafetyPitch.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Safety Pitch</h4>
              <div className="space-y-2">
                {data.safety.agentSafetyPitch.map((pitch, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Income & Employment</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Income:</span>
                    <span className="font-medium">
                      ${data.demographics.censusData.economics.medianHouseholdIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unemployment:</span>
                    <span className="font-medium">{data.demographics.censusData.economics.unemploymentRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Home Ownership:</span>
                    <span className="font-medium">{data.demographics.censusData.housing.ownerOccupied}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Market Data</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Sale Price:</span>
                    <span className="font-medium">
                      ${data.demographics.marketData.medianSalePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days on Market:</span>
                    <span className="font-medium">{data.demographics.marketData.averageDaysOnMarket} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Change:</span>
                    <span className={`font-medium ${
                      data.demographics.marketData.priceChangePercent > 0 ? 'text-green-600' : 
                      data.demographics.marketData.priceChangePercent < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {data.demographics.marketData.priceChangePercent > 0 ? '+' : ''}
                      {data.demographics.marketData.priceChangePercent}%
                    </span>
                  </div>
                </div>
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
          {/* Schools List */}
          {data.schools.schools.length > 0 && (
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

          {/* Family Appeal */}
          {data.schools.familyAppeal.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Family Appeal</h4>
              <div className="space-y-2">
                {data.schools.familyAppeal.map((appeal, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Heart className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{appeal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

    case 'transportation':
      return (
        <div className="space-y-6">
          {/* Transit Score */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Transit Accessibility</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderScoreCard(
                'Transit Score', 
                data.transportation.transitData.transitScore, 
                data.transportation.transitData.transitDescription,
                <Train className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </div>

          {/* Commute Options */}
          {data.transportation.commuteOptions.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Transportation Options ({data.transportation.commuteOptions.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.transportation.commuteOptions.map(option => 
                  renderListItem(option, 'Transportation')
                )}
              </div>
            </div>
          )}

          {/* Transportation Benefits */}
          {data.transportation.transportationBenefits.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Transportation Benefits</h4>
              <div className="space-y-2">
                {data.transportation.transportationBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Car className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Data Sources: {data.dataSources.transportation}
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

export default NeighborhoodInsights; 