// Client-side OpenAI TTS service that communicates with the backend API
export type OpenAIVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
export type OpenAITTSModel = "tts-1" | "tts-1-hd";

interface TTSOptions {
  model?: OpenAITTSModel;
  voice?: OpenAIVoice;
  speed?: number; // 0.25 to 4.0
  format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
}

export class OpenAITTSClient {
  private defaultOptions: Required<TTSOptions> = {
    model: "tts-1", // Standard quality, lower latency
    voice: "nova", // Professional female voice
    speed: 1.0, // Normal speed
    format: "mp3", // Most compatible format
  };

  /**
   * Generate speech from text using OpenAI TTS via backend API
   * @param text The text to convert to speech
   * @param options TTS options (model, voice, speed, format)
   * @returns URL to the generated audio file
   */
  async generateSpeech(
    text: string,
    options: TTSOptions = {},
  ): Promise<string> {
    try {
      const config = { ...this.defaultOptions, ...options };

      console.log("🎙️ Generating speech with OpenAI TTS:", {
        model: config.model,
        voice: config.voice,
        speed: config.speed,
        textLength: text.length,
        estimatedCost: `$${(text.length * 0.000015).toFixed(4)}`, // $0.015 per 1k chars
      });

      // Call backend API endpoint
      const response = await fetch("/api/generate-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: config.voice,
          speed: config.speed,
          model: config.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `TTS API failed: ${errorData.error || "Unknown error"}`,
        );
      }

      const result = await response.json();

      console.log("✅ Speech generated successfully:", {
        size: `${(result.size / 1024).toFixed(2)} KB`,
        voice: result.voice,
        model: result.model,
      });

      return result.audioBase64; // Return data URL directly
    } catch (error) {
      console.error("❌ OpenAI TTS Error:", error);
      throw new Error(
        `TTS generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate voice preview (shorter text for testing)
   * @param voiceId The voice to preview
   * @returns Audio URL or null if failed
   */
  async generateVoicePreview(voiceId: OpenAIVoice): Promise<string | null> {
    try {
      const sampleText =
        "Welcome to this stunning Beverly Hills mansion featuring modern luxury amenities and breathtaking views.";
      return await this.generateSpeech(sampleText, { voice: voiceId });
    } catch (error) {
      console.error("Failed to generate voice preview:", error);
      return null;
    }
  }

  /**
   * Estimate cost for text
   * @param text The text to estimate cost for
   * @returns Estimated cost in USD
   */
  estimateCost(text: string): number {
    // OpenAI TTS pricing: $0.015 per 1,000 characters
    return (text.length / 1000) * 0.015;
  }

  /**
   * Get available voices with descriptions
   */
  getAvailableVoices(): Record<OpenAIVoice, string> {
    return {
      alloy: "Neutral and balanced",
      echo: "Warm and conversational",
      fable: "Expressive and dynamic",
      onyx: "Deep and authoritative",
      nova: "Professional and friendly (recommended for property tours)",
      shimmer: "Soft and pleasant",
    };
  }

  /**
   * Validate text length (OpenAI has a 4096 character limit)
   */
  validateTextLength(text: string): boolean {
    const MAX_LENGTH = 4096;
    if (text.length > MAX_LENGTH) {
      throw new Error(
        `Text exceeds maximum length of ${MAX_LENGTH} characters. Current length: ${text.length}`,
      );
    }
    return true;
  }
}

// Export singleton instance for easy use
export const openaiTTSClient = new OpenAITTSClient();
