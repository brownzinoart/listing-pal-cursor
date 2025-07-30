# Demo Videos Setup Guide

This guide explains how to set up pre-generated demo videos for all voice options.

## Overview

Instead of mixing videos on-demand, we pre-generate complete videos for each voice:

- `beverly-hills-nova.mp4` - Nova voice
- `beverly-hills-alloy.mp4` - Alloy voice
- `beverly-hills-echo.mp4` - Echo voice
- `beverly-hills-fable.mp4` - Fable voice
- `beverly-hills-onyx.mp4` - Onyx voice
- `beverly-hills-shimmer.mp4` - Shimmer voice

## Generation Steps

### 1. Start the Development Server

```bash
npm run dev
```

The server needs to be running for the generation scripts to work.

### 2. Generate All Demo Videos

```bash
node scripts/generate-all-demo-videos.js
```

This script will:

- Generate TTS audio for each voice
- Create complete videos with Remotion
- Save them to `public/demo-videos/`
- Take 5-10 minutes total

### 3. Verify Videos Were Created

Open in browser: `http://localhost:5174/test-demo-videos.html`

This page will:

- Check if all 6 demo videos exist
- Show video previews for each voice
- Display summary of what's available

## How It Works in the Demo

1. User clicks "Start with Beverly Hills Demo"
2. Goes to upload step where they can select voice
3. User picks a voice (Nova, Echo, etc.)
4. Clicks "Generate AI Video"
5. System instantly loads the pre-made video for that voice
6. Shows video with selected voiceover

## File Structure

```
public/
  demo-videos/
    beverly-hills-nova.mp4     (Complete video with Nova voice)
    beverly-hills-alloy.mp4    (Complete video with Alloy voice)
    beverly-hills-echo.mp4     (Complete video with Echo voice)
    beverly-hills-fable.mp4    (Complete video with Fable voice)
    beverly-hills-onyx.mp4     (Complete video with Onyx voice)
    beverly-hills-shimmer.mp4  (Complete video with Shimmer voice)
    demo-videos-metadata.json  (Generation info)
```

## Troubleshooting

### Videos Not Generating

- Make sure dev server is running (`npm run dev`)
- Check that OpenAI API key is configured
- Verify Remotion service is working

### Videos Not Loading in Demo

- Check browser console for 404 errors
- Verify files exist in `public/demo-videos/`
- Test individual video URLs: `/demo-videos/beverly-hills-nova.mp4`

### Regenerating Specific Voice

To regenerate just one voice, you can modify the script or delete the specific file and run the script again.

## Demo Flow

1. **Property Selection** → Select Beverly Hills mansion
2. **Upload Step** → Choose voice (Nova, Echo, etc.)
3. **Analysis Step** → Auto-completes with demo data
4. **Script Step** → Auto-completes with demo script
5. **Generation Step** → Loads pre-made video for selected voice
6. **Complete** → Video ready with chosen voiceover

This gives you the flexibility to demo all 6 voice options while maintaining instant loading times.
