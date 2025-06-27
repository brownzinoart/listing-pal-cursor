import { Listing } from "../types";

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

  async generateMLSDescription(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          style: style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate description: ${response.status}`);
      }

      const data = await response.json();
      return data.description || "";
    } catch (error) {
      console.error("Error generating MLS description:", error);
      throw error;
    }
  }

  async generateFacebookPost(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: "facebook",
          style: style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate Facebook post: ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error generating Facebook post:", error);
      throw error;
    }
  }

  async generateInstagramPost(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: "instagram",
          style: style,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate Instagram post: ${response.status}`,
        );
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error generating Instagram post:", error);
      throw error;
    }
  }

  async generateXPost(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          platform: "twitter", // X/Twitter
          style: style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate X post: ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error generating X post:", error);
      throw error;
    }
  }

  async generateEmailContent(
    listing: Listing,
    theme: string = "NEW_LISTING",
    style: string = "professional",
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          theme: theme,
          style: style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate email content: ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error generating email content:", error);
      throw error;
    }
  }

  async generateInteriorConcepts(
    listing: Listing,
    selectedImage?: string,
  ): Promise<string> {
    try {
      const response = await fetch("/api/listings/generate-flyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyData: listing,
          style: "interior-concepts",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate interior concepts: ${response.status}`,
        );
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error generating interior concepts:", error);
      throw error;
    }
  }

  async generateActualRoomRedesign(
    imageUrl: string,
    roomType: string,
    designStyle: string,
  ): Promise<string> {
    try {
      const mappedRoomType = this.mapRoomTypeToAPI(roomType);
      const mappedStyle = this.mapStyleToAPI(designStyle);

      console.log("🎯 Sending initial room redesign request to Decor8AI:", {
        imageUrl: imageUrl.substring(0, 50) + "...",
        roomType: mappedRoomType,
        designStyle: mappedStyle,
      });

      const initialResponse = await fetch("/api/redesign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl,
          room_type: mappedRoomType,
          style: mappedStyle,
          isAsync: true, // Use async flow
        }),
      });

      if (!initialResponse.ok) {
        const errorData = await initialResponse.json();
        throw new Error(
          errorData.error || "Initial room redesign request failed",
        );
      }

      const initialData = await initialResponse.json();
      console.log("🔍 Decor8AI initial response:", initialData);

      // Case 1: Immediate success with image URL
      if (initialData.success && initialData.imageUrl) {
        console.log("✅ Decor8AI returned immediate result with image URL.");

        // Validate the image URL
        try {
          new URL(initialData.imageUrl);
          console.log("✅ Decor8AI image URL is valid and ready for use");

          // Wait a moment to ensure the image is fully processed
          console.log("⏳ Waiting for image processing to complete...");
          await new Promise((resolve) => setTimeout(resolve, 2000));

          return initialData.imageUrl;
        } catch (urlError) {
          throw new Error("Decor8AI returned invalid image URL format");
        }
      }

      // Case 2: Async job with jobId for polling
      const jobId = initialData.jobId;
      if (jobId) {
        console.log(
          `⏳ Received job ID: ${jobId}. Starting to poll for Decor8AI results...`,
        );

        const pollUntilComplete = async (
          retries = 30,
          delay = 5000,
        ): Promise<string> => {
          for (let i = 0; i < retries; i++) {
            try {
              await new Promise((resolve) => setTimeout(resolve, delay));
              console.log(
                `🔄 Polling attempt ${i + 1}/${retries} for Decor8AI job ${jobId}`,
              );

              const statusResponse = await fetch(
                `/api/redesign-status/${jobId}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                },
              );

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log(
                  `📊 Decor8AI job ${jobId} status:`,
                  statusData.status,
                );

                if (statusData.status === "completed" && statusData.imageUrl) {
                  console.log(
                    `✅ Decor8AI job ${jobId} completed successfully!`,
                  );
                  console.log(`🖼️ Generated image URL: ${statusData.imageUrl}`);

                  // Additional validation to ensure the image URL is accessible
                  try {
                    new URL(statusData.imageUrl);
                    console.log(
                      "✅ Decor8AI image URL is valid and ready for use",
                    );
                    return statusData.imageUrl;
                  } catch (urlError) {
                    throw new Error(
                      "Decor8AI returned invalid image URL format",
                    );
                  }
                }

                if (
                  statusData.status === "failed" ||
                  statusData.status === "error"
                ) {
                  throw new Error(
                    `Decor8AI job failed: ${statusData.error || "Unknown error during processing"}`,
                  );
                }

                // Still processing, continue polling
                console.log(
                  `⏳ Decor8AI job ${jobId} still ${statusData.status}, continuing to poll...`,
                );
              } else if (statusResponse.status === 202) {
                // Job is still processing (202 Accepted)
                console.log(
                  `⏳ Decor8AI job ${jobId} still processing (202), continuing to poll...`,
                );
              } else {
                // Other error status
                const errorData = await statusResponse.json().catch(() => ({}));
                console.warn(
                  `⚠️ Decor8AI status check failed with HTTP ${statusResponse.status}: ${errorData.error || "Unknown error"}`,
                );

                // For certain errors, we might want to continue polling
                if (statusResponse.status === 500 && i < retries - 3) {
                  console.log(
                    "🔄 Server error, but continuing to poll (server might be temporarily unavailable)",
                  );
                  continue;
                }

                throw new Error(
                  `Decor8AI status check failed: ${errorData.error || `HTTP ${statusResponse.status}`}`,
                );
              }
            } catch (error) {
              console.error(
                `❌ Decor8AI polling error on attempt ${i + 1}:`,
                error instanceof Error ? error.message : String(error),
              );

              // If it's the last attempt or a critical error, throw
              if (
                i === retries - 1 ||
                (error instanceof Error && error.message.includes("Job failed"))
              ) {
                throw error;
              }

              // For network errors, continue polling with exponential backoff
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage.includes("fetch") ||
                errorMessage.includes("network")
              ) {
                console.log(
                  "🔄 Network error, continuing to poll with exponential backoff...",
                );
                delay = Math.min(delay * 1.2, 10000); // Increase delay but cap at 10s
                continue;
              }

              // For other errors, continue polling
              console.log("🔄 Error occurred, but continuing to poll...");
            }
          }

          throw new Error(
            `Decor8AI room redesign job timed out after ${retries} attempts (${(retries * delay) / 1000}s total)`,
          );
        };

        const result = await pollUntilComplete();
        console.log(
          "🎉 Decor8AI room redesign completed successfully and ready for listing",
        );
        return result;
      }

      // Case 3: Unexpected response structure
      console.error("❌ Unexpected Decor8AI response structure:", initialData);
      throw new Error(
        "Decor8AI returned an unexpected response format. No image URL or job ID found.",
      );
    } catch (error) {
      console.error("Decor8AI room redesign error:", error);
      throw error;
    }
  }

  async generatePaidAdCopy(
    listing: Listing,
    style: string = "professional",
  ): Promise<string> {
    try {
      const objectives = style; // In batch mode, 'style' carries the objectives object
      // Generate structured ad campaigns and format as string for now
      const campaigns = [
        {
          platform: "Facebook",
          objective: "WEBSITE_TRAFFIC",
          headline: this.generateAdHeadline(listing, "facebook", style),
          body: this.generateAdBody(listing, "facebook", style),
          cta: "View Listing",
        },
        {
          platform: "LinkedIn",
          objective: "WEBSITE_TRAFFIC",
          headline: this.generateAdHeadline(listing, "linkedin", style),
          body: this.generateAdBody(listing, "linkedin", style),
          cta: "View Property Profile",
        },
        {
          platform: "Google",
          objective: "WEBSITE_TRAFFIC",
          headline: this.generateAdHeadline(listing, "google", style),
          body: this.generateAdBody(listing, "google", style),
          cta: "Schedule a Tour",
        },
      ];

      // Format as string for compatibility with existing system
      return JSON.stringify(campaigns);
    } catch (error) {
      console.error("Error generating paid ad campaigns:", error);
      throw error;
    }
  }

  private generateAdHeadline(
    listing: Listing,
    platform: string,
    style: string,
  ): string {
    const { address, bedrooms, bathrooms, price } = listing;
    const location = address.split(",").slice(-2).join(",").trim(); // Get city, state

    switch (platform) {
      case "facebook":
        if (style === "luxury") {
          return `Sparkle in the Heart of ${location.split(",")[0]}`;
        }
        return `${bedrooms}-Bed, ${bathrooms}-Bath Home in ${location.split(",")[0]}`;

      case "linkedin":
        return `Luxury Investment Opportunity: $${(price / 1000).toFixed(0)}K | ${listing.squareFootage} Sqft | ${location}`;

      case "google":
        return `Luxury ${bedrooms}-Bed Home in ${location.split(",")[0]} - $${(price / 1000).toFixed(0)}K`;

      default:
        return `${bedrooms}-Bed, ${bathrooms}-Bath Home - $${(price / 1000).toFixed(0)}K`;
    }
  }

  private generateAdBody(
    listing: Listing,
    platform: string,
    style: string,
  ): string {
    const { bedrooms, bathrooms, keyFeatures } = listing;
    const features = keyFeatures || "Premium features";

    switch (platform) {
      case "facebook":
        return `Imagine sipping summer nights by your very own pool, surrounded by lush greenery and a shed full of storage secrets waiting to be uncovered. This ${bedrooms}-bed, ${bathrooms}-bath haven is calling your name!`;

      case "linkedin":
        return `Invest in prime real estate with this exceptional property boasting a backyard, pool, and shed storage. In a highly sought-after location, this ${bedrooms}-bedroom, ${bathrooms}-bathroom residence offers unparalleled luxury and potential for strong ROI.`;

      case "google":
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
      paidAdCopy,
    ] = await Promise.all([
      this.generateMLSDescription(listing),
      this.generateFacebookPost(listing),
      this.generateInstagramPost(listing),
      this.generateXPost(listing),
      this.generateEmailContent(listing),
      this.generateInteriorConcepts(listing),
      this.generatePaidAdCopy(listing),
    ]);

    return {
      mlsDescription,
      facebookPost,
      instagramPost,
      xPost,
      emailContent,
      interiorConcepts,
      paidAdCopy,
    };
  }

  // Individual generation functions for step-by-step progress
  async generateContentStep(
    listing: Listing,
    stepId: string,
    options?: any,
  ): Promise<string> {
    const style = options?.style || "professional";

    switch (stepId) {
      case "mls-description":
      case "description":
        return await this.generateMLSDescription(listing, style);
      case "facebook-post":
        return await this.generateFacebookPost(listing, style);
      case "instagram-post":
        return await this.generateInstagramPost(listing, style);
      case "x-post":
        return await this.generateXPost(listing, style);
      case "email":
        return await this.generateEmailContent(
          listing,
          options?.theme || "NEW_LISTING",
          style,
        );
      case "interior-reimagined":
        if (
          options?.selectedImage &&
          options?.roomType &&
          options?.designStyle
        ) {
          // Generate actual room redesign image
          const redesignedImageUrl = await this.generateActualRoomRedesign(
            options.selectedImage,
            options.roomType,
            options.designStyle,
          );
          return redesignedImageUrl;
        } else {
          // Fallback to text concepts if no image/options provided
          return await this.generateInteriorConcepts(
            listing,
            options?.selectedImage,
          );
        }
      case "paid-ads":
        return await this.generatePaidAdCopy(listing);
      default:
        throw new Error(`Unknown content step: ${stepId}`);
    }
  }

  /**
   * Map frontend room types to API expected format (matching roomRestyleService.ts)
   */
  private mapRoomTypeToAPI(roomType?: string): string {
    const mapping: Record<string, string> = {
      livingroom: "Living Room",
      bedroom: "Bedroom",
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      diningroom: "Dining Room",
      homeoffice: "Office",
      nursery: "Bedroom",
      basement: "Living Room",
    };

    return mapping[roomType || "livingroom"] || "Living Room";
  }

  /**
   * Map frontend styles to API expected format (matching roomRestyleService.ts)
   */
  private mapStyleToAPI(style?: string): string {
    const mapping: Record<string, string> = {
      modern: "Modern",
      scandinavian: "Scandinavian",
      minimalist: "Minimalist",
      industrial: "Industrial",
      bohemian: "Bohemian",
      traditional: "Traditional",
      midcenturymodern: "Mid-Century Modern",
      glamorous: "Luxury",
      rustic: "Rustic",
      contemporary: "Contemporary",
      eclectic: "Contemporary",
      farmhouse: "Farmhouse",
    };

    return mapping[style || "modern"] || "Modern";
  }
}

export const contentGenerationService = new ContentGenerationService();
