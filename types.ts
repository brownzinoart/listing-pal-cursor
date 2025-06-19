import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export interface User {
  id: string;
  email: string;
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
