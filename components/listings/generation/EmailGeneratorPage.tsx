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
import EmailMockup from './EmailMockup';
import StyleButton from './StyleButton';
import ModernDashboardLayout from '../../shared/ModernDashboardLayout';
import { ArrowLeftIcon, SparklesIcon as SparklesOutlineIcon, ClipboardDocumentIcon, ArrowPathIcon, CheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Email theme types and constants
type EmailTheme = 'OPEN_HOUSE' | 'PRICE_REDUCTION' | 'NEW_LISTING' | 'UNDER_CONTRACT' | 'MARKET_UPDATE' | 'EXCLUSIVE_SHOWING' | 'FOLLOW_UP' | 'COMING_SOON';

const EMAIL_THEMES: { id: EmailTheme; name: string; description: string }[] = [
  { id: 'NEW_LISTING', name: 'New Listing Alert', description: 'Announce a fresh property on the market' },
  { id: 'OPEN_HOUSE', name: 'Open House Invitation', description: 'Invite prospects to view the property' },
  { id: 'PRICE_REDUCTION', name: 'Price Reduction Notice', description: 'Alert about updated pricing' },
  { id: 'UNDER_CONTRACT', name: 'Under Contract Update', description: 'Notify that property is pending sale' },
  { id: 'EXCLUSIVE_SHOWING', name: 'Exclusive Showing', description: 'Private viewing invitation for VIP clients' },
  { id: 'MARKET_UPDATE', name: 'Market Report', description: 'Share neighborhood market insights' },
  { id: 'FOLLOW_UP', name: 'Follow-up Check-in', description: 'Professional follow-up with prospects' },
  { id: 'COMING_SOON', name: 'Coming Soon Teaser', description: 'Build anticipation for upcoming listing' },
];

const EmailGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<EmailTheme>('NEW_LISTING');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  // Workflow management
  const workflowParam = searchParams.get('workflow');
  const workflowTools = workflowParam ? workflowParam.split(',') : [];
  const isInWorkflow = workflowTools.length > 1;

  // Theme from URL parameter (for deep linking from dashboard)
  const themeParam = searchParams.get('theme') as EmailTheme;
  
  // Set initial theme from URL parameter
  useEffect(() => {
    if (themeParam && EMAIL_THEMES.find(theme => theme.id === themeParam)) {
      setSelectedTheme(themeParam);
    }
  }, [themeParam]);

  // Get previous step name for back navigation
  const getPreviousStepName = () => {
    if (!isInWorkflow) return 'Property';
    const currentIndex = workflowTools.indexOf('email');
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(tool => tool.id === previousToolId);
      return previousTool?.name || 'Previous Step';
    }
    return 'Property';
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf('email');
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
          setGeneratedEmail(data.generatedEmail || "Your generated introductory email will appear here...");
        } else {
          setError(data ? "Permission denied." : "Listing not found.");
        }
      })
      .catch(() => setError('Failed to fetch listing details.'))
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  useEffect(() => {
    setCharCount(generatedEmail.length);
  }, [generatedEmail]);

  const generateThemeSpecificEmail = (listing: Listing, theme: EmailTheme): string => {
    const baseFeatures = listing.keyFeatures.split(',').slice(0, 4).map(feature => `• ${feature.trim()}`);
    
    switch (theme) {
      case 'NEW_LISTING':
        return `Subject: Just Listed - ${listing.address.split(',')[0]} Available!

Dear [Client Name],

I'm excited to share this beautiful new listing with you! This stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom home at ${listing.address.split(',')[0]} is everything you've been searching for and more.

At ${listing.squareFootage} square feet, this ${listing.yearBuilt} property offers the perfect blend of modern comfort and timeless elegance at $${listing.price.toLocaleString()}.

✨ What makes this property special:
${baseFeatures.join('\n')}

I'd love to arrange a private showing at your convenience. Properties like this don't stay on the market long!

Best regards,
[Your Name]`;

      case 'OPEN_HOUSE':
        return `Subject: Open House This Weekend - ${listing.address.split(',')[0]}

You're Invited to an Exclusive Open House!

Join us this Saturday and Sunday from 1-4 PM for an exclusive open house at ${listing.address.split(',')[0]}.

This stunning home features:
🏡 ${listing.bedrooms} bedrooms, ${listing.bathrooms} bathrooms
🏡 ${listing.squareFootage} sq ft of thoughtfully designed space
🏡 Priced at $${listing.price.toLocaleString()}
${baseFeatures.map(f => `🏡 ${f.replace('• ', '')}`).join('\n')}

Light refreshments will be provided. Come see why this could be your dream home!

RSVP appreciated but not required.

Looking forward to seeing you there!
[Your Name]`;

      case 'PRICE_REDUCTION':
        return `Subject: Price Reduced - Great Opportunity at ${listing.address.split(',')[0]}

Great news! The price has been reduced on this excellent property at ${listing.address.split(',')[0]}.

New Price: $${listing.price.toLocaleString()} (reduced for quick sale!)

This ${listing.bedrooms}BR/${listing.bathrooms}BA home offers:
${baseFeatures.join('\n')}
• ${listing.squareFootage} sq ft of living space
• Built in ${listing.yearBuilt}

This is a rare opportunity in today's market. Let's schedule a viewing this week!

Best regards,
[Your Name]`;

      case 'MARKET_UPDATE':
        return `Subject: Local Market Update - ${listing.address.split(',')[1]?.trim()} Real Estate

Dear [Client Name],

Here's what's happening in our local market, featuring a spotlight on ${listing.address.split(',')[0]}:

📈 Market Trends:
• Properties in this area showing strong demand
• Average days on market: 25-30 days
• Inventory remains competitive with quality homes

🏘️ Property Spotlight:
${listing.address.split(',')[0]} - $${listing.price.toLocaleString()}
${listing.bedrooms}BR/${listing.bathrooms}BA | ${listing.squareFootage} sq ft | Built ${listing.yearBuilt}

Key features that make this stand out:
${baseFeatures.join('\n')}

🔮 Looking Ahead:
This type of property continues to attract multiple offers. Great time for both buyers and sellers.

Let me know if you'd like to discuss market opportunities!

Best regards,
[Your Name]`;

      case 'EXCLUSIVE_SHOWING':
        return `Subject: Exclusive Private Showing - ${listing.address.split(',')[0]}

Dear [Client Name],

You're invited to an exclusive private showing of one of my most exciting listings before it hits the public market.

🌟 EXCLUSIVE OPPORTUNITY 🌟
${listing.address.split(',')[0]}
${listing.bedrooms}BR/${listing.bathrooms}BA | ${listing.squareFootage} sq ft | $${listing.price.toLocaleString()}

VIP Preview Features:
${baseFeatures.join('\n')}

This private showing is reserved for my valued clients only. I believe this property perfectly matches what you've been looking for.

Available viewing times:
• This Saturday 10-11 AM (Private)
• This Sunday 2-3 PM (Private)

Please let me know which time works best for you.

Exclusively yours,
[Your Name]`;

      case 'FOLLOW_UP':
        return `Subject: Following Up - ${listing.address.split(',')[0]} Still Available

Dear [Client Name],

I wanted to follow up on the property I shared with you at ${listing.address.split(',')[0]}. I know you were interested, and I have some updates to share.

Property Details Reminder:
• ${listing.bedrooms} bedrooms, ${listing.bathrooms} bathrooms
• ${listing.squareFootage} square feet
• $${listing.price.toLocaleString()}
• Built in ${listing.yearBuilt}

Recent Interest:
This property has been generating interest, but I wanted to give you first priority since we discussed your specific needs.

Key Features You Mentioned:
${baseFeatures.join('\n')}

Would you like to schedule a viewing this week? I have flexible availability and can work around your schedule.

Looking forward to hearing from you!

Best regards,
[Your Name]`;

      case 'COMING_SOON':
        return `Subject: Coming Soon - Exclusive Preview of ${listing.address.split(',')[0]}

Dear [Client Name],

🔜 COMING SOON ALERT 🔜

I'm excited to give you an exclusive preview of a stunning property that will be hitting the market next week:

${listing.address.split(',')[0]}
${listing.bedrooms}BR/${listing.bathrooms}BA | ${listing.squareFootage} sq ft

Expected List Price: $${listing.price.toLocaleString()}
Built: ${listing.yearBuilt}

Sneak Peek Features:
${baseFeatures.join('\n')}

🎯 Why I'm Reaching Out:
Based on our previous conversations, this property checks all your boxes. I wanted to give you advance notice before it goes public.

Next Steps:
• Property photos will be ready Monday
• Official listing goes live Wednesday
• Private showings available Tuesday

Interested in an early viewing? Let me know and I'll arrange something special for you.

Exclusively yours,
[Your Name]`;

      case 'UNDER_CONTRACT':
        return `Subject: Under Contract - ${listing.address.split(',')[0]} Update

Dear [Client Name],

I wanted to update you on the property at ${listing.address.split(',')[0]} that you showed interest in.

📝 STATUS UPDATE: UNDER CONTRACT

Property Details:
• ${listing.bedrooms} bedrooms, ${listing.bathrooms} bathrooms  
• ${listing.squareFootage} square feet
• Final price: $${listing.price.toLocaleString()}
• Built in ${listing.yearBuilt}

What This Means:
The property is now pending sale, but I wanted to keep you informed since you were interested.

🔍 Good News:
I have several similar properties coming on the market that match your criteria:
${baseFeatures.join('\n')}

Would you like me to send you details on these upcoming opportunities? I can arrange private showings before they go public.

Let's find you the perfect home!

Best regards,
[Your Name]`;

      default:
        return generateThemeSpecificEmail(listing, 'NEW_LISTING');
    }
  };

  const handleGenerateEmail = async () => {
    if (!listing) return;
    setIsGenerating(true);
    setGeneratedEmail('Generating your exciting email content...');
    
    try {
      const aiEmail = await ollamaService.generateIntroEmail(listing, selectedTheme);
      setGeneratedEmail(aiEmail);
    } catch (error) {
      console.error('Generation error:', error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockEmail = generateThemeSpecificEmail(listing, selectedTheme);
      setGeneratedEmail(mockEmail);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user) return;
    if (generatedEmail.includes("Your generated") || generatedEmail.includes("Generating your content")) {
      alert("Please generate an email before saving.");
      return;
    }
    
    try {
      await listingService.updateListing(listingId, { 
        ...listing, 
        generatedEmail: generatedEmail, 
        userId: user.id 
      });
      
      // If in workflow, go to next tool
      if (isInWorkflow) {
        const currentIndex = workflowTools.indexOf('email');
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
      alert("Failed to save email.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail)
      .then(() => alert("Email copied to clipboard!"))
      .catch(() => alert("Copy failed."));
  };

  const handleRefresh = () => {
    handleGenerateEmail();
  };

  if (isLoadingPage) {
    return (
      <ModernDashboardLayout
        title="Generate Email Campaign"
        subtitle="Create engaging email content for your property"
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
        title="Generate Email Campaign"
        subtitle="Create engaging email content for your property"
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
        title="Generate Email Campaign"
        subtitle="Create engaging email content for your property"
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
      title="Generate Email Campaign"
      subtitle="Create engaging email content for your property"
      actions={headerActions}
    >
      <div className="space-y-8">
        {isInWorkflow && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <WorkflowNavigation 
                workflowTools={workflowTools} 
                currentToolId="email" 
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
          {/* Theme Selection Panel */}
          <div className="xl:col-span-1">
            <div className="relative group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <EnvelopeIcon className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Email Theme</h3>
                </div>
                <p className="text-slate-400 mb-6">Choose your email campaign style.</p>
                <div className="space-y-3 mb-8">
                  {EMAIL_THEMES.map(theme => (
                    <StyleButton
                      key={theme.id}
                      name={theme.name}
                      description={theme.description}
                      isSelected={selectedTheme === theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleGenerateEmail}
                  isLoading={isGenerating}
                  disabled={isGenerating}
                  variant="gradient"
                  leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
                  size="lg"
                  fullWidth
                >
                  {isGenerating ? 'Generating...' : 'Generate Email'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-1">
            <div className="relative group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Email Preview</h3>
                <div className="mb-8">
                  <EmailMockup emailContent={generatedEmail} />
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="xl:col-span-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Generated Email</h3>
                    <p className="text-slate-400">Edit and customize your generated content.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all duration-200"
                      title="Regenerate email"
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
                    value={generatedEmail} 
                    onChange={(e) => setGeneratedEmail(e.target.value)} 
                    placeholder="Email content..." 
                    className="w-full" 
                    rows={16} 
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

export default EmailGeneratorPage; 