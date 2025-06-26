// Backend Data Testing Utility
// Run this in the browser console to inspect and test room redesign data

// Test utility functions
const testBackendData = {
  // 1. Get all listings from localStorage
  getAllListings() {
    const data = localStorage.getItem("realtyboost_listings");
    return data ? JSON.parse(data) : [];
  },

  // 2. Find a specific listing by ID or address
  findListing(idOrAddress) {
    const listings = this.getAllListings();
    return listings.find(
      (l) =>
        l.id === idOrAddress ||
        l.address.toLowerCase().includes(idOrAddress.toLowerCase()),
    );
  },

  // 3. Inspect room designs for a listing
  inspectRoomDesigns(listingId) {
    const listing = this.findListing(listingId);
    if (!listing) {
      console.log("❌ Listing not found");
      return null;
    }

    console.log("🏠 Listing Address:", listing.address);
    console.log("🔍 Room Designs Debug:", {
      generatedRoomDesigns: listing.generatedRoomDesigns,
      type: typeof listing.generatedRoomDesigns,
      isArray: Array.isArray(listing.generatedRoomDesigns),
      length: listing.generatedRoomDesigns?.length,
      rawValue: JSON.stringify(listing.generatedRoomDesigns, null, 2),
    });

    return listing.generatedRoomDesigns;
  },

  // 4. Add a test room design to a listing
  addTestRoomDesign(listingId, testImageUrl = "https://picsum.photos/400/300") {
    const listings = this.getAllListings();
    const listingIndex = listings.findIndex((l) => l.id === listingId);

    if (listingIndex === -1) {
      console.log("❌ Listing not found");
      return false;
    }

    const testRoomDesign = {
      originalImageUrl: "https://picsum.photos/400/300",
      styleId: "modern",
      redesignedImageUrl: testImageUrl,
      prompt: "Living room in modern style - TEST",
      createdAt: new Date().toISOString(),
    };

    // Initialize or append to existing room designs
    const existingDesigns = listings[listingIndex].generatedRoomDesigns || [];
    listings[listingIndex].generatedRoomDesigns = [
      ...existingDesigns,
      testRoomDesign,
    ];

    // Save back to localStorage
    localStorage.setItem("realtyboost_listings", JSON.stringify(listings));

    console.log("✅ Test room design added:", testRoomDesign);
    console.log(
      "📊 Total room designs now:",
      listings[listingIndex].generatedRoomDesigns.length,
    );

    return true;
  },

  // 5. Clear all room designs for a listing
  clearRoomDesigns(listingId) {
    const listings = this.getAllListings();
    const listingIndex = listings.findIndex((l) => l.id === listingId);

    if (listingIndex === -1) {
      console.log("❌ Listing not found");
      return false;
    }

    listings[listingIndex].generatedRoomDesigns = [];
    localStorage.setItem("realtyboost_listings", JSON.stringify(listings));

    console.log("🧹 Room designs cleared for listing");
    return true;
  },

  // 6. List all listings with their content status
  listAllWithStatus() {
    const listings = this.getAllListings();

    console.log("📋 All Listings Status:");
    listings.forEach((listing) => {
      console.log(`\n🏠 ${listing.address} (ID: ${listing.id})`);
      console.log(
        `   Description: ${listing.generatedDescription ? "✅" : "❌"}`,
      );
      console.log(`   Email: ${listing.generatedEmail ? "✅" : "❌"}`);
      console.log(
        `   Facebook: ${listing.generatedFacebookPost ? "✅" : "❌"}`,
      );
      console.log(
        `   Instagram: ${listing.generatedInstagramCaption ? "✅" : "❌"}`,
      );
      console.log(`   X/Twitter: ${listing.generatedXPost ? "✅" : "❌"}`);
      console.log(
        `   Room Designs: ${listing.generatedRoomDesigns?.length || 0} designs`,
      );
      console.log(`   Paid Ads: ${listing.generatedAdCopy ? "✅" : "❌"}`);
      console.log(`   Flyers: ${listing.generatedFlyers?.length || 0} flyers`);
    });

    return listings;
  },

  // 7. Simulate a room design being saved from batch generation
  simulateBatchRoomDesign(listingId) {
    const mockRoomDesign = {
      originalImageUrl: "https://picsum.photos/400/300?room=original",
      styleId: "modern-minimalist",
      redesignedImageUrl:
        "https://picsum.photos/400/300?room=redesigned&t=" + Date.now(),
      prompt: "Living room in modern minimalist style - Batch Generated",
      createdAt: new Date().toISOString(),
    };

    console.log("🎯 Simulating batch room design generation...");
    console.log("📊 Mock room design:", mockRoomDesign);

    return this.addTestRoomDesign(listingId, mockRoomDesign.redesignedImageUrl);
  },

  // 8. Export listing data for inspection
  exportListing(listingId) {
    const listing = this.findListing(listingId);
    if (!listing) {
      console.log("❌ Listing not found");
      return null;
    }

    const exportData = JSON.stringify(listing, null, 2);
    console.log("📤 Listing Export Data:");
    console.log(exportData);

    // Also copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(exportData);
      console.log("📋 Data copied to clipboard");
    }

    return listing;
  },
};

// Usage examples:
console.log(`
🧪 Backend Data Testing Utility Loaded!

Usage Examples:
1. testBackendData.listAllWithStatus() - See all listings and their content status
2. testBackendData.findListing('123') - Find listing by ID or address fragment
3. testBackendData.inspectRoomDesigns('listingId') - Inspect room designs for a listing
4. testBackendData.addTestRoomDesign('listingId') - Add a test room design
5. testBackendData.simulateBatchRoomDesign('listingId') - Simulate batch generation
6. testBackendData.clearRoomDesigns('listingId') - Clear all room designs
7. testBackendData.exportListing('listingId') - Export listing data

Quick Start:
- First run: testBackendData.listAllWithStatus()
- Pick a listing ID and run: testBackendData.inspectRoomDesigns('your-listing-id')
`);

// Make it globally available
window.testBackendData = testBackendData;
