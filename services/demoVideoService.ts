import { VideoGenerationResult } from './videoGenerationService';

// Pre-made demo video information
const DEMO_VIDEO_INFO = {
  videoId: 'demo-beverly-hills-001',
  fallbackVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Public sample video as fallback
  duration: 30,
  resolution: '1920x1080',
  propertyInfo: {
    address: '1245 Benedict Canyon Drive, Beverly Hills, CA 90210',
    price: '$15,750,000',
    beds: 7,
    baths: 9,
    sqft: 12500
  }
};

// Available demo voices
const DEMO_VOICES = [
  'nova', 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
];

export class DemoVideoService {
  private videoCache: Map<string, boolean> = new Map();

  /**
   * Get demo video URL for specific voice
   */
  private getDemoVideoUrl(voiceId: string): string {
    return `/demo-videos/beverly-hills-${voiceId}.mp4`;
  }

  /**
   * Check if a demo video exists for a specific voice
   */
  private async checkDemoVideoExists(voiceId: string): Promise<boolean> {
    // Use cache to avoid repeated checks
    if (this.videoCache.has(voiceId)) {
      return this.videoCache.get(voiceId)!;
    }

    try {
      const videoUrl = this.getDemoVideoUrl(voiceId);
      const response = await fetch(videoUrl, { method: 'HEAD' });
      const exists = response.ok;
      this.videoCache.set(voiceId, exists);
      return exists;
    } catch (error) {
      this.videoCache.set(voiceId, false);
      return false;
    }
  }

  /**
   * Get demo video with selected voice
   * Voice selection is the ONLY thing that determines which video plays
   */
  async getDemoVideo(
    propertyId: string,
    voiceId: string = 'nova',
    onProgress?: (progress: number, message: string) => void
  ): Promise<VideoGenerationResult> {
    onProgress?.(10, `Loading demo with ${voiceId} voice...`);

    // Check if pre-made video exists for this voice
    const videoExists = await this.checkDemoVideoExists(voiceId);
    
    let videoUrl: string;
    
    if (videoExists) {
      // Use pre-made demo video for this voice
      videoUrl = this.getDemoVideoUrl(voiceId);
      onProgress?.(100, `✅ ${voiceId.charAt(0).toUpperCase() + voiceId.slice(1)} voice demo ready!`);
      console.log(`✅ Using ${voiceId} voice demo: ${videoUrl}`);
    } else {
      // Fall back to sample video if specific voice demo doesn't exist
      videoUrl = DEMO_VIDEO_INFO.fallbackVideoUrl;
      onProgress?.(100, `Using sample video (${voiceId} demo not available)`);
      console.log(`⚠️ ${voiceId} demo not found, using fallback`);
    }
    
    return {
      videoId: `beverly-hills-${voiceId}`,
      masterVideoUrl: videoUrl,
      platformVersions: {
        tiktok: { 
          url: videoUrl, 
          duration: 60 
        },
        instagram: { 
          url: videoUrl, 
          duration: 90 
        },
        youtube: { 
          url: videoUrl, 
          duration: DEMO_VIDEO_INFO.duration 
        }
      }
    };
  }

  /**
   * Check if a pre-made demo video exists
   */
  hasDemoVideo(propertyId: string): boolean {
    return propertyId === 'beverly-hills-mansion';
  }

  /**
   * Get demo video metadata
   */
  getDemoVideoMetadata() {
    return DEMO_VIDEO_INFO;
  }
}

export const demoVideoService = new DemoVideoService();