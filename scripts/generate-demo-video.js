import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Beverly Hills mansion images from Unsplash
const imageUrls = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1920&h=1080&q=80",
];

// Generate demo video
async function generateDemoVideo() {
  console.log("🎬 Generating demo video for Beverly Hills mansion...");

  try {
    // Call the API to generate video
    const response = await fetch(
      "http://localhost:5173/api/generate-remotion-video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: imageUrls,
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.videoUrl) {
      console.log("✅ Video generated successfully!");
      console.log("📹 Video URL:", result.videoUrl);

      // Download the video
      const videoResponse = await fetch(result.videoUrl);
      const buffer = await videoResponse.buffer();

      // Save to public/demo-videos
      const outputPath = path.join(
        __dirname,
        "..",
        "public",
        "demo-videos",
        "beverly-hills-demo.mp4",
      );
      fs.writeFileSync(outputPath, buffer);

      console.log("💾 Demo video saved to:", outputPath);
      console.log(
        "📊 Video size:",
        (buffer.length / 1024 / 1024).toFixed(2),
        "MB",
      );

      // Also save video metadata
      const metadata = {
        videoId: result.videoId,
        originalUrl: result.videoUrl,
        generatedAt: new Date().toISOString(),
        propertyInfo: {
          address: "1245 Benedict Canyon Drive, Beverly Hills, CA 90210",
          price: "$15,750,000",
          beds: 7,
          baths: 9,
          sqft: 12500,
        },
        duration: 30,
        resolution: "1920x1080",
        fps: 30,
      };

      fs.writeFileSync(
        path.join(
          __dirname,
          "..",
          "public",
          "demo-videos",
          "beverly-hills-demo.json",
        ),
        JSON.stringify(metadata, null, 2),
      );

      console.log("✅ Demo video generation complete!");
    } else {
      throw new Error(result.error || "Unknown error");
    }
  } catch (error) {
    console.error("❌ Error generating demo video:", error);
    process.exit(1);
  }
}

// Run the script
generateDemoVideo();
