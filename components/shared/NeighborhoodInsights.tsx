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
  Star
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
  ]
};

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, icon, description }) => (
  <div className="bg-brand-card border border-brand-border rounded-lg p-4 hover:shadow-brand-md hover:scale-[1.02] transform transition-all duration-200 cursor-pointer">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm font-medium text-brand-text-secondary">{title}</span>
      </div>
      <div className={`text-2xl font-bold ${
        score >= 80 ? 'text-brand-secondary' : 
        score >= 60 ? 'text-brand-warning' : 
        'text-brand-danger'
      }`}>
        {score}
      </div>
    </div>
    <div className="w-full bg-brand-background rounded-full h-2 mb-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${
          score >= 80 ? 'bg-brand-secondary' : 
          score >= 60 ? 'bg-brand-warning' : 
          'bg-brand-danger'
        }`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
    <p className="text-xs text-brand-text-tertiary">{description}</p>
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
  <div className="bg-brand-card border border-brand-border rounded-lg p-4 hover:shadow-brand-md hover:scale-[1.01] transform transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-medium text-brand-text-primary">{school.name}</h4>
        <p className="text-sm text-brand-text-tertiary">{school.type} • {school.distance}</p>
      </div>
      <div className="flex items-center space-x-1 bg-brand-primary/20 px-2 py-1 rounded-full">
        <Star className="w-3 h-3 text-brand-primary" />
        <span className="text-sm font-bold text-brand-primary">{school.rating}</span>
        <span className="text-xs text-brand-text-secondary">/10</span>
      </div>
    </div>
    <div className="w-full bg-brand-background rounded-full h-1.5">
      <div 
        className="bg-brand-primary h-1.5 rounded-full transition-all duration-300" 
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
  <div className="flex items-center space-x-3 p-3 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand hover:bg-brand-panel transition-all duration-200">
    <span className="text-2xl">{amenity.icon}</span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-brand-text-primary truncate">{amenity.name}</p>
      <p className="text-sm text-brand-text-tertiary">{amenity.category} • {amenity.distance}</p>
    </div>
  </div>
);

interface NeighborhoodInsightsProps {
  address?: string;
  listingPrice?: number;
}

const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({ address, listingPrice }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockNeighborhoodData);

  // In a real app, you'd fetch this data based on the address
  useEffect(() => {
    // setLoading(true);
    // fetchNeighborhoodData(address).then(setData).finally(() => setLoading(false));
  }, [address]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <MapPin className="w-4 h-4" /> },
    { id: 'schools', label: 'Schools', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'amenities', label: 'Amenities', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'market', label: 'Market', icon: <Wallet className="w-4 h-4" /> }
  ];

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
        <h3 className="text-xl font-bold text-brand-text-primary mb-1 flex items-center">
          <Building className="w-6 h-6 mr-2 text-brand-primary" />
          Neighborhood Insights
        </h3>
        <p className="text-sm text-brand-text-secondary">Discover what makes this area special</p>
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
                  : 'border-transparent text-brand-text-tertiary hover:text-brand-text-secondary hover:border-brand-border'
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
                  <div key={index} className="flex items-start space-x-3 p-3 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand hover:scale-[1.01] transform transition-all duration-200">
                    <Heart className="w-5 h-5 text-brand-danger mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-brand-text-secondary">{highlight}</span>
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
                <div className="text-center p-4 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand-md transition-all duration-200">
                  <div className="text-2xl font-bold text-brand-text-primary">{data.demographics.medianAge}</div>
                  <div className="text-sm text-brand-text-tertiary">Median Age</div>
                </div>
                <div className="text-center p-4 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand-md transition-all duration-200">
                  <div className="text-2xl font-bold text-brand-secondary">${(data.demographics.medianIncome / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-brand-text-tertiary">Median Income</div>
                </div>
                <div className="text-center p-4 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand-md transition-all duration-200">
                  <div className="text-2xl font-bold text-brand-primary">{data.demographics.familyFriendly}/10</div>
                  <div className="text-sm text-brand-text-tertiary">Family Friendly</div>
                </div>
                <div className="text-center p-4 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand-md transition-all duration-200">
                  <div className="text-2xl font-bold text-brand-accent">{data.demographics.diversityIndex}/10</div>
                  <div className="text-sm text-brand-text-tertiary">Diversity Index</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-brand-primary" />
                Nearby Schools
              </h4>
              <span className="text-sm text-brand-text-tertiary">Ratings are out of 10</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.schools.map((school, index) => (
                <SchoolCard key={index} school={school} />
              ))}
            </div>
            <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-brand-text-secondary">
                <strong className="text-brand-primary">School District:</strong> This property is in an award-winning school district with a 95% graduation rate.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-brand-secondary" />
              Popular Nearby Amenities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.amenities.map((amenity, index) => (
                <AmenityCard key={index} amenity={amenity} />
              ))}
            </div>
            <div className="mt-6 p-4 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-brand-text-secondary">
                <strong className="text-brand-secondary">Convenience:</strong> Everything you need is within walking distance, including grocery stores, cafes, and parks.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-brand-text-primary flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-brand-warning" />
              Market Analysis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-brand-card border border-brand-border rounded-lg hover:shadow-brand-md transition-all duration-200">
                <div className="text-2xl font-bold text-brand-text-primary">${(data.marketTrends.medianPrice / 1000).toFixed(0)}k</div>
                <div className="text-sm text-brand-text-tertiary">Median Price</div>
              </div>
              <div className="text-center p-4 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg hover:shadow-brand-md transition-all duration-200">
                <div className="text-2xl font-bold text-brand-secondary">{data.marketTrends.priceChange}</div>
                <div className="text-sm text-brand-text-tertiary">1-Year Change</div>
              </div>
              <div className="text-center p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg hover:shadow-brand-md transition-all duration-200">
                <div className="text-2xl font-bold text-brand-primary">{data.marketTrends.daysOnMarket}</div>
                <div className="text-sm text-brand-text-tertiary">Avg Days on Market</div>
              </div>
              <div className="text-center p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-lg hover:shadow-brand-md transition-all duration-200">
                <div className="text-2xl font-bold text-brand-warning">{data.marketTrends.inventory}</div>
                <div className="text-sm text-brand-text-tertiary">Inventory Level</div>
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
    </div>
  );
};

export default NeighborhoodInsights; 