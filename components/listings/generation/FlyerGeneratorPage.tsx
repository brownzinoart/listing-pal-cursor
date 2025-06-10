import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { Listing, FlyerTemplate, FlyerCustomization, GeneratedFlyer } from '../../../types';
import { TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import { 
  ArrowLeftIcon, 
  SparklesIcon as SparklesOutlineIcon, 
  ArrowDownTrayIcon, 
  CheckIcon,
  SwatchIcon,
  PhotoIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

// Flyer templates with different styles
const FLYER_TEMPLATES: FlyerTemplate[] = [
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    category: 'luxury',
    thumbnail: '/templates/modern-luxury.jpg',
    description: 'Clean lines with elegant typography'
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    category: 'classic',
    thumbnail: '/templates/classic-professional.jpg',
    description: 'Traditional layout with professional styling'
  },
  {
    id: 'minimal-chic',
    name: 'Minimal Chic',
    category: 'minimal',
    thumbnail: '/templates/minimal-chic.jpg',
    description: 'Minimalist design with maximum impact'
  },
  {
    id: 'contemporary-bold',
    name: 'Contemporary Bold',
    category: 'modern',
    thumbnail: '/templates/contemporary-bold.jpg',
    description: 'Bold colors and modern typography'
  }
];

const COLOR_SCHEMES = [
  { name: 'Classic Blue', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Elegant Gold', primary: '#b45309', secondary: '#d97706', accent: '#f59e0b' },
  { name: 'Modern Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Professional Gray', primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
  { name: 'Luxury Black', primary: '#111827', secondary: '#374151', accent: '#6b7280' },
  { name: 'Forest Green', primary: '#065f46', secondary: '#047857', accent: '#10b981' }
];

const FONT_OPTIONS = [
  { name: 'Modern Sans', value: 'Inter, system-ui, sans-serif' },
  { name: 'Classic Serif', value: 'Georgia, serif' },
  { name: 'Bold Headlines', value: 'Montserrat, sans-serif' },
  { name: 'Elegant Script', value: 'Playfair Display, serif' }
];

const FlyerGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(FLYER_TEMPLATES[0].id);
  const [customization, setCustomization] = useState<FlyerCustomization>({
    template: FLYER_TEMPLATES[0].id,
    primaryColor: COLOR_SCHEMES[0].primary,
    secondaryColor: COLOR_SCHEMES[0].secondary,
    accentColor: COLOR_SCHEMES[0].accent,
    fontFamily: FONT_OPTIONS[0].value,
    customText: ''
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Workflow management
  const workflowParam = searchParams.get('workflow');
  const workflowTools = workflowParam ? workflowParam.split(',') : [];
  const isInWorkflow = workflowTools.length > 1;

  const getPreviousStepName = () => {
    if (!isInWorkflow) return 'Property';
    const currentIndex = workflowTools.indexOf('flyer');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('flyer');
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

    listingService.getListingById(listingId)
      .then(data => {
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

  const generateFlyer = async () => {
    if (!listing || !canvasRef.current) return;
    
    setIsGenerating(true);
    try {
      await drawFlyerToCanvas();
      
      // Convert canvas to image
      const canvas = canvasRef.current;
      const imageUrl = canvas.toDataURL('image/png', 1.0);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error generating flyer:', error);
      setError('Failed to generate flyer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const drawFlyerToCanvas = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas || !listing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (standard flyer size: 8.5" x 11" at 300 DPI)
    canvas.width = 2550;  // 8.5 * 300
    canvas.height = 3300; // 11 * 300

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw based on selected template
    await drawTemplateContent(ctx, canvas.width, canvas.height);
  };

  const drawTemplateContent = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!listing) return;

    const template = FLYER_TEMPLATES.find(t => t.id === selectedTemplate);
    
    // Header section with property image
    if (listing.images && listing.images.length > 0) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = listing.images[0].url;
        });

        // Draw main property image (top 60% of flyer)
        const imageHeight = height * 0.6;
        ctx.drawImage(img, 0, 0, width, imageHeight);
        
        // Add overlay for text readability
        const gradient = ctx.createLinearGradient(0, imageHeight - 200, 0, imageHeight);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, imageHeight - 200, width, 200);
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }

    // Property details section
    const detailsY = height * 0.6 + 50;
    
    // Price (large, prominent)
    ctx.fillStyle = customization.primaryColor;
    ctx.font = 'bold 120px Inter';
    ctx.textAlign = 'center';
    const priceText = `$${listing.price.toLocaleString()}`;
    ctx.fillText(priceText, width / 2, detailsY);

    // Address
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 80px Inter';
    ctx.fillText(listing.address, width / 2, detailsY + 120);

    // Property details
    ctx.font = '60px Inter';
    ctx.fillStyle = customization.secondaryColor;
    const details = `${listing.bedrooms} BD • ${listing.bathrooms} BA • ${listing.squareFootage.toLocaleString()} sq ft`;
    ctx.fillText(details, width / 2, detailsY + 200);

    // Property type and year
    if (listing.propertyType) {
      ctx.font = '50px Inter';
      ctx.fillStyle = '#6b7280';
      const typeYear = `${listing.propertyType} • Built ${listing.yearBuilt}`;
      ctx.fillText(typeYear, width / 2, detailsY + 270);
    }

    // Key features
    if (listing.keyFeatures) {
      ctx.font = '45px Inter';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'left';
      const features = listing.keyFeatures.split(',').slice(0, 3); // Top 3 features
      features.forEach((feature, index) => {
        ctx.fillText(`• ${feature.trim()}`, 150, detailsY + 350 + (index * 60));
      });
    }

    // Footer with contact info placeholder
    ctx.fillStyle = customization.primaryColor;
    ctx.fillRect(0, height - 300, width, 300);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Contact Your Agent Today', width / 2, height - 200);
    
    ctx.font = '50px Inter';
    ctx.fillText('Call • Text • Email', width / 2, height - 120);

    // Add custom text if provided
    if (customization.customText) {
      ctx.fillStyle = customization.accentColor;
      ctx.font = 'bold 55px Inter';
      ctx.fillText(customization.customText, width / 2, height - 50);
    }
  };

  const downloadFlyer = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `flyer-${listing?.address.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    link.href = generatedImageUrl;
    link.click();
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user || !generatedImageUrl) return;
    
    try {
      const newFlyer: GeneratedFlyer = {
        id: Date.now().toString(),
        templateId: selectedTemplate,
        customization: customization,
        imageUrl: generatedImageUrl,
        createdAt: new Date().toISOString()
      };

      const existingFlyers = listing.generatedFlyers || [];
      const updatedFlyers = [...existingFlyers, newFlyer];
      
      await listingService.updateListing(listingId, { 
        ...listing, 
        generatedFlyers: updatedFlyers,
        userId: user.id 
      });
      
      // If in workflow, go to next tool
      if (isInWorkflow) {
        const currentIndex = workflowTools.indexOf('flyer');
        const nextToolId = workflowTools[currentIndex + 1];
        
        if (nextToolId) {
          const nextTool = TOOLKIT_TOOLS.find(tool => tool.id === nextToolId);
          if (nextTool && nextTool.pathSuffix) {
            navigate(`/listings/${listingId}${nextTool.pathSuffix}?workflow=${workflowParam}`);
            return;
          }
        }
      }
      
      navigate(`/listings/${listingId}`);
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save flyer. Please try again.');
    }
  };

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-danger p-4">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
      </div>
    );
  }

  if (!listing) {
    return <p className="text-center">Listing not found.</p>;
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to={getPreviousStepPath()} className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Generate Marketing Flyer</h1>
        
        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation 
              workflowTools={workflowTools} 
              currentToolId="flyer" 
            />
          </div>
        )}
        
        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Customization Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Template Selection */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <PaintBrushIcon className="h-5 w-5 mr-2" />
                Template
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {FLYER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setCustomization(prev => ({ ...prev, template: template.id }));
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-brand-border bg-brand-card hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="aspect-[8.5/11] bg-gradient-to-b from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-brand-text-primary">{template.name}</p>
                    <p className="text-xs text-brand-text-tertiary">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <SwatchIcon className="h-5 w-5 mr-2" />
                Color Scheme
              </h3>
              <div className="space-y-3">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => setCustomization(prev => ({
                      ...prev,
                      primaryColor: scheme.primary,
                      secondaryColor: scheme.secondary,
                      accentColor: scheme.accent
                    }))}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      customization.primaryColor === scheme.primary
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-brand-border bg-brand-card hover:border-brand-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium text-brand-text-primary">{scheme.name}</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.primary }}></div>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.secondary }}></div>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.accent }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Selection */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Typography</h3>
              <select
                value={customization.fontFamily}
                onChange={(e) => setCustomization(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>{font.name}</option>
                ))}
              </select>
            </div>

            {/* Custom Text */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Custom Text</h3>
              <input
                type="text"
                value={customization.customText || ''}
                onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                placeholder="Add custom tagline or call-to-action"
                className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary placeholder-brand-text-tertiary"
              />
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateFlyer}
              isLoading={isGenerating}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-brand-secondary to-emerald-600 hover:from-emerald-600 hover:to-brand-secondary text-white font-semibold shadow-lg transition-all duration-300"
              leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
              size="lg"
            >
              {isGenerating ? 'Generating Flyer...' : 'Generate Flyer'}
            </Button>
          </div>

          {/* Preview Panel - Now takes more space and matches height */}
          <div className="xl:col-span-3">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 h-full min-h-[800px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-brand-text-primary">Flyer Preview</h3>
                {generatedImageUrl && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={downloadFlyer}
                      variant="secondary"
                      leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                      size="sm"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={handleConfirmAndSave}
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-semibold"
                      leftIcon={<CheckIcon className="h-4 w-4" />}
                      size="sm"
                    >
                      Save to Listing
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex justify-center items-center">
                <div className="relative max-w-full max-h-full">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full border border-brand-border rounded-lg shadow-lg"
                    style={{ 
                      width: 'auto', 
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '700px'
                    }}
                  />
                  {!generatedImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-card/80 rounded-lg min-h-[500px] min-w-[350px]">
                      <div className="text-center">
                        <PhotoIcon className="h-20 w-20 text-brand-text-tertiary mx-auto mb-4" />
                        <p className="text-brand-text-secondary text-lg">Click "Generate Flyer" to create your marketing flyer</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerGeneratorPage; 