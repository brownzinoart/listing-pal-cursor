import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { createRequire } from "module";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple sources
dotenv.config({ path: "./cloudinary.env" });
dotenv.config(); // Load from .env file

// Create require function for CommonJS modules
const require = createRequire(import.meta.url);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ memory: true });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || "818391876463982",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "zyMwJik6kLgtpOdSh8JDUU-GuDA",
});

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log("✅ Cloudinary configured successfully");
} else {
  console.log(
    "⚠️ Cloudinary Cloud Name not set. Please add CLOUDINARY_CLOUD_NAME to .env",
  );
}

// Decor8AI API configuration
const DECOR8AI_API_KEY =
  process.env.DECOR8AI_API_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5X3V1aWQiOiIyYTBhYmQxMi1hM2M4LTRjZTMtYTM2Yy0wMWE1ZDllZDBkMzQifQ.Wtg_alGa_TPhGqpa4MbIvEwQ-2LGm69Dbw_YXTURiy0";
const DECOR8AI_BASE_URL = "https://api.decor8.ai";

class Decor8AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async uploadImageToCloudinary(imageBuffer, filename) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error(
        "Cloudinary Cloud Name not configured. Please add CLOUDINARY_CLOUD_NAME to .env file.",
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "room-images",
            public_id: `${uuidv4()}-${filename.replace(/\.[^/.]+$/, "")}`, // Remove extension
            format: "jpg",
            quality: "auto",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              console.log(
                "✅ Cloudinary upload successful:",
                result.secure_url,
              );
              resolve(result.secure_url);
            }
          },
        )
        .end(imageBuffer);
    });
  }

  async generateDesign(imageUrl, options = {}) {
    const payload = {
      input_image_url: imageUrl,
      room_type: this.mapRoomType(options.roomType) || "livingroom",
      design_style: this.mapDesignStyle(options.designStyle) || "modern",
      num_images: 1,
      scale_factor: 2,
    };

    console.log("Decor8AI Request:", payload);

    try {
      const response = await axios.post(
        `${DECOR8AI_BASE_URL}/generate_designs_for_room`,
        payload,
        { headers: this.headers },
      );

      console.log("Decor8AI Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Decor8AI Error:", error.response?.data || error.message);
      throw new Error(
        `Decor8AI Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async generateWithPrompt(imageUrl, prompt, numImages = 1) {
    const payload = {
      input_image_url: imageUrl,
      prompt: prompt,
      num_images: numImages,
      scale_factor: 2,
    };

    try {
      const response = await axios.post(
        `${DECOR8AI_BASE_URL}/generate_designs_for_room`,
        payload,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Decor8AI Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  // Map our existing room types to Decor8AI format
  mapRoomType(roomType) {
    const mapping = {
      Bedroom: "bedroom",
      "Living Room": "livingroom",
      "Dining Room": "diningroom",
      Kitchen: "kitchen",
      Bathroom: "bathroom",
      Office: "homeoffice",
      Hallway: "livingroom", // fallback
    };
    return mapping[roomType] || roomType?.toLowerCase();
  }

  // Map our existing styles to Decor8AI format
  mapDesignStyle(style) {
    const mapping = {
      "Modern Minimalist": "minimalist",
      Scandinavian: "scandinavian",
      Industrial: "industrial",
      Bohemian: "bohemian",
      Traditional: "traditional",
      "Mid-Century Modern": "midcenturymodern",
      Luxury: "glamorous",
      Rustic: "rustic",
      "Japanese Zen": "japandi",
      "Art Deco": "artdeco",
      Farmhouse: "farmhouse",
      Contemporary: "contemporary",
      Modern: "modern",
    };
    return mapping[style] || style?.toLowerCase();
  }
}

const decor8ai = new Decor8AIService(DECOR8AI_API_KEY);

// Initialize Gemini AI Content Generation Service
let GeminiService;
try {
  const { GeminiService: GeminiServiceClass } = await import(
    "./services/geminiService.js"
  );
  GeminiService = new GeminiServiceClass();
  console.log("✅ Gemini AI service initialized");
} catch (error) {
  console.log("⚠️ Gemini AI service not available:", error.message);
}

// Google Places API proxy endpoints
app.get("/api/places/autocomplete", async (req, res) => {
  try {
    const { input } = req.query;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

    // 🌟 Demo fallback predictions
    const demoPredictions = (() => {
      if (!input || input.length < 2) return [];
      const normalized = String(input).toLowerCase();
      if (normalized.includes("123 demo")) {
        return [
          {
            description: "123 Demo St, Apex, NC 27523, USA",
            place_id: "demo_place_id",
            structured_formatting: {
              main_text: "123 Demo St",
              secondary_text: "Apex, NC 27523, USA",
            },
          },
        ];
      }
      if (normalized.includes("123 main")) {
        return [
          {
            description: "123 Main St, Apex, NC 27523, USA",
            place_id: "main_place_id",
            structured_formatting: {
              main_text: "123 Main St",
              secondary_text: "Apex, NC 27523, USA",
            },
          },
        ];
      }
      return [];
    })();
    if (demoPredictions.length) {
      return res.json({
        status: "OK",
        predictions: demoPredictions,
        _mockData: true,
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Maps API key not configured and no demo match found",
      });
    }

    if (!input || input.length < 2) {
      return res.json({ predictions: [] });
    }

    console.log("🔍 Google Places Autocomplete for:", input);

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&types=address`;

    const response = await axios.get(url);

    if (response.data.status === "OK") {
      console.log("✅ Found", response.data.predictions.length, "predictions");
      res.json(response.data);
    } else {
      console.log("⚠️ Google Places API error:", response.data.status);
      res.json({ predictions: [], status: response.data.status });
    }
  } catch (error) {
    console.error("❌ Google Places Autocomplete error:", error.message);
    res.status(500).json({
      error: "Failed to fetch address suggestions",
      details: error.message,
    });
  }
});

app.get("/api/places/details", async (req, res) => {
  try {
    const { place_id } = req.query;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

    // 🌟 Demo fallback for place details
    if (place_id === "demo_place_id" || place_id === "main_place_id") {
      return res.json({
        status: "OK",
        result: {
          geometry: {
            location: {
              lat: 35.7324,
              lng: -78.8503,
            },
          },
        },
        _mockData: true,
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Maps API key not configured",
      });
    }

    if (!place_id) {
      return res.status(400).json({
        error: "place_id is required",
      });
    }

    console.log("🎯 Getting place details for:", place_id);

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.status === "OK") {
      console.log(
        "✅ Got place details:",
        response.data.result.geometry.location,
      );
      res.json(response.data);
    } else {
      console.log("⚠️ Google Places Details API error:", response.data.status);
      res.json({ result: null, status: response.data.status });
    }
  } catch (error) {
    console.error("❌ Google Places Details error:", error.message);
    res.status(500).json({
      error: "Failed to fetch place details",
      details: error.message,
    });
  }
});

// Interior design endpoint - DRAG & DROP READY!
app.post("/api/redesign", upload.single("image"), async (req, res) => {
  try {
    if (!DECOR8AI_API_KEY) {
      return res.status(500).json({
        error:
          "Decor8AI API token not configured. Please set DECOR8AI_API_KEY in your .env file.",
      });
    }

    const { style, room_type } = req.body;
    const imageBuffer = req.file.buffer;
    const originalFilename = req.file.originalname || "room-image.jpg";

    console.log(
      `🎨 Processing ${room_type} with ${style} style using Decor8AI...`,
    );
    console.log(
      `📁 Original file: ${originalFilename} (${Math.round(imageBuffer.length / 1024)}KB)`,
    );

    // Step 1: Upload to Cloudinary
    let imageUrl;
    try {
      imageUrl = await decor8ai.uploadImageToCloudinary(
        imageBuffer,
        originalFilename,
      );
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        error:
          "Cloudinary upload failed. Please check your Cloudinary configuration.",
        details: uploadError.message,
        needsSetup: true,
      });
    }

    // Step 2: Generate design with Decor8AI
    const result = await decor8ai.generateDesign(imageUrl, {
      roomType: room_type,
      designStyle: style,
    });

    if (result.info && result.info.images && result.info.images.length > 0) {
      console.log("✅ Decor8AI generation successful!");
      res.json({
        success: true,
        imageUrl: result.info.images[0].url,
        originalUrl: imageUrl,
        cost: 0.2, // $0.20 per generation
        provider: "Decor8AI",
        dimensions: {
          width: result.info.images[0].width,
          height: result.info.images[0].height,
        },
      });
    } else {
      throw new Error("No images received from Decor8AI");
    }
  } catch (error) {
    console.error("Error:", error);

    // Handle specific Decor8AI API errors
    if (error.message.includes("401")) {
      res.status(401).json({
        success: false,
        error:
          "Invalid Decor8AI API token. Please check your DECOR8AI_API_KEY.",
      });
    } else if (error.message.includes("402")) {
      res.status(402).json({
        success: false,
        error:
          "Insufficient credits. Please add credits to your Decor8AI account.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred",
      });
    }
  }
});

// Alternative endpoint for URLs (for testing)
app.post("/api/redesign-url", async (req, res) => {
  try {
    const { imageUrl, style, room_type } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "imageUrl is required",
      });
    }

    console.log(
      `Processing ${room_type} with ${style} style using Decor8AI...`,
    );

    const result = await decor8ai.generateDesign(imageUrl, {
      roomType: room_type,
      designStyle: style,
    });

    if (result.info && result.info.images && result.info.images.length > 0) {
      console.log("✅ Decor8AI generation successful!");
      res.json({
        success: true,
        imageUrl: result.info.images[0].url,
        cost: 0.2, // $0.20 per generation
        provider: "Decor8AI",
        dimensions: {
          width: result.info.images[0].width,
          height: result.info.images[0].height,
        },
      });
    } else {
      throw new Error("No images received from Decor8AI");
    }
  } catch (error) {
    console.error("Decor8AI Error:", error);

    // Handle specific Decor8AI API errors
    if (error.message.includes("401")) {
      res.status(401).json({
        success: false,
        error:
          "Invalid Decor8AI API token. Please check your DECOR8AI_API_KEY.",
      });
    } else if (error.message.includes("402")) {
      res.status(402).json({
        success: false,
        error:
          "Insufficient credits. Please add credits to your Decor8AI account.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred",
      });
    }
  }
});

// Debug endpoint to check environment variables
app.get("/api/debug/env", (req, res) => {
  res.json({
    hasGoogleMapsKey: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
    googleMapsKeyLength: process.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0,
    hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasDecor8AI: !!process.env.DECOR8AI_API_KEY,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const hasCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
  const hasGemini = !!GeminiService && !!process.env.GEMINI_API_KEY;

  res.json({
    status: "healthy",
    hasApiToken: !!DECOR8AI_API_KEY,
    hasCloudinary: hasCloudinary,
    hasGemini: hasGemini,
    provider: "Decor8AI",
    aiContentGeneration: hasGemini ? "Gemini AI" : "Not configured",
    features: {
      dragAndDrop: hasCloudinary,
      urlBased: true,
      fileUpload: hasCloudinary,
      contentGeneration: hasGemini,
      propertyDescriptions: hasGemini,
      socialMediaPosts: hasGemini,
      emailCampaigns: hasGemini,
      flyerContent: hasGemini,
    },
    timestamp: new Date().toISOString(),
  });
});

// Available styles endpoint
app.get("/api/styles", (req, res) => {
  res.json({
    provider: "Decor8AI",
    styles: [
      "Modern",
      "Scandinavian",
      "Industrial",
      "Mid-Century Modern",
      "Minimalist",
      "Contemporary",
      "Traditional",
      "Farmhouse",
      "Bohemian",
      "Rustic",
      "Luxury",
      "Art Deco",
      "Japanese Zen",
    ],
    roomTypes: [
      "Living Room",
      "Bedroom",
      "Kitchen",
      "Bathroom",
      "Dining Room",
      "Office",
    ],
    cost: {
      perGeneration: 0.2,
      currency: "USD",
      description: "Professional interior design AI",
    },
  });
});

// Test endpoint for public image URLs
app.post("/api/test-design", async (req, res) => {
  try {
    // Test with a sample room image
    const testImageUrl =
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop";

    const result = await decor8ai.generateDesign(testImageUrl, {
      roomType: "Living Room",
      designStyle: "Scandinavian",
    });

    res.json({
      success: true,
      message: "Decor8AI test successful!",
      original: testImageUrl,
      generated: result.info.images[0].url,
      cost: 0.2,
      dimensions: {
        width: result.info.images[0].width,
        height: result.info.images[0].height,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================================================================
// REAL DATA FETCHING HELPERS (GOOGLE PLACES API)
// ========================================================================

const getPlaceCoordinates = async (address) => {
  try {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: { address, key: apiKey },
      },
    );
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].geometry.location; // { lat, lng }
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    return null;
  }
};

const getMarketAnalysis = (coordinates) => {
  // Simulate market data based on location.
  // This is a placeholder and should be replaced with a real estate data API for production.
  const isUrban = Math.random() > 0.5; // simple check
  const basePrice = isUrban ? 550000 : 350000;
  const priceFluctuation = (Math.random() - 0.5) * 100000;
  const priceChange = (Math.random() * 8 - 2).toFixed(1);

  return {
    medianPrice: Math.round((basePrice + priceFluctuation) / 1000) * 1000,
    priceChange: `${priceChange > 0 ? "+" : ""}${priceChange}%`,
    daysOnMarket: isUrban
      ? 25 + Math.floor(Math.random() * 20)
      : 45 + Math.floor(Math.random() * 30),
    inventory: isUrban ? "Low" : "Medium",
  };
};

const getDemographics = (coordinates) => {
  // Simulate demographic data based on location.
  // In a real application, this would come from a Census API or similar service.
  const isUrban = Math.random() > 0.6; // Higher threshold for urban demographics
  const baseIncome = isUrban ? 95000 : 62000;
  const incomeFluctuation = (Math.random() - 0.4) * 40000;

  return {
    medianAge: isUrban
      ? 35 + Math.floor(Math.random() * 5)
      : 42 + Math.floor(Math.random() * 8),
    medianIncome: Math.round((baseIncome + incomeFluctuation) / 1000) * 1000,
    familyFriendly: parseFloat(
      (isUrban ? 6.5 + Math.random() * 2 : 8 + Math.random() * 1.5).toFixed(1),
    ),
    diversityIndex: parseFloat(
      (isUrban ? 7 + Math.random() * 2 : 5 + Math.random() * 2).toFixed(1),
    ),
  };
};

const searchNearbyPlaces = async (coordinates, type, radius = 16093) => {
  // 10 miles in meters
  try {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${coordinates.lat},${coordinates.lng}`,
          radius,
          type,
          key: apiKey,
        },
      },
    );
    return response.data.results.map((place) => ({
      name: place.name,
      rating: place.rating || null,
      address: place.vicinity,
    }));
  } catch (error) {
    console.error(`Error searching for ${type}:`, error.message);
    return [];
  }
};

// Location Context API endpoint - Now with REAL DATA integration
app.post("/api/listings/context", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: "Address is required" });
  }

  try {
    const coordinates = await getPlaceCoordinates(address);
    if (!coordinates) {
      return res
        .status(404)
        .json({ message: "Could not find coordinates for the address" });
    }

    const [schools, dining, shopping] = await Promise.all([
      searchNearbyPlaces(coordinates, "school"),
      searchNearbyPlaces(coordinates, "restaurant"),
      searchNearbyPlaces(coordinates, "store"),
    ]);

    const marketTrends = getMarketAnalysis(coordinates);
    const demographics = getDemographics(coordinates);

    const responseData = {
      cards: [
        { id: "schools", fullData: schools },
        { id: "dining", fullData: dining },
        { id: "shopping", fullData: shopping },
        { id: "demographics", fullData: demographics },
      ],
      marketTrends,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in /api/listings/context:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch neighborhood context data" });
  }
});

// Property description generation endpoint
app.post("/api/listings/generate-description", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const { propertyData, style = "professional" } = req.body;

    // Validate required fields
    if (!propertyData || !propertyData.address) {
      return res.status(400).json({
        error: "Property data with address is required",
      });
    }

    console.log(
      "Generating description for:",
      propertyData.address,
      "in",
      style,
      "style",
    );

    const description = await GeminiService.generatePropertyDescription(
      propertyData,
      style,
    );

    res.json({
      success: true,
      description: description.trim(),
      style: style,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Description generation error:", error);
    res.status(500).json({
      error: "Failed to generate property description",
      details: error.message,
    });
  }
});

// Social media content generation endpoint
app.post("/api/listings/generate-social", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const { propertyData, platform, style = "professional" } = req.body;

    if (!propertyData || !platform) {
      return res.status(400).json({
        error: "Property data and platform are required",
      });
    }

    const validPlatforms = ["facebook", "instagram", "linkedin", "twitter"];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: "Invalid platform. Must be one of: " + validPlatforms.join(", "),
      });
    }

    console.log("Generating", platform, "content in", style, "style");

    const content = await GeminiService.generateSocialMediaContent(
      propertyData,
      platform,
      style,
    );

    res.json({
      success: true,
      content: content.trim(),
      platform: platform,
      style: style,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Social media generation error:", error);
    res.status(500).json({
      error: `Failed to generate ${req.body.platform} content`,
      details: error.message,
    });
  }
});

// Email campaign generation endpoint
app.post("/api/listings/generate-email", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const { propertyData, style = "professional" } = req.body;

    if (!propertyData) {
      return res.status(400).json({
        error: "Property data is required",
      });
    }

    console.log("Generating email content in", style, "style");

    const emailContent = await GeminiService.generateEmailContent(
      propertyData,
      style,
    );

    res.json({
      success: true,
      content: emailContent.trim(),
      style: style,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email generation error:", error);
    res.status(500).json({
      error: "Failed to generate email content",
      details: error.message,
    });
  }
});

// Flyer content generation endpoint
app.post("/api/listings/generate-flyer", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const { propertyData, style = "professional" } = req.body;

    if (!propertyData) {
      return res.status(400).json({
        error: "Property data is required",
      });
    }

    console.log("Generating flyer content in", style, "style");

    const flyerContent = await GeminiService.generateFlyerContent(
      propertyData,
      style,
    );

    res.json({
      success: true,
      content: flyerContent.trim(),
      style: style,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Flyer generation error:", error);
    res.status(500).json({
      error: "Failed to generate flyer content",
      details: error.message,
    });
  }
});

// Generic content generation endpoint for neighborhood insights
app.post("/api/generate-content", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const { prompt, contentType = "general" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    console.log("🤖 Generating content for:", contentType);

    const result = await GeminiService.model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    res.json({
      success: true,
      content: content.trim(),
      contentType: contentType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generic content generation error:", error);
    res.status(500).json({
      error: "Failed to generate content",
      details: error.message,
    });
  }
});

// Comprehensive neighborhood insights endpoint
app.post("/api/neighborhood-insights", async (req, res) => {
  try {
    const { address, lat, lng, zip } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    console.log("🏘️ Fetching neighborhood insights for:", address);

    const insights = {};

    // 1. WalkScore API (if available)
    if (process.env.WS_API_KEY && lat && lng) {
      try {
        const walkscoreUrl = `https://api.walkscore.com/score?format=json&transit=1&bike=1&lat=${lat}&lon=${lng}&address=${encodeURIComponent(address)}&wsapikey=${process.env.WS_API_KEY}`;
        const walkResponse = await axios.get(walkscoreUrl);

        if (walkResponse.data && walkResponse.data.walkscore !== undefined) {
          const walkScore = walkResponse.data.walkscore;
          const transitScore = walkResponse.data.transit?.score || 0;
          const bikeScore = walkResponse.data.bike?.score || 0;

          // Generate custom descriptions based on score ranges
          const getWalkabilityDescription = (score) => {
            if (score >= 90)
              return "Walker's Paradise - daily errands do not require a car";
            if (score >= 80)
              return "Very Walkable - most errands can be accomplished on foot";
            if (score >= 70)
              return "Walkable - some errands can be accomplished on foot";
            if (score >= 50)
              return "Somewhat Walkable - some errands can be accomplished on foot";
            if (score >= 25)
              return "Car-Dependent - most errands require a car";
            return "Car-Dependent - all errands require a car";
          };

          const getTransitDescription = (score) => {
            if (score >= 70) return "Excellent Transit";
            if (score >= 50) return "Good Transit";
            if (score >= 25) return "Some Transit";
            return "Minimal Transit";
          };

          const getBikeDescription = (score) => {
            if (score >= 80) return "Very Bikeable";
            if (score >= 60) return "Bikeable";
            if (score >= 40) return "Somewhat Bikeable";
            return "Not Bikeable";
          };

          insights.walkability = {
            walk: walkScore,
            transit: transitScore,
            bike: bikeScore,
            description: getWalkabilityDescription(walkScore),
            transitDescription: getTransitDescription(transitScore),
            bikeDescription: getBikeDescription(bikeScore),
          };
          console.log("✅ WalkScore data retrieved");
        }
      } catch (error) {
        console.warn("⚠️ WalkScore API failed:", error.message);
      }
    }

    // 2. Crime data (if FBI API available)
    if (process.env.FBI_API_KEY && zip) {
      try {
        const crimeUrl = `https://api.usa.gov/crime/fbi/sapi/api/estimates/zip/${zip}?api_key=${process.env.FBI_API_KEY}`;
        const crimeResponse = await axios.get(crimeUrl);

        if (crimeResponse.data && crimeResponse.data.results) {
          const data = crimeResponse.data.results[0];
          insights.crime = {
            violent: data?.violent_crime || 0,
            property: data?.property_crime || 0,
            total: (data?.violent_crime || 0) + (data?.property_crime || 0),
          };
          console.log("✅ FBI Crime data retrieved");
        }
      } catch (error) {
        console.warn("⚠️ FBI Crime API failed:", error.message);
      }
    }

    // 3. Market trends (if Rentcast API available)
    if (process.env.RENTCAST_API_KEY && address) {
      try {
        const rentcastHeaders = { "X-Api-Key": process.env.RENTCAST_API_KEY };
        const marketUrl = `https://api.rentcast.io/v1/markets?address=${encodeURIComponent(address)}`;
        const marketResponse = await axios.get(marketUrl, {
          headers: rentcastHeaders,
        });

        if (marketResponse.data && marketResponse.data.length > 0) {
          const market = marketResponse.data[0];
          insights.marketTrends = {
            medianSale: market.medianSalePrice || 0,
            medianRent: market.medianRentPrice || 0,
            yoyPrice: market.yoyPriceChange || 0,
            daysOnMarket: market.avgDaysOnMarket || 0,
          };
          console.log("✅ Rentcast market data retrieved");
        }
      } catch (error) {
        console.warn("⚠️ Rentcast API failed:", error.message);
      }
    }

    // 4. Enhanced nearby places (using Google Places if available)
    if (process.env.VITE_GOOGLE_MAPS_API_KEY && lat && lng) {
      try {
        const places = {};

        // Enhanced school search with multiple types and categorization
        console.log("🏫 Searching for schools within 10 miles...");
        const schoolTypes = [
          "primary_school",
          "secondary_school",
          "school",
          "university",
        ];
        const allSchools = [];

        for (const schoolType of schoolTypes) {
          const schoolUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16093&type=${schoolType}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
          const schoolResponse = await axios.get(schoolUrl);

          if (schoolResponse.data && schoolResponse.data.results) {
            const schools = schoolResponse.data.results.map((place) => {
              const distance = calculateDistance(
                lat,
                lng,
                place.geometry.location.lat,
                place.geometry.location.lng,
              );

              // Categorize schools by grade level based on name and type
              let gradeLevel = "Other";
              const name = place.name.toLowerCase();

              if (
                name.includes("elementary") ||
                name.includes("primary") ||
                schoolType === "primary_school"
              ) {
                gradeLevel = "Elementary";
              } else if (name.includes("middle") || name.includes("junior")) {
                gradeLevel = "Middle School";
              } else if (
                name.includes("high") ||
                name.includes("senior") ||
                schoolType === "secondary_school"
              ) {
                gradeLevel = "High School";
              } else if (
                name.includes("university") ||
                name.includes("college") ||
                schoolType === "university"
              ) {
                gradeLevel = "College/University";
              } else if (
                name.includes("preschool") ||
                name.includes("daycare") ||
                name.includes("kindergarten")
              ) {
                gradeLevel = "Pre-K/Daycare";
              }

              return {
                name: place.name,
                rating: place.rating || 0,
                vicinity: place.vicinity,
                distance: `${distance.toFixed(1)} mi`,
                gradeLevel,
                type: schoolType,
                placeId: place.place_id,
              };
            });

            allSchools.push(...schools);
          }
        }

        // Remove duplicates and sort by distance
        const uniqueSchools = allSchools
          .filter(
            (school, index, self) =>
              index === self.findIndex((s) => s.name === school.name),
          )
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 20);

        places.schools = uniqueSchools;

        // Enhanced attractions and amenities search (10 mile radius)
        console.log(
          "🎯 Searching for attractions and amenities within 10 miles...",
        );
        const amenityTypes = [
          "restaurant",
          "grocery_or_supermarket",
          "park",
          "shopping_mall",
          "movie_theater",
          "gym",
          "library",
          "hospital",
          "pharmacy",
          "gas_station",
          "bank",
          "coffee_shop",
          "museum",
          "zoo",
        ];

        for (const amenityType of amenityTypes) {
          const amenityUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16093&type=${amenityType}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
          const amenityResponse = await axios.get(amenityUrl);

          if (amenityResponse.data && amenityResponse.data.results) {
            places[amenityType] = amenityResponse.data.results
              .slice(0, 10)
              .map((place) => {
                const distance = calculateDistance(
                  lat,
                  lng,
                  place.geometry.location.lat,
                  place.geometry.location.lng,
                );
                return {
                  name: place.name,
                  rating: place.rating || 0,
                  vicinity: place.vicinity,
                  distance: `${distance.toFixed(1)} mi`,
                  category: amenityType
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                };
              })
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
          }
        }

        insights.places = places;
        console.log(
          `✅ Enhanced Places data retrieved - ${uniqueSchools.length} schools, ${amenityTypes.length} amenity categories`,
        );
      } catch (error) {
        console.warn("⚠️ Google Places API failed:", error.message);
      }
    }

    // Helper function to calculate distance between coordinates
    function calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 3959; // Earth's radius in miles
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Return collected insights
    console.log("📊 Neighborhood insights collected:", Object.keys(insights));
    res.json({
      success: true,
      address,
      data: insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Neighborhood insights error:", error);
    res.status(500).json({
      error: "Failed to fetch neighborhood insights",
      details: error.message,
    });
  }
});

// Batch content generation endpoint
app.post("/api/listings/generate-all-content", async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({
        error:
          "Gemini AI service not available. Please check GEMINI_API_KEY in .env file.",
      });
    }

    const {
      propertyData,
      style = "professional",
      platforms = ["facebook", "instagram", "linkedin"],
    } = req.body;

    if (!propertyData) {
      return res.status(400).json({
        error: "Property data is required",
      });
    }

    console.log("Generating all content for:", propertyData.address);

    // Generate all content in parallel
    const [description, socialContent, flyerContent, emailContent] =
      await Promise.all([
        GeminiService.generatePropertyDescription(propertyData, style),
        Promise.all(
          platforms.map(async (platform) => ({
            platform,
            content: await GeminiService.generateSocialMediaContent(
              propertyData,
              platform,
              style,
            ),
          })),
        ),
        GeminiService.generateFlyerContent(propertyData, style),
        GeminiService.generateEmailContent(propertyData, style),
      ]);

    // Format social content as object
    const socialContentObj = {};
    socialContent.forEach(({ platform, content }) => {
      socialContentObj[platform] = content.trim();
    });

    res.json({
      success: true,
      description: description.trim(),
      socialContent: socialContentObj,
      flyerContent: flyerContent.trim(),
      emailContent: emailContent.trim(),
      style: style,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    res.status(500).json({
      error: "Failed to generate content",
      details: error.message,
    });
  }
});

// Helper function to categorize cards
function categorizecards(cards) {
  return {
    location: cards.filter((c) => ["walkability", "climate"].includes(c.id)),
    community: cards.filter((c) => ["demographics", "safety"].includes(c.id)),
    amenities: cards.filter((c) =>
      ["dining", "shopping", "parks", "recreation"].includes(c.id),
    ),
    education: cards.filter((c) => ["schools", "libraries"].includes(c.id)),
    transportation: cards.filter((c) => ["transit", "commute"].includes(c.id)),
  };
}

// Debug endpoint to check environment variables
app.get("/api/debug/env", (req, res) => {
  res.json({
    hasGoogleMapsKey: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
    googleMapsKeyLength: process.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0,
    hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasDecor8AI: !!process.env.DECOR8AI_API_KEY,
  });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.post("/api/fetch-property-details", async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    return res.status(500).json({
      error: "Google Search API is not configured.",
      details:
        "Please ensure VITE_GOOGLE_MAPS_API_KEY and GOOGLE_SEARCH_ENGINE_ID are set in your .env file. A Google Search Engine ID is required to search for public listings.",
    });
  }

  console.log(`Fetching details for address: ${address}`);

  try {
    // Use Gemini AI to generate realistic property details based on address location
    console.log(
      "🔍 Asking Gemini AI to cross-reference multiple real estate sites for:",
      address,
    );

    const geminiPrompt = `Find property details for: "${address}"

Search Zillow, Redfin, Realtor.com, and MLS data. Cross-reference multiple sources for accuracy.

VALIDATION RULES:
- bathrooms: Use decimals like 1.5, 2.5, 3.5 (NOT 35!)
- bedrooms: 1-6 typical
- price: Reasonable market value
- squareFootage: 800-5000 typical
- yearBuilt: 1800-2024

Return ONLY this JSON:
{
  "price": "",
  "bedrooms": "",
  "bathrooms": "",
  "squareFootage": "",
  "yearBuilt": "",
  "propertyType": ""
}`;

    if (!GeminiService) {
      return res
        .status(500)
        .json({ error: "Gemini AI service not available." });
    }

    const result = await GeminiService.model.generateContent(geminiPrompt);
    const response = await result.response;
    const extractedData = response.text();

    console.log("🔍 Raw Gemini Response:", extractedData);
    console.log("🔍 Response length:", extractedData.length);
    console.log("🔍 First 200 chars:", extractedData.substring(0, 200));

    // Clean up the response from Gemini to ensure it's valid JSON
    const jsonString = extractedData.match(/\{[\s\S]*\}/);
    console.log("🔍 Matched JSON string:", jsonString);
    if (!jsonString) {
      console.log("❌ Could not parse Gemini response as JSON");
      console.log("❌ Full response was:", extractedData);
      return res
        .status(500)
        .json({ error: "AI could not generate property details." });
    }

    const propertyDetails = JSON.parse(jsonString[0]);

    console.log("📊 Generated Property Details:", propertyDetails);
    console.log("💰 Price generated:", propertyDetails.price);
    console.log("🏠 Property Type generated:", propertyDetails.propertyType);

    // Ensure all expected fields are present
    const completeDetails = {
      price: propertyDetails.price || "",
      bedrooms: propertyDetails.bedrooms || "",
      bathrooms: propertyDetails.bathrooms || "",
      squareFootage: propertyDetails.squareFootage || "",
      yearBuilt: propertyDetails.yearBuilt || "",
      propertyType: propertyDetails.propertyType || "",
    };

    console.log("📤 Final response being sent:", completeDetails);
    res.json(completeDetails);
  } catch (error) {
    console.error(
      "Error fetching property details:",
      error.response ? error.response.data : error.message,
    );

    // Handle specific Google API errors - return empty data instead of mock
    if (error.response?.data?.error?.code === 403) {
      console.log(
        "🔄 Google Custom Search API is not configured - returning empty property details",
      );
      console.log(
        "💡 To get real property data, set up Google Custom Search API and GOOGLE_SEARCH_ENGINE_ID",
      );

      // Return empty data structure instead of mock data
      const emptyData = {
        price: "",
        bedrooms: "",
        bathrooms: "",
        squareFootage: "",
        yearBuilt: "",
        propertyType: "",
      };

      console.log("📋 Returning empty property details:", emptyData);
      return res.json(emptyData);
    }

    // For other errors, also return empty data with helpful message
    console.log(
      "❌ Property details fetch failed:",
      error.response?.data?.error?.message || error.message,
    );
    console.log(
      "💡 Auto-fill will be skipped - please enter property details manually",
    );

    const emptyData = {
      price: "",
      bedrooms: "",
      bathrooms: "",
      squareFootage: "",
      yearBuilt: "",
      propertyType: "",
    };

    res.status(200).json(emptyData); // Return 200 with empty data instead of 500 error
  }
});

// Rentcast Market Analysis endpoint for NeighborhoodInsights
app.post("/api/rentcast/market-analysis", async (req, res) => {
  try {
    const { address, lat, lng } = req.body;

    if (!process.env.RENTCAST_API_KEY) {
      return res.status(500).json({
        error: "Rentcast API key not configured",
        details: "Please add RENTCAST_API_KEY to your .env file",
      });
    }

    console.log("🏠 Rentcast Market Analysis for:", address);

    const rentcastHeaders = { "X-Api-Key": process.env.RENTCAST_API_KEY };

    // Use Rentcast AVM endpoints for property-specific market analysis
    console.log(
      "🔍 Calling Rentcast AVM endpoints for property-specific market data...",
    );

    // Prepare address parameter for AVM calls
    let addressParam = "";
    if (address) {
      addressParam = `address=${encodeURIComponent(address)}`;
    } else if (lat && lng) {
      addressParam = `latitude=${lat}&longitude=${lng}`;
    } else {
      return res.status(400).json({ error: "Address or coordinates required" });
    }

    // Call both value and rent estimate endpoints in parallel
    const [valueResponse, rentResponse] = await Promise.allSettled([
      axios.get(`https://api.rentcast.io/v1/avm/value?${addressParam}`, {
        headers: rentcastHeaders,
      }),
      axios.get(
        `https://api.rentcast.io/v1/avm/rent/long-term?${addressParam}`,
        { headers: rentcastHeaders },
      ),
    ]);

    console.log("📊 Rentcast AVM responses:", {
      value:
        valueResponse.status === "fulfilled"
          ? "Success"
          : valueResponse.reason?.response?.status,
      rent:
        rentResponse.status === "fulfilled"
          ? "Success"
          : rentResponse.reason?.response?.status,
    });

    let valueData = null;
    let rentData = null;

    if (valueResponse.status === "fulfilled") {
      valueData = valueResponse.value.data;
      console.log("✅ Value estimate:", valueData.price);
    }

    if (rentResponse.status === "fulfilled") {
      rentData = rentResponse.value.data;
      console.log("✅ Rent estimate:", rentData.rent);
    }

    // If neither endpoint returned data, return error
    if (!valueData && !rentData) {
      return res.status(404).json({
        error: "No market data found",
        message: "Rentcast could not find valuation data for this location",
      });
    }

    // Calculate market stats from comparables
    let medianPrice = 0;
    let medianRent = 0;
    let avgDaysOnMarket = 0;
    let pricePerSqFt = 0;

    if (valueData) {
      medianPrice = valueData.price || 0;

      // Calculate average days on market from comparables
      if (valueData.comparables && valueData.comparables.length > 0) {
        const totalDays = valueData.comparables.reduce(
          (sum, comp) => sum + (comp.daysOnMarket || 0),
          0,
        );
        avgDaysOnMarket = Math.round(totalDays / valueData.comparables.length);

        // Calculate price per sq ft from comparables
        const pricesPerSqFt = valueData.comparables
          .map((comp) =>
            comp.price && comp.squareFootage
              ? comp.price / comp.squareFootage
              : 0,
          )
          .filter((price) => price > 0);
        if (pricesPerSqFt.length > 0) {
          pricePerSqFt = Math.round(
            pricesPerSqFt.reduce((sum, price) => sum + price, 0) /
              pricesPerSqFt.length,
          );
        }
      }
    }

    if (rentData) {
      medianRent = rentData.rent || 0;
    }

    const transformedData = {
      marketTrends: {
        medianPrice: medianPrice,
        medianRent: medianRent,
        daysOnMarket: avgDaysOnMarket,
        pricePerSqFt: pricePerSqFt,
        priceChange: "0%", // AVM doesn't provide historical change data
        inventory:
          avgDaysOnMarket < 20
            ? "Low"
            : avgDaysOnMarket < 40
              ? "Moderate"
              : "High",
      },
      propertyEstimate: {
        value: valueData?.price || 0,
        valueRange: valueData
          ? `$${(valueData.priceRangeLow || 0).toLocaleString()} - $${(valueData.priceRangeHigh || 0).toLocaleString()}`
          : "",
        rent: rentData?.rent || 0,
        rentRange: rentData
          ? `$${(rentData.rentRangeLow || 0).toLocaleString()} - $${(rentData.rentRangeHigh || 0).toLocaleString()}`
          : "",
        comparablesCount:
          (valueData?.comparables?.length || 0) +
          (rentData?.comparables?.length || 0),
      },
      dataSource: "rentcast-avm",
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Transformed Rentcast market data:", transformedData);

    res.json(transformedData);
  } catch (error) {
    console.error("❌ Rentcast Market Analysis Error:", error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Invalid Rentcast API key",
        details: "Please check your RENTCAST_API_KEY in the .env file",
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: "Rentcast API access denied",
        details: "Your API key may not have access to market data",
      });
    }

    res.status(500).json({
      error: "Failed to fetch market analysis from Rentcast",
      details: error.message,
    });
  }
});

// RentCast property details endpoint for form auto-fill
app.post("/api/property", async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  // ================================================================
  // 1️⃣ ATTOM API (preferred if API key provided)
  // ================================================================
  if (process.env.ATTOM_API_KEY) {
    try {
      console.log("🏠 ATTOM API - Fetching property details for:", address);
      const attomHeaders = {
        apikey: process.env.ATTOM_API_KEY,
        Accept: "application/json",
      };
      const attomUrl = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile?address=${encodeURIComponent(address)}`;
      const attomResponse = await axios.get(attomUrl, {
        headers: attomHeaders,
      });

      if (
        attomResponse.data &&
        attomResponse.data.property &&
        attomResponse.data.property.length
      ) {
        const p = attomResponse.data.property[0];
        const mapped = {
          estimatedValue: p?.avm?.amount?.value || null,
          bedrooms: p?.building?.rooms?.beds || null,
          bathrooms: p?.building?.rooms?.bathstotal || null,
          squareFootage:
            p?.building?.size?.livingsize ||
            p?.building?.size?.universalsize ||
            null,
          yearBuilt: p?.summary?.yearbuilt || null,
          propertyType: p?.summary?.propclass || p?.summary?.proptype || null,
          _attomData: p,
          _priceSource: p?.avm?.amount?.value ? "ATTOM AVM" : "ATTOM",
        };
        console.log("✅ ATTOM data mapped", mapped);
        const complete = await fillMissingPropertyData(address, mapped);
        return res.json(complete);
      }
      console.log("⚠️ No results from ATTOM");
    } catch (error) {
      console.error("❌ ATTOM error:", error.response?.data || error.message);
      // Continue to RentCast fallback
    }
  }

  // ================================================================
  // 2️⃣ RentCast fallback (if key provided)
  // ================================================================
  console.log("🏠 RentCast API - Fetching property details for:", address);

  if (!process.env.RENTCAST_API_KEY) {
    console.log("⚠️ RENTCAST_API_KEY not found in environment variables");
    return res.status(500).json({
      error: "No property data provider configured",
      details:
        "Please add ATTOM_API_KEY or RENTCAST_API_KEY to your .env file.",
    });
  }

  try {
    // Use RentCast API to get real property data
    const rentcastHeaders = {
      "X-Api-Key": process.env.RENTCAST_API_KEY,
      "Content-Type": "application/json",
    };

    const propertyUrl = `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`;
    console.log("🔍 Calling RentCast API:", propertyUrl);

    const propertyResponse = await axios.get(propertyUrl, {
      headers: rentcastHeaders,
    });
    console.log("📡 RentCast API Response Status:", propertyResponse.status);

    if (propertyResponse.data && propertyResponse.data.length > 0) {
      const property = propertyResponse.data[0];
      console.log("✅ RentCast property data found:", property);

      // Prioritize current valuations over old sale prices
      let currentPrice = null;
      let priceSource = "";

      // 1. Try current tax assessment (most reliable current value)
      if (property.taxAssessments) {
        const currentYear = new Date().getFullYear();
        const assessmentYears = Object.keys(property.taxAssessments)
          .map(Number)
          .sort((a, b) => b - a);
        const mostRecentYear = assessmentYears[0];

        if (mostRecentYear >= currentYear - 1) {
          currentPrice = property.taxAssessments[mostRecentYear].value;
          priceSource = `${mostRecentYear} Tax Assessment`;
          console.log(
            `💰 Using ${mostRecentYear} tax assessment: $${currentPrice.toLocaleString()}`,
          );
        }
      }

      // 2. Fallback to Rentcast estimates if available
      if (!currentPrice) {
        currentPrice =
          property.price ||
          property.estimatedPrice ||
          property.rentEstimate?.high;
        if (currentPrice) priceSource = "Rentcast Estimate";
      }

      // 3. Last resort: old sale price (but mark as outdated)
      if (!currentPrice) {
        currentPrice = property.lastSalePrice;
        if (currentPrice && property.lastSaleDate) {
          const saleYear = new Date(property.lastSaleDate).getFullYear();
          priceSource = `${saleYear} Sale Price (Outdated)`;
        }
      }

      // Map RentCast response to expected format
      let mappedData = {
        estimatedValue: currentPrice,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        yearBuilt: property.yearBuilt,
        propertyType: property.propertyType,
        _priceSource: priceSource,
        // Include raw data for debugging
        _rentcastData: property,
      };

      console.log(
        `📊 Price: $${currentPrice?.toLocaleString() || "N/A"} (Source: ${priceSource})`,
      );

      // Check if we need a current market estimate (only for very old data or missing price)
      const needsMarketEstimate =
        !currentPrice ||
        (property.lastSaleDate &&
          !property.taxAssessments &&
          new Date(property.lastSaleDate).getFullYear() <
            new Date().getFullYear() - 3);

      if (needsMarketEstimate && GeminiService) {
        console.log("💰 Getting current market estimate via Gemini...");
        try {
          const marketPrompt = `What is the current market value for: "${address}"?

Look up recent comparable sales, current market trends, and provide a realistic 2024 market estimate.

CRITICAL: Return ONLY a number (no currency symbols, commas, or text).

If the property exists, provide a realistic market value.
If you cannot find the property, return 0.

Examples of good responses:
- 875000
- 1250000
- 0

Return only the number:`;

          const result =
            await GeminiService.model.generateContent(marketPrompt);
          const response = await result.response;
          const marketText = response.text().trim();

          console.log("🔍 Gemini market estimate response:", marketText);

          // Parse the number response
          const marketNumber = parseInt(marketText.replace(/[^\d]/g, ""));
          if (marketNumber && marketNumber > 50000) {
            console.log("✅ Got current market estimate:", marketNumber);
            mappedData.estimatedValue = marketNumber;
            mappedData._priceSource = "AI Market Estimate";
          } else {
            console.log(
              "⚠️ Invalid market estimate response, keeping original",
            );
          }
        } catch (error) {
          console.warn("⚠️ Market estimate fallback failed:", error.message);
        }
      }

      console.log("🔄 Final mapped property data:", mappedData);

      // Use OpenAI to fill any missing data gaps
      const completeData = await fillMissingPropertyData(address, mappedData);
      res.json(completeData);
    } else {
      console.log("⚠️ No property data found in RentCast response");

      // Fallback: Try to get basic data via LLM web search
      if (GeminiService) {
        console.log("🔄 Attempting LLM fallback for basic property data...");
        try {
          const propertyPrompt = `Get current property data for: "${address}"

Search Zillow, Redfin, Realtor.com, and provide:

Return ONLY this JSON format:
{
  "price": [current_zestimate_number_only],
  "bedrooms": [number],
  "bathrooms": [number_with_decimal],
  "squareFootage": [number],
  "yearBuilt": [year],
  "propertyType": "[Single Family/Condo/Townhouse]"
}

STRICT RULES:
- Numbers only (no $, commas, text)
- Use 0 if data not found
- Bathrooms can be decimal (2.5)
- Property type must be exact match

Example: {"price": 875000, "bedrooms": 3, "bathrooms": 2.5, "squareFootage": 1800, "yearBuilt": 1995, "propertyType": "Single Family"}`;

          const result =
            await GeminiService.model.generateContent(propertyPrompt);
          const response = await result.response;
          const dataText = response.text().trim();

          console.log("🔍 Gemini property data response:", dataText);

          // Parse JSON response
          const jsonMatch = dataText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const propertyData = JSON.parse(jsonMatch[0]);
            const fallbackData = {
              estimatedValue: propertyData.price || null,
              bedrooms: propertyData.bedrooms || null,
              bathrooms: propertyData.bathrooms || null,
              squareFootage: propertyData.squareFootage || null,
              yearBuilt: propertyData.yearBuilt || null,
              propertyType: propertyData.propertyType || null,
              _dataSource: "gemini_web_search",
            };

            console.log("✅ LLM fallback data:", fallbackData);

            // Also fill any remaining gaps with OpenAI
            const completeData = await fillMissingPropertyData(
              address,
              fallbackData,
            );
            return res.json(completeData);
          }
        } catch (error) {
          console.warn("⚠️ LLM fallback failed:", error.message);
        }
      }

      const emptyData = {
        estimatedValue: null,
        bedrooms: null,
        bathrooms: null,
        squareFootage: null,
        yearBuilt: null,
        propertyType: null,
        _rentcastData: null,
      };

      // Try OpenAI to fill all missing data as last resort
      const completeData = await fillMissingPropertyData(address, emptyData);
      res.json(completeData);
    }
  } catch (error) {
    console.error("❌ COMPREHENSIVE RENTCAST API ERROR LOG:");
    console.error("❌ Error Type:", typeof error);
    console.error("❌ Error Name:", error?.name);
    console.error("❌ Error Message:", error?.message);
    console.error("❌ Error Stack:", error?.stack);
    console.error("❌ Error Response Data:", error?.response?.data);
    console.error("❌ Error Status:", error?.response?.status);
    console.error("❌ Error Status Text:", error?.response?.statusText);
    console.error("❌ Error Config:", error?.config);
    console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
    console.error("❌ Address that caused error:", address);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Invalid RentCast API key",
        details: "Please check your RENTCAST_API_KEY in the .env file",
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: "RentCast API access denied",
        details:
          "Your API key may have insufficient permissions or you may have exceeded rate limits",
      });
    }

    // Try OpenAI fallback for 404 errors (property not found) or other API failures
    if (error.response?.status === 404 || error.response?.status >= 400) {
      console.log(
        "🔄 RentCast failed, attempting full LLM fallback for:",
        address,
      );
      try {
        const propertyPrompt = `Get current property data for: "${address}"

Search Zillow, Redfin, Realtor.com, and provide current market data:

Return ONLY this JSON format:
{
  "price": [current_zestimate_number_only],
  "bedrooms": [number],
  "bathrooms": [number_with_decimal],
  "squareFootage": [number],
  "yearBuilt": [year],
  "propertyType": "[Single Family/Condo/Townhouse]"
}

STRICT RULES:
- Numbers only (no $, commas, text)
- Use 0 if data not found
- Bathrooms can be decimal (2.5)
- Property type must be exact match
- Price should be current 2024 market estimate

Example: {"price": 875000, "bedrooms": 3, "bathrooms": 2.5, "squareFootage": 1800, "yearBuilt": 1995, "propertyType": "Single Family"}`;

        const result =
          await GeminiService.model.generateContent(propertyPrompt);
        const response = await result.response;
        const dataText = response.text().trim();

        console.log("🔍 Gemini full fallback response:", dataText);

        // Parse JSON response
        const jsonMatch = dataText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const propertyData = JSON.parse(jsonMatch[0]);
          const fallbackData = {
            estimatedValue: propertyData.price || null,
            bedrooms: propertyData.bedrooms || null,
            bathrooms: propertyData.bathrooms || null,
            squareFootage: propertyData.squareFootage || null,
            yearBuilt: propertyData.yearBuilt || null,
            propertyType: propertyData.propertyType || null,
            _dataSource: "gemini_web_search_full_fallback",
          };

          console.log("✅ LLM full fallback successful:", fallbackData);

          // Always use OpenAI to fill missing data, even if Gemini provided some
          console.log(
            "🤖 Running OpenAI after Gemini fallback to fill remaining gaps",
          );
          const completeData = await fillMissingPropertyData(
            address,
            fallbackData,
          );
          completeData._dataSource = "gemini+openai_fallback";
          return res.json(completeData);
        }
      } catch (fallbackError) {
        console.warn(
          "⚠️ LLM full fallback also failed:",
          fallbackError.message,
        );
      }

      // If Gemini failed, try direct OpenAI fallback
      console.log("🤖 Attempting direct OpenAI fallback for:", address);
      const emptyData = {
        estimatedValue: null,
        bedrooms: null,
        bathrooms: null,
        squareFootage: null,
        yearBuilt: null,
        propertyType: null,
        _dataSource: "openai_direct_fallback",
      };

      const completeData = await fillMissingPropertyData(address, emptyData);
      return res.json(completeData);
    }

    // Return error with details for debugging
    res.status(500).json({
      error: "Failed to fetch property details from RentCast",
      details: error.response?.data?.message || error.message,
      statusCode: error.response?.status,
    });
  }
});

app.post("/api/gemini/neighborhood-insights", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "A prompt is required for the AI" });
  }

  try {
    const result = await GeminiService.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to ensure it's a valid JSON string,
    // as the frontend expects to parse it.
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // The frontend expects an object with a "content" key containing the JSON string
    res.status(200).json({ content: cleanedText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ message: "Failed to generate AI insights" });
  }
});

// OpenAI service for filling missing property data gaps
const fillMissingPropertyData = async (address, existingData) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️ OPENAI_API_KEY not available for data filling");
    return existingData;
  }

  console.log("🤖 Using OpenAI to fill missing property data for:", address);
  console.log("📊 Existing data:", existingData);

  // Identify what structural data is missing (excluding price - agents should set that manually)
  const missingFields = [];
  // Skip price estimation - agents should set asking price manually
  // if (!existingData.estimatedValue || existingData.estimatedValue === 0 || existingData.estimatedValue === null) missingFields.push('zestimate/market_value');
  if (
    !existingData.bedrooms ||
    existingData.bedrooms === 0 ||
    existingData.bedrooms === null
  )
    missingFields.push("bedrooms");
  if (
    !existingData.bathrooms ||
    existingData.bathrooms === 0 ||
    existingData.bathrooms === null
  )
    missingFields.push("bathrooms");
  if (
    !existingData.squareFootage ||
    existingData.squareFootage === 0 ||
    existingData.squareFootage === null
  )
    missingFields.push("square_footage");
  if (
    !existingData.yearBuilt ||
    existingData.yearBuilt === 0 ||
    existingData.yearBuilt === null
  )
    missingFields.push("year_built");

  if (missingFields.length === 0) {
    console.log("✅ All property data already available, no OpenAI needed");
    return existingData;
  }

  console.log("🔍 Missing fields to fill:", missingFields);
  console.log("🔑 OpenAI API Key available:", !!process.env.OPENAI_API_KEY);
  console.log(
    "🔑 OpenAI API Key length:",
    process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : "N/A",
  );

  try {
    const prompt = `You are a real estate data API that provides estimated STRUCTURAL property information for development/testing purposes.

Property address: ${address}

Missing structural data fields: ${missingFields.join(", ")}

TASK: Provide realistic estimates for basic property structure. DO NOT estimate pricing - agents set asking prices manually.

RESPONSE FORMAT - Return ONLY this JSON:
{${missingFields.includes("bedrooms") ? '\n  "bedrooms": NUMBER_ONLY,' : ""}${missingFields.includes("bathrooms") ? '\n  "bathrooms": NUMBER_OR_DECIMAL,' : ""}${missingFields.includes("square_footage") ? '\n  "square_footage": NUMBER_ONLY,' : ""}${missingFields.includes("year_built") ? '\n  "year_built": YEAR_NUMBER' : ""}}

ESTIMATION GUIDELINES:
- bedrooms: typically 2-4 for most homes
- bathrooms: typically 1.5-3.5 for most homes  
- square_footage: typically 1200-2500 sq ft
- year_built: typically 1960-2020

Example: {"bedrooms": 3, "bathrooms": 2.5, "square_footage": 1800, "year_built": 1995}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You provide structural property estimates for development. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "🔍 OpenAI full response object:",
      JSON.stringify(data, null, 2),
    );

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("❌ Invalid OpenAI response structure:", data);
      throw new Error("Invalid OpenAI response structure");
    }

    const content = data.choices[0].message.content.trim();
    console.log("🤖 OpenAI response content:", content);
    console.log("🔍 OpenAI content length:", content.length);

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const filledData = JSON.parse(jsonMatch[0]);
      console.log("✅ OpenAI filled data:", filledData);

      // Merge filled structural data with existing data (excluding pricing)
      const updatedData = { ...existingData };
      // Price should be set manually by agents - skip AI price estimation
      if (filledData.bedrooms && filledData.bedrooms > 0)
        updatedData.bedrooms = filledData.bedrooms;
      if (filledData.bathrooms && filledData.bathrooms > 0)
        updatedData.bathrooms = filledData.bathrooms;
      if (filledData.square_footage && filledData.square_footage > 0)
        updatedData.squareFootage = filledData.square_footage;
      if (filledData.year_built && filledData.year_built > 1800)
        updatedData.yearBuilt = filledData.year_built;

      updatedData._dataSource = `rentcast+openai_filled_${missingFields.join("_")}`;

      console.log("🔄 Final data with OpenAI fills:", updatedData);
      return updatedData;
    } else {
      console.warn("⚠️ Could not parse OpenAI JSON response");
      return existingData;
    }
  } catch (error) {
    console.error("❌ COMPREHENSIVE OPENAI ERROR LOG:");
    console.error("❌ Error Type:", typeof error);
    console.error("❌ Error Name:", error?.name);
    console.error("❌ Error Message:", error?.message);
    console.error("❌ Error Stack:", error?.stack);
    console.error("❌ Error Response:", error?.response?.data);
    console.error("❌ Error Status:", error?.response?.status);
    console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
    console.error("❌ Address that caused error:", address);
    console.error("❌ Existing data when error occurred:", existingData);
    return existingData;
  }
};

// Test endpoint for OpenAI integration debugging
app.post("/api/test-openai", async (req, res) => {
  const { address } = req.body;
  const testAddress = address || "123 Test Street, Sample City, CA";

  console.log("🧪 Testing OpenAI integration for:", testAddress);

  const emptyData = {
    estimatedValue: null,
    bedrooms: null,
    bathrooms: null,
    squareFootage: null,
    yearBuilt: null,
    propertyType: null,
  };

  try {
    const result = await fillMissingPropertyData(testAddress, emptyData);
    res.json({
      success: true,
      original: emptyData,
      filled: result,
      test_address: testAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      test_address: testAddress,
      details: error,
    });
  }
});

// Streamlined auto-fill endpoint for agent workflow
app.post("/api/auto-fill", async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Address is required for auto-fill" });
  }

  console.log("🔄 Auto-fill triggered for address:", address);

  try {
    // Get comprehensive property data
    const propertyData = await getPropertyDataForAutoFill(address);

    // Return structured response optimized for form auto-fill
    res.json({
      success: true,
      address: address,
      autoFilled: {
        bedrooms: {
          value: propertyData.bedrooms,
          source: propertyData.bedroomsSource,
          confidence: propertyData.bedroomsConfidence,
        },
        bathrooms: {
          value: propertyData.bathrooms,
          source: propertyData.bathroomsSource,
          confidence: propertyData.bathroomsConfidence,
        },
        squareFootage: {
          value: propertyData.squareFootage,
          source: propertyData.squareFootageSource,
          confidence: propertyData.squareFootageConfidence,
        },
        yearBuilt: {
          value: propertyData.yearBuilt,
          source: propertyData.yearBuiltSource,
          confidence: propertyData.yearBuiltConfidence,
        },
        propertyType: {
          value: propertyData.propertyType,
          source: propertyData.propertyTypeSource,
          confidence: propertyData.propertyTypeConfidence,
        },
      },
      dataSources: propertyData.dataSources,
      fillStatus: {
        totalFields: 5,
        filledFields: propertyData.filledCount,
        fillPercentage: Math.round((propertyData.filledCount / 5) * 100),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Auto-fill error:", error);
    res.status(500).json({
      success: false,
      error: "Auto-fill failed",
      details: error.message,
      address: address,
    });
  }
});

// Comprehensive property data gathering for auto-fill
async function getPropertyDataForAutoFill(address) {
  console.log("📊 Gathering property data for auto-fill:", address);

  let data = {
    bedrooms: null,
    bathrooms: null,
    squareFootage: null,
    yearBuilt: null,
    propertyType: null,
  };

  let sources = {
    bedrooms: "none",
    bathrooms: "none",
    squareFootage: "none",
    yearBuilt: "none",
    propertyType: "none",
  };

  let confidence = {
    bedrooms: "low",
    bathrooms: "low",
    squareFootage: "low",
    yearBuilt: "low",
    propertyType: "low",
  };

  // 1. Try RentCast first (highest confidence)
  try {
    console.log("🏠 Attempting RentCast lookup...");
    const rentcastHeaders = { "X-Api-Key": process.env.RENTCAST_API_KEY };
    const propertyUrl = `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`;
    const propertyResponse = await axios.get(propertyUrl, {
      headers: rentcastHeaders,
    });

    if (propertyResponse.data && propertyResponse.data.length > 0) {
      const property = propertyResponse.data[0];
      console.log("✅ RentCast data found");

      if (property.bedrooms) {
        data.bedrooms = property.bedrooms;
        sources.bedrooms = "RentCast";
        confidence.bedrooms = "high";
      }
      if (property.bathrooms) {
        data.bathrooms = property.bathrooms;
        sources.bathrooms = "RentCast";
        confidence.bathrooms = "high";
      }
      if (property.squareFootage) {
        data.squareFootage = property.squareFootage;
        sources.squareFootage = "RentCast";
        confidence.squareFootage = "high";
      }
      if (property.yearBuilt) {
        data.yearBuilt = property.yearBuilt;
        sources.yearBuilt = "RentCast";
        confidence.yearBuilt = "high";
      }
      if (property.propertyType) {
        data.propertyType = property.propertyType;
        sources.propertyType = "RentCast";
        confidence.propertyType = "high";
      }
    }
  } catch (error) {
    console.log("⚠️ RentCast lookup failed:", error.message);
  }

  // 2. Fill remaining gaps with OpenAI (medium confidence)
  const missingFields = [];
  if (!data.bedrooms) missingFields.push("bedrooms");
  if (!data.bathrooms) missingFields.push("bathrooms");
  if (!data.squareFootage) missingFields.push("square_footage");
  if (!data.yearBuilt) missingFields.push("year_built");

  if (missingFields.length > 0 && process.env.OPENAI_API_KEY) {
    console.log("🤖 Filling gaps with OpenAI for:", missingFields);
    try {
      const openaiData = await callOpenAIForStructuralData(
        address,
        missingFields,
      );

      if (openaiData.bedrooms && !data.bedrooms) {
        data.bedrooms = openaiData.bedrooms;
        sources.bedrooms = "OpenAI";
        confidence.bedrooms = "medium";
      }
      if (openaiData.bathrooms && !data.bathrooms) {
        data.bathrooms = openaiData.bathrooms;
        sources.bathrooms = "OpenAI";
        confidence.bathrooms = "medium";
      }
      if (openaiData.square_footage && !data.squareFootage) {
        data.squareFootage = openaiData.square_footage;
        sources.squareFootage = "OpenAI";
        confidence.squareFootage = "medium";
      }
      if (openaiData.year_built && !data.yearBuilt) {
        data.yearBuilt = openaiData.year_built;
        sources.yearBuilt = "OpenAI";
        confidence.yearBuilt = "medium";
      }
    } catch (error) {
      console.log("⚠️ OpenAI gap filling failed:", error.message);
    }
  }

  // Count filled fields
  const filledCount = Object.values(data).filter(
    (value) => value !== null,
  ).length;

  return {
    ...data,
    bedroomsSource: sources.bedrooms,
    bathroomsSource: sources.bathrooms,
    squareFootageSource: sources.squareFootage,
    yearBuiltSource: sources.yearBuilt,
    propertyTypeSource: sources.propertyType,
    bedroomsConfidence: confidence.bedrooms,
    bathroomsConfidence: confidence.bathrooms,
    squareFootageConfidence: confidence.squareFootage,
    yearBuiltConfidence: confidence.yearBuilt,
    propertyTypeConfidence: confidence.propertyType,
    dataSources: sources,
    filledCount: filledCount,
  };
}

// Simplified OpenAI call for structural data
async function callOpenAIForStructuralData(address, missingFields) {
  const prompt = `Property address: ${address}

Missing fields: ${missingFields.join(", ")}

Provide realistic estimates for this property structure. Return ONLY JSON:
{${missingFields.includes("bedrooms") ? '"bedrooms": NUMBER,' : ""}${missingFields.includes("bathrooms") ? '"bathrooms": NUMBER,' : ""}${missingFields.includes("square_footage") ? '"square_footage": NUMBER,' : ""}${missingFields.includes("year_built") ? '"year_built": YEAR' : ""}}

Guidelines:
- bedrooms: 2-4 typical
- bathrooms: 1.5-3.5 typical
- square_footage: 1200-2500 typical
- year_built: 1960-2020 typical`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You provide structural property estimates for development. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {};
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎨 Decor8AI Interior Design API ready`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test-design`);

  // Storage status
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log("☁️  Cloudinary configured and ready for drag & drop uploads!");
  } else {
    console.log("⚠️  Please add your CLOUDINARY_CLOUD_NAME to .env file");
  }

  if (!DECOR8AI_API_KEY) {
    console.log(
      "⚠️  Warning: DECOR8AI_API_KEY not set. Using embedded token for demo.",
    );
  } else {
    console.log("✅ Decor8AI API token configured");
  }
});
