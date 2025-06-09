import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftIcon as ArrowLeft, DocumentIcon as Save, ArrowUpTrayIcon as Upload, XMarkIcon as X } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import * as listingService from "../../services/listingService";
import Button from "../shared/Button";
import AddressAutocomplete from "../shared/AddressAutocomplete";
import { LocationContextWidget } from './LocationContextWidget';
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
  const [selectedContextCards, setSelectedContextCards] = useState<ContextCard[]>([]);
  const [contextInsightsAdded, setContextInsightsAdded] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

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

  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    console.log('Selected address:', address, 'Latitude:', lat || 0, 'Longitude:', lng || 0);
    
    // Parse the address to populate individual fields
    const addressParts = address.split(',').map(part => part.trim());
    
    setFormData(prev => ({
      ...prev,
      address: address,
      latitude: lat || 0,
      longitude: lng || 0,
      streetAddress: addressParts[0] || "",
      city: addressParts[1] || "",
      state: addressParts[2] || "",
      zipCode: addressParts[3] || ""
    }));
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
    return titles[category] || category.toUpperCase();
  };

  const getBaseDescription = (): string => {
    // Remove any existing context section from description
    const currentDescription = formData.keyFeatures || '';
    const contextStartIndex = currentDescription.indexOf('**NEIGHBORHOOD HIGHLIGHTS**');
    
    if (contextStartIndex === -1) {
      return currentDescription;
    }
    
    return currentDescription.substring(0, contextStartIndex).trim();
  };

  const removeContextFromDescription = () => {
    const baseDescription = getBaseDescription();
    setFormData(prev => ({
      ...prev,
      keyFeatures: baseDescription
    }));
  };

  const isValidAddressForContext = (address: string): boolean => {
    // Check if address is substantial enough to fetch context
    return address.length > 10 && 
           address.includes(',');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError("You must be logged in to save a listing.");
      return;
    }
    
    setFormError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.address.trim()) {
      setFormError("Property address is required. Please select an address from the autocomplete suggestions.");
      setIsSubmitting(false);
      return;
    }
    if (formData.price <= 0 || formData.bedrooms <= 0 || formData.bathrooms <= 0 || formData.sqFt <= 0) {
      setFormError("Please enter valid values for price, bedrooms, bathrooms, and square feet.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the selected address from Google Places
      const fullAddress = formData.address || [formData.streetAddress, formData.city, formData.state, formData.zipCode]
        .filter(part => part.trim())
        .join(', ');
        
             const listingData = {
         address: fullAddress,
         bedrooms: formData.bedrooms,
         bathrooms: formData.bathrooms,
         squareFootage: formData.sqFt,
         yearBuilt: formData.yearBuilt,
         price: formData.price,
         keyFeatures: formData.keyFeatures,
         images: uploadedImages.map((url, index) => ({ url, name: `Image ${index + 1}` })),
         userId: user.id,
         // 10. SAVE HANDLING - Track context usage
         contextInsights: {
           used: contextInsightsAdded,
           selectedCards: selectedContextCards.map(card => ({
             id: card.id,
             title: card.title,
             category: card.category
           })),
           addedAt: new Date().toISOString()
         }
       };

      let listing;
      if (isEditing && listingId) {
        listing = await listingService.updateListing(listingId, listingData);
      } else {
        listing = await listingService.createListing(listingData);
      }

      if (listing && typeof listing === 'object' && 'id' in listing) {
        setTimeout(() => {
          navigate(`/listings/${listing.id}`);
        }, 1500);
      }
    } catch (error) {
      setFormError(`Failed to ${isEditing ? 'update' : 'create'} listing. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-text-primary text-lg">Loading listing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            to={isEditing && listingId ? `/listings/${listingId}` : '/dashboard'}
            className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back to {isEditing ? "Property Details" : "Dashboard"}
          </Link>
          <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h1>
          <p className="text-brand-text-secondary">
            {isEditing ? "Update your property details" : "Enter the property details to create a new listing"}
          </p>
        </div>

        <div className="bg-brand-panel rounded-2xl shadow-2xl border border-brand-border">
          <div className="p-8 border-b border-brand-border">
            <h2 className="text-2xl font-semibold text-brand-text-primary">Property Information</h2>
          </div>
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {formError && (
                <div className="mb-6 text-sm text-brand-danger bg-brand-danger/20 p-4 rounded-xl border border-brand-danger/30">
                  {formError}
                </div>
              )}

              {/* Address Search */}
              <div className="space-y-6">
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Property Address</label>
                  <AddressAutocomplete
                    value={formData.address}
                    placeholder="Start typing the property address..."
                    onAddressSelect={handleAddressSelect}
                    className="bg-brand-input-bg border-0 text-brand-text-primary placeholder-brand-text-tertiary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Property Details Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Price ($)</label>
                  <input 
                    name="price"
                    type="number" 
                    placeholder="e.g. 750000" 
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    className="w-full bg-brand-input-bg border-0 text-brand-text-primary placeholder-brand-text-tertiary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  />
                  <p className="text-xs text-brand-text-tertiary mt-2">Enter the listing price in dollars</p>
                </div>
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Bedrooms</label>
                  <div className="relative">
                    <select 
                      name="bedrooms"
                      value={formData.bedrooms || ''}
                      onChange={(e) => handleSelectChange(e.target.name, e.target.value)}
                      className="w-full bg-brand-input-bg border-0 text-brand-text-primary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="" className="text-brand-text-tertiary">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6+</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-brand-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Bathrooms</label>
                  <div className="relative">
                    <select 
                      name="bathrooms"
                      value={formData.bathrooms || ''}
                      onChange={(e) => handleSelectChange(e.target.name, e.target.value)}
                      className="w-full bg-brand-input-bg border-0 text-brand-text-primary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="" className="text-brand-text-tertiary">Select</option>
                      <option value="1">1</option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                      <option value="2.5">2.5</option>
                      <option value="3">3</option>
                      <option value="3.5">3.5</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-brand-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Square Feet</label>
                  <input 
                    name="sqFt"
                    type="number" 
                    placeholder="e.g. 2500" 
                    value={formData.sqFt || ''}
                    onChange={handleInputChange}
                    className="w-full bg-brand-input-bg border-0 text-brand-text-primary placeholder-brand-text-tertiary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  />
                  <p className="text-xs text-brand-text-tertiary mt-2">Enter the total square footage</p>
                </div>
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Year Built</label>
                  <input 
                    name="yearBuilt"
                    type="number" 
                    placeholder="2025" 
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    className="w-full bg-brand-input-bg border-0 text-brand-text-primary placeholder-brand-text-tertiary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Property Type</label>
                  <div className="relative">
                    <select 
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={(e) => handleSelectChange(e.target.name, e.target.value)}
                      className="w-full bg-brand-input-bg border-0 text-brand-text-primary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="" className="text-brand-text-tertiary">Select Type</option>
                      <option value="Single Family">Single Family</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Condo">Condo</option>
                      <option value="Multi-Family">Multi-Family</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-brand-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. JSX - Location Context Widget Integration - Positioned Under Property Details */}
              {isValidAddressForContext(formData.address) && (
                <div className="relative w-full overflow-hidden rounded-xl border border-brand-border bg-brand-panel p-6 my-8">
                  {/* Visual separator */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-brand-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-brand-panel text-brand-text-secondary font-medium">✨ Enhance with neighborhood insights</span>
                    </div>
                  </div>
                  
                  {/* Isolated container for Location Context Widget */}
                  <div className="relative w-full overflow-hidden">
                    <LocationContextWidget
                      address={formData.address}
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onContextSelect={handleContextSelection}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Selected count feedback - branded */}
                  {selectedContextCards.length > 0 && (
                    <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/30 rounded-xl p-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-brand-text-primary font-medium">
                          {selectedContextCards.length} neighborhood insight{selectedContextCards.length === 1 ? '' : 's'} added to listing
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error display - branded */}
                  {contextError && (
                    <div className="bg-brand-card border border-brand-danger/30 rounded-xl p-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-brand-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-brand-text-primary text-sm">{contextError}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Features with Context Preview */}
              <div className="space-y-2 mt-8">
                <label htmlFor="keyFeatures" className="block text-brand-text-secondary text-sm font-medium">
                  Key Features
                  {contextInsightsAdded && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      + Neighborhood insights
                    </span>
                  )}
                </label>
                <textarea 
                  id="keyFeatures"
                  name="keyFeatures"
                  placeholder="Updated kitchen, hardwood floors, two-car garage, swimming pool..." 
                  className="w-full bg-brand-input-bg border-0 text-brand-text-primary placeholder-brand-text-tertiary rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 min-h-[120px] resize-none"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                />
                
                {/* Character count with context awareness */}
                <div className="flex justify-between text-xs text-brand-text-tertiary">
                  <span>
                    {contextInsightsAdded ? 'Base description + neighborhood insights' : 'Property description'}
                  </span>
                  <span>{formData.keyFeatures.length} characters</span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block text-brand-text-secondary text-sm font-medium mb-3">Property Images</label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-brand-border/50 border-dashed rounded-xl cursor-pointer bg-brand-input-bg/50 hover:bg-brand-input-bg/70 transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-4 text-brand-text-tertiary" />
                          <p className="mb-2 text-base text-brand-text-secondary">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-sm text-brand-text-tertiary">PNG, JPG or JPEG (MAX. 10MB)</p>
                        </div>
                        <input 
                          id="image-upload" 
                          type="file" 
                          className="hidden" 
                          multiple 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-brand-card rounded-xl overflow-hidden">
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
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-brand-border">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleBack}
                >
                  Cancel
                </Button>
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
      </div>
    </div>
  );
}
    