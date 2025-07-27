import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../shared/Button";
import {
  PlusIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  HeartIcon as HeartOutlineIcon,
} from "@heroicons/react/24/outline";
import ViewToggle, { ViewMode } from "../shared/ViewToggle";

// Email theme types from existing batch workflow
type EmailTheme =
  | "OPEN_HOUSE"
  | "PRICE_REDUCTION"
  | "NEW_LISTING"
  | "UNDER_CONTRACT"
  | "MARKET_UPDATE"
  | "EXCLUSIVE_SHOWING"
  | "FOLLOW_UP"
  | "COMING_SOON";

const EMAIL_THEMES: {
  id: EmailTheme;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    id: "NEW_LISTING",
    name: "New Listing Alert",
    description: "Announce a fresh property on the market",
    icon: "🏡",
    color: "emerald",
  },
  {
    id: "OPEN_HOUSE",
    name: "Open House Invitation",
    description: "Invite prospects to view the property",
    icon: "🏠",
    color: "blue",
  },
  {
    id: "PRICE_REDUCTION",
    name: "Price Reduction Notice",
    description: "Alert about updated pricing",
    icon: "💰",
    color: "amber",
  },
  {
    id: "UNDER_CONTRACT",
    name: "Under Contract Update",
    description: "Notify that property is pending sale",
    icon: "📝",
    color: "purple",
  },
  {
    id: "EXCLUSIVE_SHOWING",
    name: "Exclusive Showing",
    description: "Private viewing invitation for VIP clients",
    icon: "⭐",
    color: "pink",
  },
  {
    id: "MARKET_UPDATE",
    name: "Market Report",
    description: "Share neighborhood market insights",
    icon: "📊",
    color: "indigo",
  },
  {
    id: "FOLLOW_UP",
    name: "Follow-up Check-in",
    description: "Professional follow-up with prospects",
    icon: "🤝",
    color: "teal",
  },
  {
    id: "COMING_SOON",
    name: "Coming Soon Teaser",
    description: "Build anticipation for upcoming listing",
    icon: "🔜",
    color: "rose",
  },
];

// Mock data for generated email content pieces
const mockEmailContent = [
  {
    id: "email-001",
    listingId: "listing-001",
    listingAddress: "123 Oak Street, San Francisco",
    theme: "NEW_LISTING" as EmailTheme,
    subject: "Just Listed: Stunning Modern Home in San Francisco",
    content: `Dear [Client Name],

I'm excited to share this beautiful new listing with you! This stunning 4-bedroom, 3-bathroom home at 123 Oak Street is everything you've been searching for and more.

At 2,450 square feet, this 2018 property offers the perfect blend of modern comfort and timeless elegance at $1,250,000.

✨ What makes this property special:
• Gourmet kitchen with premium appliances
• Open-concept living with high ceilings
• Private backyard perfect for entertaining
• Walking distance to top-rated schools

I'd love to arrange a private showing at your convenience. Properties like this don't stay on the market long!

Best regards,
[Your Name]`,
    createdDate: "2024-01-15",
    wordCount: 247,
    lastUsed: "2024-01-15",
    favorite: true,
  },
  {
    id: "email-002",
    listingId: "listing-001",
    listingAddress: "123 Oak Street, San Francisco",
    theme: "OPEN_HOUSE" as EmailTheme,
    subject: "Open House This Weekend - 123 Oak Street",
    content: `You're Invited to an Exclusive Open House!

Join us this Saturday and Sunday from 1-4 PM for an exclusive open house at 123 Oak Street, San Francisco.

This stunning modern home features:
🏡 4 bedrooms, 3 bathrooms
🏡 2,450 sq ft of thoughtfully designed space
🏡 Gourmet kitchen with premium finishes
🏡 Private backyard oasis

Light refreshments will be provided. Come see why this could be your dream home!

RSVP appreciated but not required.

Looking forward to seeing you there!
[Your Name]`,
    createdDate: "2024-01-14",
    wordCount: 189,
    lastUsed: "2024-01-16",
    favorite: false,
  },
  {
    id: "email-003",
    listingId: "listing-002",
    listingAddress: "456 Pine Avenue, Oakland",
    theme: "PRICE_REDUCTION" as EmailTheme,
    subject: "Price Reduced - Great Investment Opportunity",
    content: `Great news! The price has been reduced on this excellent investment property at 456 Pine Avenue, Oakland.

New Price: $875,000 (was $925,000)

This property offers:
💰 Strong rental potential in growing neighborhood
💰 Recent updates and modern amenities
💰 Excellent schools and transit access
💰 Move-in ready condition

This is a rare opportunity in today's market. Let's schedule a viewing this week!

[Your Name]`,
    createdDate: "2024-01-13",
    wordCount: 156,
    lastUsed: "2024-01-14",
    favorite: true,
  },
  {
    id: "email-004",
    listingId: "listing-003",
    listingAddress: "789 Maple Drive, Berkeley",
    theme: "MARKET_UPDATE" as EmailTheme,
    subject: "Berkeley Market Update - January 2024",
    content: `Berkeley Real Estate Market Update - January 2024

Here's what's happening in our local market:

📈 Market Trends:
• Average home prices up 3.2% from last quarter
• Days on market averaging 28 days
• Inventory remains low with high buyer demand

🏘️ Neighborhood Spotlight:
Berkeley Hills continues to show strong appreciation, with new listings receiving multiple offers within the first week.

🔮 Looking Ahead:
Spring market traditionally brings increased activity. Now is an excellent time for both buyers and sellers to position themselves strategically.

As always, I'm here to help with any real estate questions or needs.

Best regards,
[Your Name]`,
    createdDate: "2024-01-12",
    wordCount: 267,
    lastUsed: "2024-01-12",
    favorite: false,
  },
];

// Mock listings for Quick Generate
const mockListings = [
  {
    id: "listing-001",
    address: "123 Oak Street, San Francisco",
    price: 1250000,
  },
  { id: "listing-002", address: "456 Pine Avenue, Oakland", price: 875000 },
  { id: "listing-003", address: "789 Maple Drive, Berkeley", price: 695000 },
];

type DisplayMode = ViewMode;

const EmailMarketingDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<"content" | "generate">("content");
  const [selectedTheme, setSelectedTheme] = useState<EmailTheme | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [selectedGenerateTheme, setSelectedGenerateTheme] =
    useState<EmailTheme>("NEW_LISTING");
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    // Default to cards on mobile, allow saved preference on desktop
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return "cards";

      const savedView = localStorage.getItem("emailDisplayMode");
      return (savedView as DisplayMode) || "cards";
    }
    return "cards";
  });

  // Save display preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("emailDisplayMode", displayMode);
    }
  }, [displayMode]);

  // Filter content based on selections
  const filteredContent = useMemo(() => {
    return mockEmailContent.filter((content) => {
      if (selectedTheme !== "all" && content.theme !== selectedTheme)
        return false;
      if (
        searchTerm &&
        !content.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !content.listingAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [selectedTheme, searchTerm]);

  // Calculate summary metrics - simplified for content focus
  const summaryMetrics = useMemo(() => {
    const favoriteCount = mockEmailContent.filter((c) => c.favorite).length;
    const avgWordCount =
      mockEmailContent.reduce((sum, c) => sum + c.wordCount, 0) /
      mockEmailContent.length;
    const themeVariety = new Set(mockEmailContent.map((c) => c.theme)).size;

    return {
      totalContent: mockEmailContent.length,
      favoriteCount,
      avgWordCount: Math.round(avgWordCount),
      themeVariety,
    };
  }, []);

  // Copy to clipboard functionality
  const handleCopyContent = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id: string) => {
    // This would typically update the backend/state
    console.log("Toggle favorite for:", id);
  };

  const getThemeColor = (theme: EmailTheme) => {
    const themeData = EMAIL_THEMES.find((t) => t.id === theme);
    return themeData?.color || "slate";
  };

  const getThemeIcon = (theme: EmailTheme) => {
    const themeData = EMAIL_THEMES.find((t) => t.id === theme);
    return themeData?.icon || "📧";
  };

  const getThemeBadgeColor = (theme: EmailTheme) => {
    const color = getThemeColor(theme);
    const colorMap: Record<string, string> = {
      emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    };
    return (
      colorMap[color] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
    );
  };

  // Table rendering for email content
  const renderEmailTable = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">My Email Content</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Subject & Theme
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Words
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredContent.map((content) => (
                <tr
                  key={content.id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-semibold">
                        {content.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium border ${getThemeBadgeColor(content.theme)}`}
                        >
                          {getThemeIcon(content.theme)}{" "}
                          {
                            EMAIL_THEMES.find((t) => t.id === content.theme)
                              ?.name
                          }
                        </span>
                        {content.favorite && (
                          <HeartIcon className="h-4 w-4 text-rose-400" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 text-sm">
                      {content.listingAddress}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center text-white font-medium">
                    {content.wordCount}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300 text-sm">
                    {content.createdDate}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300 text-sm">
                    {content.lastUsed}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleFavorite(content.id)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title={
                          content.favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {content.favorite ? (
                          <HeartIcon className="h-4 w-4 text-rose-400" />
                        ) : (
                          <HeartOutlineIcon className="h-4 w-4 text-slate-400 hover:text-rose-400" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleCopyContent(content.content, content.id)
                        }
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Copy to clipboard"
                      >
                        {copySuccessId === content.id ? (
                          <span className="text-emerald-400 text-xs px-1">
                            ✓
                          </span>
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                      </button>
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

  // Card rendering for email content
  const renderEmailCards = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">My Email Content</h3>

        <div className="space-y-4">
          {filteredContent.map((content) => (
            <div
              key={content.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-semibold text-white">
                      {content.subject}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${getThemeBadgeColor(content.theme)}`}
                    >
                      {getThemeIcon(content.theme)}{" "}
                      {EMAIL_THEMES.find((t) => t.id === content.theme)?.name}
                    </span>
                    {content.favorite && (
                      <HeartIcon className="h-5 w-5 text-rose-400" />
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-3">
                    {content.listingAddress}
                  </p>
                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                    {content.content}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <span>{content.wordCount} words</span>
                    <span>Created {content.createdDate}</span>
                    <span>Last used {content.lastUsed}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(content.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                    title={
                      content.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {content.favorite ? (
                      <HeartIcon className="h-4 w-4 text-rose-400" />
                    ) : (
                      <HeartOutlineIcon className="h-4 w-4 text-slate-400 hover:text-rose-400" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleCopyContent(content.content, content.id)
                    }
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                    title="Copy to clipboard"
                  >
                    {copySuccessId === content.id ? (
                      <span className="text-emerald-400 text-xs px-2">
                        Copied!
                      </span>
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-slate-400 hover:text-white" />
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<DocumentDuplicateIcon className="h-4 w-4" />}
                  >
                    Duplicate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Email Content Center
              </h2>
              <p className="text-slate-400">
                Organize and generate email content for your listings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="glass"
                glowColor="emerald"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
              >
                Generate with AI
              </Button>
              <Button
                variant="gradient"
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Template
              </Button>
            </div>
          </div>

          {/* Summary Metrics Grid - Simplified for Content Focus */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <EnvelopeIcon className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.totalContent}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Email Templates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <HeartIcon className="h-8 w-8 text-rose-400" />
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.favoriteCount}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Favorites</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DocumentTextIcon className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.avgWordCount}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Avg Words</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.themeVariety}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Theme Types</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Content Mode Toggle and Search/Filters */}
            <div className="flex items-center gap-4">
              {/* View Toggle - Content and Generate */}
              <div className="flex items-center bg-white/10 rounded-xl p-1">
                {["content", "generate"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewMode(view as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      viewMode === view
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {view === "content" ? "My Email Content" : "Quick Generate"}
                  </button>
                ))}
              </div>

              {/* Search and Theme Filter - Only for Content View */}
              {viewMode === "content" && (
                <>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Themes</option>
                    {EMAIL_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Display Mode Toggle - Only for Content View */}
            {viewMode === "content" && (
              <ViewToggle
                viewMode={displayMode}
                onViewModeChange={setDisplayMode}
              />
            )}
          </div>
        </div>
      </div>

      {/* My Email Content View */}
      {viewMode === "content" && (
        <>
          {/* Content - Conditional Rendering */}
          {displayMode === "table" ? renderEmailTable() : renderEmailCards()}

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
                <div className="text-center">
                  <EnvelopeIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl text-white mb-2">
                    No email content found
                  </p>
                  <p className="text-slate-400 mb-6">
                    {searchTerm || selectedTheme !== "all"
                      ? "Try adjusting your filters or search terms."
                      : "Start by generating your first email content."}
                  </p>
                  <Button
                    variant="gradient"
                    leftIcon={<SparklesIcon className="h-5 w-5" />}
                    onClick={() => setViewMode("generate")}
                  >
                    Generate Email Content
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Generate View */}
      {viewMode === "generate" && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Quick Generate Email
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Selection Panel */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Select Property
                  </label>
                  <select
                    value={selectedListing}
                    onChange={(e) => setSelectedListing(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a listing...</option>
                    {mockListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.address} - ${listing.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Email Theme
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {EMAIL_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedGenerateTheme(theme.id)}
                        className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                          selectedGenerateTheme === theme.id
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{theme.icon}</span>
                          <div>
                            <div className="font-medium">{theme.name}</div>
                            <div className="text-sm text-slate-400">
                              {theme.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Panel */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Generate Options
                  </h4>

                  {selectedListing && selectedGenerateTheme ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-2">
                          Selected Property
                        </h5>
                        <p className="text-slate-300 text-sm">
                          {
                            mockListings.find((l) => l.id === selectedListing)
                              ?.address
                          }
                        </p>
                        <p className="text-slate-400 text-xs">
                          $
                          {mockListings
                            .find((l) => l.id === selectedListing)
                            ?.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-2">
                          Email Theme
                        </h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {
                              EMAIL_THEMES.find(
                                (t) => t.id === selectedGenerateTheme,
                              )?.icon
                            }
                          </span>
                          <span className="text-slate-300 text-sm">
                            {
                              EMAIL_THEMES.find(
                                (t) => t.id === selectedGenerateTheme,
                              )?.name
                            }
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          to={`/listings/${selectedListing}/email?theme=${selectedGenerateTheme}`}
                          className="w-full"
                        >
                          <Button
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            leftIcon={<SparklesIcon className="h-5 w-5" />}
                          >
                            Generate Email Content
                          </Button>
                        </Link>

                        <p className="text-slate-400 text-xs text-center">
                          This will open the email generator with your selected
                          property and theme
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <EnvelopeIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm mb-2">
                        Ready to generate
                      </p>
                      <p className="text-slate-400 text-xs">
                        Select a property and email theme to get started
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">
                    💡 Pro Tip
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Generated emails integrate with your property data to create
                    personalized, compelling content. You can edit and customize
                    the content before saving to your library.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketingDashboard;
