import React, { useState, useMemo } from 'react';
import Button from '../shared/Button';
import { 
  VideoCameraIcon,
  PlayIcon,
  SparklesIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Listing } from '../../types';
import * as listingService from '../../services/listingService';
import { useAuth } from '../../contexts/AuthContext';
import VideoCreationSection from './video/VideoCreationSection';

interface VideoProject {
  id: string;
  listingId: string;
  listingAddress: string;
  title: string;
  status: 'draft' | 'processing' | 'ready' | 'published';
  createdAt: string;
  publishedAt?: string;
  thumbnail: string;
  duration: number;
  platforms: {
    tiktok: boolean;
    instagram: boolean;
    youtube: boolean;
  };
  metrics?: {
    views: number;
    engagement: number;
    shares: number;
  };
}

// Mock data
const mockVideos: VideoProject[] = [
  {
    id: 'video-1',
    listingId: 'listing-1',
    listingAddress: '123 Maple Street, Sunnyvale, CA',
    title: 'Modern Luxury Home Tour',
    status: 'published',
    createdAt: '2024-01-10',
    publishedAt: '2024-01-11',
    thumbnail: '/api/placeholder/400/225',
    duration: 60,
    platforms: { tiktok: true, instagram: true, youtube: true },
    metrics: { views: 3420, engagement: 12.5, shares: 45 }
  },
  {
    id: 'video-2',
    listingId: 'listing-2',
    listingAddress: '456 Oak Avenue, Palo Alto, CA',
    title: 'Dream Home Virtual Walkthrough',
    status: 'ready',
    createdAt: '2024-01-14',
    thumbnail: '/api/placeholder/400/225',
    duration: 90,
    platforms: { tiktok: false, instagram: true, youtube: true }
  },
  {
    id: 'video-3',
    listingId: 'listing-3',
    listingAddress: '789 Pine Lane, Mountain View, CA',
    title: 'Cozy Family Home Showcase',
    status: 'processing',
    createdAt: '2024-01-15',
    thumbnail: '/api/placeholder/400/225',
    duration: 45,
    platforms: { tiktok: true, instagram: true, youtube: false }
  }
];

const VideoStudioDashboard: React.FC = () => {
  const { user } = useAuth();
  const [videos] = useState<VideoProject[]>(mockVideos);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [showCreation, setShowCreation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch user listings
  React.useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      try {
        const userListings = await listingService.getListings(user.id);
        setListings(userListings);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoadingListings(false);
      }
    };
    fetchListings();
  }, [user]);

  // Calculate metrics
  const totalVideos = videos.length;
  const publishedVideos = videos.filter(v => v.status === 'published').length;
  const totalViews = videos.reduce((sum, v) => sum + (v.metrics?.views || 0), 0);
  const avgEngagement = videos
    .filter(v => v.metrics)
    .reduce((sum, v) => sum + (v.metrics?.engagement || 0), 0) / publishedVideos || 0;

  const getStatusBadge = (status: VideoProject['status']) => {
    const styles = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      published: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    
    const icons = {
      draft: <ClockIcon className="h-3 w-3" />,
      processing: <SparklesIcon className="h-3 w-3 animate-pulse" />,
      ready: <CheckCircleIcon className="h-3 w-3" />,
      published: <EyeIcon className="h-3 w-3" />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show creation section if active
  if (showCreation) {
    return (
      <VideoCreationSection
        onClose={() => {
          setShowCreation(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Video Studio</h2>
              <p className="text-slate-400">Create stunning property videos with AI</p>
            </div>
            <Button
              variant="glass"
              glowColor="purple"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => {
                setSelectedTemplate(null);
                setShowCreation(true);
              }}
            >
              Create New Video
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <VideoCameraIcon className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{totalVideos}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Videos</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Views</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{avgEngagement.toFixed(1)}%</span>
              </div>
              <p className="text-slate-400 text-sm">Avg Engagement</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircleIcon className="h-8 w-8 text-pink-400" />
                <span className="text-2xl font-bold text-white">{publishedVideos}</span>
              </div>
              <p className="text-slate-400 text-sm">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Templates */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Quick Start Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Luxury Showcase', 'Virtual Tour', 'Neighborhood Highlights', 'Quick Preview'].map((template) => (
              <button
                key={template}
                className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-200 text-left"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowCreation(true);
                }}
              >
                <SparklesIcon className="h-8 w-8 text-purple-400 mb-3" />
                <h4 className="text-white font-medium">{template}</h4>
                <p className="text-slate-400 text-sm mt-1">Perfect for social media</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Videos</h3>
          
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="relative w-full lg:w-64 h-36 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PlayIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{video.title}</h4>
                        <p className="text-slate-400 text-sm">{video.listingAddress}</p>
                      </div>
                      {getStatusBadge(video.status)}
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-slate-400 text-sm">Platforms:</span>
                      <div className="flex items-center gap-2">
                        {video.platforms.tiktok && <FaTiktok className="h-4 w-4 text-slate-300" />}
                        {video.platforms.instagram && <FaInstagram className="h-4 w-4 text-slate-300" />}
                        {video.platforms.youtube && <FaYoutube className="h-4 w-4 text-slate-300" />}
                      </div>
                    </div>

                    {/* Metrics */}
                    {video.metrics && (
                      <div className="flex items-center gap-6 mt-4">
                        <div className="text-sm">
                          <span className="text-slate-400">Views: </span>
                          <span className="text-white font-medium">{video.metrics.views.toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Engagement: </span>
                          <span className="text-emerald-400 font-medium">{video.metrics.engagement}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Shares: </span>
                          <span className="text-white font-medium">{video.metrics.shares}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200">
                      <EyeIcon className="h-4 w-4 text-white" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200">
                      <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                    </button>
                    {video.status === 'draft' && (
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200">
                        <TrashIcon className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <VideoCameraIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-white mb-2">No videos yet</p>
              <p className="text-slate-400 mb-6">Create your first property video to get started</p>
              <Button
                variant="gradient"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowCreation(true);
                }}
              >
                Create First Video
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default VideoStudioDashboard;