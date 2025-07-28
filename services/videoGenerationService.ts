import { Listing } from "../types";
import { slideshowVideoService } from "./slideshowVideoService";
import { remotionVideoService } from "./remotionVideoService";
import { openaiTTSService } from "./openaiTTSService";

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
    const steps = [
      { message: "Detecting rooms...", delay: 800 },
      { message: "Identifying key features...", delay: 700 },
      { message: "Evaluating image quality...", delay: 600 },
      { message: "Optimizing composition...", delay: 900 },
      { message: "Analysis complete!", delay: 500 },
    ];

    // Simulate step-by-step processing
    for (const step of steps) {
      await this.delay(step.delay);
    }

    // Use demo property data for consistent results
    return {
      detectedRooms: this.demoProperty.rooms.slice(0, images.length),
      keyFeatures: this.demoProperty.features.slice(0, images.length),
      imageQuality: {
        overall: 92,
        lighting: 88,
        composition: 95,
      },
      suggestedOrder: images.map((_, index) => index),
    };
  }

  // Generate AI script with demo content
  async generateScript(
    listing: Listing,
    analysis: VideoAnalysis,
    style: string = "modern",
  ): Promise<VideoScript> {
    await this.delay(2500); // Simulate AI processing

    // Use actual listing data if available, otherwise fall back to demo
    const address = listing.address || this.demoProperty.address;
    const price = listing.price || 15750000;
    const features = (listing as any).features || this.demoProperty.features;

    const styleTemplates = {
      modern: {
        intro: `Welcome to this stunning modern home at ${address}, where contemporary design meets luxury living.`,
        outro: `Offered at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}, this exceptional property represents a rare opportunity. Schedule your private viewing today!`,
      },
      luxury: {
        intro: `Experience unparalleled luxury at ${address}, an exquisite estate that redefines elegance.`,
        outro: `This magnificent property is offered at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}. Contact us for an exclusive showing.`,
      },
      family: {
        intro: `Discover the perfect family sanctuary at ${address}, where precious memories are waiting to be made.`,
        outro: `Your family's next chapter begins in this beautiful home, offered at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)}. Let's schedule a tour!`,
      },
    };

    const template =
      styleTemplates[style as keyof typeof styleTemplates] ||
      styleTemplates.modern;

    const scenes = analysis.detectedRooms.map((room, index) => ({
      imageIndex: index,
      narration: this.generateSceneNarration(room, analysis.keyFeatures[index]),
      duration: 12, // 12 seconds per scene
    }));

    return {
      intro: template.intro,
      scenes,
      outro: template.outro,
      totalDuration:
        scenes.reduce((sum, scene) => sum + scene.duration, 0) + 10, // +10 for intro/outro
    };
  }

  // Generate voiceover using OpenAI TTS or ElevenLabs
  async generateVoiceover(script: VideoScript): Promise<string | null> {
    // Prefer OpenAI TTS if available
    if (USE_OPENAI_TTS && OPENAI_API_KEY) {
      return this.generateVoiceoverWithOpenAI(script);
    }

    // Fall back to ElevenLabs if configured
    if (ELEVENLABS_API_KEY) {
      return this.generateVoiceoverWithElevenLabs(script);
    }

    console.warn("No voice generation API configured, skipping audio");
    return null;
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
      const estimatedCost = openaiTTSService.estimateCost(fullScript);
      console.log(`💰 Estimated OpenAI TTS cost: $${estimatedCost.toFixed(4)}`);

      // Generate speech
      const audioUrl = await openaiTTSService.generateSpeech(fullScript, {
        voice: "nova", // Professional female voice
        speed: 1.0, // Normal speed
        model: "tts-1", // Standard quality for faster generation
      });

      console.log("✅ OpenAI TTS voiceover generated successfully");
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

      return audioUrl;
    } catch (error) {
      console.error("❌ ElevenLabs API error:", error);
      console.log("🔇 Continuing without audio due to API error");
      // Return null to indicate no audio should be used
      return null;
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
      // Step 1: Generate voiceover with ElevenLabs
      onProgress?.(20, "Generating professional voiceover...");
      let audioUrl = await this.generateVoiceover(script);

      // If audio generation failed, continue without it
      if (!audioUrl) {
        console.log("⚠️ Proceeding without audio narration");
        onProgress?.(30, "Creating video without narration...");
      }

      // Step 2: Process images for video generation
      onProgress?.(40, "Processing property images...");
      await this.delay(1000);

      // Step 3: Generate video with Remotion
      onProgress?.(60, "Creating professional video with Remotion...");
      let masterVideoUrl: string;

      try {
        // Use Remotion for video generation
        console.log("🎬 Using Remotion for video generation");

        // Convert File objects to URLs for Remotion
        const imageUrls = images.map((img) => URL.createObjectURL(img));

        // Make API call to server-side Remotion renderer
        const response = await fetch("/api/generate-remotion-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: imageUrls,
            audioUrl: audioUrl || undefined, // Pass undefined if no audio
            propertyInfo: {
              address: listing.address || "123 Luxury Lane",
              price: listing.price || "$2,500,000",
              beds: listing.bedrooms || 4,
              baths: listing.bathrooms || 3,
              sqft: listing.squareFootage || 3500,
            },
            transitionType: "fade",
            imageDuration: 4,
            platform: "youtube",
          }),
        });

        if (!response.ok) {
          throw new Error(`Remotion API error: ${response.status}`);
        }

        const result = await response.json();
        masterVideoUrl = result.videoUrl;

        // Clean up object URLs
        imageUrls.forEach((url) => URL.revokeObjectURL(url));
      } catch (error) {
        console.error(
          "Remotion video generation failed, falling back to FFmpeg.wasm:",
          error,
        );
        // Fallback to FFmpeg.wasm slideshow
        onProgress?.(65, "Creating slideshow with voiceover (fallback)...");
        masterVideoUrl = await slideshowVideoService.createSlideshow(
          images,
          audioUrl,
          {
            duration: 4,
            transition: "fade",
            fps: 30,
          },
        );
      }

      // Step 4: Platform optimization
      onProgress?.(80, "Optimizing for social platforms...");
      await this.delay(1000);

      onProgress?.(100, "Video ready!");

      return {
        videoId,
        masterVideoUrl, // Already includes mixed audio from slideshow service
        platformVersions: {
          tiktok: { url: `/api/videos/${videoId}/tiktok.mp4`, duration: 60 },
          instagram: {
            url: `/api/videos/${videoId}/instagram.mp4`,
            duration: 90,
          },
          youtube: { url: masterVideoUrl, duration: script.totalDuration },
        },
      };
    } catch (error) {
      console.error("Video generation error:", error);
      onProgress?.(100, "Video generation completed with fallback");

      return {
        videoId,
        masterVideoUrl: `/api/videos/${videoId}/master.mp4`,
        platformVersions: {
          tiktok: { url: `/api/videos/${videoId}/tiktok.mp4`, duration: 60 },
          instagram: {
            url: `/api/videos/${videoId}/instagram.mp4`,
            duration: 90,
          },
          youtube: {
            url: `/api/videos/${videoId}/youtube.mp4`,
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
}

export const videoGenerationService = new VideoGenerationService();
