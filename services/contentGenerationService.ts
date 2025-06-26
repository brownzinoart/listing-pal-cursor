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

  async generateEmailContent(listing: Listing, theme: string = 'NEW_LISTING'): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    
    const themePrompts = {
      'NEW_LISTING': 'Create a professional new listing announcement email that generates excitement about this fresh property opportunity.',
      'OPEN_HOUSE': 'Create an inviting open house invitation email that encourages attendance and creates urgency.',
      'PRICE_REDUCTION': 'Create a compelling price reduction announcement email that highlights the new value opportunity.',
      'UNDER_CONTRACT': 'Create a professional under contract notification email that maintains client relationships.',
      'EXCLUSIVE_SHOWING': 'Create an exclusive private showing invitation email for VIP clients.',
      'MARKET_UPDATE': 'Create a neighborhood market update email using this property as a market example.',
      'FOLLOW_UP': 'Create a professional follow-up email for prospects who have shown interest.',
      'COMING_SOON': 'Create a coming soon teaser email that builds anticipation for this upcoming listing.'
    };

    const messages = [
      {
        role: 'system',
        content: 'You are a professional real estate email marketing expert. Create compelling, professional emails that drive engagement and generate leads for real estate agents.'
      },
      {
        role: 'user',
        content: `${themePrompts[theme as keyof typeof themePrompts] || themePrompts['NEW_LISTING']} 

Property details: ${basePrompt}

Include:
- Compelling subject line
- Professional greeting
- Property highlights
- Clear call-to-action
- Professional signature placeholder
- Appropriate urgency and excitement for the theme

Keep it professional but engaging, around 200-300 words.`
      }
    ];

    return await this.callOpenAI(messages, 500, 0.7);
  }

  async generateInteriorConcepts(listing: Listing, selectedImage?: string): Promise<string> {
    const basePrompt = this.getBasePrompt(listing);
    
    const messages = [
      {
        role: 'system',
        content: 'You are an interior design expert creating room transformation concepts for real estate marketing.'
      },
      {
        role: 'user',
        content: `Create compelling interior design transformation concepts for: ${basePrompt}.

${selectedImage ? 
  `Based on the selected room image, create specific transformation concepts that would:` :
  `Create comprehensive design concepts that would:`
}

✨ **ENHANCE BUYER APPEAL**: Focus on trending design styles that sell
🎨 **MODERNIZE THE SPACE**: Contemporary updates that feel fresh
💰 **MAXIMIZE VALUE**: Cost-effective changes with high impact
🏡 **LIFESTYLE APPEAL**: Help buyers envision their dream lifestyle

Create 3 distinct design approaches:

1. **MODERN MINIMALIST**: Clean lines, neutral palette, open feel
2. **COZY CONTEMPORARY**: Warm textures, layered lighting, comfort-focused  
3. **LUXURY STAGING**: High-end finishes, statement pieces, aspirational

For each style, describe:
- Key color palette and mood
- Furniture placement and flow
- Lighting recommendations
- 2-3 specific affordable updates
- How it appeals to target buyers

${selectedImage ? 
  'Focus on realistic transformations that work with the existing room architecture and maximize the space\'s potential.' :
  'Create concepts that work for typical ' + listing.propertyType + ' layouts and enhance market appeal.'
}

Make it actionable for staging and help buyers visualize the transformation potential.`
      }
    ];

    return await this.callOpenAI(messages, 600, 0.7);
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
    switch (stepId) {
      case 'mls-description':
        return await this.generateMLSDescription(listing);
      case 'facebook-post':
        return await this.generateFacebookPost(listing);
      case 'instagram-post':
        return await this.generateInstagramPost(listing);
      case 'x-post':
        return await this.generateXPost(listing);
      case 'email':
        return await this.generateEmailContent(listing, options?.theme);
      case 'interior-reimagined':
        return await this.generateInteriorConcepts(listing, options?.selectedImage);
      case 'paid-ads':
        return await this.generatePaidAdCopy(listing);
      default:
        throw new Error(`Unknown content step: ${stepId}`);
    }
  }
}

export const contentGenerationService = new ContentGenerationService(); 