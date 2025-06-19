// Geoapify Places API Service
const GEOAPIFY_API_KEY = "11c892c511b94bbea562a1a768df5af9";
const BASE_URL = "https://api.geoapify.com/v2/places";

export interface GeoapifyPlace {
  name: string;
  formatted: string;
  categories: string[];
  lat: number;
  lon: number;
  distance?: number;
  address_line1?: string;
  address_line2?: string;
  place_id: string;
}

export interface GeoapifyResponse {
  features: Array<{
    properties: GeoapifyPlace;
    geometry: {
      coordinates: [number, number];
    };
  }>;
}

export class GeoapifyService {
  private async makeRequest(url: string): Promise<GeoapifyResponse> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Geoapify API request failed:", error);
      throw error;
    }
  }

  async getNearbyPlaces(
    lat: number,
    lng: number,
    categories: string[],
    radius: number = 2000,
  ): Promise<GeoapifyPlace[]> {
    const categoriesParam = categories.join(",");
    // Use our server proxy to avoid CORS issues
    const url = `/api/geoapify/places?categories=${categoriesParam}&filter=circle:${lng},${lat},${radius}&limit=50`;

    const response = await this.makeRequest(url);

    return response.features.map((feature) => ({
      ...feature.properties,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }));
  }

  async getRestaurants(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "catering.restaurant",
      "catering.fast_food",
      "catering.cafe",
    ]);
  }

  async getShopping(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "commercial.supermarket",
      "commercial.shopping_mall",
      "commercial.convenience",
    ]);
  }

  async getEntertainment(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "entertainment.cinema",
      "entertainment.museum",
      "leisure.park",
      "entertainment.theme_park",
    ]);
  }

  async getEssentialServices(
    lat: number,
    lng: number,
  ): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "service",
      "commercial.health_and_beauty.pharmacy",
      "healthcare",
    ]);
  }

  async getSchools(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "education.school",
      "education.college",
      "education.university",
      "childcare.kindergarten",
    ]);
  }

  async getTransportation(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, ["public_transport", "parking"]);
  }

  async getSafetyServices(lat: number, lng: number): Promise<GeoapifyPlace[]> {
    return this.getNearbyPlaces(lat, lng, [
      "emergency",
      "healthcare.hospital",
      "service",
    ]);
  }

  async getAllAmenities(lat: number, lng: number) {
    try {
      const [
        restaurants,
        shopping,
        entertainment,
        services,
        schools,
        transportation,
        safety,
      ] = await Promise.all([
        this.getRestaurants(lat, lng),
        this.getShopping(lat, lng),
        this.getEntertainment(lat, lng),
        this.getEssentialServices(lat, lng),
        this.getSchools(lat, lng),
        this.getTransportation(lat, lng),
        this.getSafetyServices(lat, lng),
      ]);

      return {
        restaurants,
        shopping,
        entertainment,
        services,
        schools,
        transportation,
        safety,
        totalCount:
          restaurants.length +
          shopping.length +
          entertainment.length +
          services.length,
      };
    } catch (error) {
      console.error("Error fetching all amenities from Geoapify:", error);
      return {
        restaurants: [],
        shopping: [],
        entertainment: [],
        services: [],
        schools: [],
        transportation: [],
        safety: [],
        totalCount: 0,
      };
    }
  }
}

export const geoapifyService = new GeoapifyService();
