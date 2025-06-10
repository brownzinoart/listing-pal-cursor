import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftIcon as ArrowLeft, DocumentIcon as Save, ArrowUpTrayIcon as Upload, XMarkIcon as X, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import * as listingService from "../../services/listingService";
import Button from "../shared/Button";
import AddressAutocomplete from "../shared/AddressAutocomplete";
import NeighborhoodInsights from '../shared/NeighborhoodInsights';
import { ContextCard } from '../../types/locationContext';


// Define form data type to match new structure
type FormData = {
  address: string;
  latitude: number;
  longitude: number;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  yearBuilt: number;
  propertyType: string;
  keyFeatures: string;
  imageUrls: string[];
};

export default function ListingFormPage() {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [selectedContextCards, setSelectedContextCards] = useState<ContextCard[]>([]);
  const [contextInsightsAdded, setContextInsightsAdded] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [insightsAddress, setInsightsAddress] = useState('');

  const isEditing = !!listingId;

  const [formData, setFormData] = useState<FormData>({
    address: "",
    latitude: 0,
    longitude: 0,
    streetAddress: "",
    city: "",
    state: "",
          zipCode: "",
      price: 0,
      bedrooms: 0,
    bathrooms: 0,
    sqFt: 0,
    yearBuilt: new Date().getFullYear(),
    propertyType: "",
    keyFeatures: "",
    imageUrls: [],
  });

  useEffect(() => {
    if (isEditing && listingId) {
      setIsFetching(true);
      listingService.getListingById(listingId)
        .then(listing => {
          if (listing && listing.userId === user?.id) {
            // Convert existing listing structure to new form structure
            const addressParts = listing.address.split(',').map(part => part.trim());
            setFormData({
              address: listing.address,
              latitude: 0, // TODO: Add lat/lng to existing listing type
              longitude: 0, // TODO: Add lat/lng to existing listing type
              streetAddress: addressParts[0] || "",
              city: addressParts[1] || "",
              state: addressParts[2] || "",
                              zipCode: addressParts[3] || "",
                price: listing.price,
                bedrooms: listing.bedrooms,
              bathrooms: typeof listing.bathrooms === 'string' ? parseFloat(listing.bathrooms) : listing.bathrooms,
              sqFt: listing.squareFootage,
              yearBuilt: listing.yearBuilt,
              propertyType: "Single Family", // Default since not in old structure
              keyFeatures: listing.keyFeatures,
              imageUrls: listing.images?.map(img => img.url) || [],
            });
            if (listing.images && listing.images.length > 0) {
              setUploadedImages(listing.images.map(img => img.url));
            }
          } else if (listing && listing.userId !== user?.id) {
            setFormError("You do not have permission to edit this listing.");
            navigate('/dashboard');
          } else {
            setFormError('Listing not found.');
            navigate('/dashboard');
          }
        })
        .catch(() => setFormError('Failed to fetch listing data.'))
        .finally(() => setIsFetching(false));
    }
  }, [listingId, isEditing, user, navigate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const dataUrls = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );
    
    setUploadedImages(prev => [...prev, ...dataUrls]);
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...dataUrls] }));
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleBack = () => {
    if (isEditing && listingId) {
      navigate(`/listings/${listingId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleAddressSelect = async (address: string, lat?: number, lng?: number) => {
    console.log('Selected address:', address, 'Latitude:', lat || 0, 'Longitude:', lng || 0);
    
    // Parse the address to populate individual fields
    const addressParts = address.split(',').map(part => part.trim());
    
    // Set form data immediately for responsiveness
    const addressFormData = {
      ...formData,
      address: address,
      latitude: lat || 0,
      longitude: lng || 0,
      streetAddress: addressParts[0] || "",
      city: addressParts[1] || "",
      state: addressParts[2] || "",
      zipCode: addressParts[3] || ""
    };
    setFormData(addressFormData);
    setInsightsAddress(address);

    // Now, automatically fetch details
    setIsFetchingDetails(true);
    setFormError(null);
    try {
      console.log('🔍 Fetching property details for address:', address);
      const details = await listingService.fetchPropertyDetails(address);
      console.log('📥 Raw API response:', details);
      console.log('📥 Response keys:', Object.keys(details));
      console.log('📥 Response values:', Object.values(details));
      
      if (details) {
        console.log('🏠 Processing details:');
        console.log('  - Price from API:', details.price, '→ Parsed:', parseInt(details.price));
        console.log('  - Property Type from API:', details.propertyType);
        console.log('  - Bedrooms from API:', details.bedrooms, '→ Parsed:', parseInt(details.bedrooms));
        console.log('  - Bathrooms from API:', details.bathrooms, '→ Parsed:', parseFloat(details.bathrooms));
        console.log('  - Square Footage from API:', details.squareFootage, '→ Parsed:', parseInt(details.squareFootage));
        console.log('  - Year Built from API:', details.yearBuilt, '→ Parsed:', parseInt(details.yearBuilt));
        
        // Use the addressFormData (which has the address) as base, not the old formData
        const finalFormData = {
          ...addressFormData,  // This preserves the address and location data
          price: parseInt(details.price) || addressFormData.price,
          bedrooms: parseInt(details.bedrooms) || addressFormData.bedrooms,
          bathrooms: parseFloat(details.bathrooms) || addressFormData.bathrooms,
          sqFt: parseInt(details.squareFootage) || addressFormData.sqFt,
          yearBuilt: parseInt(details.yearBuilt) || addressFormData.yearBuilt,
          propertyType: details.propertyType || addressFormData.propertyType,
        };
        
        console.log('📝 Address form data:', addressFormData);
        console.log('📝 Final combined form data:', finalFormData);
        
        setFormData(finalFormData);
      } else {
        console.log('⚠️ No details returned from API');
      }
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.error('❌ Auto-fill error details:');
      console.error('  - Error message:', error.message || 'Unknown error');
      console.error('  - Error object:', error);
      console.error('  - Error response:', error.response?.data);
      console.log("🔄 Auto-fill attempt completed with limited data - check logs above for details");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numeric fields
    if (['price', 'bedrooms', 'bathrooms', 'sqFt', 'yearBuilt'].includes(name)) {
      if (name === 'bathrooms') {
        parsedValue = parseFloat(value) || 0;
      } else {
        parsedValue = parseInt(value) || 0;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'bedrooms') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else if (name === 'bathrooms') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContextSelection = (cards: ContextCard[]) => {
    try {
      setSelectedContextCards(cards);
      setContextError(null);
      
      if (cards.length > 0) {
        appendContextToDescription(cards);
        setContextInsightsAdded(true);
      } else {
        removeContextFromDescription();
        setContextInsightsAdded(false);
      }
    } catch (error) {
      setContextError('Failed to update listing with context data');
      console.error('Context integration error:', error);
    }
  };

  const appendContextToDescription = (cards: ContextCard[]) => {
    // Get the base description without any previous context
    const baseDescription = getBaseDescription();
    
    // Format the context insights
    const contextSection = formatContextForListing(cards);
    
    // Combine base description with context
    const enhancedDescription = baseDescription + contextSection;
    
    setFormData(prev => ({
      ...prev,
      keyFeatures: enhancedDescription
    }));
  };

  const formatContextForListing = (cards: ContextCard[]): string => {
    if (cards.length === 0) return '';
    
    const sections = [];
    
    // Group cards by category for better organization
    const groupedCards = cards.reduce((acc, card) => {
      if (!acc[card.category]) acc[card.category] = [];
      acc[card.category].push(card);
      return acc;
    }, {} as Record<string, ContextCard[]>);
    
    // Add neighborhood highlights header (clean, no extra spaces)
    sections.push('\n\n**NEIGHBORHOOD HIGHLIGHTS**');
    
    // Add each category
    Object.entries(groupedCards).forEach(([category, categoryCards]) => {
      const categoryTitle = getCategoryTitle(category);
      sections.push(`\n\n**${categoryTitle}**`);
      
      categoryCards.forEach(card => {
        sections.push(`• ${card.marketingCopy}`);
      });
    });
    
    return sections.join('\n');
  };

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      location: 'LOCATION & WALKABILITY',
      community: 'DEMOGRAPHICS & COMMUNITY',
      amenities: 'LOCAL AMENITIES',
      education: 'SCHOOLS & EDUCATION',
      transportation: 'TRANSIT & TRANSPORTATION'
    };
    
    return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getBaseDescription = (): string => {
    const currentDescription = formData.keyFeatures || '';
    
    // Check if the neighborhood highlights section exists
    const highlightsIndex = currentDescription.indexOf('\n\n**NEIGHBORHOOD HIGHLIGHTS**');
    
    if (highlightsIndex !== -1) {
      // Return only the part before the highlights
      return currentDescription.substring(0, highlightsIndex).trim();
    }
    
    // If no highlights section, return the whole description
    return currentDescription;
  };

  const removeContextFromDescription = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: getBaseDescription()
    }));
  };

  const isValidAddressForContext = (address: string): boolean => {
    // A simple check to ensure the address has at least street, city, and state
    return address.split(',').length >= 3;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Basic validation
    if (!formData.address || !formData.price || !formData.bedrooms || !formData.bathrooms) {
      setFormError("Please fill in all required fields: address, price, beds, and baths.");
      setIsSubmitting(false);
      return;
    }

    const listingDataForApi = {
      userId: user!.id,
      address: formData.address,
      price: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      squareFootage: formData.sqFt,
      yearBuilt: formData.yearBuilt,
      propertyType: formData.propertyType,
      keyFeatures: formData.keyFeatures,
      images: uploadedImages.map(url => ({ url, label: '' })), // New image format
      // No need to include fields that aren't in the core Listing type unless you extend it
    };

    try {
      if (isEditing && listingId) {
        await listingService.updateListing(listingId, listingDataForApi);
        navigate(`/listings/${listingId}`);
      } else {
        const newListing = await listingService.createListing(listingDataForApi);
        navigate(`/listings/${newListing.id}`);
      }
    } catch (err) {
      setFormError("Failed to save the listing. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-brand-text-primary text-center flex-grow">
            {isEditing ? "Edit Listing" : "Create New Listing"}
          </h1>
          <div className="w-24"></div> {/* Spacer to balance the back button */}
        </div>

        {formError && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-6 border border-red-500/20">
            {formError}
          </div>
        )}
  
        <div className="bg-brand-panel rounded-2xl shadow-2xl border border-brand-border">
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Address Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-brand-text-secondary flex items-center">
                  Listing Address
                  {isFetchingDetails && (
                    <span className="ml-2 flex items-center text-xs text-brand-text-tertiary">
                      <SparklesIcon className="h-4 w-4 mr-1 animate-pulse text-brand-accent"/>
                      Auto-filling details...
                    </span>
                  )}
                </label>
                <div className="flex-grow">
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    value={formData.address}
                  />
                </div>
                <p className="text-xs text-brand-text-tertiary">
                  Start typing to search for an address. Select one to auto-fill location and property details.
                </p>
              </div>

              {/* Listing Details Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-text-primary border-b border-brand-border pb-3">
                  Listing Details
                </h2>
                
                {/* First Row: Price - Bedrooms - Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  {/* Bathrooms */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      step="0.5"
                      value={formData.bathrooms || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.5"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* Second Row: Sq Ft - Year Built - Listing Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Square Feet */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Square Feet</label>
                    <input
                      type="number"
                      name="sqFt"
                      value={formData.sqFt || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 1800"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  {/* Year Built */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 1998"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  {/* Listing Type */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Listing Type</label>
                    <input
                      type="text"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      placeholder="e.g., Single Family"
                      className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Neighborhood Insights */}
              {isValidAddressForContext(insightsAddress) && (
                <NeighborhoodInsights 
                  address={insightsAddress}
                  listingPrice={formData.price}
                  onSectionAdd={(section, content) => handleContextSelection([{ 
                    id: section, 
                    title: section, 
                    category: section,
                    marketingCopy: content
                  } as ContextCard])}
                  onSectionRemove={(section) => handleContextSelection([])}
                />
              )}
              
              {/* Key Features / Description */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-brand-text-primary border-b border-brand-border pb-3">
                  Listing Description & Key Features
                </h2>
                <label className="block text-brand-text-secondary text-sm font-medium">
                  Describe the listing's unique features, amenities, and selling points
                </label>
                <textarea
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                  rows={8}
                  placeholder="Enter key features, listing description, and neighborhood highlights..."
                  className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-xs text-brand-text-tertiary">
                  Tip: Neighborhood insights added above will automatically be included in this description
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-text-primary border-b border-brand-border pb-3">
                  Listing Images
                </h2>
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Upload Images</label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-brand-border border-dashed rounded-lg bg-brand-input-bg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-brand-text-tertiary" />
                      <div className="flex text-sm text-brand-text-secondary">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-brand-background rounded-md font-medium text-brand-primary hover:text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary"
                        >
                          <span>Upload files</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-brand-text-tertiary">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-brand-text-primary mb-4">Image Previews</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                          <img 
                            src={file} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-brand-danger rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        <p className="text-sm text-brand-text-tertiary mt-2 text-center">Image {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-brand-border">
                <Button 
                  type="submit" 
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={!isSubmitting ? <Save className="h-5 w-5" /> : undefined}
                >
                  {isSubmitting ? "Saving..." : `${isEditing ? "Update" : "Save"} Listing`}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Data Source Footer */}
        <div className="mt-6 p-4 bg-brand-panel/50 border border-brand-border/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-brand-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-brand-text-tertiary leading-relaxed">
              <p className="mb-1">
                <strong>Data Sources:</strong> Information displayed comes from Google Places API, Google Custom Search API, 
                public real estate listings, and AI-enhanced insights when real data is limited.
              </p>
              <p>
                Listing details are auto-filled from available public listings and may not reflect current conditions. 
                Always verify information independently for accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    
