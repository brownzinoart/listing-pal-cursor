import React, { useMemo } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { AreaChart } from '../shared/charts';
import { SocialPost } from './SocialPostsDashboard';

interface SocialPostsAnalyticsProps {
  posts: SocialPost[];
}

const SocialPostsAnalytics: React.FC<SocialPostsAnalyticsProps> = ({ posts }) => {
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Platform performance metrics
  const platformMetrics = useMemo(() => {
    const metrics = {
      facebook: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
      instagram: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
      twitter: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 }
    };

    publishedPosts.forEach(post => {
      const platform = post.platform;
      metrics[platform].posts++;
      metrics[platform].engagement += post.metrics.likes + post.metrics.shares + post.metrics.comments;
      metrics[platform].reach += post.metrics.reach;
    });

    // Calculate averages
    Object.keys(metrics).forEach(platform => {
      const p = platform as keyof typeof metrics;
      if (metrics[p].posts > 0) {
        metrics[p].avgEngagement = Math.round(metrics[p].engagement / metrics[p].posts);
      }
    });

    return metrics;
  }, [publishedPosts]);

  // Top performing posts
  const topPosts = useMemo(() => {
    return [...publishedPosts]
      .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
      .slice(0, 5);
  }, [publishedPosts]);

  // Engagement by time of day
  const engagementByHour = useMemo(() => {
    const hourData = Array(24).fill(0).map((_, i) => ({ hour: i, posts: 0, engagement: 0 }));
    
    publishedPosts.forEach(post => {
      if (post.publishedDate) {
        const hour = new Date(post.publishedDate).getHours();
        hourData[hour].posts++;
        hourData[hour].engagement += post.metrics.engagementRate;
      }
    });

    // Calculate average engagement per hour
    hourData.forEach(data => {
      if (data.posts > 0) {
        data.engagement = Math.round((data.engagement / data.posts) * 100) / 100;
      }
    });

    return hourData;
  }, [publishedPosts]);

  // Best performing time slots
  const bestTimeSlots = useMemo(() => {
    return [...engagementByHour]
      .filter(slot => slot.posts > 0)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
  }, [engagementByHour]);

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'facebook': return <FaFacebook className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <FaInstagram className="h-5 w-5 text-pink-600" />;
      case 'twitter': return <FaTwitter className="h-5 w-5 text-sky-500" />;
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="space-y-8">
      {/* Platform Performance */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Platform Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(platformMetrics).map(([platform, metrics]) => (
              <div key={platform} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    {getPlatformIcon(platform as SocialPost['platform'])}
                    <div className="text-right">
                      <p className="text-slate-400 text-sm font-medium">Posts Published</p>
                      <p className="text-2xl font-bold text-white">{metrics.posts}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total Reach</p>
                      <p className="text-xl font-bold text-white">
                        {metrics.reach.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Engagement</p>
                      <p className="text-xl font-bold text-white">
                        {metrics.engagement.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Avg. Engagement/Post</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {metrics.avgEngagement}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Posting Times and Engagement Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Times to Post */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Best Times to Post</h3>
            {bestTimeSlots.length > 0 ? (
              <div className="space-y-4">
                {bestTimeSlots.map((slot, index) => (
                  <div key={slot.hour} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' : 
                            'bg-gradient-to-r from-orange-500 to-red-500 text-white'}
                        `}>
                          {index + 1}
                        </span>
                        <span className="text-white font-semibold text-lg">
                          {formatHour(slot.hour)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">
                          {slot.engagement}%
                        </p>
                        <p className="text-xs text-slate-400">
                          {slot.posts} posts analyzed
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-8 h-8 mx-auto mb-2 bg-slate-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-300 font-semibold">Not Enough Data</p>
                <p className="text-slate-400 text-sm mt-1">Publish more posts to see optimal timing insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Trend Chart */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Engagement by Hour</h3>
            <div className="h-64 w-full">
              <AreaChart
                data={engagementByHour.map(data => ({
                  hour: data.hour,
                  engagement: data.engagement,
                  posts: data.posts
                }))}
                areas={[
                  { key: 'engagement', color: '#10B981', name: 'Engagement Rate', fillOpacity: 0.4 }
                ]}
                xAxisKey="hour"
                height={240}
                showGrid={true}
                showLegend={false}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
                Peak engagement hours show when your audience is most active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Top Performing Posts</h3>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
              {topPosts.length} high-performers
            </span>
          </div>
          
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 border-l-4 border-amber-400">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-white font-medium capitalize">{post.platform}</span>
                      </div>
                    </div>
                    <p className="text-white text-sm leading-relaxed line-clamp-2 mb-2">{post.content}</p>
                    <p className="text-slate-400 text-xs">{post.listingAddress}</p>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-2xl font-bold text-amber-400">
                        {post.metrics.engagementRate}%
                      </span>
                      {post.metrics.engagementRate > 8 && (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">Engagement Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{post.metrics.reach.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {(post.metrics.likes + post.metrics.shares + post.metrics.comments).toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-xs">Total Interactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">{post.metrics.likes}</p>
                    <p className="text-slate-400 text-xs">Likes</p>
                  </div>
                </div>
              </div>
            ))}
            
            {topPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-8 h-8 mx-auto mb-2 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-amber-400 font-semibold">No Performance Data</p>
                <p className="text-slate-400 text-sm mt-1">Publish posts to see top performers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPostsAnalytics;