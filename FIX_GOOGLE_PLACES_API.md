# 🔧 Fix Google Places API Authorization

## ❌ Current Issue

Your API key `AIzaSyBi_FyOBkcB-f1WRAB_pDVZn04XBP9bYmM` is showing:

```
"This API key is not authorized to use this service or API."
```

## ✅ Solution: Enable Places API

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project

### Step 2: Enable Places API

1. Go to [APIs & Services → Library](https://console.cloud.google.com/apis/library)
2. Search for "Places API"
3. Click on **"Places API"** (not Places API (New))
4. Click **"ENABLE"**

### Step 3: Enable Additional APIs (Recommended)

Also enable these for full functionality:

- **Maps JavaScript API** - [Enable here](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
- **Geocoding API** - [Enable here](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)

### Step 4: Verify API Key Permissions

1. Go to [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key `AIzaSyBi_FyOBkcB-f1WRAB_pDVZn04XBP9bYmM`
3. Under **"API restrictions"**, make sure these are selected:
   - ✅ Places API
   - ✅ Maps JavaScript API
   - ✅ Geocoding API

### Step 5: Set Referrer Restrictions (Security)

In the same API key settings:

1. Under **"Application restrictions"**, select **"HTTP referrers"**
2. Add these referrers:
   - `http://localhost:5173/*`
   - `http://localhost:5174/*`
   - `https://yourdomain.com/*` (for production)

## 🧪 Test Your Setup

After enabling the APIs, test with this command:

```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=1600+Amphitheatre&key=AIzaSyBi_FyOBkcB-f1WRAB_pDVZn04XBP9bYmM"
```

You should see predictions instead of "REQUEST_DENIED".

## 🔄 Switch Back to Google Autocomplete

Once the API is working, update `ListingFormPage.tsx`:

Replace:

```tsx
<SimpleAddressInput
  value={formData.address}
  placeholder="Enter the full property address..."
  onAddressChange={handleSimpleAddressChange}
  className="..."
/>
```

With:

```tsx
<AddressAutocomplete
  value={formData.address}
  placeholder="Start typing the property address..."
  onAddressSelect={handleAddressSelect}
  className="..."
/>
```

## ⏱️ Propagation Time

- API enablement usually takes **2-5 minutes**
- API key restriction changes take **5-10 minutes**
- If still not working after 10 minutes, try creating a new API key

## 💰 Billing Note

- Places API requires **billing to be enabled**
- Free tier: $200/month credit (covers ~70,000 requests)
- Cost: ~$2.83 per 1,000 autocomplete requests

## 🚀 Current Workaround

I've temporarily switched your form to use a simple text input so you can continue testing other features. The address parsing still works - users just need to type the full address manually.

Once you enable the Places API, you'll get the beautiful autocomplete functionality! 🎯
