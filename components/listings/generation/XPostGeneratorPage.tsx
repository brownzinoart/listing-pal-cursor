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
import ModernDashboardLayout from '../../shared/ModernDashboardLayout';
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

  if (isLoadingPage) {
    return (
      <ModernDashboardLayout
        title="Generate X (Twitter) Post"
        subtitle="Create engaging social media content for your property"
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
        title="Generate X (Twitter) Post"
        subtitle="Create engaging social media content for your property"
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
        title="Generate X (Twitter) Post"
        subtitle="Create engaging social media content for your property"
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
      title="Generate X (Twitter) Post"
      subtitle="Create engaging social media content for your property"
      actions={headerActions}
    >
      <div className="space-y-8">
        {isInWorkflow && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <WorkflowNavigation 
                workflowTools={workflowTools} 
                currentToolId="x" 
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <div className="order-2 xl:order-1">
            <div className="relative group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">X (Twitter) Post Preview</h3>
                <div className="mb-8">
                  <XMockup listingImage={listing.images?.[0]?.url} postText={generatedPost} charCount={charCount} />
                </div>
                <Button 
                  onClick={handleGeneratePost} 
                  isLoading={isGenerating} 
                  disabled={isGenerating} 
                  variant="gradient"
                  leftIcon={<SparklesOutlineIcon className="h-5 w-5" />} 
                  size="lg"
                  fullWidth
                >
                  {isGenerating ? 'Generating...' : 'Generate New Post'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="order-1 xl:order-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Generated X Post</h3>
                    <p className="text-slate-400">Edit and customize your generated content.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all duration-200"
                      title="Regenerate post"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all duration-200"
                      title="Copy to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
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
                    <p className={`text-sm mb-4 sm:mb-0 ${
                      charLimitExceeded ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      Character count: <span className="font-semibold">{charCount}</span>
                      <span className="text-slate-500"> / 280</span>
                      {charLimitExceeded && <span className="text-red-400 ml-2">Limit exceeded!</span>}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handlePublishNow}
                        disabled={generatedPost.includes("Your generated") || generatedPost.includes("Generating your content") || isGenerating || charLimitExceeded}
                        variant="gradient"
                        glowColor="blue"
                        leftIcon={<ShareIcon className="h-5 w-5" />}
                        size="lg"
                      >
                        Publish Now
                      </Button>
                      <Button
                        onClick={handleConfirmAndSave}
                        disabled={charLimitExceeded}
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
      </div>
    </ModernDashboardLayout>
  );
};

export default XPostGeneratorPage;
