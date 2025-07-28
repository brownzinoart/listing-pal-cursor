import OpenAI from "openai";
// Node.js imports (only in Node environment)
let fs;
let path;
if (typeof window === "undefined") {
  fs = await import("fs");
  path = await import("path");
}
export class OpenAITTSService {
  constructor(apiKey) {
    this.defaultOptions = {
      model: "tts-1", // Standard quality, lower latency
      voice: "nova", // Professional female voice
      speed: 1.0, // Normal speed
      format: "mp3", // Most compatible format
    };
    const key =
      apiKey || process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OpenAI API key not found. Please set OPENAI_API_KEY or VITE_OPENAI_API_KEY in your environment.",
      );
    }
    this.openai = new OpenAI({ apiKey: key });
    console.log("✅ OpenAI TTS Service initialized");
  }
  /**
   * Generate speech from text using OpenAI TTS
   * @param text The text to convert to speech
   * @param options TTS options (model, voice, speed, format)
   * @returns URL to the generated audio file
   */
  async generateSpeech(text, options = {}) {
    try {
      const config = { ...this.defaultOptions, ...options };
      console.log("🎙️ Generating speech with OpenAI TTS:", {
        model: config.model,
        voice: config.voice,
        speed: config.speed,
        textLength: text.length,
        estimatedCost: `$${(text.length * 0.000015).toFixed(4)}`, // $0.015 per 1k chars
      });
      // Make the API request
      const response = await this.openai.audio.speech.create({
        model: config.model,
        voice: config.voice,
        input: text,
        speed: config.speed,
        response_format: config.format,
      });
      // Convert response to buffer
      const buffer = Buffer.from(await response.arrayBuffer());
      // Create a blob URL for client-side use
      const blob = new Blob([buffer], { type: `audio/${config.format}` });
      const audioUrl = URL.createObjectURL(blob);
      console.log("✅ Speech generated successfully:", {
        size: `${(buffer.length / 1024).toFixed(2)} KB`,
        format: config.format,
        url: audioUrl,
      });
      return audioUrl;
    } catch (error) {
      console.error("❌ OpenAI TTS Error:", error);
      throw error;
    }
  }
  /**
   * Generate speech and save to file (for server-side use)
   * @param text The text to convert to speech
   * @param outputPath Path where to save the audio file
   * @param options TTS options
   * @returns Path to the saved audio file
   */
  async generateSpeechToFile(text, outputPath, options = {}) {
    if (typeof window !== "undefined") {
      throw new Error(
        "generateSpeechToFile is only available in Node.js environment",
      );
    }
    try {
      const config = { ...this.defaultOptions, ...options };
      console.log("🎙️ Generating speech to file with OpenAI TTS:", {
        outputPath,
        ...config,
      });
      const response = await this.openai.audio.speech.create({
        model: config.model,
        voice: config.voice,
        input: text,
        speed: config.speed,
        response_format: config.format,
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Write to file
      fs.writeFileSync(outputPath, buffer);
      console.log("✅ Speech saved to file:", {
        path: outputPath,
        size: `${(buffer.length / 1024).toFixed(2)} KB`,
      });
      return outputPath;
    } catch (error) {
      console.error("❌ OpenAI TTS Error:", error);
      throw error;
    }
  }
  /**
   * Estimate cost for text
   * @param text The text to estimate cost for
   * @returns Estimated cost in USD
   */
  estimateCost(text) {
    // OpenAI TTS pricing: $0.015 per 1,000 characters
    return (text.length / 1000) * 0.015;
  }
  /**
   * Get available voices with descriptions
   */
  getAvailableVoices() {
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
  validateTextLength(text) {
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
export const openaiTTSService = new OpenAITTSService();
