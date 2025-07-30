import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// OpenAI TTS voices
const VOICES = [
  { id: 'nova', name: 'Nova', description: 'Professional female voice' },
  { id: 'alloy', name: 'Alloy', description: 'Balanced versatile voice' },
  { id: 'echo', name: 'Echo', description: 'Authoritative male voice' },
  { id: 'fable', name: 'Fable', description: 'British storytelling voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep resonant male voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright energetic female voice' }
];

// Beverly Hills mansion images from Unsplash
const imageUrls = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1920&h=1080&q=80'
];

// Beverly Hills mansion script - NEVER CHANGES, only voice changes
const FIXED_SCRIPT = `Welcome to this stunning Beverly Hills mansion featuring modern luxury amenities and breathtaking views. 
The grand living room features floor-to-ceiling windows with panoramic city views. 
This gourmet kitchen boasts custom Italian cabinetry and professional-grade appliances. 
The master suite offers a private terrace overlooking the canyon. 
Resort-style outdoor living with infinity pool and spa. 
Luxurious spa bathroom with imported marble finishes. 
This extraordinary estate is offered at $15,750,000. Schedule your private showing today.`;

const propertyInfo = {
  address: '1245 Benedict Canyon Drive, Beverly Hills, CA 90210',
  price: '$15,750,000',
  beds: 7,
  baths: 9,
  sqft: 12500
};

// Generate complete video for each voice
async function generateAllDemoVideos() {
  console.log('🎬 Generating complete demo videos for all voices...');
  
  // Ensure demo-videos directory exists
  const demoVideosDir = path.join(__dirname, '..', 'public', 'demo-videos');
  if (!fs.existsSync(demoVideosDir)) {
    fs.mkdirSync(demoVideosDir, { recursive: true });
  }
  
  const results = [];
  
  for (const voice of VOICES) {
    console.log(`\n🎥 Generating complete video for: ${voice.name} (${voice.id})`);
    
    try {
      // Step 1: Generate TTS audio
      console.log('  🎙️ Generating voiceover...');
      const ttsResponse = await fetch('http://localhost:5174/api/generate-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: FIXED_SCRIPT,
          voice: voice.id,
          speed: 1.0,
          model: 'tts-1'
        })
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS failed with status: ${ttsResponse.status}`);
      }

      const ttsResult = await ttsResponse.json();
      if (!ttsResult.audioBase64) {
        throw new Error('No audio data received from TTS');
      }

      // Step 2: Generate video with this voice
      console.log('  🎬 Generating video with Remotion...');
      const videoResponse = await fetch('http://localhost:5174/api/generate-remotion-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imageUrls,
          audioUrl: ttsResult.audioBase64,
          propertyInfo: propertyInfo,
          platform: 'youtube',
          imageDuration: 5,
          transitionType: 'fade'
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`Video generation failed with status: ${videoResponse.status}`);
      }

      const videoResult = await videoResponse.json();
      
      if (videoResult.success && videoResult.videoUrl) {
        // Step 3: Download and save the video
        console.log('  💾 Downloading and saving video...');
        const finalVideoResponse = await fetch(videoResult.videoUrl);
        const buffer = await finalVideoResponse.buffer();
        
        // Save video file
        const outputPath = path.join(demoVideosDir, `beverly-hills-${voice.id}.mp4`);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`  ✅ ${voice.name} video saved: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        results.push({
          voice: voice.id,
          name: voice.name,
          path: outputPath,
          size: buffer.length,
          success: true,
          videoId: videoResult.videoId
        });
      } else {
        throw new Error(videoResult.error || 'Unknown video generation error');
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ❌ Error generating ${voice.name} video:`, error.message);
      results.push({
        voice: voice.id,
        name: voice.name,
        error: error.message,
        success: false
      });
    }
  }
  
  // Save metadata about all videos
  const metadata = {
    generatedAt: new Date().toISOString(),
    script: FIXED_SCRIPT,
    note: "Script never changes - only voice varies across videos",
    propertyInfo: propertyInfo,
    imageUrls: imageUrls,
    voices: results,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    totalSizeMB: results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.size / 1024 / 1024), 0)
      .toFixed(2)
  };
  
  fs.writeFileSync(
    path.join(demoVideosDir, 'demo-videos-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successfully generated: ${metadata.successCount} videos`);
  console.log(`❌ Failed: ${metadata.failureCount} videos`);
  console.log(`💾 Total size: ${metadata.totalSizeMB} MB`);
  
  if (metadata.failureCount > 0) {
    console.log('\n❌ Failed videos:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  if (metadata.successCount > 0) {
    console.log('\n✅ Available demo videos:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - beverly-hills-${r.voice}.mp4 (${(r.size / 1024 / 1024).toFixed(2)} MB)`);
    });
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5174/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running! Please start the dev server with: npm run dev');
    console.log('   Then run this script again.');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  console.log('⏱️  This will take several minutes to generate all 6 videos...');
  
  await generateAllDemoVideos();
  
  console.log('\n🎉 Done! Demo videos are ready to use.');
  console.log('   Files saved to: public/demo-videos/');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});