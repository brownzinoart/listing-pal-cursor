import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

/**
 * Slideshow Video Service
 * Creates a video slideshow from images with transitions
 * Uses FFmpeg.wasm for proper audio/video synchronization
 */

export class SlideshowVideoService {
  private ffmpeg: FFmpeg | null = null;
  private ffmpegLoaded = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1920; // Full HD
    this.canvas.height = 1080;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;
  }

  /**
   * Initialize FFmpeg.wasm
   */
  private async initializeFFmpeg(): Promise<void> {
    if (this.ffmpegLoaded && this.ffmpeg) return;

    try {
      this.ffmpeg = new FFmpeg();

      // Set up progress logging
      this.ffmpeg.on("progress", ({ progress, time }) => {
        console.log(
          `⏳ FFmpeg Progress: ${Math.round(progress * 100)}% (time: ${time})`,
        );
      });

      // Load FFmpeg with proper configuration
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });

      this.ffmpegLoaded = true;
      console.log("✅ FFmpeg.wasm loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load FFmpeg.wasm:", error);
      throw error;
    }
  }

  /**
   * Create a slideshow video from images with proper audio synchronization
   */
  async createSlideshow(
    images: File[],
    audioUrl?: string,
    options: {
      duration?: number; // seconds per image
      transition?: "fade" | "slide" | "zoom";
      fps?: number;
    } = {},
  ): Promise<string> {
    const { duration = 5, transition = "fade", fps = 30 } = options;

    try {
      // Initialize FFmpeg if not already loaded
      await this.initializeFFmpeg();

      // Load all images
      const loadedImages = await this.loadImages(images);

      // First, create the video without audio
      console.log("🎬 Creating video slideshow...");
      const videoBlob = await this.createVideoOnly(
        loadedImages,
        duration,
        transition,
        fps,
      );

      // If no audio, return the video as-is
      if (!audioUrl) {
        return URL.createObjectURL(videoBlob);
      }

      // If we have audio, use FFmpeg to merge them
      console.log("🎵 Merging audio with video using FFmpeg...");
      try {
        const mergedBlob = await this.mergeAudioVideo(videoBlob, audioUrl);
        return URL.createObjectURL(mergedBlob);
      } catch (ffmpegError) {
        console.warn(
          "⚠️ FFmpeg merge failed, returning video without audio:",
          ffmpegError,
        );
        // Fallback: return video without audio if FFmpeg fails
        return URL.createObjectURL(videoBlob);
      }
    } catch (error) {
      console.error("❌ Slideshow creation failed:", error);
      throw error;
    }
  }

  /**
   * Create video without audio
   */
  private async createVideoOnly(
    images: HTMLImageElement[],
    duration: number,
    transition: "fade" | "slide" | "zoom",
    fps: number,
  ): Promise<Blob> {
    const stream = this.canvas.captureStream(fps);

    // Configure MediaRecorder for video only
    const mediaRecorderOptions = {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 5000000,
    };

    this.mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
    this.chunks = [];

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "video/webm" });
        console.log("✅ Video-only recording completed:", {
          size: blob.size,
          type: blob.type,
        });
        resolve(blob);
      };

      this.mediaRecorder.onerror = reject;

      // Start recording
      this.mediaRecorder.start();

      // Animate slideshow
      this.animateSlideshow(images, duration, transition, fps).then(() => {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      });
    });
  }

  /**
   * Merge audio and video using FFmpeg.wasm
   */
  private async mergeAudioVideo(
    videoBlob: Blob,
    audioUrl: string,
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      throw new Error("FFmpeg not initialized");
    }

    try {
      // Write video to FFmpeg filesystem
      const videoData = new Uint8Array(await videoBlob.arrayBuffer());
      await this.ffmpeg.writeFile("input_video.webm", videoData);

      // Fetch and write audio to FFmpeg filesystem
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const audioData = new Uint8Array(await audioBlob.arrayBuffer());
      await this.ffmpeg.writeFile("input_audio.mp3", audioData);

      console.log("📁 Files written to FFmpeg filesystem");

      // Merge audio and video with proper synchronization
      await this.ffmpeg.exec([
        "-i",
        "input_video.webm",
        "-i",
        "input_audio.mp3",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-shortest",
        "-y",
        "output.mp4",
      ]);

      console.log("✅ FFmpeg merge completed");

      // Read the output file
      const outputData = await this.ffmpeg.readFile("output.mp4");
      const outputBlob = new Blob([outputData], { type: "video/mp4" });

      // Clean up FFmpeg filesystem
      try {
        await this.ffmpeg.deleteFile("input_video.webm");
        await this.ffmpeg.deleteFile("input_audio.mp3");
        await this.ffmpeg.deleteFile("output.mp4");
      } catch (cleanupError) {
        console.warn("Cleanup error:", cleanupError);
      }

      console.log("🎉 Final video with audio created:", {
        size: outputBlob.size,
        type: outputBlob.type,
      });

      return outputBlob;
    } catch (error) {
      console.error("❌ FFmpeg merge failed:", error);
      throw error;
    }
  }

  /**
   * Load images and prepare them for rendering
   */
  private async loadImages(files: File[]): Promise<HTMLImageElement[]> {
    const images = await Promise.all(
      files.map((file) => this.loadImage(URL.createObjectURL(file))),
    );
    return images;
  }

  /**
   * Load a single image
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Animate the slideshow
   */
  private async animateSlideshow(
    images: HTMLImageElement[],
    duration: number,
    transition: "fade" | "slide" | "zoom",
    fps: number,
  ): Promise<void> {
    const frameDuration = 1000 / fps;
    const framesPerImage = duration * fps;
    const transitionFrames = Math.floor(fps * 0.5); // 0.5 second transitions

    for (let i = 0; i < images.length; i++) {
      const currentImage = images[i];
      const nextImage = images[(i + 1) % images.length];

      // Draw main image frames
      for (let frame = 0; frame < framesPerImage; frame++) {
        // Clear canvas
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (
          frame >= framesPerImage - transitionFrames &&
          i < images.length - 1
        ) {
          // Transition effect
          const progress =
            (frame - (framesPerImage - transitionFrames)) / transitionFrames;
          this.drawTransition(currentImage, nextImage, progress, transition);
        } else {
          // Ken Burns effect (subtle zoom/pan)
          const zoomProgress = frame / framesPerImage;
          this.drawImageWithKenBurns(currentImage, zoomProgress);
        }

        // Add property info overlay
        this.drawOverlay(i, images.length);

        await this.delay(frameDuration);
      }
    }
  }

  /**
   * Draw image with Ken Burns effect
   */
  private drawImageWithKenBurns(image: HTMLImageElement, progress: number) {
    const scale = 1 + progress * 0.1; // Zoom from 1x to 1.1x
    const offsetX = (this.canvas.width - this.canvas.width * scale) / 2;
    const offsetY = (this.canvas.height - this.canvas.height * scale) / 2;

    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    // Fit image to canvas maintaining aspect ratio
    this.drawImageFitted(image);

    this.ctx.restore();
  }

  /**
   * Draw transition between images
   */
  private drawTransition(
    from: HTMLImageElement,
    to: HTMLImageElement,
    progress: number,
    type: "fade" | "slide" | "zoom",
  ) {
    switch (type) {
      case "fade":
        // Draw from image
        this.ctx.globalAlpha = 1 - progress;
        this.drawImageFitted(from);

        // Draw to image
        this.ctx.globalAlpha = progress;
        this.drawImageFitted(to);

        this.ctx.globalAlpha = 1;
        break;

      case "slide":
        // Slide from right to left
        this.ctx.save();

        // From image slides out
        this.ctx.translate(-this.canvas.width * progress, 0);
        this.drawImageFitted(from);

        // To image slides in
        this.ctx.translate(this.canvas.width, 0);
        this.drawImageFitted(to);

        this.ctx.restore();
        break;

      case "zoom":
        // Zoom out from and zoom in to
        const fromScale = 1 - progress * 0.5;
        const toScale = 0.5 + progress * 0.5;

        // Draw from image zooming out
        this.ctx.save();
        this.ctx.globalAlpha = 1 - progress;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(fromScale, fromScale);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        this.drawImageFitted(from);
        this.ctx.restore();

        // Draw to image zooming in
        this.ctx.save();
        this.ctx.globalAlpha = progress;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(toScale, toScale);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        this.drawImageFitted(to);
        this.ctx.restore();

        this.ctx.globalAlpha = 1;
        break;
    }
  }

  /**
   * Draw image fitted to canvas maintaining aspect ratio
   */
  private drawImageFitted(image: HTMLImageElement) {
    const scale = Math.max(
      this.canvas.width / image.width,
      this.canvas.height / image.height,
    );

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (this.canvas.width - scaledWidth) / 2;
    const y = (this.canvas.height - scaledHeight) / 2;

    this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }

  /**
   * Draw overlay with property info
   */
  private drawOverlay(currentIndex: number, totalImages: number) {
    // Bottom gradient
    const gradient = this.ctx.createLinearGradient(
      0,
      this.canvas.height - 200,
      0,
      this.canvas.height,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.canvas.height - 200, this.canvas.width, 200);

    // ListingPal gradient logo
    this.drawGradientLogo(40, this.canvas.height - 60);

    // Image counter
    this.ctx.fillStyle = "white";
    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      `${currentIndex + 1} / ${totalImages}`,
      this.canvas.width - 100,
      this.canvas.height - 40,
    );
  }

  /**
   * Draw gradient ListingPal logo
   */
  private drawGradientLogo(x: number, y: number) {
    // Create gradient for logo text
    const logoGradient = this.ctx.createLinearGradient(
      x,
      y - 20,
      x + 200,
      y + 10,
    );
    logoGradient.addColorStop(0, "#8B5CF6"); // Purple
    logoGradient.addColorStop(0.5, "#A855F7"); // Purple-pink
    logoGradient.addColorStop(1, "#EC4899"); // Pink

    // Draw logo text with gradient
    this.ctx.fillStyle = logoGradient;
    this.ctx.font = "bold 28px Arial";
    this.ctx.fillText("ListingPal", x, y);

    // Add a subtle glow effect
    this.ctx.shadowColor = "#8B5CF6";
    this.ctx.shadowBlur = 8;
    this.ctx.fillText("ListingPal", x, y);

    // Reset shadow
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;

    // Add small icon/symbol before text
    const iconX = x - 35;
    const iconY = y - 15;
    const iconSize = 20;

    // Draw house icon with gradient
    this.ctx.fillStyle = logoGradient;
    this.ctx.beginPath();
    // Simple house shape
    this.ctx.moveTo(iconX + iconSize / 2, iconY);
    this.ctx.lineTo(iconX + iconSize, iconY + iconSize / 2);
    this.ctx.lineTo(iconX + iconSize * 0.8, iconY + iconSize / 2);
    this.ctx.lineTo(iconX + iconSize * 0.8, iconY + iconSize);
    this.ctx.lineTo(iconX + iconSize * 0.2, iconY + iconSize);
    this.ctx.lineTo(iconX + iconSize * 0.2, iconY + iconSize / 2);
    this.ctx.lineTo(iconX, iconY + iconSize / 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Door
    this.ctx.fillStyle = "#1F2937";
    this.ctx.fillRect(
      iconX + iconSize * 0.4,
      iconY + iconSize * 0.7,
      iconSize * 0.2,
      iconSize * 0.3,
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    this.chunks = [];
  }
}

export const slideshowVideoService = new SlideshowVideoService();
