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

export const getListings = async (userId: string): Promise<Listing[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
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
  console.log('🌐 Making API call to /api/fetch-property-details with address:', address);
  
  const response = await fetch('/api/fetch-property-details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  });

  console.log('📡 API Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API Error response:', errorData);
    throw errorData;
  }

  const data = await response.json();
  console.log('✅ API Success response:', data);
  return data;
};
    