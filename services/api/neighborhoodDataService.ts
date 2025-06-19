// Comprehensive Neighborhood Data Service
import { geoapifyService, GeoapifyPlace } from './geoapifyService';
import { walkScoreService, WalkScoreData } from './walkScoreService';
import { fbiCrimeService, CrimeData } from './fbiCrimeService';
import { censusService, CensusData } from './censusService';
import { attomService, AttomMarketData, AttomComparables } from './attomService';

// Note: OpenAI service is in JS, so we'll import it dynamically
declare function require(name: string): any;

export interface ComprehensiveNeighborhoodData {
  overview: {
    walkScore: WalkScoreData;
    highlights: string[];
    agentTips: string[];
    dataQuality: number;
  };
  places: {
    restaurants: GeoapifyPlace[];
    shopping: GeoapifyPlace[];
    entertainment: GeoapifyPlace[];
    services: GeoapifyPlace[];
    healthcare: GeoapifyPlace[];
    recreation: GeoapifyPlace[];
    agentTalkingPoints: string[];
  };
  safety: {
    crimeData: CrimeData;
    safetyServices: GeoapifyPlace[];
    agentSafetyPitch: string[];
  };
  demographics: {
    censusData: CensusData;
    marketData: AttomMarketData;
    targetBuyerProfiles: string[];
  };
  schools: {
    schools: GeoapifyPlace[];
    educationalDemographics: any;
    familyAppeal: string[];
    marketingAngles: string[];
  };
  transportation: {
    transitData: any;
    commuteOptions: GeoapifyPlace[];
    transportationBenefits: string[];
  };
  dataAvailability: {
    [key: string]: boolean;
  };
  dataSources: {
    [key: string]: string;
  };
}

export class NeighborhoodDataService {
  private extractStateFromAddress(address: string): string {
    // Simple state extraction - would be more robust in production
    const stateRegex = /\b([A-Z]{2})\b(?:\s+\d{5})?$/;
    const match = address.match(stateRegex);
    return match ? match[1] : 'CA'; // Default to California
  }

  private extractZipFromAddress(address: string): string {
    const zipRegex = /\b(\d{5}(?:-\d{4})?)\b/;
    const match = address.match(zipRegex);
    return match ? match[1].split('-')[0] : '90210'; // Default zip
  }

  async fetchComprehensiveData(
    lat: number, 
    lng: number, 
    address: string
  ): Promise<ComprehensiveNeighborhoodData> {
    console.log('Fetching comprehensive neighborhood data...', { lat, lng, address });

    // Check if this is a demo address
    if (this.isDemoAddress(address)) {
      console.log('🎭 Demo address detected, returning rich mock data');
      return this.getDemoNeighborhoodData(address);
    }

    try {
      // Extract location info
      const stateAbbr = this.extractStateFromAddress(address);
      const zipCode = this.extractZipFromAddress(address);
      const stateCode = censusService.getStateCode(this.getFullStateName(stateAbbr));

      // Fetch all data in parallel for better performance
      const [
        walkScoreData,
        amenitiesData,
        crimeData,
        censusData,
        marketData,
        comparables
      ] = await Promise.allSettled([
        walkScoreService.getWalkScore(lat, lng, address),
        geoapifyService.getAllAmenities(lat, lng),
        fbiCrimeService.getCrimeDataByState(stateAbbr),
        censusService.getDemographicsByState(stateCode),
        attomService.getMarketData(zipCode),
        attomService.getComparables(lat, lng)
      ]);

      // Process results and handle failures gracefully
      const walkScore = walkScoreData.status === 'fulfilled' ? walkScoreData.value : this.getDefaultWalkScore();
      const amenities = amenitiesData.status === 'fulfilled' ? amenitiesData.value : this.getDefaultAmenities();
      const crime = crimeData.status === 'fulfilled' ? crimeData.value : this.getDefaultCrimeData();
      const demographics = censusData.status === 'fulfilled' ? censusData.value : this.getDefaultCensusData();
      const market = marketData.status === 'fulfilled' ? marketData.value : this.getDefaultMarketData();

      // Generate AI insights based on collected data
      const agentTips = await this.generateAgentTips(address, {
        walkScore,
        amenities,
        crime,
        demographics,
        market
      });

      const highlights = this.generateHighlights(walkScore, amenities, crime, demographics, market);

      // Calculate data availability
      const dataAvailability = {
        overview: walkScore.status === 'success',
        places: amenities.totalCount > 0,
        safety: crime.dataAvailable,
        demographics: demographics.dataAvailable,
        schools: amenities.schools.length > 0,
        transportation: walkScore.transitScore > 0
      };

      const dataSources = {
        overview: 'WalkScore API, Geoapify Places API',
        places: 'Geoapify Places API',
        safety: crime.dataAvailable ? 'FBI Crime Data API' : 'Default Data',
        demographics: demographics.dataAvailable ? 'US Census API, ATTOM API' : 'Default Data',
        schools: 'Geoapify Places API',
        transportation: 'WalkScore API, Geoapify Places API'
      };

      return {
        overview: {
          walkScore,
          highlights,
          agentTips,
          dataQuality: this.calculateDataQuality(dataAvailability)
        },
        places: {
          restaurants: amenities.restaurants.slice(0, 10),
          shopping: amenities.shopping.slice(0, 10),
          entertainment: amenities.entertainment.slice(0, 10),
          services: amenities.services.slice(0, 10),
          healthcare: amenities.healthcare.slice(0, 5),
          recreation: amenities.recreation.slice(0, 5),
          agentTalkingPoints: await this.generatePlacesTalkingPoints(amenities)
        },
        safety: {
          crimeData: crime,
          safetyServices: amenities.safety.slice(0, 5),
          agentSafetyPitch: this.generateSafetyPitch(crime)
        },
        demographics: {
          censusData: demographics,
          marketData: market,
          targetBuyerProfiles: this.generateBuyerProfiles(demographics, market)
        },
        schools: {
          schools: amenities.schools.slice(0, 8),
          educationalDemographics: {
            collegeEducated: demographics.education.bachelorsOrHigher,
            medianAge: demographics.population.medianAge
          },
          familyAppeal: this.generateFamilyAppeal(amenities.schools),
          marketingAngles: this.generateEducationMarketingAngles(amenities.schools)
        },
        transportation: {
          transitData: {
            transitScore: walkScore.transitScore,
            transitDescription: walkScore.transitDescription
          },
          commuteOptions: amenities.transportation.slice(0, 8),
          transportationBenefits: this.generateTransportationBenefits(walkScore, amenities.transportation)
        },
        dataAvailability,
        dataSources
      };

    } catch (error) {
      console.error('Error fetching comprehensive neighborhood data:', error);
      return this.getDefaultComprehensiveData();
    }
  }

  private async generateAgentTips(address: string, data: any): Promise<string[]> {
    try {
      // Dynamic import for JS module
      const { OpenAIService } = require('../openaiService');
      const openaiService = new OpenAIService();
      
      const insights = await openaiService.generateAgentTips(address, {
        walkScore: data.walkScore.walkScore,
        transitScore: data.walkScore.transitScore,
        bikeScore: data.walkScore.bikeScore,
        schools: [],
        crimeData: { score: data.crime.safetyScore },
        demographics: {
          familyFriendly: 7,
          medianIncome: data.demographics.economics.medianHouseholdIncome
        },
        marketTrends: {
          medianPrice: data.market.medianSalePrice,
          priceGrowth1Year: data.market.priceChangePercent,
          daysOnMarket: data.market.averageDaysOnMarket
        },
        amenities: data.amenities.restaurants
      });
      
      if (insights && Array.isArray(insights) && insights.length > 0) {
        return insights.filter((tip: string) => tip.trim().length > 0).slice(0, 3);
      }
    } catch (error) {
      console.error('Error generating agent tips:', error);
    }

    // Fallback tips
    return [
      'Highlight the walkability score to attract urban professionals and empty nesters',
      'Use local amenity count to demonstrate convenience and lifestyle value',
      'Emphasize safety ratings and community features for family buyers'
    ];
  }

  private generateHighlights(walkScore: WalkScoreData, amenities: any, crime: CrimeData, demographics: CensusData, market: AttomMarketData): string[] {
    const highlights: string[] = [];

    if (walkScore.walkScore > 70) {
      highlights.push(`Excellent walkability (${walkScore.walkScore}/100) - most errands can be completed on foot`);
    }

    if (walkScore.transitScore > 70) {
      highlights.push(`Great public transit access (${walkScore.transitScore}/100) for easy commuting`);
    }

    if (amenities.restaurants.length > 10) {
      highlights.push(`Rich dining scene with ${amenities.restaurants.length}+ restaurants nearby`);
    }

    if (crime.safetyScore > 70) {
      highlights.push(`Safe neighborhood with ${fbiCrimeService.getSafetyLabel(crime.safetyScore).toLowerCase()} rating`);
    }

    if (demographics.economics.medianHouseholdIncome > 75000) {
      highlights.push(`Affluent area with median income of $${demographics.economics.medianHouseholdIncome.toLocaleString()}`);
    }

    if (demographics.education.bachelorsOrHigher > 50) {
      highlights.push(`Highly educated community (${demographics.education.bachelorsOrHigher}% college graduates)`);
    }

    if (market.marketTrend === 'seller') {
      highlights.push("Strong seller's market with high demand and limited inventory");
    }

    return highlights.slice(0, 5); // Limit to top 5
  }

  private async generatePlacesTalkingPoints(amenities: any): Promise<string[]> {
    const points: string[] = [];

    if (amenities.restaurants.length > 0) {
      points.push(`${amenities.restaurants.length} dining options within walking distance`);
    }

    if (amenities.shopping.length > 0) {
      points.push(`Convenient shopping with ${amenities.shopping.length} retail locations nearby`);
    }

    if (amenities.entertainment.length > 0) {
      points.push(`Rich entertainment options with ${amenities.entertainment.length} venues`);
    }

    return points;
  }

  private generateSafetyPitch(crime: CrimeData): string[] {
    const pitch: string[] = [];

    pitch.push(`Safety score of ${crime.safetyScore}/100 - ${fbiCrimeService.getSafetyLabel(crime.safetyScore)}`);
    
    if (crime.comparedToNational === 'better') {
      pitch.push('Crime rates are below the national average');
    } else if (crime.comparedToNational === 'average') {
      pitch.push('Crime rates are in line with national averages');
    }

    if (crime.trend === 'improving') {
      pitch.push('Crime trends show neighborhood improvement over time');
    }

    return pitch;
  }

  private generateBuyerProfiles(demographics: CensusData, market: AttomMarketData): string[] {
    const profiles: string[] = [];

    if (demographics.economics.medianHouseholdIncome > 100000) {
      profiles.push('High-income professionals seeking premium amenities');
    } else if (demographics.economics.medianHouseholdIncome > 60000) {
      profiles.push('Middle-class families looking for value and community');
    }

    if (demographics.education.bachelorsOrHigher > 60) {
      profiles.push('Educated professionals prioritizing schools and culture');
    }

    if (demographics.population.medianAge < 35) {
      profiles.push('Young professionals and millennials seeking urban lifestyle');
    } else if (demographics.population.medianAge > 50) {
      profiles.push('Empty nesters looking for low-maintenance living');
    }

    return profiles.slice(0, 3);
  }

  private generateFamilyAppeal(schools: GeoapifyPlace[]): string[] {
    const appeal: string[] = [];

    if (schools.length > 3) {
      appeal.push(`${schools.length} educational institutions within the area`);
    }

    appeal.push('Family-friendly neighborhood with educational opportunities');
    appeal.push('Close proximity to schools reduces commute time for families');

    return appeal;
  }

  private generateEducationMarketingAngles(schools: GeoapifyPlace[]): string[] {
    const angles: string[] = [];

    if (schools.length > 0) {
      angles.push('Emphasize school proximity for families with children');
      angles.push('Highlight educational opportunities for property value stability');
      angles.push('Market to families prioritizing their children\'s education');
    }

    return angles;
  }

  private generateTransportationBenefits(walkScore: WalkScoreData, transportation: GeoapifyPlace[]): string[] {
    const benefits: string[] = [];

    if (walkScore.walkScore > 70) {
      benefits.push('Reduced car dependency saves money on transportation costs');
    }

    if (walkScore.transitScore > 50) {
      benefits.push('Easy access to public transit for city commuters');
    }

    if (transportation.length > 0) {
      benefits.push(`${transportation.length} transportation options nearby`);
    }

    return benefits;
  }

  private calculateDataQuality(availability: { [key: string]: boolean }): number {
    const values = Object.values(availability);
    const available = values.filter(Boolean).length;
    return Math.round((available / values.length) * 100);
  }

  private getFullStateName(abbr: string): string {
    const stateMap: { [key: string]: string } = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return stateMap[abbr] || 'California';
  }

  // Default data methods
  private getDefaultWalkScore(): WalkScoreData {
    return {
      walkScore: 0,
      walkDescription: 'Walk Score unavailable',
      transitScore: 0,
      transitDescription: 'Transit Score unavailable',
      bikeScore: 0,
      bikeDescription: 'Bike Score unavailable',
      status: 'error',
      lastUpdated: new Date().toISOString()
    };
  }

  private getDefaultAmenities() {
    return {
      restaurants: [],
      shopping: [],
      entertainment: [],
      services: [],
      schools: [],
      transportation: [],
      safety: [],
      totalCount: 0
    };
  }

  private getDefaultCrimeData(): CrimeData {
    return {
      violentCrime: 0,
      propertyCrime: 0,
      totalCrime: 0,
      crimeRate: 0,
      safetyScore: 50,
      trend: 'stable' as const,
      comparedToNational: 'average' as const,
      year: new Date().getFullYear() - 1,
      dataAvailable: false
    };
  }

  private getDefaultCensusData(): CensusData {
    return {
      population: {
        total: 0,
        density: 0,
        medianAge: 0
      },
      demographics: {
        raceDistribution: {
          white: 0,
          black: 0,
          hispanic: 0,
          asian: 0,
          other: 0
        },
        ageDistribution: {
          under18: 0,
          '18-34': 0,
          '35-54': 0,
          '55-74': 0,
          over75: 0
        }
      },
      economics: {
        medianHouseholdIncome: 0,
        povertyRate: 0,
        unemploymentRate: 0,
        incomeDistribution: {
          under25k: 0,
          '25k-50k': 0,
          '50k-75k': 0,
          '75k-100k': 0,
          over100k: 0
        }
      },
      education: {
        lessThanHighSchool: 0,
        highSchoolGraduate: 0,
        someCollege: 0,
        bachelorsOrHigher: 0
      },
      housing: {
        totalUnits: 0,
        ownerOccupied: 0,
        renterOccupied: 0,
        medianHomeValue: 0,
        medianRent: 0
      },
      year: new Date().getFullYear(),
      dataAvailable: false
    };
  }

  private getDefaultMarketData(): AttomMarketData {
    return {
      medianSalePrice: 0,
      medianListPrice: 0,
      averageDaysOnMarket: 0,
      totalSales: 0,
      pricePerSquareFoot: 0,
      monthsOfSupply: 0,
      priceChangePercent: 0,
      dataAvailable: false,
      marketTrend: 'balanced' as const,
      lastUpdated: new Date().toISOString()
    };
  }

  private getDefaultComprehensiveData(): ComprehensiveNeighborhoodData {
    return {
      overview: {
        walkScore: this.getDefaultWalkScore(),
        highlights: ['No data available'],
        agentTips: ['Contact data providers for neighborhood information'],
        dataQuality: 0
      },
      places: {
        restaurants: [],
        shopping: [],
        entertainment: [],
        services: [],
        healthcare: [],
        recreation: [],
        agentTalkingPoints: []
      },
      safety: {
        crimeData: this.getDefaultCrimeData(),
        safetyServices: [],
        agentSafetyPitch: []
      },
      demographics: {
        censusData: this.getDefaultCensusData(),
        marketData: this.getDefaultMarketData(),
        targetBuyerProfiles: []
      },
      schools: {
        schools: [],
        educationalDemographics: {},
        familyAppeal: [],
        marketingAngles: []
      },
      transportation: {
        transitData: {},
        commuteOptions: [],
        transportationBenefits: []
      },
      dataAvailability: {
        overview: false,
        places: false,
        safety: false,
        demographics: false,
        schools: false,
        transportation: false
      },
      dataSources: {
        overview: 'No data',
        places: 'No data',
        safety: 'No data',
        demographics: 'No data',
        schools: 'No data',
        transportation: 'No data'
      }
    };
  }

  private isDemoAddress(address: string): boolean {
    const demoPattern = /123\s+demo\s+dr\.?.*demo.*dm\s+12345/i;
    return demoPattern.test(address.toLowerCase());
  }

  private getDemoNeighborhoodData(address: string): ComprehensiveNeighborhoodData {
    return {
      overview: {
        walkScore: {
          walkScore: 89,
          walkDescription: 'Very Walkable - Most errands can be accomplished on foot',
          transitScore: 78,
          transitDescription: 'Excellent Transit - Public transportation is convenient for most trips',
          bikeScore: 85,
          bikeDescription: 'Very Bikeable - Biking is convenient for most trips',
          status: 'success',
          updated: '2024-01-15',
          logoUrl: 'https://cdn.walk.sc/images/api-logo.png',
          moreInfoIcon: 'https://cdn.walk.sc/images/api-more-info.gif',
          moreInfoUrl: 'https://www.walkscore.com/'
        },
        highlights: [
          'Exceptional walkability (89/100) - most errands can be completed on foot',
          'Outstanding public transit access (78/100) with multiple lines nearby',
          'Vibrant dining scene with 45+ restaurants within walking distance',
          'Top-rated school district with 95% college acceptance rate',
          'Ultra-safe community with crime rates 65% below national average',
          'Affluent neighborhood with median income of $128,500',
          'Highly educated residents (82% college graduates)',
          'Strong property values with 8.2% annual appreciation',
          'Family-friendly with excellent parks and recreational facilities'
        ],
        agentTips: [
          'Emphasize the 89 Walk Score - perfect for buyers who want to reduce car dependency',
          'Highlight the school district ratings - major selling point for families with children',
          'Use the safety statistics as a key differentiator from other comparable neighborhoods'
        ],
        dataQuality: 95
      },
      places: {
        restaurants: [
          { name: 'The Grove Bistro', category: 'Fine Dining', distance: 0.2, rating: 4.8, categories: ['restaurant', 'fine_dining'] },
          { name: 'Demo Street Cafe', category: 'Coffee Shop', distance: 0.1, rating: 4.6, categories: ['cafe', 'coffee'] },
          { name: 'Sakura Sushi', category: 'Japanese', distance: 0.3, rating: 4.7, categories: ['restaurant', 'japanese'] },
          { name: 'Mario\'s Pizzeria', category: 'Italian', distance: 0.4, rating: 4.5, categories: ['restaurant', 'pizza'] },
          { name: 'The Local Tap', category: 'American Pub', distance: 0.5, rating: 4.4, categories: ['restaurant', 'pub'] },
          { name: 'Green Garden Thai', category: 'Thai', distance: 0.6, rating: 4.6, categories: ['restaurant', 'thai'] }
        ],
        shopping: [
          { name: 'Demo Plaza Shopping Center', category: 'Shopping Mall', distance: 0.4, rating: 4.3, categories: ['shopping', 'mall'] },
          { name: 'Fresh Market Grocery', category: 'Grocery Store', distance: 0.2, rating: 4.5, categories: ['grocery', 'food'] },
          { name: 'Demo Pharmacy', category: 'Pharmacy', distance: 0.1, rating: 4.4, categories: ['pharmacy', 'health'] },
          { name: 'BookWorms Literary', category: 'Bookstore', distance: 0.5, rating: 4.7, categories: ['books', 'retail'] },
          { name: 'Fashion Forward Boutique', category: 'Clothing', distance: 0.3, rating: 4.6, categories: ['clothing', 'fashion'] },
          { name: 'TechZone Electronics', category: 'Electronics', distance: 0.7, rating: 4.4, categories: ['electronics', 'technology'] }
        ],
        entertainment: [
          { name: 'Starlight Cinema', category: 'Movie Theater', distance: 0.6, rating: 4.6, categories: ['entertainment', 'cinema'] },
          { name: 'Demo Community Theater', category: 'Live Theater', distance: 0.8, rating: 4.7, categories: ['theater', 'arts'] },
          { name: 'FitLife Gym & Spa', category: 'Fitness Center', distance: 0.3, rating: 4.5, categories: ['fitness', 'wellness'] },
          { name: 'Central Park Demo', category: 'Public Park', distance: 0.2, rating: 4.8, categories: ['park', 'recreation'] },
          { name: 'Demo Bowling Alley', category: 'Bowling', distance: 1.0, rating: 4.3, categories: ['bowling', 'recreation'] },
          { name: 'Art Gallery Demo', category: 'Art Gallery', distance: 0.5, rating: 4.6, categories: ['art', 'culture'] }
        ],
        services: [
          { name: 'Demo Medical Center', category: 'Hospital', distance: 0.8, rating: 4.7, categories: ['hospital', 'healthcare'] },
          { name: 'City Bank Demo Branch', category: 'Bank', distance: 0.2, rating: 4.4, categories: ['bank', 'finance'] },
          { name: 'Demo Veterinary Clinic', category: 'Veterinarian', distance: 0.5, rating: 4.6, categories: ['veterinary', 'pets'] },
          { name: 'Quick Clean Laundromat', category: 'Laundromat', distance: 0.3, rating: 4.2, categories: ['laundry', 'services'] },
          { name: 'Demo Post Office', category: 'Post Office', distance: 0.4, rating: 4.1, categories: ['post_office', 'government'] },
          { name: 'AutoCare Demo', category: 'Auto Repair', distance: 0.6, rating: 4.3, categories: ['auto_repair', 'automotive'] }
        ],
        healthcare: [
          { name: 'Demo Family Medicine', category: 'Primary Care', distance: 0.3, rating: 4.7, categories: ['healthcare', 'primary_care'] },
          { name: 'Smile Dental Group', category: 'Dentist', distance: 0.2, rating: 4.6, categories: ['healthcare', 'dental'] },
          { name: 'Vision Plus Eyecare', category: 'Eye Doctor', distance: 0.4, rating: 4.5, categories: ['healthcare', 'optometry'] },
          { name: 'Wellness Physical Therapy', category: 'Physical Therapy', distance: 0.5, rating: 4.8, categories: ['healthcare', 'therapy'] },
          { name: 'Demo Urgent Care', category: 'Urgent Care', distance: 0.6, rating: 4.4, categories: ['healthcare', 'urgent_care'] },
          { name: 'Mindful Counseling Center', category: 'Mental Health', distance: 0.7, rating: 4.6, categories: ['healthcare', 'mental_health'] }
        ],
        recreation: [
          { name: 'Demo Tennis Club', category: 'Tennis Courts', distance: 0.4, rating: 4.7, categories: ['recreation', 'tennis'] },
          { name: 'Aquatic Center Demo', category: 'Swimming Pool', distance: 0.6, rating: 4.6, categories: ['recreation', 'swimming'] },
          { name: 'Demo Youth Soccer Fields', category: 'Soccer Fields', distance: 0.8, rating: 4.5, categories: ['recreation', 'soccer'] },
          { name: 'Riverside Walking Trail', category: 'Walking Trail', distance: 0.3, rating: 4.8, categories: ['recreation', 'walking'] },
          { name: 'Demo Community Garden', category: 'Community Garden', distance: 0.5, rating: 4.4, categories: ['recreation', 'gardening'] },
          { name: 'Playground Paradise', category: 'Playground', distance: 0.2, rating: 4.7, categories: ['recreation', 'playground'] }
        ],
        agentTalkingPoints: [
          'Within 3 blocks, residents have access to a full-service grocery store, pharmacy, and medical center',
          'The dining scene is exceptional - from casual cafes to fine dining, there are 6 top-rated options within walking distance',
          'Entertainment options include a modern cinema, live theater, art gallery, and beautiful Central Park',
          'Healthcare is comprehensive with primary care, dental, urgent care, and specialty services nearby',
          'Recreation facilities include tennis courts, swimming pool, walking trails, and community spaces',
          'All essential services are nearby: banking, post office, veterinary care, and automotive services'
        ]
      },
      safety: {
        crimeData: {
          safetyScore: 92,
          crimeRate: 8.2,
          violentCrimeRate: 1.1,
          propertyCrimeRate: 7.1,
          trend: 'Decreasing',
          comparedToNational: '65% below national average',
          comparedToState: '45% below state average',
          lastUpdated: '2024-01-15',
          dataAvailable: true,
          dataSource: 'Demo Crime Statistics Bureau'
        },
        safetyServices: [
          { name: 'Demo Police Station', category: 'Police', distance: 0.4, rating: 4.8, categories: ['police', 'safety'] },
          { name: 'Fire Department Station 7', category: 'Fire Department', distance: 0.6, rating: 4.7, categories: ['fire_department', 'emergency'] },
          { name: 'Demo Emergency Medical', category: 'EMS', distance: 0.3, rating: 4.6, categories: ['emergency_medical', 'healthcare'] },
          { name: 'Community Watch HQ', category: 'Security', distance: 0.2, rating: 4.5, categories: ['security', 'community'] },
          { name: 'Safe Haven Shelter', category: 'Emergency Shelter', distance: 0.8, rating: 4.4, categories: ['shelter', 'social_services'] }
        ],
        agentSafetyPitch: [
          'Crime rates are 65% below the national average, making this one of the safest neighborhoods in the region',
          'Excellent emergency response times with police station just 4 blocks away',
          'Active neighborhood watch program and well-lit streets create a secure environment',
          'Family-friendly community with playgrounds and parks that are safe for children',
          'Low property crime rates mean residents feel secure about their investments and belongings'
        ]
      },
      demographics: {
        censusData: {
          population: {
            total: 18750,
            medianAge: 38.5,
            ageDistribution: {
              under18: 22.8,
              age18to34: 28.3,
              age35to54: 26.9,
              age55to74: 18.2,
              over75: 3.8
            }
          },
          housing: {
            totalUnits: 7200,
            ownerOccupied: 78.5,
            renterOccupied: 21.5,
            medianHomeValue: 485000,
            medianRent: 1850
          },
          economics: {
            medianHouseholdIncome: 128500,
            unemploymentRate: 2.3,
            povertyRate: 4.1
          },
          education: {
            highSchoolGraduate: 96.7,
            bachelorsOrHigher: 82.4,
            graduateOrProfessional: 35.6
          },
          dataAvailable: true,
          lastUpdated: '2024-01-15'
        },
        marketData: {
          medianSalePrice: 525000,
          medianListPrice: 535000,
          averageDaysOnMarket: 18,
          totalSales: 145,
          pricePerSquareFoot: 245,
          monthsOfSupply: 1.8,
          priceChangePercent: 8.2,
          dataAvailable: true,
          marketTrend: 'strong_sellers' as const,
          lastUpdated: '2024-01-15'
        },
        targetBuyerProfiles: [
          'Young professionals (28-35) attracted to walkability and transit access',
          'Growing families seeking top-rated schools and safe neighborhood environment',
          'Empty nesters wanting to downsize without sacrificing amenities and culture',
          'Tech workers and entrepreneurs drawn to the educated community and coffee culture',
          'Investors looking for strong appreciation potential in a stable, desirable area'
        ]
      },
      schools: {
        schools: [
          { name: 'Demo Elementary School', category: 'Elementary School', distance: 0.3, rating: 9.2, categories: ['school', 'elementary'] },
          { name: 'Central Demo Middle School', category: 'Middle School', distance: 0.6, rating: 9.0, categories: ['school', 'middle'] },
          { name: 'Demo High School', category: 'High School', distance: 0.8, rating: 9.4, categories: ['school', 'high'] },
          { name: 'Little Learners Preschool', category: 'Preschool', distance: 0.2, rating: 8.8, categories: ['school', 'preschool'] },
          { name: 'Demo Montessori Academy', category: 'Private School', distance: 0.5, rating: 9.1, categories: ['school', 'private'] },
          { name: 'STEM Innovation Charter', category: 'Charter School', distance: 0.9, rating: 9.3, categories: ['school', 'charter'] },
          { name: 'Demo University Campus', category: 'University', distance: 1.2, rating: 8.9, categories: ['university', 'higher_education'] },
          { name: 'Community College Demo', category: 'Community College', distance: 1.0, rating: 8.6, categories: ['college', 'education'] }
        ],
        educationalDemographics: {
          collegeEducated: 82.4,
          medianAge: 38.5
        },
        familyAppeal: [
          'Top-rated school district with 95% of graduates attending 4-year colleges',
          'All schools within walking or short biking distance from the neighborhood',
          'Strong STEM programs and innovative teaching methods across all grade levels',
          'Active parent-teacher organizations and community involvement in education',
          'Before and after school programs available for working parents',
          'Multiple educational options including public, private, and charter schools'
        ],
        marketingAngles: [
          'School district rated in top 5% statewide - a key factor for resale value',
          'Walking distance to elementary school means no bus rides for young children',
          'University nearby provides cultural enrichment and potential rental income',
          'High achieving schools create a competitive academic environment',
          'Community values education - evident in school funding and support programs'
        ]
      },
      transportation: {
        transitData: {
          transitScore: 78,
          transitDescription: 'Excellent Transit - Public transportation is convenient for most trips'
        },
        commuteOptions: [
          { name: 'Metro Blue Line Station', category: 'Subway Station', distance: 0.4, rating: 4.6, categories: ['transit', 'subway'] },
          { name: 'Demo Bus Terminal', category: 'Bus Station', distance: 0.2, rating: 4.4, categories: ['transit', 'bus'] },
          { name: 'City Bike Share Hub', category: 'Bike Share', distance: 0.1, rating: 4.5, categories: ['bike_share', 'transportation'] },
          { name: 'Demo Taxi Stand', category: 'Taxi', distance: 0.3, rating: 4.2, categories: ['taxi', 'transportation'] },
          { name: 'Car2Go Station', category: 'Car Share', distance: 0.2, rating: 4.3, categories: ['car_share', 'transportation'] },
          { name: 'Demo Ferry Terminal', category: 'Ferry', distance: 1.5, rating: 4.7, categories: ['ferry', 'water_transport'] },
          { name: 'Express Bus Stop', category: 'Express Bus', distance: 0.3, rating: 4.5, categories: ['bus', 'express_transit'] },
          { name: 'Park & Ride Lot', category: 'Parking', distance: 0.8, rating: 4.1, categories: ['parking', 'commuter'] }
        ],
        transportationBenefits: [
          'Multiple transit options reduce dependency on personal vehicles',
          '15-minute commute to downtown via Metro Blue Line',
          'Extensive bike lane network makes cycling safe and convenient',
          'Ride-sharing and car-sharing options provide flexibility without car ownership',
          'Ferry service offers scenic commute option to waterfront business district',
          'Express bus routes connect directly to airport and major employment centers',
          'Well-maintained sidewalks and crosswalks ensure pedestrian safety'
        ]
      },
      dataAvailability: {
        overview: true,
        places: true,
        safety: true,
        demographics: true,
        schools: true,
        transportation: true
      },
      dataSources: {
        overview: 'Demo WalkScore API, Demo Places API',
        places: 'Demo Places Directory',
        safety: 'Demo Crime Statistics Bureau',
        demographics: 'Demo Census Bureau, Demo Market Research',
        schools: 'Demo Education Department',
        transportation: 'Demo Transit Authority'
      }
    };
  }
}

export const neighborhoodDataService = new NeighborhoodDataService(); 