import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// OpenAI TTS voices
const VOICES = [
  { id: "nova", name: "Nova", description: "Professional female voice" },
  { id: "alloy", name: "Alloy", description: "Balanced versatile voice" },
  { id: "echo", name: "Echo", description: "Authoritative male voice" },
  { id: "fable", name: "Fable", description: "British storytelling voice" },
  { id: "onyx", name: "Onyx", description: "Deep resonant male voice" },
  {
    id: "shimmer",
    name: "Shimmer",
    description: "Bright energetic female voice",
  },
];

// Beverly Hills mansion script
const SCRIPT = `Welcome to this stunning Beverly Hills mansion featuring modern luxury amenities and breathtaking views. 
The grand living room features floor-to-ceiling windows with panoramic city views. 
This gourmet kitchen boasts custom Italian cabinetry and professional-grade appliances. 
The master suite offers a private terrace overlooking the canyon. 
Resort-style outdoor living with infinity pool and spa. 
Luxurious spa bathroom with imported marble finishes. 
This extraordinary estate is offered at $15,750,000. Schedule your private showing today.`;

// Generate voice files for all voices
async function generateAllVoices() {
  console.log("🎙️ Generating voiceover files for all OpenAI voices...");

  // Ensure voices directory exists
  const voicesDir = path.join(
    __dirname,
    "..",
    "public",
    "demo-videos",
    "voices",
  );
  if (!fs.existsSync(voicesDir)) {
    fs.mkdirSync(voicesDir, { recursive: true });
  }

  const results = [];

  for (const voice of VOICES) {
    console.log(`\n📢 Generating voice: ${voice.name} (${voice.id})`);

    try {
      // Call the TTS API
      const response = await fetch("http://localhost:5173/api/generate-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: SCRIPT,
          voice: voice.id,
          speed: 1.0,
          model: "tts-1", // Standard quality for demos
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.audioBase64) {
        // Convert base64 to buffer
        const base64Data = result.audioBase64.replace(
          /^data:audio\/\w+;base64,/,
          "",
        );
        const buffer = Buffer.from(base64Data, "base64");

        // Save audio file
        const outputPath = path.join(voicesDir, `${voice.id}.mp3`);
        fs.writeFileSync(outputPath, buffer);

        console.log(`✅ ${voice.name} voice saved to:`, outputPath);
        console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);

        results.push({
          voice: voice.id,
          name: voice.name,
          path: outputPath,
          size: buffer.length,
          success: true,
        });
      } else {
        throw new Error("No audio data in response");
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error generating ${voice.name} voice:`, error.message);
      results.push({
        voice: voice.id,
        name: voice.name,
        error: error.message,
        success: false,
      });
    }
  }

  // Save metadata about all voices
  const metadata = {
    generatedAt: new Date().toISOString(),
    script: SCRIPT,
    scriptLength: SCRIPT.length,
    voices: results,
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
  };

  fs.writeFileSync(
    path.join(voicesDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
  );

  console.log("\n📋 Summary:");
  console.log(`✅ Successfully generated: ${metadata.successCount} voices`);
  console.log(`❌ Failed: ${metadata.failureCount} voices`);

  if (metadata.failureCount > 0) {
    console.log("\nFailed voices:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`- ${r.name}: ${r.error}`);
      });
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch("http://localhost:5173/api/health");
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log("🔍 Checking if server is running...");

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error(
      "❌ Server is not running! Please start the dev server with: npm run dev",
    );
    process.exit(1);
  }

  console.log("✅ Server is running");
  await generateAllVoices();
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
