# 🗺️ Google Maps API Setup for Address Autocomplete

## Overview

This project uses Google Maps Places API for address autocomplete functionality in the listing form, providing a smooth user experience when entering property addresses.

## Getting Your Google Maps API Key

### 1. Create/Access Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (required for Places API)

### 2. Enable Required APIs
Navigate to the [APIs & Services Library](https://console.cloud.google.com/apis/library) and enable:
- **Places API** - For address autocomplete
- **Maps JavaScript API** - For map integration (optional)
- **Geocoding API** - For converting addresses to coordinates

Direct links:
- [Enable Places API](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
- [Enable Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
- [Enable Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)

### 3. Create API Credentials
1. Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy your API key
4. **Important**: Click "Restrict Key" for security

### 4. Configure API Key Restrictions (Security Best Practice)
For production, restrict your API key:

**Application Restrictions:**
- **Development**: Choose "None" (temporarily)
- **Production**: Choose "HTTP referrers" and add your domains:
  - `https://yourdomain.com/*`
  - `http://localhost:5173/*` (for development)

**API Restrictions:**
- Restrict to only the APIs you need:
  - Places API
  - Maps JavaScript API
  - Geocoding API

## Environment Setup

### 1. Copy Environment Template
```bash
cp env.template .env
```

### 2. Add Your API Key
Edit `.env` and add your Google Maps API key:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_api_key_here
```

### 3. Security Note ⚠️
- The API key is prefixed with `VITE_` so it's available in the browser
- **Never commit your `.env` file to GitHub**
- Use API key restrictions to limit usage
- Monitor usage in Google Cloud Console

## Usage in Code

The API key is automatically loaded by the `AddressAutocomplete` component:

```typescript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

## Cost Estimation

### Pricing (as of 2024)
- **Places Autocomplete**: $2.83 per 1,000 requests
- **Geocoding**: $5.00 per 1,000 requests
- **Free tier**: $200 credit per month (covers ~70,000 autocomplete requests)

### Usage Optimization
- Autocomplete requests are debounced to reduce API calls
- Only makes geocoding calls when an address is selected
- Consider implementing session tokens for production

## Troubleshooting

### Common Issues

**"Places API is not enabled"**
- Enable Places API in Google Cloud Console
- Wait 5-10 minutes for propagation

**"API key not authorized"**
- Check API key restrictions
- Ensure your domain is allowlisted
- Verify the API key is correctly set in `.env`

**"Exceeded quota"**
- Check usage in Google Cloud Console
- Enable billing if using free tier limits
- Consider implementing request caching

**Development vs Production**
- Development: Use unrestricted key temporarily
- Production: Always use restricted keys
- Monitor usage and set up alerts

### Testing Your Setup
1. Restart your development server after adding the API key
2. Check browser console for any error messages
3. Verify API calls in Network tab
4. Test address autocomplete functionality

## File Structure

```
components/
  shared/
    AddressAutocomplete.tsx     # Reusable autocomplete component
components/
  listings/
    ListingFormPage.tsx         # Uses AddressAutocomplete
```

## Features Implemented

- ✅ Real-time address suggestions while typing
- ✅ Geographic coordinate extraction (lat/lng)
- ✅ Formatted address standardization
- ✅ Debounced API requests for performance
- ✅ Error handling and fallbacks
- ✅ Reusable component architecture

## Next Steps for Production

1. **Implement Session Tokens**: Reduce costs by using session tokens
2. **Add Rate Limiting**: Prevent abuse in production
3. **Cache Results**: Store recent searches locally
4. **Add Analytics**: Track usage patterns
5. **Setup Monitoring**: Alert on quota exceeded

---

**Important**: Keep your API key secure and never commit it to version control! 