/**
 * Video Generation Service with Fallback Chain
 * Manages multiple video generation providers with automatic fallback
 */

import { fallbackChainService, ServiceProvider } from './fallbackChainService';
import { slideshowVideoService } from './slideshowVideoService';
import { remotionVideoService } from './remotionVideoService';
import { VideoScript } from './videoGenerationService';

export interface VideoGenerationOptions {
  quality: 'low' | 'medium' | 'high';
  duration?: number;
  transition?: 'fade' | 'slide' | 'zoom';
  fps?: number;
  platform?: 'youtube' | 'tiktok' | 'instagram';
}

export interface VideoGenerationResult {
  videoId: string;
  videoUrl: string;
  duration: number;
  size: number;
  provider: string;
  quality: string;
}

class VideoWithFallback {
  constructor() {
    this.setupProviders();
  }

  private setupProviders(): void {
    // Remotion Provider (Primary - High Quality)
    const remotionProvider: ServiceProvider = {
      id: 'remotion',
      name: 'Remotion (High Quality)',
      priority: 1,
      isAvailable: true,
      failureCount: 0,
      maxFailures: 2,
      cooldownPeriod: 120000, // 2 minutes
      execute: async (params: {
        images: File[];
        script: VideoScript;
        audioUrl?: string;
        options?: VideoGenerationOptions;
      }) => {
        return await this.generateRemotionVideo(params);
      }
    };

    fallbackChainService.registerProvider('video', remotionProvider);

    // FFmpeg.wasm Slideshow Provider (Secondary - Reliable)
    const ffmpegProvider: ServiceProvider = {
      id: 'ffmpeg-slideshow',
      name: 'FFmpeg Slideshow',
      priority: 2,
      isAvailable: true,
      failureCount: 0,
      maxFailures: 3,
      cooldownPeriod: 30000, // 30 seconds
      execute: async (params: {
        images: File[];
        script: VideoScript;
        audioUrl?: string;
        options?: VideoGenerationOptions;
      }) => {
        return await this.generateFFmpegVideo(params);
      }
    };

    fallbackChainService.registerProvider('video', ffmpegProvider);

    // Canvas-based Simple Video Provider (Tertiary - Basic)
    const canvasProvider: ServiceProvider = {
      id: 'canvas-simple',
      name: 'Canvas Simple Video',
      priority: 3,
      isAvailable: true,
      failureCount: 0,
      maxFailures: 1,
      cooldownPeriod: 10000, // 10 seconds
      execute: async (params: {
        images: File[];
        script: VideoScript;
        audioUrl?: string;
        options?: VideoGenerationOptions;
      }) => {
        return await this.generateCanvasVideo(params);
      }
    };

    fallbackChainService.registerProvider('video', canvasProvider);

    // Static Image Provider (Last Resort)
    const staticProvider: ServiceProvider = {
      id: 'static-image',
      name: 'Static Image Slideshow',
      priority: 99,
      isAvailable: true,
      failureCount: 0,
      maxFailures: 0,
      cooldownPeriod: 0,
      execute: async (params: {
        images: File[];
        script: VideoScript;
        audioUrl?: string;
        options?: VideoGenerationOptions;
      }) => {
        return await this.generateStaticSlideshow(params);
      }
    };

    fallbackChainService.registerProvider('video', staticProvider);
  }

  /**
   * Generate video with automatic fallback
   */
  async generateVideo(
    images: File[],
    script: VideoScript,
    audioUrl?: string,
    options?: VideoGenerationOptions,
    onProviderChange?: (providerId: string, providerName: string) => void,
    onProgress?: (progress: number, message: string) => void
  ): Promise<VideoGenerationResult> {
    if (!images || images.length === 0) {
      throw new Error('No images provided for video generation');
    }

    onProgress?.(10, 'Selecting optimal video generation method...');

    try {
      return await fallbackChainService.executeWithFallback<VideoGenerationResult>(
        'video',
        { images, script, audioUrl, options },
        (providerId, providerName) => {
          onProviderChange?.(providerId, providerName);
          onProgress?.(20, `Using ${providerName} for video generation...`);
        }
      );
    } catch (error) {
      onProgress?.(100, 'Video generation failed');
      throw new Error(`All video generation methods failed: ${error}`);
    }
  }

  /**
   * Generate video using Remotion (highest quality)
   */
  private async generateRemotionVideo(params: {
    images: File[];
    script: VideoScript;
    audioUrl?: string;
    options?: VideoGenerationOptions;
  }): Promise<VideoGenerationResult> {
    const { images, script, audioUrl, options } = params;

    // Convert images to base64 for server transmission
    const imageDataPromises = images.map(async (file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const imageDataUrls = await Promise.all(imageDataPromises);

    // Check if Remotion service is available (server-side)
    try {
      const response = await fetch('/api/generate-remotion-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageDataUrls, // Send base64 data URLs
          audioUrl,
          propertyInfo: {
            address: '1245 Benedict Canyon Drive, Beverly Hills, CA 90210',
            price: '$15,750,000',
            beds: 7,
            baths: 9,
            sqft: 1500
          },
          transitionType: options?.transition || 'fade',
          imageDuration: options?.duration || 5,
          platform: options?.platform || 'youtube'
        })
      });

      if (!response.ok) {
        throw new Error(`Remotion API failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        videoId: `remotion_${Date.now()}`,
        videoUrl: result.videoUrl,
        duration: script.totalDuration,
        size: 0, // Unknown from API
        provider: 'remotion',
        quality: 'high'
      };
    } catch (error) {
      throw new Error(`Remotion generation failed: ${error}`);
    }
  }

  /**
   * Generate video using FFmpeg.wasm slideshow
   */
  private async generateFFmpegVideo(params: {
    images: File[];
    script: VideoScript;
    audioUrl?: string;
    options?: VideoGenerationOptions;
  }): Promise<VideoGenerationResult> {
    const { images, script, audioUrl, options } = params;

    try {
      const videoUrl = await slideshowVideoService.createSlideshow(
        images,
        audioUrl || undefined,
        {
          duration: options?.duration || 4,
          transition: options?.transition || 'fade',
          fps: options?.fps || 30
        }
      );

      return {
        videoId: `ffmpeg_${Date.now()}`,
        videoUrl,
        duration: script.totalDuration,
        size: 0, // Size unknown from blob URL
        provider: 'ffmpeg-slideshow',
        quality: 'medium'
      };
    } catch (error) {
      throw new Error(`FFmpeg slideshow generation failed: ${error}`);
    }
  }

  /**
   * Generate simple canvas-based video
   */
  private async generateCanvasVideo(params: {
    images: File[];
    script: VideoScript;
    audioUrl?: string;
    options?: VideoGenerationOptions;
  }): Promise<VideoGenerationResult> {
    const { images, script, options } = params;

    try {
      // Create a simple canvas-based slideshow
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const stream = canvas.captureStream(24); // 24 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      
      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          
          resolve({
            videoId: `canvas_${Date.now()}`,
            videoUrl,
            duration: script.totalDuration,
            size: videoBlob.size,
            provider: 'canvas-simple',
            quality: 'low'
          });
        };

        mediaRecorder.onerror = reject;

        // Start recording and animate
        mediaRecorder.start();
        this.animateCanvasSlideshow(ctx, images, options?.duration || 3)
          .then(() => {
            mediaRecorder.stop();
          })
          .catch(reject);
      });
    } catch (error) {
      throw new Error(`Canvas video generation failed: ${error}`);
    }
  }

  /**
   * Animate canvas slideshow
   */
  private async animateCanvasSlideshow(
    ctx: CanvasRenderingContext2D,
    images: File[],
    durationPerImage: number
  ): Promise<void> {
    const canvas = ctx.canvas;
    const fps = 24;
    const framesPerImage = durationPerImage * fps;
    
    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      const url = URL.createObjectURL(images[i]);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Draw image for specified duration
      for (let frame = 0; frame < framesPerImage; frame++) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image fitted to canvas
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Simple fade transition
        if (frame < fps && i > 0) {
          ctx.globalAlpha = frame / fps;
        } else if (frame > framesPerImage - fps && i < images.length - 1) {
          ctx.globalAlpha = (framesPerImage - frame) / fps;
        } else {
          ctx.globalAlpha = 1;
        }

        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
      }

      URL.revokeObjectURL(url);
    }
  }

  /**
   * Generate static image slideshow (last resort)
   */
  private async generateStaticSlideshow(params: {
    images: File[];
    script: VideoScript;
    audioUrl?: string;
    options?: VideoGenerationOptions;
  }): Promise<VideoGenerationResult> {
    const { images, script } = params;

    // Create a very simple "video" that's just a static image
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    if (!ctx || images.length === 0) {
      throw new Error('Cannot create static slideshow');
    }

    // Use the first image
    const img = new Image();
    const url = URL.createObjectURL(images[0]);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Draw the image
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Add text overlay
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Property Showcase', canvas.width / 2, 100);
        
        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            const videoUrl = URL.createObjectURL(blob);
            resolve({
              videoId: `static_${Date.now()}`,
              videoUrl,
              duration: 5, // Static duration
              size: blob.size,
              provider: 'static-image',
              quality: 'low'
            });
          } else {
            reject(new Error('Failed to create static image'));
          }
        }, 'image/png');

        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for static slideshow'));
      };

      img.src = url;
    });
  }

  /**
   * Get video service status
   */
  getStatus() {
    return fallbackChainService.getServiceStatus('video');
  }

  /**
   * Test all video providers
   */
  async testAllProviders(testImages: File[]): Promise<Record<string, boolean>> {
    const testScript: VideoScript = {
      intro: "Test video",
      scenes: [],
      outro: "",
      totalDuration: 5
    };

    const results: Record<string, boolean> = {};
    const status = this.getStatus();

    for (const provider of status.providers) {
      try {
        console.log(`Testing ${provider.name}...`);
        const result = await this.generateVideo(
          testImages,
          testScript,
          undefined,
          { quality: 'low', duration: 2 },
          () => {},
          () => {}
        );
        results[provider.id] = !!result.videoUrl;
        console.log(`${provider.name}: ${results[provider.id] ? '✅ Pass' : '❌ Fail'}`);
      } catch (error) {
        results[provider.id] = false;
        console.log(`${provider.name}: ❌ Fail - ${error}`);
      }
    }

    return results;
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(images: File[]): string[] {
    const recommendations: string[] = [];
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    if (totalSizeMB > 50) {
      recommendations.push('Consider reducing image sizes for better performance');
    }

    if (images.length > 10) {
      recommendations.push('Too many images may cause memory issues - consider using fewer images');
    }

    const status = this.getStatus();
    const availableProviders = status.providers.filter(p => p.available);
    
    if (availableProviders.length === 1) {
      recommendations.push('Only one video provider available - no fallback options');
    }

    return recommendations;
  }
}

export const videoWithFallback = new VideoWithFallback();