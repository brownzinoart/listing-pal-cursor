import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Button from '../../shared/Button';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  VideoCameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Listing } from '../../../types';
import PropertySelector from '../../shared/PropertySelector';
// import VideoAnalysisStep from './VideoAnalysisStep';
// import VideoScriptEditor from './VideoScriptEditor';
// import VideoGenerationStep from './VideoGenerationStep';
// import VideoPlatformPublisher from './VideoPlatformPublisher';
import { videoGenerationService, VideoAnalysis, VideoScript, VideoGenerationResult } from '../../../services/videoGenerationService';

interface VideoCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  template?: string | null;
}

type WizardStep = 'property' | 'upload' | 'analysis' | 'script' | 'generation' | 'publish' | 'complete';

const VideoCreationWizard: React.FC<VideoCreationWizardProps> = ({ 
  isOpen, 
  onClose,
  listings,
  template 
}) => {
  // VideoCreationWizard component initialized

  const [currentStep, setCurrentStep] = useState<WizardStep>('property');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<VideoGenerationResult | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    // Set default platforms based on template
    if (template === 'Quick Preview') {
      return { tiktok: true, instagram: true, youtube: false };
    } else if (template === 'Virtual Tour') {
      return { tiktok: false, instagram: true, youtube: true };
    }
    return { tiktok: true, instagram: true, youtube: true };
  });

  const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
    { key: 'property', label: 'Select Property', icon: <CloudArrowUpIcon className="h-5 w-5" /> },
    { key: 'upload', label: 'Upload Images', icon: <CloudArrowUpIcon className="h-5 w-5" /> },
    { key: 'analysis', label: 'AI Analysis', icon: <SparklesIcon className="h-5 w-5" /> },
    { key: 'script', label: 'Review Script', icon: <SparklesIcon className="h-5 w-5" /> },
    { key: 'generation', label: 'Generate Video', icon: <VideoCameraIcon className="h-5 w-5" /> },
    { key: 'publish', label: 'Publish', icon: <CheckCircleIcon className="h-5 w-5" /> }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  // Mock data for testing
  const useMockData = () => {
    // Create mock File objects
    const mockFiles = [
      new File([''], 'living-room.jpg', { type: 'image/jpeg' }),
      new File([''], 'kitchen.jpg', { type: 'image/jpeg' }),
      new File([''], 'bedroom.jpg', { type: 'image/jpeg' }),
      new File([''], 'bathroom.jpg', { type: 'image/jpeg' })
    ];
    setUploadedImages(mockFiles);
  };

  const renderStepContent = () => {
    try {
      switch (currentStep) {
        case 'property':
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Select a Property</h3>
                
                {/* Loading state for listings */}
                {listings.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your properties...</p>
                  </div>
                ) : (
                  <PropertySelector
                    listings={listings}
                    selectedListings={selectedListing ? [selectedListing.id] : []}
                    onSelectionChange={(ids) => {
                      const listing = listings.find(l => l.id === ids[0]);
                      setSelectedListing(listing || null);
                    }}
                    placeholder="Choose property for video"
                    multiSelect={false}
                  />
                )}
                
                {/* No listings state with mock data option */}
                {listings.length === 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-slate-400 text-sm text-center">
                      No properties found. Please add a property first.
                    </p>
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Create a mock listing for testing
                          const mockListing = {
                            id: 'mock-1',
                            address: '123 Demo Street, Test City, CA 90210',
                            price: 850000,
                            bedrooms: 3,
                            bathrooms: 2,
                            sqft: 1850,
                            imageUrl: '/api/placeholder/400/300',
                            status: 'active' as const,
                            description: 'Beautiful demo property for testing video creation',
                            features: ['Modern kitchen', 'Spacious living room', 'Master suite'],
                            userId: 'demo-user'
                          };
                          setSelectedListing(mockListing);
                        }}
                      >
                        Use Demo Property for Testing
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );

      case 'upload':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Upload Property Images</h3>
              <p className="text-slate-400 text-sm mb-6">Upload high-quality images of the property. The AI will analyze and arrange them optimally.</p>
              
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-white/40 transition-colors">
                <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-white font-medium">Click to upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-slate-400 text-sm mt-2">or drag and drop</p>
              </div>

              {/* Demo button for testing */}
              <div className="mt-4 text-center">
                <button
                  onClick={useMockData}
                  className="text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  Use demo images for testing
                </button>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <p className="text-white mb-3">{uploadedImages.length} images uploaded</p>
                  <div className="grid grid-cols-4 gap-3">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-700">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Selection */}
              <div className="mt-8">
                <h4 className="text-white font-medium mb-3">Select Target Platforms</h4>
                <p className="text-slate-400 text-sm mb-4">Choose where you want to publish your video</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'tiktok', label: 'TikTok', desc: '60 second vertical video' },
                    { key: 'instagram', label: 'Instagram', desc: 'Reels & feed posts' },
                    { key: 'youtube', label: 'YouTube', desc: 'Shorts & standard videos' }
                  ].map((platform) => (
                    <button
                      key={platform.key}
                      onClick={() => setSelectedPlatforms(prev => ({ ...prev, [platform.key]: !prev[platform.key as keyof typeof prev] }))}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        selectedPlatforms[platform.key as keyof typeof selectedPlatforms]
                          ? 'bg-purple-500/20 border-purple-400'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-left">
                        <h5 className={`font-medium ${
                          selectedPlatforms[platform.key as keyof typeof selectedPlatforms]
                            ? 'text-white'
                            : 'text-slate-300'
                        }`}>
                          {platform.label}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1">{platform.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="text-center py-12">
            <h3 className="text-white text-lg mb-4">AI Analysis (Coming Soon)</h3>
            <p className="text-slate-400 mb-6">AI is analyzing your property images...</p>
            <Button variant="gradient" onClick={() => {
              // Mock analysis result
              setAnalysis({
                detectedRooms: ['Living Room', 'Kitchen', 'Bedroom'],
                keyFeatures: ['Hardwood Floors', 'Modern Kitchen', 'Large Windows'],
                imageQuality: { overall: 90, lighting: 85, composition: 95 },
                suggestedOrder: [0, 1, 2]
              });
              handleNext();
            }}>
              Continue with Mock Analysis
            </Button>
          </div>
        );

      case 'script':
        return (
          <div className="text-center py-12">
            <h3 className="text-white text-lg mb-4">Script Generation (Coming Soon)</h3>
            <p className="text-slate-400 mb-6">AI is generating your video script...</p>
            <Button variant="gradient" onClick={() => {
              // Mock script result
              setScript({
                intro: "Welcome to this beautiful property",
                scenes: [
                  { imageIndex: 0, narration: "This stunning living room features...", duration: 10 },
                  { imageIndex: 1, narration: "The modern kitchen includes...", duration: 10 }
                ],
                outro: "Contact us today to schedule a viewing",
                totalDuration: 30
              });
              handleNext();
            }}>
              Continue with Mock Script
            </Button>
          </div>
        );

      case 'generation':
        return (
          <div className="text-center py-12">
            <h3 className="text-white text-lg mb-4">Video Generation (Coming Soon)</h3>
            <p className="text-slate-400 mb-6">AI is creating your video...</p>
            <Button variant="gradient" onClick={() => {
              // Mock video result
              setGeneratedVideo({
                videoId: 'mock-video-123',
                masterVideoUrl: '/api/placeholder/video/mock.mp4',
                platformVersions: {
                  tiktok: { url: '/api/placeholder/video/tiktok.mp4', duration: 60 },
                  instagram: { url: '/api/placeholder/video/instagram.mp4', duration: 90 },
                  youtube: { url: '/api/placeholder/video/youtube.mp4', duration: 120 }
                }
              });
              handleNext();
            }}>
              Continue with Mock Video
            </Button>
          </div>
        );

      case 'publish':
        return (
          <div className="text-center py-12">
            <h3 className="text-white text-lg mb-4">Publishing (Coming Soon)</h3>
            <p className="text-slate-400 mb-6">Publishing your video to social platforms...</p>
            <Button variant="gradient" onClick={() => setCurrentStep('complete')}>
              Complete Mock Publishing
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Video Published Successfully!</h3>
            <p className="text-slate-400 mb-8">Your property video is now live on selected platforms.</p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button 
                variant="gradient" 
                onClick={() => {
                  // Reset wizard
                  setCurrentStep('property');
                  setSelectedListing(null);
                  setUploadedImages([]);
                  setAnalysis(null);
                  setScript(null);
                  setGeneratedVideo(null);
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
    } catch (error) {
      console.error('Error rendering wizard step:', error);
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-medium text-red-400 mb-2">Something went wrong</h3>
          <p className="text-slate-400 mb-4">
            There was an error loading this step. Please try refreshing or contact support.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              // Reset to first step
              setCurrentStep('property');
              setSelectedListing(null);
              setUploadedImages([]);
              setAnalysis(null);
              setScript(null);
              setGeneratedVideo(null);
            }}
          >
            Start Over
          </Button>
        </div>
      );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'property': return selectedListing !== null && listings.length > 0;
      case 'upload': return uploadedImages.length > 0;
      case 'analysis': return true; // Handled by component
      case 'script': return true; // Handled by component
      case 'generation': return true; // Handled by component
      case 'publish': return true; // Handled by component
      default: return false;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        
        <Dialog.Panel className="relative bg-slate-800 border border-white/20 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden z-10">
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-white">
                  Create Property Video
                </Dialog.Title>
                <p className="text-slate-400 mt-1">
                  {template ? `Using ${template} template` : 'AI-powered video generation'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            {/* Progress Steps */}
            {currentStep !== 'complete' && (
              <div className="flex items-center justify-between mt-8">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isComplete = getCurrentStepIndex() > index;
                  
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                          ${isComplete ? 'bg-emerald-500' : 
                            isActive ? 'bg-purple-500' : 
                            'bg-white/10'}
                        `}>
                          {isComplete ? (
                            <CheckCircleIcon className="h-5 w-5 text-white" />
                          ) : (
                            <span className={isActive ? 'text-white' : 'text-slate-400'}>
                              {step.icon}
                            </span>
                          )}
                        </div>
                        <span className={`ml-3 text-sm hidden md:block ${
                          isActive ? 'text-white font-medium' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                          isComplete ? 'bg-emerald-500' : 'bg-white/10'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Footer */}
          {currentStep !== 'complete' && currentStep !== 'analysis' && currentStep !== 'generation' && currentStep !== 'publish' && (
            <div className="bg-white/5 border-t border-white/10 px-8 py-6 flex justify-between">
              <Button
                variant="ghost"
                leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
                onClick={handleBack}
                disabled={getCurrentStepIndex() === 0}
              >
                Back
              </Button>
              <Button
                variant="gradient"
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VideoCreationWizard;