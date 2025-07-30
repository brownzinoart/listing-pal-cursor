# Demo Videos Directory

This directory contains pre-made demo videos for instant loading in the video studio demo workflow.

## Beverly Hills Demo Video

The `beverly-hills-demo.mp4` file should be a professionally created video showcasing:
- Multiple high-quality property images with smooth transitions
- Professional voiceover narration
- Property details overlay
- Duration: 30 seconds
- Resolution: 1920x1080
- Format: MP4 with H.264 codec

To generate the demo video:
1. Run the backend server: `npm run dev`
2. Execute: `node scripts/generate-demo-video.js`

The script will create a video using the Remotion service and save it here.