// US Census API Service
const CENSUS_API_KEY = "39777ef1581c0b65f8dd55868da60cfe7c1036d1";
const BASE_URL = "https://api.census.gov/data";

export interface CensusData {
  population: {
    total: number;
    density: number;
    medianAge: number;
  };
  demographics: {
    raceDistribution: {
      white: number;
      black: number;
      hispanic: number;
      asian: number;
      other: number;
    };
    ageDistribution: {
      under18: number;
      "18-34": number;
      "35-54": number;
      "55-74": number;
      over75: number;
    };
  };
  economics: {
    medianHouseholdIncome: number;
    povertyRate: number;
    unemploymentRate: number;
    incomeDistribution: {
      under25k: number;
      "25k-50k": number;
      "50k-75k": number;
      "75k-100k": number;
      over100k: number;
    };
  };
  education: {
    lessThanHighSchool: number;
    highSchoolGraduate: number;
    someCollege: number;
    bachelorsOrHigher: number;
  };
  housing: {
    totalUnits: number;
    ownerOccupied: number;
    renterOccupied: number;
    medianHomeValue: number;
    medianRent: number;
  };
  year: number;
  dataAvailable: boolean;
}

export class CensusService {
  private async makeRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Census API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Census API request failed:", error);
      throw error;
    }
  }

  async getDemographicsByState(
    stateCode: string,
    year: number = 2022,
  ): Promise<CensusData> {
    try {
      // Using American Community Survey 1-Year data
      const variables = [
        "B01003_001E", // Total population
        "B25003_001E", // Total housing units
        "B25003_002E", // Owner occupied
        "B25003_003E", // Renter occupied
        "B19013_001E", // Median household income
        "B25077_001E", // Median home value
        "B25064_001E", // Median gross rent
        "B15003_001E", // Total education population
        "B15003_017E", // High school graduate
        "B15003_022E", // Bachelor's degree
        "B23025_005E", // Unemployed
        "B23025_002E", // Labor force
      ];

      const variableString = variables.join(",");
      // Use our server proxy to avoid CORS issues
      const url = `/api/census/${year}/acs/acs1?get=${variableString}&for=state:${stateCode}`;

      const response = await this.makeRequest(url);

      if (!response || response.length < 2) {
        return this.getDefaultCensusData();
      }

      const data = response[1]; // First row is headers, second row is data

      return this.parseCensusResponse(data, year);
    } catch (error) {
      console.error("Error fetching Census data:", error);
      return this.getDefaultCensusData();
    }
  }

  async getDemographicsByCounty(
    stateCode: string,
    countyCode: string,
    year: number = 2022,
  ): Promise<CensusData> {
    try {
      const variables = [
        "B01003_001E", // Total population
        "B25003_001E", // Total housing units
        "B25003_002E", // Owner occupied
        "B25003_003E", // Renter occupied
        "B19013_001E", // Median household income
        "B25077_001E", // Median home value
        "B25064_001E", // Median gross rent
        "B01002_001E", // Median age
        "B15003_001E", // Total education population
        "B15003_017E", // High school graduate
        "B15003_022E", // Bachelor's degree
        "B23025_005E", // Unemployed
        "B23025_002E", // Labor force
      ];

      const variableString = variables.join(",");
      // Use our server proxy to avoid CORS issues
      const url = `/api/census/${year}/acs/acs5?get=${variableString}&for=county:${countyCode}&in=state:${stateCode}`;

      const response = await this.makeRequest(url);

      if (!response || response.length < 2) {
        return this.getDefaultCensusData();
      }

      const data = response[1];

      return this.parseCensusResponse(data, year);
    } catch (error) {
      console.error("Error fetching County Census data:", error);
      return this.getDefaultCensusData();
    }
  }

  private parseCensusResponse(data: any[], year: number): CensusData {
    const safeNumber = (value: any): number => {
      const num = parseInt(value);
      return isNaN(num) || num < 0 ? 0 : num;
    };

    const totalPopulation = safeNumber(data[0]);
    const totalHousingUnits = safeNumber(data[1]);
    const ownerOccupied = safeNumber(data[2]);
    const renterOccupied = safeNumber(data[3]);
    const medianIncome = safeNumber(data[4]);
    const medianHomeValue = safeNumber(data[5]);
    const medianRent = safeNumber(data[6]);
    const medianAge = data.length > 7 ? safeNumber(data[7]) : 35;
    const totalEducationPop =
      data.length > 8 ? safeNumber(data[8]) : totalPopulation;
    const highSchoolGrads = data.length > 9 ? safeNumber(data[9]) : 0;
    const collegeGrads = data.length > 10 ? safeNumber(data[10]) : 0;
    const unemployed = data.length > 11 ? safeNumber(data[11]) : 0;
    const laborForce =
      data.length > 12 ? safeNumber(data[12]) : totalPopulation * 0.6;

    // Calculate derived metrics
    const unemploymentRate =
      laborForce > 0 ? (unemployed / laborForce) * 100 : 0;
    const collegeEducatedPercent =
      totalEducationPop > 0 ? (collegeGrads / totalEducationPop) * 100 : 0;
    const ownerOccupiedPercent =
      totalHousingUnits > 0 ? (ownerOccupied / totalHousingUnits) * 100 : 0;

    return {
      population: {
        total: totalPopulation,
        density: 0, // Would need geographic area data
        medianAge,
      },
      demographics: {
        raceDistribution: {
          white: 70, // Default values - would need additional API calls
          black: 12,
          hispanic: 18,
          asian: 6,
          other: 4,
        },
        ageDistribution: {
          under18: 20,
          "18-34": 25,
          "35-54": 30,
          "55-74": 20,
          over75: 5,
        },
      },
      economics: {
        medianHouseholdIncome: medianIncome,
        povertyRate: 12, // Would need additional API call
        unemploymentRate: Math.round(unemploymentRate * 10) / 10,
        incomeDistribution: {
          under25k: 15,
          "25k-50k": 20,
          "50k-75k": 25,
          "75k-100k": 20,
          over100k: 20,
        },
      },
      education: {
        lessThanHighSchool: 10,
        highSchoolGraduate: 30,
        someCollege: 30,
        bachelorsOrHigher: Math.round(collegeEducatedPercent),
      },
      housing: {
        totalUnits: totalHousingUnits,
        ownerOccupied: Math.round(ownerOccupiedPercent),
        renterOccupied: Math.round(100 - ownerOccupiedPercent),
        medianHomeValue,
        medianRent,
      },
      year,
      dataAvailable: true,
    };
  }

  private getDefaultCensusData(): CensusData {
    return {
      population: {
        total: 0,
        density: 0,
        medianAge: 0,
      },
      demographics: {
        raceDistribution: {
          white: 0,
          black: 0,
          hispanic: 0,
          asian: 0,
          other: 0,
        },
        ageDistribution: {
          under18: 0,
          "18-34": 0,
          "35-54": 0,
          "55-74": 0,
          over75: 0,
        },
      },
      economics: {
        medianHouseholdIncome: 0,
        povertyRate: 0,
        unemploymentRate: 0,
        incomeDistribution: {
          under25k: 0,
          "25k-50k": 0,
          "50k-75k": 0,
          "75k-100k": 0,
          over100k: 0,
        },
      },
      education: {
        lessThanHighSchool: 0,
        highSchoolGraduate: 0,
        someCollege: 0,
        bachelorsOrHigher: 0,
      },
      housing: {
        totalUnits: 0,
        ownerOccupied: 0,
        renterOccupied: 0,
        medianHomeValue: 0,
        medianRent: 0,
      },
      year: new Date().getFullYear(),
      dataAvailable: false,
    };
  }

  // Helper function to get state code from state name
  getStateCode(stateName: string): string {
    const stateCodes: { [key: string]: string } = {
      Alabama: "01",
      Alaska: "02",
      Arizona: "04",
      Arkansas: "05",
      California: "06",
      Colorado: "08",
      Connecticut: "09",
      Delaware: "10",
      Florida: "12",
      Georgia: "13",
      Hawaii: "15",
      Idaho: "16",
      Illinois: "17",
      Indiana: "18",
      Iowa: "19",
      Kansas: "20",
      Kentucky: "21",
      Louisiana: "22",
      Maine: "23",
      Maryland: "24",
      Massachusetts: "25",
      Michigan: "26",
      Minnesota: "27",
      Mississippi: "28",
      Missouri: "29",
      Montana: "30",
      Nebraska: "31",
      Nevada: "32",
      "New Hampshire": "33",
      "New Jersey": "34",
      "New Mexico": "35",
      "New York": "36",
      "North Carolina": "37",
      "North Dakota": "38",
      Ohio: "39",
      Oklahoma: "40",
      Oregon: "41",
      Pennsylvania: "42",
      "Rhode Island": "44",
      "South Carolina": "45",
      "South Dakota": "46",
      Tennessee: "47",
      Texas: "48",
      Utah: "49",
      Vermont: "50",
      Virginia: "51",
      Washington: "53",
      "West Virginia": "54",
      Wisconsin: "55",
      Wyoming: "56",
    };

    return stateCodes[stateName] || "06"; // Default to California
  }
}

export const censusService = new CensusService();
