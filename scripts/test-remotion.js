import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const API_URL = "http://localhost:3001/api/generate-remotion-video";

// Test scenarios
const scenarios = [
  {
    name: "Basic slideshow without audio",
    payload: {
      images: [
        "https://picsum.photos/1920/1080?random=1",
        "https://picsum.photos/1920/1080?random=2",
        "https://picsum.photos/1920/1080?random=3",
      ],
      propertyInfo: {
        address: "123 Test Street, Beverly Hills, CA",
        price: "$2,500,000",
        beds: 4,
        baths: 3,
        sqft: 3500,
      },
      transitionType: "fade",
      imageDuration: 4,
      platform: "youtube",
    },
  },
  {
    name: "Slideshow with audio",
    payload: {
      images: [
        "https://picsum.photos/1920/1080?random=4",
        "https://picsum.photos/1920/1080?random=5",
        "https://picsum.photos/1920/1080?random=6",
      ],
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      propertyInfo: {
        address: "456 Luxury Lane, Malibu, CA",
        price: "$5,750,000",
        beds: 6,
        baths: 5,
        sqft: 6200,
      },
      transitionType: "zoom",
      imageDuration: 5,
      platform: "youtube",
    },
  },
  {
    name: "TikTok format video",
    payload: {
      images: [
        "https://picsum.photos/1080/1920?random=7",
        "https://picsum.photos/1080/1920?random=8",
      ],
      propertyInfo: {
        address: "789 Ocean View, Santa Monica, CA",
        price: "$3,200,000",
        beds: 3,
        baths: 2,
        sqft: 2800,
      },
      transitionType: "slide",
      imageDuration: 3,
      platform: "tiktok",
    },
  },
];

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Test runner
async function runTest(scenario) {
  console.log(
    `\n${colors.blue}${colors.bright}📋 Testing: ${scenario.name}${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Platform: ${scenario.payload.platform || "youtube"}${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Images: ${scenario.payload.images.length}${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Audio: ${scenario.payload.audioUrl ? "Yes" : "No"}${colors.reset}`,
  );

  const startTime = Date.now();

  try {
    console.log(
      `\n${colors.yellow}⏳ Sending request to API...${colors.reset}`,
    );

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scenario.payload),
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (response.ok && data.success) {
      console.log(`${colors.green}${colors.bright}✅ Success!${colors.reset}`);
      console.log(`${colors.green}Video URL: ${data.videoUrl}${colors.reset}`);
      console.log(`${colors.green}Duration: ${duration}s${colors.reset}`);
      return { success: true, duration, videoUrl: data.videoUrl };
    } else {
      console.log(`${colors.red}${colors.bright}❌ Failed!${colors.reset}`);
      console.log(
        `${colors.red}Error: ${data.error || "Unknown error"}${colors.reset}`,
      );
      if (data.details) {
        console.log(`${colors.red}Details: ${data.details}${colors.reset}`);
      }
      return { success: false, duration, error: data.error };
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `${colors.red}${colors.bright}❌ Request failed!${colors.reset}`,
    );
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return { success: false, duration, error: error.message };
  }
}

// Main test function
async function runAllTests() {
  console.log(
    `${colors.bright}${colors.cyan}🚀 Remotion Video Generation Test Suite${colors.reset}`,
  );
  console.log(`${colors.cyan}API URL: ${API_URL}${colors.reset}`);
  console.log(
    `${colors.cyan}Total scenarios: ${scenarios.length}${colors.reset}`,
  );

  const results = [];

  // Check if server is running
  try {
    await fetch("http://localhost:3001");
  } catch (error) {
    console.log(
      `\n${colors.red}${colors.bright}❌ Error: Server is not running!${colors.reset}`,
    );
    console.log(
      `${colors.yellow}Please start the Express server with: npm run server${colors.reset}`,
    );
    process.exit(1);
  }

  // Run all scenarios
  for (const scenario of scenarios) {
    const result = await runTest(scenario);
    results.push({ name: scenario.name, ...result });
  }

  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}📊 Test Summary${colors.reset}`);
  console.log("=====================================");

  let passed = 0;
  let failed = 0;
  let totalTime = 0;

  results.forEach((result) => {
    const status = result.success
      ? `${colors.green}✅ PASS${colors.reset}`
      : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`${status} ${result.name} (${result.duration}s)`);

    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    totalTime += parseFloat(result.duration);
  });

  console.log("=====================================");
  console.log(
    `Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`,
  );
  console.log(`Total time: ${totalTime.toFixed(2)}s`);

  if (failed === 0) {
    console.log(
      `\n${colors.green}${colors.bright}🎉 All tests passed!${colors.reset}`,
    );
  } else {
    console.log(
      `\n${colors.yellow}${colors.bright}⚠️ Some tests failed. Check the errors above.${colors.reset}`,
    );
  }

  // Save results to file
  const resultsPath = path.join(__dirname, "test-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(
    `\n${colors.cyan}Results saved to: ${resultsPath}${colors.reset}`,
  );
}

// Run specific test if --scenario flag is provided
const args = process.argv.slice(2);
if (args.includes("--scenario")) {
  const scenarioIndex = args.indexOf("--scenario");
  const scenarioName = args[scenarioIndex + 1];

  const scenario = scenarios.find((s) =>
    s.name.toLowerCase().includes(scenarioName.toLowerCase()),
  );

  if (scenario) {
    runTest(scenario).then(() => {
      console.log(`\n${colors.cyan}Test completed.${colors.reset}`);
    });
  } else {
    console.log(
      `${colors.red}Scenario not found: ${scenarioName}${colors.reset}`,
    );
    console.log("Available scenarios:");
    scenarios.forEach((s) => console.log(`  - ${s.name}`));
  }
} else {
  // Run all tests
  runAllTests();
}

export { runAllTests, runTest };
