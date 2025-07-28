import { Listing } from "../types";

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export interface DemoProperty extends Listing {
  style?: string;
  yearBuilt?: number;
  features: string[];
}

// Realistic demo properties based on actual luxury homes
export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "beverly-hills-mansion",
    userId: "demo",
    address: "1245 Benedict Canyon Drive, Beverly Hills, CA 90210",
    price: 15750000,
    bedrooms: 7,
    bathrooms: 9,
    sqft: 12500,
    yearBuilt: 2021,
    style: "Modern Contemporary",
    status: "active",
    imageUrl: "",
    features: [
      "Floating glass staircase with LED lighting",
      "Chef's kitchen with La Cornue range & Sub-Zero appliances",
      "Temperature-controlled wine room (1,000+ bottle capacity)",
      "Crestron smart home automation system",
      "Private screening room with 4K laser projection",
      "Zero-edge infinity pool with integrated spa",
      "Rooftop deck with 360° city and ocean views",
      "Private motor court with fountain",
      "Wellness center with gym and steam room",
    ],
    description:
      "Nestled in the prestigious Benedict Canyon, this architectural masterpiece redefines luxury living. Designed by renowned architect Richard Landry, this estate offers unparalleled sophistication with breathtaking views from downtown to the Pacific.",
  },
  {
    id: "sunset-strip-estate",
    userId: "demo",
    address: "9255 Doheny Road, West Hollywood, CA 90069",
    price: 8900000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 7200,
    yearBuilt: 2019,
    style: "Mediterranean Modern",
    status: "active",
    imageUrl: "",
    features: [
      "Imported Italian Calacatta marble throughout",
      "Miele appliance package with built-in coffee system",
      "Climate-controlled glass wine display (500+ bottles)",
      "Lutron lighting and shade automation",
      "Sonos whole-home audio system",
      "Resort-style pool with waterfall feature",
      "Private guest house with full amenities",
      "Three-car garage with EV charging stations",
    ],
    description:
      "This stunning Mediterranean Modern estate combines old-world elegance with contemporary luxury. Situated on a private cul-de-sac above Sunset Strip, enjoy explosive city views and ultimate privacy in this meticulously crafted home.",
  },
  {
    id: "malibu-beach-house",
    userId: "demo",
    address: "31118 Broad Beach Road, Malibu, CA 90265",
    price: 22500000,
    bedrooms: 6,
    bathrooms: 8,
    sqft: 9800,
    yearBuilt: 2020,
    style: "Contemporary Beach House",
    status: "active",
    imageUrl: "",
    features: [
      "Direct beach access with private stairs",
      "Floor-to-ceiling glass walls with ocean views",
      "Gourmet kitchen with Gaggenau appliances",
      "Master suite with panoramic ocean views",
      "Infinity pool seemingly flowing into the ocean",
      "Private beach deck with fire pit",
      "Home theater with Dolby Atmos sound",
      "Elevator serving all three levels",
      "Solar power system with battery backup",
    ],
    description:
      "Experience the epitome of California coastal living in this stunning beachfront estate. With 100 feet of pristine beach frontage and unobstructed ocean views, this architectural marvel offers the perfect blend of luxury and natural beauty.",
  },
];

// Image queries for different property areas
const IMAGE_QUERIES = {
  exterior: [
    "luxury modern mansion exterior",
    "beverly hills mansion front",
    "contemporary luxury home facade",
  ],
  living_room: [
    "luxury living room modern",
    "high end living room interior",
    "luxury home great room",
  ],
  kitchen: [
    "luxury kitchen marble countertops",
    "gourmet kitchen professional",
    "modern luxury kitchen design",
  ],
  bedroom: [
    "luxury master bedroom suite",
    "modern luxury bedroom design",
    "high end bedroom interior",
  ],
  bathroom: [
    "luxury bathroom spa design",
    "marble bathroom luxury",
    "modern luxury master bathroom",
  ],
  pool: [
    "infinity pool luxury home",
    "luxury pool ocean view",
    "modern pool design mansion",
  ],
};

export interface PropertyImage {
  url: string;
  description: string;
  category: string;
  photographer: string;
  photographerUrl: string;
}

// Fallback images if Unsplash fails
const FALLBACK_IMAGES = {
  exterior:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  living_room:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
  kitchen:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  bedroom:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
  bathroom:
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80",
  pool: "https://images.unsplash.com/photo-1601760562234-9814eea6663a?w=1200&q=80",
};

/**
 * Fetch high-quality property images from Unsplash
 */
export async function fetchLuxuryPropertyImages(
  propertyType: "mansion" | "estate" | "beach" = "mansion",
): Promise<PropertyImage[]> {
  const images: PropertyImage[] = [];
  const categories = Object.entries(IMAGE_QUERIES);

  // Try Unsplash first if we have an API key
  if (UNSPLASH_ACCESS_KEY) {
    for (const [category, queries] of categories) {
      try {
        // Use a random query from the category
        const query = queries[Math.floor(Math.random() * queries.length)];

        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          },
        );

        if (!response.ok) {
          console.error(`Unsplash API error: ${response.status}`);
          // Use fallback image
          images.push({
            url: FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES],
            description: `${category.replace("_", " ")} view`,
            category,
            photographer: "Unsplash",
            photographerUrl: "https://unsplash.com",
          });
          continue;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          images.push({
            url: photo.urls.regular || photo.urls.full,
            description:
              photo.description ||
              photo.alt_description ||
              `${category.replace("_", " ")} view`,
            category,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
          });
        } else {
          // No results, use fallback
          images.push({
            url: FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES],
            description: `${category.replace("_", " ")} view`,
            category,
            photographer: "Unsplash",
            photographerUrl: "https://unsplash.com",
          });
        }
      } catch (error) {
        console.error(`Error fetching ${category} image:`, error);
        // Use fallback image on error
        images.push({
          url: FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES],
          description: `${category.replace("_", " ")} view`,
          category,
          photographer: "Unsplash",
          photographerUrl: "https://unsplash.com",
        });
      }
    }
  } else {
    // No API key, use all fallback images
    console.warn("No Unsplash API key, using fallback images");
    for (const [category] of categories) {
      images.push({
        url: FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES],
        description: `${category.replace("_", " ")} view`,
        category,
        photographer: "Unsplash",
        photographerUrl: "https://unsplash.com",
      });
    }
  }

  return images;
}

/**
 * Convert Unsplash images to File objects for video generation
 */
export async function convertImagesToFiles(
  images: PropertyImage[],
): Promise<File[]> {
  const files: File[] = [];

  for (const image of images) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const fileName = `${image.category}-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      files.push(file);
    } catch (error) {
      console.error(`Error converting image ${image.category}:`, error);
    }
  }

  return files;
}

/**
 * Get a random demo property with real images
 */
export async function getDemoPropertyWithImages(propertyId?: string): Promise<{
  property: DemoProperty;
  images: File[];
}> {
  // Select property
  const property = propertyId
    ? DEMO_PROPERTIES.find((p) => p.id === propertyId) || DEMO_PROPERTIES[0]
    : DEMO_PROPERTIES[Math.floor(Math.random() * DEMO_PROPERTIES.length)];

  // Determine property type for image search
  const propertyType = property.address.includes("Beach")
    ? "beach"
    : property.price > 10000000
      ? "mansion"
      : "estate";

  // Fetch real images
  const propertyImages = await fetchLuxuryPropertyImages(propertyType);

  // Update property with main image URL
  if (propertyImages.length > 0) {
    property.imageUrl = propertyImages[0].url;
  }

  // Convert to File objects
  const imageFiles = await convertImagesToFiles(propertyImages);

  return { property, images: imageFiles };
}

/**
 * Generate property-specific script content
 */
export function generatePropertyScript(property: DemoProperty): {
  intro: string;
  features: string[];
  outro: string;
} {
  const location = property.address.includes("Beach")
    ? "beachfront"
    : property.address.includes("Beverly Hills")
      ? "Beverly Hills"
      : "West Hollywood";

  return {
    intro: `Welcome to this exceptional ${property.style || "luxury"} estate located at ${property.address}. ${property.description}`,
    features: property.features
      .slice(0, 5)
      .map(
        (feature) =>
          `This home features ${feature.toLowerCase()}, adding to its exceptional appeal.`,
      ),
    outro: `Offered at ${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(
      property.price,
    )}, this ${location} masterpiece represents a rare opportunity to own one of the area's most prestigious properties. Contact us today to schedule your private showing.`,
  };
}
