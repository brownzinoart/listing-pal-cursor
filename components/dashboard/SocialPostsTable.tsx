import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/24/outline';
import { SocialPost } from './SocialPostsDashboard';
import Button from '../shared/Button';

interface SocialPostsTableProps {
  posts: SocialPost[];
  onEdit: (post: SocialPost) => void;
  onCompose: () => void;
  viewMode: 'cards' | 'table';
}

const SocialPostsTable: React.FC<SocialPostsTableProps> = ({ posts, onEdit, onCompose, viewMode }) => {
  const [sortField, setSortField] = useState<'publishedDate' | 'engagementRate' | 'reach'>('publishedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedPosts = posts.sort((a, b) => {
    if (sortField === 'publishedDate') {
      const dateA = new Date(a.publishedDate || a.scheduledDate || a.createdAt).getTime();
      const dateB = new Date(b.publishedDate || b.scheduledDate || b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const valueA = a.metrics[sortField];
      const valueB = b.metrics[sortField];
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
  });

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'facebook': return <FaFacebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <FaInstagram className="h-4 w-4 text-pink-600" />;
      case 'twitter': return <FaTwitter className="h-4 w-4 text-sky-500" />;
    }
  };

  const getStatusBadge = (status: SocialPost['status']) => {
    const styles = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      archived: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderTableView = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">My Social Posts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Property & Platform
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('publishedDate')}>
                  Date
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('engagementRate')}>
                  Engagement
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('reach')}>
                  Reach
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedPosts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {post.listingAddress}
                      </p>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm text-slate-300 capitalize">{post.platform}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div>
                      <p className="text-sm text-white line-clamp-2 leading-relaxed">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {post.hashtags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {post.hashtags.length > 2 && (
                            <span className="text-xs text-slate-400">+{post.hashtags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-300">
                    {formatDate(post.publishedDate || post.scheduledDate)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {post.status === 'published' ? (
                      <div className="text-sm">
                        <p className="font-bold text-emerald-400 text-lg">{post.metrics.engagementRate}%</p>
                        <p className="text-xs text-slate-400">
                          {post.metrics.likes + post.metrics.shares + post.metrics.comments} interactions
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {post.status === 'published' ? (
                      <p className="text-sm font-semibold text-white">
                        {post.metrics.reach.toLocaleString()}
                      </p>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(post)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title={post.status === 'published' ? 'View Post' : 'Edit Post'}
                      >
                        {post.status === 'published' ? <EyeIcon className="h-4 w-4 text-white" /> : <PencilIcon className="h-4 w-4 text-white" />}
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Duplicate Post"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                      </button>
                      {post.status === 'draft' && (
                        <button
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                          title="Delete Post"
                        >
                          <TrashIcon className="h-4 w-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCardView = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">My Social Posts</h3>
        
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <div key={post.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left Side - Main Content */}
                <div className="flex-1 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-white font-medium capitalize">{post.platform}</span>
                      </div>
                      {getStatusBadge(post.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">
                        {formatDate(post.publishedDate || post.scheduledDate)}
                      </p>
                    </div>
                  </div>

                  {/* Property Address */}
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Property</p>
                    <p className="text-white font-semibold">{post.listingAddress}</p>
                  </div>

                  {/* Content Preview */}
                  <div>
                    <p className="text-white text-sm leading-relaxed line-clamp-2 mb-2">{post.content}</p>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.slice(0, 4).map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 4 && (
                          <span className="text-xs text-slate-400">+{post.hashtags.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Metrics & Actions */}
                <div className="lg:w-80 space-y-4">
                  {/* Performance Metrics */}
                  {post.status === 'published' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{post.metrics.engagementRate}%</p>
                        <p className="text-slate-400 text-xs">Engagement Rate</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{post.metrics.reach.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">Reach</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-blue-400">{post.metrics.likes}</p>
                        <p className="text-slate-400 text-xs">Likes</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-purple-400">
                          {post.metrics.likes + post.metrics.shares + post.metrics.comments}
                        </p>
                        <p className="text-slate-400 text-xs">Total Interactions</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-slate-400 text-sm">Performance metrics will appear after publishing</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(post)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                      title={post.status === 'published' ? 'View Post' : 'Edit Post'}
                    >
                      {post.status === 'published' ? <EyeIcon className="h-4 w-4 text-white" /> : <PencilIcon className="h-4 w-4 text-white" />}
                    </button>
                    <button
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                      title="Duplicate Post"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                    </button>
                    {post.status === 'draft' && (
                      <button
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                        title="Delete Post"
                      >
                        <TrashIcon className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Posts Content - Conditional Rendering */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Empty State */}
      {sortedPosts.length === 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8m0 0H7m5 5v3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Posts Found</h3>
              <p className="text-slate-400 text-lg mb-8">
                Start creating engaging social media content for your listings.
              </p>
              <Button variant="gradient" size="lg" onClick={onCompose}>
                Create Your First Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialPostsTable;