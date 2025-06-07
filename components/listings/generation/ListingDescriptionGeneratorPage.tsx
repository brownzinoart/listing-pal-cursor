import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { ollamaService } from '../../../services/ollamaService';
import { Listing } from '../../../types';
import { DESCRIPTION_STYLES, DescriptionStyleId, TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import Textarea from '../../shared/Textarea';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import StyleButton from './StyleButton';
import { 
  ArrowLeftIcon, 
  SparklesIcon as SparklesOutlineIcon,
  ClipboardDocumentIcon, 
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';

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

  const handleGenerateDescription = async () => {
    if (!listing) return;
    setIsGenerating(true);
    setGeneratedDescription('Generating your content...');
    
    try {
      const selectedStyleData = DESCRIPTION_STYLES.find(s => s.id === selectedStyle);
      const aiDescription = await ollamaService.generatePropertyDescription(listing, selectedStyleData?.name || 'Professional');
      setGeneratedDescription(aiDescription);
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to mock generation
      await new Promise(resolve => setTimeout(resolve, 1500));

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
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-danger bg-red-900/20 p-4 rounded-md max-w-md mx-auto">{error}</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!listing) {
     return <p className="text-center text-brand-text-secondary py-10">Listing data is unavailable.</p>;
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to={getPreviousStepPath()} className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back to {getPreviousStepName()}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Edit Property Description</h1>
        
        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation 
              workflowTools={workflowTools} 
              currentToolId="desc" 
            />
          </div>
        )}
        
        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Style Selection Panel */}
          <div className="xl:col-span-1">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 sticky top-6">
              <div className="flex items-center mb-4">
                <SparklesSolidIcon className="h-6 w-6 text-brand-secondary mr-2" />
                <h3 className="text-xl font-semibold text-brand-text-primary">Description Style</h3>
              </div>
              <p className="text-sm text-brand-text-secondary mb-6">Choose your preferred writing style.</p>
              <div className="space-y-3 mb-6">
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
                variant="primary"
                leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
                size="lg"
                fullWidth
              >
                {isGenerating ? 'Generating...' : 'Generate New Description'}
              </Button>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="xl:col-span-2">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-1">Generated Description</h3>
                  <p className="text-sm text-brand-text-secondary">Edit and customize your generated content.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefreshDescription}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Regenerate description"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCopyDescription}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
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
                  <p className="text-xs text-brand-text-tertiary mb-4 sm:mb-0">Character count: {charCount}</p>
                  <Button
                    onClick={handleConfirmAndSave}
                    variant="primary"
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
  );
};

export default ListingDescriptionGeneratorPage;