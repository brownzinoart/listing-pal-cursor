// Configuration - Updated to use working Decor8AI API
const DEFAULT_USE_PAID_API = true;

interface RestyleResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface RestyleOptions {
  usePaidAPI?: boolean;
  numImages?: number;
  upscale?: boolean;
}

/**
 * Restyle a room image using the Decor8AI API through our backend
 * @param file - Image file to restyle
 * @param prompt - Text prompt for styling (e.g., "Scandinavian bedroom with soft wood decor")
 * @param roomType - Type of room (optional, used for enhanced prompting)
 * @param style - Design style (optional, used for enhanced prompting)
 * @param options - Additional options for processing
 * @returns Promise resolving to image URL
 */
export async function restyleRoom(
  file: File, 
  prompt: string,
  roomType?: string,
  style?: string,
  options?: RestyleOptions
): Promise<RestyleResponse> {
  try {
    // Validate inputs
    if (!file) {
      throw new Error('No image file provided');
    }

    const formData = new FormData();
    formData.append('image', file);
    
    // Map the roomType and style to the expected format
    const mappedRoomType = mapRoomTypeToAPI(roomType);
    const mappedStyle = mapStyleToAPI(style);
    
    formData.append('room_type', mappedRoomType);
    formData.append('style', mappedStyle);

    console.log('Sending request to /api/redesign with:', {
      fileName: file.name,
      fileSize: file.size,
      room_type: mappedRoomType,
      style: mappedStyle
    });

    const response = await fetch('/api/redesign', {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Get response text first to see what we're getting
    const responseText = await response.text();
    console.log('Response text:', responseText);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(result.error || `API error: ${response.status}`);
    }

    if (result.success && result.imageUrl) {
    return {
      success: true,
        imageUrl: result.imageUrl
    };
    } else {
      throw new Error(result.error || 'No image received from API');
    }
  } catch (error) {
    console.error('Room restyle error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Map frontend room types to API expected format
 */
function mapRoomTypeToAPI(roomType?: string): string {
  const mapping: Record<string, string> = {
    'livingroom': 'Living Room',
    'bedroom': 'Bedroom',
    'kitchen': 'Kitchen',
    'bathroom': 'Bathroom',
    'diningroom': 'Dining Room',
    'homeoffice': 'Office',
    'nursery': 'Bedroom',
    'basement': 'Living Room'
  };
  
  return mapping[roomType || 'livingroom'] || 'Living Room';
}

/**
 * Map frontend styles to API expected format
 */
function mapStyleToAPI(style?: string): string {
  const mapping: Record<string, string> = {
    'modern': 'Modern',
    'scandinavian': 'Scandinavian',
    'minimalist': 'Minimalist',
    'industrial': 'Industrial',
    'bohemian': 'Bohemian',
    'traditional': 'Traditional',
    'midcenturymodern': 'Mid-Century Modern',
    'glamorous': 'Luxury',
    'rustic': 'Rustic',
    'contemporary': 'Contemporary',
    'eclectic': 'Contemporary',
    'farmhouse': 'Farmhouse'
  };
  
  return mapping[style || 'modern'] || 'Modern';
}

/**
 * Get available room types and design styles from the API
 */
export async function getAvailableStyles(): Promise<{
  roomTypes: string[];
  designStyles: string[];
}> {
  try {
    const response = await fetch('/api/styles');
    if (response.ok) {
      const data = await response.json();
      return {
        roomTypes: data.roomTypes || [],
        designStyles: data.styles || []
      };
    }
  } catch (error) {
    console.error('Failed to fetch styles:', error);
  }
  
  // Fallback to default values
  return {
    roomTypes: [
      'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 
      'Office', 'Bathroom'
    ],
    designStyles: [
      'Modern', 'Scandinavian', 'Industrial', 'Minimalist', 
      'Mid-Century Modern', 'Bohemian', 'Contemporary',
      'Rustic', 'Traditional', 'Farmhouse'
    ]
  };
}

/**
 * Check if the API service is available
 */
export async function checkServiceHealth(): Promise<{
  available: boolean;
  apiType: 'paid' | 'local';
  error?: string;
}> {
  try {
    const response = await fetch('/api/health');
    
    if (response.ok) {
      const data = await response.json();
      return {
        available: data.hasApiToken && data.hasCloudinary,
        apiType: 'paid',
        error: !data.hasApiToken ? 'API token not configured' : 
               !data.hasCloudinary ? 'Cloudinary not configured' : undefined
      };
    } else {
    return {
        available: false,
        apiType: 'paid',
        error: `Health check failed: ${response.status}`
    };
    }
  } catch (error) {
    return {
      available: false,
      apiType: 'paid',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate a descriptive prompt from room type and style selections
 */
export function generatePrompt(roomType: string, designStyle: string): string {
  const roomTypeLabels: Record<string, string> = {
    'Living Room': 'living room',
    'Bedroom': 'bedroom',
    'Kitchen': 'kitchen',
    'Dining Room': 'dining room',
    'Office': 'home office',
    'Bathroom': 'bathroom'
  };

  const styleDescriptions: Record<string, string> = {
    'Scandinavian': 'Scandinavian style with light wood, neutral colors, and minimalist furniture',
    'Industrial': 'Industrial style with exposed brick, metal fixtures, and raw materials',
    'Farmhouse': 'Farmhouse style with rustic wood, vintage accessories, and cozy textiles',
    'Modern': 'Modern style with clean lines, neutral palette, and contemporary furniture',
    'Minimalist': 'Minimalist style with simple forms, minimal clutter, and monochromatic colors',
    'Mid-Century Modern': 'Mid-century modern style with retro furniture, warm wood tones, and geometric patterns',
    'Bohemian': 'Bohemian style with rich textures, vibrant colors, and eclectic decor',
    'Contemporary': 'Contemporary style with current trends, mixed materials, and sophisticated finishes',
    'Rustic': 'Rustic style with natural materials, earthy tones, and handcrafted elements',
    'Traditional': 'Traditional style with classic furniture, elegant details, and timeless appeal'
  };

  const roomLabel = roomTypeLabels[roomType] || roomType.toLowerCase();
  const styleDesc = styleDescriptions[designStyle] || `${designStyle} style`;

  return `${styleDesc} ${roomLabel} with natural lighting and cohesive decor`;
}

/**
 * Get current API configuration
 */
export function getAPIConfig() {
  return {
    usePaidAPI: true, // Now using paid Decor8AI API
    apiEndpoint: '/api/redesign',
    hasAPIKey: true // Will be checked by health endpoint
  };
} 