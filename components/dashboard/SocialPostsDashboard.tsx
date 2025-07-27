import React, { useState, useMemo } from "react";
import {
  CalendarIcon,
  TableCellsIcon,
  ChartBarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filter posts based on selected listings and search term
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesListing =
        selectedListings.length === 0 ||
        selectedListings.includes(post.listingId);
      const matchesSearch =
        !searchTerm ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.listingAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchesListing && matchesSearch;
    });
  }, [posts, selectedListings, searchTerm]);

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
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Social Media Center
              </h2>
              <p className="text-slate-400">
                Create and manage social media content across platforms
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="glass"
                glowColor="emerald"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setShowComposer(true)}
              >
                Create Post
              </Button>
            </div>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TableCellsIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {overviewMetrics.totalPosts}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Posts</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {overviewMetrics.publishedPosts}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Published</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-blue-400">
                  {overviewMetrics.scheduledPosts}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Scheduled</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-2xl font-bold text-white">
                  {overviewMetrics.totalReach.toLocaleString()}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Reach</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {overviewMetrics.avgEngagementRate}%
                </span>
              </div>
              <p className="text-slate-400 text-sm">Avg. Engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-white/10 rounded-xl p-1">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeView === tab.id
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-4">
                {/* Search Bar - only show for table view */}
                {activeView === "table" && (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                )}

                {/* View Mode Toggle - only show for table view */}
                {activeView === "table" && (
                  <div className="flex items-center bg-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "cards"
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Card View"
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "table"
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Table View"
                    >
                      <TableCellsIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Filters */}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FunnelIcon className="h-4 w-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-white/20" : ""}
                >
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">
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
      </div>

      {/* Content Area */}
      {activeView === "calendar" && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <SocialPostsCalendar
              posts={filteredPosts}
              onPostClick={setSelectedPost}
            />
          </div>
        </div>
      )}
      {activeView === "table" && (
        <SocialPostsTable
          posts={filteredPosts}
          onEdit={setSelectedPost}
          onCompose={() => setShowComposer(true)}
          viewMode={viewMode}
        />
      )}
      {activeView === "analytics" && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <SocialPostsAnalytics posts={filteredPosts} />
          </div>
        </div>
      )}

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
