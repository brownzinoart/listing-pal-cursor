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
    <div className="min-h-screen bg-brand-background">
      {/* Header */}
      <div className="bg-brand-background border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                size="md"
              >
                Dashboard
              </Button>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">
                {listing.address.split(',')[0]}
              </h1>
              <p className="text-brand-text-secondary mt-1">
                {listing.address.split(',').slice(1).join(',').trim()}
              </p>
            </div>
            <div className="flex items-center justify-end">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Gallery Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 lg:h-[500px]">
          
          {/* Left Column - Photo Gallery */}
          <div className="space-y-4 flex flex-col h-full">
            {/* Main Hero Image */}
            <div className="relative flex-1 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg overflow-hidden">
              {primaryImage ? (
                <>
                  <img 
                    src={primaryImage} 
                    alt={listing.address}
                    className="w-full h-full object-cover"
                  />
                  {hasMultipleImages && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all focus:outline-none">
                          <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all focus:outline-none">
                          <ChevronRightIcon className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <BuildingOfficeIcon className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-medium">Main Property Image</h3>
                    <p className="text-gray-300 text-sm mt-2">Upload photos to showcase this listing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Photos Grid */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {listing.images.slice(1, 7).map((image, index) => (
                  <div key={image.id} className="relative h-24 bg-brand-card rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                    <img 
                      src={image.url} 
                      alt={`${listing.address} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                      onClick={() => setCurrentImageIndex(index + 1)}
                    />
                    {index === 5 && listing.images.length > 7 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold">+{listing.images.length - 6}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Property Details */}
          <div className="space-y-6 h-fit">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 shadow-xl h-full flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-brand-text-primary mb-2 break-words">{listing.address.split(',')[0]}</h1>
                    <p className="text-brand-text-secondary text-base lg:text-lg break-words">{listing.address.split(',').slice(1).join(',').trim()}</p>
                  </div>
                  <div className="text-left lg:text-right flex-shrink-0">
                    <div className="text-3xl lg:text-4xl font-bold text-brand-secondary">
                      {formatPrice(listing.price)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-brand-border">
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-brand-text-primary">{listing.bedrooms}</div>
                    <div className="text-sm text-brand-text-secondary">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-brand-text-primary">{listing.bathrooms}</div>
                    <div className="text-sm text-brand-text-secondary">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-brand-text-primary">{listing.squareFootage.toLocaleString()}</div>
                    <div className="text-sm text-brand-text-secondary">Sq Ft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-brand-text-primary">{listing.yearBuilt}</div>
                    <div className="text-sm text-brand-text-secondary">Built</div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-3">Key Features</h3>
                  <div className="text-brand-text-secondary leading-relaxed min-h-[60px] flex flex-wrap items-start">
                    {listing.keyFeatures && listing.keyFeatures.split(',').map(feat => feat.trim()).filter(feat => feat.length > 0).length > 0 ? (
                      listing.keyFeatures.split(',').map(feat => feat.trim()).filter(feat => feat.length > 0).map((feature, index) => (
                        <span key={index} className="inline-block bg-brand-border/50 text-brand-text-secondary text-xs px-2 py-1 rounded-full mr-1.5 mb-1.5">{feature}</span>
                      ))
                    ) : (
                      <div className="text-brand-text-tertiary italic text-sm">
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
        {(listing.generatedDescription || listing.generatedFacebookPost || listing.generatedInstagramCaption || listing.generatedXPost || listing.generatedEmail) && (
          <div className="mb-8">
            {/* Property Description - Full Width */}
            {listing.generatedDescription && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2">Property Description</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary">Generated</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/generate/description`}>
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Edit Description
                    </Button>
                  </Link>
                </div>
                <div className="bg-brand-panel border border-brand-border rounded-lg p-6 shadow-xl">
                  <p className="text-brand-text-secondary leading-relaxed whitespace-pre-line">
                    {listing.generatedDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Social Media Posts - 3 Column Grid (Facebook, Instagram, X) */}
            {(listing.generatedFacebookPost || listing.generatedInstagramCaption || listing.generatedXPost) && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-brand-text-primary mb-6">Social Media Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Facebook Post */}
                  {listing.generatedFacebookPost && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="mb-3 sm:mb-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-lg">Facebook Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/facebook-post`}>
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <SocialMediaMockup 
                        content={listing.generatedFacebookPost} 
                        listingImage={listing.images?.[0]?.url}
                        platform="facebook" 
                      />
                    </div>
                  )}

                  {/* Instagram Post */}
                  {listing.generatedInstagramCaption && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="mb-3 sm:mb-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-lg">Instagram Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/instagram-post`}>
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <SocialMediaMockup 
                        content={listing.generatedInstagramCaption} 
                        listingImage={listing.images?.[0]?.url}
                        platform="instagram" 
                      />
                    </div>
                  )}

                  {/* X (Twitter) Post */}
                  {listing.generatedXPost && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="mb-3 sm:mb-0 flex-1">
                          <h4 className="font-semibold text-brand-text-primary text-lg">X (Twitter) Post</h4>
                          <div className="flex items-center mt-1">
                            <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                            <span className="text-xs font-medium text-brand-secondary">Generated</span>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}/generate/x-post`}>
                          <Button 
                            variant='edit' 
                            size='sm'
                            leftIcon={<PencilSquareIcon className='h-3 w-3' />}
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                      <SocialMediaMockup 
                        content={listing.generatedXPost} 
                        listingImage={listing.images?.[0]?.url}
                        platform="twitter" 
                      />
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Email Campaign - Full Width */}
            {listing.generatedEmail && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-brand-text-primary mb-2">Email Campaign</h3>
                    <div className="flex items-center">
                      <span className="bg-brand-secondary h-2 w-2 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-brand-secondary">Generated</span>
                    </div>
                  </div>
                  <Link to={`/listings/${listing.id}/generate/email`}>
                    <Button 
                      variant='edit' 
                      leftIcon={<PencilSquareIcon className='h-4 w-4' />}
                      size="md"
                    >
                      Edit Email
                    </Button>
                  </Link>
                </div>
                <div className="bg-brand-panel border border-brand-border rounded-lg p-6 shadow-xl">
                  <div className="text-brand-text-secondary leading-relaxed whitespace-pre-line">
                    {listing.generatedEmail}
                  </div>
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
