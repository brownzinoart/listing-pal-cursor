// ATTOM API helper utilities - Updated for correct endpoints
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.gateway.attomdata.com/propertyapi/v1.0.0',
  headers: {
    accept: 'application/json',
  },
  // ATTOM is sometimes slow; bump timeout
  timeout: 15000
});

function getKey() {
  const key = process.env.ATTOM_API_KEY;
  if (!key) {
    console.warn('⚠️ ATTOM_API_KEY not configured');
  }
  return key || 'MISSING_API_KEY';
}

// attach request interceptor to inject latest key per request
client.interceptors.request.use((config) => {
  config.headers.apikey = getKey();
  return config;
});

/**
 * Fetch property details for a street address using ATTOM Property API
 * @param {string} address Full street address (e.g. "123 Main St, City, State")
 */
export async function fetchPropertyDetail(address) {
  if (!address) throw new Error('Address required');

  console.log('🏠 ATTOM API - Fetching property details for:', address);
  
  try {
    // Use the property/detail endpoint with address parameter
    const params = new URLSearchParams({ address });
    const url = `/property/detail?${params.toString()}`;
    
    console.log('📡 ATTOM API URL:', `${client.defaults.baseURL}${url}`);
    const { data } = await client.get(url);
    
    console.log('✅ ATTOM API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ ATTOM API Error:', error.response?.status, error.response?.statusText);
    console.error('❌ ATTOM API Error Details:', error.response?.data);
    throw error;
  }
}

/**
 * Fetch property sales data for a ZIP code using property search
 * @param {string} zip Five-digit ZIP code
 */
export async function fetchSalesTrend(zip) {
  if (!/^[0-9]{5}$/.test(zip)) throw new Error(`Invalid ZIP code: ${zip}`);

  try {
    // Use property search endpoint to get recent sales in the ZIP code
    const url = `/property/search?postalCode=${zip}&orderBy=saleDate&page=1&pagesize=50`;
    const { data } = await client.get(url);
    return data;
  } catch (error) {
    console.error('❌ ATTOM Sales Trend Error:', error.response?.status, error.message);
    throw error;
  }
}

/**
 * Fetch AVM (Automated Valuation Model) data for an address
 * @param {string} address Full street address
 */
export async function fetchAVM(address) {
  if (!address) throw new Error('Address required');

  try {
    const params = new URLSearchParams({ address });
    const url = `/avm/detail?${params.toString()}`;
    const { data } = await client.get(url);
    return data;
  } catch (error) {
    console.error('❌ ATTOM AVM Error:', error.response?.status, error.message);
    throw error;
  }
}

/**
 * Convenience function to get comprehensive property and market data
 * @param {string} address Full street address
 * @param {string} zip ZIP code for market trends
 */
export async function fetchNeighborhoodBundle(zip) {
  console.log('🏘️ ATTOM API - Fetching neighborhood bundle for ZIP:', zip);
  
  const [salesTrend, avm] = await Promise.allSettled([
    fetchSalesTrend(zip),
    // We'll skip AVM for now since it needs a specific address
    Promise.resolve({ status: 'fulfilled', value: null })
  ]);

  return {
    market: salesTrend.status === 'fulfilled' ? salesTrend.value : { error: salesTrend.reason?.message },
    avm: avm.status === 'fulfilled' ? avm.value : { error: avm.reason?.message }
  };
}

/**
 * Fetch Community & Demographic profile for a ZIP code.
 * Docs: https://docs.attomdata.com/#operation/GetCommunityByGeoId
 * @param {string} zip Five-digit ZIP code
 */
export async function fetchCommunityZip(zip) {
  if (!/^[0-9]{5}$/.test(zip)) throw new Error(`Invalid ZIP code: ${zip}`);

  const url = `/v4/community/zip/${zip}`;
  const { data } = await client.get(url);
  return data;
}

/**
 * Fetch Crime stats for a ZIP code (if plan includes Crime).
 * @param {string} zip Five-digit ZIP code
 */
export async function fetchCrimeZip(zip) {
  if (!/^[0-9]{5}$/.test(zip)) throw new Error(`Invalid ZIP code: ${zip}`);

  const url = `/v4/crime/stats/zip/${zip}`;
  const { data } = await client.get(url);
  return data;
} 