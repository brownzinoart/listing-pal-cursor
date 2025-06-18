# 🎨 AI Interior Design Integration

Your RealtyBoost AI app now includes **real AI-powered interior design** using Replicate's advanced ControlNet models!

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Replicate API Key

1. Go to [replicate.com](https://replicate.com) and sign up
2. Navigate to your [API tokens page](https://replicate.com/account/api-tokens)
3. Create a new token (starts with `r8_`)

### Step 2: Configure Environment

```bash
# Copy the environment template
cp env.template .env

# Edit .env and add your token
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### Step 3: Run the App

```bash
# Option 1: Run frontend and backend together (recommended)
npm run dev:full

# Option 2: Run separately (two terminals)
npm run dev        # Frontend (Vite) - http://localhost:5173
npm run server:dev # Backend (Express) - http://localhost:3001
```

### Step 4: Test the Integration

1. Open your app: http://localhost:5173
2. Navigate to "Interior Reimagined" via workflow or direct link
3. Upload a room photo
4. Select style and room type
5. Click "Generate Design" - real AI magic happens! ✨

## 🎯 What's New

### ✅ Real AI Processing

- **Before**: Mock canvas filters
- **Now**: Professional ControlNet AI models via Replicate
- **Quality**: Production-ready interior design transformations

### ✅ Advanced Features

- 12+ design styles (Scandinavian, Industrial, Luxury, etc.)
- 7 room types (Bedroom, Living Room, Kitchen, etc.)
- Professional prompt engineering for best results
- Intelligent error handling and user feedback

### ✅ Robust Architecture

- Express backend handles AI API calls
- Automatic image format conversion
- Real-time progress polling
- Comprehensive error handling
- Health check endpoints

## 💰 Cost Breakdown

- **First 50 generations**: FREE (Replicate new user bonus)
- **After that**: ~$0.01 per generation
- **Monthly estimate**: $10 for ~1000 room redesigns
- **Scaling**: Pay only for what you use

## 🛠 API Endpoints

Your app now includes these new endpoints:

```bash
POST /api/redesign    # Main AI generation endpoint
GET  /api/health      # Check API status and token
GET  /api/styles      # Get available styles and room types
```

## 🔧 Advanced Configuration

### Custom Styles

Edit `server.js` to add new styles:

```javascript
prompt: `${style} ${room_type} interior design, [your custom prompt]`;
```

### Performance Tuning

Adjust AI parameters in `server.js`:

- `num_inference_steps`: 20-50 (quality vs speed)
- `guidance_scale`: 5-15 (creativity vs prompt adherence)
- `controlnet_conditioning_scale`: 0.5-1.0 (structure preservation)

### Error Monitoring

Check server logs for detailed processing information:

```bash
npm run server:dev  # Shows real-time API calls and responses
```

## 🌐 Deployment Ready

### Production Build

```bash
npm run build  # Build React app
npm start      # Run production server
```

### Environment Variables for Production

```bash
REPLICATE_API_TOKEN=your_token
PORT=3001  # Optional, defaults to 3001
NODE_ENV=production
```

### Deployment Options

- **Vercel**: Automatic deployment with serverless functions
- **Railway**: Full-stack deployment with database support
- **DigitalOcean**: VPS deployment with full control
- **Heroku**: Classic platform-as-a-service

## 🎨 Usage Tips

### Best Results

- Use well-lit, clear room photos
- Avoid cluttered or very dark images
- JPG/PNG formats work best
- Optimal size: 512x512 to 1024x1024 pixels

### Style Matching

- **Scandinavian**: Clean, minimal, light woods
- **Industrial**: Exposed brick, metal, dark tones
- **Luxury**: Rich materials, elegant furnishings
- **Bohemian**: Eclectic, colorful, layered textures

## 🔍 Troubleshooting

### Common Issues

**"API token not configured"**

- Check your `.env` file exists and has the correct token
- Restart the server after adding the token

**"Insufficient credits"**

- Add billing information to your Replicate account
- Check your usage at replicate.com/account

**"Generation timed out"**

- Try a smaller image (under 2MB)
- Check your internet connection
- Some complex images take longer to process

**Frontend can't connect to backend**

- Make sure backend is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`

### Debug Commands

```bash
# Check API health
curl http://localhost:3001/api/health

# Test with sample image
curl -X POST -F "image=@sample.jpg" -F "style=modern" -F "room_type=bedroom" http://localhost:3001/api/redesign
```

## 🚀 Next Steps

1. **Test thoroughly** with different room types and styles
2. **Monitor costs** through your Replicate dashboard
3. **Optimize prompts** for your specific use cases
4. **Deploy to production** when ready
5. **Gather user feedback** on AI quality and results

---

**🎉 Congratulations!** Your real estate app now has professional-grade AI interior design capabilities. Your users can transform any room with just a photo upload!

## 🆘 Support

If you encounter any issues:

1. Check the server logs (`npm run server:dev`)
2. Verify your API token is valid
3. Test the health endpoint: `/api/health`
4. Review the troubleshooting section above

Your Interior Reimagined feature is now powered by real AI! 🚀✨
