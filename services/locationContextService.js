// Mock external APIs for the Node.js server
class CensusAPI {
  async getDemographics(lat, lng) {
    // Mock demographics data
    return {
      population: { total: 45678 },
      economics: {
        medianHouseholdIncome: 85000,
        incomeLevel: 'upper-middle'
      },
      education: { collegeEducatedPercent: 78 },
      housing: { ownerOccupiedPercent: 62 },
      safety: {
        safetyRating: 8,
        crimeIndex: 25,
        violentCrimeRate: 2.1,
        propertyCrimeRate: 15.3
      }
    };
  }
}

class WalkScoreAPI {
  async getWalkScore(lat, lng, address) {
    return {
      walkScore: 89,
      transitScore: 75,
      bikeScore: 82,
      description: 'Very Walkable - Most errands can be accomplished on foot'
    };
  }
}

class GooglePlacesAPI {
  async getAllNearbyAmenities(lat, lng) {
    return {
      restaurants: [
        { name: 'The Corner Bistro', distance: 0.2, rating: 4.5 },
        { name: 'Starbucks', distance: 0.1, rating: 4.2 },
        { name: 'Mario\'s Pizza', distance: 0.3, rating: 4.7 },
        { name: 'Green Leaf Salads', distance: 0.4, rating: 4.1 }
      ],
      shopping: [
        { name: 'Whole Foods Market', distance: 0.5, rating: 4.3 },
        { name: 'CVS Pharmacy', distance: 0.2, rating: 3.9 },
        { name: 'Target', distance: 0.8, rating: 4.1 }
      ],
      parks: [
        { name: 'Central Park', distance: 0.3, acres: 843 },
        { name: 'Riverside Park', distance: 0.7, acres: 330 },
        { name: 'Bryant Park', distance: 0.9, acres: 9 }
      ],
      transit: [
        { name: '86th St Station', distance: 0.2, walkTime: 3 },
        { name: 'Lexington Ave/86 St', distance: 0.3, walkTime: 4 },
        { name: 'Bus Stop M86', distance: 0.1, walkTime: 1 }
      ]
    };
  }
}

class EducationAPI {
  async getAllNearbySchools(lat, lng) {
    return [
      { name: 'PS 6 Lillie Devereaux Blake', distance: 0.4, rating: 9 },
      { name: 'Hunter College High School', distance: 0.8, rating: 10 },
      { name: 'The Brearley School', distance: 0.6, rating: 9 },
      { name: 'Marymount School', distance: 0.5, rating: 8 },
      { name: 'Trinity School', distance: 1.2, rating: 10 }
    ];
  }
}

class WeatherAPI {
  async getClimateData(lat, lng) {
    return {
      climateDescription: 'Four-season climate with mild summers and cool winters',
      sunshine: { annualDays: 234 },
      averageTemp: { summer: 77, winter: 40 },
      airQuality: { rating: 'Good', aqi: 45 }
    };
  }
}

export class LocationContextService {
  constructor() {
    this.censusAPI = new CensusAPI();
    this.walkScoreAPI = new WalkScoreAPI();
    this.googlePlacesAPI = new GooglePlacesAPI();
    this.educationAPI = new EducationAPI();
    this.weatherAPI = new WeatherAPI();
  }
  
  async getAllLocationContext(address) {
    try {
      // 1. Geocode address
      const coordinates = await this.geocodeAddress(address);
      
      // 2. Fetch ALL data in parallel
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
      ].filter(Boolean);
      
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
  
  async geocodeAddress(address) {
    // Mock geocoding - in production would use Google Geocoding API
    return { lat: 47.6062, lng: -122.3321 };
  }
  
  categorizeCards(cards) {
    return {
      location: cards.filter(c => ['walkability', 'climate'].includes(c.id)),
      community: cards.filter(c => ['demographics', 'safety'].includes(c.id)),
      amenities: cards.filter(c => ['restaurants', 'shopping', 'parks', 'recreation'].includes(c.id)),
      education: cards.filter(c => ['schools', 'libraries'].includes(c.id)),
      transportation: cards.filter(c => ['transit', 'commute'].includes(c.id))
    };
  }
  
  buildWalkabilityCard(data) {
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
  
  buildDemographicsCard(data) {
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
  
  buildSchoolsCard(schools) {
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
  
  buildRestaurantsCard(restaurants) {
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
  
  buildShoppingCard(shopping) {
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
  
  buildParksCard(parks) {
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
  
  buildTransitCard(transit) {
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
  
  buildSafetyCard(safetyData) {
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
  
  buildClimateCard(climateData) {
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