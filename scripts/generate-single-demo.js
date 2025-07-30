import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Beverly Hills mansion images
const imageUrls = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&h=1080&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1920&h=1080&q=80'
];

// Script
const SCRIPT = `Welcome to this stunning Beverly Hills mansion featuring modern luxury amenities and breathtaking views. 
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

// Generate one demo video with audio
async function generateSingleDemo(voiceId = 'nova') {
  console.log(`🎬 Generating ${voiceId} demo video with audio...`);
  
  try {
    // Step 1: Generate TTS audio
    console.log('  🎙️ Generating voiceover...');
    const ttsResponse = await fetch('http://localhost:5174/api/generate-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: SCRIPT,
        voice: voiceId,
        speed: 1.0,
        model: 'tts-1'
      })
    });

    if (!ttsResponse.ok) {
      throw new Error(`TTS failed: ${ttsResponse.status}`);
    }

    const ttsResult = await ttsResponse.json();
    if (!ttsResult.audioBase64) {
      throw new Error('No audio generated');
    }

    console.log('  ✅ Audio generated');

    // Step 2: Generate video with audio
    console.log('  🎬 Creating video with Remotion...');
    const videoResponse = await fetch('http://localhost:5174/api/generate-remotion-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      throw new Error(`Video failed: ${videoResponse.status}`);
    }

    const videoResult = await videoResponse.json();
    
    if (videoResult.success && videoResult.videoUrl) {
      // Step 3: Download and save
      console.log('  💾 Saving video...');
      const finalResponse = await fetch(videoResult.videoUrl);
      const buffer = await finalResponse.buffer();
      
      const outputPath = path.join(__dirname, '..', 'public', 'demo-videos', `beverly-hills-${voiceId}.mp4`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ ${voiceId} demo saved: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📹 File: /demo-videos/beverly-hills-${voiceId}.mp4`);
      
      return true;
      
    } else {
      throw new Error(videoResult.error || 'Video generation failed');
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate ${voiceId} demo:`, error.message);
    return false;
  }
}

// Generate Nova demo first (most common)
async function main() {
  console.log('🎯 Generating demo video with audio...');
  
  const success = await generateSingleDemo('nova');
  
  if (success) {
    console.log('\n🎉 Demo video ready!');
    console.log('   Test it in the video studio by selecting Nova voice');
    console.log('\n💡 To generate all voices, run: node scripts/generate-all-demo-videos.js');
  } else {
    console.log('\n❌ Failed to generate demo video');
    console.log('   Make sure the server is running: npm run dev');
  }
}

main();