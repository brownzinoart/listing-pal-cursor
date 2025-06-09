import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Main property description generation method
  async generatePropertyDescription(propertyData, style = 'professional') {
    try {
      const prompt = this.buildPropertyDescriptionPrompt(propertyData, style);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate property description');
    }
  }

  // Build comprehensive prompt based on property data and style
  buildPropertyDescriptionPrompt(propertyData, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      squareFootage,
      propertyType,
      keyFeatures = [],
      amenities = [],
      neighborhood = '',
      schoolDistrict = '',
      yearBuilt,
      lotSize,
      parking,
      hvac,
      flooring,
      appliances = [],
      exteriorFeatures = [],
      interiorFeatures = [],
      locationHighlights = []
    } = propertyData;

    // Style-specific tone and approach - Updated to match UI
    const styleGuides = {
      professional: {
        tone: "Professional, informative, and straightforward. Use industry terminology appropriately. Focus on facts, features, and investment value.",
        language: "Clear and authoritative language that builds confidence. Emphasize quality, value, and practical benefits.",
        structure: "Lead with key selling points, followed by detailed features, then location benefits.",
        keyWords: "exceptional, quality, value, features, benefits, opportunity, well-maintained, desirable"
      },
      luxury: {
        tone: "Sophisticated, elegant, and aspirational. Use refined vocabulary and emphasize exclusivity, prestige, and premium lifestyle.",
        language: "Elevated language with words like 'exceptional,' 'exquisite,' 'bespoke,' 'prestigious.' Focus on lifestyle and status.",
        structure: "Begin with lifestyle vision, highlight unique luxury features, emphasize exclusivity and prestige.",
        keyWords: "exquisite, bespoke, prestigious, exclusive, sophisticated, refined, curated, extraordinary"
      },
      'family-friendly': {
        tone: "Warm, nurturing, and focused on family life. Emphasize safety, comfort, community, and spaces for family activities.",
        language: "Heartwarming language focusing on family memories, safety, and growth. Use words like 'perfect for,' 'ideal,' 'wonderful.'",
        structure: "Begin with family lifestyle vision, highlight family-friendly features, emphasize community and schools.",
        keyWords: "perfect for families, safe, comfortable, spacious, welcoming, memories, growing, community"
      },
      modern: {
        tone: "Clean, contemporary, and forward-thinking. Emphasize innovation, efficiency, and sleek design. Use crisp, confident language.",
        language: "Streamlined vocabulary focusing on design, technology, and contemporary living. Emphasize clean lines and functionality.",
        structure: "Lead with design innovation, highlight modern features and technology, emphasize contemporary lifestyle.",
        keyWords: "contemporary, sleek, innovative, efficient, streamlined, cutting-edge, sophisticated, minimalist"
      },
      investment: {
        tone: "ROI-focused, analytical, and business-oriented. Emphasize financial potential, market position, and investment returns.",
        language: "Data-driven language focusing on market value, appreciation potential, rental income, and financial benefits.",
        structure: "Lead with investment opportunity, highlight financial benefits, emphasize market positioning and growth potential.",
        keyWords: "ROI, investment opportunity, appreciation potential, market value, cash flow, rental income, financial returns"
      }
    };

    const currentStyle = styleGuides[style.toLowerCase()] || styleGuides.professional;

    return `You are an expert real estate copywriter generating a compelling property description. 

PROPERTY DETAILS:
- Address: ${address}
- Price: ${price}
- Property Type: ${propertyType}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Square Footage: ${squareFootage} sq ft
- Year Built: ${yearBuilt}
- Lot Size: ${lotSize}
- Parking: ${parking}

KEY FEATURES PROVIDED:
${keyFeatures.length > 0 ? keyFeatures.map(feature => `- ${feature}`).join('\n') : 'No specific key features provided'}

AMENITIES:
${amenities.length > 0 ? amenities.map(amenity => `- ${amenity}`).join('\n') : 'Standard amenities'}

INTERIOR FEATURES:
${interiorFeatures.length > 0 ? interiorFeatures.map(feature => `- ${feature}`).join('\n') : 'Standard interior features'}

EXTERIOR FEATURES:
${exteriorFeatures.length > 0 ? exteriorFeatures.map(feature => `- ${feature}`).join('\n') : 'Standard exterior features'}

APPLIANCES INCLUDED:
${appliances.length > 0 ? appliances.map(appliance => `- ${appliance}`).join('\n') : 'Standard appliances'}

LOCATION HIGHLIGHTS:
${locationHighlights.length > 0 ? locationHighlights.map(highlight => `- ${highlight}`).join('\n') : 'Great location'}

HVAC: ${hvac || 'Central air and heating'}
FLOORING: ${flooring || 'Mixed flooring throughout'}
NEIGHBORHOOD: ${neighborhood}
SCHOOL DISTRICT: ${schoolDistrict}

WRITING STYLE: ${style.toUpperCase()}
TONE: ${currentStyle.tone}
LANGUAGE APPROACH: ${currentStyle.language}
STRUCTURE: ${currentStyle.structure}
KEY VOCABULARY: ${currentStyle.keyWords}

STYLE-SPECIFIC INSTRUCTIONS FOR ${style.toUpperCase()}:
${this.getStyleSpecificInstructions(style)}

GENERAL INSTRUCTIONS:
1. Generate a compelling property description that matches the ${style} style perfectly
2. Incorporate ALL provided key features naturally into the description
3. Use the specific tone and language approach for the ${style} style
4. Structure the description according to the ${style} guidelines
5. Length: 3-4 well-developed paragraphs (250-350 words)
6. Make it engaging and persuasive for the target audience
7. Include location benefits and lifestyle advantages
8. End with a compelling call-to-action appropriate for the style

AVOID:
- Generic or template language
- Repetitive phrasing
- Overlooking any provided key features
- Inconsistent tone with the selected style
- Overly promotional language that feels fake

Generate a description that feels authentic, incorporates all the property details, and perfectly matches the ${style} writing style:`;
  }

  // Get style-specific instructions
  getStyleSpecificInstructions(style) {
    const instructions = {
      professional: `
- Use industry-standard terminology and formal language
- Focus on facts, specifications, and practical benefits
- Emphasize quality construction and value proposition
- Include market positioning and competitive advantages
- Appeal to serious buyers and real estate professionals`,
      
      luxury: `
- Use sophisticated, elevated vocabulary throughout
- Emphasize exclusivity, prestige, and premium lifestyle
- Focus on unique features and bespoke elements
- Create aspiration and desire for high-end living
- Appeal to affluent buyers seeking luxury experiences`,
      
      'family-friendly': `
- Use warm, welcoming language that evokes home and comfort
- Emphasize safety, space for children, and family activities
- Highlight community features and school quality
- Focus on creating memories and growing together
- Appeal to families with children of all ages`,
      
      modern: `
- Use clean, contemporary language with architectural terms
- Emphasize design innovation and contemporary features
- Focus on efficiency, functionality, and sleek aesthetics
- Highlight smart home technology and modern conveniences
- Appeal to design-conscious and tech-savvy buyers`,
      
      investment: `
- Use financial and business terminology
- Emphasize ROI, cash flow, and appreciation potential
- Include market analysis and comparable sales data when relevant
- Focus on rental income potential and tax benefits
- Appeal to investors, flippers, and financially-motivated buyers`
    };

    return instructions[style.toLowerCase()] || instructions.professional;
  }

  // Generate social media content with style consistency
  async generateSocialMediaContent(propertyData, platform, style = 'professional') {
    try {
      const prompt = this.buildSocialMediaPrompt(propertyData, platform, style);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Social Media Generation Error:', error);
      throw new Error(`Failed to generate ${platform} content`);
    }
  }

  buildSocialMediaPrompt(propertyData, platform, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      propertyType,
      keyFeatures = []
    } = propertyData;

    const platformSpecs = {
      facebook: {
        charLimit: 500,
        tone: "Engaging and community-focused",
        features: "Use emojis strategically, encourage engagement, include call-to-action"
      },
      instagram: {
        charLimit: 300,
        tone: "Visual and lifestyle-focused",
        features: "Hashtag-friendly, emoji-heavy, lifestyle appeal"
      },
      linkedin: {
        charLimit: 400,
        tone: "Professional and investment-focused",
        features: "Business value, market insights, professional language"
      },
      twitter: {
        charLimit: 280,
        tone: "Concise and engaging",
        features: "Punchy, immediate impact, relevant hashtags"
      }
    };

    const spec = platformSpecs[platform];

    return `Create a ${platform} post for this property listing that matches the ${style} writing style.

PROPERTY DETAILS:
- ${propertyType} at ${address}
- ${bedrooms} bed, ${bathrooms} bath
- Price: ${price}
- Key Features: ${keyFeatures.join(', ')}

PLATFORM: ${platform.toUpperCase()}
CHARACTER LIMIT: ${spec.charLimit}
PLATFORM TONE: ${spec.tone}
PLATFORM FEATURES: ${spec.features}
WRITING STYLE: ${style}

STYLE-SPECIFIC APPROACH:
${this.getSocialMediaStyleApproach(style)}

Generate a compelling ${platform} post that:
1. Stays under ${spec.charLimit} characters
2. Matches the ${style} writing style perfectly
3. Incorporates key property features
4. Uses platform-appropriate formatting
5. Includes relevant emojis and hashtags for ${platform}
6. Has a clear call-to-action
7. Appeals to the target audience for ${style} style

Make it engaging and shareable while maintaining the ${style} tone throughout.`;
  }

  // Get social media style-specific approaches
  getSocialMediaStyleApproach(style) {
    const approaches = {
      professional: "Use professional language, focus on facts and value, appeal to serious buyers",
      luxury: "Use sophisticated language, emphasize exclusivity and premium lifestyle",
      'family-friendly': "Use warm, welcoming language, focus on family benefits and community",
      modern: "Use clean, contemporary language, highlight design and innovation",
      investment: "Use financial terminology, focus on ROI and investment potential"
    };

    return approaches[style.toLowerCase()] || approaches.professional;
  }

  // Generate listing flyer content
  async generateFlyerContent(propertyData, style = 'professional') {
    try {
      const prompt = this.buildFlyerPrompt(propertyData, style);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Flyer Generation Error:', error);
      throw new Error('Failed to generate flyer content');
    }
  }

  buildFlyerPrompt(propertyData, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      squareFootage,
      keyFeatures = [],
      amenities = []
    } = propertyData;

    return `Generate compelling flyer content for this property in ${style} style:

PROPERTY: ${bedrooms} bed, ${bathrooms} bath ${propertyData.propertyType}
ADDRESS: ${address}
PRICE: ${price}
SIZE: ${squareFootage} sq ft
KEY FEATURES: ${keyFeatures.join(', ')}
AMENITIES: ${amenities.join(', ')}

FLYER STYLE: ${style}

STYLE-SPECIFIC REQUIREMENTS:
${this.getFlyerStyleRequirements(style)}

Generate:
1. Compelling headline (8-12 words) - ${style} style
2. Brief description (50-75 words) - ${style} tone
3. 5-7 key selling points (bullet format) - ${style} focus
4. Call-to-action phrase - ${style} approach

Keep content concise, impactful, and perfect for print/digital flyers.
Match the ${style} tone throughout all content sections.`;
  }

  // Get flyer style-specific requirements
  getFlyerStyleRequirements(style) {
    const requirements = {
      professional: "Focus on facts, value, and professional appeal",
      luxury: "Emphasize exclusivity, prestige, and premium features",
      'family-friendly': "Highlight family benefits, safety, and community",
      modern: "Focus on contemporary design and innovation",
      investment: "Emphasize financial benefits and ROI potential"
    };

    return requirements[style.toLowerCase()] || requirements.professional;
  }

  // Generate email campaign content
  async generateEmailContent(propertyData, style = 'professional') {
    try {
      const prompt = this.buildEmailPrompt(propertyData, style);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Email Generation Error:', error);
      throw new Error('Failed to generate email content');
    }
  }

  buildEmailPrompt(propertyData, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      squareFootage,
      propertyType,
      keyFeatures = [],
      amenities = []
    } = propertyData;

    return `Generate a compelling email campaign for this property listing in ${style} style:

PROPERTY DETAILS:
- ${propertyType} at ${address}
- ${bedrooms} bed, ${bathrooms} bath
- ${squareFootage} sq ft
- Price: ${price}
- Key Features: ${keyFeatures.join(', ')}
- Amenities: ${amenities.join(', ')}

EMAIL STYLE: ${style}

STYLE-SPECIFIC EMAIL APPROACH:
${this.getEmailStyleApproach(style)}

Generate a professional email that includes:
1. Compelling subject line - ${style} focused
2. Opening greeting and hook - ${style} tone
3. Property description (2-3 paragraphs) - ${style} language
4. Key features and benefits - ${style} emphasis
5. Call-to-action for viewing/contact - ${style} approach
6. Professional closing - ${style} appropriate

Target audience: ${this.getTargetAudience(style)}
Length: 200-300 words
Tone: Match the ${style} style throughout`;
  }

  // Get email style-specific approaches
  getEmailStyleApproach(style) {
    const approaches = {
      professional: "Formal, informative, focusing on facts and value proposition",
      luxury: "Sophisticated, exclusive, emphasizing premium lifestyle and prestige",
      'family-friendly': "Warm, welcoming, focusing on family benefits and community",
      modern: "Clean, contemporary, highlighting design and innovation",
      investment: "Business-focused, analytical, emphasizing financial benefits"
    };

    return approaches[style.toLowerCase()] || approaches.professional;
  }

  // Get target audience for each style
  getTargetAudience(style) {
    const audiences = {
      professional: "Serious buyers, real estate professionals, and qualified prospects",
      luxury: "Affluent buyers seeking premium properties and luxury lifestyle",
      'family-friendly': "Families with children looking for safe, comfortable homes",
      modern: "Design-conscious buyers interested in contemporary living",
      investment: "Real estate investors, flippers, and financially-motivated buyers"
    };

    return audiences[style.toLowerCase()] || audiences.professional;
  }
} 