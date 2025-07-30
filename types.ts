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
  category: "modern" | "classic" | "luxury" | "minimal";
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
  status?: "active" | "sold" | "pending" | "withdrawn" | "coming_soon";
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
  type: "buyer" | "seller" | "agent" | "attorney";
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
  financingType:
    | "cash"
    | "conventional"
    | "fha"
    | "va"
    | "usda"
    | "seller"
    | "other";
  loanAmount?: number;
  closingCostsPaidBy: "buyer" | "seller" | "split";
  sellerContribution?: number;
  homeWarranty?: {
    included: boolean;
    cost?: number;
    paidBy?: "buyer" | "seller";
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
  type: "inspection" | "financing" | "appraisal" | "sale" | "other";
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
  propertyCondition: "as-is" | "inspection-repairs" | "seller-representations";
  knownDefects?: string[];
  // Disclosures
  leadPaintDisclosure?: boolean; // required for pre-1978
  propertyDisclosureProvided?: boolean; // NC requirement
  mineralRightsIncluded?: boolean; // NC specific
}

export interface ContractAddendum {
  type:
    | "backup"
    | "short-sale"
    | "fha-va"
    | "new-construction"
    | "hoa"
    | "custom";
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
  status: "draft" | "pending" | "executed" | "terminated" | "expired";
  contractType: "purchase" | "lease" | "listing" | "buyer-representation";
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

export type AuthFormMode = "login" | "signup";

export enum AlertType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
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
  icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & RefAttributes<SVGSVGElement>
  >; // Heroicon type
}

export type DesignIdea = {
  // ... existing code ...
};
