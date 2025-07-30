import { Listing } from "../types";
import { slideshowVideoService } from "./slideshowVideoService";
// Remotion service is now server-side only
import { openaiTTSClient } from "./openaiTTSClient";
import { errorHandlingService } from "./errorHandlingService";
import { resourceManagementService } from "./resourceManagementService";
import { ttsWithFallback } from "./ttsWithFallback";
import { videoWithFallback } from "./videoWithFallback";

// Environment variables
const ELEVENLABS_API_KEY =
  import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const HUGGINGFACE_API_KEY =
  import.meta.env.VITE_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
const OPENAI_API_KEY =
  import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const USE_OPENAI_TTS = import.meta.env.VITE_USE_OPENAI_TTS !== "false"; // Default to true

export interface VideoAnalysis {
  detectedRooms: string[];
  keyFeatures: string[];
  imageQuality: {
    overall: number;
    lighting: number;
    composition: number;
  };
  suggestedOrder: number[];
}

export interface VideoScript {
  intro: string;
  scenes: {
    imageIndex: number;
    narration: string;
    duration: number;
  }[];
  outro: string;
  totalDuration: number;
}

export interface VideoGenerationResult {
  videoId: string;
  masterVideoUrl: string; // MP4 with audio already mixed in
  platformVersions: {
    tiktok?: { url: string; duration: number };
    instagram?: { url: string; duration: number };
    youtube?: { url: string; duration: number };
  };
}

export interface PublishResult {
  platform: "tiktok" | "instagram" | "youtube";
  success: boolean;
  url?: string;
  error?: string;
}

class VideoGenerationService {
  // Demo property data for consistent testing
  private demoProperty = {
    address: "123 Luxury Lane, Beverly Hills, CA 90210",
    rooms: [
      "Grand Living Room",
      "Gourmet Kitchen",
      "Master Suite",
      "Resort-Style Backyard",
      "Spa Bathroom",
    ],
    features: [
      "Marble Floors",
      "Custom Cabinetry",
      "Walk-in Closet",
      "Infinity Pool",
      "Rain Shower",
    ],
    script:
      "Welcome to 123 Luxury Lane, where modern luxury meets timeless elegance in the heart of Beverly Hills.",
  };

  // Selected voice ID (can be changed dynamically)
  public selectedVoiceId: string = "21m00Tcm4TlvDq8ikWAM";

  constructor() {
    // Debug logging
    console.log("Video Generation Service initialized:", {
      elevenlabsConfigured: !!ELEVENLABS_API_KEY,
      huggingfaceConfigured: !!HUGGINGFACE_API_KEY,
    });
  }

  // AI image analysis using demo content
  async analyzeImages(images: File[]): Promise<VideoAnalysis> {
    try {
      // Validate inputs
      if (!images || images.length === 0) {
        throw new Error("No images provided for analysis");
      }

      if (images.length > 20) {
        throw new Error(
          "Too many images. Maximum 20 images allowed for processing.",
        );
      }

      // Check total file size to prevent memory issues
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      if (totalSize > maxSize) {
        throw new Error(
          "Images are too large. Please reduce file sizes or image count.",
        );
      }

      const steps = [
        { message: "Validating images...", delay: 500 },
        { message: "Detecting rooms...", delay: 800 },
        { message: "Identifying key features...", delay: 700 },
        { message: "Evaluating image quality...", delay: 600 },
        { message: "Optimizing composition...", delay: 900 },
        { message: "Analysis complete!", delay: 500 },
      ];

      // Simulate step-by-step processing with potential failures
      for (const step of steps) {
        await this.delay(step.delay);

        // Simulate occasional network hiccups (5% chance)
        if (Math.random() < 0.05) {
          throw new Error("Network connection interrupted during analysis");
        }
      }

      // Use demo property data for consistent results
      return {
        detectedRooms: this.demoProperty.rooms.slice(
          0,
          Math.min(images.length, 5),
        ),
        keyFeatures: this.demoProperty.features.slice(
          0,
          Math.min(images.length, 5),
        ),
        imageQuality: {
          overall: Math.max(85, 92 - Math.max(0, images.length - 5) * 2), // Quality decreases with more images
          lighting: Math.max(80, 88 - Math.max(0, images.length - 5) * 3),
          composition: Math.max(85, 95 - Math.max(0, images.length - 5) * 2),
        },
        suggestedOrder: images.map((_, index) => index),
      };
    } catch (error) {
      console.error("Image analysis failed:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        // Re-throw validation errors directly
        if (
          error.message.includes("No images") ||
          error.message.includes("Too many") ||
          error.message.includes("too large")
        ) {
          throw error;
        }

        // Handle network/API errors with retry logic
        if (
          error.message.includes("Network") ||
          error.message.includes("connection")
        ) {
          throw new Error(
            "Image analysis failed due to network issues. Please check your connection and try again.",
          );
        }
      }

      // Generic fallback error
      throw new Error(
        "Image analysis failed. Please try again or contact support if the problem persists.",
      );
    }
  }

  // Generate AI script with enhanced demo content
  async generateScript(
    listing: Listing,
    analysis: VideoAnalysis,
    style: string = "modern",
  ): Promise<VideoScript> {
    try {
      // Validate inputs
      if (!listing) {
        throw new Error(
          "Property listing data is required for script generation",
        );
      }

      if (
        !analysis ||
        !analysis.detectedRooms ||
        analysis.detectedRooms.length === 0
      ) {
        throw new Error(
          "Image analysis data is required for script generation",
        );
      }

      const validStyles = ["modern", "luxury", "family"];
      if (!validStyles.includes(style)) {
        console.warn(`Invalid style "${style}", defaulting to "modern"`);
        style = "modern";
      }

      // Simulate AI processing with potential failures
      await this.delay(1500);

      // Simulate occasional API failures (1% chance - reduced for better demo)
      if (Math.random() < 0.01) {
        throw new Error("Script generation service temporarily unavailable");
      }

      await this.delay(1000); // Additional processing time

      // Use actual listing data if available, otherwise fall back to demo
      const address = listing.address || this.demoProperty.address;
      const price = listing.price || 15750000;
      const bedrooms = listing.bedrooms || 7;
      const bathrooms = listing.bathrooms || 9;
      const sqft = listing.sqft || 12500;
      const propertyFeatures =
        (listing as any).features || this.demoProperty.features;
      const description = (listing as any).description || "";

      const styleTemplates = {
        modern: {
          intro: `Welcome to this stunning ${bedrooms}-bedroom, ${bathrooms}-bathroom modern estate at ${address}. With ${sqft.toLocaleString()} square feet of pure luxury, this contemporary masterpiece redefines modern living.`,
          outro: `This exceptional ${sqft.toLocaleString()} square foot estate is offered at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}. Don't miss this rare opportunity - schedule your private viewing today!`,
        },
        luxury: {
          intro: `Experience unparalleled luxury at ${address}, a magnificent ${bedrooms}-bedroom estate spanning ${sqft.toLocaleString()} square feet of pure elegance. This architectural masterpiece represents the pinnacle of sophisticated living.`,
          outro: `This extraordinary estate, offered at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}, is more than a home - it's a lifestyle. Contact us today for an exclusive private showing.`,
        },
        family: {
          intro: `Discover your family's dream home at ${address}. This spacious ${bedrooms}-bedroom, ${bathrooms}-bathroom sanctuary offers ${sqft.toLocaleString()} square feet where cherished memories will be made for generations.`,
          outro: `Your family's next chapter begins in this beautiful ${sqft.toLocaleString()} square foot home, thoughtfully priced at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}. Let's schedule a family tour today!`,
        },
      };

      const template =
        styleTemplates[style as keyof typeof styleTemplates] ||
        styleTemplates.modern;

      // Enhanced scene generation using property features
      const scenes = analysis.detectedRooms.map((room, index) => ({
        imageIndex: index,
        narration: this.generateEnhancedSceneNarration(
          room,
          analysis.keyFeatures[index],
          propertyFeatures,
          style,
        ),
        duration: 10, // Slightly shorter scenes for better pacing
      }));

      return {
        intro: template.intro,
        scenes,
        outro: template.outro,
        totalDuration:
          scenes.reduce((sum, scene) => sum + scene.duration, 0) + 15, // +15 for intro/outro
      };
    } catch (error) {
      console.error("Script generation failed:", error);

      if (error instanceof Error) {
        // Re-throw validation errors directly
        if (error.message.includes("required for script generation")) {
          throw error;
        }

        // Handle API/service errors
        if (error.message.includes("service temporarily unavailable")) {
          throw new Error(
            "Script generation service is temporarily unavailable. Please try again in a few moments.",
          );
        }
      }

      // Generic fallback error
      throw new Error(
        "Failed to generate video script. Please try again or contact support if the problem persists.",
      );
    }
  }

  // Generate voice preview using OpenAI TTS
  async generateVoicePreview(
    text: string,
    voiceId: string,
  ): Promise<string | null> {
    try {
      console.log(`🎙️ Generating voice preview with ${voiceId}...`);

      // Use OpenAI TTS client for voice preview
      const audioUrl = await openaiTTSClient.generateSpeech(text, {
        voice: voiceId as any, // OpenAI voice ID
        speed: 1.0,
        model: "tts-1", // Use standard quality for faster preview generation
      });

      console.log("✅ Voice preview generated successfully");
      return audioUrl;
    } catch (error) {
      console.error("❌ Voice preview generation failed:", error);
      return null;
    }
  }

  // Generate voiceover using fallback chain
  async generateVoiceover(
    script: VideoScript,
    onProviderChange?: (providerId: string, providerName: string) => void,
  ): Promise<string | null> {
    try {
      return await ttsWithFallback.generateSpeech(
        script,
        undefined,
        onProviderChange,
      );
    } catch (error) {
      console.error("All TTS providers failed:", error);
      return null;
    }
  }

  // Generate voiceover using OpenAI TTS
  private async generateVoiceoverWithOpenAI(
    script: VideoScript,
  ): Promise<string | null> {
    console.log("🎙️ Generating voiceover with OpenAI TTS...");

    try {
      // Combine all script parts into full narration
      const fullScript = `${script.intro} ${script.scenes.map((s) => s.narration).join(" ")} ${script.outro}`;

      // Estimate cost
      const estimatedCost = openaiTTSClient.estimateCost(fullScript);
      console.log(`💰 Estimated OpenAI TTS cost: $${estimatedCost.toFixed(4)}`);

      // Generate speech
      const audioUrl = await openaiTTSClient.generateSpeech(fullScript, {
        voice: "nova", // Professional female voice
        speed: 1.0, // Normal speed
        model: "tts-1", // Standard quality for faster generation
      });

      console.log("✅ OpenAI TTS voiceover generated successfully");

      // Register audio blob URL for cleanup
      resourceManagementService.registerResource(
        "blob_url",
        audioUrl,
        { type: "audio", service: "openai", size: 0 }, // Size not available for data URLs
      );

      return audioUrl;
    } catch (error) {
      console.error("❌ OpenAI TTS error:", error);
      console.log("🔇 Continuing without audio due to API error");
      return null;
    }
  }

  // Original ElevenLabs implementation (as fallback)
  private async generateVoiceoverWithElevenLabs(
    script: VideoScript,
  ): Promise<string | null> {
    console.log("Generating voiceover with ElevenLabs...");

    if (!ELEVENLABS_API_KEY) {
      console.warn("ElevenLabs API key not found, skipping audio generation");
      await this.delay(1000); // Simulate processing time
      return null; // Return null to indicate no audio
    }

    try {
      // Combine all script parts into full narration
      const fullScript = `${script.intro} ${script.scenes.map((s) => s.narration).join(" ")} ${script.outro}`;
      console.log(
        "Sending script to ElevenLabs:",
        fullScript.substring(0, 100) + "...",
      );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.selectedVoiceId}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: fullScript,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error response:", errorText);
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const audioBlob = await response.blob();

      // Create object URL for the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("✅ ElevenLabs voiceover generated successfully:", audioUrl);

      // Register audio blob URL for cleanup
      resourceManagementService.registerResource("blob_url", audioUrl, {
        type: "audio",
        service: "elevenlabs",
        size: audioBlob.size,
      });

      return audioUrl;
    } catch (error) {
      console.error("❌ ElevenLabs API error:", error);
      console.log("🔇 Continuing without audio due to API error");
      // Return null to indicate no audio should be used
      return null;
    }
  }

  // Generate video with URLs (for demo properties)
  async generateVideoWithUrls(
    imageUrls: string[],
    script: VideoScript,
    onProgress?: (progress: number, message: string) => void,
    propertyInfo?: {
      address: string;
      price: string;
      beds: number;
      baths: number;
      sqft: number;
    },
  ): Promise<VideoGenerationResult> {
    const videoId = `video_${Date.now()}`;

    try {
      // Validate inputs
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("No image URLs provided for video generation");
      }

      if (!script) {
        throw new Error("Script is required for video generation");
      }

      onProgress?.(10, "Validating assets...");

      // Step 1: Generate voiceover
      onProgress?.(20, "Generating professional voiceover...");
      let audioUrl = await this.generateVoiceover(
        script,
        (providerId, providerName) => {
          onProgress?.(25, `Using ${providerName} for voiceover...`);
        },
      );

      // Step 2: Call Remotion API with URLs
      onProgress?.(40, "Creating professional video...");

      const response = await fetch("/api/generate-remotion-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imageUrls,
          audioUrl,
          propertyInfo: propertyInfo || {
            address: "1245 Benedict Canyon Drive, Beverly Hills, CA 90210",
            price: "$15,750,000",
            beds: 7,
            baths: 9,
            sqft: 12500,
          },
          transitionType: "fade",
          imageDuration: 5,
          platform: "youtube",
        }),
      });

      if (!response.ok) {
        throw new Error(`Remotion API failed with status: ${response.status}`);
      }

      const result = await response.json();

      onProgress?.(90, "Optimizing for social platforms...");
      await this.delay(500);

      onProgress?.(100, "Video ready!");

      return {
        videoId: result.videoId || videoId,
        masterVideoUrl: result.videoUrl,
        platformVersions: {
          tiktok: { url: result.videoUrl, duration: 60 },
          instagram: { url: result.videoUrl, duration: 90 },
          youtube: { url: result.videoUrl, duration: script.totalDuration },
        },
      };
    } catch (error) {
      console.error("Video generation error:", error);
      throw error;
    }
  }

  // Generate video using Hugging Face Stable Video Diffusion
  async generateVideo(
    images: File[],
    script: VideoScript,
    onProgress?: (progress: number, message: string) => void,
  ): Promise<VideoGenerationResult> {
    const videoId = `video_${Date.now()}`;

    try {
      // Validate inputs
      if (!images || images.length === 0) {
        throw new Error("No images provided for video generation");
      }

      if (!script) {
        throw new Error("Script is required for video generation");
      }

      // Check for memory constraints
      const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
      const maxSize = 200 * 1024 * 1024; // 200MB limit for video generation
      if (totalImageSize > maxSize) {
        throw new Error(
          "Images are too large for video processing. Please reduce file sizes.",
        );
      }

      onProgress?.(10, "Validating assets...");
      await this.delay(500);
      // Step 1: Generate voiceover with fallback chain
      onProgress?.(20, "Generating professional voiceover...");
      let audioUrl = await this.generateVoiceover(
        script,
        (providerId, providerName) => {
          onProgress?.(25, `Using ${providerName} for voiceover...`);
        },
      );

      // If audio generation failed, continue without it
      if (!audioUrl) {
        console.log("⚠️ Proceeding without audio narration");
        onProgress?.(30, "Creating video without narration...");
      }

      // Step 2: Generate video with fallback chain
      onProgress?.(40, "Creating professional video...");

      const videoResult = await videoWithFallback.generateVideo(
        images,
        script,
        audioUrl || undefined,
        {
          quality: "medium",
          duration: 4,
          transition: "fade",
          fps: 30,
        },
        (providerId, providerName) => {
          onProgress?.(60, `Using ${providerName} for video generation...`);
        },
        (progress, message) => {
          // Map internal progress to our range (40-90)
          const mappedProgress = 40 + (progress / 100) * 50;
          onProgress?.(mappedProgress, message);
        },
      );

      // Step 3: Platform optimization
      onProgress?.(90, "Optimizing for social platforms...");
      await this.delay(500);

      onProgress?.(100, "Video ready!");

      return {
        videoId: videoResult.videoId,
        masterVideoUrl: videoResult.videoUrl,
        platformVersions: {
          tiktok: { url: videoResult.videoUrl, duration: 60 },
          instagram: { url: videoResult.videoUrl, duration: 90 },
          youtube: {
            url: videoResult.videoUrl,
            duration: script.totalDuration,
          },
        },
      };
    } catch (error) {
      console.error("Video generation error:", error);

      if (error instanceof Error) {
        // Re-throw validation errors directly
        if (
          error.message.includes("No images provided") ||
          error.message.includes("Script is required") ||
          error.message.includes("too large for video processing")
        ) {
          onProgress?.(100, "Video generation failed");
          throw error;
        }

        // Handle memory/resource errors
        if (
          error.message.includes("memory") ||
          error.message.includes("heap")
        ) {
          onProgress?.(
            100,
            "Video generation failed due to insufficient memory",
          );
          throw new Error(
            "Insufficient memory to generate video. Please try with fewer or smaller images.",
          );
        }

        // Handle network/API errors - try to provide fallback
        if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("API")
        ) {
          console.log(
            "Network error encountered, attempting fallback generation...",
          );
          onProgress?.(90, "Primary service failed, using fallback method...");

          try {
            // Attempt fallback video generation using just the slideshow service
            const fallbackVideoUrl =
              await slideshowVideoService.createSlideshow(
                images,
                null, // No audio for fallback
                {
                  duration: 4,
                  transition: "fade",
                  fps: 24, // Lower FPS for better performance
                },
              );

            onProgress?.(100, "Video generated using fallback method");
            return {
              videoId,
              masterVideoUrl: fallbackVideoUrl,
              platformVersions: {
                tiktok: { url: fallbackVideoUrl, duration: 60 },
                instagram: { url: fallbackVideoUrl, duration: 90 },
                youtube: {
                  url: fallbackVideoUrl,
                  duration: script.totalDuration,
                },
              },
            };
          } catch (fallbackError) {
            console.error(
              "Fallback video generation also failed:",
              fallbackError,
            );
            onProgress?.(100, "Video generation failed");
            throw new Error(
              "Video generation failed. All backup methods exhausted. Please try again later.",
            );
          }
        }
      }

      // Last resort fallback with mock URLs (for testing/demo purposes)
      console.warn("Generating mock video result due to complete failure");
      onProgress?.(100, "Video generation completed with placeholder");

      return {
        videoId,
        masterVideoUrl: `/api/videos/fallback/placeholder.mp4`,
        platformVersions: {
          tiktok: { url: `/api/videos/fallback/tiktok.mp4`, duration: 60 },
          instagram: {
            url: `/api/videos/fallback/instagram.mp4`,
            duration: 90,
          },
          youtube: {
            url: `/api/videos/fallback/youtube.mp4`,
            duration: script.totalDuration,
          },
        },
      };
    }
  }

  // Generate video using Hugging Face Stable Video Diffusion
  private async generateVideoWithHuggingFace(image: File): Promise<string> {
    console.log("Generating video with Hugging Face SVD...");

    const formData = new FormData();
    formData.append("inputs", image);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt",
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error response:", errorText);
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorText}`,
      );
    }

    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    console.log("✅ Hugging Face video generated successfully:", videoUrl);
    return videoUrl;
  }

  // Optimize video for specific platforms
  async optimizeForPlatforms(
    videoId: string,
    platforms: ("tiktok" | "instagram" | "youtube")[],
    onProgress?: (platform: string, message: string) => void,
  ): Promise<void> {
    for (const platform of platforms) {
      const messages = {
        tiktok: [
          "Selecting best moments...",
          "Adjusting to 9:16 ratio...",
          "Adding trending music...",
        ],
        instagram: [
          "Optimizing for Reels...",
          "Adjusting pacing...",
          "Enhancing colors...",
        ],
        youtube: [
          "Preparing full tour...",
          "Adding chapters...",
          "Optimizing quality...",
        ],
      };

      for (const message of messages[platform]) {
        onProgress?.(platform, message);
        await this.delay(800);
      }
    }
  }

  // Simulate publishing to platforms
  async publishToPlatform(
    videoId: string,
    platform: "tiktok" | "instagram" | "youtube",
  ): Promise<PublishResult> {
    await this.delay(2000 + Math.random() * 1000); // 2-3 seconds

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      return {
        platform,
        success: true,
        url: `https://${platform}.com/watch/${videoId}_${Date.now()}`,
      };
    } else {
      return {
        platform,
        success: false,
        error: "Network timeout. Please try again.",
      };
    }
  }

  // Helper methods
  private generateSceneNarration(room: string, feature: string): string {
    // More descriptive templates for luxury properties
    const templates = [
      `This stunning ${room} features ${feature}, creating a perfect blend of style and functionality.`,
      `The ${room} showcases ${feature}, offering an ideal space for modern luxury living.`,
      `Notice the ${feature} in this beautiful ${room}, a testament to exceptional craftsmanship and attention to detail.`,
      `Step into the ${room} where ${feature} creates an atmosphere of refined elegance.`,
      `The spacious ${room} boasts ${feature}, exemplifying the home's commitment to luxury and comfort.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Enhanced scene narration using Beverly Hills mansion features
  private generateEnhancedSceneNarration(
    room: string,
    feature: string,
    propertyFeatures: string[],
    style: string,
  ): string {
    // Beverly Hills mansion specific features for compelling narration
    const beverlyHillsFeatures = {
      "living room": [
        "floating glass staircase with LED lighting creates a dramatic centerpiece",
        "floor-to-ceiling windows showcase breathtaking city views",
        "custom Italian leather seating and handcrafted furnishings",
      ],
      kitchen: [
        "Chef's kitchen with La Cornue range and Sub-Zero appliances",
        "Calacatta marble waterfall island perfect for entertaining",
        "temperature-controlled wine room with 1,000+ bottle capacity",
      ],
      "master bedroom": [
        "panoramic views from downtown to the Pacific Ocean",
        "private terrace overlooking the canyon",
        "spa-like ensuite with steam shower and soaking tub",
      ],
      bathroom: [
        "spa-like master bath with steam room amenities",
        "imported marble finishes throughout",
        "rainfall shower with chromotherapy lighting",
      ],
      exterior: [
        "zero-edge infinity pool with integrated spa",
        "rooftop deck with 360° city and ocean views",
        "private motor court with elegant fountain feature",
      ],
      office: [
        "Crestron smart home automation system",
        "built-in custom millwork and storage",
        "private balcony overlooking the canyon",
      ],
      entertainment: [
        "private screening room with 4K laser projection",
        "Dolby Atmos surround sound system",
        "wellness center with professional gym equipment",
      ],
    };

    // Match room type to Beverly Hills features
    const roomType = room.toLowerCase();
    let specificFeatures: string[] = [];

    if (roomType.includes("living") || roomType.includes("great room")) {
      specificFeatures = beverlyHillsFeatures["living room"];
    } else if (roomType.includes("kitchen") || roomType.includes("dining")) {
      specificFeatures = beverlyHillsFeatures["kitchen"];
    } else if (roomType.includes("master") || roomType.includes("bedroom")) {
      specificFeatures = beverlyHillsFeatures["master bedroom"];
    } else if (roomType.includes("bathroom") || roomType.includes("bath")) {
      specificFeatures = beverlyHillsFeatures["bathroom"];
    } else if (
      roomType.includes("exterior") ||
      roomType.includes("pool") ||
      roomType.includes("outdoor")
    ) {
      specificFeatures = beverlyHillsFeatures["exterior"];
    } else if (roomType.includes("office") || roomType.includes("study")) {
      specificFeatures = beverlyHillsFeatures["office"];
    } else {
      specificFeatures = beverlyHillsFeatures["entertainment"];
    }

    const selectedFeature =
      specificFeatures[Math.floor(Math.random() * specificFeatures.length)];

    // Style-specific narration templates
    const styleTemplates = {
      modern: [
        `Step into this stunning ${room} where ${selectedFeature}, exemplifying contemporary luxury design.`,
        `The ${room} showcases ${selectedFeature}, creating the perfect space for modern living.`,
        `This beautifully designed ${room} features ${selectedFeature}, setting a new standard for luxury.`,
      ],
      luxury: [
        `Experience the grandeur of this magnificent ${room}, where ${selectedFeature} represents the pinnacle of luxury living.`,
        `The exquisite ${room} boasts ${selectedFeature}, a testament to uncompromising elegance and sophistication.`,
        `Enter this palatial ${room} featuring ${selectedFeature}, where every detail speaks to refined luxury.`,
      ],
      family: [
        `This welcoming ${room} features ${selectedFeature}, creating the perfect gathering space for family memories.`,
        `The spacious ${room} offers ${selectedFeature}, designed with family living and comfort in mind.`,
        `Your family will love this beautiful ${room} where ${selectedFeature} creates a warm and inviting atmosphere.`,
      ],
    };

    const templates =
      styleTemplates[style as keyof typeof styleTemplates] ||
      styleTemplates.modern;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get mock performance data
  async getVideoAnalytics(videoId: string): Promise<{
    views: number;
    engagement: number;
    shares: number;
    watchTime: number;
  }> {
    await this.delay(500);

    return {
      views: Math.floor(Math.random() * 5000) + 1000,
      engagement: Math.random() * 15 + 5,
      shares: Math.floor(Math.random() * 100) + 10,
      watchTime: Math.random() * 30 + 30, // 30-60% average watch time
    };
  }

  /**
   * Clean up all resources used by the video generation service
   */
  cleanupAllResources(): void {
    console.log("🧹 Cleaning up VideoGenerationService resources");

    // Cleanup slideshow service resources
    slideshowVideoService.cleanup();

    // Cleanup all registered resources
    resourceManagementService.cleanupAll();

    // Force garbage collection if available
    resourceManagementService.forceGarbageCollection();

    console.log("✅ VideoGenerationService cleanup complete");
  }

  /**
   * Get current resource usage statistics
   */
  getResourceStats() {
    return resourceManagementService.getResourceStats();
  }

  /**
   * Get memory recommendations based on current usage
   */
  getMemoryRecommendations(): string[] {
    return resourceManagementService.getMemoryRecommendations();
  }

  /**
   * Get TTS service status and available providers
   */
  getTTSStatus() {
    return ttsWithFallback.getStatus();
  }

  /**
   * Get video generation service status
   */
  getVideoStatus() {
    return videoWithFallback.getStatus();
  }

  /**
   * Test all TTS providers
   */
  async testTTSProviders(): Promise<Record<string, boolean>> {
    const testScript: VideoScript = {
      intro: "Testing voice generation",
      scenes: [],
      outro: "",
      totalDuration: 3,
    };
    return await ttsWithFallback.testAllProviders();
  }

  /**
   * Get comprehensive service health status
   */
  async getServiceHealth(): Promise<{
    tts: any;
    video: any;
    resources: any;
    recommendations: string[];
  }> {
    return {
      tts: this.getTTSStatus(),
      video: this.getVideoStatus(),
      resources: this.getResourceStats(),
      recommendations: [
        ...this.getMemoryRecommendations(),
        ...resourceManagementService.getMemoryRecommendations(),
      ],
    };
  }
}

export const videoGenerationService = new VideoGenerationService();
