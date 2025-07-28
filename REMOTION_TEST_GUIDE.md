# Remotion Video Generation Test Guide

## Quick Start

To test the new Remotion video generation system, follow these steps:

### 1. Start the development server

```bash
npm run dev
```

Open a new terminal tab (keep the server running)

### 2. Run all video generation tests

```bash
npm run test:video-generation
```

### 3. Run specific test scenarios

```bash
# Test basic slideshow without audio
npm run test:video:basic

# Test slideshow with audio
npm run test:video:audio

# Test TikTok format (vertical)
npm run test:video:tiktok
```

## What the Tests Do

The automated tests will:

1. Generate test images automatically
2. Create videos using Remotion (server-side rendering)
3. Test different scenarios:
   - Basic slideshow (no audio)
   - Slideshow with audio narration
   - Different transitions (fade, slide, zoom)
   - Platform-specific formats (YouTube, TikTok, Instagram)
4. Report success/failure and generation time
5. Save results to `scripts/test-results.json`

## Expected Output

Successful test output looks like:

```
📋 Testing: Basic slideshow without audio
Platform: youtube
Images: 3
Audio: No

⏳ Sending request to API...
✅ Success!
Video URL: /videos/abc123.mp4
Duration: 8.5s
```

## Troubleshooting

If tests fail:

1. **Server not running**: Make sure `npm run dev` is running
2. **FFmpeg not installed**: Remotion requires FFmpeg on your system

   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   ```

3. **Port 3000 in use**: Check if another process is using port 3000

## Manual Testing in Browser

You can also test through the UI:

1. Go to http://localhost:3000
2. Navigate to the Video Creation section
3. Upload property images
4. Generate video
5. The system will now use Remotion instead of FFmpeg.wasm

## Benefits Over FFmpeg.wasm

- **10-20x faster** video generation
- **No browser memory limits**
- **Better audio/video sync**
- **Server-side rendering**
- **Professional transitions and effects**
- **Platform-specific outputs**

## Generated Videos Location

All generated videos are saved to:

```
public/videos/[video-id].mp4
```

You can access them at:

```
http://localhost:3000/videos/[video-id].mp4
```
