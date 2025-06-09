export interface PropertyData {
  address: string;
  price: string | number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  keyFeatures?: string[];
  amenities?: string[];
  neighborhood?: string;
  schoolDistrict?: string;
  yearBuilt?: number;
  lotSize?: string;
  parking?: string;
  hvac?: string;
  flooring?: string;
  appliances?: string[];
  exteriorFeatures?: string[];
  interiorFeatures?: string[];
  locationHighlights?: string[];
}

export interface ContentGenerationResponse {
  success: boolean;
  description?: string;
  content?: string;
  style: string;
  platform?: string;
  generatedAt: string;
  error?: string;
  details?: string;
}

export interface BatchContentResponse {
  success: boolean;
  description: string;
  socialContent: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  flyerContent: string;
  emailContent: string;
  style: string;
  generatedAt: string;
  error?: string;
  details?: string;
}

export type WritingStyle = 'professional' | 'luxury' | 'casual' | 'modern' | 'family';
export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter';

export class ContentGenerationService {
  private static baseURL = '/api/listings';

  static async generateDescription(propertyData: PropertyData, style: WritingStyle = 'professional'): Promise<ContentGenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData, style })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      return await response.json();
    } catch (error) {
      console.error('Description generation error:', error);
      throw error;
    }
  }

  static async generateSocialContent(
    propertyData: PropertyData, 
    platform: SocialPlatform, 
    style: WritingStyle = 'professional'
  ): Promise<ContentGenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData, platform, style })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${platform} content`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${platform} generation error:`, error);
      throw error;
    }
  }

  static async generateEmailContent(propertyData: PropertyData, style: WritingStyle = 'professional'): Promise<ContentGenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData, style })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate email content');
      }

      return await response.json();
    } catch (error) {
      console.error('Email generation error:', error);
      throw error;
    }
  }

  static async generateFlyerContent(propertyData: PropertyData, style: WritingStyle = 'professional'): Promise<ContentGenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-flyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData, style })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flyer content');
      }

      return await response.json();
    } catch (error) {
      console.error('Flyer generation error:', error);
      throw error;
    }
  }

  static async generateAllContent(
    propertyData: PropertyData, 
    style: WritingStyle = 'professional',
    platforms: SocialPlatform[] = ['facebook', 'instagram', 'linkedin', 'twitter']
  ): Promise<BatchContentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-all-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          propertyData, 
          style,
          platforms
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate all content');
      }

      return await response.json();
    } catch (error) {
      console.error('Batch generation error:', error);
      throw error;
    }
  }

  /**
   * Utility method to convert form data to PropertyData format
   */
  static formatPropertyData(listingData: any): PropertyData {
    return {
      address: listingData.address || '',
      price: listingData.price || '',
      bedrooms: listingData.bedrooms || 0,
      bathrooms: listingData.bathrooms || 0,
      squareFootage: listingData.squareFootage || 0,
      propertyType: listingData.propertyType || 'Single Family Home',
      keyFeatures: listingData.keyFeatures ? 
        (Array.isArray(listingData.keyFeatures) ? 
          listingData.keyFeatures : 
          listingData.keyFeatures.split('\n').filter((f: string) => f.trim())
        ) : [],
      amenities: listingData.amenities || [],
      neighborhood: listingData.neighborhood || '',
      schoolDistrict: listingData.schoolDistrict || '',
      yearBuilt: listingData.yearBuilt || new Date().getFullYear(),
      lotSize: listingData.lotSize || '',
      parking: listingData.parking || '',
      hvac: listingData.hvac || '',
      flooring: listingData.flooring || '',
      appliances: listingData.appliances || [],
      exteriorFeatures: listingData.exteriorFeatures || [],
      interiorFeatures: listingData.interiorFeatures || [],
      locationHighlights: listingData.locationHighlights || []
    };
  }

  /**
   * Get available writing styles with descriptions
   */
  static getWritingStyles(): { value: WritingStyle; label: string; description: string }[] {
    return [
      {
        value: 'professional',
        label: 'Professional',
        description: 'Industry-standard, informative, and authoritative. Focuses on facts and investment value.'
      },
      {
        value: 'luxury',
        label: 'Luxury',
        description: 'Sophisticated and aspirational. Emphasizes exclusivity, prestige, and premium lifestyle.'
      },
      {
        value: 'casual',
        label: 'Casual',
        description: 'Friendly and conversational. Focuses on comfort, livability, and everyday benefits.'
      },
      {
        value: 'modern',
        label: 'Modern',
        description: 'Clean and contemporary. Emphasizes innovation, efficiency, and sleek design.'
      },
      {
        value: 'family',
        label: 'Family-Focused',
        description: 'Warm and nurturing. Emphasizes safety, community, and spaces for family activities.'
      }
    ];
  }

  /**
   * Get platform-specific content guidelines
   */
  static getPlatformGuidelines(): Record<SocialPlatform, { charLimit: number; tone: string; features: string }> {
    return {
      facebook: {
        charLimit: 500,
        tone: 'Engaging and community-focused',
        features: 'Use emojis strategically, encourage engagement, include call-to-action'
      },
      instagram: {
        charLimit: 300,
        tone: 'Visual and lifestyle-focused',
        features: 'Hashtag-friendly, emoji-heavy, lifestyle appeal'
      },
      linkedin: {
        charLimit: 400,
        tone: 'Professional and investment-focused',
        features: 'Business value, market insights, professional language'
      },
      twitter: {
        charLimit: 280,
        tone: 'Concise and engaging',
        features: 'Punchy, immediate impact, relevant hashtags'
      }
    };
  }
} 