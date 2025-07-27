import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  EyeIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { 
  DocumentDuplicateIcon,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Mock data for description versions
const mockDescriptionVersions = [
  {
    id: 'desc-001',
    listingId: 'listing-001',
    listingAddress: '123 Oak Street, San Francisco',
    title: 'Luxury Modern Home',
    version: 'Luxury-focused',
    type: 'primary',
    length: 'extended',
    platform: 'website',
    content: 'Discover unparalleled luxury in this stunning modern masterpiece nestled in the heart of San Francisco...',
    wordCount: 247,
    createdAt: '2024-01-15',
    performance: {
      views: 1250,
      inquiries: 23,
      conversionRate: 1.84,
      engagement: 85,
      leadScore: 92
    },
    platforms: ['MLS', 'Website', 'Zillow'],
    status: 'active'
  },
  {
    id: 'desc-002',
    listingId: 'listing-001',
    listingAddress: '123 Oak Street, San Francisco',
    title: 'Family Dream Home',
    version: 'Family-focused',
    type: 'alternative',
    length: 'standard',
    platform: 'mls',
    content: 'Perfect family haven with spacious rooms, excellent schools nearby, and a beautiful backyard for kids to play...',
    wordCount: 189,
    createdAt: '2024-01-14',
    performance: {
      views: 980,
      inquiries: 31,
      conversionRate: 3.16,
      engagement: 78,
      leadScore: 88
    },
    platforms: ['MLS', 'Realtor.com'],
    status: 'active'
  },
  {
    id: 'desc-003',
    listingId: 'listing-002',
    listingAddress: '456 Pine Avenue, Oakland',
    title: 'Investment Opportunity',
    version: 'Investment-focused',
    type: 'primary',
    length: 'short',
    platform: 'social',
    content: 'Prime investment property with excellent rental potential and strong appreciation history...',
    wordCount: 98,
    createdAt: '2024-01-13',
    performance: {
      views: 567,
      inquiries: 12,
      conversionRate: 2.12,
      engagement: 72,
      leadScore: 79
    },
    platforms: ['Social Media', 'Email'],
    status: 'active'
  },
  {
    id: 'desc-004',
    listingId: 'listing-003',
    listingAddress: '789 Maple Drive, Berkeley',
    title: 'Cozy Starter Home',
    version: 'First-time buyer',
    type: 'primary',
    length: 'standard',
    platform: 'mls',
    content: 'Charming starter home perfect for first-time buyers with modern updates and move-in ready condition...',
    wordCount: 156,
    createdAt: '2024-01-12',
    performance: {
      views: 892,
      inquiries: 18,
      conversionRate: 2.02,
      engagement: 81,
      leadScore: 85
    },
    platforms: ['MLS', 'Website'],
    status: 'needs_review'
  }
];

const DescriptionsDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'all' | 'by-listing' | 'performance'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'primary' | 'alternative'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'needs_review'>('all');

  // Filter descriptions based on selected filters
  const filteredDescriptions = useMemo(() => {
    return mockDescriptionVersions.filter(desc => {
      if (selectedType !== 'all' && desc.type !== selectedType) return false;
      if (selectedStatus !== 'all' && desc.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedType, selectedStatus]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalViews = filteredDescriptions.reduce((sum, desc) => sum + desc.performance.views, 0);
    const totalInquiries = filteredDescriptions.reduce((sum, desc) => sum + desc.performance.inquiries, 0);
    const avgConversion = filteredDescriptions.reduce((sum, desc) => sum + desc.performance.conversionRate, 0) / filteredDescriptions.length;
    const avgEngagement = filteredDescriptions.reduce((sum, desc) => sum + desc.performance.engagement, 0) / filteredDescriptions.length;

    return {
      totalDescriptions: filteredDescriptions.length,
      totalViews,
      totalInquiries,
      avgConversion: avgConversion || 0,
      avgEngagement: avgEngagement || 0
    };
  }, [filteredDescriptions]);

  // Group descriptions by listing for the by-listing view
  const descriptionsByListing = useMemo(() => {
    const grouped = filteredDescriptions.reduce((acc, desc) => {
      if (!acc[desc.listingAddress]) {
        acc[desc.listingAddress] = [];
      }
      acc[desc.listingAddress].push(desc);
      return acc;
    }, {} as Record<string, typeof filteredDescriptions>);
    return grouped;
  }, [filteredDescriptions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-emerald-400" />;
      case 'needs_review':
        return <ExclamationTriangleIcon className="h-4 w-4 text-amber-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  const getVersionBadgeColor = (version: string) => {
    switch (version) {
      case 'Luxury-focused':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Family-focused':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Investment-focused':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'First-time buyer':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Description Center</h2>
              <p className="text-slate-400">Manage, optimize, and track your property descriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="glass" glowColor="emerald" leftIcon={<SparklesIcon className="h-5 w-5" />}>
                Generate with AI
              </Button>
              <Button variant="gradient" leftIcon={<PlusIcon className="h-5 w-5" />}>
                Create Description
              </Button>
            </div>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.totalDescriptions}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Descriptions</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.totalViews.toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Views</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.totalInquiries}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Inquiries</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowTrendingUpIcon className="h-8 w-8 text-amber-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.avgConversion.toFixed(1)}%</span>
              </div>
              <p className="text-slate-400 text-sm">Avg Conversion</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <SparklesIcon className="h-8 w-8 text-rose-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.avgEngagement.toFixed(0)}%</span>
              </div>
              <p className="text-slate-400 text-sm">Avg Engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-1">
              {['all', 'by-listing', 'performance'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedView === view
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {view === 'all' ? 'All Descriptions' : view === 'by-listing' ? 'By Listing' : 'Performance View'}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="primary">Primary</option>
                <option value="alternative">Alternative</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedView === 'all' && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">All Descriptions</h3>
            
            <div className="space-y-4">
              {filteredDescriptions.map((description) => (
                <div
                  key={description.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(description.status)}
                        <h4 className="text-lg font-semibold text-white">{description.title}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getVersionBadgeColor(description.version)}`}>
                          {description.version}
                        </span>
                        {description.type === 'primary' && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Primary
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-2">{description.listingAddress}</p>
                      <p className="text-slate-300 text-sm line-clamp-2 mb-3">{description.content}</p>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-slate-400">{description.wordCount} words</span>
                        <span className="text-slate-400">{description.performance.views} views</span>
                        <span className="text-emerald-400">{description.performance.inquiries} inquiries</span>
                        <span className="text-blue-400">{description.performance.conversionRate}% conversion</span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        {description.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="glass" size="sm" leftIcon={<EyeIcon className="h-4 w-4" />}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<PencilSquareIcon className="h-4 w-4" />}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<DocumentDuplicateIcon className="h-4 w-4" />}>
                        Duplicate
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<ShareIcon className="h-4 w-4" />}>
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'by-listing' && (
        <div className="space-y-6">
          {Object.entries(descriptionsByListing).map(([address, descriptions]) => (
            <div key={address} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">{address}</h3>
                  <span className="text-slate-400 text-sm">{descriptions.length} versions</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {descriptions.map((description) => (
                    <div
                      key={description.id}
                      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(description.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getVersionBadgeColor(description.version)}`}>
                            {description.version}
                          </span>
                          {description.type === 'primary' && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm line-clamp-3 mb-3">{description.content}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400">Views:</span>
                          <span className="text-white ml-1">{description.performance.views}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Inquiries:</span>
                          <span className="text-emerald-400 ml-1">{description.performance.inquiries}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Conversion:</span>
                          <span className="text-blue-400 ml-1">{description.performance.conversionRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Engagement:</span>
                          <span className="text-purple-400 ml-1">{description.performance.engagement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Performance Analysis</h3>
            
            <div className="space-y-4">
              {[...filteredDescriptions]
                .sort((a, b) => b.performance.leadScore - a.performance.leadScore)
                .map((description, index) => (
                  <div
                    key={description.id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{description.title}</h4>
                          <p className="text-slate-400 text-sm">{description.listingAddress}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getVersionBadgeColor(description.version)}`}>
                          {description.version}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{description.performance.leadScore}</div>
                        <div className="text-slate-400 text-sm">Lead Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-lg font-semibold text-white">{description.performance.views}</div>
                        <div className="text-slate-400 text-sm">Views</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-lg font-semibold text-emerald-400">{description.performance.inquiries}</div>
                        <div className="text-slate-400 text-sm">Inquiries</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-lg font-semibold text-blue-400">{description.performance.conversionRate}%</div>
                        <div className="text-slate-400 text-sm">Conversion</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-lg font-semibold text-purple-400">{description.performance.engagement}%</div>
                        <div className="text-slate-400 text-sm">Engagement</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionsDashboard;