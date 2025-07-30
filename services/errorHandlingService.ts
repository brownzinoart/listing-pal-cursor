/**
 * Enhanced Error Handling Service for Video Generation
 * Provides comprehensive error recovery, user feedback, and fallback strategies
 */

export interface VideoError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  timestamp: Date;
  component?: string;
  stack?: string;
}

export interface ErrorRecoveryAction {
  action: 'retry' | 'fallback' | 'skip' | 'manual';
  label: string;
  description: string;
  handler: () => Promise<void> | void;
}

export interface ErrorHandlingResult {
  handled: boolean;
  userMessage: string;
  recoveryActions: ErrorRecoveryAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorHandlingService {
  private errorLog: VideoError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  /**
   * Handle any error in the video generation pipeline
   */
  handleError(error: any, component?: string): ErrorHandlingResult {
    const videoError = this.normalizeError(error, component);
    this.logError(videoError);

    return this.determineErrorResponse(videoError);
  }

  /**
   * Normalize any error into a VideoError object
   */
  private normalizeError(error: any, component?: string): VideoError {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';
    let recoverable = true;
    let details = error;

    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
      
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        code = 'NETWORK_ERROR';
        message = 'Network connection failed. Please check your internet connection.';
      }
      // API errors
      else if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
        code = 'API_ERROR';
        message = 'Service temporarily unavailable. Please try again.';
      }
      // FFmpeg errors
      else if (error.message.includes('FFmpeg') || error.message.includes('ffmpeg')) {
        code = 'FFMPEG_ERROR';
        message = 'Video processing failed. Trying alternative method.';
      }
      // Audio generation errors
      else if (error.message.includes('elevenlabs') || error.message.includes('tts') || error.message.includes('speech')) {
        code = 'AUDIO_ERROR';
        message = 'Voice generation failed. Continuing without audio.';
      }
      // Out of memory errors
      else if (error.message.includes('memory') || error.message.includes('heap')) {
        code = 'MEMORY_ERROR';
        message = 'Insufficient memory. Try with fewer images or smaller files.';
        recoverable = false;
      }
    }

    // Handle fetch response errors
    if (error?.status) {
      if (error.status === 429) {
        code = 'RATE_LIMIT_ERROR';
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status >= 500) {
        code = 'SERVER_ERROR';
        message = 'Server error. Please try again in a few minutes.';
      } else if (error.status >= 400) {
        code = 'CLIENT_ERROR';
        message = 'Request failed. Please check your input and try again.';
      }
    }

    return {
      code,
      message,
      details,
      recoverable,
      timestamp: new Date(),
      component,
      stack: error?.stack
    };
  }

  /**
   * Determine appropriate response based on error type
   */
  private determineErrorResponse(error: VideoError): ErrorHandlingResult {
    const errorKey = `${error.component}-${error.code}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;

    const baseActions: ErrorRecoveryAction[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let userMessage = error.message;

    // Determine severity and actions based on error code
    switch (error.code) {
      case 'NETWORK_ERROR':
        severity = 'high';
        if (attempts < this.maxRetries) {
          baseActions.push({
            action: 'retry',
            label: 'Retry Connection',
            description: 'Attempt to reconnect to the service',
            handler: () => this.incrementRetry(errorKey)
          });
        }
        baseActions.push({
          action: 'fallback',
          label: 'Use Offline Mode',
          description: 'Continue with reduced functionality',
          handler: () => this.enableOfflineMode()
        });
        break;

      case 'API_ERROR':
        severity = 'high';
        if (attempts < this.maxRetries) {
          baseActions.push({
            action: 'retry',
            label: 'Retry API Call',
            description: 'Try the request again',
            handler: () => this.incrementRetry(errorKey)
          });
        }
        baseActions.push({
          action: 'fallback',
          label: 'Use Alternative Service',
          description: 'Switch to backup service provider',
          handler: () => this.switchToFallbackService()
        });
        break;

      case 'FFMPEG_ERROR':
        severity = 'medium';
        baseActions.push({
          action: 'fallback',
          label: 'Use Simple Video Generator',
          description: 'Create video with basic slideshow method',
          handler: () => this.useSimpleVideoGenerator()
        });
        break;

      case 'AUDIO_ERROR':
        severity = 'low';
        userMessage = 'Voice generation failed, but video creation will continue without narration.';
        baseActions.push({
          action: 'skip',
          label: 'Continue Without Audio',
          description: 'Proceed with silent video',
          handler: () => this.continueWithoutAudio()
        });
        baseActions.push({
          action: 'fallback',
          label: 'Try Alternative Voice Service',
          description: 'Switch to backup text-to-speech provider',
          handler: () => this.switchVoiceService()
        });
        break;

      case 'MEMORY_ERROR':
        severity = 'critical';
        userMessage = 'Not enough memory to process this request. Please try with fewer or smaller images.';
        baseActions.push({
          action: 'manual',
          label: 'Reduce Image Count',
          description: 'Remove some images and try again',
          handler: () => this.suggestImageReduction()
        });
        break;

      case 'RATE_LIMIT_ERROR':
        severity = 'medium';
        const waitTime = this.calculateBackoffTime(attempts);
        userMessage = `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`;
        baseActions.push({
          action: 'retry',
          label: `Retry in ${waitTime}s`,
          description: 'Automatically retry after waiting',
          handler: () => this.delayedRetry(errorKey, waitTime)
        });
        break;

      default:
        if (attempts < this.maxRetries && error.recoverable) {
          baseActions.push({
            action: 'retry',
            label: 'Try Again',
            description: 'Attempt the operation again',
            handler: () => this.incrementRetry(errorKey)
          });
        }
    }

    return {
      handled: true,
      userMessage,
      recoveryActions: baseActions,
      severity
    };
  }

  /**
   * Log error for analytics and debugging
   */
  private logError(error: VideoError): void {
    this.errorLog.push(error);
    
    // Console logging for development
    console.error(`[${error.component || 'Unknown'}] ${error.code}: ${error.message}`, error.details);
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(error);
    }
  }

  /**
   * Send error to analytics service (placeholder)
   */
  private sendToAnalytics(error: VideoError): void {
    // TODO: Implement analytics service integration
    // Analytics.track('video_generation_error', {
    //   code: error.code,
    //   component: error.component,
    //   timestamp: error.timestamp,
    //   recoverable: error.recoverable
    // });
  }

  /**
   * Increment retry count for specific error
   */
  private incrementRetry(errorKey: string): void {
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;
    this.retryAttempts.set(errorKey, currentAttempts + 1);
  }

  /**
   * Calculate exponential backoff time
   */
  private calculateBackoffTime(attempts: number): number {
    return Math.min(1000 * Math.pow(2, attempts), 30000) / 1000; // Max 30 seconds
  }

  /**
   * Delayed retry with exponential backoff
   */
  private async delayedRetry(errorKey: string, waitTime: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.incrementRetry(errorKey);
        resolve();
      }, waitTime * 1000);
    });
  }

  /**
   * Recovery action implementations
   */
  private enableOfflineMode(): void {
    // TODO: Implement offline mode
    console.log('Switching to offline mode');
  }

  private switchToFallbackService(): void {
    // TODO: Implement fallback service switching
    console.log('Switching to fallback service');
  }

  private useSimpleVideoGenerator(): void {
    // TODO: Implement simple video generator fallback
    console.log('Using simple video generator');
  }

  private continueWithoutAudio(): void {
    // TODO: Implement audio-less video generation
    console.log('Continuing without audio');
  }

  private switchVoiceService(): void {
    // TODO: Implement voice service switching
    console.log('Switching voice service');
  }

  private suggestImageReduction(): void {
    // TODO: Implement image reduction suggestion UI
    console.log('Suggesting image reduction');
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsByComponent: Record<string, number>;
    successRate: number;
  } {
    const errorsByCode: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    this.errorLog.forEach(error => {
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
      if (error.component) {
        errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
      }
    });

    // Calculate success rate (placeholder)
    const successRate = this.errorLog.length > 0 ? 0.8 : 1.0; // Mock calculation

    return {
      totalErrors: this.errorLog.length,
      errorsByCode,
      errorsByComponent,
      successRate
    };
  }

  /**
   * Clear error log and retry counts
   */
  reset(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }

  /**
   * Check if an operation should be retried
   */
  shouldRetry(component: string, code: string): boolean {
    const errorKey = `${component}-${code}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;
    return attempts < this.maxRetries;
  }
}

export const errorHandlingService = new ErrorHandlingService();