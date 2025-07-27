import { Listing } from '../types';

// Enhanced listing dataset with 18 diverse properties
export const mockListings: Listing[] = [
  // Luxury Properties ($2M+)
  {
    id: 'listing-001',
    userId: 'user-1',
    address: '456 Ocean View Drive, Malibu, CA',
    city: 'Malibu',
    state: 'CA',
    zipCode: '90265',
    latitude: 34.0259,
    longitude: -118.7798,
    bedrooms: 6,
    bathrooms: 7,
    squareFootage: 5200,
    yearBuilt: 2018,
    price: 8750000,
    keyFeatures: 'Ocean views, infinity pool, smart home, wine cellar',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-07-20').toISOString(),
  },
  {
    id: 'listing-002',
    userId: 'user-1',
    address: '789 Hillcrest Boulevard, Beverly Hills, CA',
    city: 'Beverly Hills',
    state: 'CA',
    zipCode: '90210',
    latitude: 34.0901,
    longitude: -118.4065,
    bedrooms: 7,
    bathrooms: 9,
    squareFootage: 6800,
    yearBuilt: 2020,
    price: 12500000,
    keyFeatures: 'Gated estate, guest house, tennis court, 3-car garage',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'pending',
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-07-18').toISOString(),
  },
  {
    id: 'listing-003',
    userId: 'user-1',
    address: '321 Skyline Terrace, Los Altos Hills, CA',
    city: 'Los Altos Hills',
    state: 'CA',
    zipCode: '94022',
    latitude: 37.3894,
    longitude: -122.1519,
    bedrooms: 5,
    bathrooms: 6,
    squareFootage: 4900,
    yearBuilt: 2019,
    price: 6200000,
    keyFeatures: 'Tech corridor location, solar panels, modern architecture',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'sold',
    createdAt: new Date('2023-11-22').toISOString(),
    updatedAt: new Date('2024-05-30').toISOString(),
  },

  // Mid-Market Properties ($500K-$2M)
  {
    id: 'listing-004',
    userId: 'user-1',
    address: '123 Maple Street, Sunnyvale, CA',
    city: 'Sunnyvale',
    state: 'CA',
    zipCode: '94085',
    latitude: 37.3688,
    longitude: -122.0363,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2100,
    yearBuilt: 2005,
    price: 1250000,
    keyFeatures: 'Updated kitchen, hardwood floors, large backyard',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-06-01').toISOString(),
    updatedAt: new Date('2024-07-25').toISOString(),
  },
  {
    id: 'listing-005',
    userId: 'user-1',
    address: '567 Pine Lane, Mountain View, CA',
    city: 'Mountain View',
    state: 'CA',
    zipCode: '94041',
    latitude: 37.3861,
    longitude: -122.0839,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    yearBuilt: 1998,
    price: 1650000,
    keyFeatures: 'Walking distance to tech companies, renovated bathrooms',
    images: [],
    propertyType: 'townhome',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-04-12').toISOString(),
    updatedAt: new Date('2024-07-22').toISOString(),
  },
  {
    id: 'listing-006',
    userId: 'user-1',
    address: '890 Oak Avenue, Palo Alto, CA',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    latitude: 37.4419,
    longitude: -122.1430,
    bedrooms: 5,
    bathrooms: 4,
    squareFootage: 3200,
    yearBuilt: 2010,
    price: 2850000,
    keyFeatures: 'Top-rated schools, open floor plan, chef\'s kitchen',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'sold',
    createdAt: new Date('2024-02-18').toISOString(),
    updatedAt: new Date('2024-06-14').toISOString(),
  },
  {
    id: 'listing-007',
    userId: 'user-1',
    address: '234 Willow Drive, San Mateo, CA',
    city: 'San Mateo',
    state: 'CA',
    zipCode: '94403',
    latitude: 37.5630,
    longitude: -122.3255,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1950,
    yearBuilt: 2001,
    price: 1450000,
    keyFeatures: 'Caltrain access, updated HVAC, garden',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-05-20').toISOString(),
    updatedAt: new Date('2024-07-24').toISOString(),
  },

  // Entry-Level & Condos
  {
    id: 'listing-008',
    userId: 'user-1',
    address: '345 Elm Street, San Jose, CA',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110',
    latitude: 37.3382,
    longitude: -121.8863,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    yearBuilt: 2015,
    price: 850000,
    keyFeatures: 'Modern condo, amenities, parking space',
    images: [],
    propertyType: 'condo',
    listingType: 'sale',
    status: 'sold',
    createdAt: new Date('2024-01-30').toISOString(),
    updatedAt: new Date('2024-04-22').toISOString(),
  },
  {
    id: 'listing-009',
    userId: 'user-1',
    address: '678 Cedar Court, Fremont, CA',
    city: 'Fremont',
    state: 'CA',
    zipCode: '94536',
    latitude: 37.5485,
    longitude: -121.9886,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1650,
    yearBuilt: 2008,
    price: 975000,
    keyFeatures: 'Family-friendly neighborhood, 2-car garage',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-07-01').toISOString(),
    updatedAt: new Date('2024-07-25').toISOString(),
  },
  {
    id: 'listing-010',
    userId: 'user-1',
    address: '901 Birch Avenue, Redwood City, CA',
    city: 'Redwood City',
    state: 'CA',
    zipCode: '94063',
    latitude: 37.4852,
    longitude: -122.2364,
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 1100,
    yearBuilt: 1995,
    price: 950000,
    keyFeatures: 'Charming starter home, large lot, potential ADU',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-06-15').toISOString(),
    updatedAt: new Date('2024-07-20').toISOString(),
  },

  // Out-of-State Markets
  {
    id: 'listing-011',
    userId: 'user-1',
    address: '1234 Music Row, Nashville, TN',
    city: 'Nashville',
    state: 'TN',
    zipCode: '37203',
    latitude: 36.1627,
    longitude: -86.7816,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2400,
    yearBuilt: 2012,
    price: 675000,
    keyFeatures: 'Downtown location, music district, rooftop deck',
    images: [],
    propertyType: 'townhome',
    listingType: 'sale',
    status: 'sold',
    createdAt: new Date('2023-12-10').toISOString(),
    updatedAt: new Date('2024-03-25').toISOString(),
  },
  {
    id: 'listing-012',
    userId: 'user-1',
    address: '5678 Lake Austin Boulevard, Austin, TX',
    city: 'Austin',
    state: 'TX',
    zipCode: '78746',
    latitude: 30.2672,
    longitude: -97.7431,
    bedrooms: 5,
    bathrooms: 4,
    squareFootage: 3500,
    yearBuilt: 2016,
    price: 1125000,
    keyFeatures: 'Lake access, tech hub proximity, hill country views',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-04-05').toISOString(),
    updatedAt: new Date('2024-07-18').toISOString(),
  },
  {
    id: 'listing-013',
    userId: 'user-1',
    address: '789 Biscayne Bay Drive, Miami, FL',
    city: 'Miami',
    state: 'FL',
    zipCode: '33131',
    latitude: 25.7617,
    longitude: -80.1918,
    bedrooms: 3,
    bathrooms: 3,
    squareFootage: 2200,
    yearBuilt: 2020,
    price: 1850000,
    keyFeatures: 'Waterfront condo, concierge, resort amenities',
    images: [],
    propertyType: 'condo',
    listingType: 'sale',
    status: 'pending',
    createdAt: new Date('2024-02-28').toISOString(),
    updatedAt: new Date('2024-07-10').toISOString(),
  },

  // Pacific Northwest
  {
    id: 'listing-014',
    userId: 'user-1',
    address: '2468 Queen Anne Hill, Seattle, WA',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
    latitude: 47.6205,
    longitude: -122.3493,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2800,
    yearBuilt: 2007,
    price: 1675000,
    keyFeatures: 'Space Needle views, walkable neighborhood, tech corridor',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-05-08').toISOString(),
    updatedAt: new Date('2024-07-23').toISOString(),
  },
  {
    id: 'listing-015',
    userId: 'user-1',
    address: '1357 Pearl District, Portland, OR',
    city: 'Portland',
    state: 'OR',
    zipCode: '97209',
    latitude: 45.5152,
    longitude: -122.6784,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1400,
    yearBuilt: 2018,
    price: 725000,
    keyFeatures: 'Urban loft, exposed brick, bike-friendly',
    images: [],
    propertyType: 'condo',
    listingType: 'sale',
    status: 'sold',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-05-18').toISOString(),
  },

  // Investment Properties
  {
    id: 'listing-016',
    userId: 'user-1',
    address: '9876 University District, Berkeley, CA',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94720',
    latitude: 37.8715,
    longitude: -122.2730,
    bedrooms: 6,
    bathrooms: 4,
    squareFootage: 2900,
    yearBuilt: 1985,
    price: 1950000,
    keyFeatures: 'Student rental income, UC Berkeley proximity, duplex potential',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'active',
    createdAt: new Date('2024-03-22').toISOString(),
    updatedAt: new Date('2024-07-19').toISOString(),
  },
  {
    id: 'listing-017',
    userId: 'user-1',
    address: '4321 Downtown Loft District, San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 850,
    yearBuilt: 2021,
    price: 1150000,
    keyFeatures: 'SOMA location, tech worker magnet, modern finishes',
    images: [],
    propertyType: 'condo',
    listingType: 'sale',
    status: 'withdrawn',
    createdAt: new Date('2024-04-30').toISOString(),
    updatedAt: new Date('2024-07-05').toISOString(),
  },
  {
    id: 'listing-018',
    userId: 'user-1',
    address: '8642 Coastal Highway, Santa Barbara, CA',
    city: 'Santa Barbara',
    state: 'CA',
    zipCode: '93101',
    latitude: 34.4208,
    longitude: -119.6982,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 2100,
    yearBuilt: 2003,
    price: 2250000,
    keyFeatures: 'Beach access, vacation rental potential, Spanish architecture',
    images: [],
    propertyType: 'single-family',
    listingType: 'sale',
    status: 'coming_soon',
    createdAt: new Date('2024-07-20').toISOString(),
    updatedAt: new Date('2024-07-25').toISOString(),
  }
];

// Modern portfolio growth data - focused on agent metrics
export const generateTimeSeriesData = () => {
  const months = [
    'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023',
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024'
  ];

  return months.map((month, index) => {
    // Realistic seasonal patterns for real estate
    const seasonalMultiplier = month.includes('Dec') || month.includes('Jan') ? 0.6 : 1.0;
    const springBoost = month.includes('Mar') || month.includes('Apr') || month.includes('May') ? 1.4 : 1.0;
    const summerSustain = month.includes('Jun') || month.includes('Jul') ? 1.2 : 1.0;
    const growthFactor = 1 + (index * 0.03); // 3% steady growth

    // More realistic base numbers for a successful agent
    const baseLeads = 12; // 12 leads per month is solid
    const baseShowings = 8; // About 2/3 of leads convert to showings
    const baseOffers = 3; // About 1/4 of leads result in offers
    const baseListings = 15; // Active listings in portfolio

    return {
      month: month.split(' ')[0], // Short month name
      year: month.split(' ')[1],
      leads: Math.round(baseLeads * seasonalMultiplier * springBoost * summerSustain * growthFactor),
      showings: Math.round(baseShowings * seasonalMultiplier * springBoost * summerSustain * growthFactor),
      offers: Math.round(baseOffers * seasonalMultiplier * springBoost * summerSustain * growthFactor),
      activeListings: Math.round(baseListings * (0.9 + Math.random() * 0.2)),
      portfolioValue: Math.round((18500000 + (index * 500000)) * (0.95 + Math.random() * 0.1)), // Growing portfolio value
      avgDaysOnMarket: Math.round(28 + (Math.random() * 14)), // 28-42 days typical
      leadQuality: Math.round(65 + (Math.random() * 20)) // 65-85% quality score
    };
  });
};

// Property performance data - agent-focused metrics
export const generatePropertyPerformanceData = () => {
  return mockListings.map((listing, index) => {
    // Performance based on realistic factors
    const priceRange = listing.price > 2000000 ? 'luxury' : listing.price > 1000000 ? 'premium' : 'standard';
    const hotMarkets = ['Palo Alto', 'Beverly Hills', 'Malibu', 'San Francisco'];
    const isHotMarket = hotMarkets.includes(listing.city || '');
    
    // Calculate actual days on market first
    const daysOnMarket = (() => {
      const createdDate = new Date(listing.createdAt || Date.now());
      const currentDate = new Date();
      return Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    })();

    // Force some properties to need attention with varied scenarios
    const forceNeedsAttention = [
      'listing-010', // Redwood City starter home - pricing issue
      'listing-016', // Seattle townhome - stale photos  
      'listing-018', // Portland condo - marketing refresh
      'listing-004', // Austin luxury - seasonal adjustment
      'listing-008'  // Fremont standard - staging needed
    ].includes(listing.id);

    // Realistic lead generation
    let baseLeads = priceRange === 'luxury' ? 6 : priceRange === 'premium' ? 4 : 3;
    const marketBoost = isHotMarket ? 1.5 : 1.0;
    const statusBoost = listing.status === 'sold' ? 1.8 : listing.status === 'pending' ? 1.3 : 1.0;
    
    // Override for properties that need attention
    let monthlyLeads;
    if (forceNeedsAttention && listing.status === 'active') {
      monthlyLeads = Math.floor(Math.random() * 2); // 0-1 leads (definitely needs attention)
    } else {
      monthlyLeads = Math.round(baseLeads * marketBoost * statusBoost * (0.7 + Math.random() * 0.6));
    }

    const monthlyShowings = Math.round(monthlyLeads * (0.6 + Math.random() * 0.3));
    const offers = listing.status === 'sold' ? Math.floor(1 + Math.random() * 3) : 
                   listing.status === 'pending' ? 1 : 
                   Math.floor(Math.random() * 2);

    // Performance temperature (hot, warm, cold)
    const getPerformanceTemp = () => {
      if (listing.status === 'sold') return 'hot';
      if (listing.status === 'pending') return 'hot';
      if (monthlyLeads >= 5) return 'hot';
      if (monthlyLeads >= 2) return 'warm';
      return 'cold';
    };

    // Lead quality score (realistic for real estate)
    const leadQuality = Math.round(60 + (Math.random() * 35)); // 60-95%

    // Determine what specific action is needed with more variety
    const getActionNeeded = () => {
      if (listing.id === 'listing-010') return 'Price reduction: 5-8% below market value';
      if (listing.id === 'listing-016') return 'Update photos: Current images are 6+ months old';
      if (listing.id === 'listing-018') return 'Marketing refresh: New copy & social media push';
      if (listing.id === 'listing-004') return 'Seasonal pricing: Adjust for fall market conditions';
      if (listing.id === 'listing-008') return 'Professional staging: Living areas need furniture';
      
      // General rules for other properties
      if (daysOnMarket > 75 && monthlyLeads < 1) return 'Major price reduction: 10-15% recommended';
      if (daysOnMarket > 60 && monthlyLeads < 2) return 'Price reduction: 5-8% recommended';
      if (daysOnMarket > 45 && monthlyLeads < 2) return 'Fresh marketing campaign & new photos';
      if (daysOnMarket > 30 && monthlyLeads < 1) return 'Professional staging & virtual tour';
      if (monthlyLeads > 0 && monthlyShowings === 0) return 'Follow up with leads: Convert inquiries to showings';
      return null;
    };

    return {
      listingId: listing.id,
      property: listing.address?.split(',')[0] || 'Unknown Property',
      city: listing.city,
      state: listing.state,
      price: listing.price,
      priceRange,
      monthlyLeads,
      monthlyShowings,
      totalOffers: offers,
      daysOnMarket,
      performanceTemp: getPerformanceTemp(),
      leadQuality,
      pricePerSqFt: Math.round((listing.price || 0) / (listing.squareFootage || 1)),
      marketPosition: isHotMarket ? 'prime' : 'standard',
      needsAttention: daysOnMarket > 45 && monthlyLeads < 2,
      actionNeeded: getActionNeeded(),
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
    };
  });
};

// Market segment data
export const getMarketSegments = () => {
  const luxury = mockListings.filter(l => l.price >= 2000000);
  const midMarket = mockListings.filter(l => l.price >= 500000 && l.price < 2000000);
  const entryLevel = mockListings.filter(l => l.price < 500000);

  return {
    luxury: {
      count: luxury.length,
      avgPrice: luxury.reduce((sum, l) => sum + l.price, 0) / luxury.length,
      totalValue: luxury.reduce((sum, l) => sum + l.price, 0),
      avgDaysOnMarket: 28,
      label: 'Luxury ($2M+)'
    },
    midMarket: {
      count: midMarket.length,
      avgPrice: midMarket.reduce((sum, l) => sum + l.price, 0) / midMarket.length,
      totalValue: midMarket.reduce((sum, l) => sum + l.price, 0),
      avgDaysOnMarket: 35,
      label: 'Mid-Market ($500K-$2M)'
    },
    entryLevel: {
      count: entryLevel.length,
      avgPrice: entryLevel.length ? entryLevel.reduce((sum, l) => sum + l.price, 0) / entryLevel.length : 0,
      totalValue: entryLevel.reduce((sum, l) => sum + l.price, 0),
      avgDaysOnMarket: 42,
      label: 'Entry-Level (<$500K)'
    }
  };
};

// Geographic distribution data
export const getGeographicData = () => {
  const californiaProperties = mockListings.filter(l => l.state === 'CA');
  const outOfStateProperties = mockListings.filter(l => l.state !== 'CA');

  const californiaCities = californiaProperties.reduce((acc, listing) => {
    if (!acc[listing.city]) {
      acc[listing.city] = { count: 0, totalValue: 0, avgPrice: 0 };
    }
    acc[listing.city].count++;
    acc[listing.city].totalValue += listing.price;
    acc[listing.city].avgPrice = acc[listing.city].totalValue / acc[listing.city].count;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; avgPrice: number }>);

  return {
    california: californiaCities,
    outOfState: outOfStateProperties.reduce((acc, listing) => {
      const key = `${listing.city}, ${listing.state}`;
      if (!acc[key]) {
        acc[key] = { count: 0, totalValue: 0, avgPrice: 0 };
      }
      acc[key].count++;
      acc[key].totalValue += listing.price;
      acc[key].avgPrice = acc[key].totalValue / acc[key].count;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; avgPrice: number }>)
  };
};

// AI-powered insights
export const generateAIInsights = () => {
  const performanceData = generatePropertyPerformanceData();
  const topPerformer = performanceData.reduce((max, current) => 
    current.conversionRate > max.conversionRate ? current : max
  );
  const needsAttention = performanceData.filter(p => p.conversionRate < 2.0);
  const highTraffic = performanceData.filter(p => p.views > 5000);

  return {
    topPerformer: {
      type: 'success',
      title: 'Top Performer',
      property: topPerformer.property,
      insight: `${topPerformer.property} is leading with ${topPerformer.conversionRate}% conversion rate and ${topPerformer.leads} leads generated.`,
      recommendation: 'Consider replicating this listing\'s marketing strategy across similar properties.'
    },
    marketTiming: {
      type: 'info',
      title: 'Market Timing',
      insight: 'Properties priced above $2M are selling 25% faster than market average.',
      recommendation: 'Luxury properties are in high demand - consider strategic pricing for quick sales.'
    },
    attentionNeeded: needsAttention.length > 0 ? {
      type: 'warning',
      title: 'Attention Needed',
      insight: `${needsAttention.length} properties have conversion rates below 2.0% - consider photo updates or price adjustments.`,
      properties: needsAttention.slice(0, 3).map(p => p.property),
      recommendation: 'Review photography quality and competitive pricing for these properties.'
    } : null,
    trafficSurge: highTraffic.length > 0 ? {
      type: 'success',
      title: 'High Engagement',
      insight: `${highTraffic.length} properties are generating exceptional traffic (5000+ views).`,
      recommendation: 'Monitor these high-traffic properties for potential quick sales opportunities.'
    } : null
  };
};

// Lead quality scoring data
export const generateLeadQualityData = () => {
  return [
    { quality: 'Hot Leads', count: 23, percentage: 15, conversionRate: 35, avgTimeToResponse: 12 },
    { quality: 'Warm Leads', count: 67, percentage: 45, conversionRate: 18, avgTimeToResponse: 34 },
    { quality: 'Cold Leads', count: 97, percentage: 40, conversionRate: 6, avgTimeToResponse: 120 }
  ];
};

// Marketing channel attribution
export const getMarketingChannelData = () => {
  return [
    { channel: 'Zillow', leads: 45, views: 12500, cost: 2800, roi: 4.2 },
    { channel: 'Realtor.com', leads: 32, views: 8900, cost: 1900, roi: 3.8 },
    { channel: 'Facebook Ads', leads: 28, views: 15600, cost: 1200, roi: 6.1 },
    { channel: 'Google Ads', leads: 38, views: 11200, cost: 2100, roi: 4.5 },
    { channel: 'Instagram', leads: 18, views: 9800, cost: 800, roi: 5.2 },
    { channel: 'Referrals', leads: 22, views: 3400, cost: 0, roi: 'Infinite' },
    { channel: 'Company Website', leads: 35, views: 7800, cost: 400, roi: 12.3 }
  ];
};

export default {
  mockListings,
  generateTimeSeriesData,
  generatePropertyPerformanceData,
  getMarketSegments,
  getGeographicData,
  generateAIInsights,
  generateLeadQualityData,
  getMarketingChannelData
};