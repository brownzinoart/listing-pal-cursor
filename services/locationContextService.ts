import { ContextCard, LocationContextData } from '../types/locationContext.js';
import { CensusAPI, WalkScoreAPI, GooglePlacesAPI, EducationAPI, WeatherAPI } from './api/externalAPIs.js';

export class LocationContextService {
  private censusAPI = new CensusAPI();
  private walkScoreAPI = new WalkScoreAPI();
  private googlePlacesAPI = new GooglePlacesAPI();
  private educationAPI = new EducationAPI();
  private weatherAPI = new WeatherAPI();
  
  async getAllLocationContext(address: string): Promise<LocationContextData> {
    try {
      // 1. Geocode address
      const coordinates = await this.geocodeAddress(address);
      
      // 2. Fetch ALL data in parallel - no filtering
      const [
        walkScoreData,
        demographicsData,
        amenitiesData,
        schoolsData,
        climateData
      ] = await Promise.all([
        this.walkScoreAPI.getWalkScore(coordinates.lat, coordinates.lng, address),
        this.censusAPI.getDemographics(coordinates.lat, coordinates.lng),
        this.googlePlacesAPI.getAllNearbyAmenities(coordinates.lat, coordinates.lng),
        this.educationAPI.getAllNearbySchools(coordinates.lat, coordinates.lng),
        this.weatherAPI.getClimateData(coordinates.lat, coordinates.lng)
      ]);
      
      // 3. Build ALL context cards
      const allCards = [
        this.buildWalkabilityCard(walkScoreData),
        this.buildDemographicsCard(demographicsData),
        this.buildSchoolsCard(schoolsData),
        this.buildRestaurantsCard(amenitiesData.restaurants),
        this.buildShoppingCard(amenitiesData.shopping),
        this.buildParksCard(amenitiesData.parks),
        this.buildTransitCard(amenitiesData.transit),
        this.buildSafetyCard(demographicsData.safety),
        this.buildClimateCard(climateData)
      ].filter(Boolean); // Remove any that failed
      
      // 4. Categorize for organized display
      const categorizedCards = this.categorizeCards(allCards);
      
      return {
        address,
        coordinates,
        cards: allCards,
        categorizedCards
      };
    } catch (error) {
      console.error('Error fetching location context:', error);
      throw error;
    }
  }
  
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    // Mock geocoding - in production would use Google Geocoding API
    // Return mock coordinates for demo
    return { lat: 47.6062, lng: -122.3321 };
  }
  
  private categorizeCards(cards: ContextCard[]): LocationContextData['categorizedCards'] {
    return {
      location: cards.filter(c => ['walkability', 'climate'].includes(c.id)),
      community: cards.filter(c => ['demographics', 'safety'].includes(c.id)),
      amenities: cards.filter(c => ['restaurants', 'shopping', 'parks', 'recreation'].includes(c.id)),
      education: cards.filter(c => ['schools', 'libraries'].includes(c.id)),
      transportation: cards.filter(c => ['transit', 'commute'].includes(c.id))
    };
  }
  
  // Individual card builders - no smart logic, just data transformation
  private buildWalkabilityCard(data: any): ContextCard {
    return {
      id: 'walkability',
      title: 'Walkability',
      icon: '🚶‍♀️',
      category: 'location',
      preview: {
        score: data.walkScore,
        headline: data.description,
        quickStat: `${data.walkScore}/100`,
        bullets: [
          `Walk Score: ${data.walkScore}/100`,
          data.transitScore ? `Transit Score: ${data.transitScore}/100` : '',
          data.bikeScore ? `Bike Score: ${data.bikeScore}/100` : '',
          'Daily errands can be accomplished on foot'
        ].filter(Boolean)
      },
      marketingCopy: `Excellent walkability with a Walk Score of ${data.walkScore}/100. ${data.description}`,
      fullData: data
    };
  }
  
  private buildDemographicsCard(data: any): ContextCard {
    return {
      id: 'demographics',
      title: 'Demographics & Income',
      icon: '👥',
      category: 'community',
      preview: {
        headline: `${data.economics.incomeLevel.replace('-', ' ')} income neighborhood`,
        quickStat: `$${Math.round(data.economics.medianHouseholdIncome / 1000)}k`,
        bullets: [
          `Median household income: $${data.economics.medianHouseholdIncome.toLocaleString()}`,
          `${data.education.collegeEducatedPercent}% college educated`,
          `${data.housing.ownerOccupiedPercent}% homeowners`,
          `Population: ${data.population.total.toLocaleString()}`
        ]
      },
      marketingCopy: `Located in a ${data.economics.incomeLevel.replace('-', ' ')} neighborhood with a median household income of $${data.economics.medianHouseholdIncome.toLocaleString()}. ${data.education.collegeEducatedPercent}% of residents are college educated.`,
      fullData: data
    };
  }
  
  private buildSchoolsCard(schools: any[]): ContextCard {
    const topSchools = schools.slice(0, 5);
    return {
      id: 'schools',
      title: 'Schools',
      icon: '🎓',
      category: 'education',
      preview: {
        headline: `${schools.length} schools within 5 miles`,
        quickStat: `${schools.length} schools`,
        bullets: topSchools.map(school => 
          `${school.name} (${school.distance} mi)${school.rating ? ` - Rating: ${school.rating}/10` : ''}`
        )
      },
      marketingCopy: `Excellent educational opportunities with ${schools.length} schools nearby, including top-rated ${topSchools[0]?.name}.`,
      fullData: schools
    };
  }
  
  private buildRestaurantsCard(restaurants: any[]): ContextCard {
    return {
      id: 'restaurants',
      title: 'Dining',
      icon: '🍽️',
      category: 'amenities',
      preview: {
        headline: `${restaurants.length} restaurants within walking distance`,
        quickStat: `${restaurants.length} spots`,
        bullets: restaurants.slice(0, 4).map(r => 
          `${r.name} (${r.distance} mi)${r.rating ? ` - ${r.rating}⭐` : ''}`
        )
      },
      marketingCopy: `Vibrant dining scene with ${restaurants.length} restaurants nearby, from casual cafes to fine dining.`,
      fullData: restaurants
    };
  }
  
  private buildShoppingCard(shopping: any[]): ContextCard {
    return {
      id: 'shopping',
      title: 'Shopping',
      icon: '🛍️',
      category: 'amenities',
      preview: {
        headline: `${shopping.length} shopping destinations nearby`,
        quickStat: `${shopping.length} stores`,
        bullets: shopping.slice(0, 3).map(s => 
          `${s.name} (${s.distance} mi)${s.rating ? ` - ${s.rating}⭐` : ''}`
        )
      },
      marketingCopy: `Convenient shopping with ${shopping.length} destinations including major retailers and specialty stores.`,
      fullData: shopping
    };
  }
  
  private buildParksCard(parks: any[]): ContextCard {
    return {
      id: 'parks',
      title: 'Parks & Recreation',
      icon: '🌳',
      category: 'amenities',
      preview: {
        headline: `${parks.length} parks and recreational areas`,
        quickStat: `${parks.length} parks`,
        bullets: parks.slice(0, 3).map(p => 
          `${p.name} (${p.distance} mi)${p.acres ? ` - ${p.acres} acres` : ''}`
        )
      },
      marketingCopy: `Great outdoor access with ${parks.length} parks and recreational facilities for active lifestyles.`,
      fullData: parks
    };
  }
  
  private buildTransitCard(transit: any[]): ContextCard {
    return {
      id: 'transit',
      title: 'Public Transportation',
      icon: '🚇',
      category: 'transportation',
      preview: {
        headline: `${transit.length} transit options nearby`,
        quickStat: `${transit.length} stops`,
        bullets: transit.slice(0, 3).map(t => 
          `${t.name} (${t.distance} mi)${t.walkTime ? ` - ${t.walkTime} min walk` : ''}`
        )
      },
      marketingCopy: `Excellent transit connectivity with ${transit.length} nearby options for easy commuting.`,
      fullData: transit
    };
  }
  
  private buildSafetyCard(safetyData: any): ContextCard {
    return {
      id: 'safety',
      title: 'Safety & Crime',
      icon: '🛡️',
      category: 'community',
      preview: {
        score: safetyData.safetyRating,
        headline: `Safety rating: ${safetyData.safetyRating}/10`,
        quickStat: `${safetyData.safetyRating}/10`,
        bullets: [
          `Crime index: ${safetyData.crimeIndex}/100 (lower is better)`,
          `Violent crime rate: ${safetyData.violentCrimeRate} per 1,000`,
          `Property crime rate: ${safetyData.propertyCrimeRate} per 1,000`,
          'Well-lit streets and active community watch'
        ]
      },
      marketingCopy: `Safe neighborhood with a ${safetyData.safetyRating}/10 safety rating and low crime rates.`,
      fullData: safetyData
    };
  }
  
  private buildClimateCard(climateData: any): ContextCard {
    return {
      id: 'climate',
      title: 'Climate & Weather',
      icon: '🌤️',
      category: 'location',
      preview: {
        headline: climateData.climateDescription,
        quickStat: `${climateData.sunshine.annualDays} sunny days`,
        bullets: [
          `${climateData.sunshine.annualDays} sunny days per year`,
          `Average summer temp: ${climateData.averageTemp.summer}°F`,
          `Average winter temp: ${climateData.averageTemp.winter}°F`,
          `Air quality: ${climateData.airQuality.rating} (AQI: ${climateData.airQuality.aqi})`
        ]
      },
      marketingCopy: `${climateData.climateDescription} with ${climateData.sunshine.annualDays} sunny days annually and ${climateData.airQuality.rating.toLowerCase()} air quality.`,
      fullData: climateData
    };
  }
} 