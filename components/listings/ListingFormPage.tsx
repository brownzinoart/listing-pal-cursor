import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftIcon as ArrowLeft, DocumentIcon as Save, ArrowUpTrayIcon as Upload, XMarkIcon as X, SparklesIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import * as listingService from "../../services/listingService";
import Button from "../shared/Button";
import AddressAutocomplete from "../shared/AddressAutocomplete";
import NeighborhoodInsights from '../shared/NeighborhoodInsights';
import { ContextCard } from '../../types/locationContext';

// Helper function to extract the first number from a string (e.g., "3-4" -> 3, "1500 sq ft" -> 1500)
const parseNumericValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  // This regex looks for the first sequence of digits, allowing for a decimal point.
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

// Helper function to parse price strings like "$1.5M", "550k", "$1,200,000"
const parsePrice = (price: any): number => {
    if (typeof price === 'number') return price;
    if (typeof price !== 'string') return 0;

    // Remove common currency symbols, commas, and take the first part of a range
    const sanitized = price.split('-')[0].trim().replace(/[\s$,]/g, '').toLowerCase();
    
    // Match the number and any multiplier (k, m)
    const match = sanitized.match(/(\d+(\.\d+)?)(\w)?/);
    if (!match) return 0;

    let num = parseFloat(match[1]);
    const multiplier = match[3];

    if (multiplier === 'm') {
        num *= 1000000;
    } else if (multiplier === 'k') {
        num *= 1000;
    }

    return Math.round(num);
};

// Smart listing type detection based on price and other factors
const detectListingType = (price: number, propertyType?: string): string => {
  if (price <= 0) return '';
  
  // Very clear indicators
  if (price < 5000) return 'rental';      // Almost certainly monthly rent
  if (price >= 100000) return 'sale';     // Almost certainly sale price
  
  // Moderate confidence ranges
  if (price < 10000) return 'rental';     // Likely monthly rent
  if (price >= 50000) return 'sale';      // Likely sale price
  
  // Ambiguous range (10k-50k) - could be either
  // Consider property type if available
  if (propertyType) {
    const lowerPropType = propertyType.toLowerCase();
    if (lowerPropType.includes('condo') || lowerPropType.includes('apartment')) {
      return price < 30000 ? 'rental' : 'sale';
    }
  }
  
  return ''; // Let user decide
};

// Property type options
const PROPERTY_TYPE_OPTIONS = [
  'Single Family Home',
  'Townhouse',
  'Condo/Apartment',
  'Multi-Family',
  'Mobile Home',
  'Land/Lot',
  'Commercial',
  'Other'
];

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
  listingType: string; // 'sale' or 'rental'
  keyFeatures: string;
  imageUrls: string[];
};

// Enhanced Dropdown Component
const EnhancedDropdown: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  autoDetected?: boolean;
  required?: boolean;
  needsInput?: boolean;
  onNeedsInputChange?: (needs: boolean) => void;
  disabled?: boolean;
  disabledPlaceholder?: string;
}> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  autoDetected = false,
  required = false,
  needsInput = false,
  onNeedsInputChange,
  disabled = false,
  disabledPlaceholder = "Enter address first"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(needsInput);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (optionValue === '__custom__') {
      setShowCustomInput(true);
      setIsOpen(false);
      onNeedsInputChange?.(true);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setShowCustomInput(false);
      onNeedsInputChange?.(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setShowCustomInput(false);
      onNeedsInputChange?.(false);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = disabled 
    ? disabledPlaceholder 
    : (selectedOption?.label || value || placeholder);

  return (
    <div className="relative" ref={dropdownRef}>
             <label className="block text-brand-text-secondary text-sm font-medium mb-3">
         {label}
         {required && <span className="text-red-500 ml-1">*</span>}
       </label>
      
      {showCustomInput ? (
        <div className="space-y-2">
                     <input
             type="text"
             value={customValue}
             onChange={(e) => setCustomValue(e.target.value)}
             placeholder={`Enter custom ${label.toLowerCase()}...`}
             className="w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-3 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
             autoFocus
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 e.preventDefault();
                 handleCustomSubmit();
               } else if (e.key === 'Escape') {
                 setShowCustomInput(false);
                 setCustomValue('');
                 onNeedsInputChange?.(false);
               }
             }}
           />
           <div className="flex gap-2">
             <button
               type="button"
               onClick={handleCustomSubmit}
               className="px-3 py-1 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-primary/90 transition-colors"
             >
               Add
             </button>
             <button
               type="button"
               onClick={() => {
                 setShowCustomInput(false);
                 setCustomValue('');
                 onNeedsInputChange?.(false);
               }}
               className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
             >
               Cancel
             </button>
           </div>
        </div>
      ) : (
                 <div className="relative">
           <button
             type="button"
             onClick={() => !disabled && setIsOpen(!isOpen)}
             disabled={disabled}
             className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-left text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${
               disabled 
                 ? 'cursor-not-allowed opacity-50' 
                 : ''
             } ${
               !value && !disabled ? 'text-brand-text-tertiary' : ''
             }`}
           >
            <div className="flex items-center justify-between">
              <span className="truncate">{displayValue}</span>
                             <ChevronDownIcon className={`h-4 w-4 text-brand-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'opacity-50' : ''}`} />
            </div>
          </button>
          
                     {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-brand-border rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                                 <button
                   key={option.value}
                   type="button"
                   onClick={() => handleSelect(option.value)}
                   className={`w-full px-4 py-2 text-left text-gray-800 hover:bg-brand-accent/10 transition-colors duration-150 ${
                     value === option.value ? 'bg-brand-accent/20 text-brand-accent font-medium' : 'text-brand-text-primary'
                   }`}
                 >
                   {option.label}
                 </button>
              ))}
                             <button
                 type="button"
                 onClick={() => handleSelect('__custom__')}
                 className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-600 border-t border-gray-200 font-medium"
               >
                 + Add custom option
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ListingFormPage() {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const DEMO_ADDRESS = "123 Demo Dr., Demo, DM 12345";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [selectedContextCards, setSelectedContextCards] = useState<ContextCard[]>([]);
  const [contextInsightsAdded, setContextInsightsAdded] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [insightsAddress, setInsightsAddress] = useState('');
  const [priceSource, setPriceSource] = useState<string>('');
  const [propertyTypeNeedsInput, setPropertyTypeNeedsInput] = useState(false);
  const [listingTypeAutoDetected, setListingTypeAutoDetected] = useState(false);
  const [hasAttemptedAutoFill, setHasAttemptedAutoFill] = useState(false);

  // State for neighborhood insights
  const [insightsAddedSections, setInsightsAddedSections] = useState<string[]>([]);

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
    yearBuilt: 0,
    propertyType: "",
    listingType: "",
    keyFeatures: "",
    imageUrls: [],
  });

  // Auto-detect listing type when price changes
  useEffect(() => {
    if (formData.price > 0 && !formData.listingType) {
      const detectedType = detectListingType(formData.price, formData.propertyType);
      if (detectedType) {
        setFormData(prev => ({ ...prev, listingType: detectedType }));
        setListingTypeAutoDetected(true);
      }
    }
  }, [formData.price, formData.propertyType, formData.listingType]);

  // Check if property type needs input (only show after we've tried to auto-fill)
  useEffect(() => {
    if (!formData.propertyType && formData.address && priceSource) {
      // Only suggest manual input if we've tried auto-filling but property type is still missing
      setPropertyTypeNeedsInput(true);
    } else if (formData.propertyType) {
      setPropertyTypeNeedsInput(false);
    }
  }, [formData.propertyType, formData.address, priceSource]);

  useEffect(() => {
    if (isEditing && listingId) {
      setIsFetching(true);
      // Set this immediately for editing mode - we don't want auto-fill behavior
      setHasAttemptedAutoFill(true);
      
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
              propertyType: listing.propertyType || "Single Family Home", // Use proper default
              listingType: listing.listingType || "sale",
              keyFeatures: listing.keyFeatures,
              imageUrls: listing.images?.map(img => img.url) || [],
            });
            setInsightsAddress(listing.address);
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
    
    // Check if this is a demo address and auto-fill property details
    const isDemoAddress = /123\s+demo\s+dr\.?.*demo.*dm\s+12345/i.test(address.toLowerCase());
    
    if (isDemoAddress) {
      console.log('🎭 Demo address detected - auto-filling property details');
      const demoPropertyData = {
        ...addressFormData,
        bedrooms: 4,
        bathrooms: 3.5,
        sqFt: 2850,
        yearBuilt: 2018,
        propertyType: 'Single Family Home',
        listingType: '' // Let this be determined by price input
      };
      
      setFormData(demoPropertyData);
      setInsightsAddress(address);
      setPriceSource(''); // No auto-filled price
      setHasAttemptedAutoFill(true);
      setIsFetchingDetails(false);
      return;
    }
    
    setFormData(addressFormData);
    setInsightsAddress(address);

    // Now, automatically fetch details for real addresses
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
        console.log('  - Estimated Value from API:', details.estimatedValue, '→ Parsed:', parsePrice(details.estimatedValue));
        console.log('  - Property Type from API:', details.propertyType);
        console.log('  - Bedrooms from API:', details.bedrooms, '→ Parsed:', parseNumericValue(details.bedrooms));
        console.log('  - Bathrooms from API:', details.bathrooms, '→ Parsed:', parseNumericValue(details.bathrooms));
        console.log('  - Square Footage from API:', details.squareFootage, '→ Parsed:', parseNumericValue(details.squareFootage));
        console.log('  - Year Built from API:', details.yearBuilt, '→ Parsed:', parseNumericValue(details.yearBuilt));
        
        // Use the addressFormData (which has the address) as base, not the old formData
        const finalFormData = {
          ...addressFormData,  // This preserves the address and location data
          price: parsePrice(details.estimatedValue) || addressFormData.price,
          bedrooms: parseNumericValue(details.bedrooms) || addressFormData.bedrooms,
          bathrooms: parseNumericValue(details.bathrooms) || addressFormData.bathrooms,
          sqFt: parseNumericValue(details.squareFootage) || addressFormData.sqFt,
          yearBuilt: parseNumericValue(details.yearBuilt) || addressFormData.yearBuilt,
          propertyType: details.propertyType || addressFormData.propertyType,
          listingType: details.listingType || addressFormData.listingType,
        };
        
        // Set price source info for display
        if (details._priceSource) {
          setPriceSource(details._priceSource);
        } else if (finalFormData.price > 0) {
          setPriceSource('Auto-filled from property data');
        }
        
        console.log('📝 Address form data:', addressFormData);
        console.log('📝 Final combined form data:', finalFormData);
        
        setFormData(finalFormData);
        setHasAttemptedAutoFill(true);
      } else {
        console.log('⚠️ No details returned from API');
        setHasAttemptedAutoFill(true);
      }
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.error('❌ Auto-fill error details:');
      console.error('  - Error message:', error.message || 'Unknown error');
      console.error('  - Error object:', error);
      console.error('  - Error response:', error.response?.data);
      setFormError(`Auto-fill failed: ${error.message || 'Could not retrieve all property details.'}`);
      console.log("🔄 Auto-fill attempt completed with limited data - check logs above for details");
      setHasAttemptedAutoFill(true);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // Update form data
    let updatedFormData = { ...formData, [name]: parsedValue };
    
    // Smart listing type detection based on price
    if (name === 'price' && typeof parsedValue === 'number' && parsedValue > 0) {
      const price = parsedValue;
      // Auto-detect listing type if not manually set or if price changed significantly
      if (!formData.listingType || listingTypeAutoDetected) {
        const detectedType = detectListingType(price, formData.propertyType);
        if (detectedType) {
          updatedFormData.listingType = detectedType;
          setListingTypeAutoDetected(true);
        }
      }
    }
    
    setFormData(updatedFormData);
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: string, value: string) => {
    const updatedFormData = { ...formData, [name]: value };
    
    // If listing type is manually selected, turn off auto-detection
    if (name === 'listingType') {
      setListingTypeAutoDetected(false);
    }
    
    // If property type is selected and it affects listing type detection
    if (name === 'propertyType' && formData.price > 0 && listingTypeAutoDetected) {
      const detectedType = detectListingType(formData.price, value);
      if (detectedType && detectedType !== formData.listingType) {
        updatedFormData.listingType = detectedType;
      }
    }
    
    setFormData(updatedFormData);
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

  const handleGenerateAllContent = async () => {
    // Check if this is the demo address first
    if (formData.address.trim().toLowerCase() !== DEMO_ADDRESS.toLowerCase()) {
      setFormError(`Content generation is currently only available for the demo address: ${DEMO_ADDRESS}`);
      return;
    }

    // First validate the form has required data
    if (!formData.address || !formData.price || formData.price <= 0 || !formData.bedrooms || formData.bedrooms <= 0 || !formData.bathrooms || formData.bathrooms <= 0) {
      const missingFields = [];
      if (!formData.address) missingFields.push('address');
      if (!formData.price || formData.price <= 0) missingFields.push('asking price');
      if (!formData.bedrooms || formData.bedrooms <= 0) missingFields.push('bedrooms');
      if (!formData.bathrooms || formData.bathrooms <= 0) missingFields.push('bathrooms');
      
      setFormError(`Please fill in the following required fields before generating content: ${missingFields.join(', ')}.`);
      return;
    }

    // First save the listing, then navigate to generation page
    if (!user || !user.id) {
      setFormError("Please log in to generate content.");
      return;
    }

    try {
      // Prepare listing data
      const finalPropertyType = formData.propertyType || 'Single Family Home';
      const finalListingType = formData.listingType || 'sale';

      const listingDataForApi = {
        userId: user.id,
        address: formData.address,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        squareFootage: Number(formData.sqFt) || 0,
        yearBuilt: Number(formData.yearBuilt) || 0,
        propertyType: finalPropertyType,
        listingType: finalListingType,
        keyFeatures: formData.keyFeatures || '',
        images: uploadedImages.map(url => ({ url, label: '' })),
        neighborhoodSections: insightsAddedSections || [],
      };

      let result;
      if (isEditing && listingId) {
        result = await listingService.updateListing(listingId, listingDataForApi);
        // Navigate to generation page with existing listing ID
        navigate(`/listings/${listingId}/preselect-batch`);
      } else {
        result = await listingService.createListing(listingDataForApi);
        // Navigate to preselect batch page with new listing ID
        navigate(`/listings/${result.id}/preselect-batch`);
      }
    } catch (err) {
      console.error('❌ Error saving listing before generation:', err);
      setFormError(`Failed to save listing: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Check if user is available
    if (!user || !user.id) {
      setFormError("Please log in to save listings.");
      setIsSubmitting(false);
      return;
    }

    // Basic validation - fix potential validation issues
    if (!formData.address || !formData.price || formData.price <= 0 || !formData.bedrooms || formData.bedrooms <= 0 || !formData.bathrooms || formData.bathrooms <= 0) {
      
      // Create a more specific error message
      const missingFields = [];
      if (!formData.address) missingFields.push('address');
      if (!formData.price || formData.price <= 0) missingFields.push('asking price (must be greater than $0)');
      if (!formData.bedrooms || formData.bedrooms <= 0) missingFields.push('bedrooms (must be greater than 0)');
      if (!formData.bathrooms || formData.bathrooms <= 0) missingFields.push('bathrooms (must be greater than 0)');
      
      setFormError(`Please fill in the following required fields: ${missingFields.join(', ')}.`);
      setIsSubmitting(false);
      return;
    }

    // Ensure propertyType and listingType have defaults
    const finalPropertyType = formData.propertyType || 'Single Family Home';
    const finalListingType = formData.listingType || 'sale';

    const listingDataForApi = {
      userId: user.id,
      address: formData.address,
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      squareFootage: Number(formData.sqFt) || 0,
      yearBuilt: Number(formData.yearBuilt) || 0,
      propertyType: finalPropertyType,
      listingType: finalListingType,
      keyFeatures: formData.keyFeatures || '',
      images: uploadedImages.map(url => ({ url, label: '' })),
      neighborhoodSections: insightsAddedSections || [],
    };

    console.log('📤 Sending to API:', listingDataForApi);

    try {
      let result;
      if (isEditing && listingId) {
        console.log('✏️ Updating existing listing...');
        result = await listingService.updateListing(listingId, listingDataForApi);
        console.log('✅ Update successful:', result);
        navigate(`/listings/${listingId}`);
      } else {
        console.log('➕ Creating new listing...');
        result = await listingService.createListing(listingDataForApi);
        console.log('✅ Creation successful:', result);
        navigate(`/listings/${result.id}`);
      }
    } catch (err) {
      console.error('❌ Form submission error:', err);
      setFormError(`Failed to save the listing: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to highlight fields missing after auto
  const isFieldMissing = (field: keyof FormData) => {
    const val: any = formData[field];
    if (!hasAttemptedAutoFill) return false; // highlight only after auto-fill attempt
    return val === null || val === undefined || val === '' || val === 0;
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
              {/* Agent Inputs Section */}
              <div className="space-y-6">
                <div className="border-b border-brand-border pb-4">
                  <h2 className="text-2xl font-bold text-brand-text-primary mb-2">Agent Inputs</h2>
                  <p className="text-sm text-brand-text-tertiary">Primary information required from agent</p>
                </div>
                
                {/* Address (2 columns) + Price (1 column) Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Address - Takes 2 columns */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-brand-text-secondary flex items-center">
                      Property Address
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
                      Start typing to search for an address. Property details will auto-fill below.
                    </p>
                  </div>

                  {/* Price - Takes 1 column */}
                  <div className="space-y-2">
                    <label className="block text-brand-text-secondary text-sm font-medium">
                      Asking Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                      className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('price') ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-brand-text-tertiary">
                      Set your listing price
                    </p>
                  </div>
                </div>
              </div>

              {/* Auto-Filled Property Details Section */}
              <div className="space-y-6">
                <div className="border-b border-brand-border pb-4">
                  <h2 className="text-2xl font-bold text-brand-text-primary mb-2 flex items-center">
                    Property Details
                    {!isEditing && (
                      <span className="ml-3 text-sm font-normal text-brand-text-tertiary flex items-center">
                        <SparklesIcon className="h-4 w-4 mr-1 text-brand-accent"/>
                        Auto-filled from address
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-brand-text-tertiary">
                    {isEditing ? 'Review and edit the property information' : 'Review and edit the auto-filled property information'}
                  </p>
                </div>
                
                {/* First Row: Bedrooms - Bathrooms - Square Feet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
                      className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('bedrooms') ? 'border-red-500' : ''}`}
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
                      className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('bathrooms') ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {/* Square Feet */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Square Feet</label>
                    <input
                      type="number"
                      name="sqFt"
                      value={formData.sqFt || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 1800"
                      className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('sqFt') ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>

                {/* Second Row: Year Built - Property Type - Listing Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Year Built */}
                  <div>
                    <label className="block text-brand-text-secondary text-sm font-medium mb-3">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 1998"
                      className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('yearBuilt') ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {/* Property Type */}
                  <EnhancedDropdown
                    label="Property Type"
                    value={formData.propertyType}
                    onChange={(value) => handleDropdownChange('propertyType', value)}
                    options={PROPERTY_TYPE_OPTIONS.map(type => ({ value: type, label: type }))}
                    placeholder="Select property type"
                    needsInput={propertyTypeNeedsInput}
                    onNeedsInputChange={setPropertyTypeNeedsInput}
                    disabled={!hasAttemptedAutoFill}
                    disabledPlaceholder="Enter address to auto-fill"
                  />
                  
                  {/* Listing Type */}
                  <EnhancedDropdown
                    label="Listing Type"
                    value={formData.listingType}
                    onChange={(value) => handleDropdownChange('listingType', value)}
                    options={[
                      { value: 'sale', label: 'For Sale' },
                      { value: 'rental', label: 'For Rent' }
                    ]}
                    placeholder="Select listing type"
                    autoDetected={listingTypeAutoDetected}
                    disabled={!hasAttemptedAutoFill}
                    disabledPlaceholder="Enter address and price first"
                  />
                </div>

                {/* Data Source Indicator */}
                {priceSource && !isEditing && (
                  <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-lg p-4">
                    <div className="flex items-center text-sm">
                      <SparklesIcon className="h-4 w-4 mr-2 text-brand-accent"/>
                      <span className="text-brand-text-secondary">
                        Property data auto-filled from: <span className="font-medium text-brand-accent">{priceSource}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Neighborhood Insights */}
              {isValidAddressForContext(insightsAddress) && formData.latitude && formData.longitude && (
                <NeighborhoodInsights 
                  address={insightsAddress}
                  lat={formData.latitude}
                  lng={formData.longitude}
                  listingPrice={formData.price}
                  listingType={formData.listingType}
                  addedSections={insightsAddedSections}
                  onSectionToggle={(sections) => {
                    setInsightsAddedSections(sections);
                  }}
                />
              )}
              
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
                          className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand-primary hover:text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary"
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

              {/* Additional Features */}
              <div className="space-y-3 mt-8">
                <h2 className="text-2xl font-bold text-brand-text-primary border-b border-brand-border pb-3">
                  Additional Features
                </h2>
                <label className="block text-brand-text-secondary text-sm font-medium">
                  Anything else we should know? Add details that will help us generate richer marketing content for this listing.
                </label>
                <textarea
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                  rows={8}
                  placeholder="Add any additional features, notes, or context..."
                  className={`w-full bg-brand-input-bg border-brand-border rounded-lg px-4 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary ${isFieldMissing('keyFeatures') ? 'border-red-500' : ''}`}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-brand-border">
                <Button 
                  type="button"
                  variant="secondary"
                  leftIcon={<SparklesIcon className="h-5 w-5" />}
                  className={
                    formData.address.trim().toLowerCase() === DEMO_ADDRESS.toLowerCase()
                      ? "bg-gradient-to-r from-brand-secondary to-emerald-600 hover:from-emerald-600 hover:to-brand-secondary text-white font-semibold shadow-lg transition-all duration-300"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-50"
                  }
                  onClick={handleGenerateAllContent}
                  disabled={formData.address.trim().toLowerCase() !== DEMO_ADDRESS.toLowerCase()}
                  title={
                    formData.address.trim().toLowerCase() !== DEMO_ADDRESS.toLowerCase()
                      ? `Content generation is only available for demo address: ${DEMO_ADDRESS}`
                      : "Generate all marketing content"
                  }
                >
                  Generate All Content
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
    
