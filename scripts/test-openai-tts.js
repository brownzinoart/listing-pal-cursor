import { openaiTTSService } from "../services/openaiTTSService.ts";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testOpenAITTS() {
  console.log("🎙️ Testing OpenAI Text-to-Speech Service\n");

  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.error("❌ OpenAI API key not configured!");
    console.log("\nPlease add your OpenAI API key to .env:");
    console.log("OPENAI_API_KEY=sk-...");
    console.log("VITE_OPENAI_API_KEY=sk-...");
    console.log(
      "\nGet your API key from: https://platform.openai.com/api-keys",
    );
    return;
  }

  console.log("✅ OpenAI API key found\n");

  // Test script for a property
  const propertyScript = `Welcome to this stunning luxury property at 123 Luxury Lane in Beverly Hills. 
  This magnificent 4 bedroom, 3 bathroom home offers 3,500 square feet of pure elegance. 
  As you enter, you'll be greeted by the grand living room with soaring ceilings and natural light. 
  The gourmet kitchen features top-of-the-line appliances and custom cabinetry. 
  The master suite is a true retreat with a spa-like bathroom and walk-in closet. 
  Step outside to discover your own private oasis with a resort-style pool. 
  This property represents the pinnacle of California luxury living.`;

  try {
    // Test 1: Basic TTS generation
    console.log("📝 Test 1: Basic Text-to-Speech");
    console.log("Text length:", propertyScript.length, "characters");
    console.log(
      "Estimated cost: $" +
        openaiTTSService.estimateCost(propertyScript).toFixed(4),
    );
    console.log("\nGenerating speech...");

    const startTime = Date.now();
    const audioUrl = await openaiTTSService.generateSpeech(propertyScript);
    const duration = (Date.now() - startTime) / 1000;

    console.log("✅ Speech generated successfully!");
    console.log("⏱️ Generation time:", duration.toFixed(2), "seconds");
    console.log("🔊 Audio URL:", audioUrl.substring(0, 50) + "...");

    // Test 2: Different voices
    console.log("\n📝 Test 2: Testing different voices");
    const voices = openaiTTSService.getAvailableVoices();
    console.log("Available voices:");
    Object.entries(voices).forEach(([voice, description]) => {
      console.log(`  - ${voice}: ${description}`);
    });

    // Test a shorter script with different voice
    const shortScript = "Welcome to your dream home in Beverly Hills.";
    console.log('\nTesting with "echo" voice...');
    const echoAudio = await openaiTTSService.generateSpeech(shortScript, {
      voice: "echo",
    });
    console.log("✅ Echo voice generated successfully");

    // Test 3: Cost comparison
    console.log("\n💰 Cost Comparison:");
    const scriptLength = propertyScript.length;
    const openAICost = (scriptLength / 1000) * 0.015;
    const elevenLabsCost = (scriptLength / 1000) * 0.165;
    const savings = ((1 - openAICost / elevenLabsCost) * 100).toFixed(1);

    console.log(`Script length: ${scriptLength} characters`);
    console.log(`OpenAI TTS cost: $${openAICost.toFixed(4)}`);
    console.log(`ElevenLabs cost: $${elevenLabsCost.toFixed(4)}`);
    console.log(`Savings: ${savings}% cheaper with OpenAI!`);

    console.log("\n🎉 All tests passed! OpenAI TTS is ready to use.");
    console.log("\n💡 Next steps:");
    console.log("1. Add your OpenAI API key to .env");
    console.log("2. Generate property videos with professional narration");
    console.log("3. Save 91% on voice generation costs!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.message.includes("API key")) {
      console.log("\n🔑 API Key Issue:");
      console.log("Please ensure your OpenAI API key is correctly set in .env");
    } else if (error.message.includes("rate limit")) {
      console.log("\n⏳ Rate Limit:");
      console.log(
        "You may have hit the OpenAI API rate limit. Please try again later.",
      );
    } else {
      console.log("\n🐛 Debug info:");
      console.log(error);
    }
  }
}

// Run the test
testOpenAITTS();
