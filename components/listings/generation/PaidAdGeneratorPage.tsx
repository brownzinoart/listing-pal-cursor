import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import * as listingService from '../../../services/listingService';
import { ollamaService } from '../../../services/ollamaService';
import { Listing } from '../../../types';
import { TOOLKIT_TOOLS } from '../../../constants';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import Textarea from '../../shared/Textarea';
import PropertySummaryHeader from './PropertySummaryHeader';
import WorkflowNavigation from './WorkflowNavigation';
import AdCreativeMockup from './AdCreativeMockup';
import { ArrowLeftIcon, SparklesIcon as SparklesOutlineIcon, CheckIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaLinkedin, FaGoogle } from 'react-icons/fa';

// Define types and constants for the feature
type AdPlatform = 'facebook' | 'linkedin' | 'google';
type AdObjective = 'LEAD_GENERATION' | 'WEBSITE_TRAFFIC' | 'BRAND_AWARENESS';

interface AdCopy {
    headline: string;
    body: string;
    cta: string;
}

// Platform-specific character limits
const PLATFORM_LIMITS = {
    facebook: { headline: 40, body: 125, cta: 20 },
    linkedin: { headline: 150, body: 600, cta: 20 },
    google: { headline: 30, body: 90, cta: 20 }
};

// Platform and objective-specific best practices
const PLATFORM_OBJECTIVE_BEST_PRACTICES = {
    facebook: {
        WEBSITE_TRAFFIC: [
            '• Use a video tour or a carousel ad showing multiple high-quality photos',
            '• Install the Facebook Pixel on your website to retarget interested users',
            '• Use detailed location targeting (zip codes + radius) to reach local buyers'
        ],
        LEAD_GENERATION: [
            '• Use native Instant Forms to make it easy for users to submit their info',
            '• Offer a clear incentive, like a "free home valuation" or "exclusive photos"',
            '• Add a custom question (e.g., "Are you pre-approved?") to improve lead quality'
        ],
        BRAND_AWARENESS: [
            '• Focus on short-form video (Reels) to maximize reach',
            '• Target a wider local demographic to build brand recognition in your community',
            '• Maintain a consistent brand aesthetic (colors, fonts, logo) in all ads'
        ]
    },
    linkedin: {
        WEBSITE_TRAFFIC: [
            '• Target employees at major local companies or in specific high-income industries',
            '• Highlight the property\'s investment potential to appeal to a business-minded audience',
            '• Use polished, high-resolution, and professional imagery'
        ],
        LEAD_GENERATION: [
            '• Utilize LinkedIn Lead Gen Forms, which are pre-filled with user profile data',
            '• Offer professional value, like a "Local Market Report" or "Investor\'s Guide"',
            '• Sponsor your best-performing organic posts to leverage existing engagement'
        ],
        BRAND_AWARENESS: [
            '• Run ads from your personal LinkedIn profile to establish yourself as a local expert',
            '• Share success stories or video testimonials from happy clients',
            '• Target employees of local businesses to become the go-to agent for relocations'
        ]
    },
    google: {
        WEBSITE_TRAFFIC: [
            '• Target specific, long-tail keywords like "downtown homes for sale with a garage"',
            '• Ensure your ad headline perfectly matches the user\'s search query',
            '• Use ad extensions (sitelinks, callouts) to take up more space and provide more info'
        ],
        LEAD_GENERATION: [
            '• Use Lead Form Extensions to capture contact info directly from the search results page',
            '• Make sure your landing page headline and content directly reflect the ad\'s promise',
            '• Focus on keywords that signal strong intent, like "local real estate agent"'
        ],
        BRAND_AWARENESS: [
            '• Run visually appealing banner ads on the Display Network on local news sites and blogs',
            '• Use precise location targeting to ensure your ads are only shown in your service area',
            '• Create remarketing lists to show ads to people who have recently visited your website'
        ]
    }
};

const AD_PLATFORMS: { id: AdPlatform; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'facebook', name: 'Facebook & Instagram', icon: FaFacebook },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin },
    { id: 'google', name: 'Google Ads', icon: FaGoogle },
];

const AD_OBJECTIVES: { id: AdObjective; name: string; description: string }[] = [
    { id: 'WEBSITE_TRAFFIC', name: 'Website Traffic', description: 'Send people to your property page.' },
    { id: 'LEAD_GENERATION', name: 'Lead Generation', description: 'Collect contact info with an instant form.' },
    { id: 'BRAND_AWARENESS', name: 'Brand Awareness', description: 'Maximize the number of people who see your ad.' },
];

const PaidAdGeneratorPage: React.FC = () => {
    const { id: listingId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- State Management ---
    const [activePlatform, setActivePlatform] = useState<AdPlatform>('facebook');
    const [selectedObjective, setSelectedObjective] = useState<AdObjective>('WEBSITE_TRAFFIC');
    const [generatedAds, setGeneratedAds] = useState<Record<string, AdCopy>>({});
    const [finalizedPlatforms, setFinalizedPlatforms] = useState<Set<AdPlatform>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    
    const currentAdCopy = useMemo(() => generatedAds[activePlatform], [generatedAds, activePlatform]);
    const isCurrentPlatformFinalized = useMemo(() => finalizedPlatforms.has(activePlatform), [finalizedPlatforms, activePlatform]);

    // Character remaining calculations
    const platformLimits = PLATFORM_LIMITS[activePlatform];
    const headlineRemaining = platformLimits.headline - (currentAdCopy?.headline?.length || 0);
    const bodyRemaining = platformLimits.body - (currentAdCopy?.body?.length || 0);
    const ctaRemaining = platformLimits.cta - (currentAdCopy?.cta?.length || 0);

    // Best practices for current platform and objective
    const currentBestPractices = PLATFORM_OBJECTIVE_BEST_PRACTICES[activePlatform][selectedObjective];

    const workflowParam = searchParams.get('workflow');
    const workflowTools = workflowParam ? workflowParam.split(',') : [];
    const isInWorkflow = workflowTools.length > 1;
    const currentToolId = 'paid_ads';

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
                } else {
                    setError(data ? "Permission denied." : "Listing not found.");
                }
            })
            .catch(() => setError('Failed to fetch listing details.'))
            .finally(() => setIsLoadingPage(false));
    }, [listingId, user]);

    const handleGenerateAdCopy = async () => {
        if (!listing) return;
        setIsGenerating(true);
        setError(null);
        try {
            const objective = AD_OBJECTIVES.find(o => o.id === selectedObjective)?.name || 'Website Traffic';
            // Create platform and objective-specific context for enhanced prompting
            const platformContext = getPlatformObjectiveContext();
            const enhancedObjective = `${objective} - ${platformContext}`;
            const adCopy = await ollamaService.generateAdCopy(listing, activePlatform, enhancedObjective);
            setGeneratedAds(prev => ({ ...prev, [activePlatform]: adCopy }));
        } catch (err) {
            setError("Failed to generate ad copy from AI service.");
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerateAdCopy = async () => {
        await handleGenerateAdCopy();
    };

    const getPlatformObjectiveContext = () => {
        const contexts = {
            facebook: {
                WEBSITE_TRAFFIC: "Focus on driving clicks to the property listing. Use casual, engaging language that encourages immediate action. Highlight unique property features and create urgency.",
                LEAD_GENERATION: "Optimize for collecting contact information through Facebook's lead forms. Emphasize free consultations, property tours, or market reports as lead magnets.",
                BRAND_AWARENESS: "Build recognition for the real estate agent/agency. Focus on expertise, local market knowledge, and successful track record. Use storytelling elements."
            },
            linkedin: {
                WEBSITE_TRAFFIC: "Target real estate professionals and investors. Use professional language and focus on investment opportunities, market insights, or commercial properties.",
                LEAD_GENERATION: "Generate B2B leads for commercial real estate or referral partnerships. Emphasize professional credentials, market expertise, and business solutions.",
                BRAND_AWARENESS: "Establish thought leadership in real estate. Focus on market analysis, professional achievements, and industry expertise."
            },
            google: {
                WEBSITE_TRAFFIC: "Capture high-intent search traffic. Use specific location keywords, property types, and price ranges. Match search intent closely.",
                LEAD_GENERATION: "Target users actively searching for properties. Emphasize immediate availability, contact information, and competitive advantages.",
                BRAND_AWARENESS: "Build visibility for local real estate searches. Focus on local expertise, service areas, and unique value propositions."
            }
        };
        return contexts[activePlatform][selectedObjective];
    };
    
    const handleFinalizeAndContinue = () => {
        setFinalizedPlatforms(prev => new Set(prev).add(activePlatform));
        const currentIndex = AD_PLATFORMS.findIndex(p => p.id === activePlatform);
        const nextPlatform = AD_PLATFORMS[currentIndex + 1];
        if (nextPlatform) {
            setActivePlatform(nextPlatform.id);
        }
    };

    const handleSaveAllAds = async () => {
        if (!listingId || !listing || !user || finalizedPlatforms.size === 0) {
            alert("Please finalize at least one ad campaign before saving.");
            return;
        }

        const adsToSave = Object.entries(generatedAds)
            .filter(([platform]) => finalizedPlatforms.has(platform as AdPlatform))
            .map(([platform, copy]) => ({
                platform,
                objective: selectedObjective,
                ...copy
            }));

        try {
            await listingService.updateListing(listingId, { ...listing, generatedAdCopy: adsToSave, userId: user.id });
            navigate(`/listings/${listingId}`);
        } catch (e) {
            alert("Failed to save ad campaigns.");
        }
    };
    
    const getPreviousStepPath = () => {
        if (!isInWorkflow) return `/listings/${listingId}`;
        const currentIndex = workflowTools.indexOf(currentToolId);
        if (currentIndex > 0) {
            const previousToolId = workflowTools[currentIndex - 1];
            const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
            return previousTool?.pathSuffix ? `/listings/${listingId}${previousTool.pathSuffix}?workflow=${workflowParam}` : `/listings/${listingId}`;
        }
        return `/listings/${listingId}`;
    };

    if (isLoadingPage) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;
    if (error && !listing) return <div className="text-center py-10"><p className="text-brand-danger p-4">{error}</p><Button onClick={() => navigate('/dashboard')}>Dashboard</Button></div>;
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
                <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Generate Paid Ad Campaign</h1>
                {isInWorkflow && <div className="mb-8"><WorkflowNavigation workflowTools={workflowTools} currentToolId={currentToolId} /></div>}
                <div className="mb-8"><PropertySummaryHeader listing={listing} /></div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Platform Selection */}
                        <div className="bg-brand-panel p-6 rounded-lg border border-brand-border">
                            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">1. Select Platform</h3>
                            <div className="space-y-3">
                                {AD_PLATFORMS.map(platform => (
                                    <button 
                                        key={platform.id} 
                                        onClick={() => setActivePlatform(platform.id)} 
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${activePlatform === platform.id ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border hover:border-brand-primary/50'}`}
                                    >
                                        <div className="flex items-center">
                                            <platform.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${activePlatform === platform.id ? 'text-brand-primary' : 'text-brand-text-secondary'}`} />
                                            <span className="font-medium text-brand-text-primary text-sm">{platform.name}</span>
                                        </div>
                                        {finalizedPlatforms.has(platform.id) && <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Objective Selection */}
                        <div className="bg-brand-panel p-6 rounded-lg border border-brand-border">
                            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">2. Campaign Objective</h3>
                            <div className="space-y-3">
                                {AD_OBJECTIVES.map(objective => (
                                    <button 
                                        key={objective.id} 
                                        onClick={() => setSelectedObjective(objective.id)} 
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedObjective === objective.id ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border hover:border-brand-primary/50'}`}
                                    >
                                        <div className="font-medium text-brand-text-primary text-sm">{objective.name}</div>
                                        <div className="text-xs text-brand-text-secondary mt-1">{objective.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate & Finalize */}
                        <div className="bg-brand-panel p-6 rounded-lg border border-brand-border">
                            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">3. Generate & Finalize</h3>
                            {isCurrentPlatformFinalized ? (
                                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <CheckIcon className="h-8 w-8 mx-auto text-green-500 mb-2"/>
                                    <p className="font-semibold text-green-400 text-sm">"{AD_PLATFORMS.find(p=>p.id === activePlatform)?.name}" ad is finalized!</p>
                                    <p className="text-xs text-green-500/80 mt-1">Select another platform to continue.</p>
                                </div>
                            ) : (
                                <Button 
                                    onClick={!currentAdCopy ? handleGenerateAdCopy : handleFinalizeAndContinue} 
                                    isLoading={isGenerating} 
                                    disabled={isGenerating} 
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    leftIcon={!currentAdCopy ? <SparklesOutlineIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                                >
                                    {!currentAdCopy ? 'Generate Ad Copy' : 'Finalize & Continue'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Ad Content & Preview */}
                    <div className="lg:col-span-3">
                        <div className="bg-brand-panel p-6 rounded-lg border border-brand-border">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-brand-text-primary">Ad Content & Preview</h3>
                                <div className="text-sm text-brand-text-secondary">
                                    Platform: <span className="font-medium text-brand-primary">{AD_PLATFORMS.find(p => p.id === activePlatform)?.name}</span> | 
                                    Objective: <span className="font-medium text-brand-primary">{AD_OBJECTIVES.find(o => o.id === selectedObjective)?.name}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full items-stretch">
                                {/* Ad Content Editor */}
                                <div className="flex flex-col space-y-6 min-h-full">
                                    <div className="space-y-6 flex-1">
                                        <Input
                                            label={`Headline (${headlineRemaining} characters remaining)`}
                                            value={currentAdCopy?.headline || ''}
                                            onChange={e => setGeneratedAds(p => ({...p, [activePlatform]: {...p[activePlatform]!, headline: e.target.value}}))}
                                            variant="gradient"
                                            disabled={isCurrentPlatformFinalized || isGenerating}
                                            placeholder="Your compelling headline will appear here..."
                                            inputSize="md"
                                        />
                                        
                                        <Textarea
                                            label={`Body Text (${bodyRemaining} characters remaining)`}
                                            value={currentAdCopy?.body || ''}
                                            onChange={e => setGeneratedAds(p => ({...p, [activePlatform]: {...p[activePlatform]!, body: e.target.value}}))}
                                            rows={8}
                                            variant="gradient"
                                            disabled={isCurrentPlatformFinalized || isGenerating}
                                            placeholder="Your engaging ad copy will appear here..."
                                            resizable={false}
                                        />
                                        
                                        <Input
                                            label={`Call to Action (${ctaRemaining} characters remaining)`}
                                            value={currentAdCopy?.cta || ''}
                                            onChange={e => setGeneratedAds(p => ({...p, [activePlatform]: {...p[activePlatform]!, cta: e.target.value}}))}
                                            variant="gradient"
                                            disabled={isCurrentPlatformFinalized || isGenerating}
                                            placeholder="e.g., Learn More, Contact Us, View Property"
                                            inputSize="md"
                                        />
                                    </div>

                                    {/* Best Practices Footer */}
                                    <div className="pt-6 border-t border-brand-border/30">
                                        <h5 className="text-xs font-medium text-brand-text-secondary mb-2">
                                            💡 {AD_PLATFORMS.find(p => p.id === activePlatform)?.name} - {AD_OBJECTIVES.find(o => o.id === selectedObjective)?.name}
                                        </h5>
                                        <div className="text-xs text-brand-text-tertiary space-y-0.5">
                                            {currentBestPractices.map((tip, index) => (
                                                <div key={index}>{tip}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Ad Preview */}
                                <div className="bg-brand-background p-4 rounded-lg border border-brand-border flex flex-col min-h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-medium text-brand-text-primary">Live Preview</h4>
                                        {currentAdCopy && (
                                            <Button
                                                onClick={handleRegenerateAdCopy}
                                                size="sm"
                                                variant="ghost"
                                                isLoading={isGenerating}
                                                disabled={isGenerating || isCurrentPlatformFinalized}
                                                leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                                            >
                                                Regenerate
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <AdCreativeMockup 
                                            listing={listing} 
                                            headline={currentAdCopy?.headline || ''} 
                                            body={currentAdCopy?.body || ''} 
                                            cta={currentAdCopy?.cta || ''} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-8 pt-6 border-t border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="text-sm text-brand-text-secondary">
                                    {finalizedPlatforms.size > 0 ? (
                                        <span className="text-green-500 font-medium">
                                            ✓ {finalizedPlatforms.size} ad{finalizedPlatforms.size !== 1 ? 's' : ''} finalized
                                        </span>
                                    ) : (
                                        'Generate and finalize ads for each platform'
                                    )}
                                </div>
                                <Button 
                                    onClick={handleSaveAllAds} 
                                    disabled={finalizedPlatforms.size === 0} 
                                    size="lg" 
                                    variant="primary"
                                    leftIcon={<CheckIcon className="h-5 w-5" />}
                                >
                                    Save {finalizedPlatforms.size > 0 ? finalizedPlatforms.size : ''} Ad{finalizedPlatforms.size !== 1 ? 's' : ''}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaidAdGeneratorPage; 