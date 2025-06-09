// Mock external API classes - these would connect to real services in production

export class CensusAPI {
  async getDemographics(lat: number, lng: number) {
    // Mock data - would call actual Census API
    return {
      population: {
        total: 45670,
        density: 2340,
        ageDistribution: {
          under18: 22,
          '18-34': 28,
          '35-54': 31,
          over55: 19
        }
      },
      economics: {
        medianHouseholdIncome: 87650,
        incomeLevel: 'upper-middle',
        unemploymentRate: 3.2,
        povertyRate: 8.1
      },
      education: {
        collegeEducatedPercent: 72,
        highSchoolGradPercent: 94,
        graduateDegreePercent: 38
      },
      housing: {
        ownerOccupiedPercent: 68,
        renterOccupiedPercent: 32,
        medianHomeValue: 650000,
        medianRent: 2100
      },
      safety: {
        crimeIndex: 23, // Lower is better, out of 100
        violentCrimeRate: 1.2,
        propertyCrimeRate: 15.8,
        safetyRating: 8.2
      }
    };
  }
}

export class WalkScoreAPI {
  async getWalkScore(lat: number, lng: number, address: string) {
    // Mock data - would call actual Walk Score API
    return {
      walkScore: 89,
      transitScore: 95,
      bikeScore: 78,
      description: "Very Walkable - Most errands can be accomplished on foot",
      transitDescription: "Excellent Transit - Public transportation is convenient for most trips",
      bikeDescription: "Very Bikeable - Biking is convenient for most trips",
      nearbyAmenities: ['restaurants', 'grocery', 'pharmacy', 'coffee'],
      walkingRoutes: [
        { destination: 'Whole Foods', walkTime: 8, distance: 0.4 },
        { destination: 'Metro Station', walkTime: 6, distance: 0.3 },
        { destination: 'Starbucks', walkTime: 3, distance: 0.1 }
      ]
    };
  }
}

export class GooglePlacesAPI {
  async getAllNearbyAmenities(lat: number, lng: number) {
    // Mock data - would call actual Google Places API
    return {
      restaurants: [
        {
          name: 'The Garden Bistro',
          rating: 4.6,
          priceLevel: 3,
          distance: 0.2,
          cuisine: 'Mediterranean',
          address: '123 Main St'
        },
        {
          name: 'Corner Cafe',
          rating: 4.3,
          priceLevel: 2,
          distance: 0.1,
          cuisine: 'American',
          address: '456 Oak Ave'
        },
        {
          name: 'Sushi Zen',
          rating: 4.8,
          priceLevel: 4,
          distance: 0.3,
          cuisine: 'Japanese',
          address: '789 Pine St'
        },
        {
          name: 'Pizza Corner',
          rating: 4.2,
          priceLevel: 2,
          distance: 0.2,
          cuisine: 'Italian',
          address: '321 Elm St'
        }
      ],
      shopping: [
        {
          name: 'Downtown Shopping Center',
          type: 'mall',
          distance: 0.5,
          rating: 4.1,
          stores: 45
        },
        {
          name: 'Target',
          type: 'department_store',
          distance: 0.8,
          rating: 4.0,
          hours: '8AM-10PM'
        },
        {
          name: 'Whole Foods Market',
          type: 'grocery_store',
          distance: 0.4,
          rating: 4.4,
          organic: true
        }
      ],
      parks: [
        {
          name: 'Central Park',
          type: 'park',
          distance: 0.3,
          acres: 15,
          amenities: ['playground', 'tennis_court', 'walking_trail']
        },
        {
          name: 'Riverside Trail',
          type: 'trail',
          distance: 0.6,
          length: 3.2,
          difficulty: 'easy'
        }
      ],
      transit: [
        {
          name: 'Metro Blue Line - Downtown Station',
          type: 'subway',
          distance: 0.3,
          walkTime: 4,
          lines: ['Blue', 'Red']
        },
        {
          name: 'Bus Stop - Main & 5th',
          type: 'bus',
          distance: 0.1,
          walkTime: 1,
          routes: ['22', '45', '67']
        }
      ]
    };
  }
}

export class EducationAPI {
  async getAllNearbySchools(lat: number, lng: number) {
    // Mock data - would call actual education data API
    return [
      {
        name: 'Maplewood Elementary',
        type: 'elementary',
        rating: 9,
        distance: 0.3,
        enrollment: 425,
        studentTeacherRatio: 18,
        grades: 'K-5',
        publicPrivate: 'public'
      },
      {
        name: 'Lincoln Middle School',
        type: 'middle',
        rating: 8,
        distance: 0.8,
        enrollment: 650,
        studentTeacherRatio: 22,
        grades: '6-8',
        publicPrivate: 'public'
      },
      {
        name: 'Washington High School',
        type: 'high',
        rating: 9,
        distance: 1.2,
        enrollment: 1200,
        studentTeacherRatio: 24,
        grades: '9-12',
        publicPrivate: 'public',
        apCourses: 28,
        collegeReadiness: 89
      },
      {
        name: 'St. Mary\'s Academy',
        type: 'private',
        rating: 9,
        distance: 0.9,
        enrollment: 300,
        studentTeacherRatio: 12,
        grades: 'K-12',
        publicPrivate: 'private',
        tuition: 15000
      },
      {
        name: 'Central Library',
        type: 'library',
        distance: 0.4,
        hours: 'Mon-Sat 9AM-8PM',
        programs: ['story_time', 'computer_classes', 'study_rooms']
      }
    ];
  }
}

export class WeatherAPI {
  async getClimateData(lat: number, lng: number) {
    // Mock data - would call actual weather API
    return {
      averageTemp: {
        summer: 78,
        winter: 45,
        spring: 62,
        fall: 55
      },
      rainfall: {
        annual: 42,
        wetMonths: ['Nov', 'Dec', 'Jan', 'Feb'],
        dryMonths: ['Jul', 'Aug', 'Sep']
      },
      sunshine: {
        annualDays: 230,
        averageDaily: 6.3
      },
      humidity: {
        summer: 65,
        winter: 72
      },
      climateDescription: 'Mild, temperate climate with warm, dry summers and cool, wet winters',
      airQuality: {
        aqi: 42,
        rating: 'Good',
        pollutants: ['PM2.5', 'Ozone']
      }
    };
  }
} 