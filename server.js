import express from 'express';
import multer from 'multer';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple sources
dotenv.config({ path: './cloudinary.env' });
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
    api_key: process.env.CLOUDINARY_API_KEY || '818391876463982',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'zyMwJik6kLgtpOdSh8JDUU-GuDA'
});

if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('✅ Cloudinary configured successfully');
} else {
    console.log('⚠️ Cloudinary Cloud Name not set. Please add CLOUDINARY_CLOUD_NAME to .env');
}

// Decor8AI API configuration
const DECOR8AI_API_KEY = process.env.DECOR8AI_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5X3V1aWQiOiIyYTBhYmQxMi1hM2M4LTRjZTMtYTM2Yy0wMWE1ZDllZDBkMzQifQ.Wtg_alGa_TPhGqpa4MbIvEwQ-2LGm69Dbw_YXTURiy0";
const DECOR8AI_BASE_URL = "https://api.decor8.ai";

class Decor8AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async uploadImageToCloudinary(imageBuffer, filename) {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            throw new Error('Cloudinary Cloud Name not configured. Please add CLOUDINARY_CLOUD_NAME to .env file.');
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'room-images',
                    public_id: `${uuidv4()}-${filename.replace(/\.[^/.]+$/, "")}`, // Remove extension
                    format: 'jpg',
                    quality: 'auto',
                    fetch_format: 'auto'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    } else {
                        console.log('✅ Cloudinary upload successful:', result.secure_url);
                        resolve(result.secure_url);
                    }
                }
            ).end(imageBuffer);
        });
    }

    async generateDesign(imageUrl, options = {}) {
        const payload = {
            input_image_url: imageUrl,
            room_type: this.mapRoomType(options.roomType) || 'livingroom',
            design_style: this.mapDesignStyle(options.designStyle) || 'modern',
            num_images: 1,
            scale_factor: 2
        };

        console.log('Decor8AI Request:', payload);

        try {
            const response = await axios.post(
                `${DECOR8AI_BASE_URL}/generate_designs_for_room`,
                payload,
                { headers: this.headers }
            );
            
            console.log('Decor8AI Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Decor8AI Error:', error.response?.data || error.message);
            throw new Error(`Decor8AI Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async generateWithPrompt(imageUrl, prompt, numImages = 1) {
        const payload = {
            input_image_url: imageUrl,
            prompt: prompt,
            num_images: numImages,
            scale_factor: 2
        };

        try {
            const response = await axios.post(
                `${DECOR8AI_BASE_URL}/generate_designs_for_room`,
                payload,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Decor8AI Error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Map our existing room types to Decor8AI format
    mapRoomType(roomType) {
        const mapping = {
            'Bedroom': 'bedroom',
            'Living Room': 'livingroom', 
            'Dining Room': 'diningroom',
            'Kitchen': 'kitchen',
            'Bathroom': 'bathroom',
            'Office': 'homeoffice',
            'Hallway': 'livingroom' // fallback
        };
        return mapping[roomType] || roomType?.toLowerCase();
    }

    // Map our existing styles to Decor8AI format
    mapDesignStyle(style) {
        const mapping = {
            'Modern Minimalist': 'minimalist',
            'Scandinavian': 'scandinavian',
            'Industrial': 'industrial',
            'Bohemian': 'bohemian',
            'Traditional': 'traditional',
            'Mid-Century Modern': 'midcenturymodern',
            'Luxury': 'glamorous',
            'Rustic': 'rustic',
            'Japanese Zen': 'japandi',
            'Art Deco': 'artdeco',
            'Farmhouse': 'farmhouse',
            'Contemporary': 'contemporary',
            'Modern': 'modern'
        };
        return mapping[style] || style?.toLowerCase();
    }
}

const decor8ai = new Decor8AIService(DECOR8AI_API_KEY);

// Initialize Gemini AI Content Generation Service
let GeminiService;
try {
  const { GeminiService: GeminiServiceClass } = await import('./services/geminiService.js');
  GeminiService = new GeminiServiceClass();
  console.log('✅ Gemini AI service initialized');
} catch (error) {
  console.log('⚠️ Gemini AI service not available:', error.message);
}

// Google Places API proxy endpoints
app.get('/api/places/autocomplete', async (req, res) => {
    try {
        const { input } = req.query;
        const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Google Maps API key not configured' 
            });
        }
        
        if (!input || input.length < 2) {
            return res.json({ predictions: [] });
        }
        
        console.log('🔍 Google Places Autocomplete for:', input);
        
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&types=address`;
        
        const response = await axios.get(url);
        
        if (response.data.status === 'OK') {
            console.log('✅ Found', response.data.predictions.length, 'predictions');
            res.json(response.data);
        } else {
            console.log('⚠️ Google Places API error:', response.data.status);
            res.json({ predictions: [], status: response.data.status });
        }
    } catch (error) {
        console.error('❌ Google Places Autocomplete error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch address suggestions',
            details: error.message 
        });
    }
});

app.get('/api/places/details', async (req, res) => {
    try {
        const { place_id } = req.query;
        const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Google Maps API key not configured' 
            });
        }
        
        if (!place_id) {
            return res.status(400).json({ 
                error: 'place_id is required' 
            });
        }
        
        console.log('🎯 Getting place details for:', place_id);
        
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=${apiKey}`;
        
        const response = await axios.get(url);
        
        if (response.data.status === 'OK') {
            console.log('✅ Got place details:', response.data.result.geometry.location);
            res.json(response.data);
        } else {
            console.log('⚠️ Google Places Details API error:', response.data.status);
            res.json({ result: null, status: response.data.status });
        }
    } catch (error) {
        console.error('❌ Google Places Details error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch place details',
            details: error.message 
        });
    }
});

// Interior design endpoint - DRAG & DROP READY!
app.post('/api/redesign', upload.single('image'), async (req, res) => {
    try {
        if (!DECOR8AI_API_KEY) {
            return res.status(500).json({ 
                error: 'Decor8AI API token not configured. Please set DECOR8AI_API_KEY in your .env file.' 
            });
        }

        const { style, room_type } = req.body;
        const imageBuffer = req.file.buffer;
        const originalFilename = req.file.originalname || 'room-image.jpg';
        
        console.log(`🎨 Processing ${room_type} with ${style} style using Decor8AI...`);
        console.log(`📁 Original file: ${originalFilename} (${Math.round(imageBuffer.length / 1024)}KB)`);
        
        // Step 1: Upload to Cloudinary
        let imageUrl;
        try {
            imageUrl = await decor8ai.uploadImageToCloudinary(imageBuffer, originalFilename);
        } catch (uploadError) {
            return res.status(500).json({
                success: false,
                error: 'Cloudinary upload failed. Please check your Cloudinary configuration.',
                details: uploadError.message,
                needsSetup: true
            });
        }
        
        // Step 2: Generate design with Decor8AI
        const result = await decor8ai.generateDesign(imageUrl, {
            roomType: room_type,
            designStyle: style
        });
        
        if (result.info && result.info.images && result.info.images.length > 0) {
            console.log('✅ Decor8AI generation successful!');
            res.json({ 
                success: true, 
                imageUrl: result.info.images[0].url,
                originalUrl: imageUrl,
                cost: 0.20, // $0.20 per generation
                provider: 'Decor8AI',
                dimensions: {
                    width: result.info.images[0].width,
                    height: result.info.images[0].height
                }
            });
        } else {
            throw new Error('No images received from Decor8AI');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        // Handle specific Decor8AI API errors
        if (error.message.includes('401')) {
            res.status(401).json({ 
                success: false, 
                error: 'Invalid Decor8AI API token. Please check your DECOR8AI_API_KEY.' 
            });
        } else if (error.message.includes('402')) {
            res.status(402).json({ 
                success: false, 
                error: 'Insufficient credits. Please add credits to your Decor8AI account.' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message || 'An unexpected error occurred' 
            });
        }
    }
});

// Alternative endpoint for URLs (for testing)
app.post('/api/redesign-url', async (req, res) => {
    try {
        const { imageUrl, style, room_type } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'imageUrl is required'
            });
        }

        console.log(`Processing ${room_type} with ${style} style using Decor8AI...`);
        
        const result = await decor8ai.generateDesign(imageUrl, {
            roomType: room_type,
            designStyle: style
        });
        
        if (result.info && result.info.images && result.info.images.length > 0) {
            console.log('✅ Decor8AI generation successful!');
            res.json({ 
                success: true, 
                imageUrl: result.info.images[0].url,
                cost: 0.20, // $0.20 per generation
                provider: 'Decor8AI',
                dimensions: {
                    width: result.info.images[0].width,
                    height: result.info.images[0].height
                }
            });
        } else {
            throw new Error('No images received from Decor8AI');
        }
        
    } catch (error) {
        console.error('Decor8AI Error:', error);
        
        // Handle specific Decor8AI API errors
        if (error.message.includes('401')) {
            res.status(401).json({ 
                success: false, 
                error: 'Invalid Decor8AI API token. Please check your DECOR8AI_API_KEY.' 
            });
        } else if (error.message.includes('402')) {
            res.status(402).json({ 
                success: false, 
                error: 'Insufficient credits. Please add credits to your Decor8AI account.' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message || 'An unexpected error occurred' 
            });
        }
    }
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
    res.json({
        hasGoogleMapsKey: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
        googleMapsKeyLength: process.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0,
        hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasDecor8AI: !!process.env.DECOR8AI_API_KEY
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const hasCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasGemini = !!GeminiService && !!process.env.GEMINI_API_KEY;
    
    res.json({ 
        status: 'healthy', 
        hasApiToken: !!DECOR8AI_API_KEY,
        hasCloudinary: hasCloudinary,
        hasGemini: hasGemini,
        provider: 'Decor8AI',
        aiContentGeneration: hasGemini ? 'Gemini AI' : 'Not configured',
        features: {
            dragAndDrop: hasCloudinary,
            urlBased: true,
            fileUpload: hasCloudinary,
            contentGeneration: hasGemini,
            propertyDescriptions: hasGemini,
            socialMediaPosts: hasGemini,
            emailCampaigns: hasGemini,
            flyerContent: hasGemini
        },
        timestamp: new Date().toISOString()
    });
});

// Available styles endpoint
app.get('/api/styles', (req, res) => {
    res.json({
        provider: 'Decor8AI',
        styles: [
            'Modern',
            'Scandinavian',
            'Industrial', 
            'Mid-Century Modern',
            'Minimalist',
            'Contemporary',
            'Traditional',
            'Farmhouse',
            'Bohemian',
            'Rustic',
            'Luxury',
            'Art Deco',
            'Japanese Zen'
        ],
        roomTypes: [
            'Living Room',
            'Bedroom', 
            'Kitchen',
            'Bathroom',
            'Dining Room',
            'Office'
        ],
        cost: {
            perGeneration: 0.20,
            currency: 'USD',
            description: 'Professional interior design AI'
        }
    });
});


// Test endpoint for public image URLs
app.post('/api/test-design', async (req, res) => {
    try {
        // Test with a sample room image
        const testImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop";
        
        const result = await decor8ai.generateDesign(testImageUrl, {
            roomType: 'Living Room',
            designStyle: 'Scandinavian'
        });
        
        res.json({
            success: true,
            message: 'Decor8AI test successful!',
            original: testImageUrl,
            generated: result.info.images[0].url,
            cost: 0.20,
            dimensions: {
                width: result.info.images[0].width,
                height: result.info.images[0].height
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Location Context API endpoint - Now with REAL DATA integration
app.post('/api/listings/context', async (req, res) => {
  try {
    const { address, latitude, longitude, lat, lng } = req.body;
    // Support both parameter formats
    const finalLat = latitude || lat;
    const finalLng = longitude || lng;
    
    if (!address || address.length < 10) {
      return res.status(400).json({ error: 'Valid address required (minimum 10 characters)' });
    }

    console.log(`🌍 Fetching REAL location data for: ${address}`);
    
    // Use real data service when coordinates are available
    if (finalLat && finalLng && typeof finalLat === 'number' && typeof finalLng === 'number') {
      console.log(`📍 Using coordinates: ${finalLat}, ${finalLng}`);
      
      // Import the real data service
      const { realLocationDataService } = await import('./services/realLocationDataService.js');
      
      // Fetch real location data using coordinates
      const locationData = await realLocationDataService.getLocationContext(address, finalLat, finalLng);
      
      // Transform to match expected format
      const contextData = {
        address: locationData.address,
        coordinates: locationData.coordinates,
        cards: locationData.cards,
        categorizedCards: categorizecards(locationData.cards)
      };
      
      console.log(`✅ Retrieved ${contextData.cards.length} real data cards`);
      res.json(contextData);
    } else {
      // Fallback to mock service for addresses without coordinates
      console.log('⚠️ No coordinates provided, using mock data service');
      
      const { LocationContextService } = await import('./services/locationContextService.js');
      const contextService = new LocationContextService();
      
      const contextData = await contextService.getAllLocationContext(address);
      res.json(contextData);
    }
  } catch (error) {
    console.error('❌ Location context API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location context',
      details: error.message 
    });
  }
});



// Property description generation endpoint
app.post('/api/listings/generate-description', async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({ 
        error: 'Gemini AI service not available. Please check GEMINI_API_KEY in .env file.' 
      });
    }

    const { propertyData, style = 'professional' } = req.body;

    // Validate required fields
    if (!propertyData || !propertyData.address) {
      return res.status(400).json({ 
        error: 'Property data with address is required' 
      });
    }

    console.log('Generating description for:', propertyData.address, 'in', style, 'style');

    const description = await GeminiService.generatePropertyDescription(propertyData, style);

    res.json({
      success: true,
      description: description.trim(),
      style: style,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Description generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate property description',
      details: error.message 
    });
  }
});

// Social media content generation endpoint
app.post('/api/listings/generate-social', async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({ 
        error: 'Gemini AI service not available. Please check GEMINI_API_KEY in .env file.' 
      });
    }

    const { propertyData, platform, style = 'professional' } = req.body;

    if (!propertyData || !platform) {
      return res.status(400).json({ 
        error: 'Property data and platform are required' 
      });
    }

    const validPlatforms = ['facebook', 'instagram', 'linkedin', 'twitter'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ')
      });
    }

    console.log('Generating', platform, 'content in', style, 'style');

    const content = await GeminiService.generateSocialMediaContent(propertyData, platform, style);

    res.json({
      success: true,
      content: content.trim(),
      platform: platform,
      style: style,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Social media generation error:', error);
    res.status(500).json({ 
      error: `Failed to generate ${req.body.platform} content`,
      details: error.message 
    });
  }
});

// Email campaign generation endpoint
app.post('/api/listings/generate-email', async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({ 
        error: 'Gemini AI service not available. Please check GEMINI_API_KEY in .env file.' 
      });
    }

    const { propertyData, style = 'professional' } = req.body;

    if (!propertyData) {
      return res.status(400).json({ 
        error: 'Property data is required' 
      });
    }

    console.log('Generating email content in', style, 'style');

    const emailContent = await GeminiService.generateEmailContent(propertyData, style);

    res.json({
      success: true,
      content: emailContent.trim(),
      style: style,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate email content',
      details: error.message 
    });
  }
});

// Flyer content generation endpoint
app.post('/api/listings/generate-flyer', async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({ 
        error: 'Gemini AI service not available. Please check GEMINI_API_KEY in .env file.' 
      });
    }

    const { propertyData, style = 'professional' } = req.body;

    if (!propertyData) {
      return res.status(400).json({ 
        error: 'Property data is required' 
      });
    }

    console.log('Generating flyer content in', style, 'style');

    const flyerContent = await GeminiService.generateFlyerContent(propertyData, style);

    res.json({
      success: true,
      content: flyerContent.trim(),
      style: style,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Flyer generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate flyer content',
      details: error.message 
    });
  }
});

// Batch content generation endpoint
app.post('/api/listings/generate-all-content', async (req, res) => {
  try {
    if (!GeminiService) {
      return res.status(500).json({ 
        error: 'Gemini AI service not available. Please check GEMINI_API_KEY in .env file.' 
      });
    }

    const { propertyData, style = 'professional', platforms = ['facebook', 'instagram', 'linkedin'] } = req.body;

    if (!propertyData) {
      return res.status(400).json({ 
        error: 'Property data is required' 
      });
    }

    console.log('Generating all content for:', propertyData.address);

    // Generate all content in parallel
    const [description, socialContent, flyerContent, emailContent] = await Promise.all([
      GeminiService.generatePropertyDescription(propertyData, style),
      Promise.all(platforms.map(async platform => ({
        platform,
        content: await GeminiService.generateSocialMediaContent(propertyData, platform, style)
      }))),
      GeminiService.generateFlyerContent(propertyData, style),
      GeminiService.generateEmailContent(propertyData, style)
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
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
});

// Helper function to categorize cards
function categorizecards(cards) {
  return {
    location: cards.filter(c => ['walkability', 'climate'].includes(c.id)),
    community: cards.filter(c => ['demographics', 'safety'].includes(c.id)),
    amenities: cards.filter(c => ['dining', 'shopping', 'parks', 'recreation'].includes(c.id)),
    education: cards.filter(c => ['schools', 'libraries'].includes(c.id)),
    transportation: cards.filter(c => ['transit', 'commute'].includes(c.id))
  };
}

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
    res.json({
        hasGoogleMapsKey: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
        googleMapsKeyLength: process.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0,
        hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasDecor8AI: !!process.env.DECOR8AI_API_KEY
    });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🎨 Decor8AI Interior Design API ready`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test-design`);
    
    // Storage status
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        console.log('☁️  Cloudinary configured and ready for drag & drop uploads!');
    } else {
        console.log('⚠️  Please add your CLOUDINARY_CLOUD_NAME to .env file');
    }
    
    if (!DECOR8AI_API_KEY) {
        console.log('⚠️  Warning: DECOR8AI_API_KEY not set. Using embedded token for demo.');
    } else {
        console.log('✅ Decor8AI API token configured');
    }
}); 