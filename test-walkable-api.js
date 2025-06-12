// Test the walkable API key with WalkScore
import fetch from 'node-fetch';
import 'dotenv/config';

console.log("🚶‍♂️ Testing Walkable API (WalkScore)...");

const testAddress = "1600 Amphitheatre Parkway, Mountain View, CA";
const lat = 37.4419;
const lon = -122.1419;

const url = `https://api.walkscore.com/score?format=json&transit=1&bike=1&lat=${lat}&lon=${lon}&address=${encodeURIComponent(testAddress)}&wsapikey=${process.env.WS_API_KEY}`;

console.log("📍 Test Address:", testAddress);
console.log("🔑 API Key:", process.env.WS_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("🌐 Testing API call...");

try {
  const response = await fetch(url);
  const data = await response.json();
  
  if (response.ok) {
    console.log("✅ API Response Success!");
    console.log("📊 Walk Score:", data.walkscore || "N/A");
    console.log("🚌 Transit Score:", data.transit?.score || "N/A");
    console.log("🚴‍♂️ Bike Score:", data.bike?.score || "N/A");
    console.log("📝 Description:", data.description || "N/A");
    console.log("🎯 Status:", data.status);
  } else {
    console.log("❌ API Error:", response.status, response.statusText);
    console.log("📝 Response:", data);
  }
} catch (error) {
  console.log("❌ Network Error:", error.message);
}

console.log("\n�� Test complete!");