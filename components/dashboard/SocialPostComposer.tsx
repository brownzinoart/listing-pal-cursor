import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { SocialPost } from './SocialPostsDashboard';
import Button from '../shared/Button';
import Textarea from '../shared/Textarea';
import FacebookMockup from '../listings/generation/FacebookMockup';
import InstagramMockup from '../listings/generation/InstagramMockup';
import XMockup from '../listings/generation/XMockup';

interface SocialPostComposerProps {
  post?: SocialPost | null;
  onClose: () => void;
  onSave: (post: Partial<SocialPost>) => void;
}

type Platform = 'facebook' | 'instagram' | 'twitter';

const SocialPostComposer: React.FC<SocialPostComposerProps> = ({ post, onClose, onSave }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    post ? [post.platform] : ['facebook']
  );
  const [content, setContent] = useState(post?.content || '');
  const [hashtags, setHashtags] = useState(post?.hashtags.join(' ') || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState<SocialPost['status']>(post?.status || 'draft');
  const [selectedListing, setSelectedListing] = useState(post?.listingId || '');
  const [activePlatform, setActivePlatform] = useState<Platform>(
    post?.platform || 'facebook'
  );

  // Mock listings data
  const mockListings = [
    { id: 'listing-1', address: '123 Maple Street, Sunnyvale, CA' },
    { id: 'listing-2', address: '456 Oak Avenue, Palo Alto, CA' },
    { id: 'listing-3', address: '789 Pine Lane, Mountain View, CA' },
    { id: 'listing-4', address: '321 Elm Street, San Jose, CA' }
  ];

  const platformData = {
    facebook: { icon: FaFacebook, name: 'Facebook', color: 'text-blue-600', charLimit: 63206 },
    instagram: { icon: FaInstagram, name: 'Instagram', color: 'text-pink-600', charLimit: 2200 },
    twitter: { icon: FaTwitter, name: 'Twitter', color: 'text-sky-500', charLimit: 280 }
  };

  useEffect(() => {
    if (post?.scheduledDate) {
      const date = new Date(post.scheduledDate);
      setScheduledDate(date.toISOString().split('T')[0]);
      setScheduledTime(date.toTimeString().slice(0, 5));
    }
  }, [post]);

  const handlePlatformToggle = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
        if (activePlatform === platform) {
          setActivePlatform(selectedPlatforms.find(p => p !== platform)!);
        }
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
      setActivePlatform(platform);
    }
  };

  const handleGenerateContent = () => {
    // Mock AI generation
    const templates = {
      facebook: `🏡 Just listed! Check out this stunning property at ${mockListings.find(l => l.id === selectedListing)?.address || 'your dream location'}!\n\n✨ Key Features:\n• Spacious living areas\n• Modern kitchen\n• Beautiful backyard\n• Prime location\n\nDon't miss this opportunity! Contact us today to schedule a viewing.\n\n📞 Call: (555) 123-4567\n📧 Email: info@realestate.com`,
      instagram: `✨ Dream home alert! ✨\n\n📍 ${mockListings.find(l => l.id === selectedListing)?.address || 'Prime Location'}\n\nThis gorgeous property won't last long! Swipe to see all the amazing features that make this house a HOME. 🏡\n\nDM us for exclusive viewing opportunities!`,
      twitter: `🏡 NEW LISTING: ${mockListings.find(l => l.id === selectedListing)?.address || 'Amazing Property'}\n\n✅ Move-in ready\n✅ Updated throughout\n✅ Great neighborhood\n\nSchedule your tour today! 🔑`
    };

    setContent(templates[activePlatform]);
    
    // Generate relevant hashtags
    const commonHashtags = ['realestate', 'forsale', 'newhome', 'property', 'realtor'];
    const platformHashtags = {
      facebook: ['homeforsale', 'openhouse'],
      instagram: ['homesweethome', 'luxuryhomes', 'propertyoftheday'],
      twitter: ['realty', 'housing']
    };
    
    setHashtags([...commonHashtags.slice(0, 3), ...platformHashtags[activePlatform]].join(' '));
  };

  const handleSave = () => {
    const hashtagArray = hashtags.split(/\s+/).filter(tag => tag.startsWith('#')).map(tag => tag.slice(1));
    
    if (selectedPlatforms.length === 1) {
      // Single platform post
      onSave({
        id: post?.id,
        listingId: selectedListing,
        listingAddress: mockListings.find(l => l.id === selectedListing)?.address || '',
        platform: selectedPlatforms[0],
        content,
        hashtags: hashtagArray,
        status,
        scheduledDate: status === 'scheduled' && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : undefined,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Multi-platform posts
      selectedPlatforms.forEach(platform => {
        onSave({
          listingId: selectedListing,
          listingAddress: mockListings.find(l => l.id === selectedListing)?.address || '',
          platform,
          content,
          hashtags: hashtagArray,
          status,
          scheduledDate: status === 'scheduled' && scheduledDate && scheduledTime
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
            : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }
  };

  const getMockupComponent = () => {
    const listing = {
      id: selectedListing,
      userId: '1',
      address: mockListings.find(l => l.id === selectedListing)?.address || '',
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2500,
      yearBuilt: 2020,
      price: 850000,
      keyFeatures: '',
      images: []
    };

    switch (activePlatform) {
      case 'facebook':
        return <FacebookMockup listing={listing} generatedPost={content} />;
      case 'instagram':
        return <InstagramMockup listing={listing} generatedCaption={content} />;
      case 'twitter':
        return <XMockup listing={listing} generatedPost={content} />;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-6xl w-full bg-brand-panel rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-brand-border">
            <Dialog.Title className="text-2xl font-bold text-brand-text-primary">
              {post ? 'Edit Social Post' : 'Create Social Post'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Post Editor */}
              <div className="space-y-6">
                {/* Listing Selection */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Select Listing
                  </label>
                  <select
                    value={selectedListing}
                    onChange={(e) => setSelectedListing(e.target.value)}
                    className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">Choose a listing...</option>
                    {mockListings.map(listing => (
                      <option key={listing.id} value={listing.id}>
                        {listing.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Platforms
                  </label>
                  <div className="flex gap-3">
                    {(Object.entries(platformData) as [Platform, typeof platformData[Platform]][]).map(([platform, data]) => (
                      <button
                        key={platform}
                        onClick={() => handlePlatformToggle(platform)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedPlatforms.includes(platform)
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-brand-border hover:border-brand-primary/50'
                        }`}
                      >
                        <data.icon className={`h-4 w-4 ${data.color}`} />
                        <span className="text-sm font-medium">{data.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-brand-text-secondary">
                      Post Content
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<SparklesIcon className="h-4 w-4" />}
                      onClick={handleGenerateContent}
                      disabled={!selectedListing}
                    >
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    placeholder="Write your post content here..."
                    variant="gradient"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-brand-text-secondary">
                      {content.length} / {platformData[activePlatform].charLimit} characters
                    </span>
                    {content.length > platformData[activePlatform].charLimit && (
                      <span className="text-xs text-red-500">
                        Exceeds {platformData[activePlatform].name} limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#realestate #forsale #newhome"
                    className="w-full bg-brand-background border border-brand-border rounded-md px-3 py-2 text-brand-text-primary placeholder-brand-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Scheduling */}
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Post Status
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={(e) => setStatus(e.target.value as SocialPost['status'])}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-brand-text-primary">Save as Draft</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={status === 'scheduled'}
                        onChange={(e) => setStatus(e.target.value as SocialPost['status'])}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-brand-text-primary">Schedule Post</span>
                    </label>
                  </div>
                  
                  {status === 'scheduled' && (
                    <div className="mt-3 flex gap-3">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="flex-1 bg-brand-background border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="bg-brand-background border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Preview */}
              <div>
                <div className="bg-brand-background rounded-lg border border-brand-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-brand-text-primary">Preview</h3>
                    {selectedPlatforms.length > 1 && (
                      <div className="flex gap-2">
                        {selectedPlatforms.map(platform => {
                          const data = platformData[platform];
                          return (
                            <button
                              key={platform}
                              onClick={() => setActivePlatform(platform)}
                              className={`p-2 rounded-md transition-colors ${
                                activePlatform === platform
                                  ? 'bg-brand-primary text-white'
                                  : 'text-brand-text-secondary hover:text-brand-text-primary'
                              }`}
                            >
                              <data.icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center min-h-[400px]">
                    {content ? (
                      getMockupComponent()
                    ) : (
                      <p className="text-brand-text-secondary text-center">
                        Start typing to see a preview of your post
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-brand-border">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!content || !selectedListing || selectedPlatforms.length === 0}
              >
                {selectedPlatforms.length > 1
                  ? `${status === 'scheduled' ? 'Schedule' : 'Save'} to ${selectedPlatforms.length} Platforms`
                  : status === 'scheduled' ? 'Schedule Post' : 'Save Post'}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SocialPostComposer;