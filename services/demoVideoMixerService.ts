import { slideshowVideoService } from './slideshowVideoService';
import { resourceManagementService } from './resourceManagementService';

export interface MixedVideoResult {
  videoUrl: string;
  voiceId: string;
  cached: boolean;
  mixDuration: number;
}

/**
 * Demo Video Mixer Service
 * Combines pre-made base video with selected voice audio
 */
export class DemoVideoMixerService {
  private mixedVideoCache: Map<string, string> = new Map();
  private baseVideoUrl = '/demo-videos/beverly-hills-base.mp4';
  private voicesBaseUrl = '/demo-videos/voices/';
  
  /**
   * Mix base video with selected voice
   */
  async mixVideoWithVoice(
    voiceId: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<MixedVideoResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `beverly-hills-${voiceId}`;
    if (this.mixedVideoCache.has(cacheKey)) {
      console.log(`🎯 Using cached video for voice: ${voiceId}`);
      return {
        videoUrl: this.mixedVideoCache.get(cacheKey)!,
        voiceId,
        cached: true,
        mixDuration: 0
      };
    }
    
    try {
      onProgress?.(10, `Loading base video...`);
      
      // Load base video
      const baseVideoResponse = await fetch(this.baseVideoUrl);
      if (!baseVideoResponse.ok) {
        throw new Error('Base video not found');
      }
      const baseVideoBlob = await baseVideoResponse.blob();
      
      onProgress?.(30, `Loading ${voiceId} voice...`);
      
      // Load voice audio
      const voiceUrl = `${this.voicesBaseUrl}${voiceId}.mp3`;
      const voiceResponse = await fetch(voiceUrl);
      if (!voiceResponse.ok) {
        throw new Error(`Voice file not found for: ${voiceId}`);
      }
      
      onProgress?.(50, `Mixing audio with video...`);
      
      // Convert voice response to blob URL for mixing
      const voiceBlob = await voiceResponse.blob();
      const voiceBlobUrl = URL.createObjectURL(voiceBlob);
      
      // Register voice blob URL for cleanup
      resourceManagementService.registerResource(
        'blob_url',
        voiceBlobUrl,
        { type: 'audio', voice: voiceId, size: voiceBlob.size }
      );
      
      // Create base video file for slideshow service
      const baseVideoFile = new File([baseVideoBlob], 'base-video.mp4', { type: 'video/mp4' });
      
      // Use slideshow service's merge functionality
      const mergedVideoUrl = await slideshowVideoService.mergeAudioVideoFromBlobs(
        baseVideoFile,
        voiceBlobUrl
      );
      
      onProgress?.(90, `Finalizing video...`);
      
      // Cache the result
      this.mixedVideoCache.set(cacheKey, mergedVideoUrl);
      
      // Register mixed video for cleanup
      resourceManagementService.registerResource(
        'mixed_video',
        mergedVideoUrl,
        { 
          type: 'video_with_audio', 
          voice: voiceId,
          cached: true
        }
      );
      
      onProgress?.(100, `Video ready with ${voiceId} voice!`);
      
      const mixDuration = Date.now() - startTime;
      console.log(`✅ Mixed video created in ${mixDuration}ms`);
      
      return {
        videoUrl: mergedVideoUrl,
        voiceId,
        cached: false,
        mixDuration
      };
      
    } catch (error) {
      console.error('❌ Video mixing failed:', error);
      
      // Fallback to base video without audio
      console.log('⚠️ Falling back to base video without audio');
      return {
        videoUrl: this.baseVideoUrl,
        voiceId,
        cached: false,
        mixDuration: Date.now() - startTime
      };
    }
  }
  
  /**
   * Pre-cache popular voice combinations
   */
  async preCachePopularVoices(voiceIds: string[] = ['nova', 'echo']): Promise<void> {
    console.log('🔄 Pre-caching popular voice combinations...');
    
    for (const voiceId of voiceIds) {
      try {
        await this.mixVideoWithVoice(voiceId);
        console.log(`✅ Pre-cached ${voiceId} voice`);
      } catch (error) {
        console.error(`Failed to pre-cache ${voiceId}:`, error);
      }
    }
  }
  
  /**
   * Clear cache and free resources
   */
  clearCache(): void {
    // Clean up cached blob URLs
    for (const [key, url] of this.mixedVideoCache.entries()) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    
    this.mixedVideoCache.clear();
    console.log('🧹 Video cache cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedVideos: this.mixedVideoCache.size,
      voices: Array.from(this.mixedVideoCache.keys()).map(key => key.split('-').pop()),
      totalSize: 'N/A' // Would need to track blob sizes for accurate reporting
    };
  }
}

// Extend slideshow service with direct blob mixing capability
declare module './slideshowVideoService' {
  interface SlideshowVideoService {
    mergeAudioVideoFromBlobs(videoFile: File, audioUrl: string): Promise<string>;
  }
}

// Add the method to slideshow service
slideshowVideoService.mergeAudioVideoFromBlobs = async function(
  videoFile: File,
  audioUrl: string
): Promise<string> {
  // Convert video file to blob
  const videoBlob = new Blob([videoFile], { type: videoFile.type });
  
  // Use existing merge functionality
  return await this.mergeAudioVideo(videoBlob, audioUrl);
};

export const demoVideoMixerService = new DemoVideoMixerService();