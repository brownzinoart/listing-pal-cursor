# OpenAI Text-to-Speech Setup Guide

## Overview

ListingPal now uses **OpenAI's Text-to-Speech (TTS)** for generating professional voice narration for property videos. This is **91% cheaper** than ElevenLabs while maintaining high quality.

## Cost Comparison

| Service | Cost per 1M chars | Property Video (~2k chars) | Monthly Cost (100 videos) |
|---------|------------------|---------------------------|--------------------------|
| OpenAI TTS | $15.00 | $0.03 | $3.00 |
| ElevenLabs | $165.00 | $0.33 | $33.00 |
| **Savings** | **91% less** | **$0.30 saved** | **$30 saved** |

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 2. Add to Environment

Edit your `.env` file:

```env
# OpenAI - Used for content AND voice generation
OPENAI_API_KEY=sk-your-actual-key-here
VITE_OPENAI_API_KEY=sk-your-actual-key-here

# Enable OpenAI TTS (set to false to disable)
VITE_USE_OPENAI_TTS=true
```

### 3. Test Voice Generation

Run the test command:

```bash
npm run test:voice
```

This will:
- Verify your API key is working
- Generate a sample property narration
- Show cost estimates
- Test different voice options

## Available Voices

OpenAI TTS offers 6 high-quality voices:

- **nova** (default) - Professional and friendly, perfect for property tours
- **alloy** - Neutral and balanced
- **echo** - Warm and conversational
- **fable** - Expressive and dynamic
- **onyx** - Deep and authoritative
- **shimmer** - Soft and pleasant

## Usage in Video Generation

When you generate property videos:

1. The system automatically uses OpenAI TTS if configured
2. Falls back to video without audio if API fails
3. Shows cost estimate before generation
4. Professional narration added to all property videos

## Features

- ✅ **91% cheaper** than ElevenLabs
- ✅ Professional quality voices
- ✅ Multiple language support
- ✅ Adjustable speaking speed (0.25x - 4.0x)
- ✅ No credit system - pay as you go
- ✅ Fast generation (~200ms latency)

## Troubleshooting

### API Key Not Working
- Ensure the key starts with `sk-`
- Check you have billing enabled on OpenAI
- Verify the key has not expired

### No Audio in Videos
- Check `VITE_USE_OPENAI_TTS=true` in `.env`
- Run `npm run test:voice` to verify setup
- Check console for error messages

### Rate Limits
- OpenAI has generous rate limits
- If hit, wait a few seconds and retry
- Consider upgrading your OpenAI tier if needed

## Cost Management

- Each property video (~2,000 chars) costs about $0.03
- Monitor usage in [OpenAI Dashboard](https://platform.openai.com/usage)
- Set billing alerts to track spending

## Support

For issues or questions:
- Check error messages in console
- Run `npm run test:voice` for diagnostics
- Verify API key is correctly set in `.env`