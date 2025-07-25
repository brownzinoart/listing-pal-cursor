import React, { useMemo } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
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
    <div className="space-y-6">
      {/* Platform Performance */}
      <div>
        <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(platformMetrics).map(([platform, metrics]) => (
            <div key={platform} className="bg-brand-background rounded-lg border border-brand-border p-4">
              <div className="flex items-center justify-between mb-3">
                {getPlatformIcon(platform as SocialPost['platform'])}
                <span className="text-sm text-brand-text-secondary">{metrics.posts} posts</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-brand-text-secondary">Total Reach</p>
                  <p className="text-xl font-bold text-brand-text-primary">
                    {metrics.reach.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brand-text-secondary">Total Engagement</p>
                  <p className="text-xl font-bold text-brand-text-primary">
                    {metrics.engagement.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brand-text-secondary">Avg. Engagement/Post</p>
                  <p className="text-xl font-bold text-brand-text-primary">
                    {metrics.avgEngagement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Best Times to Post</h3>
          <div className="bg-brand-background rounded-lg border border-brand-border p-4">
            {bestTimeSlots.length > 0 ? (
              <div className="space-y-3">
                {bestTimeSlots.map((slot, index) => (
                  <div key={slot.hour} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 ? 'bg-gold-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' : 
                          'bg-orange-600 text-white'}
                      `}>
                        {index + 1}
                      </span>
                      <span className="text-brand-text-primary font-medium">
                        {formatHour(slot.hour)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-text-primary">
                        {slot.engagement}% avg engagement
                      </p>
                      <p className="text-xs text-brand-text-secondary">
                        {slot.posts} posts analyzed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-brand-text-secondary py-8">
                Not enough data to determine best posting times
              </p>
            )}
          </div>
        </div>

        {/* Engagement Trend */}
        <div>
          <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Engagement by Hour</h3>
          <div className="bg-brand-background rounded-lg border border-brand-border p-4">
            <div className="h-48 flex items-end justify-between gap-1">
              {engagementByHour.map((data, index) => {
                const maxEngagement = Math.max(...engagementByHour.map(d => d.engagement));
                const height = maxEngagement > 0 ? (data.engagement / maxEngagement) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                    title={`${formatHour(data.hour)}: ${data.engagement}% engagement`}
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        data.posts > 0 ? 'bg-brand-primary hover:bg-brand-accent' : 'bg-brand-border'
                      }`}
                      style={{ height: `${height}%`, minHeight: data.posts > 0 ? '4px' : '1px' }}
                    />
                    {index % 3 === 0 && (
                      <span className="text-xs text-brand-text-tertiary mt-1">
                        {data.hour}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div>
        <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Top Performing Posts</h3>
        <div className="bg-brand-background rounded-lg border border-brand-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-panel border-b border-brand-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Platform
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Engagement Rate
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Reach
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Total Interactions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {topPosts.map((post) => (
                <tr key={post.id} className="hover:bg-brand-panel/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-brand-text-primary line-clamp-2">{post.content}</p>
                    <p className="text-xs text-brand-text-secondary mt-1">{post.listingAddress}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm capitalize">{post.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-medium text-brand-text-primary">
                        {post.metrics.engagementRate}%
                      </span>
                      {post.metrics.engagementRate > 8 && (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-brand-text-primary">
                    {post.metrics.reach.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-brand-text-primary">
                    {(post.metrics.likes + post.metrics.shares + post.metrics.comments).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SocialPostsAnalytics;