export interface ContextCard {
  id: string;
  title: string;
  icon: string;
  category: 'location' | 'community' | 'amenities' | 'education' | 'transportation';
  preview: {
    score?: number;
    headline: string;
    bullets: string[];
    quickStat?: string;
  };
  marketingCopy: string;
  fullData: any;
}

export interface LocationContextData {
  address: string;
  coordinates: { lat: number; lng: number };
  cards: ContextCard[];
  categorizedCards: {
    location: ContextCard[];      // Walkability, Climate
    community: ContextCard[];     // Demographics, Safety  
    amenities: ContextCard[];     // Restaurants, Shopping, Parks
    education: ContextCard[];     // Schools, Libraries
    transportation: ContextCard[]; // Transit, Commute
  };
} 