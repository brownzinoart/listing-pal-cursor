import { Listing } from '../types';

interface ContentGenerationResult {
  mlsDescription: string;
  facebookPost: string;
  instagramPost: string;
  xPost: string;
  interiorConcepts: string;
  paidAdCopy: string;
}

export class ContentGenerationService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Content generation may fail.');
    }
  }

  private async callOpenAI(messages: any[], maxTokens: number = 400, temperature: number = 0.7): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI API error: ${response.status}`, errorData);
        throw new Error(`OpenAI API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  private getBasePrompt(listing: Listing): string {
    return `Property: ${listing.address}, ${listing.bedrooms}bed/${listing.bathrooms}bath, ${listing.squareFootage}sqft, $${listing.price.toLocaleString()}. Features: ${listing.keyFeatures}`;
  }

  async generateMLSDescription(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are a professional real estate copywriter specializing in MLS property descriptions. Write compelling, professional descriptions that highlight key selling points and appeal to potential buyers.'
      },
      {
        role: 'user',
        content: `Write a professional MLS property description for: ${basePrompt}. Make it compelling and highlight key selling points. Keep it under 300 words and make it sound professional and informative.`
      }
    ];

    return await this.callOpenAI(messages, 400, 0.7);
  }

  async generateFacebookPost(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are a social media expert creating engaging Facebook posts for real estate. Focus on emotional appeal and lifestyle benefits.'
      },
      {
        role: 'user',
        content: `Create an engaging Facebook post for: ${basePrompt}. Make it emotional and lifestyle-focused. Include relevant hashtags and appeal to potential buyers\' dreams and aspirations.`
      }
    ];

    return await this.callOpenAI(messages, 300, 0.8);
  }

  async generateInstagramPost(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are a social media expert creating Instagram captions for real estate. Use emojis, hashtags, and visual language.'
      },
      {
        role: 'user',
        content: `Create a visual-focused Instagram caption for: ${basePrompt}. Use emojis and relevant hashtags. Make it aspirational and lifestyle-focused. Focus on the visual appeal and lifestyle benefits.`
      }
    ];

    return await this.callOpenAI(messages, 250, 0.9);
  }

  async generateXPost(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are a social media expert creating concise X (Twitter) posts for real estate. Keep posts under 280 characters.'
      },
      {
        role: 'user',
        content: `Create a concise X/Twitter post for: ${basePrompt}. Keep it under 280 characters. Make it punchy and include relevant hashtags. Focus on the most compelling selling point.`
      }
    ];

    return await this.callOpenAI(messages, 150, 0.8);
  }

  async generateInteriorConcepts(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are an interior design expert creating room transformation concepts that will appeal to potential home buyers.'
      },
      {
        role: 'user',
        content: `Create interior design transformation concepts for: ${basePrompt}. Describe 3 different design styles (e.g., Modern Minimalist, Cozy Traditional, Contemporary Luxury) that would enhance the space and appeal to buyers. Focus on how each style would transform the key living areas.`
      }
    ];

    return await this.callOpenAI(messages, 400, 0.7);
  }

  async generatePaidAdCopy(listing: Listing): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    const messages = [
      {
        role: 'system',
        content: 'You are a digital marketing expert creating paid ad campaigns for real estate. Create compelling ad copy that drives clicks and leads.'
      },
      {
        role: 'user',
        content: `Create ad copy for Facebook/IG, LinkedIn, and Google Ads for: ${basePrompt}. For each platform, include:
        
FACEBOOK/INSTAGRAM:
- Headline (max 25 characters)
- Primary text (max 125 characters)
- Call-to-action

LINKEDIN:
- Headline (max 25 characters)  
- Description (max 75 characters)
- Call-to-action

GOOGLE ADS:
- Headline 1 (max 30 characters)
- Headline 2 (max 30 characters)
- Description (max 90 characters)

Focus on the most compelling selling points and strong calls-to-action.`
      }
    ];

    return await this.callOpenAI(messages, 500, 0.7);
  }

  async generateAllContent(listing: Listing): Promise<ContentGenerationResult> {
    // Generate all content in parallel for maximum speed
    const [
      mlsDescription,
      facebookPost,
      instagramPost,
      xPost,
      interiorConcepts,
      paidAdCopy
    ] = await Promise.all([
      this.generateMLSDescription(listing),
      this.generateFacebookPost(listing),
      this.generateInstagramPost(listing),
      this.generateXPost(listing),
      this.generateInteriorConcepts(listing),
      this.generatePaidAdCopy(listing)
    ]);

    return {
      mlsDescription,
      facebookPost,
      instagramPost,
      xPost,
      interiorConcepts,
      paidAdCopy
    };
  }

  // Individual generation functions for step-by-step progress
  async generateContentStep(listing: Listing, stepId: string): Promise<string> {
    switch (stepId) {
      case 'mls-description':
        return await this.generateMLSDescription(listing);
      case 'facebook-post':
        return await this.generateFacebookPost(listing);
      case 'instagram-post':
        return await this.generateInstagramPost(listing);
      case 'x-post':
        return await this.generateXPost(listing);
      case 'interior-reimagined':
        return await this.generateInteriorConcepts(listing);
      case 'paid-ads':
        return await this.generatePaidAdCopy(listing);
      default:
        throw new Error(`Unknown content step: ${stepId}`);
    }
  }
}

export const contentGenerationService = new ContentGenerationService(); 