#!/usr/bin/env node

import axios from "axios";

const BASE_URL = "http://localhost:3001";

const testData = {
  propertyData: {
    address: "123 Main St, Apex, NC 27523",
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1500,
    yearBuilt: 2020,
    propertyType: "Residential",
    keyFeatures:
      "Modern kitchen, hardwood floors, updated bathrooms, private backyard",
  },
};

async function testEndpoint(name, endpoint, data) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log(`✅ ${name} - SUCCESS`);
    console.log(`   Provider: ${response.data.provider || "N/A"}`);
    console.log(
      `   Content length: ${response.data.description?.length || response.data.content?.length || "N/A"} chars`,
    );

    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Testing Demo Endpoints...\n");

  const tests = [
    {
      name: "Property Description Generation",
      endpoint: "/api/listings/generate-description",
      data: { ...testData, style: "professional" },
    },
    {
      name: "Facebook Post Generation",
      endpoint: "/api/listings/generate-social",
      data: { ...testData, platform: "facebook", style: "professional" },
    },
    {
      name: "Instagram Post Generation",
      endpoint: "/api/listings/generate-social",
      data: { ...testData, platform: "instagram", style: "professional" },
    },
    {
      name: "Email Generation",
      endpoint: "/api/listings/generate-email",
      data: { ...testData, style: "professional" },
    },
    {
      name: "Flyer Generation",
      endpoint: "/api/listings/generate-flyer",
      data: { ...testData, style: "professional" },
    },
    {
      name: "Paid Ads Generation",
      endpoint: "/api/test-ollama-ads",
      data: {
        listing: testData.propertyData,
        platform: "linkedin",
        objective: "WEBSITE_TRAFFIC",
      },
    },
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.name, test.endpoint, test.data);
    if (success) passed++;
  }

  console.log(`\n📊 Test Results: ${passed}/${total} endpoints working`);

  if (passed === total) {
    console.log("🎉 All endpoints are working! Demo is ready.");
  } else {
    console.log("⚠️ Some endpoints failed. Check the logs above.");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Server is running and healthy");
    console.log(`   Gemini: ${response.data.hasGemini ? "✅" : "❌"}`);
    console.log(
      `   Ollama: ${response.data.ollamaStatus === "available" ? "✅" : "❌"}`,
    );
    return true;
  } catch (error) {
    console.log(
      "❌ Server is not running. Please start with: npm run dev:full",
    );
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);
