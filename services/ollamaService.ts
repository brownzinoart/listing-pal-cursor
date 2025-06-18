import { Listing } from "../types";

// Ollama API configuration
const OLLAMA_BASE_URL =
  process.env.REACT_APP_OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2:3b"; // Use a lightweight model for real estate content

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
}

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

export class OllamaService {
  private async callOllama(request: OllamaGenerateRequest): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, stream: false }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Ollama API error: ${response.status} ${response.statusText}`,
          errorBody,
        );
        throw new Error(
          `Failed to get a response from the AI service. Status: ${response.status}`,
        );
      }
      const data: OllamaGenerateResponse = await response.json();
      return data.response.trim();
    } catch (error) {
      console.error("Ollama service connection error:", error);
      throw new Error(
        "Could not connect to the AI generation service. Please ensure it is running and accessible.",
      );
    }
  }

  private cleanAIResponse(
    response: string,
    contentType: string = "general",
  ): string {
    // This function cleans up valid AI responses.
    let cleaned = response;

    const introPatterns = [
      /^(Here's a|Here is a|I'll write|I've written|Here's an|Here is an|I'll create|I've created).*?(email|post|caption|description|content).*?[\n:]/i,
      /^(Sure,? here's|Certainly,? here's|Of course,? here's).*?[\n:]/i,
      /^(Let me (write|create|craft)).*?[\n:]/i,
    ];
    introPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });

    const endingPatterns = [
      /\n\n(This (email|post|caption|description)|The (email|post|caption|description)|Note:|Please note:|Remember to|Don't forget to|Feel free to|You can).*$/i,
      /\n\n(I hope this|This should|Let me know if).*$/i,
      /\n\n(Adjust|Modify|Customize|Tailor).*$/i,
    ];
    endingPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });

    if (contentType === "email") {
      if (cleaned.includes("Subject:")) {
        const subjectMatch = cleaned.match(/Subject:\s*(.+?)(?:\n|$)/i);
        if (subjectMatch) {
          const subjectLine = subjectMatch[1].trim();
          const subjectIndex = cleaned.indexOf(subjectMatch[0]);
          const afterSubject = cleaned.substring(
            subjectIndex + subjectMatch[0].length,
          );
          if (
            subjectLine.includes("Dear") ||
            subjectLine.includes("Hello") ||
            subjectLine.includes("Hi ")
          ) {
            const sentenceEnd = subjectLine.search(/[.!?]\s+/);
            if (sentenceEnd > 0 && sentenceEnd < 60) {
              const properSubject = subjectLine
                .substring(0, sentenceEnd + 1)
                .trim();
              const bodyStart = subjectLine.substring(sentenceEnd + 1).trim();
              cleaned = `Subject: ${properSubject}\n\n${bodyStart} ${afterSubject.trim()}`;
            } else {
              const words = subjectLine.split(" ");
              let properSubject = "";
              let bodyStart = "";
              let charCount = 0;
              for (let i = 0; i < words.length; i++) {
                if (charCount + words[i].length + 1 > 50) {
                  bodyStart = words.slice(i).join(" ");
                  break;
                }
                properSubject += (properSubject ? " " : "") + words[i];
                charCount += words[i].length + 1;
              }
              cleaned = `Subject: ${properSubject}\n\n${bodyStart} ${afterSubject.trim()}`;
            }
          } else {
            cleaned = `Subject: ${subjectLine}\n\n${afterSubject.trim()}`;
          }
        }
      }
      cleaned = cleaned.replace(/(\nSubject:|^Subject:)(?!.*^Subject:)/gim, "");
      const closingMatch = cleaned.match(
        /(Best regards|Sincerely|Best wishes|Kind regards|Warmly|Cheers).*?(\[.*?\]|\n.*?$)/i,
      );
      if (closingMatch) {
        const closingIndex = cleaned.indexOf(closingMatch[0]);
        const endIndex = closingIndex + closingMatch[0].length;
        const afterClosing = cleaned.substring(endIndex);
        if (
          afterClosing.includes("Note:") ||
          afterClosing.includes("Remember:") ||
          afterClosing.includes("This email")
        ) {
          cleaned = cleaned.substring(0, endIndex);
        }
      }
    }

    cleaned = cleaned.replace(/\[.*?\]/g, (match) => {
      const keepPatterns = [
        "client name",
        "your name",
        "contact information",
        "agent name",
        "phone number",
        "email address",
        "company name",
        "website",
        "insert photo",
        "add image",
        "your logo",
      ];
      if (
        keepPatterns.some((pattern) => match.toLowerCase().includes(pattern))
      ) {
        return match;
      }
      return "";
    });

    cleaned = cleaned.replace(
      /^(Assistant:|AI:|Model:|Response:|ChatGPT:|Claude:)/i,
      "",
    );
    cleaned = cleaned.replace(/\(Note:.*?\)/gi, "");
    cleaned = cleaned.replace(/\*Note:.*?\*/gi, "");
    cleaned = cleaned.replace(/^["'](.*)["']$/s, "$1");
    cleaned = cleaned.replace(/^["']/gm, "");
    cleaned = cleaned.replace(/["']$/gm, "");

    if (contentType !== "instagram" && contentType !== "social") {
      cleaned = cleaned.replace(/\n\n#[A-Za-z].*$/gm, (match) => {
        if (
          match.includes("customize") ||
          match.includes("adjust") ||
          match.includes("modify")
        ) {
          return "";
        }
        return match;
      });
    }

    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");
    cleaned = cleaned.replace(/^\s+|\s+$/gm, "");
    cleaned = cleaned.trim();

    return cleaned;
  }

  async generatePropertyDescription(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    const prompt = `Write a ${style} property description for a real estate listing with the following details:
    
Address: ${listing.address}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Year Built: ${listing.yearBuilt}
Property Type: ${listing.propertyType || "Residential"}
Key Features: ${listing.keyFeatures}

Write ONLY the compelling property description that highlights the best features and appeals to potential buyers. Keep it under 300 words and make it engaging and informative. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.7,
        max_tokens: 500,
      },
    });

    return this.cleanAIResponse(response, "description");
  }

  async generateFacebookPost(listing: Listing): Promise<string> {
    const prompt = `Create an engaging Facebook post for a real estate listing with these details:
    
Address: ${listing.address.split(",")[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Key Features: ${listing.keyFeatures}

Based on real estate advertising research, create a post that tells a story and appeals to lifestyle aspirations. Translate features into tangible benefits for the buyer. The tone should be enthusiastic and emotional. Keep it under 250 words.

Write ONLY the Facebook post content. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.8,
        max_tokens: 400,
      },
    });

    return this.cleanAIResponse(response, "social");
  }

  async generateInstagramCaption(listing: Listing): Promise<string> {
    const prompt = `Create an Instagram caption for a real estate listing with these details:
    
Address: ${listing.address.split(",")[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Key Features: ${listing.keyFeatures}

Create a visually-driven, punchy, and emoji-heavy caption. Focus on lifestyle and tangible benefits. It should be short, scannable, and include a strong set of relevant hashtags.

Write ONLY the Instagram caption content. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.9,
        max_tokens: 300,
      },
    });

    return this.cleanAIResponse(response, "instagram");
  }

  async generateXPost(listing: Listing): Promise<string> {
    const prompt = `Create a concise X (Twitter) post for a real estate listing with these details:
    
Address: ${listing.address.split(",")[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft

Write ONLY a punchy, attention-grabbing X post content that fits within 280 characters. Use a strong hook and a clear call to action with a link to the listing.

Write ONLY the X post content. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.8,
        max_tokens: 100,
      },
    });

    return this.cleanAIResponse(response, "social");
  }

  async generateIntroEmail(
    listing: Listing,
    emailType: string = "new-listing",
  ): Promise<string> {
    const prompt = `Write an introductory email for this real estate listing:
    
Address: ${listing.address}  
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Year Built: ${listing.yearBuilt}
Key Features: ${listing.keyFeatures}

CRITICAL FORMATTING REQUIREMENTS:
1. Line 1: "Subject: [compelling subject line - MAX 50 characters]"
2. Line 2: COMPLETELY BLANK LINE
3. Line 3: "Dear [Client Name],"
4. NEVER put the greeting on the same line as the subject
5. Keep subject line SHORT and punchy
6. Make email professional but enthusiastic
7. Include scheduling call-to-action
8. Use placeholders: [Client Name], [Your Name], [Your Contact Information]

STRICT FORMAT TO FOLLOW:
Subject: New Listing - Perfect Home Awaits!

Dear [Client Name],

I hope this email finds you well! I'm excited to share an incredible opportunity that just came on the market.

[Continue with email body...]

Best regards,
[Your Name]
[Your Contact Information]

Write the email now following this EXACT format. DO NOT put any content after "Subject:" except the subject line itself:`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.8,
        max_tokens: 600,
      },
    });

    return this.cleanAIResponse(response, "email");
  }

  async generateAdCopy(
    listing: Listing,
    platform: string,
    objective: string,
  ): Promise<{ headline: string; body: string; cta: string }> {
    let platformPrompt;

    switch (platform) {
      case "linkedin":
        platformPrompt = `
          Platform: LinkedIn.
          Objective: ${objective}.
          Audience: Professionals, Investors, High-Net-Worth Individuals.
          Tone: Professional, authoritative, data-driven, and value-focused.
          Instructions: Generate a headline (max 150 chars), body text (max 600 chars), and a professional call-to-action (max 20 chars).
          Emphasize investment potential, ROI, unique luxury features, and market insights. Avoid casual language and emojis.
        `;
        break;
      case "google":
        platformPrompt = `
          Platform: Google Ads.
          Objective: ${objective}.
          Audience: Users actively searching for real estate.
          Tone: Direct, keyword-rich, and benefit-oriented.
          Instructions: Generate a concise headline (max 30 chars), descriptive body text (max 90 chars), and a strong call-to-action (max 20 chars).
          The headline and body should be highly relevant to potential search queries for this type of property.
        `;
        break;
      default: // Facebook & Instagram
        platformPrompt = `
          Platform: Facebook & Instagram.
          Objective: ${objective}.
          Audience: Local buyers, specific demographics (e.g., families, first-time buyers).
          Tone: Engaging, emotional, and lifestyle-oriented.
          Instructions: Generate a catchy headline (max 40 chars), engaging body text (max 125 chars), and a clear call-to-action (max 20 chars).
          Translate features into benefits and use storytelling to create a connection.
        `;
    }

    const prompt = `Create ad copy for a real estate listing.\n\nProperty Details:\n- Address: ${listing.address}\n- Price: $${listing.price.toLocaleString()}\n- Bedrooms: ${listing.bedrooms}\n- Bathrooms: ${listing.bathrooms}\n- Square Footage: ${listing.squareFootage} sqft\n- Key Features: ${listing.keyFeatures}\n\nAd Requirements:\n${platformPrompt}\n\nYour response MUST be a raw JSON object with three keys: "headline", "body", and "cta". Example format:\n{\n  "headline": "Your Dream Home Awaits!",\n  "body": "Discover this stunning 3-bed, 2-bath gem with a newly renovated kitchen. Perfect for families!",\n  "cta": "Schedule a Tour"\n}\n\nNow, generate the JSON for the current listing.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: { temperature: 0.7 },
    });

    try {
      const jsonResponse = response.match(/\{[\s\S]*\}/);
      if (jsonResponse) return JSON.parse(jsonResponse[0]);
      throw new Error("No valid JSON found in AI response.");
    } catch (e) {
      console.error("Failed to parse ad copy JSON from Ollama:", e);
      throw new Error(
        "The AI returned an invalid format. Please try generating again.",
      );
    }
  }
}

export const ollamaService = new OllamaService();
