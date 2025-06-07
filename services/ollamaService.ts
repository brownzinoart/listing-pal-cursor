import { Listing } from '../types';

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b'; // Use a lightweight model for real estate content

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false, // We want the complete response
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaGenerateResponse = await response.json();
      return data.response.trim();
    } catch (error) {
      console.error('Ollama API error:', error);
      // Fallback to mock generation if Ollama is not available
      return this.getMockResponse(request.prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    // Fallback mock responses when Ollama is not available
    if (prompt.includes('property description')) {
      return 'This stunning property offers modern living at its finest. With spacious rooms, premium finishes, and an ideal location, this home represents exceptional value in today\'s market.';
    } else if (prompt.includes('Facebook')) {
      return '🏡 Just listed! This beautiful property is now available and ready for its new owners. Contact us today for a private showing!';
    } else if (prompt.includes('Instagram')) {
      return '✨ New listing alert! ✨\nDreaming of your perfect home? This might be the one! 🔑\n\n#realestate #newlisting #dreamhome';
    } else if (prompt.includes('Twitter') || prompt.includes('X post')) {
      return '🆕 Just listed! Beautiful property now available. Perfect for families looking for their dream home. DM for details! #realestate';
    } else if (prompt.includes('email') || prompt.includes('introductory')) {
      return `Subject: New Listing - Your Dream Home Awaits!

Dear [Client Name],

I hope this email finds you well! I'm thrilled to share an incredible opportunity that just came on the market.

This stunning property offers everything you've been looking for and more. From the moment you step inside, you'll be captivated by the thoughtful design and premium finishes throughout.

Here's what makes this property special:
• Spacious and bright living areas perfect for entertaining
• Modern amenities that blend comfort with style  
• Ideal location with convenient access to everything you need
• Move-in ready condition

I would love to schedule a private showing at your earliest convenience. Properties like this don't stay on the market long, and I want to make sure you have the first opportunity to see it.

Please let me know your availability this week, and I'll arrange everything for you.

Best regards,
[Your Name]
[Your Contact Information]`;
    }
    
    return 'Generated content using AI assistance.';
  }

  async generatePropertyDescription(listing: Listing, style: string = 'professional'): Promise<string> {
    const prompt = `Write a ${style} property description for a real estate listing with the following details:
    
Address: ${listing.address}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Year Built: ${listing.yearBuilt}
Property Type: ${listing.propertyType || 'Residential'}
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

    return this.cleanAIResponse(response, 'description');
  }

  async generateFacebookPost(listing: Listing): Promise<string> {
    const prompt = `Create an engaging Facebook post for a real estate listing with these details:
    
Address: ${listing.address.split(',')[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Key Features: ${listing.keyFeatures}

Write ONLY the Facebook post content that's friendly, engaging, and encourages interaction. Include relevant hashtags and a call-to-action. Keep it under 250 words. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.8,
        max_tokens: 400,
      },
    });

    return this.cleanAIResponse(response, 'social');
  }

  async generateInstagramCaption(listing: Listing): Promise<string> {
    const prompt = `Create an Instagram caption for a real estate listing with these details:
    
Address: ${listing.address.split(',')[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft
Key Features: ${listing.keyFeatures}

Write ONLY the Instagram caption content that's trendy, includes relevant emojis, and uses popular real estate hashtags. Keep it engaging and visually appealing. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.9,
        max_tokens: 300,
      },
    });

    return this.cleanAIResponse(response, 'instagram');
  }

  async generateXPost(listing: Listing): Promise<string> {
    const prompt = `Create a concise X (Twitter) post for a real estate listing with these details:
    
Address: ${listing.address.split(',')[0]}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Footage: ${listing.squareFootage} sqft

Write ONLY the punchy, engaging X post content that fits within 280 characters. Include relevant hashtags and make it shareable. Do not include any introductory text or explanatory comments.`;

    const response = await this.callOllama({
      model: DEFAULT_MODEL,
      prompt,
      options: {
        temperature: 0.8,
        max_tokens: 100,
      },
    });

    return this.cleanAIResponse(response, 'social');
  }

  private cleanAIResponse(response: string, contentType: string = 'general'): string {
    // Remove common AI companion text patterns
    let cleaned = response;
    
    // Remove introductory phrases based on content type
    const introPatterns = [
      /^(Here's a|Here is a|I'll write|I've written|Here's an|Here is an|I'll create|I've created).*?(email|post|caption|description|content).*?[\n:]/i,
      /^(Sure,? here's|Certainly,? here's|Of course,? here's).*?[\n:]/i,
      /^(Let me (write|create|craft)).*?[\n:]/i
    ];
    
    introPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove explanatory text at the end
    const endingPatterns = [
      /\n\n(This (email|post|caption|description)|The (email|post|caption|description)|Note:|Please note:|Remember to|Don't forget to|Feel free to|You can).*$/i,
      /\n\n(I hope this|This should|Let me know if).*$/i,
      /\n\n(Adjust|Modify|Customize|Tailor).*$/i
    ];
    
    endingPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // For emails, handle closings and formatting specially
    if (contentType === 'email') {
      // Fix subject line formatting issues
      if (cleaned.includes('Subject:')) {
        // Find the subject line and extract it properly
        const subjectMatch = cleaned.match(/Subject:\s*(.+?)(?:\n|$)/i);
        if (subjectMatch) {
          const subjectLine = subjectMatch[1].trim();
          
          // Find where the subject line ends and body begins
          const subjectIndex = cleaned.indexOf(subjectMatch[0]);
          const afterSubject = cleaned.substring(subjectIndex + subjectMatch[0].length);
          
          // Check if there's body content immediately after the subject line (no line break)
          if (subjectLine.includes('Dear') || subjectLine.includes('Hello') || subjectLine.includes('Hi ')) {
            // Subject line contains body content - need to split it
            const sentenceEnd = subjectLine.search(/[.!?]\s+/);
            if (sentenceEnd > 0 && sentenceEnd < 60) {
              // Split at the first sentence boundary within reasonable subject length
              const properSubject = subjectLine.substring(0, sentenceEnd + 1).trim();
              const bodyStart = subjectLine.substring(sentenceEnd + 1).trim();
              cleaned = `Subject: ${properSubject}\n\n${bodyStart} ${afterSubject.trim()}`;
            } else {
              // No good sentence boundary, use first 50 characters
              const words = subjectLine.split(' ');
              let properSubject = '';
              let bodyStart = '';
              let charCount = 0;
              
              for (let i = 0; i < words.length; i++) {
                if (charCount + words[i].length + 1 > 50) {
                  bodyStart = words.slice(i).join(' ');
                  break;
                }
                properSubject += (properSubject ? ' ' : '') + words[i];
                charCount += words[i].length + 1;
              }
              
              cleaned = `Subject: ${properSubject}\n\n${bodyStart} ${afterSubject.trim()}`;
            }
          } else {
            // Subject line looks clean, just ensure proper formatting
            cleaned = `Subject: ${subjectLine}\n\n${afterSubject.trim()}`;
          }
        }
      }
      
      // Remove any duplicate "Subject:" lines
      cleaned = cleaned.replace(/(\nSubject:|^Subject:)(?!.*^Subject:)/gmi, '');
      
      // Handle email closings
      const closingMatch = cleaned.match(/(Best regards|Sincerely|Best wishes|Kind regards|Warmly|Cheers).*?(\[.*?\]|\n.*?$)/i);
      if (closingMatch) {
        const closingIndex = cleaned.indexOf(closingMatch[0]);
        const endIndex = closingIndex + closingMatch[0].length;
        const afterClosing = cleaned.substring(endIndex);
        if (afterClosing.includes('Note:') || afterClosing.includes('Remember:') || afterClosing.includes('This email')) {
          cleaned = cleaned.substring(0, endIndex);
        }
      }
    }
    
    // Remove any bracketed instructions or notes
    cleaned = cleaned.replace(/\[.*?\]/g, (match) => {
      // Keep common placeholders but remove instructional text
      const keepPatterns = [
        'client name', 'your name', 'contact information', 'agent name', 
        'phone number', 'email address', 'company name', 'website',
        'insert photo', 'add image', 'your logo'
      ];
      
      if (keepPatterns.some(pattern => match.toLowerCase().includes(pattern))) {
        return match;
      }
      return '';
    });
    
    // Remove AI model artifacts
    cleaned = cleaned.replace(/^(Assistant:|AI:|Model:|Response:|ChatGPT:|Claude:)/i, '');
    
    // Remove meta-commentary about the content
    cleaned = cleaned.replace(/\(Note:.*?\)/gi, '');
    cleaned = cleaned.replace(/\*Note:.*?\*/gi, '');
    
    // Remove quotes around the entire content
    cleaned = cleaned.replace(/^["'](.*)["']$/s, '$1');
    
    // Remove quotes at the beginning and end of lines
    cleaned = cleaned.replace(/^["']/gm, '');
    cleaned = cleaned.replace(/["']$/gm, '');
    
    // Clean up hashtags that are instructional rather than actual hashtags
    if (contentType !== 'instagram' && contentType !== 'social') {
      cleaned = cleaned.replace(/\n\n#[A-Za-z].*$/gm, (match) => {
        // Keep if it looks like real hashtags, remove if it looks instructional
        if (match.includes('customize') || match.includes('adjust') || match.includes('modify')) {
          return '';
        }
        return match;
      });
    }
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Replace multiple line breaks with double
    cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim each line
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  async generateIntroEmail(listing: Listing, emailType: string = 'new-listing'): Promise<string> {
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

    return this.cleanAIResponse(response, 'email');
  }
}

export const ollamaService = new OllamaService(); 