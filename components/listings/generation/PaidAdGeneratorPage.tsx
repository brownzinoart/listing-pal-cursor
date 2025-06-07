import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { ollamaService } from '../../../services/ollamaService';
import { Listing, AdPlatform, AdCopyStyle, GeneratedAd } from '../../../types';
import { TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import Textarea from '../../shared/Textarea';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import { 
  ArrowLeftIcon, 
  SparklesIcon as SparklesOutlineIcon, 
  ClipboardDocumentIcon, 
  ArrowPathIcon, 
  CheckIcon,
  MegaphoneIcon,
  UserGroupIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

// Platform configurations
const AD_PLATFORMS: AdPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook Ads',
    description: 'Facebook & Instagram advertising',
    maxCharacters: 125,
    imageAspectRatio: '1.91:1'
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Search and display advertising',
    maxCharacters: 90,
    imageAspectRatio: '1.2:1'
  },
  {
    id: 'instagram',
    name: 'Instagram Ads',
    description: 'Instagram stories and feed ads',
    maxCharacters: 125,
    imageAspectRatio: '1:1'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    description: 'Professional network advertising',
    maxCharacters: 150,
    imageAspectRatio: '1.91:1'
  }
];

const AD_COPY_STYLES: AdCopyStyle[] = [
  {
    id: 'urgency',
    name: 'Create Urgency',
    description: 'Drive immediate action with time-sensitive language',
    tone: 'urgent'
  },
  {
    id: 'luxury',
    name: 'Luxury Appeal',
    description: 'Sophisticated copy for high-end properties',
    tone: 'elegant'
  },
  {
    id: 'family',
    name: 'Family-Focused',
    description: 'Emphasize comfort, safety, and community',
    tone: 'warm'
  },
  {
    id: 'investment',
    name: 'Investment Opportunity',
    description: 'Focus on ROI and financial benefits',
    tone: 'professional'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Marketing',
    description: 'Sell the dream and emotional connection',
    tone: 'aspirational'
  }
];

const TARGET_AUDIENCES = [
  'First-time homebuyers',
  'Growing families',
  'Empty nesters',
  'Real estate investors',
  'Luxury buyers',
  'Young professionals',
  'Retirees',
  'Move-up buyers'
];

const CALL_TO_ACTIONS = [
  'Schedule a Showing',
  'Get More Info',
  'Contact Agent',
  'View Virtual Tour',
  'Download Brochure',
  'Learn More',
  'Book Consultation',
  'Request Details'
];

const PaidAdGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(AD_PLATFORMS[0].id);
  const [selectedStyle, setSelectedStyle] = useState<string>(AD_COPY_STYLES[0].id);
  const [selectedAudience, setSelectedAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [selectedCTA, setSelectedCTA] = useState<string>(CALL_TO_ACTIONS[0]);
  
  const [generatedHeadline, setGeneratedHeadline] = useState<string>('');
  const [generatedBody, setGeneratedBody] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  // Workflow management
  const workflowParam = searchParams.get('workflow');
  const workflowTools = workflowParam ? workflowParam.split(',') : [];
  const isInWorkflow = workflowTools.length > 1;

  const getPreviousStepName = () => {
    if (!isInWorkflow) return 'Property';
    const currentIndex = workflowTools.indexOf('ads');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('ads');
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

  useEffect(() => {
    setCharCount((generatedHeadline + ' ' + generatedBody).length);
  }, [generatedHeadline, generatedBody]);

  const handleGenerateAd = async () => {
    if (!listing) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const platform = AD_PLATFORMS.find(p => p.id === selectedPlatform);
      const style = AD_COPY_STYLES.find(s => s.id === selectedStyle);
      
      const prompt = `Create a compelling paid social media ad for this real estate listing:

Property Details:
- Address: ${listing.address}
- Price: $${listing.price.toLocaleString()}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square Feet: ${listing.squareFootage.toLocaleString()}
- Year Built: ${listing.yearBuilt}
- Property Type: ${listing.propertyType || 'Residential'}
- Key Features: ${listing.keyFeatures}

Ad Specifications:
- Platform: ${platform?.name}
- Style: ${style?.name} - ${style?.description}
- Target Audience: ${selectedAudience}
- Call to Action: ${selectedCTA}
- Maximum Characters: ${platform?.maxCharacters}
- Tone: ${style?.tone}

Requirements:
1. Create a compelling headline (max 25 words)
2. Write engaging body copy that highlights the property's best features
3. Use ${style?.tone} tone throughout
4. Appeal specifically to ${selectedAudience}
5. Include emotional triggers and benefits
6. Keep total character count under ${platform?.maxCharacters}
7. Make it action-oriented for ${selectedCTA}

Return the response in this exact format:
HEADLINE: [headline text]
BODY: [body text]`;

      const response = await ollamaService.generateContent(prompt);
      
      // Parse the response
      const headlineMatch = response.match(/HEADLINE:\s*(.+?)(?=\nBODY:|$)/s);
      const bodyMatch = response.match(/BODY:\s*(.+?)$/s);
      
      if (headlineMatch && bodyMatch) {
        setGeneratedHeadline(headlineMatch[1].trim());
        setGeneratedBody(bodyMatch[1].trim());
      } else {
        // Fallback parsing
        const lines = response.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          setGeneratedHeadline(lines[0]);
          setGeneratedBody(lines.slice(1).join(' '));
        } else {
          setGeneratedBody(response);
          setGeneratedHeadline('Discover Your Dream Home');
        }
      }
    } catch (error) {
      console.error('Error generating ad:', error);
      setError('Failed to generate ad copy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user) return;
    if (!generatedHeadline || !generatedBody) {
      alert("Please generate ad copy before saving.");
      return;
    }
    
    try {
      const newAd: GeneratedAd = {
        id: Date.now().toString(),
        platform: selectedPlatform,
        style: selectedStyle,
        headline: generatedHeadline,
        body: generatedBody,
        callToAction: selectedCTA,
        targetAudience: selectedAudience,
        imageUrl: listing.images?.[0]?.url,
        createdAt: new Date().toISOString()
      };

      const existingAds = listing.generatedAds || [];
      const updatedAds = [...existingAds, newAd];
      
      await listingService.updateListing(listingId, { 
        ...listing, 
        generatedAds: updatedAds,
        userId: user.id 
      });
      
      // If in workflow, go to next tool
      if (isInWorkflow) {
        const currentIndex = workflowTools.indexOf('ads');
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
      alert("Failed to save ad. Please try again.");
    }
  };

  const handleCopy = () => {
    const fullAd = `${generatedHeadline}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullAd)
      .then(() => alert("Ad copy copied to clipboard!"))
      .catch(() => alert("Copy failed."));
  };

  const handleRefresh = () => {
    handleGenerateAd();
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

  const selectedPlatformData = AD_PLATFORMS.find(p => p.id === selectedPlatform);
  const selectedStyleData = AD_COPY_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to={getPreviousStepPath()} className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back to {getPreviousStepName()}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Generate Paid Social Media Ad</h1>
        
        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation 
              workflowTools={workflowTools} 
              currentToolId="ads" 
            />
          </div>
        )}
        
        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Configuration Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Platform Selection */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2" />
                Ad Platform
              </h3>
              <div className="space-y-3">
                {AD_PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedPlatform === platform.id
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-brand-border bg-brand-card hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-brand-text-primary">{platform.name}</h4>
                      <span className="text-xs text-brand-text-tertiary">{platform.maxCharacters} char max</span>
                    </div>
                    <p className="text-sm text-brand-text-secondary">{platform.description}</p>
                    <p className="text-xs text-brand-text-tertiary mt-1">Image ratio: {platform.imageAspectRatio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Style */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <CursorArrowRaysIcon className="h-5 w-5 mr-2" />
                Ad Style
              </h3>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary mb-3"
              >
                {AD_COPY_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
              {selectedStyleData && (
                <p className="text-sm text-brand-text-secondary">{selectedStyleData.description}</p>
              )}
            </div>

            {/* Target Audience */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Target Audience
              </h3>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary"
              >
                {TARGET_AUDIENCES.map((audience) => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
            </div>

            {/* Call to Action */}
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Call to Action</h3>
              <select
                value={selectedCTA}
                onChange={(e) => setSelectedCTA(e.target.value)}
                className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary"
              >
                {CALL_TO_ACTIONS.map((cta) => (
                  <option key={cta} value={cta}>{cta}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateAd}
              isLoading={isGenerating}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-brand-secondary to-emerald-600 hover:from-emerald-600 hover:to-brand-secondary text-white font-semibold shadow-lg transition-all duration-300"
              leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
              size="lg"
            >
              {isGenerating ? 'Generating Ad...' : 'Generate Ad Copy'}
            </Button>
          </div>

          {/* Content Editor Panel */}
          <div className="xl:col-span-3">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 h-full min-h-[800px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-1">Generated Ad Copy</h3>
                  <p className="text-sm text-brand-text-secondary">Edit and customize your generated advertisement.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Regenerate ad"
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
              
              <div className="space-y-6 flex-1">
                {/* Headline */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-primary mb-2">
                    Headline
                  </label>
                  <Textarea 
                    value={generatedHeadline} 
                    onChange={(e) => setGeneratedHeadline(e.target.value)} 
                    placeholder="Ad headline will appear here..." 
                    className="w-full" 
                    rows={2} 
                    disabled={isGenerating} 
                    variant="gradient" 
                  />
                </div>

                {/* Body Copy */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-primary mb-2">
                    Body Copy
                  </label>
                  <Textarea 
                    value={generatedBody} 
                    onChange={(e) => setGeneratedBody(e.target.value)} 
                    placeholder="Ad body text will appear here..." 
                    className="w-full" 
                    rows={8} 
                    disabled={isGenerating} 
                    variant="gradient" 
                  />
                </div>

                {/* Ad Preview */}
                {(generatedHeadline || generatedBody) && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-brand-text-primary mb-3">Ad Preview</h4>
                    <div className="bg-white rounded-lg border p-4 shadow-sm">
                      <div className="text-sm text-gray-500 mb-2">{selectedPlatformData?.name} • Sponsored</div>
                      {generatedHeadline && (
                        <h5 className="font-semibold text-gray-900 mb-2">{generatedHeadline}</h5>
                      )}
                      {generatedBody && (
                        <p className="text-gray-700 text-sm mb-3">{generatedBody}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{selectedAudience}</span>
                        <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium">
                          {selectedCTA}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-xs text-brand-text-tertiary">
                      Character count: {charCount} / {selectedPlatformData?.maxCharacters}
                      {charCount > (selectedPlatformData?.maxCharacters || 999) && (
                        <span className="text-red-500 ml-2">Exceeds limit!</span>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={handleConfirmAndSave}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-semibold shadow-lg transition-all duration-300 px-8"
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

export default PaidAdGeneratorPage; 