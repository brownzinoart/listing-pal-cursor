import { remotionVideoService } from "../services/remotionVideoService";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";

interface TestScenario {
  name: string;
  description: string;
  imageCount: number;
  hasAudio: boolean;
  platform?: "youtube" | "tiktok" | "instagram";
  transitionType?: "fade" | "slide" | "zoom";
}

class VideoGenerationTester {
  private testResults: Array<{
    scenario: string;
    success: boolean;
    videoUrl?: string;
    error?: string;
    duration: number;
  }> = [];

  /**
   * Generate test images
   */
  private async generateTestImages(count: number): Promise<string[]> {
    console.log(`\ud83c\udfa8 Generating ${count} test images...`);

    const images: string[] = [];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD"];

    for (let i = 0; i < count; i++) {
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext("2d");

      // Background color
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, 0, 1920, 1080);

      // Add some visual elements
      ctx.fillStyle = "white";
      ctx.font = "bold 120px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Test Image ${i + 1}`, 960, 400);

      // Add room name
      ctx.font = "60px Arial";
      const rooms = [
        "Living Room",
        "Kitchen",
        "Master Bedroom",
        "Bathroom",
        "Backyard",
      ];
      ctx.fillText(rooms[i % rooms.length], 960, 600);

      // Save image
      const imagePath = path.join(
        process.cwd(),
        "public",
        "test-images",
        `test-${i + 1}.jpg`,
      );
      const buffer = canvas.toBuffer("image/jpeg");

      // Ensure directory exists
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(imagePath, buffer);
      images.push(`/test-images/test-${i + 1}.jpg`);
    }

    console.log("\u2705 Test images generated");
    return images;
  }

  /**
   * Generate test audio
   */
  private async generateTestAudio(): Promise<string> {
    // For now, return a sample audio URL
    // In production, this would generate actual test audio
    return "/test-audio/sample-narration.mp3";
  }

  /**
   * Run a single test scenario
   */
  private async runScenario(scenario: TestScenario): Promise<void> {
    console.log(`\n\ud83d\udcdd Testing: ${scenario.name}`);
    console.log(`   ${scenario.description}`);

    const startTime = Date.now();

    try {
      // Generate test assets
      const images = await this.generateTestImages(scenario.imageCount);
      const audioUrl = scenario.hasAudio
        ? await this.generateTestAudio()
        : undefined;

      // Run video generation
      const videoUrl = await remotionVideoService.generateVideo(
        {
          images,
          audioUrl,
          propertyInfo: {
            address: "123 Test Street, Test City, TC 12345",
            price: "$1,234,567",
            beds: 4,
            baths: 3,
            sqft: 3500,
          },
          transitionType: scenario.transitionType || "fade",
          imageDuration: 4,
          platform: scenario.platform || "youtube",
        },
        (progress) => {
          process.stdout.write(`\r   Progress: ${Math.round(progress * 100)}%`);
        },
      );

      const duration = Date.now() - startTime;
      console.log(
        `\n   \u2705 Success! Video generated in ${(duration / 1000).toFixed(2)}s`,
      );
      console.log(`   \ud83d\udcf9 Video URL: ${videoUrl}`);

      this.testResults.push({
        scenario: scenario.name,
        success: true,
        videoUrl,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.log(`\n   \u274c Failed: ${errorMessage}`);

      this.testResults.push({
        scenario: scenario.name,
        success: false,
        error: errorMessage,
        duration,
      });
    }
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<void> {
    console.log("\ud83d\ude80 Starting Video Generation Tests\n");

    const scenarios: TestScenario[] = [
      {
        name: "Basic Slideshow",
        description: "Simple slideshow with 3 images, no audio",
        imageCount: 3,
        hasAudio: false,
      },
      {
        name: "Slideshow with Audio",
        description: "Slideshow with 5 images and narration",
        imageCount: 5,
        hasAudio: true,
      },
      {
        name: "TikTok Format",
        description: "Vertical video for TikTok (9:16)",
        imageCount: 4,
        hasAudio: true,
        platform: "tiktok",
      },
      {
        name: "Instagram Reels",
        description: "Vertical video for Instagram (9:16)",
        imageCount: 4,
        hasAudio: true,
        platform: "instagram",
      },
      {
        name: "Slide Transition",
        description: "Slideshow with slide transitions",
        imageCount: 3,
        hasAudio: false,
        transitionType: "slide",
      },
      {
        name: "Zoom Transition",
        description: "Slideshow with zoom transitions",
        imageCount: 3,
        hasAudio: false,
        transitionType: "zoom",
      },
      {
        name: "Large Gallery",
        description: "Slideshow with 10 images",
        imageCount: 10,
        hasAudio: true,
      },
    ];

    // Run each scenario
    for (const scenario of scenarios) {
      await this.runScenario(scenario);
    }

    // Print summary
    this.printSummary();
  }

  /**
   * Run specific test scenario
   */
  async runSpecificTest(scenarioName: string): Promise<void> {
    const scenarioMap: Record<string, TestScenario> = {
      basic: {
        name: "Basic Slideshow",
        description: "Simple slideshow with 3 images, no audio",
        imageCount: 3,
        hasAudio: false,
      },
      "with-audio": {
        name: "Slideshow with Audio",
        description: "Slideshow with 5 images and narration",
        imageCount: 5,
        hasAudio: true,
      },
      tiktok: {
        name: "TikTok Format",
        description: "Vertical video for TikTok",
        imageCount: 4,
        hasAudio: true,
        platform: "tiktok",
      },
    };

    const scenario = scenarioMap[scenarioName];
    if (!scenario) {
      console.error(`\u274c Unknown scenario: ${scenarioName}`);
      console.log("Available scenarios:", Object.keys(scenarioMap).join(", "));
      return;
    }

    await this.runScenario(scenario);
    this.printSummary();
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log("\n\ud83d\udcca Test Summary\n");
    console.log("=====================================");

    let passed = 0;
    let failed = 0;

    for (const result of this.testResults) {
      const status = result.success ? "\u2705" : "\u274c";
      const time = `(${(result.duration / 1000).toFixed(2)}s)`;

      console.log(`${status} ${result.scenario} ${time}`);

      if (result.success) {
        passed++;
        if (result.videoUrl) {
          console.log(`   Video: ${result.videoUrl}`);
        }
      } else {
        failed++;
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }

    console.log("=====================================");
    console.log(
      `Total: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`,
    );

    if (failed === 0) {
      console.log("\n\ud83c\udf89 All tests passed!");
    } else {
      console.log("\n\u26a0\ufe0f Some tests failed. Check the errors above.");
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new VideoGenerationTester();
  const args = process.argv.slice(2);

  if (args.includes("--scenario")) {
    const scenarioIndex = args.indexOf("--scenario");
    const scenarioName = args[scenarioIndex + 1];
    tester.runSpecificTest(scenarioName);
  } else {
    tester.runAllTests();
  }
}

export { VideoGenerationTester };
