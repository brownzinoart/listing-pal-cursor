// FBI Crime Data API Service
const FBI_API_KEY = "mWhmAmBRTq8kspJNw6UvEhUzPHnOAnlQuygN8lnc";
const BASE_URL = "https://api.usa.gov/crime/fbi/cde";

export interface CrimeData {
  violentCrime: number;
  propertyCrime: number;
  totalCrime: number;
  crimeRate: number;
  safetyScore: number; // 0-100, higher is safer
  trend: "improving" | "stable" | "worsening";
  comparedToNational: "better" | "average" | "worse";
  year: number;
  dataAvailable: boolean;
}

export interface AgencyCrimeData {
  ori: string;
  agency_name: string;
  state_abbr: string;
  population: number;
  violent_crime: number;
  homicide: number;
  rape: number;
  robbery: number;
  aggravated_assault: number;
  property_crime: number;
  burglary: number;
  larceny: number;
  motor_vehicle_theft: number;
  arson: number;
  data_year: number;
}

export class FBICrimeService {
  private async makeRequest(endpoint: string): Promise<any> {
    try {
      // Use our server proxy to avoid CORS issues
      const url = `/api/crime/fbi${endpoint}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`FBI Crime API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("FBI Crime API request failed:", error);
      throw error;
    }
  }

  async getCrimeDataByState(
    stateAbbr: string,
    year: number = 2022,
  ): Promise<CrimeData> {
    try {
      // Use a simpler endpoint that's more likely to work
      const endpoint = `/estimates/national/${year}`;
      const data = await this.makeRequest(endpoint);

      if (!data || !data.results || data.results.length === 0) {
        console.log("No FBI Crime data available, returning default data");
        return this.getDefaultCrimeData();
      }

      const nationalData = data.results[0];
      const population = nationalData.population || 1;
      const violentCrime = nationalData.violent_crime || 0;
      const propertyCrime = nationalData.property_crime || 0;
      const totalCrime = violentCrime + propertyCrime;
      const crimeRate = (totalCrime / population) * 100000; // Per 100k people

      // Calculate safety score (higher is safer)
      const safetyScore = Math.max(0, Math.min(100, 100 - crimeRate / 50)); // Normalize crime rate to safety score

      return {
        violentCrime,
        propertyCrime,
        totalCrime,
        crimeRate: Math.round(crimeRate),
        safetyScore: Math.round(safetyScore),
        trend: this.calculateTrend(crimeRate),
        comparedToNational: this.compareToNational(crimeRate),
        year,
        dataAvailable: true,
      };
    } catch (error) {
      console.error("Error fetching state crime data:", error);
      return this.getDefaultCrimeData();
    }
  }

  async getCrimeDataByAgency(
    ori: string,
    year: number = 2022,
  ): Promise<AgencyCrimeData | null> {
    try {
      // Use a simpler agency endpoint
      const endpoint = `/agencies/count/${ori}/${year}`;
      const data = await this.makeRequest(endpoint);

      if (!data || !data.results || data.results.length === 0) {
        return null;
      }

      return data.results[0];
    } catch (error) {
      console.error("Error fetching agency crime data:", error);
      return null;
    }
  }

  async getNearbyAgencies(stateAbbr: string): Promise<string[]> {
    try {
      // Simplified agencies endpoint
      const endpoint = `/agencies`;
      const data = await this.makeRequest(endpoint);

      if (!data || !data.results) {
        return [];
      }

      // Filter by state and limit results
      const stateAgencies = data.results
        .filter((agency: any) => agency.state_abbr === stateAbbr)
        .map((agency: any) => agency.ori)
        .slice(0, 10);

      return stateAgencies;
    } catch (error) {
      console.error("Error fetching nearby agencies:", error);
      return [];
    }
  }

  private calculateTrend(
    crimeRate: number,
  ): "improving" | "stable" | "worsening" {
    // Simple heuristic - in a real implementation, you'd compare with previous years
    if (crimeRate < 2000) return "improving";
    if (crimeRate < 3500) return "stable";
    return "worsening";
  }

  private compareToNational(crimeRate: number): "better" | "average" | "worse" {
    // US national average is approximately 2580 per 100k (as of recent data)
    const nationalAverage = 2580;

    if (crimeRate < nationalAverage * 0.8) return "better";
    if (crimeRate < nationalAverage * 1.2) return "average";
    return "worse";
  }

  private getDefaultCrimeData(): CrimeData {
    return {
      violentCrime: 0,
      propertyCrime: 0,
      totalCrime: 0,
      crimeRate: 0,
      safetyScore: 50, // Neutral score when no data
      trend: "stable",
      comparedToNational: "average",
      year: new Date().getFullYear() - 1,
      dataAvailable: false,
    };
  }

  getSafetyLabel(score: number): string {
    if (score >= 80) return "Very Safe";
    if (score >= 60) return "Generally Safe";
    if (score >= 40) return "Moderately Safe";
    if (score >= 20) return "Use Caution";
    return "High Crime Area";
  }

  getCrimeRateLabel(rate: number): string {
    if (rate < 1500) return "Very Low Crime";
    if (rate < 2500) return "Low Crime";
    if (rate < 3500) return "Moderate Crime";
    if (rate < 5000) return "High Crime";
    return "Very High Crime";
  }
}

export const fbiCrimeService = new FBICrimeService();
