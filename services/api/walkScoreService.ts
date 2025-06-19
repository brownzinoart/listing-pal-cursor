// WalkScore API Service
const WALKSCORE_API_KEY = '5139d659545c4f1a58d0c003fa2f1cb0';
const BASE_URL = 'https://api.walkscore.com/score';

export interface WalkScoreResponse {
  status: number;
  walkscore: number;
  description: string;
  updated: string;
  logo_url: string;
  more_info_icon: string;
  more_info_link: string;
  ws_link: string;
  help_link: string;
  snapped_lat: number;
  snapped_lon: number;
  transit?: {
    score: number;
    description: string;
    summary: string;
  };
  bike?: {
    score: number;
    description: string;
  };
}

export interface WalkScoreData {
  walkScore: number;
  walkDescription: string;
  transitScore: number;
  transitDescription: string;
  bikeScore: number;
  bikeDescription: string;
  status: 'success' | 'error' | 'calculating';
  lastUpdated: string;
}

export class WalkScoreService {
  async getWalkScore(lat: number, lng: number, address: string): Promise<WalkScoreData> {
    try {
      // Use our server proxy to avoid CORS issues
      const url = `/api/walkscore?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}&transit=1&bike=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WalkScore API error: ${response.status}`);
      }
      
      const data: WalkScoreResponse = await response.json();
      
      // Handle different status codes
      if (data.status === 1) {
        return {
          walkScore: data.walkscore || 0,
          walkDescription: data.description || 'Score not available',
          transitScore: data.transit?.score || 0,
          transitDescription: data.transit?.description || 'Transit score not available',
          bikeScore: data.bike?.score || 0,
          bikeDescription: data.bike?.description || 'Bike score not available',
          status: 'success',
          lastUpdated: data.updated
        };
      } else if (data.status === 2) {
        return {
          walkScore: 0,
          walkDescription: 'Score is being calculated',
          transitScore: 0,
          transitDescription: 'Transit score is being calculated',
          bikeScore: 0,
          bikeDescription: 'Bike score is being calculated',
          status: 'calculating',
          lastUpdated: new Date().toISOString()
        };
      } else {
        throw new Error(`WalkScore API returned status: ${data.status}`);
      }
    } catch (error) {
      console.error('WalkScore API request failed:', error);
      
      // Return default values if API fails
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
  }

  getWalkabilityLabel(score: number): string {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    if (score >= 25) return "Car-Dependent";
    return "Car-Dependent";
  }

  getTransitLabel(score: number): string {
    if (score >= 90) return "Excellent Transit";
    if (score >= 70) return "Good Transit";
    if (score >= 50) return "Some Transit";
    if (score >= 25) return "Minimal Transit";
    return "Minimal Transit";
  }

  getBikeLabel(score: number): string {
    if (score >= 90) return "Biker's Paradise";
    if (score >= 70) return "Very Bikeable";
    if (score >= 50) return "Bikeable";
    if (score >= 25) return "Somewhat Bikeable";
    return "Not Bikeable";
  }
}

export const walkScoreService = new WalkScoreService(); 