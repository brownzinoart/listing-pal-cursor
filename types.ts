import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export interface User {
  id: string;
  email: string;
}

export interface AgentProfile {
  name: string;
  email: string;
  phone: string;
  website?: string;
  photoUrl?: string;
  licenseNumber?: string;
  brokerage?: string;
}

export interface ListingImage {
  id: string; // a unique id for the image itself, e.g. for key prop
  url: string; // base64 data URL
  name?: string; // original file name, optional
  isRedesign?: boolean; // flag if the image is AI-generated redesign
  originalImageUrl?: string; // if redesign, reference to original
}

export interface FlyerTemplate {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'luxury' | 'minimal';
  thumbnail: string;
  description: string;
}

export interface FlyerCustomization {
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  agentPhoto?: string;
  customText?: string;
  backgroundImage?: string;
}

export interface GeneratedFlyer {
  id: string;
  templateId: string;
  customization: FlyerCustomization;
  imageUrl: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt: number;
  price: number;
  keyFeatures: string;
  images: ListingImage[]; 
  propertyType?: string;
  listingType?: string; // 'sale' or 'rental' 
  status?: 'active' | 'sold' | 'pending' | 'withdrawn' | 'coming_soon';
  createdAt?: string;
  updatedAt?: string;
  generatedDescription?: string;
  generatedFacebookPost?: string;
  generatedInstagramCaption?: string;
  generatedXPost?: string;
  generatedEmail?: string;
  // For AI Room Redesign
  generatedRoomDesigns?: {
    originalImageUrl: string;
    styleId: string;
    redesignedImageUrl: string;
    prompt?: string;
    createdAt?: string;
  }[];
  // For Flyer Generator
  generatedFlyers?: GeneratedFlyer[];
  // Add a new field for generated ad copy
  generatedAdCopy?: {
    platform: string;
    objective: string;
    headline: string;
    body: string;
    cta: string;
  }[];
  neighborhoodSections?: string[];
}

// Contract Types
export interface ContractParty {
  id: string;
  type: 'buyer' | 'seller' | 'agent' | 'attorney';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Agent specific
  licenseNumber?: string;
  brokerage?: string;
  brokerageLicense?: string;
  // Attorney specific (required in NC)
  barNumber?: string;
  firm?: string;
}

export interface ContractFinancials {
  purchasePrice: number;
  earnestMoneyDeposit: number;
  earnestMoneyDueDate?: string;
  earnestMoneyHolder?: string; // escrow agent
  downPaymentAmount?: number;
  downPaymentPercentage?: number;
  financingType: 'cash' | 'conventional' | 'fha' | 'va' | 'usda' | 'seller' | 'other';
  loanAmount?: number;
  closingCostsPaidBy: 'buyer' | 'seller' | 'split';
  sellerContribution?: number;
  homeWarranty?: {
    included: boolean;
    cost?: number;
    paidBy?: 'buyer' | 'seller';
    company?: string;
  };
}

export interface ContractDates {
  offerDate: string;
  offerExpirationDate: string;
  dueDiligenceDeadline?: string; // NC specific
  closingDate: string;
  possessionDate: string;
  possessionTime?: string;
  // Contingency dates
  inspectionDeadline?: string;
  financingDeadline?: string;
  appraisalDeadline?: string;
  saleOfBuyerPropertyDeadline?: string;
}

export interface ContractContingency {
  type: 'inspection' | 'financing' | 'appraisal' | 'sale' | 'other';
  included: boolean;
  deadline?: string;
  details?: string;
  // Inspection specific
  inspectionTypes?: string[]; // general, pest, radon, etc.
  repairLimit?: number;
  // Financing specific
  loanType?: string;
  interestRate?: number;
  // Sale of buyer property specific
  propertyAddress?: string;
  expectedSaleDate?: string;
}

export interface ContractProperty {
  // Auto-filled from listing
  listingId?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  legalDescription?: string;
  parcelId?: string;
  // Included/Excluded items
  includedItems: string[];
  excludedItems: string[];
  // Condition
  propertyCondition: 'as-is' | 'inspection-repairs' | 'seller-representations';
  knownDefects?: string[];
  // Disclosures
  leadPaintDisclosure?: boolean; // required for pre-1978
  propertyDisclosureProvided?: boolean; // NC requirement
  mineralRightsIncluded?: boolean; // NC specific
}

export interface ContractAddendum {
  type: 'backup' | 'short-sale' | 'fha-va' | 'new-construction' | 'hoa' | 'custom';
  included: boolean;
  details?: string;
}

export interface ContractTemplate {
  id: string;
  state: string;
  name: string;
  version: string;
  effectiveDate: string;
  sections: ContractSection[];
  requiredAddenda?: string[];
  standardClauses: ContractClause[];
}

export interface ContractSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  content: string;
  editableFields: string[];
}

export interface ContractClause {
  id: string;
  title: string;
  category: string;
  content: string;
  isStandard: boolean;
  stateSpecific?: string[];
}

export interface Contract {
  id: string;
  userId: string;
  listingId?: string;
  templateId: string;
  state: string;
  status: 'draft' | 'pending' | 'executed' | 'terminated' | 'expired';
  contractType: 'purchase' | 'lease' | 'listing' | 'buyer-representation';
  // Parties
  buyers: ContractParty[];
  sellers: ContractParty[];
  listingAgent?: ContractParty;
  sellingAgent?: ContractParty;
  buyerAttorney?: ContractParty; // Required in NC
  sellerAttorney?: ContractParty;
  // Terms
  financials: ContractFinancials;
  dates: ContractDates;
  property: ContractProperty;
  contingencies: ContractContingency[];
  // Additional terms
  specialStipulations?: string[];
  additionalTerms?: string;
  addenda: ContractAddendum[];
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  version: number;
  // Signatures
  signatureStatus?: {
    party: string;
    signed: boolean;
    signedDate?: string;
    ipAddress?: string;
  }[];
  // Generated documents
  pdfUrl?: string;
  docxUrl?: string;
}

export type AuthFormMode = 'login' | 'signup';

export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
}

export interface AiWorkflowTool {
  id: string;
  name: string;
  pathSuffix?: string; 
  enabled: boolean; 
}

export interface AiDesignStyle {
  id: string;
  name: string;
  description: string;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>; // Heroicon type
}

export type DesignIdea = {
  // ... existing code ...
};

// Service Provider Types (Inspector & Contractor Search)

export interface ServiceProviderReview {
  id: string;
  providerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verified: boolean;
  projectType?: string;
  helpfulCount?: number;
}

export interface ServiceProviderCertification {
  id: string;
  name: string;
  issuingBody: string;
  certificationNumber?: string;
  issueDate: string;
  expirationDate?: string;
  verified: boolean;
}

export interface ServiceProviderInsurance {
  type: 'general-liability' | 'professional-liability' | 'workers-comp' | 'bonded';
  carrier: string;
  policyNumber?: string;
  coverageAmount: number;
  expirationDate: string;
  verified: boolean;
}

export interface ServiceProviderPortfolioItem {
  id: string;
  title: string;
  description: string;
  beforeImages?: string[];
  afterImages?: string[];
  completionDate: string;
  projectValue?: number;
  projectDuration?: string; // e.g., "2 weeks"
  clientTestimonial?: string;
}

export interface ServiceProviderAvailability {
  nextAvailableDate: string;
  typicalBookingLead: number; // days
  workingHours: {
    monday?: { start: string; end: string; };
    tuesday?: { start: string; end: string; };
    wednesday?: { start: string; end: string; };
    thursday?: { start: string; end: string; };
    friday?: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
  };
  emergencyAvailable: boolean;
  weekendAvailable: boolean;
}

export interface ServiceProvider {
  id: string;
  type: 'inspector' | 'contractor';
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: number; // miles
  latitude?: number;
  longitude?: number;
  
  // Business info
  businessLicense: string;
  yearsInBusiness: number;
  employeeCount?: number;
  businessType: 'sole-proprietorship' | 'llc' | 'corporation' | 'partnership';
  
  // Ratings and reviews
  overallRating: number; // 1-5, calculated average
  totalReviews: number;
  reviews: ServiceProviderReview[];
  
  // Certifications and insurance
  certifications: ServiceProviderCertification[];
  insurance: ServiceProviderInsurance[];
  
  // Availability and pricing
  availability: ServiceProviderAvailability;
  hourlyRate?: number;
  minimumCharge?: number;
  
  // Portfolio and past work
  portfolio: ServiceProviderPortfolioItem[];
  
  // Service-specific fields (will be extended by Inspector/Contractor)
  specialties: string[];
  serviceAreas: string[]; // cities/counties served
  
  // Metadata
  verified: boolean;
  lastUpdated: string;
  joinedDate: string;
  isActive: boolean;
}

// Inspector-specific types
export interface Inspector extends ServiceProvider {
  type: 'inspector';
  inspectorLicense: string;
  inspectionTypes: ('general' | 'pest' | 'termite' | 'radon' | 'mold' | 'lead' | 'asbestos' | 'septic' | 'well-water' | 'structural' | 'electrical' | 'plumbing' | 'hvac' | 'roof' | 'foundation' | 'pool' | 'commercial')[];
  equipmentOwned: string[]; // thermal camera, moisture meter, etc.
  reportTurnaroundHours: number; // typical hours to deliver report
  sampleReportUrl?: string;
  associatedRepairCompanies?: string[]; // contractor IDs for referrals
  
  // Pricing specifics
  standardInspectionFee: number;
  additionalServiceFees: {
    serviceName: string;
    fee: number;
  }[];
  squareFootagePricing?: {
    basePrice: number;
    perSquareFoot: number;
    maxSquareFootage: number;
  };
}

// Contractor-specific types
export interface Contractor extends ServiceProvider {
  type: 'contractor';
  contractorLicense: string;
  tradeSpecialties: ('general' | 'electrical' | 'plumbing' | 'hvac' | 'roofing' | 'flooring' | 'painting' | 'drywall' | 'carpentry' | 'masonry' | 'landscaping' | 'fencing' | 'windows' | 'doors' | 'kitchen' | 'bathroom' | 'basement' | 'deck' | 'siding' | 'insulation' | 'demolition')[];
  projectTypes: ('repair' | 'renovation' | 'new-construction' | 'remodel' | 'maintenance' | 'emergency')[];
  materialSources: string[]; // where they source materials
  warrantyOffered: string; // warranty terms
  bondedAmount?: number;
  
  // Project capabilities
  maxProjectValue: number;
  minProjectValue: number;
  simultaneousProjects: number;
  
  // Pricing and quotes
  providesWrittenEstimates: boolean;
  estimateFee: number; // fee for estimates, 0 if free
  estimateTurnaroundDays: number;
  acceptsInsuranceWork: boolean;
  financingOptions?: string[];
}

// Search and filter types
export interface ServiceSearchCriteria {
  serviceType: 'inspector' | 'contractor';
  listingId?: string;
  urgency: 'emergency' | 'asap' | 'within-week' | 'within-month' | 'flexible';
  maxDistance: number; // miles from property
  
  // Common filters
  minRating?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  insuredOnly?: boolean;
  availableWithin?: number; // days
}

export interface InspectorSearchCriteria extends ServiceSearchCriteria {
  serviceType: 'inspector';
  inspectionTypes: string[];
  propertyType: 'residential' | 'commercial';
  propertyAge?: number; // years
  squareFootage?: number;
  urgentIssues?: string[]; // specific concerns to address
}

export interface ContractorSearchCriteria extends ServiceSearchCriteria {
  serviceType: 'contractor';
  tradeNeeded: string[];
  projectType: 'repair' | 'renovation' | 'new-construction' | 'remodel' | 'maintenance' | 'emergency';
  budgetRange: {
    min: number;
    max: number;
  };
  projectDescription: string;
  materialsProvided?: boolean; // client providing materials
  permitRequired?: boolean;
  timeframe: string; // desired completion timeframe
}

// Booking and appointment types
export interface ServiceAppointment {
  id: string;
  providerId: string;
  listingId: string;
  userId: string;
  
  appointmentType: 'inspection' | 'consultation' | 'estimate' | 'work-start';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // minutes
  
  status: 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  
  // Contact preferences
  contactMethod: 'phone' | 'email' | 'text';
  clientNotes?: string;
  providerNotes?: string;
  
  // Pricing (for estimates/quotes)
  estimatedCost?: number;
  finalCost?: number;
  
  // Results (for inspections)
  reportUrl?: string;
  issuesFound?: string[];
  recommendedActions?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ServiceQuoteRequest {
  id: string;
  providerId: string;
  listingId: string;
  userId: string;
  
  projectDescription: string;
  projectType: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  timeframe: string;
  
  // Quote details
  quoteStatus: 'requested' | 'in-progress' | 'provided' | 'accepted' | 'declined' | 'expired';
  quotedAmount?: number;
  quoteDetails?: string;
  quoteValidUntil?: string;
  
  // Appointment scheduling
  siteVisitRequired: boolean;
  siteVisitScheduled?: string;
  
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

// Search result types
export interface ServiceSearchResult {
  provider: ServiceProvider;
  distance: number; // miles from property
  matchScore: number; // 0-100, how well they match criteria
  estimatedResponseTime: string; // "within 2 hours", "same day", etc.
  nextAvailableSlot?: string;
}

export interface ServiceSearchFilters {
  rating?: { min: number; max: number; };
  pricing?: { min: number; max: number; };
  distance?: { max: number; };
  availability?: { withinDays: number; };
  certifications?: string[];
  specialties?: string[];
  verified?: boolean;
  insured?: boolean;
  emergency?: boolean;
  weekend?: boolean;
}
