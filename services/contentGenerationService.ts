import { Listing } from '../types';

interface ContentGenerationResult {
  mlsDescription: string;
  facebookPost: string;
  instagramPost: string;
  xPost: string;
  emailContent: string;
  interiorConcepts: string;
  paidAdCopy: string;
}

export class ContentGenerationService {
  constructor() {
    // Using Gemini AI backend - no API key needed in frontend
  }

  async generateMLSDescription(listing: Listing, style: string = 'professional'): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate description: ${response.status}`);
      }

      const data = await response.json();
      return data.description || '';
    } catch (error) {
      console.error('Error generating MLS description:', error);
      throw error;
    }
  }

  async generateFacebookPost(listing: Listing, style: string = 'professional'): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: 'facebook',
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate Facebook post: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error generating Facebook post:', error);
      throw error;
    }
  }

  async generateInstagramPost(listing: Listing, style: string = 'professional'): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: 'instagram',
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate Instagram post: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error generating Instagram post:', error);
      throw error;
    }
  }

  async generateXPost(listing: Listing, style: string = 'professional'): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: 'twitter', // X/Twitter
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate X post: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error generating X post:', error);
      throw error;
    }
  }

  async generateEmailContent(listing: Listing, theme: string = 'NEW_LISTING', style: string = 'professional'): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          theme: theme,
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate email content: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error generating email content:', error);
      throw error;
    }
  }

  async generateInteriorConcepts(listing: Listing, selectedImage?: string): Promise<string> {
    try {
      const response = await fetch('/api/listings/generate-flyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: listing,
          style: 'interior-concepts'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate interior concepts: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Error generating interior concepts:', error);
      throw error;
    }
  }

  async generateActualRoomRedesign(imageUrl: string, roomType: string, designStyle: string): Promise<string> {
    try {
      console.log('🎯 Sending room redesign request:', { 
        imageUrl: imageUrl.substring(0, 50) + '...', 
        roomType, 
        designStyle 
      });
      
      const response = await fetch('/api/redesign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          room_type: roomType,
          style: designStyle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Room redesign API error:', errorData);
        throw new Error(errorData.error || 'Room redesign API failed');
      }

      const result = await response.json();
      console.log('✅ Room redesign successful:', result);
      
      if (result.success && result.imageUrl) {
        return result.imageUrl;
      } else {
        throw new Error('No redesigned image received from API');
      }
    } catch (error) {
      console.error('Room redesign error:', error);
      throw error;
    }
  }

  async generatePaidAdCopy(listing: Listing, style: string = 'professional'): Promise<string> {
    try {
      // Generate structured ad campaigns and format as string for now
      const campaigns = [
        {
          platform: 'Facebook',
          objective: 'WEBSITE_TRAFFIC',
          headline: this.generateAdHeadline(listing, 'facebook', style),
          body: this.generateAdBody(listing, 'facebook', style),
          cta: 'View Listing'
        },
        {
          platform: 'LinkedIn',
          objective: 'WEBSITE_TRAFFIC', 
          headline: this.generateAdHeadline(listing, 'linkedin', style),
          body: this.generateAdBody(listing, 'linkedin', style),
          cta: 'View Property Profile'
        },
        {
          platform: 'Google',
          objective: 'WEBSITE_TRAFFIC',
          headline: this.generateAdHeadline(listing, 'google', style),
          body: this.generateAdBody(listing, 'google', style),
          cta: 'Schedule a Tour'
        }
      ];

      // Format as string for compatibility with existing system
      return JSON.stringify(campaigns);
    } catch (error) {
      console.error('Error generating paid ad campaigns:', error);
      throw error;
    }
  }

  private generateAdHeadline(listing: Listing, platform: string, style: string): string {
    const { address, bedrooms, bathrooms, price } = listing;
    const location = address.split(',').slice(-2).join(',').trim(); // Get city, state
    
    switch (platform) {
      case 'facebook':
        if (style === 'luxury') {
          return `Sparkle in the Heart of ${location.split(',')[0]}`;
        }
        return `${bedrooms}-Bed, ${bathrooms}-Bath Home in ${location.split(',')[0]}`;
      
      case 'linkedin':
        return `Luxury Investment Opportunity: $${(price / 1000).toFixed(0)}K | ${listing.squareFootage} Sqft | ${location}`;
      
      case 'google':
        return `Luxury ${bedrooms}-Bed Home in ${location.split(',')[0]} - $${(price / 1000).toFixed(0)}K`;
      
      default:
        return `${bedrooms}-Bed, ${bathrooms}-Bath Home - $${(price / 1000).toFixed(0)}K`;
    }
  }

  private generateAdBody(listing: Listing, platform: string, style: string): string {
    const { bedrooms, bathrooms, keyFeatures } = listing;
    const features = keyFeatures || 'Premium features';
    
    switch (platform) {
      case 'facebook':
        return `Imagine sipping summer nights by your very own pool, surrounded by lush greenery and a shed full of storage secrets waiting to be uncovered. This ${bedrooms}-bed, ${bathrooms}-bath haven is calling your name!`;
      
      case 'linkedin':
        return `Invest in prime real estate with this exceptional property boasting a backyard, pool, and shed storage. In a highly sought-after location, this ${bedrooms}-bedroom, ${bathrooms}-bathroom residence offers unparalleled luxury and potential for strong ROI.`;
      
      case 'google':
        return `Stunning ${bedrooms}-bed, ${bathrooms}-bath colonial with pool & shed storage. Perfect for families seeking a private oasis.`;
      
      default:
        return `Beautiful ${bedrooms}-bedroom, ${bathrooms}-bathroom home with ${features}.`;
    }
  }

  async generateAllContent(listing: Listing): Promise<ContentGenerationResult> {
    // Generate all content in parallel for maximum speed
    const [
      mlsDescription,
      facebookPost,
      instagramPost,
      xPost,
      emailContent,
      interiorConcepts,
      paidAdCopy
    ] = await Promise.all([
      this.generateMLSDescription(listing),
      this.generateFacebookPost(listing),
      this.generateInstagramPost(listing),
      this.generateXPost(listing),
      this.generateEmailContent(listing),
      this.generateInteriorConcepts(listing),
      this.generatePaidAdCopy(listing)
    ]);

    return {
      mlsDescription,
      facebookPost,
      instagramPost,
      xPost,
      emailContent,
      interiorConcepts,
      paidAdCopy
    };
  }

  // Individual generation functions for step-by-step progress
  async generateContentStep(listing: Listing, stepId: string, options?: any): Promise<string> {
    const style = options?.style || 'professional';
    
    switch (stepId) {
      case 'mls-description':
      case 'description':
        return await this.generateMLSDescription(listing, style);
      case 'facebook-post':
        return await this.generateFacebookPost(listing, style);
      case 'instagram-post':
        return await this.generateInstagramPost(listing, style);
      case 'x-post':
        return await this.generateXPost(listing, style);
      case 'email':
        return await this.generateEmailContent(listing, options?.theme || 'NEW_LISTING', style);
      case 'interior-reimagined':
        if (options?.selectedImage && options?.roomType && options?.designStyle) {
          // Generate actual room redesign image
          const redesignedImageUrl = await this.generateActualRoomRedesign(
            options.selectedImage, 
            options.roomType, 
            options.designStyle
          );
          return redesignedImageUrl;
        } else {
          // Fallback to text concepts if no image/options provided
          return await this.generateInteriorConcepts(listing, options?.selectedImage);
        }
      case 'paid-ads':
        return await this.generatePaidAdCopy(listing);
      default:
        throw new Error(`Unknown content step: ${stepId}`);
    }
  }
}

export const contentGenerationService = new ContentGenerationService(); 