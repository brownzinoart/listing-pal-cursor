import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { ollamaService } from '../../../services/ollamaService';
import { Listing } from '../../../types';
import { TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import Textarea from '../../shared/Textarea';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import XMockup from './XMockup';
import { ArrowLeftIcon, SparklesIcon as SparklesOutlineIcon, ClipboardDocumentIcon, ArrowPathIcon, CheckIcon, ShareIcon } from '@heroicons/react/24/outline';

const X_MAX_CHARS = 280;

const XPostGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
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
    const currentIndex = workflowTools.indexOf('x');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('x');
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
    if (!listingId) { setError("No listing ID."); setIsLoadingPage(false); return; }
    listingService.getListingById(listingId)
      .then(data => {
        if (data && data.userId === user?.id) {
          setListing(data);
          setGeneratedPost(data.generatedXPost || "Your generated X (Twitter) post will appear here...");
        } else { setError(data ? "Permission denied." : "Listing not found."); }
      })
      .catch(() => setError('Failed to fetch listing details.'))
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  useEffect(() => { 
    setCharCount(generatedPost.length); 
  }, [generatedPost]);

  const charLimitExceeded = charCount > X_MAX_CHARS;

  const handleGeneratePost = async () => {
    if (!listing) return;
    setIsGenerating(true);
    setGeneratedPost('Generating your content...');
    
    try {
      const aiPost = await ollamaService.generateXPost(listing);
      setGeneratedPost(aiPost);
    } catch (error) {
      console.error('Generation error:', error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockPost = `🏡 NEW LISTING: ${listing.bedrooms}BR/${listing.bathrooms}BA at ${listing.address.split(',')[0]}! ${listing.squareFootage} sq ft, $${listing.price.toLocaleString()}. ${listing.keyFeatures.split(',')[0]}. DM for details! #RealEstate #JustListed`;
      setGeneratedPost(mockPost);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user) return;
    if (generatedPost.includes("Your generated") || generatedPost.includes("Generating your content")) {
        alert("Please generate a post before saving."); return;
    }
    
    try {
      await listingService.updateListing(listingId, { ...listing, generatedXPost: generatedPost, userId: user.id });
      
      // If in workflow, go to next tool
      if (isInWorkflow) {
        const currentIndex = workflowTools.indexOf('x');
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
    } catch (e) { alert("Failed to save post."); }
  };

  const handlePublishNow = () => {
    alert("Publishing feature coming soon! For now, copy the content and post manually.");
  };

  const handleCopy = () => { 
    navigator.clipboard.writeText(generatedPost)
      .then(() => alert("Post copied!"))
      .catch(() => alert("Copy failed.")); 
  };

  const handleRefresh = () => {
    handleGeneratePost();
  };

  if (isLoadingPage) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;
  if (error) return <div className="text-center py-10"><p className="text-brand-danger p-4">{error}</p><Button onClick={() => navigate('/dashboard')}>Dashboard</Button></div>;
  if (!listing) return <p className="text-center">Listing not found.</p>;

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to={getPreviousStepPath()} className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Generate X (Twitter) Post</h1>
        
        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation 
              workflowTools={workflowTools} 
              currentToolId="x" 
            />
          </div>
        )}
        
        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <div className="order-2 xl:order-1">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-brand-text-primary mb-4">X (Twitter) Post Preview</h3>
              <div className="mb-6">
                                 <XMockup listingImage={listing.images?.[0]?.url} postText={generatedPost} charCount={charCount} />
              </div>
              <Button 
                onClick={handleGeneratePost} 
                isLoading={isGenerating} 
                disabled={isGenerating} 
                className="w-full bg-gradient-to-r from-brand-secondary to-emerald-600 hover:from-emerald-600 hover:to-brand-secondary text-white font-semibold shadow-lg transition-all duration-300" 
                leftIcon={<SparklesOutlineIcon className="h-5 w-5" />} 
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate New Post'}
              </Button>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="order-1 xl:order-2">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-1">Generated X Post</h3>
                  <p className="text-sm text-brand-text-secondary">Edit and customize your generated content.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Regenerate post"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <Textarea 
                  value={generatedPost} 
                  onChange={(e) => setGeneratedPost(e.target.value)} 
                  placeholder="X post content..." 
                  className="w-full" 
                  rows={8} 
                  disabled={isGenerating} 
                  variant="gradient" 
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-brand-text-secondary">
                      Character count: <span className="text-brand-text-primary font-semibold">{charCount}</span>
                      <span className="text-brand-text-tertiary"> / 280</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handlePublishNow}
                      disabled={generatedPost.includes("Your generated") || generatedPost.includes("Generating your content") || isGenerating}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-300 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      leftIcon={<ShareIcon className="h-5 w-5" />}
                      size="lg"
                    >
                      Publish Now
                    </Button>
                    <Button
                      onClick={handleConfirmAndSave}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-300 px-8"
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
    </div>
  );
};

export default XPostGeneratorPage;
