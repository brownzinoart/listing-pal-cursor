import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types';
import { AI_DESIGN_STYLES, AiDesignStyleId, TOOLKIT_TOOLS } from '../../constants';
import { restyleRoom, RestyleOptions, getAPIConfig, checkServiceHealth } from '../../services/roomRestyleService';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AiDesignStyleCard from './generation/AiDesignStyleCard';
import WorkflowNavigation from './generation/WorkflowNavigation';
import { ArrowLeftIcon, PhotoIcon, CameraIcon, SparklesIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// Room type options from the API
const ROOM_TYPES = [
  { id: 'livingroom', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'diningroom', name: 'Dining Room', icon: '🍽️' },
  { id: 'homeoffice', name: 'Home Office', icon: '💼' },
  { id: 'nursery', name: 'Nursery', icon: '👶' },
  { id: 'basement', name: 'Basement', icon: '🏠' }
];

const AiRoomRedesignPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<AiDesignStyleId | null>(AI_DESIGN_STYLES[0]?.id || null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('livingroom');
  const [activeTab, setActiveTab] = useState<'roomtype' | 'style'>('roomtype');
  const [designPrompt, setDesignPrompt] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Base64 string
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // File object for API
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [generatedRedesign, setGeneratedRedesign] = useState<string | null>(null); // URL of redesigned image
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  // Advanced options state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [usePaidAPI, setUsePaidAPI] = useState<boolean>(false);
  const [numImages, setNumImages] = useState<number>(1);
  const [upscaleResult, setUpscaleResult] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<{available: boolean, apiType: 'paid' | 'local', error?: string} | null>(null);

  // Workflow management
  const workflowParam = searchParams.get('workflow');
  const workflowTools = workflowParam ? workflowParam.split(',') : [];
  const isInWorkflow = workflowTools.length > 1;

  // Get previous step name for back navigation
  const getPreviousStepName = () => {
    if (!isInWorkflow) return 'Property';
    const currentIndex = workflowTools.indexOf('interior');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('interior');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      if (previousTool?.pathSuffix) {
        return `/listings/${listingId}${previousTool.pathSuffix}?workflow=${workflowParam}`;
      }
    }
    return `/listings/${listingId}`;
  };

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided.");
      setIsLoadingPage(false);
      return;
    }
    setIsLoadingPage(true);
    
    // Check API health and initialize settings
    const checkHealth = async () => {
      try {
        console.log('Checking API health...');
        const health = await checkServiceHealth();
        console.log('Health check result:', health);
        setApiHealth(health);
        const config = getAPIConfig();
        setUsePaidAPI(config.usePaidAPI);
      } catch (error) {
        console.error('Failed to check API health:', error);
        // Set a fallback health status to prevent UI from breaking
        setApiHealth({
          available: false,
          apiType: 'local',
          error: 'Could not reach API service'
        });
      }
    };
    
    Promise.all([
      listingService.getListingById(listingId),
      checkHealth()
    ])
      .then(([data]) => {
        if (data && data.userId === user?.id) {
          setListing(data);
        } else if (data && data.userId !== user?.id) {
          setError("You do not have permission to access this page.");
        } else {
          setError('Listing not found.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch listing details.');
      })
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadedImage(null);
    setUploadedImageFile(null);
    setUploadedImageName(null);
    setGeneratedRedesign(null);

    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError('Invalid file type. Please upload an image (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError('File is too large. Maximum size is 5MB.');
        return;
      }
      
      // Store the file for API calls
      setUploadedImageFile(file);
      setUploadedImageName(file.name);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.onerror = () => {
        setFileError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Allow re-uploading the same file
  };

  // Map AI design styles to room types and design styles
  const mapDesignStyleToHuggingFace = (styleId: AiDesignStyleId, roomType: string) => {
    const roomTypeMap: Record<string, string> = {
      'livingroom': 'Living Room',
      'bedroom': 'Bedroom', 
      'kitchen': 'Kitchen',
      'bathroom': 'Bathroom',
      'diningroom': 'Dining Room',
      'homeoffice': 'Home Office',
      'nursery': 'Nursery',
      'basement': 'Basement'
    };
    
    // Map to exact API style names (from /styles endpoint)
    const styleMap: Record<AiDesignStyleId, string> = {
      'modern': 'modern',
      'scandinavian': 'scandinavian',
      'minimalist': 'minimalist',
      'industrial': 'industrial',
      'bohemian': 'bohemian',
      'traditional': 'traditional',
      'midcenturymodern': 'midcenturymodern',
      'glamorous': 'glamorous',
      'rustic': 'rustic',
      'contemporary': 'contemporary',
      'eclectic': 'eclectic',
      'farmhouse': 'farmhouse',
    };
    
    return { 
      room_type: roomTypeMap[roomType] || 'Living Room', 
      style: styleMap[styleId] || 'contemporary' 
    };
  };



  const handleGenerateRedesign = async () => {
    if (!uploadedImageFile || !selectedDesignStyle || !selectedRoomType) {
      setError("Please upload an image, select a room type, and select a design style.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedRedesign(null);

    try {
      const mappedStyle = mapDesignStyleToHuggingFace(selectedDesignStyle, selectedRoomType);
      
      const options: RestyleOptions = {
        usePaidAPI: usePaidAPI,
        numImages: numImages,
        upscale: upscaleResult
      };
      
      const response = await restyleRoom(
        uploadedImageFile,
        designPrompt || `${mappedStyle.style} style ${mappedStyle.room_type}`,
        selectedRoomType,
        mappedStyle.style.toLowerCase(),
        options
      );

      if (response.success && response.imageUrl) {
        setGeneratedRedesign(response.imageUrl);
      } else {
        setError(response.error || 'Failed to generate room redesign. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('An error occurred while generating the room redesign. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;
  }

  if (error && !listing) { // Show general error if listing also fails to load
    return (
      <div className="text-center py-10">
        <p className="text-brand-danger bg-red-900/30 p-4 rounded-md max-w-md mx-auto">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-warning">Listing not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleConfirmAndSave = async () => {
    if (!listingId || !generatedRedesign || !uploadedImage) {
      alert("No redesigned image to save.");
      return;
    }

    // Prepare redesigned image object for images array
    const newImage = {
      url: generatedRedesign,
      label: `${selectedDesignStyle} Redesign of ${selectedRoomType}`,
      isRedesign: true,
      originalImageUrl: uploadedImage,
    };

    // Prepare generatedRoomDesign entry (to power workflow status)
    const newRoomDesign = {
      originalImageUrl: uploadedImage!,
      styleId: selectedDesignStyle!,
      redesignedImageUrl: generatedRedesign,
      prompt: designPrompt,
      createdAt: new Date().toISOString(),
    };

    const updatedImages = [...(listing.images || []), newImage];
    const updatedRoomDesigns = [...(listing.generatedRoomDesigns || []), newRoomDesign];

    try {
      await listingService.updateListing(listingId, {
        images: updatedImages,
        generatedRoomDesigns: updatedRoomDesigns,
      });
      navigate(`/listings/${listingId}`);
    } catch (error) {
      console.error("Failed to save redesigned image:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to={getPreviousStepPath()} className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Interior Reimagined</h1>
        
        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation 
              workflowTools={workflowTools} 
              currentToolId="interior"
            />
          </div>
        )}
        
        <p className="text-brand-text-secondary mb-1 mt-1">For: {listing.address.split(',')[0]}</p>
        <p className="text-brand-text-tertiary mb-2 text-sm">Upload a clear photo of the room you want to redesign and generate a new look.</p>
        <p className="text-brand-text-tertiary mb-8 text-xs">💡 Tip: Photos taken with your phone camera work perfectly! Just make sure the room is well-lit and clearly visible.</p>

      {/* Main Content: Upload & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Image Upload & Preview */}
        <div className="bg-brand-panel p-6 rounded-lg shadow-xl border border-brand-border">
          <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Upload Your Room Photo</h2>
          
          {!uploadedImage ? (
            <div>
              {/* Image Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Traditional Upload */}
                <label htmlFor="room-image-upload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-md cursor-pointer hover:border-brand-primary transition-colors">
                  <PhotoIcon className="h-8 w-8 text-brand-text-tertiary mb-2" />
                  <span className="text-sm text-brand-text-secondary font-medium">Upload Photo</span>
                  <span className="text-xs text-brand-text-tertiary mt-1">PNG, JPG, WEBP up to 5MB</span>
                </label>
                <input type="file" id="room-image-upload" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" />
                
                {/* Mobile Camera */}
                <label htmlFor="mobile-camera-upload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-md cursor-pointer hover:border-brand-primary transition-colors">
                  <CameraIcon className="h-8 w-8 text-brand-text-tertiary mb-2" />
                  <span className="text-sm text-brand-text-secondary font-medium">Take Photo</span>
                  <span className="text-xs text-brand-text-tertiary mt-1">Mobile camera</span>
                </label>
                <input type="file" id="mobile-camera-upload" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
              </div>
              
              <div className="flex-1">
                <Input 
                    type="text"
                    placeholder="e.g., add a modern coffee table and a large plant"
                    value={designPrompt}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDesignPrompt(e.target.value)}
                    className="w-full text-sm"
                    variant="gradient"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <img src={uploadedImage} alt="Uploaded room" className="w-full rounded-md shadow-md border border-brand-border" />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedImageFile(null);
                    setUploadedImageName(null);
                    setGeneratedRedesign(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-brand-text-secondary mt-2 text-center">{uploadedImageName}</p>
              
              <div className="mt-4">
                <Input 
                    type="text"
                    placeholder="e.g., add a modern coffee table and a large plant"
                    value={designPrompt}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDesignPrompt(e.target.value)}
                    className="w-full text-sm"
                    variant="gradient"
                />
              </div>
            </div>
          )}
          
          {fileError && <p className="text-xs text-brand-danger mt-2">{fileError}</p>}
        </div>

        {/* Right: Output Area */}
        <div className="bg-brand-panel p-6 rounded-lg shadow-xl border border-brand-border">
          <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Your Redesigned Room</h2>
          
          {!generatedRedesign ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-brand-border rounded-md">
              <SparklesIcon className="h-12 w-12 text-brand-text-tertiary mb-4" />
              <p className="text-brand-text-secondary text-center">
                Upload a room photo and select your style to see the AI-generated redesign here
              </p>
            </div>
          ) : (
            <div>
              <div className="relative">
                <img src={generatedRedesign} alt="Redesigned room" className="w-full rounded-md shadow-md border border-brand-primary" />
                <div className="absolute top-2 left-2 bg-brand-primary text-white px-2 py-1 rounded text-xs font-medium">
                  {AI_DESIGN_STYLES.find(s => s.id === selectedDesignStyle)?.name || 'Redesigned'}
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>

      {/* Selection Process */}
      <div className="bg-brand-panel p-6 rounded-lg shadow-xl border border-brand-border mb-8">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Select Room Type & Design Style</h2>
        
        {/* Tab Navigation */}
        <div className="flex justify-between items-center border-b border-brand-border mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('roomtype')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'roomtype'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              Room Type
              {selectedRoomType && (
                <span className="ml-2 inline-block w-2 h-2 bg-brand-primary rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ml-6 ${
                activeTab === 'style'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              Design Style
              {selectedDesignStyle && (
                <span className="ml-2 inline-block w-2 h-2 bg-brand-primary rounded-full"></span>
              )}
            </button>
          </div>
          
          {/* Generate/Regenerate & Save Buttons */}
          <div className="pb-2 flex gap-2">
            <Button
              onClick={handleGenerateRedesign}
              isLoading={isGenerating}
              disabled={!uploadedImage || !selectedRoomType || !selectedDesignStyle || isGenerating}
              className="bg-brand-primary hover:bg-opacity-80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              leftIcon={isGenerating ? undefined : (generatedRedesign ? <ArrowPathIcon className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />)}
              size="sm"
            >
              {isGenerating ? 'Generating...' : (generatedRedesign ? 'Regenerate' : 'Generate')}
            </Button>
            
            <Button
              onClick={handleConfirmAndSave}
              disabled={!uploadedImage || !selectedRoomType || !selectedDesignStyle || !generatedRedesign || isGenerating}
              variant="secondary"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              {isInWorkflow ? 'Continue' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'roomtype' && (
          <div>
            <h3 className="text-lg font-medium text-brand-text-primary mb-4">Choose the room type:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROOM_TYPES.map(roomType => (
                <button
                  key={roomType.id}
                  onClick={() => {
                    setSelectedRoomType(roomType.id);
                    setActiveTab('style'); // Auto-advance to next tab
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedRoomType === roomType.id
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-brand-border text-brand-text-secondary hover:border-brand-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{roomType.icon}</div>
                  <div className="text-sm font-medium leading-tight">{roomType.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div>
            <h3 className="text-lg font-medium text-brand-text-primary mb-4">Choose your design style:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
              {AI_DESIGN_STYLES.map(style => (
                <AiDesignStyleCard 
                  key={style.id} 
                  style={style} 
                  isSelected={selectedDesignStyle === style.id}
                  onSelect={() => setSelectedDesignStyle(style.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && !isGenerating && <div className="my-4 p-3 bg-brand-danger/20 text-brand-danger text-sm rounded-md flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2"/>{error}</div>}


      </div>
    </div>
  );
};

export default AiRoomRedesignPage;