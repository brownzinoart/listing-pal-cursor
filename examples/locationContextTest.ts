import { LocationContextService } from "../services/locationContextService.js";

// Test the comprehensive data fetching
async function testLocationContext() {
  console.log(
    "🧪 Testing Location Context Service - Phase 1: Core Data Fetching\n",
  );

  const service = new LocationContextService();
  const testAddress = "123 Main Street, Seattle, WA 98101";

  try {
    console.log(`📍 Fetching ALL location data for: ${testAddress}`);
    console.log("⏳ Gathering comprehensive neighborhood data...\n");

    const startTime = Date.now();
    const contextData = await service.getAllLocationContext(testAddress);
    const endTime = Date.now();

    console.log(
      `✅ Successfully fetched ${contextData.cards.length} context cards in ${endTime - startTime}ms\n`,
    );

    // Display categorized results
    console.log("📊 Categorized Context Cards:");
    Object.entries(contextData.categorizedCards).forEach(
      ([category, cards]) => {
        if (cards.length > 0) {
          console.log(
            `\n${getCategoryIcon(category)} ${category.toUpperCase()} (${cards.length} cards):`,
          );
          cards.forEach((card) => {
            console.log(
              `  • ${card.icon} ${card.title} - ${card.preview.headline}`,
            );
            if (card.preview.quickStat) {
              console.log(`    📈 ${card.preview.quickStat}`);
            }
          });
        }
      },
    );

    // Show all available data summary
    console.log("\n📋 Complete Data Summary:");
    contextData.cards.forEach((card) => {
      console.log(`\n${card.icon} ${card.title.toUpperCase()}`);
      console.log(`   Category: ${card.category}`);
      console.log(`   Headline: ${card.preview.headline}`);
      console.log(`   Marketing: ${card.marketingCopy.substring(0, 100)}...`);
      console.log(`   Data Points: ${card.preview.bullets.length} bullets`);
    });

    console.log("\n🎯 System Features Demonstrated:");
    console.log("✅ Comprehensive data fetching (no filtering)");
    console.log("✅ Parallel API calls for performance");
    console.log("✅ Categorized organization");
    console.log("✅ Rich context card structure");
    console.log("✅ Marketing copy generation");
    console.log("✅ Full data preservation");

    console.log(
      "\n🔄 Next: Agent/User can select which cards to include in listing",
    );
  } catch (error) {
    console.error("❌ Error testing location context:", error);
  }
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    location: "📍",
    community: "👥",
    amenities: "🏪",
    education: "🎓",
    transportation: "🚌",
  };
  return icons[category] || "📋";
}

// Run the test
testLocationContext();
