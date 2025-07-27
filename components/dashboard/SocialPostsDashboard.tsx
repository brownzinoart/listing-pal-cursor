import React, { useState, useMemo } from "react";
import {
  CalendarIcon,
  TableCellsIcon,
  ChartBarIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Button from "../shared/Button";
import PropertySelector from "../shared/PropertySelector";
import SocialPostsCalendar from "./SocialPostsCalendar";
import SocialPostsTable from "./SocialPostsTable";
import SocialPostsAnalytics from "./SocialPostsAnalytics";
import SocialPostComposer from "./SocialPostComposer";
import { Listing } from "../../types";

export interface SocialPost {
  id: string;
  listingId: string;
  listingAddress: string;
  platform: "facebook" | "instagram" | "twitter";
  content: string;
  hashtags: string[];
  status: "draft" | "scheduled" | "published" | "archived";
  scheduledDate?: string;
  publishedDate?: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
    reach: number;
    clicks: number;
  };
  mediaUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data generator
const generateMockPosts = (): SocialPost[] => {
  const listings = [
    { id: "listing-1", address: "123 Maple Street, Sunnyvale, CA" },
    { id: "listing-2", address: "456 Oak Avenue, Palo Alto, CA" },
    { id: "listing-3", address: "789 Pine Lane, Mountain View, CA" },
    { id: "listing-4", address: "321 Elm Street, San Jose, CA" },
  ];

  const platforms: ("facebook" | "instagram" | "twitter")[] = [
    "facebook",
    "instagram",
    "twitter",
  ];
  const statuses: SocialPost["status"][] = [
    "draft",
    "scheduled",
    "published",
    "archived",
  ];

  const posts: SocialPost[] = [];
  let postId = 1;

  // Generate posts for each listing and platform
  listings.forEach((listing) => {
    platforms.forEach((platform) => {
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const isPublished =
        randomStatus === "published" || randomStatus === "archived";

      posts.push({
        id: `post-${postId++}`,
        listingId: listing.id,
        listingAddress: listing.address,
        platform,
        content: generateContent(platform, listing.address),
        hashtags: generateHashtags(platform),
        status: randomStatus,
        scheduledDate:
          randomStatus === "scheduled" ? generateFutureDate() : undefined,
        publishedDate: isPublished ? generatePastDate() : undefined,
        metrics: isPublished
          ? generateMetrics(platform)
          : {
              views: 0,
              likes: 0,
              shares: 0,
              comments: 0,
              engagementRate: 0,
              reach: 0,
              clicks: 0,
            },
        mediaUrls: [`/api/placeholder/400/400`],
        createdAt: generatePastDate(),
        updatedAt: generatePastDate(),
      });
    });
  });

  return posts;
};

const generateContent = (platform: string, address: string): string => {
  const templates = {
    facebook: [
      `Just listed! 🏡 Check out this stunning property at ${address}. Perfect for families looking for their dream home. Schedule a tour today!`,
      `New on the market! This beautiful home at ${address} won't last long. Contact us for exclusive viewing opportunities.`,
    ],
    instagram: [
      `✨ Dream home alert! ✨\n\n📍 ${address}\n\nSwipe to see why this property is perfect for you! DM for details.\n\n#realestate #dreamhome #forsale`,
      `Home sweet home 🏡\n\n${address} is waiting for its new owner! Tag someone who needs to see this!\n\n#property #newhome #realtor`,
    ],
    twitter: [
      `🏡 NEW LISTING: ${address}\n\n✅ Move-in ready\n✅ Prime location\n✅ Modern amenities\n\nSchedule a viewing: [link]\n\n#realestate #newlisting`,
      `Just listed in ${address.split(",")[1]}! Don't miss this opportunity. Contact us today! 🔑\n\n#homeforsale #realestate`,
    ],
  };

  const platformTemplates = templates[platform as keyof typeof templates];
  return platformTemplates[
    Math.floor(Math.random() * platformTemplates.length)
  ];
};

const generateHashtags = (platform: string): string[] => {
  const common = ["realestate", "forsale", "newhome", "property", "realtor"];
  const platformSpecific = {
    facebook: ["homeforsale", "openhouse", "dreamhome"],
    instagram: [
      "homesweethome",
      "luxuryhomes",
      "instahome",
      "propertyoftheday",
    ],
    twitter: ["realty", "housing", "newlisting"],
  };

  return [
    ...common.slice(0, 3),
    ...platformSpecific[platform as keyof typeof platformSpecific].slice(0, 2),
  ];
};

const generateMetrics = (platform: string) => {
  const baseMetrics = {
    facebook: { views: 3500, likes: 245, shares: 42, comments: 18 },
    instagram: { views: 4200, likes: 520, shares: 85, comments: 67 },
    twitter: { views: 2100, likes: 89, shares: 23, comments: 12 },
  };

  const base = baseMetrics[platform as keyof typeof baseMetrics];
  const variance = 0.5; // 50% variance

  const views = Math.floor(base.views * (1 + (Math.random() - 0.5) * variance));
  const likes = Math.floor(base.likes * (1 + (Math.random() - 0.5) * variance));
  const shares = Math.floor(
    base.shares * (1 + (Math.random() - 0.5) * variance),
  );
  const comments = Math.floor(
    base.comments * (1 + (Math.random() - 0.5) * variance),
  );
  const clicks = Math.floor(
    views * 0.05 * (1 + (Math.random() - 0.5) * variance),
  );

  const totalEngagements = likes + shares + comments;
  const engagementRate = views > 0 ? (totalEngagements / views) * 100 : 0;

  return {
    views,
    likes,
    shares,
    comments,
    engagementRate: Math.round(engagementRate * 100) / 100,
    reach: Math.floor(views * 1.3),
    clicks,
  };
};

const generateFutureDate = (): string => {
  const daysAhead = Math.floor(Math.random() * 14) + 1;
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString();
};

const generatePastDate = (): string => {
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

type ViewType = "calendar" | "table" | "analytics";

// Mock listings for property filtering
const mockListings: Listing[] = [
  {
    id: "listing-1",
    userId: "user-1",
    address: "123 Maple Street, Sunnyvale, CA",
    city: "Sunnyvale",
    state: "CA",
    zipCode: "94085",
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2100,
    price: 1250000,
    propertyType: "single-family",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-2",
    userId: "user-1",
    address: "456 Oak Avenue, Palo Alto, CA",
    city: "Palo Alto",
    state: "CA",
    zipCode: "94301",
    bedrooms: 5,
    bathrooms: 4,
    squareFootage: 3200,
    price: 2850000,
    propertyType: "single-family",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-3",
    userId: "user-1",
    address: "789 Pine Lane, Mountain View, CA",
    city: "Mountain View",
    state: "CA",
    zipCode: "94041",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    price: 1650000,
    propertyType: "townhome",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "listing-4",
    userId: "user-1",
    address: "321 Elm Street, San Jose, CA",
    city: "San Jose",
    state: "CA",
    zipCode: "95110",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    price: 950000,
    propertyType: "condo",
    status: "sold",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SocialPostsDashboard: React.FC = () => {
  const [posts] = useState<SocialPost[]>(generateMockPosts());
  const [activeView, setActiveView] = useState<ViewType>("table");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>(
    mockListings.map((l) => l.id),
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter posts based on selected listings
  const filteredPosts = useMemo(() => {
    return posts.filter(
      (post) =>
        selectedListings.length === 0 ||
        selectedListings.includes(post.listingId),
    );
  }, [posts, selectedListings]);

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const publishedPosts = filteredPosts.filter(
      (p) => p.status === "published",
    );
    const totalEngagement = publishedPosts.reduce(
      (sum, post) =>
        sum + post.metrics.likes + post.metrics.shares + post.metrics.comments,
      0,
    );
    const totalReach = publishedPosts.reduce(
      (sum, post) => sum + post.metrics.reach,
      0,
    );
    const avgEngagementRate =
      publishedPosts.length > 0
        ? publishedPosts.reduce(
            (sum, post) => sum + post.metrics.engagementRate,
            0,
          ) / publishedPosts.length
        : 0;
    const scheduledCount = filteredPosts.filter(
      (p) => p.status === "scheduled",
    ).length;

    return {
      totalPosts: filteredPosts.length,
      publishedPosts: publishedPosts.length,
      scheduledPosts: scheduledCount,
      totalEngagement,
      totalReach,
      avgEngagementRate: avgEngagementRate.toFixed(2),
    };
  }, [filteredPosts]);

  const viewTabs = [
    { id: "calendar" as ViewType, label: "Calendar", icon: CalendarIcon },
    { id: "table" as ViewType, label: "All Posts", icon: TableCellsIcon },
    { id: "analytics" as ViewType, label: "Analytics", icon: ChartBarIcon },
  ];

  const getPlatformIcon = (platform: SocialPost["platform"]) => {
    switch (platform) {
      case "facebook":
        return <FaFacebook className="h-4 w-4" />;
      case "instagram":
        return <FaInstagram className="h-4 w-4" />;
      case "twitter":
        return <FaTwitter className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text-secondary">Total Posts</p>
          <p className="text-2xl font-bold text-brand-text-primary">
            {overviewMetrics.totalPosts}
          </p>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text-secondary">Published</p>
          <p className="text-2xl font-bold text-green-500">
            {overviewMetrics.publishedPosts}
          </p>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text-secondary">Scheduled</p>
          <p className="text-2xl font-bold text-blue-500">
            {overviewMetrics.scheduledPosts}
          </p>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text-secondary">Total Reach</p>
          <p className="text-2xl font-bold text-brand-text-primary">
            {overviewMetrics.totalReach.toLocaleString()}
          </p>
        </div>
        <div className="bg-brand-panel border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text-secondary">Avg. Engagement</p>
          <p className="text-2xl font-bold text-brand-text-primary">
            {overviewMetrics.avgEngagementRate}%
          </p>
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="bg-brand-panel border border-brand-border rounded-lg">
        <div className="p-4 border-b border-brand-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-1">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeView === tab.id
                      ? "bg-brand-primary text-white"
                      : "text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-background"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<FunnelIcon className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setShowComposer(true)}
              >
                Create Post
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-brand-border">
              <div>
                <label className="text-sm text-brand-text-secondary mb-1 block">
                  Properties
                </label>
                <div className="w-full max-w-md">
                  <PropertySelector
                    listings={mockListings}
                    selectedListings={selectedListings}
                    onSelectionChange={setSelectedListings}
                    placeholder="Filter by properties..."
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeView === "calendar" && (
            <SocialPostsCalendar
              posts={filteredPosts}
              onPostClick={setSelectedPost}
            />
          )}
          {activeView === "table" && (
            <SocialPostsTable
              posts={filteredPosts}
              onEdit={setSelectedPost}
              onCompose={() => setShowComposer(true)}
            />
          )}
          {activeView === "analytics" && (
            <SocialPostsAnalytics posts={filteredPosts} />
          )}
        </div>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <SocialPostComposer
          post={selectedPost}
          onClose={() => {
            setShowComposer(false);
            setSelectedPost(null);
          }}
          onSave={(post) => {
            console.log("Saving post:", post);
            setShowComposer(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
};

export default SocialPostsDashboard;
