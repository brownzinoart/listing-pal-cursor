import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as listingService from '../../services/listingService';
import { Listing, AiDesignStyle } from '../../types';
import { AI_DESIGN_STYLES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import AiWorkflowPlaceholder from './AiWorkflowPlaceholder';
import SocialMediaMockup from './generation/SocialMediaMockups';
import Button from '../shared/Button';
import { ArrowLeftIcon, PencilSquareIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';

// Component to format key features with markdown-style rendering
const FormattedKeyFeatures: React.FC<{ content: string }> = ({ content }) => {
  try {
    // Safety check for content
    if (!content || typeof content !== 'string') {
      return (
        <div className="text-brand-text-tertiary italic text-sm break-words">
          No key features available
        </div>
      );
    }

    // Check if content contains neighborhood highlights (new format)
    if (content.includes('**NEIGHBORHOOD HIGHLIGHTS**')) {
      // Parse markdown-style content with error handling
      const sections = content.split('\n').filter(line => line && line.trim().length > 0);
      
      return (
        <div className="space-y-4 max-h-80 overflow-y-auto overflow-x-hidden">
          {sections.map((line, index) => {
            try {
              const trimmed = line.trim();
              
              // Bold headers like **NEIGHBORHOOD HIGHLIGHTS**
              if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                const headerText = trimmed.slice(2, -2);
                return (
                  <h4 key={`header-${index}`} className="font-bold text-brand-text-primary text-sm mt-4 first:mt-0 uppercase tracking-wide break-words">
                    {headerText}
                  </h4>
                );
              }
              
              // Bullet points
              if (trimmed.startsWith('•') && trimmed.length > 1) {
                const bulletText = trimmed.slice(1).trim();
                return (
                  <div key={`bullet-${index}`} className="flex items-start space-x-2 ml-4 overflow-hidden">
                    <span className="text-brand-secondary mt-1.5 text-xs flex-shrink-0">•</span>
                    <span className="text-sm text-brand-text-secondary leading-relaxed break-words">{bulletText}</span>
                  </div>
                );
              }
              
              // Regular text
              if (trimmed.length > 0) {
                return (
                  <p key={`text-${index}`} className="text-sm text-brand-text-secondary leading-relaxed break-words">
                    {trimmed}
                  </p>
                );
              }
              
              return null;
            } catch (lineError) {
              console.warn('Error rendering line:', line, lineError);
              return null;
            }
          }).filter(Boolean)}
        </div>
      );
    }
    
    // Legacy format - comma-separated features with error handling
    const features = content.split(',')
      .map(feat => feat?.trim())
      .filter(feat => feat && feat.length > 0);
      
    if (features.length === 0) {
      return (
        <div className="text-brand-text-tertiary italic text-sm break-words">
          No key features listed
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-start gap-1.5 max-h-60 overflow-y-auto overflow-x-hidden">
        {features.map((feature, index) => (
          <span key={`feature-${index}`} className="inline-block bg-brand-border/50 text-brand-text-secondary text-xs px-2 py-1 rounded-full break-words">
            {feature}
          </span>
        ))}
      </div>
    );
  } catch (error) {
    console.error('FormattedKeyFeatures error:', error);
    // Fallback to simple text display
    return (
      <div className="text-brand-text-secondary text-sm break-words">
        {content || 'No key features available'}
      </div>
    );
  }
};

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("No listing ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    listingService.getListingById(id)
      .then(data => {
        if (data && data.userId === user?.id) {
          setListing(data);
        } else if (data && data.userId !== user?.id) {
          setError("You do not have permission to view this listing's details.");
        } else {
          setError('Listing not found.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch listing details.');
      })
      .finally(() => setIsLoading(false));
  }, [id, user, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
     if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-text-primary text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-danger bg-red-900/20 p-4 rounded-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-text-primary text-lg">Loading listing...</p>
        </div>
      </div>
    );
  }

  const primaryImage = listing.images && listing.images.length > 0 ? listing.images[currentImageIndex].url : null;
  const hasMultipleImages = listing.images && listing.images.length > 1;

  return (
    <div className="min-h-screen bg-brand-background overflow-hidden">
      {/* Header */}
      <div className="bg-brand-background border-b border-brand-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                size="md"
              >
                Dashboard
              </Button>
            </div>
            <div className="text-center flex-1 min-w-0 overflow-hidden">
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary break-words">
                {listing.address.split(',')[0]}
              </h1>
              <p className="text-brand-text-secondary mt-1 break-words">
                {listing.address.split(',').slice(1).join(',').trim()}
              </p>
            </div>
            <div className="flex items-center justify-end flex-shrink-0">
              <Link to={`/listings/${listing.id}/edit`}>
                <Button 
                  variant="edit" 
                  leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                  size="lg"
                >
                  Edit Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {/* Property Gallery Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 overflow-hidden">
          
          {/* Left Column - Photo Gallery */}
          <div className="space-y-4 flex flex-col overflow-hidden">
            {/* Main Hero Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg overflow-hidden">
              {primaryImage ? (
                <>
                  <img 
                    src={primaryImage} 
                    alt={listing.address}
                    className="w-full h-full object-cover"
                  />
                  {hasMultipleImages && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 sm:p-2 rounded-full hover:bg-black/60 transition-all focus:outline-none">
                          <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 sm:p-2 rounded-full hover:bg-black/60 transition-all focus:outline-none">
                          <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <BuildingOfficeIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium break-words">Main Property Image</h3>
                    <p className="text-gray-300 text-sm mt-2 break-words">Upload photos to showcase this listing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Photos Grid */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 overflow-hidden">
                {listing.images.slice(1, 7).map((image, index) => (
                  <div key={image.id} className="relative aspect-square bg-brand-card rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                    <img 
                      src={image.url} 
                      alt={`${listing.address} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                      onClick={() => setCurrentImageIndex(index + 1)}
                    />
                    {index === 5 && listing.images.length > 7 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center overflow-hidden">
                        <span className="text-white font-semibold text-sm break-words">+{listing.images.length - 6}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Property Details */}
          <div className="space-y-6 overflow-hidden">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-4 sm:p-6 shadow-xl overflow-hidden">
              <div className="space-y-4 overflow-hidden">
                <div className="flex flex-col gap-4 overflow-hidden">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-text-primary mb-2 break-words">{listing.address.split(',')[0]}</h1>
                    <p className="text-brand-text-secondary text-sm sm:text-base lg:text-lg break-words">{listing.address.split(',').slice(1).join(',').trim()}</p>
                  </div>
                  <div className="text-left lg:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-secondary break-words">
                      {formatPrice(listing.price)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 border-t border-b border-brand-border overflow-hidden">
                  <div className="text-center min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-text-primary break-words">{listing.bedrooms}</div>
                    <div className="text-xs sm:text-sm text-brand-text-secondary break-words">Bedrooms</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-text-primary break-words">{listing.bathrooms}</div>
                    <div className="text-xs sm:text-sm text-brand-text-secondary break-words">Bathrooms</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-text-primary break-words">{listing.squareFootage.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-brand-text-secondary break-words">Sq Ft</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-text-primary break-words">{listing.yearBuilt}</div>
                    <div className="text-xs sm:text-sm text-brand-text-secondary break-words">Built</div>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="text-base sm:text-lg font-semibold text-brand-text-primary mb-3 break-words">Key Features</h3>
                  <div className="text-brand-text-secondary leading-relaxed min-h-[60px] overflow-hidden">
                    {listing.keyFeatures && listing.keyFeatures.trim().length > 0 ? (
                      <FormattedKeyFeatures content={listing.keyFeatures} />
                    ) : (
                      <div className="text-brand-text-tertiary italic text-sm break-words">
                        No key features listed. Add features to enhance your listing.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content Sections */}
        {(listing.generatedDescription || listing.generatedFacebookPost || listing.generatedInstagramCaption || listing.generatedXPost || listing.generatedEmail || (listing.generatedFlyers && listing.generatedFlyers.length > 0)) && (
          <div className="mb-8 overflow-hidden">
            {/* Property Description - Full Width */}
            {listing.generatedDescription && (
              <div className="mb-12 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 overflow-hidden">
                  <div className="mb-4 sm:mb-0 min-w-0 flex-1">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2 break-words">Property Description</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary">Generated</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/generate/description`} className="flex-shrink-0">
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Edit Description
                    </Button>
                  </Link>
                </div>
                <div className="bg-brand-panel border border-brand-border rounded-lg p-4 sm:p-6 shadow-xl overflow-hidden">
                  <p className="text-brand-text-secondary leading-relaxed whitespace-pre-line break-words">
                    {listing.generatedDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Social Media Posts - Responsive Grid */}
            {(listing.generatedFacebookPost || listing.generatedInstagramCaption || listing.generatedXPost) && (
              <div className="mb-12 overflow-hidden">
                <h3 className="text-2xl font-bold text-brand-text-primary mb-6 break-words">Social Media Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 overflow-hidden">
                  
                  {/* Facebook Post */}
                  {listing.generatedFacebookPost && (
                    <div className="space-y-4 overflow-hidden">
                      <div className="flex flex-col gap-3 overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-base sm:text-lg break-words">Facebook Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/facebook-post`} className="flex-shrink-0">
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <div className="overflow-hidden">
                        <SocialMediaMockup 
                          content={listing.generatedFacebookPost} 
                          listingImage={listing.images?.[0]?.url}
                          platform="facebook" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Instagram Post */}
                  {listing.generatedInstagramCaption && (
                    <div className="space-y-4 overflow-hidden">
                      <div className="flex flex-col gap-3 overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-base sm:text-lg break-words">Instagram Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/instagram-post`} className="flex-shrink-0">
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <div className="overflow-hidden">
                        <SocialMediaMockup 
                          content={listing.generatedInstagramCaption} 
                          listingImage={listing.images?.[0]?.url}
                          platform="instagram" 
                        />
                      </div>
                    </div>
                  )}

                  {/* X (Twitter) Post */}
                  {listing.generatedXPost && (
                    <div className="space-y-4 overflow-hidden">
                      <div className="flex flex-col gap-3 overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-base sm:text-lg break-words">X (Twitter) Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/x-post`} className="flex-shrink-0">
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <div className="overflow-hidden">
                        <SocialMediaMockup 
                          content={listing.generatedXPost} 
                          listingImage={listing.images?.[0]?.url}
                          platform="twitter" 
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Email Campaign - Full Width */}
            {listing.generatedEmail && (
              <div className="mb-12 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 overflow-hidden">
                  <div className="mb-4 sm:mb-0 min-w-0 flex-1">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2 break-words">Email Campaign</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary">Generated</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/generate/email`} className="flex-shrink-0">
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Edit Email
                    </Button>
                  </Link>
                </div>
                <div className="bg-brand-panel border border-brand-border rounded-lg p-4 sm:p-6 shadow-xl overflow-hidden">
                  <div className="text-brand-text-secondary leading-relaxed whitespace-pre-line break-words">
                    {listing.generatedEmail}
                  </div>
                </div>
              </div>
            )}

            {/* Generated Flyers - Responsive Grid */}
            {listing.generatedFlyers && listing.generatedFlyers.length > 0 && (
              <div className="mb-12 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 overflow-hidden">
                  <div className="mb-4 sm:mb-0 min-w-0 flex-1">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2 break-words">Marketing Flyers</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary break-words">Generated ({listing.generatedFlyers.length} flyer{listing.generatedFlyers.length > 1 ? 's' : ''})</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/generate/flyer`} className="flex-shrink-0">
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Create New Flyer
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-hidden">
                  {listing.generatedFlyers.map((flyer, index) => (
                    <div key={flyer.id} className="bg-brand-panel border border-brand-border rounded-lg overflow-hidden shadow-xl">
                      <div className="relative overflow-hidden">
                        <img 
                          src={flyer.imageUrl} 
                          alt={`Marketing Flyer ${index + 1}`} 
                          className="w-full aspect-[3/4] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            // Create a download link
                            const link = document.createElement('a');
                            link.href = flyer.imageUrl;
                            link.download = `flyer-${listing.address.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${index + 1}.png`;
                            link.click();
                          }}
                        />
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-brand-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                          Template {index + 1}
                        </div>
                        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          Click to Download
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-2 overflow-hidden">
                          <h4 className="font-semibold text-brand-text-primary text-sm sm:text-base break-words">Flyer {index + 1}</h4>
                          <span className="text-xs text-brand-text-tertiary break-words">
                            {new Date(flyer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-3 overflow-hidden">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: flyer.customization.primaryColor }}></div>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: flyer.customization.secondaryColor }}></div>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: flyer.customization.accentColor }}></div>
                          <span className="text-xs text-brand-text-tertiary break-words">Color Scheme</span>
                        </div>
                        {flyer.customization.customText && (
                          <p className="text-sm text-brand-text-secondary italic break-words">"{flyer.customization.customText}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interior Redesigns - Full Width */}
            {listing.generatedRoomDesigns && listing.generatedRoomDesigns.length > 0 && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2">Interior Reimagined</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary">Generated ({listing.generatedRoomDesigns.length} design{listing.generatedRoomDesigns.length > 1 ? 's' : ''})</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/interior-reimagined`}>
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Create New Design
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listing.generatedRoomDesigns.map((design, index) => {
                    const styleName = AI_DESIGN_STYLES.find(s => s.id === design.styleId)?.name || 'Unknown Style';
                    return (
                      <div key={index} className="bg-brand-panel border border-brand-border rounded-lg overflow-hidden shadow-xl">
                        <div className="relative">
                          <img 
                            src={design.redesignedImageUrl} 
                            alt={`Room redesign ${index + 1}`} 
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-brand-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                            {styleName}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-brand-text-primary">Design {index + 1}</h4>
                            <span className="text-xs text-brand-text-tertiary">
                              {new Date(design.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          {design.prompt && (
                            <p className="text-sm text-brand-text-secondary mt-2 line-clamp-2">{design.prompt}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Generation Tools */}
        <div className="mb-8">
          <AiWorkflowPlaceholder listing={listing} />
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
