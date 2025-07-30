import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { SocialPost } from './SocialPostsDashboard';

interface SocialPostsCalendarProps {
  posts: SocialPost[];
  onPostClick: (post: SocialPost) => void;
}

const SocialPostsCalendar: React.FC<SocialPostsCalendarProps> = ({ posts, onPostClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: SocialPost[] } = {};
    
    posts.forEach(post => {
      const dateStr = post.publishedDate || post.scheduledDate;
      if (dateStr) {
        const date = new Date(dateStr).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(post);
      }
    });
    
    return grouped;
  }, [posts]);

  // Get posts for selected date
  const selectedDatePosts = useMemo(() => {
    if (!selectedDate) return [];
    return postsByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, postsByDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = useCallback((direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }, []);

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'facebook': return <FaFacebook className="h-3 w-3 text-blue-600" />;
      case 'instagram': return <FaInstagram className="h-3 w-3 text-pink-600" />;
      case 'twitter': return <FaTwitter className="h-3 w-3 text-sky-500" />;
    }
  };

  const getStatusColor = (status: SocialPost['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-400';
      case 'archived': return 'bg-yellow-500';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <div className="bg-brand-background rounded-lg border border-brand-border p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-text-primary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-brand-panel rounded-md transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-brand-text-secondary" />
              </button>
              <button
                onClick={useCallback(() => setCurrentDate(new Date()), [])}
                className="px-3 py-1 text-sm text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-panel rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-brand-panel rounded-md transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-brand-text-secondary" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-brand-text-secondary py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((date, index) => {
              const dateStr = date.toDateString();
              const dayPosts = postsByDate[dateStr] || [];
              const isSelected = selectedDate?.toDateString() === dateStr;
              
              return (
                <div
                  key={index}
                  onClick={useCallback(() => setSelectedDate(date), [date])}
                  className={`
                    min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all
                    ${isCurrentMonth(date) ? 'bg-brand-panel' : 'bg-brand-background opacity-50'}
                    ${isToday(date) ? 'border-brand-primary' : 'border-brand-border'}
                    ${isSelected ? 'ring-2 ring-brand-primary' : ''}
                    hover:bg-brand-card
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      isToday(date) ? 'text-brand-primary' : 'text-brand-text-primary'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-xs bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Post Icons */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        {getPlatformIcon(post.platform)}
                        <div className={`h-1 w-full rounded-full ${getStatusColor(post.status)}`} />
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-xs text-brand-text-tertiary">+{dayPosts.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Posts */}
      <div className="lg:col-span-1">
        <div className="bg-brand-background rounded-lg border border-brand-border p-4">
          <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
            {selectedDate ? selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Select a date'}
          </h3>
          
          {selectedDatePosts.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {selectedDatePosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onPostClick(post)}
                  className="p-3 bg-brand-panel rounded-lg border border-brand-border hover:border-brand-primary cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm font-medium text-brand-text-primary capitalize">
                        {post.platform}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      post.status === 'published' ? 'bg-green-100 text-green-800 border-green-300' :
                      post.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      post.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                      'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-brand-text-primary line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  
                  <p className="text-xs text-brand-text-secondary">
                    {post.listingAddress}
                  </p>
                  
                  {post.status === 'published' && (
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-brand-border text-xs text-brand-text-secondary">
                      <span>{post.metrics.likes} likes</span>
                      <span>{post.metrics.shares} shares</span>
                      <span>{post.metrics.reach} reach</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-text-secondary py-8">
              {selectedDate ? 'No posts scheduled for this date' : 'Click on a date to view posts'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialPostsCalendar;