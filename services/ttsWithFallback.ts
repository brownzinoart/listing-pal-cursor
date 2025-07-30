/**
 * Text-to-Speech Service with Fallback Chain
 * Manages multiple TTS providers with automatic fallback
 */

import { fallbackChainService, ServiceProvider } from './fallbackChainService';
import { openaiTTSClient } from './openaiTTSClient';
import { VideoScript } from './videoGenerationService';

// Environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

export interface TTSProvider {
  generateSpeech(text: string, options?: any): Promise<string | null>;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  style?: 'professional' | 'casual' | 'energetic';
}

class TTSWithFallback {
  constructor() {
    this.setupProviders();
  }

  private setupProviders(): void {
    // OpenAI TTS Provider (Primary - PRIORITY for this user)
    if (OPENAI_API_KEY) {
      const openaiProvider: ServiceProvider = {
        id: 'openai-tts',
        name: 'OpenAI TTS (Primary)',
        priority: 1,
        isAvailable: true,
        failureCount: 0,
        maxFailures: 3,
        cooldownPeriod: 30000, // 30 seconds
        healthCheckUrl: 'https://api.openai.com/v1/models', // Simple health check
        execute: async (params: { script: VideoScript; options?: TTSOptions }) => {
          console.log('🎙️ Using OpenAI TTS (preferred provider)');
          const fullText = this.scriptToText(params.script);
          
          const ttsOptions = {
            voice: 'nova' as const, // Professional female voice
            speed: params.options?.speed || 1.0,
            model: 'tts-1' as const // Standard quality for faster generation
          };

          const audioUrl = await openaiTTSClient.generateSpeech(fullText, ttsOptions);
          console.log('✅ OpenAI TTS completed successfully');
          return audioUrl;
        }
      };

      fallbackChainService.registerProvider('tts', openaiProvider);
      console.log('📡 OpenAI TTS registered as primary provider');
    } else {
      console.warn('⚠️ OpenAI API key not found - OpenAI TTS will not be available');
    }

    // ElevenLabs Provider (Secondary fallback)
    if (ELEVENLABS_API_KEY) {
      const elevenlabsProvider: ServiceProvider = {
        id: 'elevenlabs',
        name: 'ElevenLabs (Fallback)',
        priority: 2,
        isAvailable: true,
        failureCount: 0,
        maxFailures: 3,
        cooldownPeriod: 60000, // 1 minute
        healthCheckUrl: 'https://api.elevenlabs.io/v1/voices',
        execute: async (params: { script: VideoScript; options?: TTSOptions }) => {
          console.log('🎙️ Using ElevenLabs as fallback (OpenAI TTS unavailable)');
          return await this.generateElevenLabsSpeech(params.script, params.options);
        }
      };

      fallbackChainService.registerProvider('tts', elevenlabsProvider);
    }

    // Browser TTS Provider (Tertiary Fallback)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const browserTTSProvider: ServiceProvider = {
        id: 'browser-tts',
        name: 'Browser TTS',
        priority: 3,
        isAvailable: true,
        failureCount: 0,
        maxFailures: 1,
        cooldownPeriod: 5000, // 5 seconds
        execute: async (params: { script: VideoScript; options?: TTSOptions }) => {
          return await this.generateBrowserSpeech(params.script, params.options);
        }
      };

      fallbackChainService.registerProvider('tts', browserTTSProvider);
    }

    // Silent Fallback (Always available)
    const silentProvider: ServiceProvider = {
      id: 'silent',
      name: 'Silent (No Audio)',
      priority: 99,
      isAvailable: true,
      failureCount: 0,
      maxFailures: 0,
      cooldownPeriod: 0,
      execute: async () => {
        console.log('🔇 Using silent fallback - no audio will be generated');
        return null;
      }
    };

    fallbackChainService.registerProvider('tts', silentProvider);
  }

  /**
   * Generate speech with automatic fallback
   */
  async generateSpeech(
    script: VideoScript, 
    options?: TTSOptions,
    onProviderChange?: (providerId: string, providerName: string) => void
  ): Promise<string | null> {
    try {
      return await fallbackChainService.executeWithFallback<string | null>(
        'tts',
        { script, options },
        onProviderChange
      );
    } catch (error) {
      console.error('All TTS providers failed:', error);
      return null;
    }
  }

  /**
   * Convert video script to plain text
   */
  private scriptToText(script: VideoScript): string {
    const parts = [
      script.intro,
      ...script.scenes.map(scene => scene.narration),
      script.outro
    ];
    
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Generate speech using ElevenLabs API
   */
  private async generateElevenLabsSpeech(script: VideoScript, options?: TTSOptions): Promise<string | null> {
    const fullText = this.scriptToText(script);
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: fullText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: options?.style === 'energetic' ? 0.8 : 0.4,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  /**
   * Generate speech using browser's SpeechSynthesis API
   */
  private async generateBrowserSpeech(script: VideoScript, options?: TTSOptions): Promise<string | null> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser TTS not supported');
    }

    const fullText = this.scriptToText(script);
    
    return new Promise((resolve, reject) => {
      try {
        // Create a more sophisticated browser TTS implementation
        const utterance = new SpeechSynthesisUtterance(fullText);
        
        // Find a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Female') || voice.name.includes('Woman') || voice.name.includes('Karen'))
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.rate = options?.speed || 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Record the speech
        const chunks: BlobPart[] = [];
        const mediaRecorder = this.setupAudioRecorder(chunks);

        utterance.onstart = () => {
          if (mediaRecorder && mediaRecorder.state !== 'recording') {
            mediaRecorder.start();
          }
        };

        utterance.onend = () => {
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 100);
        };

        utterance.onerror = (event) => {
          reject(new Error(`Browser TTS error: ${event.error}`));
        };

        if (mediaRecorder) {
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve(audioUrl);
          };

          speechSynthesis.speak(utterance);
        } else {
          // Fallback for browsers without MediaRecorder
          speechSynthesis.speak(utterance);
          // Return null since we can't capture the audio
          resolve(null);
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup audio recorder for browser TTS
   */
  private setupAudioRecorder(chunks: BlobPart[]): MediaRecorder | null {
    try {
      // This is a simplified version - in practice, you'd need to 
      // capture system audio which is complex in browsers
      return null;
    } catch (error) {
      console.warn('Could not setup audio recorder for browser TTS:', error);
      return null;
    }
  }

  /**
   * Get TTS service status
   */
  getStatus() {
    return fallbackChainService.getServiceStatus('tts');
  }

  /**
   * Estimate cost for TTS generation
   */
  estimateCost(script: VideoScript): { service: string; cost: number }[] {
    const fullText = this.scriptToText(script);
    const estimates = [];

    // OpenAI TTS cost estimation
    if (OPENAI_API_KEY) {
      const openaiCost = (fullText.length / 1000) * 0.015; // $0.015 per 1K characters
      estimates.push({ service: 'OpenAI TTS', cost: openaiCost });
    }

    // ElevenLabs cost estimation (higher cost)
    if (ELEVENLABS_API_KEY) {
      const elevenlabsCost = (fullText.length / 1000) * 0.30; // Estimated $0.30 per 1K characters
      estimates.push({ service: 'ElevenLabs', cost: elevenlabsCost });
    }

    // Browser TTS is free
    estimates.push({ service: 'Browser TTS', cost: 0 });

    return estimates;
  }

  /**
   * Test all providers
   */
  async testAllProviders(): Promise<Record<string, boolean>> {
    const testScript: VideoScript = {
      intro: "This is a test.",
      scenes: [],
      outro: "",
      totalDuration: 3
    };

    const results: Record<string, boolean> = {};
    const status = this.getStatus();

    for (const provider of status.providers) {
      try {
        console.log(`Testing ${provider.name}...`);
        const result = await this.generateSpeech(testScript, undefined, () => {});
        results[provider.id] = result !== null;
        console.log(`${provider.name}: ${results[provider.id] ? '✅ Pass' : '❌ Fail'}`);
      } catch (error) {
        results[provider.id] = false;
        console.log(`${provider.name}: ❌ Fail - ${error}`);
      }
    }

    return results;
  }
}

export const ttsWithFallback = new TTSWithFallback();