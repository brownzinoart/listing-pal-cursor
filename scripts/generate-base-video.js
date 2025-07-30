import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Beverly Hills mansion images from Unsplash
const imageUrls = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1920&h=1080&q=80'
];

// Generate base video without audio
async function generateBaseVideo() {
  console.log('🎬 Generating base Ken Burns video for Beverly Hills mansion...');
  
  try {
    // Call the API to generate video without audio
    const response = await fetch('http://localhost:5173/api/generate-remotion-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: imageUrls,
        propertyInfo: {
          address: '1245 Benedict Canyon Drive, Beverly Hills, CA 90210',
          price: '$15,750,000',
          beds: 7,
          baths: 9,
          sqft: 12500
        },
        platform: 'youtube',
        imageDuration: 6, // 6 seconds per image for 30 second video
        transitionType: 'fade',
        noAudio: true // Important: generate without audio
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.videoUrl) {
      console.log('✅ Base video generated successfully!');
      console.log('📹 Video URL:', result.videoUrl);
      
      // Download the video
      const videoResponse = await fetch(result.videoUrl);
      const buffer = await videoResponse.buffer();
      
      // Ensure directory exists
      const demoVideosDir = path.join(__dirname, '..', 'public', 'demo-videos');
      if (!fs.existsSync(demoVideosDir)) {
        fs.mkdirSync(demoVideosDir, { recursive: true });
      }
      
      // Save to public/demo-videos
      const outputPath = path.join(demoVideosDir, 'beverly-hills-base.mp4');
      fs.writeFileSync(outputPath, buffer);
      
      console.log('💾 Base video saved to:', outputPath);
      console.log('📊 Video size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');
      
      // Also save video metadata
      const metadata = {
        videoId: result.videoId,
        originalUrl: result.videoUrl,
        generatedAt: new Date().toISOString(),
        propertyInfo: {
          address: '1245 Benedict Canyon Drive, Beverly Hills, CA 90210',
          price: '$15,750,000',
          beds: 7,
          baths: 9,
          sqft: 12500
        },
        duration: 30,
        resolution: '1920x1080',
        fps: 30,
        hasAudio: false,
        imageCount: imageUrls.length,
        imageDuration: 6,
        transition: 'fade'
      };
      
      fs.writeFileSync(
        path.join(demoVideosDir, 'beverly-hills-base.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      console.log('✅ Base video generation complete!');
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error generating base video:', error);
    
    // Fallback: Create using client-side slideshow service
    console.log('🔄 Attempting fallback generation method...');
    await generateWithSlideshowService();
  }
}

// Fallback method using slideshow service
async function generateWithSlideshowService() {
  console.log('Note: This requires a running browser environment.');
  console.log('Please run this in the browser console or use the test page.');
  
  const fallbackScript = `
// Run this in the browser console
import { slideshowVideoService } from './services/slideshowVideoService.ts';
import { getDemoPropertyWithImages } from './services/demoPropertyService.ts';

async function generateBaseVideo() {
  const { images } = await getDemoPropertyWithImages('beverly-hills-mansion');
  
  const videoUrl = await slideshowVideoService.createSlideshow(
    images,
    null, // No audio
    {
      duration: 6,
      transition: 'fade',
      fps: 30
    }
  );
  
  // Download the video
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  // Create download link
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'beverly-hills-base.mp4';
  a.click();
  
  console.log('✅ Base video generated! Save it to public/demo-videos/');
}

generateBaseVideo();
`;

  console.log('Copy and paste this script:', fallbackScript);
}

// Run the script
generateBaseVideo();