import { 
  Contractor, 
  ContractorSearchCriteria, 
  ServiceSearchResult, 
  ServiceSearchFilters,
  ServiceQuoteRequest,
  ServiceAppointment,
  Listing
} from '../types';
import { errorHandlingService } from './errorHandlingService';

export class ContractorSearchService {
  private static readonly MOCK_CONTRACTORS: Contractor[] = [
    {
      id: 'contractor-1',
      type: 'contractor',
      businessName: 'Triangle Renovation Pros',
      contactName: 'Robert Martinez',
      email: 'rob@trianglereno.com',
      phone: '(919) 555-0789',
      website: 'https://trianglereno.com',
      logoUrl: '/api/placeholder/120/120',
      address: '2468 Industrial Blvd',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27603',
      serviceRadius: 40,
      latitude: 35.7796,
      longitude: -78.6382,
      
      businessLicense: 'NC-GC-2024-001',
      yearsInBusiness: 15,
      employeeCount: 12,
      businessType: 'llc',
      
      overallRating: 4.9,
      totalReviews: 89,
      reviews: [
        {
          id: 'review-1',
          providerId: 'contractor-1',
          reviewerName: 'Emily Johnson',
          rating: 5,
          comment: 'Excellent kitchen renovation. On time, on budget, and quality workmanship. Highly recommend!',
          date: '2024-01-10',
          verified: true,
          projectType: 'kitchen',
          helpfulCount: 15
        },
        {
          id: 'review-2',
          providerId: 'contractor-1',
          reviewerName: 'James Wilson',
          rating: 5,
          comment: 'Complete bathroom remodel was flawless. Great communication throughout the project.',
          date: '2023-12-20',
          verified: true,
          projectType: 'bathroom',
          helpfulCount: 8
        }
      ],
      
      certifications: [
        {
          id: 'cert-1',
          name: 'North Carolina General Contractor License',
          issuingBody: 'NC Licensing Board for General Contractors',
          certificationNumber: 'GC-78901',
          issueDate: '2020-01-15',
          expirationDate: '2025-01-15',
          verified: true
        },
        {
          id: 'cert-2',
          name: 'NARI Certified Remodeler',
          issuingBody: 'National Association of the Remodeling Industry',
          certificationNumber: 'NARI-2345',
          issueDate: '2021-06-10',
          verified: true
        }
      ],
      
      insurance: [
        {
          type: 'general-liability',
          carrier: 'Travelers Insurance',
          coverageAmount: 2000000,
          expirationDate: '2024-12-31',
          verified: true
        },
        {
          type: 'workers-comp',
          carrier: 'Travelers Insurance',
          coverageAmount: 1000000,
          expirationDate: '2024-12-31',
          verified: true
        },
        {
          type: 'bonded',
          carrier: 'Surety One',
          coverageAmount: 50000,
          expirationDate: '2024-12-31',
          verified: true
        }
      ],
      
      availability: {
        nextAvailableDate: '2024-03-15',
        typicalBookingLead: 14,
        workingHours: {
          monday: { start: '07:00', end: '17:00' },
          tuesday: { start: '07:00', end: '17:00' },
          wednesday: { start: '07:00', end: '17:00' },
          thursday: { start: '07:00', end: '17:00' },
          friday: { start: '07:00', end: '17:00' }
        },
        emergencyAvailable: true,
        weekendAvailable: false
      },
      
      portfolio: [
        {
          id: 'portfolio-1',
          title: 'Modern Kitchen Renovation - North Hills',
          description: 'Complete kitchen gut and remodel with custom cabinets, quartz countertops, and premium appliances.',
          beforeImages: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          completionDate: '2023-11-15',
          projectValue: 45000,
          projectDuration: '4 weeks',
          clientTestimonial: 'Dream kitchen came true! Professional team and amazing results.'
        },
        {
          id: 'portfolio-2',
          title: 'Master Bathroom Remodel - Cary',
          description: 'Luxury master bathroom with walk-in shower, soaking tub, and heated floors.',
          beforeImages: ['/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          completionDate: '2023-10-05',
          projectValue: 28000,
          projectDuration: '3 weeks',
          clientTestimonial: 'Exceeded our expectations. Beautiful work and excellent communication.'
        }
      ],
      
      specialties: ['Kitchen Remodeling', 'Bathroom Renovation', 'Custom Cabinetry', 'Tile Work'],
      serviceAreas: ['Raleigh', 'Cary', 'Wake Forest', 'Apex', 'Wake County'],
      verified: true,
      lastUpdated: '2024-01-20',
      joinedDate: '2020-01-15',
      isActive: true,
      
      // Contractor-specific fields
      contractorLicense: 'NC-GC-2024-001',
      tradeSpecialties: ['general', 'kitchen', 'bathroom', 'flooring', 'painting', 'drywall', 'carpentry'],
      projectTypes: ['renovation', 'remodel', 'repair'],
      materialSources: ['Home Depot Pro', 'Lowes Pro', 'Local Suppliers'],
      warrantyOffered: '2 years on labor, manufacturer warranty on materials',
      bondedAmount: 50000,
      
      maxProjectValue: 150000,
      minProjectValue: 2000,
      simultaneousProjects: 3,
      
      providesWrittenEstimates: true,
      estimateFee: 0,
      estimateTurnaroundDays: 3,
      acceptsInsuranceWork: true,
      financingOptions: ['0% Interest for 12 months', 'Extended payment plans']
    },
    {
      id: 'contractor-2',
      type: 'contractor',
      businessName: 'Elite Roofing Solutions',
      contactName: 'Maria Garcia',
      email: 'maria@eliteroofing.com',
      phone: '(919) 555-0321',
      website: 'https://eliteroofing.com',
      logoUrl: '/api/placeholder/120/120',
      address: '1357 Commerce Drive',
      city: 'Durham',
      state: 'NC',
      zipCode: '27704',
      serviceRadius: 60,
      latitude: 35.9940,
      longitude: -78.8986,
      
      businessLicense: 'NC-RC-2024-002',
      yearsInBusiness: 22,
      employeeCount: 8,
      businessType: 'corporation',
      
      overallRating: 4.8,
      totalReviews: 156,
      reviews: [
        {
          id: 'review-3',
          providerId: 'contractor-2',
          reviewerName: 'Thomas Anderson',
          rating: 5,
          comment: 'Professional roof replacement after storm damage. Quality materials and excellent workmanship.',
          date: '2024-01-05',
          verified: true,
          projectType: 'roofing',
          helpfulCount: 22
        }
      ],
      
      certifications: [
        {
          id: 'cert-3',
          name: 'North Carolina Roofing Contractor License',
          issuingBody: 'NC Licensing Board for General Contractors',
          certificationNumber: 'RC-45678',
          issueDate: '2018-03-20',
          expirationDate: '2025-03-20',
          verified: true
        },
        {
          id: 'cert-4',
          name: 'GAF Master Elite Contractor',
          issuingBody: 'GAF Materials Corporation',
          certificationNumber: 'GAF-2468',
          issueDate: '2020-05-15',
          verified: true
        }
      ],
      
      insurance: [
        {
          type: 'general-liability',
          carrier: 'State Farm Business',
          coverageAmount: 3000000,
          expirationDate: '2024-11-30',
          verified: true
        },
        {
          type: 'workers-comp',
          carrier: 'State Farm Business',
          coverageAmount: 1500000,
          expirationDate: '2024-11-30',
          verified: true
        }
      ],
      
      availability: {
        nextAvailableDate: '2024-02-20',
        typicalBookingLead: 7,
        workingHours: {
          monday: { start: '06:30', end: '18:00' },
          tuesday: { start: '06:30', end: '18:00' },
          wednesday: { start: '06:30', end: '18:00' },
          thursday: { start: '06:30', end: '18:00' },
          friday: { start: '06:30', end: '18:00' },
          saturday: { start: '08:00', end: '16:00' }
        },
        emergencyAvailable: true,
        weekendAvailable: true
      },
      
      portfolio: [
        {
          id: 'portfolio-3',
          title: 'Storm Damage Roof Replacement - Chapel Hill',
          description: 'Complete roof replacement with GAF Timberline HD shingles after hail damage.',
          beforeImages: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300'],
          completionDate: '2023-12-10',
          projectValue: 18500,
          projectDuration: '3 days',
          clientTestimonial: 'Fast, professional service. Worked directly with insurance. Highly recommend!'
        }
      ],
      
      specialties: ['Storm Damage Repair', 'Insurance Claims', 'Emergency Services', 'Metal Roofing'],
      serviceAreas: ['Durham', 'Chapel Hill', 'Hillsborough', 'Durham County', 'Orange County', 'Wake County'],
      verified: true,
      lastUpdated: '2024-01-18',
      joinedDate: '2018-03-20',
      isActive: true,
      
      contractorLicense: 'NC-RC-2024-002',
      tradeSpecialties: ['roofing'],
      projectTypes: ['repair', 'renovation', 'new-construction', 'emergency'],
      materialSources: ['GAF', 'Owens Corning', 'CertainTeed'],
      warrantyOffered: '10 years on labor, manufacturer warranty on materials',
      
      maxProjectValue: 75000,
      minProjectValue: 1500,
      simultaneousProjects: 5,
      
      providesWrittenEstimates: true,
      estimateFee: 0,
      estimateTurnaroundDays: 1,
      acceptsInsuranceWork: true,
      financingOptions: ['Insurance Direct Pay', '6 months same as cash']
    },
    {
      id: 'contractor-3',
      type: 'contractor',
      businessName: 'Precision HVAC Services',
      contactName: 'David Kim',
      email: 'david@precisionhvac.com',
      phone: '(919) 555-0654',
      website: 'https://precisionhvac.com',
      logoUrl: '/api/placeholder/120/120',
      address: '987 Technical Way',
      city: 'Cary',
      state: 'NC',
      zipCode: '27519',
      serviceRadius: 35,
      latitude: 35.7915,
      longitude: -78.7811,
      
      businessLicense: 'NC-HVAC-2024-003',
      yearsInBusiness: 18,
      employeeCount: 6,
      businessType: 'llc',
      
      overallRating: 4.7,
      totalReviews: 134,
      reviews: [
        {
          id: 'review-4',
          providerId: 'contractor-3',
          reviewerName: 'Linda Chang',
          rating: 5,
          comment: 'New HVAC system installation was perfect. Very knowledgeable and fair pricing.',
          date: '2023-12-28',
          verified: true,
          projectType: 'hvac',
          helpfulCount: 18
        }
      ],
      
      certifications: [
        {
          id: 'cert-5',
          name: 'North Carolina HVAC Contractor License',
          issuingBody: 'NC Licensing Board for Heating, Air Conditioning & Refrigeration Contractors',
          certificationNumber: 'HVAC-9876',
          issueDate: '2019-04-12',
          expirationDate: '2025-04-12',
          verified: true
        },
        {
          id: 'cert-6',
          name: 'EPA Universal Certification',
          issuingBody: 'Environmental Protection Agency',
          certificationNumber: 'EPA-5432',
          issueDate: '2018-08-20',
          verified: true
        }
      ],
      
      insurance: [
        {
          type: 'general-liability',
          carrier: 'Progressive Commercial',
          coverageAmount: 1500000,
          expirationDate: '2024-10-31',
          verified: true
        },
        {
          type: 'workers-comp',
          carrier: 'Progressive Commercial',
          coverageAmount: 750000,
          expirationDate: '2024-10-31',
          verified: true
        }
      ],
      
      availability: {
        nextAvailableDate: '2024-02-10',
        typicalBookingLead: 5,
        workingHours: {
          monday: { start: '07:30', end: '17:30' },
          tuesday: { start: '07:30', end: '17:30' },
          wednesday: { start: '07:30', end: '17:30' },
          thursday: { start: '07:30', end: '17:30' },
          friday: { start: '07:30', end: '17:30' }
        },
        emergencyAvailable: true,
        weekendAvailable: false
      },
      
      portfolio: [
        {
          id: 'portfolio-4',
          title: 'High-Efficiency HVAC Installation - Apex',
          description: 'Complete HVAC system replacement with Trane high-efficiency units and smart thermostats.',
          beforeImages: ['/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300'],
          completionDate: '2023-11-30',
          projectValue: 12500,
          projectDuration: '2 days',
          clientTestimonial: 'Professional installation, clean work, and great energy savings!'
        }
      ],
      
      specialties: ['Energy Efficient Systems', 'Smart Home Integration', 'Duct Cleaning', 'Emergency Repairs'],
      serviceAreas: ['Cary', 'Apex', 'Morrisville', 'Holly Springs', 'Wake County'],
      verified: true,
      lastUpdated: '2024-01-15',
      joinedDate: '2019-04-12',
      isActive: true,
      
      contractorLicense: 'NC-HVAC-2024-003',
      tradeSpecialties: ['hvac'],
      projectTypes: ['repair', 'renovation', 'new-construction', 'maintenance'],
      materialSources: ['Trane', 'Carrier', 'Lennox'],
      warrantyOffered: '5 years on equipment, 2 years on labor',
      
      maxProjectValue: 35000,
      minProjectValue: 150,
      simultaneousProjects: 4,
      
      providesWrittenEstimates: true,
      estimateFee: 0,
      estimateTurnaroundDays: 2,
      acceptsInsuranceWork: false,
      financingOptions: ['0% for 18 months', 'Low interest rates available']
    },
    {
      id: 'contractor-4',
      type: 'contractor',
      businessName: 'Apex Electrical Solutions',
      contactName: 'Carlos Mendez',
      email: 'carlos@apexelectrical.com',
      phone: '(919) 555-0432',
      website: 'https://apexelectrical.com',
      logoUrl: '/api/placeholder/120/120',
      address: '456 Industrial Park Dr',
      city: 'Apex',
      state: 'NC',
      zipCode: '27502',
      serviceRadius: 30,
      latitude: 35.7326,
      longitude: -78.8503,
      
      businessLicense: 'NC-ELE-2024-004',
      yearsInBusiness: 11,
      employeeCount: 4,
      businessType: 'corporation',
      
      overallRating: 4.9,
      totalReviews: 67,
      reviews: [
        {
          id: 'review-10',
          providerId: 'contractor-4',
          reviewerName: 'Rachel Johnson',
          rating: 5,
          comment: 'Excellent electrical work! Carlos rewired our entire kitchen professionally and safely.',
          date: '2024-01-14',
          verified: true,
          projectType: 'electrical',
          helpfulCount: 9
        },
        {
          id: 'review-11',
          providerId: 'contractor-4',
          reviewerName: 'Steve Miller',
          rating: 5,
          comment: 'Fast response for emergency electrical issue. Fair pricing and quality work.',
          date: '2024-01-08',
          verified: true,
          projectType: 'emergency',
          helpfulCount: 6
        }
      ],
      
      certifications: [
        {
          id: 'cert-10',
          name: 'North Carolina Electrical Contractor License',
          issuingBody: 'NC Board of Examiners of Electrical Contractors',
          certificationNumber: 'ELE-7890',
          issueDate: '2019-06-01',
          expirationDate: '2025-06-01',
          verified: true
        },
        {
          id: 'cert-11',
          name: 'Master Electrician License',
          issuingBody: 'NC Board of Examiners of Electrical Contractors',
          certificationNumber: 'ME-4567',
          issueDate: '2018-03-15',
          verified: true
        }
      ],
      
      insurance: [
        {
          type: 'general-liability',
          carrier: 'GEICO Business',
          coverageAmount: 2000000,
          expirationDate: '2024-09-30',
          verified: true
        },
        {
          type: 'workers-comp',
          carrier: 'GEICO Business',
          coverageAmount: 1000000,
          expirationDate: '2024-09-30',
          verified: true
        }
      ],
      
      availability: {
        nextAvailableDate: '2024-02-08',
        typicalBookingLead: 4,
        workingHours: {
          monday: { start: '07:00', end: '17:00' },
          tuesday: { start: '07:00', end: '17:00' },
          wednesday: { start: '07:00', end: '17:00' },
          thursday: { start: '07:00', end: '17:00' },
          friday: { start: '07:00', end: '17:00' }
        },
        emergencyAvailable: true,
        weekendAvailable: false
      },
      
      portfolio: [
        {
          id: 'portfolio-10',
          title: 'Kitchen Electrical Upgrade - Cary',
          description: 'Complete electrical renovation for modern kitchen with new circuits, outlets, and lighting.',
          beforeImages: ['/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300'],
          completionDate: '2024-01-10',
          projectValue: 3500,
          projectDuration: '2 days',
          clientTestimonial: 'Outstanding work! Clean installation and everything works perfectly.'
        },
        {
          id: 'portfolio-11',
          title: 'Panel Upgrade - Holly Springs',
          description: 'Electrical panel upgrade from 100A to 200A service with new breakers.',
          beforeImages: ['/api/placeholder/400/300'],
          afterImages: ['/api/placeholder/400/300'],
          completionDate: '2023-12-22',
          projectValue: 2800,
          projectDuration: '1 day',
          clientTestimonial: 'Professional service and passed inspection on first try!'
        }
      ],
      
      specialties: ['Panel Upgrades', 'Kitchen Electrical', 'Emergency Repairs', 'Code Compliance'],
      serviceAreas: ['Apex', 'Cary', 'Holly Springs', 'Fuquay-Varina', 'Wake County'],
      verified: true,
      lastUpdated: '2024-01-16',
      joinedDate: '2019-06-01',
      isActive: true,
      
      contractorLicense: 'NC-ELE-2024-004',
      tradeSpecialties: ['electrical'],
      projectTypes: ['repair', 'renovation', 'emergency'],
      materialSources: ['Electrical Supply Co', 'Graybar', 'Rexel'],
      warrantyOffered: '3 years on labor, manufacturer warranty on materials',
      
      maxProjectValue: 25000,
      minProjectValue: 200,
      simultaneousProjects: 6,
      
      providesWrittenEstimates: true,
      estimateFee: 0,
      estimateTurnaroundDays: 1,
      acceptsInsuranceWork: true,
      financingOptions: ['Credit cards accepted', 'Payment plans available']
    }
  ];

  /**
   * Search for contractors based on criteria
   */
  static async searchContractors(criteria: ContractorSearchCriteria): Promise<ServiceSearchResult[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
      
      let results = this.MOCK_CONTRACTORS.filter(contractor => {
        // Basic filters
        if (criteria.verifiedOnly && !contractor.verified) return false;
        if (criteria.insuredOnly && contractor.insurance.length === 0) return false;
        if (criteria.minRating && contractor.overallRating < criteria.minRating) return false;
        
        // Budget filter
        if (criteria.budgetRange) {
          if (criteria.budgetRange.max < contractor.minProjectValue || 
              criteria.budgetRange.min > contractor.maxProjectValue) {
            return false;
          }
        }
        
        // Trade specialty filter
        if (criteria.tradeNeeded.length > 0) {
          const hasRequiredTrades = criteria.tradeNeeded.some(trade => 
            contractor.tradeSpecialties.includes(trade as any)
          );
          if (!hasRequiredTrades) return false;
        }
        
        // Project type filter
        if (!contractor.projectTypes.includes(criteria.projectType as any)) {
          return false;
        }
        
        // Service area filter
        if (criteria.maxDistance) {
          const distance = this.calculateDistance(contractor);
          if (distance > criteria.maxDistance) return false;
        }
        
        return true;
      });

      // Calculate match scores and distances
      const searchResults: ServiceSearchResult[] = results.map(contractor => ({
        provider: contractor,
        distance: this.calculateDistance(contractor),
        matchScore: this.calculateMatchScore(contractor, criteria),
        estimatedResponseTime: this.getEstimatedResponseTime(contractor),
        nextAvailableSlot: contractor.availability.nextAvailableDate
      }));

      // Sort by match score and rating
      searchResults.sort((a, b) => {
        const scoreA = (a.matchScore * 0.6) + (a.provider.overallRating * 20 * 0.4);
        const scoreB = (b.matchScore * 0.6) + (b.provider.overallRating * 20 * 0.4);
        return scoreB - scoreA;
      });

      return searchResults;
    } catch (error) {
      console.error('Error searching contractors:', error);
      const errorResult = errorHandlingService.handleError(error, 'ContractorSearchService.searchContractors');
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Get contractor by ID
   */
  static async getContractorById(id: string): Promise<Contractor | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return this.MOCK_CONTRACTORS.find(contractor => contractor.id === id) || null;
    } catch (error) {
      console.error('Error getting contractor:', error);
      const errorResult = errorHandlingService.handleError(error, 'ContractorSearchService.getContractorById');
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Request quote from contractor
   */
  static async requestQuote(
    contractorId: string, 
    listingId: string, 
    quoteData: Partial<ServiceQuoteRequest>
  ): Promise<ServiceQuoteRequest> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const quote: ServiceQuoteRequest = {
        id: `quote-${Date.now()}`,
        providerId: contractorId,
        listingId,
        userId: quoteData.userId || '',
        projectDescription: quoteData.projectDescription || '',
        projectType: quoteData.projectType || '',
        budgetRange: quoteData.budgetRange,
        timeframe: quoteData.timeframe || '',
        quoteStatus: 'requested',
        siteVisitRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return quote;
    } catch (error) {
      console.error('Error requesting quote:', error);
      const errorResult = errorHandlingService.handleError(error, 'ContractorSearchService.requestQuote');
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Schedule consultation with contractor
   */
  static async scheduleConsultation(
    contractorId: string, 
    listingId: string, 
    appointmentData: Partial<ServiceAppointment>
  ): Promise<ServiceAppointment> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const appointment: ServiceAppointment = {
        id: `appointment-${Date.now()}`,
        providerId: contractorId,
        listingId,
        userId: appointmentData.userId || '',
        appointmentType: 'consultation',
        scheduledDate: appointmentData.scheduledDate || '',
        scheduledTime: appointmentData.scheduledTime || '',
        estimatedDuration: 60, // 1 hour for consultation
        status: 'requested',
        contactMethod: appointmentData.contactMethod || 'phone',
        clientNotes: appointmentData.clientNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return appointment;
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      const errorResult = errorHandlingService.handleError(error, 'ContractorSearchService.scheduleConsultation');
      throw new Error(errorResult.userMessage);
    }
  }

  /**
   * Filter contractors based on additional criteria
   */
  static filterContractors(contractors: Contractor[], filters: ServiceSearchFilters): Contractor[] {
    return contractors.filter(contractor => {
      if (filters.rating && (contractor.overallRating < filters.rating.min || contractor.overallRating > filters.rating.max)) {
        return false;
      }
      
      if (filters.verified && !contractor.verified) {
        return false;
      }
      
      if (filters.insured && contractor.insurance.length === 0) {
        return false;
      }
      
      if (filters.emergency && !contractor.availability.emergencyAvailable) {
        return false;
      }
      
      if (filters.weekend && !contractor.availability.weekendAvailable) {
        return false;
      }
      
      if (filters.specialties && filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some(specialty => 
          contractor.specialties.includes(specialty)
        );
        if (!hasSpecialty) return false;
      }
      
      return true;
    });
  }

  // Helper methods
  private static calculateDistance(contractor: Contractor): number {
    // Mock distance calculation
    return Math.floor(Math.random() * 30) + 5; // 5-35 miles
  }

  private static calculateMatchScore(contractor: Contractor, criteria: ContractorSearchCriteria): number {
    let score = 50; // Base score

    // Rating bonus
    score += (contractor.overallRating - 3) * 12; // 4.5 rating = +18 points

    // Verification bonus
    if (contractor.verified) score += 10;

    // Experience bonus
    if (contractor.yearsInBusiness > 15) score += 15;
    else if (contractor.yearsInBusiness > 10) score += 10;
    else if (contractor.yearsInBusiness > 5) score += 5;

    // Budget matching
    if (criteria.budgetRange) {
      const midBudget = (criteria.budgetRange.min + criteria.budgetRange.max) / 2;
      if (midBudget >= contractor.minProjectValue && midBudget <= contractor.maxProjectValue) {
        score += 15;
      }
    }

    // Trade specialty exact match bonus
    const exactMatches = criteria.tradeNeeded.filter(trade => 
      contractor.tradeSpecialties.includes(trade as any)
    ).length;
    score += exactMatches * 5;

    // Urgency matching
    const leadTime = contractor.availability.typicalBookingLead;
    switch (criteria.urgency) {
      case 'emergency':
        if (contractor.availability.emergencyAvailable) score += 20;
        else score -= 15;
        break;
      case 'asap':
        if (leadTime <= 3) score += 15;
        else if (leadTime <= 7) score += 5;
        else score -= 5;
        break;
      case 'within-week':
        if (leadTime <= 7) score += 10;
        break;
      case 'within-month':
        if (leadTime <= 30) score += 5;
        break;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private static getEstimatedResponseTime(contractor: Contractor): string {
    const leadTime = contractor.availability.typicalBookingLead;
    
    if (leadTime === 0) return 'Same day';
    if (leadTime === 1) return 'Within 24 hours';
    if (leadTime <= 3) return 'Within 3 days';
    if (leadTime <= 7) return 'Within 1 week';
    if (leadTime <= 14) return 'Within 2 weeks';
    return `${leadTime} days lead time`;
  }

  /**
   * Create search criteria from listing data
   */
  static createSearchCriteriaFromListing(listing: Listing): Partial<ContractorSearchCriteria> {
    return {
      serviceType: 'contractor',
      listingId: listing.id,
      maxDistance: 30,
      tradeNeeded: ['general'],
      projectType: 'repair',
      budgetRange: {
        min: 1000,
        max: 25000
      },
      projectDescription: `Property improvement project for ${listing.address}`,
      urgency: 'within-month',
      verifiedOnly: true,
      insuredOnly: true,
      timeframe: '2-4 weeks'
    };
  }

  /**
   * Get recommended contractors for specific project types
   */
  static getRecommendedContractorsByTrade(trade: string): Contractor[] {
    return this.MOCK_CONTRACTORS
      .filter(contractor => contractor.tradeSpecialties.includes(trade as any))
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, 3);
  }
}