const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Main property description generation method
  async generatePropertyDescription(propertyData, style = "professional") {
    try {
      const prompt = this.buildPropertyDescriptionPrompt(propertyData, style);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert real estate copywriter with extensive experience in creating compelling property descriptions that convert leads into buyers. You understand market psychology and can adapt your writing style to different audiences and property types.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate property description with OpenAI");
    }
  }

  // Enhanced property data enrichment with web search capabilities
  async enrichPropertyData(address, propertyData = {}) {
    try {
      const searchPrompt = `You are an expert real estate data analyst. Your task is to find the most accurate and up-to-date information for a property located at: "${address}".

To do this, you must search and cross-reference information from the following top real estate websites:
- Zillow.com
- Redfin.com
- Realtor.com

Synthesize the data from these sources to provide the single most accurate value for each field. If there are discrepancies, use your expertise to determine the most likely correct value. For example, public records on Realtor.com might be more accurate for 'yearBuilt', while Zillow's Zestimate is a key value indicator for 'estimatedValue'.

Please provide the information in the following strict JSON format. Do not add any commentary outside of the JSON structure.

{
  "address": "${address}",
  "estimatedValue": "The most accurate estimated market value, as a string (e.g., \\"$1,550,000\\")",
  "bedrooms": "The most likely number of bedrooms, as a string (e.g., \\"4\\")",
  "bathrooms": "The most likely number of bathrooms, as a string (e.g., \\"3.5\\")",
  "squareFootage": "The most accurate square footage, as a string (e.g., \\"2100 sq ft\\")",
  "propertyType": "The property type (e.g., \\"Single Family Residence\\")",
  "yearBuilt": "The year the property was built, as a string (e.g., \\"1998\\")",
  "neighborhood": "The name of the neighborhood",
  "marketAnalysis": "A brief market analysis based on recent sales and trends from the sources.",
  "keyFeatures": ["A consolidated list of key features from the sources."],
  "nearbyAmenities": ["A list of nearby amenities."],
  "schoolDistrict": "The associated school district.",
  "walkScore": "A description of the walkability.",
  "crimeRate": "A general description of the area's safety.",
  "demographics": "A summary of the area's demographics."
}

Your goal is maximum accuracy by intelligently combining data from the specified real estate portals.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable real estate data analyst who provides realistic, conservative estimates and avoids making up specific details that could be inaccurate. You focus on providing helpful contextual information and reasonable estimates.",
          },
          {
            role: "user",
            content: searchPrompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent, factual responses
      });

      try {
        const enrichedData = JSON.parse(completion.choices[0].message.content);
        // Merge with existing property data, with OpenAI data as fallback
        return {
          ...enrichedData,
          ...propertyData, // Existing data takes precedence
        };
      } catch (parseError) {
        console.log("Could not parse OpenAI JSON response, using raw text");
        return {
          ...propertyData,
          marketAnalysis: completion.choices[0].message.content,
        };
      }
    } catch (error) {
      console.error("OpenAI Property Enrichment Error:", error);
      return propertyData; // Return original data if enrichment fails
    }
  }

  // Build comprehensive prompt based on property data and style (similar to Gemini service)
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
      neighborhood = "",
      schoolDistrict = "",
      yearBuilt,
      lotSize,
      parking,
      hvac,
      flooring,
      appliances = [],
      exteriorFeatures = [],
      interiorFeatures = [],
      locationHighlights = [],
    } = propertyData;

    // Style-specific tone and approach
    const styleGuides = {
      professional: {
        tone: "Professional, informative, and straightforward. Use industry terminology appropriately. Focus on facts, features, and investment value.",
        language:
          "Clear and authoritative language that builds confidence. Emphasize quality, value, and practical benefits.",
        structure:
          "Lead with key selling points, followed by detailed features, then location benefits.",
        keyWords:
          "exceptional, quality, value, features, benefits, opportunity, well-maintained, desirable",
      },
      luxury: {
        tone: "Sophisticated, elegant, and aspirational. Use refined vocabulary and emphasize exclusivity, prestige, and premium lifestyle.",
        language:
          "Elevated language with words like 'exceptional,' 'exquisite,' 'bespoke,' 'prestigious.' Focus on lifestyle and status.",
        structure:
          "Begin with lifestyle vision, highlight unique luxury features, emphasize exclusivity and prestige.",
        keyWords:
          "exquisite, bespoke, prestigious, exclusive, sophisticated, refined, curated, extraordinary",
      },
      "family-friendly": {
        tone: "Warm, nurturing, and focused on family life. Emphasize safety, comfort, community, and spaces for family activities.",
        language:
          "Heartwarming language focusing on family memories, safety, and growth. Use words like 'perfect for,' 'ideal,' 'wonderful.'",
        structure:
          "Begin with family lifestyle vision, highlight family-friendly features, emphasize community and schools.",
        keyWords:
          "perfect for families, safe, comfortable, spacious, welcoming, memories, growing, community",
      },
      modern: {
        tone: "Clean, contemporary, and forward-thinking. Emphasize innovation, efficiency, and sleek design. Use crisp, confident language.",
        language:
          "Streamlined vocabulary focusing on design, technology, and contemporary living. Emphasize clean lines and functionality.",
        structure:
          "Lead with design innovation, highlight modern features and technology, emphasize contemporary lifestyle.",
        keyWords:
          "contemporary, sleek, innovative, efficient, streamlined, cutting-edge, sophisticated, minimalist",
      },
      investment: {
        tone: "ROI-focused, analytical, and business-oriented. Emphasize financial potential, market position, and investment returns.",
        language:
          "Data-driven language focusing on market value, appreciation potential, rental income, and financial benefits.",
        structure:
          "Lead with investment opportunity, highlight financial benefits, emphasize market positioning and growth potential.",
        keyWords:
          "ROI, investment opportunity, appreciation potential, market value, cash flow, rental income, financial returns",
      },
    };

    const currentStyle =
      styleGuides[style.toLowerCase()] || styleGuides.professional;

    return `Generate a compelling property description for the following property:

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

KEY FEATURES:
${keyFeatures.length > 0 ? keyFeatures.map((feature) => `- ${feature}`).join("\n") : "No specific key features provided"}

AMENITIES:
${amenities.length > 0 ? amenities.map((amenity) => `- ${amenity}`).join("\n") : "Standard amenities"}

INTERIOR FEATURES:
${interiorFeatures.length > 0 ? interiorFeatures.map((feature) => `- ${feature}`).join("\n") : "Standard interior features"}

EXTERIOR FEATURES:
${exteriorFeatures.length > 0 ? exteriorFeatures.map((feature) => `- ${feature}`).join("\n") : "Standard exterior features"}

APPLIANCES:
${appliances.length > 0 ? appliances.map((appliance) => `- ${appliance}`).join("\n") : "Standard appliances"}

LOCATION HIGHLIGHTS:
${locationHighlights.length > 0 ? locationHighlights.map((highlight) => `- ${highlight}`).join("\n") : "Great location"}

HVAC: ${hvac || "Central air and heating"}
FLOORING: ${flooring || "Mixed flooring throughout"}
NEIGHBORHOOD: ${neighborhood}
SCHOOL DISTRICT: ${schoolDistrict}

WRITING STYLE: ${style.toUpperCase()}
Requirements:
- Tone: ${currentStyle.tone}
- Language: ${currentStyle.language}
- Structure: ${currentStyle.structure}
- Use these key words naturally: ${currentStyle.keyWords}

Instructions:
1. Write 3-4 compelling paragraphs (250-350 words total)
2. Incorporate ALL provided features naturally
3. Match the ${style} style perfectly
4. Include location benefits and lifestyle advantages
5. End with an appropriate call-to-action
6. Be authentic and avoid generic language
7. Make it persuasive for the target audience

Generate the property description now:`;
  }

  // Generate social media content
  async generateSocialMediaContent(
    propertyData,
    platform,
    style = "professional",
  ) {
    try {
      const prompt = this.buildSocialMediaPrompt(propertyData, platform, style);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a social media marketing expert specializing in real estate content for ${platform}. You understand platform-specific best practices and audience engagement strategies.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Social Media Generation Error:", error);
      throw new Error(`Failed to generate ${platform} content with OpenAI`);
    }
  }

  buildSocialMediaPrompt(propertyData, platform, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      keyFeatures = [],
    } = propertyData;

    const platformSpecs = {
      facebook: {
        charLimit: 2000,
        hashtags: 3,
        tone: "conversational and community-focused",
      },
      instagram: {
        charLimit: 2200,
        hashtags: 10,
        tone: "visual and lifestyle-focused",
      },
      twitter: { charLimit: 280, hashtags: 2, tone: "concise and punchy" },
      linkedin: {
        charLimit: 1300,
        hashtags: 3,
        tone: "professional and business-focused",
      },
    };

    const spec =
      platformSpecs[platform.toLowerCase()] || platformSpecs.facebook;

    return `Create a ${platform} post for this property:

Property: ${address}
Price: ${price}
Bedrooms: ${bedrooms}
Bathrooms: ${bathrooms}
Key Features: ${keyFeatures.join(", ")}

Platform: ${platform}
Style: ${style}
Character Limit: ${spec.charLimit}
Hashtag Count: ${spec.hashtags}
Platform Tone: ${spec.tone}

Requirements:
1. Stay within ${spec.charLimit} characters
2. Include ${spec.hashtags} relevant hashtags
3. Use ${spec.tone} tone
4. Include a clear call-to-action
5. Make it engaging and shareable
6. Highlight the most compelling features

Generate the ${platform} post:`;
  }

  // Generate flyer content
  async generateFlyerContent(propertyData, style = "professional") {
    try {
      const prompt = this.buildFlyerPrompt(propertyData, style);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a real estate marketing specialist who creates compelling flyer content that drives inquiries and showings.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Flyer Generation Error:", error);
      throw new Error("Failed to generate flyer content with OpenAI");
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
    } = propertyData;

    return `Create compelling flyer content for this property:

Property Details:
- Address: ${address}
- Price: ${price}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Square Footage: ${squareFootage}
- Key Features: ${keyFeatures.join(", ")}

Style: ${style}

Requirements:
1. Create a compelling headline
2. Write a brief but impactful description (100-150 words)
3. List key selling points in bullet format
4. Include contact call-to-action
5. Make it scannable and visually appealing
6. Use ${style} tone throughout

Format the response as:
HEADLINE: [compelling headline]

DESCRIPTION: [brief description]

KEY FEATURES:
• [feature 1]
• [feature 2]
• [feature 3]

CONTACT: [call-to-action]

Generate the flyer content:`;
  }

  // Generate email content
  async generateEmailContent(propertyData, style = "professional") {
    try {
      const prompt = this.buildEmailPrompt(propertyData, style);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an email marketing expert specializing in real estate communications that generate leads and drive engagement.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Email Generation Error:", error);
      throw new Error("Failed to generate email content with OpenAI");
    }
  }

  buildEmailPrompt(propertyData, style) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      keyFeatures = [],
    } = propertyData;

    return `Create a compelling real estate email for this property:

Property: ${address}
Price: ${price}
Bedrooms: ${bedrooms}
Bathrooms: ${bathrooms}
Key Features: ${keyFeatures.join(", ")}

Style: ${style}

Requirements:
1. Write a compelling subject line
2. Create an engaging email body (200-300 words)
3. Include key property highlights
4. Add a clear call-to-action
5. Use ${style} tone
6. Make it personal and conversational

Format as:
SUBJECT: [subject line]

EMAIL BODY:
[email content]

Generate the email:`;
  }

  // Generate neighborhood insights
  async generateNeighborhoodInsights(address) {
    try {
      const prompt = `You are a real estate market analyst specializing in neighborhood insights. Provide comprehensive insights about the neighborhood for the property at: ${address}

Please provide detailed information in the following JSON format:
{
  "neighborhood": "neighborhood name",
  "walkScore": "walkability rating and description",
  "demographics": "demographic overview of the area",
  "safetyRating": "safety assessment and crime statistics overview",
  "schoolDistrict": "school district information and ratings",
  "publicTransit": "public transportation options and accessibility",
  "shoppingDining": "nearby shopping and dining options",
  "recreation": "parks, recreation centers, and entertainment",
  "marketTrends": "recent real estate market trends in the area",
  "commute": "commute times to major employment centers",
  "futureGrowth": "planned developments and growth potential",
  "costOfLiving": "cost of living assessment relative to city/national average"
}

Important: Provide realistic, conservative estimates based on general knowledge of the area. If specific data isn't available, provide general guidance and suggest verification of details. Focus on helpful contextual information that would be valuable to potential property buyers or investors.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable real estate neighborhood analyst who provides realistic insights based on general market knowledge. You avoid making up specific statistics and focus on providing helpful contextual information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      try {
        return JSON.parse(completion.choices[0].message.content);
      } catch (parseError) {
        console.log(
          "Could not parse neighborhood insights JSON, using raw text",
        );
        return {
          neighborhood: "Analysis Available",
          insights: completion.choices[0].message.content,
        };
      }
    } catch (error) {
      console.error("OpenAI Neighborhood Insights Error:", error);
      throw new Error("Failed to generate neighborhood insights with OpenAI");
    }
  }

  // Generate actionable agent tips for neighborhood overview
  async generateAgentTips(address, neighborhoodData) {
    try {
      const prompt = `You are an expert real estate coach helping agents create compelling talking points. Based on the neighborhood data below, generate exactly 3 actionable tips that a real estate agent can use when presenting this property/area to potential buyers.

PROPERTY ADDRESS: ${address}

NEIGHBORHOOD DATA:
- Walk Score: ${neighborhoodData.walkScore}/100
- Transit Score: ${neighborhoodData.transitScore}/100  
- Bike Score: ${neighborhoodData.bikeScore}/100
- Number of Schools: ${neighborhoodData.schools?.length || 0} (Average Rating: ${neighborhoodData.schools?.length > 0 ? (neighborhoodData.schools.reduce((acc, s) => acc + s.rating, 0) / neighborhoodData.schools.length).toFixed(1) : "N/A"}/10)
- Crime Safety Score: ${neighborhoodData.crimeData?.score || "N/A"}/100
- Family Friendly Score: ${neighborhoodData.demographics?.familyFriendly || "N/A"}/10
- Median Income: $${neighborhoodData.demographics?.medianIncome?.toLocaleString() || "N/A"}
- Market Median Price: $${neighborhoodData.marketTrends?.medianPrice?.toLocaleString() || "N/A"}
- 1-Year Price Growth: ${neighborhoodData.marketTrends?.priceGrowth1Year || "N/A"}%
- Days on Market: ${neighborhoodData.marketTrends?.daysOnMarket || "N/A"} days
- Available Amenities: ${neighborhoodData.amenities?.length || 0} nearby

Requirements:
1. Each tip should be 15-25 words maximum
2. Focus on actionable strategies agents can immediately use in conversations
3. Look at the data holistically to find the strongest selling points
4. Make tips specific to this neighborhood's strengths
5. Frame as advice for conversations with buyers
6. Be practical and results-oriented

Format as a simple array:
["Tip 1 text here", "Tip 2 text here", "Tip 3 text here"]

Generate the 3 agent tips now:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a top-performing real estate coach who specializes in helping agents convert leads through strategic conversation tactics and neighborhood positioning.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      try {
        const tips = JSON.parse(completion.choices[0].message.content);
        return Array.isArray(tips) ? tips : [tips];
      } catch (parseError) {
        // Fallback: extract tips from text response
        const response = completion.choices[0].message.content;
        const tipLines = response
          .split("\n")
          .filter(
            (line) =>
              line.trim().length > 0 &&
              (line.includes('"') ||
                line.match(/^\d+\./) ||
                line.startsWith("•")),
          );
        return tipLines.slice(0, 3).map((tip) =>
          tip
            .replace(/^\d+\.\s*/, "")
            .replace(/^•\s*/, "")
            .replace(/"/g, "")
            .trim(),
        );
      }
    } catch (error) {
      console.error("OpenAI Agent Tips Generation Error:", error);
      // Return fallback tips
      return [
        "Emphasize the walkability and convenience for daily errands",
        "Highlight school quality and family-friendly neighborhood features",
        "Position market timing based on current price trends and inventory",
      ];
    }
  }

  // Test connection method
  async testConnection() {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content:
              'Test message - please respond with "OpenAI connection successful"',
          },
        ],
        max_tokens: 10,
      });

      return completion.choices[0].message.content.includes("successful");
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      return false;
    }
  }
}

module.exports = { OpenAIService };
