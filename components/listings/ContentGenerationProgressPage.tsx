import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types';
import { 
  CheckCircleIcon, 
  SparklesIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import Button from '../shared/Button';

interface ContentGenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
}

const ContentGenerationProgressPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [steps, setSteps] = useState<ContentGenerationStep[]>([
    {
      id: 'mls-description',
      name: 'MLS Property Description',
      description: 'Professional property description for MLS listing',
      status: 'pending'
    },
    {
      id: 'facebook-post',
      name: 'Facebook Post',
      description: 'Engaging social media post for Facebook',
      status: 'pending'
    },
    {
      id: 'instagram-post',
      name: 'Instagram Post',
      description: 'Visual-focused caption for Instagram',
      status: 'pending'
    },
    {
      id: 'x-post',
      name: 'X (Twitter) Post',
      description: 'Concise post for X/Twitter',
      status: 'pending'
    },
    {
      id: 'interior-reimagined',
      name: 'Interior Reimagined',
      description: 'AI-enhanced interior visualization concepts',
      status: 'pending'
    },
    {
      id: 'paid-ads',
      name: 'Paid Ad Campaigns',
      description: 'Facebook/IG, LinkedIn, and Google ad copy',
      status: 'pending'
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(true); // Show immediately
  const [selectedImageForInterior, setSelectedImageForInterior] = useState<string | null>(null);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [batchSelections, setBatchSelections] = useState<any>(null);

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided");
      return;
    }

    // Check for batch selections from sessionStorage
    const storedSelections = sessionStorage.getItem('batchSelections');
    if (storedSelections) {
      setBatchSelections(JSON.parse(storedSelections));
      // Clear from sessionStorage after retrieving
      sessionStorage.removeItem('batchSelections');
    }

    // Fetch listing data but don't start generation yet
    listingService.getListingById(listingId)
      .then(data => {
        if (data && data.userId === user?.id) {
          setListing(data);
          // Don't start generation yet - wait for image selection or use batch selections
        } else {
          setError(data ? "Permission denied" : "Listing not found");
        }
      })
      .catch(() => setError('Failed to fetch listing details'));
  }, [listingId, user]);

  // Auto-redirect countdown effect
  useEffect(() => {
    if (isComplete && !redirectCountdown) {
      setRedirectCountdown(3);
    }
  }, [isComplete]);

  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      handleViewListing();
    }
  }, [redirectCountdown]);

    const startContentGeneration = async (listingData: Listing, selectedImage: string | null) => {
    setIsGenerating(true);
    setError(null);
    setShowImageSelector(false); // Hide selector during generation

    try {
      // Import the content generation service
      const { contentGenerationService } = await import('../../services/contentGenerationService');

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStepIndex(i);

        // Update step to in-progress
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'in-progress' } : s
        ));

        try {
          let content = '';

          // Special handling for interior reimagining
          if (step.id === 'interior-reimagined') {
            if (!selectedImage || selectedImage === 'skip') {
              // User skipped, mark as completed but with skip message
              setSteps(prev => prev.map((s, idx) => 
                idx === i ? { ...s, status: 'completed', result: 'Interior reimagining skipped - no image selected.' } : s
              ));
            } else {
              // Generate interior concepts with selected image
              content = await contentGenerationService.generateInteriorConcepts(listingData, selectedImage);
              
              setSteps(prev => prev.map((s, idx) => 
                idx === i ? { ...s, status: 'completed', result: content } : s
              ));

              // Save to listing (using keyFeatures to store interior concepts for now)
              await listingService.updateListing(listingId!, { 
                keyFeatures: `${listingData.keyFeatures}\n\nInterior Concepts:\n${content}`,
              });
            }
          } else {
            // Normal content generation for other steps
            content = await contentGenerationService.generateContentStep(listingData, step.id);

            // Update step to completed
            setSteps(prev => prev.map((s, idx) => 
              idx === i ? { ...s, status: 'completed', result: content } : s
            ));

            // Save content to listing
            const updateData: any = {};
            switch (step.id) {
              case 'mls-description':
                updateData.generatedDescription = content;
                break;
              case 'facebook-post':
                updateData.generatedFacebookPost = content;
                break;
              case 'instagram-post':
                updateData.generatedInstagramPost = content;
                break;
              case 'x-post':
                updateData.generatedXPost = content;
                break;
              case 'paid-ads':
                updateData.generatedAdCopy = content;
                break;
            }

            await listingService.updateListing(listingId!, updateData);
          }

          // Small delay for UX
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (stepError) {
          console.error(`Error generating ${step.name}:`, stepError);
          setSteps(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'failed' } : s
          ));
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Content generation error:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewListing = () => {
    navigate(`/listings/${listingId}`);
  };

  const getStepIcon = (step: ContentGenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'in-progress':
        return <SparklesIcon className="h-6 w-6 text-brand-primary animate-pulse" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-brand-text-tertiary" />;
    }
  };

  const getStepTextColor = (step: ContentGenerationStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-brand-primary font-semibold';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-brand-text-secondary';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-brand-danger mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-brand-primary mr-3" />
            <h1 className="text-3xl font-bold text-brand-text-primary">
              Generating All Content
            </h1>
          </div>
          <p className="text-brand-text-secondary">
            Creating comprehensive marketing content for {listing.address}
          </p>
        </div>

        <div className="bg-brand-panel rounded-2xl shadow-2xl border border-brand-border p-8">
          {/* Progress Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-brand-text-secondary">Progress</span>
              <span className="text-sm text-brand-text-secondary">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-brand-border rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border transition-all duration-200 ${
                  step.status === 'in-progress' 
                    ? 'bg-brand-primary/5 border-brand-primary/20' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-brand-card border-brand-border/50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                <div className="flex-grow">
                  <h3 className={`font-semibold ${getStepTextColor(step)}`}>
                    {step.name}
                  </h3>
                  <p className="text-sm text-brand-text-tertiary mt-1">
                    {step.description}
                  </p>
                  {step.status === 'in-progress' && (
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-brand-primary">
                        <SparklesIcon className="h-4 w-4 mr-1 animate-pulse" />
                        Generating...
                      </div>
                    </div>
                  )}
                  {step.status === 'completed' && step.result && (
                    <div className="mt-2 p-3 bg-white/50 rounded border text-sm text-brand-text-secondary">
                      {step.result.substring(0, 150)}
                      {step.result.length > 150 && '...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {isComplete && (
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-green-600">Content Complete!</h2>
                  <p className="text-brand-text-secondary">
                    All marketing content has been generated successfully
                  </p>
                  {redirectCountdown !== null && redirectCountdown > 0 && (
                    <p className="text-sm text-brand-text-tertiary mt-2">
                      Redirecting to your listing in {redirectCountdown}...
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleViewListing}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg transition-all duration-300"
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                size="lg"
              >
                View Listing Now
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !isComplete && (
            <div className="mt-8 text-center">
              <div className="animate-pulse text-brand-text-secondary">
                <SparklesIcon className="h-8 w-8 mx-auto mb-2 animate-bounce text-brand-primary" />
                <p>Creating amazing content for your listing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Selector Modal for Interior Reimagining */}
        {showImageSelector && listing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-brand-panel rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-brand-text-primary mb-4">
                Ready to Generate All Content?
              </h3>
              <p className="text-brand-text-secondary mb-6">
                First, choose an image for interior reimagining (or skip this step):
              </p>

              {/* Existing Images Grid */}
              {listing.images && listing.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-brand-text-primary mb-3">Select from uploaded images:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {listing.images.map((image, index) => (
                      <div 
                        key={index}
                        className="cursor-pointer relative group"
                        onClick={() => {
                          setSelectedImageForInterior(image.url);
                          setHasSelectedImage(true);
                          startContentGeneration(listing, image.url);
                        }}
                      >
                        <img 
                          src={image.url} 
                          alt={`Option ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-transparent hover:border-brand-primary transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-brand-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                            Select & Generate
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Image */}
              <div className="mb-6">
                <h4 className="font-semibold text-brand-text-primary mb-3">Or upload a new image:</h4>
                <div className="border-2 border-dashed border-brand-border rounded-lg p-8 text-center hover:border-brand-primary transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="interior-image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create object URL for preview
                        const imageUrl = URL.createObjectURL(file);
                        setSelectedImageForInterior(imageUrl);
                        setHasSelectedImage(true);
                        startContentGeneration(listing, imageUrl);
                      }
                    }}
                  />
                  <label 
                    htmlFor="interior-image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <SparklesIcon className="h-8 w-8 text-brand-text-tertiary mb-2" />
                    <span className="text-brand-text-secondary">Click to upload & generate</span>
                    <span className="text-xs text-brand-text-tertiary mt-1">PNG, JPG up to 10MB</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedImageForInterior('skip');
                    setHasSelectedImage(true);
                    startContentGeneration(listing, 'skip');
                  }}
                >
                  Skip & Generate Other Content
                </Button>
              </div>

              <div className="mt-4 p-3 bg-brand-accent/10 rounded-lg">
                <p className="text-sm text-brand-text-secondary">
                  💡 <strong>What happens next:</strong> We'll generate all 6 content types in one seamless flow - 
                  MLS description, social media posts, and paid ads automatically. Interior concepts only if you select an image.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerationProgressPage; 