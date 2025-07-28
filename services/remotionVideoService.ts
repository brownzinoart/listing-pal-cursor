import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface RemotionVideoOptions {
  images: string[];
  audioUrl?: string;
  propertyInfo: {
    address: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
  };
  transitionType?: "fade" | "slide" | "zoom";
  imageDuration?: number;
  platform?: "youtube" | "tiktok" | "instagram";
}

export class RemotionVideoService {
  private bundled: string | null = null;

  /**
   * Initialize the Remotion bundle
   */
  private async initBundle() {
    if (this.bundled) return this.bundled;

    console.log("🎬 Bundling Remotion project...");

    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), "remotion/index.ts"),
      // Use webpack override for Next.js compatibility
      webpackOverride: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            fallback: {
              ...config.resolve?.fallback,
              fs: false,
              path: false,
            },
          },
        };
      },
    });

    this.bundled = bundled;
    console.log("✅ Remotion bundle ready");
    return bundled;
  }

  /**
   * Generate a property video using Remotion
   */
  async generateVideo(
    options: RemotionVideoOptions,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    try {
      // Get the bundle
      const bundleLocation = await this.initBundle();

      // Select composition based on platform
      const compositionId =
        options.platform === "tiktok"
          ? "PropertySlideshowTikTok"
          : options.platform === "instagram"
            ? "PropertySlideshowInstagram"
            : "PropertySlideshow";

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {
          images: options.images,
          audioUrl: options.audioUrl,
          propertyInfo: options.propertyInfo,
          transitionType: options.transitionType || "fade",
          imageDuration: options.imageDuration || 5,
          platform: options.platform,
        },
      });

      console.log(`🎥 Rendering ${compositionId} video...`);

      // Generate unique filename
      const videoId = uuidv4();
      const outputPath = path.join(
        process.cwd(),
        "public",
        "videos",
        `${videoId}.mp4`,
      );

      // Render the video
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
          images: options.images,
          audioUrl: options.audioUrl,
          propertyInfo: options.propertyInfo,
          transitionType: options.transitionType || "fade",
          imageDuration: options.imageDuration || 5,
          platform: options.platform,
        },
        onProgress: ({ progress }) => {
          console.log(`⏳ Rendering progress: ${Math.round(progress * 100)}%`);
          onProgress?.(progress);
        },
      });

      console.log("✅ Video rendered successfully:", outputPath);

      // Return the public URL
      return `/videos/${videoId}.mp4`;
    } catch (error) {
      console.error("❌ Remotion video generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate videos for all platforms
   */
  async generateAllPlatformVideos(
    options: Omit<RemotionVideoOptions, "platform">,
    onProgress?: (platform: string, progress: number) => void,
  ): Promise<{
    youtube: string;
    tiktok: string;
    instagram: string;
  }> {
    const results = {
      youtube: "",
      tiktok: "",
      instagram: "",
    };

    // Generate YouTube version (standard 16:9)
    results.youtube = await this.generateVideo(
      { ...options, platform: "youtube" },
      (progress) => onProgress?.("youtube", progress),
    );

    // Generate TikTok version (9:16, 60 seconds max)
    results.tiktok = await this.generateVideo(
      { ...options, platform: "tiktok", imageDuration: 4 },
      (progress) => onProgress?.("tiktok", progress),
    );

    // Generate Instagram version (9:16, 90 seconds max)
    results.instagram = await this.generateVideo(
      { ...options, platform: "instagram", imageDuration: 5 },
      (progress) => onProgress?.("instagram", progress),
    );

    return results;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.bundled = null;
  }
}

export const remotionVideoService = new RemotionVideoService();
