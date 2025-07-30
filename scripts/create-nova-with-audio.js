import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Script for Nova voice
const NOVA_SCRIPT = `Welcome to this stunning Beverly Hills mansion featuring modern luxury amenities and breathtaking views. 
The grand living room features floor-to-ceiling windows with panoramic city views. 
This gourmet kitchen boasts custom Italian cabinetry and professional-grade appliances. 
The master suite offers a private terrace overlooking the canyon. 
Resort-style outdoor living with infinity pool and spa. 
Luxurious spa bathroom with imported marble finishes. 
This extraordinary estate is offered at $15,750,000. Schedule your private showing today.`;

// Beverly Hills images
const imageUrls = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1920&h=1080&q=80",
];

async function createNovaWithAudio() {
  console.log("🎬 Creating Nova demo with synced audio...");

  try {
    // Step 1: Generate Nova TTS audio
    console.log("🎙️ Generating Nova voice audio...");
    const ttsResponse = await fetch("http://localhost:5173/api/generate-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: NOVA_SCRIPT,
        voice: "nova",
        speed: 1.0,
        model: "tts-1",
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`TTS failed: ${ttsResponse.status}`);
    }

    const ttsResult = await ttsResponse.json();

    if (!ttsResult.audioBase64) {
      throw new Error("No audio generated");
    }

    console.log("✅ Nova audio generated");

    // Step 2: Create video with the Nova audio
    console.log("🎬 Creating video with Nova audio...");
    const videoResponse = await fetch(
      "http://localhost:5173/api/generate-remotion-video",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imageUrls,
          audioUrl: ttsResult.audioBase64, // Nova audio
          propertyInfo: {
            address: "1245 Benedict Canyon Drive, Beverly Hills, CA 90210",
            price: "$15,750,000",
            beds: 7,
            baths: 9,
            sqft: 12500,
          },
          platform: "youtube",
          imageDuration: 5,
          transitionType: "fade",
        }),
      },
    );

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      throw new Error(
        `Video generation failed: ${videoResponse.status} - ${errorText}`,
      );
    }

    const videoResult = await videoResponse.json();

    if (videoResult.success && videoResult.videoUrl) {
      // Step 3: Download and save the synced video
      console.log("💾 Downloading synced Nova video...");
      const finalResponse = await fetch(videoResult.videoUrl);

      if (!finalResponse.ok) {
        throw new Error(`Download failed: ${finalResponse.status}`);
      }

      const buffer = await finalResponse.buffer();

      // Save as Nova demo
      const outputPath = path.join(
        __dirname,
        "..",
        "public",
        "demo-videos",
        "beverly-hills-nova.mp4",
      );
      fs.writeFileSync(outputPath, buffer);

      console.log(
        `✅ Nova demo created: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      );
      console.log(`📁 Saved: /demo-videos/beverly-hills-nova.mp4`);
      console.log(
        "🎯 Now Nova voice selection will play video WITH Nova audio!",
      );

      return true;
    } else {
      throw new Error(videoResult.error || "Video generation failed");
    }
  } catch (error) {
    console.error("❌ Failed to create Nova demo:", error.message);
    return false;
  }
}

// Run it
async function main() {
  console.log("🎯 Creating synced Nova demo...");
  console.log(
    "   This will replace the current Nova video with one that has audio",
  );

  const success = await createNovaWithAudio();

  if (success) {
    console.log("\n🎉 SUCCESS!");
    console.log("✅ Nova demo now has synced audio");
    console.log(
      "🎬 Test: Select Nova voice in demo and video will play WITH audio",
    );
    console.log(
      "\n💡 To create other voices, modify this script for echo, alloy, etc.",
    );
  } else {
    console.log("\n❌ FAILED - check server is running: npm run dev");
  }
}

main();
