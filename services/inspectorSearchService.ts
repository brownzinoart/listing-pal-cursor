import {
  Inspector,
  InspectorSearchCriteria,
  ServiceSearchResult,
  ServiceSearchFilters,
  ServiceAppointment,
  Listing,
} from "../types";
import { errorHandlingService } from "./errorHandlingService";

export class InspectorSearchService {
  private static readonly MOCK_INSPECTORS: Inspector[] = [
    {
      id: "inspector-1",
      type: "inspector",
      businessName: "Elite Property Inspections",
      contactName: "Michael Johnson",
      email: "michael@eliteproperty.com",
      phone: "(919) 555-0123",
      website: "https://eliteproperty.com",
      logoUrl: "/api/placeholder/120/120",
      address: "1234 Main St",
      city: "Raleigh",
      state: "NC",
      zipCode: "27601",
      serviceRadius: 50,
      latitude: 35.7796,
      longitude: -78.6382,

      businessLicense: "NC-HI-2024-001",
      yearsInBusiness: 8,
      employeeCount: 3,
      businessType: "llc",

      overallRating: 4.8,
      totalReviews: 129,
      reviews: [
        {
          id: "review-1",
          providerId: "inspector-1",
          reviewerName: "Sarah Thompson",
          rating: 5,
          comment:
            "Extremely thorough inspection. Found issues that saved me thousands. Highly professional and detailed report delivered same day.",
          date: "2024-01-15",
          verified: true,
          projectType: "general",
          helpfulCount: 8,
        },
        {
          id: "review-2",
          providerId: "inspector-1",
          reviewerName: "David Chen",
          rating: 5,
          comment:
            "Michael was punctual, professional, and very knowledgeable. The report was comprehensive and easy to understand.",
          date: "2024-01-08",
          verified: true,
          projectType: "general",
          helpfulCount: 5,
        },
        {
          id: "review-3",
          providerId: "inspector-1",
          reviewerName: "Lisa Martinez",
          rating: 5,
          comment:
            "Found a major foundation issue that could have cost us $20K+. Worth every penny and more!",
          date: "2024-01-02",
          verified: true,
          projectType: "structural",
          helpfulCount: 12,
        },
        {
          id: "review-4",
          providerId: "inspector-1",
          reviewerName: "Robert Kim",
          rating: 4,
          comment:
            "Very thorough inspection. Report was detailed but took longer than expected to receive.",
          date: "2023-12-28",
          verified: true,
          projectType: "general",
          helpfulCount: 3,
        },
      ],

      certifications: [
        {
          id: "cert-1",
          name: "North Carolina Licensed Home Inspector",
          issuingBody: "NC Home Inspector Licensure Board",
          certificationNumber: "HI-1234",
          issueDate: "2020-03-15",
          expirationDate: "2025-03-15",
          verified: true,
        },
        {
          id: "cert-2",
          name: "InterNACHI Certified Professional Inspector",
          issuingBody: "International Association of Certified Home Inspectors",
          certificationNumber: "CPI-5678",
          issueDate: "2019-06-20",
          verified: true,
        },
      ],

      insurance: [
        {
          type: "general-liability",
          carrier: "State Farm Business",
          coverageAmount: 1000000,
          expirationDate: "2024-12-31",
          verified: true,
        },
        {
          type: "professional-liability",
          carrier: "State Farm Business",
          coverageAmount: 500000,
          expirationDate: "2024-12-31",
          verified: true,
        },
      ],

      availability: {
        nextAvailableDate: "2024-02-03",
        typicalBookingLead: 2,
        workingHours: {
          monday: { start: "08:00", end: "17:00" },
          tuesday: { start: "08:00", end: "17:00" },
          wednesday: { start: "08:00", end: "17:00" },
          thursday: { start: "08:00", end: "17:00" },
          friday: { start: "08:00", end: "17:00" },
          saturday: { start: "09:00", end: "15:00" },
        },
        emergencyAvailable: false,
        weekendAvailable: true,
      },

      portfolio: [
        {
          id: "portfolio-1",
          title: "Historic Home Inspection - Downtown Raleigh",
          description:
            "Comprehensive inspection of 1920s colonial home including detailed foundation and electrical assessment.",
          beforeImages: ["/api/placeholder/400/300"],
          afterImages: [],
          completionDate: "2024-01-10",
          clientTestimonial:
            "Saved us from a major foundation issue. Worth every penny!",
        },
        {
          id: "portfolio-2",
          title: "New Construction Final Inspection - North Hills",
          description:
            "Final walkthrough inspection of newly constructed luxury home with detailed punch list and system testing.",
          beforeImages: [
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
          ],
          afterImages: [],
          completionDate: "2024-01-15",
          clientTestimonial:
            "Caught 15+ items the builder missed. Professional and thorough service.",
        },
        {
          id: "portfolio-3",
          title: "Pre-Purchase Inspection - Cary Family Home",
          description:
            "Complete inspection of 1990s family home including radon testing and pest inspection.",
          beforeImages: ["/api/placeholder/400/300"],
          afterImages: [],
          completionDate: "2024-01-05",
          clientTestimonial:
            "Report was incredibly detailed and helped us negotiate $5K off the price.",
        },
      ],

      specialties: [
        "Historic Homes",
        "Foundation Issues",
        "Electrical Systems",
        "Pest Detection",
      ],
      serviceAreas: ["Raleigh", "Durham", "Chapel Hill", "Cary", "Wake County"],
      verified: true,
      lastUpdated: "2024-01-20",
      joinedDate: "2020-03-15",
      isActive: true,

      // Inspector-specific fields
      inspectorLicense: "NC-HI-2024-001",
      inspectionTypes: [
        "general",
        "pest",
        "termite",
        "radon",
        "structural",
        "electrical",
        "plumbing",
        "hvac",
      ],
      equipmentOwned: [
        "Thermal Camera",
        "Moisture Meter",
        "Gas Detector",
        "Electrical Tester",
      ],
      reportTurnaroundHours: 4,
      sampleReportUrl: "/samples/inspection-report-sample.pdf",

      standardInspectionFee: 450,
      additionalServiceFees: [
        { serviceName: "Radon Testing", fee: 150 },
        { serviceName: "Pest Inspection", fee: 100 },
        { serviceName: "Pool/Spa Inspection", fee: 125 },
      ],
      squareFootagePricing: {
        basePrice: 350,
        perSquareFoot: 0.25,
        maxSquareFootage: 4000,
      },
    },
    {
      id: "inspector-2",
      type: "inspector",
      businessName: "Triangle Home Inspections",
      contactName: "Jennifer Williams",
      email: "jen@trianglehome.com",
      phone: "(919) 555-0456",
      website: "https://trianglehome.com",
      logoUrl: "/api/placeholder/120/120",
      address: "567 Oak Avenue",
      city: "Durham",
      state: "NC",
      zipCode: "27701",
      serviceRadius: 40,
      latitude: 35.994,
      longitude: -78.8986,

      businessLicense: "NC-HI-2024-002",
      yearsInBusiness: 12,
      employeeCount: 5,
      businessType: "corporation",

      overallRating: 4.9,
      totalReviews: 203,
      reviews: [
        {
          id: "review-3",
          providerId: "inspector-2",
          reviewerName: "Mark Rodriguez",
          rating: 5,
          comment:
            "Best inspector in the Triangle area. Very detailed and patient in explaining findings.",
          date: "2024-01-12",
          verified: true,
          projectType: "general",
          helpfulCount: 12,
        },
      ],

      certifications: [
        {
          id: "cert-3",
          name: "North Carolina Licensed Home Inspector",
          issuingBody: "NC Home Inspector Licensure Board",
          certificationNumber: "HI-5678",
          issueDate: "2018-05-10",
          expirationDate: "2025-05-10",
          verified: true,
        },
        {
          id: "cert-4",
          name: "Certified Radon Measurement Professional",
          issuingBody: "National Radon Proficiency Program",
          certificationNumber: "NRPP-9012",
          issueDate: "2019-08-15",
          expirationDate: "2025-08-15",
          verified: true,
        },
      ],

      insurance: [
        {
          type: "general-liability",
          carrier: "Liberty Mutual",
          coverageAmount: 2000000,
          expirationDate: "2024-11-30",
          verified: true,
        },
        {
          type: "professional-liability",
          carrier: "Liberty Mutual",
          coverageAmount: 1000000,
          expirationDate: "2024-11-30",
          verified: true,
        },
      ],

      availability: {
        nextAvailableDate: "2024-02-01",
        typicalBookingLead: 1,
        workingHours: {
          monday: { start: "07:00", end: "18:00" },
          tuesday: { start: "07:00", end: "18:00" },
          wednesday: { start: "07:00", end: "18:00" },
          thursday: { start: "07:00", end: "18:00" },
          friday: { start: "07:00", end: "18:00" },
          saturday: { start: "08:00", end: "16:00" },
          sunday: { start: "10:00", end: "14:00" },
        },
        emergencyAvailable: true,
        weekendAvailable: true,
      },

      portfolio: [
        {
          id: "portfolio-2",
          title: "New Construction Inspection - Chapel Hill",
          description:
            "Final walkthrough inspection of new construction home with detailed punch list.",
          beforeImages: ["/api/placeholder/300/200"],
          afterImages: [],
          completionDate: "2024-01-05",
          clientTestimonial:
            "Caught several issues the builder missed. Very professional service.",
        },
      ],

      specialties: [
        "New Construction",
        "Radon Testing",
        "Commercial Properties",
        "Mold Assessment",
      ],
      serviceAreas: [
        "Durham",
        "Chapel Hill",
        "Hillsborough",
        "Durham County",
        "Orange County",
      ],
      verified: true,
      lastUpdated: "2024-01-18",
      joinedDate: "2018-05-10",
      isActive: true,

      inspectorLicense: "NC-HI-2024-002",
      inspectionTypes: [
        "general",
        "pest",
        "termite",
        "radon",
        "mold",
        "structural",
        "electrical",
        "plumbing",
        "hvac",
        "commercial",
      ],
      equipmentOwned: [
        "Thermal Camera",
        "Moisture Meter",
        "Radon Detector",
        "Mold Test Kit",
        "Electrical Tester",
      ],
      reportTurnaroundHours: 2,
      sampleReportUrl: "/samples/triangle-inspection-report.pdf",

      standardInspectionFee: 395,
      additionalServiceFees: [
        { serviceName: "Radon Testing", fee: 125 },
        { serviceName: "Mold Assessment", fee: 200 },
        { serviceName: "Pest Inspection", fee: 85 },
        { serviceName: "Commercial Inspection", fee: 150 },
      ],
      squareFootagePricing: {
        basePrice: 325,
        perSquareFoot: 0.2,
        maxSquareFootage: 5000,
      },
    },
    {
      id: "inspector-3",
      type: "inspector",
      businessName: "Precision Home Inspectors",
      contactName: "Amanda Rodriguez",
      email: "amanda@precisionhome.com",
      phone: "(919) 555-0987",
      website: "https://precisionhome.com",
      logoUrl: "/api/placeholder/120/120",
      address: "789 Professional Blvd",
      city: "Cary",
      state: "NC",
      zipCode: "27519",
      serviceRadius: 45,
      latitude: 35.7915,
      longitude: -78.7811,

      businessLicense: "NC-HI-2024-003",
      yearsInBusiness: 6,
      employeeCount: 2,
      businessType: "llc",

      overallRating: 4.7,
      totalReviews: 94,
      reviews: [
        {
          id: "review-7",
          providerId: "inspector-3",
          reviewerName: "John Parker",
          rating: 5,
          comment:
            "Amanda was fantastic! Very detailed report with photos and explanations. Highly recommend.",
          date: "2024-01-18",
          verified: true,
          projectType: "general",
          helpfulCount: 7,
        },
        {
          id: "review-8",
          providerId: "inspector-3",
          reviewerName: "Susan Wright",
          rating: 4,
          comment:
            "Good inspection overall. Found some minor issues we hadn't noticed.",
          date: "2024-01-12",
          verified: true,
          projectType: "general",
          helpfulCount: 4,
        },
      ],

      certifications: [
        {
          id: "cert-7",
          name: "North Carolina Licensed Home Inspector",
          issuingBody: "NC Home Inspector Licensure Board",
          certificationNumber: "HI-9012",
          issueDate: "2021-02-28",
          expirationDate: "2026-02-28",
          verified: true,
        },
      ],

      insurance: [
        {
          type: "general-liability",
          carrier: "Allstate Business",
          coverageAmount: 1500000,
          expirationDate: "2024-12-15",
          verified: true,
        },
      ],

      availability: {
        nextAvailableDate: "2024-02-05",
        typicalBookingLead: 3,
        workingHours: {
          monday: { start: "08:30", end: "16:30" },
          tuesday: { start: "08:30", end: "16:30" },
          wednesday: { start: "08:30", end: "16:30" },
          thursday: { start: "08:30", end: "16:30" },
          friday: { start: "08:30", end: "16:30" },
        },
        emergencyAvailable: false,
        weekendAvailable: false,
      },

      portfolio: [
        {
          id: "portfolio-7",
          title: "Townhome Inspection - Morrisville",
          description:
            "Detailed inspection of 2015 townhome with focus on HVAC and plumbing systems.",
          beforeImages: ["/api/placeholder/400/300"],
          afterImages: [],
          completionDate: "2024-01-20",
          clientTestimonial:
            "Very professional and thorough. Great communication throughout.",
        },
      ],

      specialties: ["Condos & Townhomes", "New Construction", "HVAC Systems"],
      serviceAreas: ["Cary", "Apex", "Morrisville", "Holly Springs"],
      verified: true,
      lastUpdated: "2024-01-22",
      joinedDate: "2021-02-28",
      isActive: true,

      inspectorLicense: "NC-HI-2024-003",
      inspectionTypes: ["general", "pest", "electrical", "plumbing", "hvac"],
      equipmentOwned: ["Thermal Camera", "Moisture Meter", "Electrical Tester"],
      reportTurnaroundHours: 6,
      sampleReportUrl: "/samples/precision-inspection-report.pdf",

      standardInspectionFee: 375,
      additionalServiceFees: [
        { serviceName: "Pest Inspection", fee: 95 },
        { serviceName: "Energy Audit", fee: 175 },
      ],
      squareFootagePricing: {
        basePrice: 300,
        perSquareFoot: 0.22,
        maxSquareFootage: 3500,
      },
    },
  ];

  /**
   * Search for inspectors based on criteria
   */
  static async searchInspectors(
    criteria: InspectorSearchCriteria,
  ): Promise<ServiceSearchResult[]> {
    try {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      let results = this.MOCK_INSPECTORS.filter((inspector) => {
        // Basic filters
        if (criteria.verifiedOnly && !inspector.verified) return false;
        if (criteria.insuredOnly && inspector.insurance.length === 0)
          return false;
        if (criteria.minRating && inspector.overallRating < criteria.minRating)
          return false;

        // Inspection type filter
        if (criteria.inspectionTypes.length > 0) {
          const hasRequiredTypes = criteria.inspectionTypes.every((type) =>
            inspector.inspectionTypes.includes(type as any),
          );
          if (!hasRequiredTypes) return false;
        }

        // Service area filter (simplified - in production would use geocoding)
        if (criteria.maxDistance) {
          // Mock distance calculation
          const distance = this.calculateDistance(inspector);
          if (distance > criteria.maxDistance) return false;
        }

        return true;
      });

      // Calculate match scores and distances
      const searchResults: ServiceSearchResult[] = results.map((inspector) => ({
        provider: inspector,
        distance: this.calculateDistance(inspector),
        matchScore: this.calculateMatchScore(inspector, criteria),
        estimatedResponseTime: this.getEstimatedResponseTime(inspector),
        nextAvailableSlot: inspector.availability.nextAvailableDate,
      }));

      // Sort by match score and rating
      searchResults.sort((a, b) => {
        const scoreA = a.matchScore * 0.7 + a.provider.overallRating * 20 * 0.3;
        const scoreB = b.matchScore * 0.7 + b.provider.overallRating * 20 * 0.3;
        return scoreB - scoreA;
      });

      return searchResults;
    } catch (error) {
      console.error("Error searching inspectors:", error);
      const errorResult = errorHandlingService.handleError(
        error,
        "InspectorSearchService.searchInspectors",
      );
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Get inspector by ID
   */
  static async getInspectorById(id: string): Promise<Inspector | null> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return (
        this.MOCK_INSPECTORS.find((inspector) => inspector.id === id) || null
      );
    } catch (error) {
      console.error("Error getting inspector:", error);
      const errorResult = errorHandlingService.handleError(
        error,
        "InspectorSearchService.getInspectorById",
      );
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Book inspection appointment
   */
  static async bookInspection(
    inspectorId: string,
    listingId: string,
    appointmentData: Partial<ServiceAppointment>,
  ): Promise<ServiceAppointment> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const appointment: ServiceAppointment = {
        id: `appointment-${Date.now()}`,
        providerId: inspectorId,
        listingId,
        userId: appointmentData.userId || "",
        appointmentType: "inspection",
        scheduledDate: appointmentData.scheduledDate || "",
        scheduledTime: appointmentData.scheduledTime || "",
        estimatedDuration: 180, // 3 hours for inspection
        status: "requested",
        contactMethod: appointmentData.contactMethod || "email",
        clientNotes: appointmentData.clientNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return appointment;
    } catch (error) {
      console.error("Error booking inspection:", error);
      const errorResult = errorHandlingService.handleError(
        error,
        "InspectorSearchService.bookInspection",
      );
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Get available time slots for inspector
   */
  static async getAvailableSlots(
    inspectorId: string,
    date: string,
  ): Promise<string[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock available slots - in production would check actual calendar
      const slots = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
      ];

      // Remove some slots randomly to simulate bookings
      return slots.filter(() => Math.random() > 0.3);
    } catch (error) {
      console.error("Error getting available slots:", error);
      const errorResult = errorHandlingService.handleError(
        error,
        "InspectorSearchService.getAvailableSlots",
      );
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Filter inspectors based on additional criteria
   */
  static filterInspectors(
    inspectors: Inspector[],
    filters: ServiceSearchFilters,
  ): Inspector[] {
    return inspectors.filter((inspector) => {
      if (
        filters.rating &&
        (inspector.overallRating < filters.rating.min ||
          inspector.overallRating > filters.rating.max)
      ) {
        return false;
      }

      if (
        filters.pricing &&
        (inspector.standardInspectionFee < filters.pricing.min ||
          inspector.standardInspectionFee > filters.pricing.max)
      ) {
        return false;
      }

      if (filters.verified && !inspector.verified) {
        return false;
      }

      if (filters.insured && inspector.insurance.length === 0) {
        return false;
      }

      if (filters.emergency && !inspector.availability.emergencyAvailable) {
        return false;
      }

      if (filters.weekend && !inspector.availability.weekendAvailable) {
        return false;
      }

      if (filters.specialties && filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some((specialty) =>
          inspector.specialties.includes(specialty),
        );
        if (!hasSpecialty) return false;
      }

      return true;
    });
  }

  // Helper methods
  private static calculateDistance(inspector: Inspector): number {
    // Mock distance calculation - in production would use actual geocoding
    return Math.floor(Math.random() * 25) + 5; // 5-30 miles
  }

  private static calculateMatchScore(
    inspector: Inspector,
    criteria: InspectorSearchCriteria,
  ): number {
    let score = 50; // Base score

    // Rating bonus
    score += (inspector.overallRating - 3) * 10; // 4.5 rating = +15 points

    // Verification bonus
    if (inspector.verified) score += 10;

    // Experience bonus
    if (inspector.yearsInBusiness > 10) score += 10;
    else if (inspector.yearsInBusiness > 5) score += 5;

    // Urgency matching
    const leadTime = inspector.availability.typicalBookingLead;
    switch (criteria.urgency) {
      case "emergency":
        if (inspector.availability.emergencyAvailable) score += 20;
        else score -= 10;
        break;
      case "asap":
        if (leadTime <= 1) score += 15;
        else if (leadTime <= 2) score += 5;
        else score -= 5;
        break;
      case "within-week":
        if (leadTime <= 3) score += 10;
        break;
    }

    return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  }

  private static getEstimatedResponseTime(inspector: Inspector): string {
    const leadTime = inspector.availability.typicalBookingLead;

    if (leadTime === 0) return "Same day";
    if (leadTime === 1) return "Within 24 hours";
    if (leadTime <= 3) return `Within ${leadTime} days`;
    return `${leadTime} days lead time`;
  }

  /**
   * Create search criteria from listing data
   */
  static createSearchCriteriaFromListing(
    listing: Listing,
  ): Partial<InspectorSearchCriteria> {
    return {
      serviceType: "inspector",
      listingId: listing.id,
      maxDistance: 25,
      inspectionTypes: ["general"],
      propertyType: "residential",
      propertyAge: listing.yearBuilt
        ? new Date().getFullYear() - listing.yearBuilt
        : undefined,
      squareFootage: listing.squareFootage,
      urgency: "within-week",
      verifiedOnly: true,
      insuredOnly: true,
    };
  }
}
