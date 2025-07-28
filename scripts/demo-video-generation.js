import fetch from "node-fetch";

// Demo configuration
const API_URL = "http://localhost:3001/api/generate-remotion-video";

// Beautiful property images from Unsplash (real estate photos)
const DEMO_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop", // Living room
  "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1920&h=1080&fit=crop", // Kitchen
  "https://images.unsplash.com/photo-1522444690501-1b9e0bfe2b45?w=1920&h=1080&fit=crop", // Bedroom
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop", // Bathroom
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop", // Exterior
];

async function generateDemoVideo() {
  console.log("🏠 ListingPal Demo Video Generation");
  console.log("=====================================\n");

  const propertyInfo = {
    address: "123 Luxury Lane, Beverly Hills, CA 90210",
    price: "$2,895,000",
    beds: 4,
    baths: 3,
    sqft: 3500,
  };

  console.log("📍 Property:", propertyInfo.address);
  console.log("💰 Price:", propertyInfo.price);
  console.log("🛏️  Beds:", propertyInfo.beds);
  console.log("🚿 Baths:", propertyInfo.baths);
  console.log("📐 Size:", propertyInfo.sqft, "sqft");
  console.log("\n🎬 Generating professional property video...\n");

  try {
    const startTime = Date.now();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: DEMO_PROPERTY_IMAGES,
        propertyInfo,
        transitionType: "fade",
        imageDuration: 4,
        platform: "youtube",
      }),
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (response.ok && data.success) {
      console.log("✅ Video generated successfully!");
      console.log("⏱️  Generation time:", duration, "seconds");
      console.log("📹 Video URL: http://localhost:3001" + data.videoUrl);
      console.log("\n🎉 Your property video is ready!");
      console.log("   Features:");
      console.log("   - Professional transitions");
      console.log("   - Ken Burns effects");
      console.log("   - Property information overlay");
      console.log("   - ListingPal branding");
    } else {
      console.error("❌ Failed to generate video:", data.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the demo
generateDemoVideo();
