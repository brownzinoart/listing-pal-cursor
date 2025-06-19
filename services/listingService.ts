import { Listing, ListingImage } from '../types';

const LISTINGS_KEY = 'realtyboost_listings';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Helper to get all listings from localStorage
const getAllStoredListings = (): Listing[] => {
  const listingsJson = localStorage.getItem(LISTINGS_KEY);
  return listingsJson ? JSON.parse(listingsJson) : [];
};

// Helper to save all listings to localStorage
const saveAllStoredListings = (listings: Listing[]): void => {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
};

const DEMO_ADDRESS = '123 Main St, Apex, NC 27523';
const DEMO_ADDRESS_ALT = '123 Demo St, Apex, NC 27523';

const createDemoListing = (userId: string): Listing => ({
  id: generateId(),
  userId,
  address: DEMO_ADDRESS,
  latitude: 35.7596, // Apex, NC coordinates
  longitude: -78.8503,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1850,
  yearBuilt: 1998,
  price: 465000,
  keyFeatures: '• Spacious open-concept living area, perfect for entertaining.\n• Recently updated kitchen with quartz countertops & stainless appliances.\n• Primary suite with vaulted ceiling & walk-in closet.\n• Large fenced backyard with deck & mature trees.\n• Minutes to downtown Apex, parks, and top-rated schools.',
  images: [
    {
      id: generateId(),
      url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=60',
      name: 'front-exterior.jpg'
    },
    {
      id: generateId(),
      url: 'https://images.unsplash.com/photo-1505691723518-36a9e4d8bb06?auto=format&fit=crop&w=1200&q=60',
      name: 'living-room.jpg'
    }
  ],
  listingType: 'sale',
  propertyType: 'Single Family',
  neighborhoodSections: ['walkability','places']
});

// Ensure demo listing exists for current user
const ensureDemoListing = (userId: string) => {
  const all = getAllStoredListings();
  const hasDemo = all.some(l => (l.address === DEMO_ADDRESS || l.address === DEMO_ADDRESS_ALT) && l.userId === userId);
  if (!hasDemo) {
    all.push(createDemoListing(userId));
    saveAllStoredListings(all);
  }
};

export const getListings = async (userId: string): Promise<Listing[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  ensureDemoListing(userId);
  const allListings = getAllStoredListings();
  return allListings.filter(listing => listing.userId === userId);
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const allListings = getAllStoredListings();
  const listing = allListings.find(l => l.id === id);
  return listing || null;
};

type CreateListingData = Omit<Listing, 'id' | 'images'> & { images: Omit<ListingImage, 'id'>[] };
type UpdateListingData = Partial<CreateListingData>;


export const createListing = async (listingData: CreateListingData): Promise<Listing> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const allListings = getAllStoredListings();
  
  const newImages: ListingImage[] = listingData.images.map(img => ({
    ...img,
    id: generateId(),
  }));

  const newListing: Listing = {
    ...listingData,
    id: generateId(),
    images: newImages,
  };
  
  allListings.push(newListing);
  saveAllStoredListings(allListings);
  return newListing;
};

export const updateListing = async (id: string, listingUpdateData: UpdateListingData): Promise<Listing | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let allListings = getAllStoredListings();
  const listingIndex = allListings.findIndex(l => l.id === id);

  if (listingIndex === -1) {
    return null; // Or throw error
  }

  const updatedImages = listingUpdateData.images ? listingUpdateData.images.map(img => ({
    ...img,
    id: (img as ListingImage).id || generateId(), // Keep existing id or generate new one
  })) : allListings[listingIndex].images;


  const updatedListing: Listing = {
    ...allListings[listingIndex],
    ...listingUpdateData,
    images: updatedImages,
  };
  
  allListings[listingIndex] = updatedListing;
  saveAllStoredListings(allListings);
  return updatedListing;
};

export const deleteListing = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let allListings = getAllStoredListings();
  const initialLength = allListings.length;
  allListings = allListings.filter(l => l.id !== id);
  
  if (allListings.length < initialLength) {
    saveAllStoredListings(allListings);
    return true;
  }
  return false;
};

export const fetchPropertyDetails = async (address: string): Promise<any> => {
  const normalized = address.toLowerCase();
  if ((normalized.includes('123 main st') || normalized.includes('123 demo st')) && normalized.includes('apex')) {
    // Return mock data immediately for demo
    return {
      estimatedValue: 465000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1850,
      yearBuilt: 1998,
      propertyType: 'Single Family',
      _mockData: true,
    };
  }

  // Use our new ATTOM API service for real property data
  console.log('🏠 Using ATTOM API service for property details:', address);
  
  try {
    // Dynamic import for the ATTOM service
    const { attomService } = await import('./api/attomService');
    
    // Extract coordinates from address (you might want to use a geocoding service here)
    // For now, we'll use a basic approach - in production you'd geocode the address first
    
    // Try to get property details using ATTOM
    // Note: This is a simplified approach. In production, you'd first geocode the address to get lat/lng
    
    console.log('⚠️ Property details lookup requires coordinates. Consider implementing address geocoding first.');
    
    // For now, return a structured response indicating the service is available but needs geocoding
    return {
      estimatedValue: null,
      bedrooms: null,
      bathrooms: null,
      squareFootage: null,
      yearBuilt: null,
      propertyType: null,
      _needsGeocoding: true,
      _message: 'Property details available via ATTOM API. Address geocoding required.'
    };
    
  } catch (error) {
    console.error('❌ ATTOM API Error:', error);
    
    // Return empty data structure indicating no data available
    return {
      estimatedValue: null,
      bedrooms: null,
      bathrooms: null,
      squareFootage: null,
      yearBuilt: null,
      propertyType: null,
      _error: 'Property details temporarily unavailable'
    };
  }
};
    