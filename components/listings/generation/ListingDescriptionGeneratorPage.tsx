import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { ContentGenerationService } from '../../../services/contentGenerationService';
import { Listing } from '../../../types';
import { DESCRIPTION_STYLES, DescriptionStyleId, TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import Textarea from '../../shared/Textarea';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import StyleButton from './StyleButton';
import ModernDashboardLayout from '../../shared/ModernDashboardLayout';
import { 
  ArrowLeftIcon, 
  SparklesIcon as SparklesOutlineIcon,
  ClipboardDocumentIcon, 
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';

// Map UI style IDs to backend style values
const styleMapping: Record<DescriptionStyleId, string> = {
  'professional': 'professional',
  'luxury': 'luxury',
  'family-friendly': 'family-friendly',
  'modern': 'modern',
  'investment': 'investment'
};

const ListingDescriptionGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DescriptionStyleId>(DESCRIPTION_STYLES[0].id);
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  // Workflow management
  const workflowParam = searchParams.get('workflow');
  const workflowTools = workflowParam ? workflowParam.split(',') : [];
  const isInWorkflow = workflowTools.length > 1;

  // Get previous step name for back navigation
  const getPreviousStepName = () => {
    if (!isInWorkflow) return 'Property';
    const currentIndex = workflowTools.indexOf('desc');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('desc');
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
          setGeneratedDescription(data.generatedDescription || "Your generated description will appear here...");
        } else {
          setError(data ? "You don't have permission to edit this listing." : "Listing not found.");
        }
      })
      .catch(err => {
        console.error("Error loading listing:", err);
        setError('Failed to fetch listing details.');
      })
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  useEffect(() => {
    setCharCount(generatedDescription.length);
  }, [generatedDescription]);

  const runSearch = async (query: string) => {
    // Assuming setGeneratedDescription is the state setter for the output
    const res = await fetch('/api/ollama/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const { answer } = await res.json();
    setGeneratedDescription(answer);
  };

  const handleGenerateDescription = async () => {
    if (!listing) return;
    setIsGenerating(true);
    setGeneratedDescription('Generating your content...');
    
    try {
      // Convert listing to PropertyData format
      const propertyData = ContentGenerationService.formatPropertyData({
        address: listing.address,
        price: `$${listing.price.toLocaleString()}`,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        propertyType: listing.propertyType || 'Residential',
        keyFeatures: listing.keyFeatures ? listing.keyFeatures.split('\n').filter(f => f.trim()) : [],
        yearBuilt: listing.yearBuilt,
        // Add any other available fields from the listing
      });

      // Map UI style to backend style
      const backendStyle = styleMapping[selectedStyle] || 'professional';
      
      console.log('Generating description with style:', backendStyle);
      console.log('Property data:', propertyData);

      const response = await ContentGenerationService.generateDescription(propertyData, backendStyle as any);
      
      if (response.success && response.description) {
        setGeneratedDescription(response.description);
      } else {
        throw new Error(response.error || 'Failed to generate description');
      }
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to mock generation
      const mockDescription = `Welcome to this stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom home located at ${listing.address}. Spanning ${listing.squareFootage} square feet, this ${listing.yearBuilt} property offers ${listing.keyFeatures}. Priced at $${listing.price.toLocaleString()}, this home represents excellent value in today's market.`;
      setGeneratedDescription(mockDescription);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user) return;
    if (generatedDescription === "Your generated description will appear here..." || generatedDescription === "Generating your content...") {
        alert("Please generate a description before saving.");
        return;
    }
    
    try {
        await listingService.updateListing(listingId, { ...listing, generatedDescription, userId: user.id }); 
        
        // If in workflow, go to next tool
        if (isInWorkflow) {
          const currentIndex = workflowTools.indexOf('desc');
          const nextToolId = workflowTools[currentIndex + 1];
          
          if (nextToolId) {
            const nextTool = TOOLKIT_TOOLS.find(tool => tool.id === nextToolId);
            if (nextTool && nextTool.pathSuffix) {
              navigate(`/listings/${listingId}${nextTool.pathSuffix}?workflow=${workflowParam}`);
              return;
            }
          }
        }
        
        // Default: go back to listing
        navigate(`/listings/${listingId}`); 
    } catch (e) {
        alert("Failed to save description.");
        console.error("Save error:", e);
    }
  };

  const handleCopyDescription = () => {
    if (generatedDescription === "Your generated description will appear here..." || generatedDescription === "Generating your content...") {
        alert("Please generate a description to copy.");
        return;
    }
    navigator.clipboard.writeText(generatedDescription)
      .then(() => alert("Description copied to clipboard!"))
      .catch(err => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy description.");
      });
  };

  const handleRefreshDescription = () => {
    handleGenerateDescription();
  };

  if (isLoadingPage) {
    return (
      <ModernDashboardLayout
        title="Edit Property Description"
        subtitle="Generate and customize your property description"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModernDashboardLayout
        title="Edit Property Description"
        subtitle="Generate and customize your property description"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="glass" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }
  
  if (!listing) {
    return (
      <ModernDashboardLayout
        title="Edit Property Description"
        subtitle="Generate and customize your property description"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-slate-400">Listing data is unavailable.</p>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  const headerActions = (
    <Link to={getPreviousStepPath()}>
      <Button 
        variant="glass" 
        size="sm"
        leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
      >
        Back to {getPreviousStepName()}
      </Button>
    </Link>
  );

  return (
    <ModernDashboardLayout
      title="Edit Property Description"
      subtitle="Generate and customize your property description"
      actions={headerActions}
    >
      <div className="space-y-8">
        {isInWorkflow && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <WorkflowNavigation 
                workflowTools={workflowTools} 
                currentToolId="desc" 
              />
            </div>
          </div>
        )}
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <PropertySummaryHeader listing={listing} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Style Selection Panel */}
          <div className="xl:col-span-1">
            <div className="relative group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <SparklesSolidIcon className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Description Style</h3>
                </div>
                <p className="text-slate-400 mb-6">Choose your preferred writing style.</p>
                <div className="space-y-3 mb-8">
                  {DESCRIPTION_STYLES.map(style => (
                    <StyleButton
                      key={style.id}
                      name={style.name}
                      description={style.description}
                      isSelected={selectedStyle === style.id}
                      onClick={() => setSelectedStyle(style.id)}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleGenerateDescription}
                  isLoading={isGenerating}
                  disabled={isGenerating}
                  variant="gradient"
                  leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
                  size="lg"
                  fullWidth
                >
                  {isGenerating ? 'Generating...' : 'Generate New Description'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="xl:col-span-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Generated Description</h3>
                    <p className="text-slate-400">Edit and customize your generated content.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefreshDescription}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all duration-200"
                      title="Regenerate description"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCopyDescription}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all duration-200"
                      title="Copy to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Textarea
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    placeholder="Your generated description will appear here..."
                    className="w-full"
                    rows={12}
                    disabled={isGenerating}
                    variant="gradient"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-400 mb-4 sm:mb-0">Character count: {charCount}</p>
                    <Button
                      onClick={handleConfirmAndSave}
                      variant="glow"
                      glowColor="emerald"
                      leftIcon={<CheckIcon className="h-5 w-5" />}
                      size="lg"
                    >
                      Confirm & Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default ListingDescriptionGeneratorPage;