import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../shared/Button";
import {
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { AI_DESIGN_STYLES, AiDesignStyleId } from "../../constants";

// Room types from existing workflow
const ROOM_TYPES = [
  { id: "livingroom", name: "Living Room", icon: "🛋️" },
  { id: "bedroom", name: "Bedroom", icon: "🛏️" },
  { id: "kitchen", name: "Kitchen", icon: "🍳" },
  { id: "bathroom", name: "Bathroom", icon: "🚿" },
  { id: "diningroom", name: "Dining Room", icon: "🍽️" },
  { id: "homeoffice", name: "Home Office", icon: "💼" },
  { id: "nursery", name: "Nursery", icon: "👶" },
  { id: "basement", name: "Basement", icon: "🏠" },
];

// Mock data for generated room redesigns
const mockRoomRedesigns = [
  {
    id: "redesign-001",
    listingId: "listing-001",
    listingAddress: "123 Oak Street, San Francisco",
    roomType: "livingroom",
    designStyle: "modern" as AiDesignStyleId,
    title: "Modern Living Room Transformation",
    originalImage: "/api/placeholder/400/300",
    redesignedImage: "/api/placeholder/400/300",
    createdDate: "2024-01-15",
    processingTime: "45 seconds",
    favorite: true,
    status: "completed",
  },
  {
    id: "redesign-002",
    listingId: "listing-001",
    listingAddress: "123 Oak Street, San Francisco",
    roomType: "bedroom",
    designStyle: "scandinavian" as AiDesignStyleId,
    title: "Scandinavian Bedroom Design",
    originalImage: "/api/placeholder/400/300",
    redesignedImage: "/api/placeholder/400/300",
    createdDate: "2024-01-14",
    processingTime: "38 seconds",
    favorite: false,
    status: "completed",
  },
  {
    id: "redesign-003",
    listingId: "listing-002",
    listingAddress: "456 Pine Avenue, Oakland",
    roomType: "kitchen",
    designStyle: "industrial" as AiDesignStyleId,
    title: "Industrial Kitchen Redesign",
    originalImage: "/api/placeholder/400/300",
    redesignedImage: "/api/placeholder/400/300",
    createdDate: "2024-01-13",
    processingTime: "52 seconds",
    favorite: true,
    status: "completed",
  },
  {
    id: "redesign-004",
    listingId: "listing-003",
    listingAddress: "789 Maple Drive, Berkeley",
    roomType: "bathroom",
    designStyle: "contemporary" as AiDesignStyleId,
    title: "Contemporary Bathroom Refresh",
    originalImage: "/api/placeholder/400/300",
    redesignedImage: "/api/placeholder/400/300",
    createdDate: "2024-01-12",
    processingTime: "41 seconds",
    favorite: false,
    status: "processing",
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

type DisplayMode = "cards" | "table";

const InteriorDesignDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<"content" | "generate">("content");
  const [selectedRoomType, setSelectedRoomType] = useState<string | "all">(
    "all",
  );
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<
    AiDesignStyleId | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [selectedGenerateRoomType, setSelectedGenerateRoomType] =
    useState<string>("livingroom");
  const [selectedGenerateStyle, setSelectedGenerateStyle] =
    useState<AiDesignStyleId>("modern");
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    // Default to cards on mobile, allow saved preference on desktop
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return "cards";

      const savedView = localStorage.getItem("interiorDisplayMode");
      return (savedView as DisplayMode) || "cards";
    }
    return "cards";
  });

  // Save display preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("interiorDisplayMode", displayMode);
    }
  }, [displayMode]);

  // Filter content based on selections
  const filteredContent = useMemo(() => {
    return mockRoomRedesigns.filter((redesign) => {
      if (selectedRoomType !== "all" && redesign.roomType !== selectedRoomType)
        return false;
      if (
        selectedDesignStyle !== "all" &&
        redesign.designStyle !== selectedDesignStyle
      )
        return false;
      if (
        searchTerm &&
        !redesign.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !redesign.listingAddress
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [selectedRoomType, selectedDesignStyle, searchTerm]);

  // Calculate business-focused summary metrics
  const summaryMetrics = useMemo(() => {
    // Properties with at least one redesign
    const propertiesEnhanced = new Set(
      mockRoomRedesigns.map((r) => r.listingId),
    ).size;

    // Mock client engagement data (downloads/shares)
    const totalClientDownloads = mockRoomRedesigns.reduce((sum, r) => {
      // Mock download counts based on style popularity
      const downloadsByStyle = {
        modern: 45,
        scandinavian: 38,
        industrial: 29,
        contemporary: 35,
        minimalist: 31,
        bohemian: 22,
        traditional: 28,
        midcenturymodern: 33,
        glamorous: 19,
        rustic: 25,
      };
      return sum + (downloadsByStyle[r.designStyle] || 20);
    }, 0);

    // Properties with redesigns get 23% more inquiries (mock business impact)
    const avgInquiryLift = 23;

    // Most effective style based on engagement
    const stylePerformance = mockRoomRedesigns.reduce(
      (acc, r) => {
        if (!acc[r.designStyle]) acc[r.designStyle] = 0;
        acc[r.designStyle]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topStyle =
      Object.entries(stylePerformance).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "modern";

    return {
      propertiesEnhanced,
      totalClientDownloads,
      avgInquiryLift,
      topPerformingStyle: topStyle,
      totalRedesigns: mockRoomRedesigns.length,
    };
  }, []);

  // Copy image URL functionality
  const handleCopyImage = async (imageUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (err) {
      console.error("Failed to copy image URL:", err);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id: string) => {
    // This would typically update the backend/state
    console.log("Toggle favorite for:", id);
  };

  const getRoomTypeInfo = (roomType: string) => {
    return (
      ROOM_TYPES.find((t) => t.id === roomType) || {
        name: roomType,
        icon: "🏠",
      }
    );
  };

  const getDesignStyleInfo = (styleId: AiDesignStyleId) => {
    return (
      AI_DESIGN_STYLES.find((s) => s.id === styleId) || {
        name: styleId,
        description: "",
      }
    );
  };

  const getStyleBadgeColor = (styleId: AiDesignStyleId) => {
    const colorMap: Record<string, string> = {
      modern: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      scandinavian: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      minimalist: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      industrial: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      bohemian: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      traditional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      midcenturymodern: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      glamorous: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      rustic: "bg-green-500/20 text-green-400 border-green-500/30",
      contemporary: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    };
    return (
      colorMap[styleId] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
    );
  };

  // Table rendering for room redesigns
  const renderRoomTable = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">My Room Redesigns</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Room & Property
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Style
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Images
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredContent.map((redesign) => {
                const roomInfo = getRoomTypeInfo(redesign.roomType);
                const styleInfo = getDesignStyleInfo(redesign.designStyle);

                return (
                  <tr
                    key={redesign.id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">
                          {redesign.title}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {redesign.listingAddress}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{roomInfo.icon}</span>
                          <span className="text-slate-300 text-xs">
                            {roomInfo.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStyleBadgeColor(redesign.designStyle)}`}
                      >
                        {styleInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {redesign.status === "completed" ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-6 bg-slate-600 rounded border border-white/20"></div>
                          <span className="text-slate-400 text-xs">→</span>
                          <div className="w-8 h-6 bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs">
                          Processing...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300 text-sm">
                      {redesign.createdDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {redesign.status === "completed" ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                          Complete
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium">
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFavorite(redesign.id)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title={
                            redesign.favorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          {redesign.favorite ? (
                            <HeartIcon className="h-4 w-4 text-rose-400" />
                          ) : (
                            <HeartOutlineIcon className="h-4 w-4 text-slate-400 hover:text-rose-400" />
                          )}
                        </button>
                        {redesign.status === "completed" && (
                          <>
                            <button
                              onClick={() =>
                                handleCopyImage(
                                  redesign.redesignedImage,
                                  redesign.id,
                                )
                              }
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                              title="Copy image URL"
                            >
                              {copySuccessId === redesign.id ? (
                                <span className="text-emerald-400 text-xs px-1">
                                  ✓
                                </span>
                              ) : (
                                <ClipboardDocumentIcon className="h-4 w-4 text-white" />
                              )}
                            </button>
                            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200">
                              <EyeIcon className="h-4 w-4 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Card rendering for room redesigns
  const renderRoomCards = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">
          My Room Redesigns
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContent.map((redesign) => {
            const roomInfo = getRoomTypeInfo(redesign.roomType);
            const styleInfo = getDesignStyleInfo(redesign.designStyle);

            return (
              <div
                key={redesign.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-white">
                      {redesign.title}
                    </h4>
                    {redesign.favorite && (
                      <HeartIcon className="h-5 w-5 text-rose-400" />
                    )}
                    {redesign.status === "processing" && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(redesign.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                      title={
                        redesign.favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      {redesign.favorite ? (
                        <HeartIcon className="h-4 w-4 text-rose-400" />
                      ) : (
                        <HeartOutlineIcon className="h-4 w-4 text-slate-400 hover:text-rose-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Property and Style Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <p className="text-slate-400 text-sm">
                    {redesign.listingAddress}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStyleBadgeColor(redesign.designStyle)}`}
                  >
                    {styleInfo.name}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                    {roomInfo.icon} {roomInfo.name}
                  </span>
                </div>

                {/* Before/After Images */}
                {redesign.status === "completed" ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Before</p>
                      <img
                        src={redesign.originalImage}
                        alt="Original room"
                        className="w-full h-32 object-cover rounded-lg border border-white/20"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">After</p>
                      <img
                        src={redesign.redesignedImage}
                        alt="Redesigned room"
                        className="w-full h-32 object-cover rounded-lg border border-white/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-6 mb-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto mb-3"></div>
                    <p className="text-slate-300 text-sm">
                      AI is processing your room redesign...
                    </p>
                    <p className="text-slate-400 text-xs">
                      This usually takes 30-60 seconds
                    </p>
                  </div>
                )}

                {/* Actions and Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>Created {redesign.createdDate}</span>
                    {redesign.status === "completed" && (
                      <span>Processed in {redesign.processingTime}</span>
                    )}
                  </div>

                  {redesign.status === "completed" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleCopyImage(redesign.redesignedImage, redesign.id)
                        }
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Copy image URL"
                      >
                        {copySuccessId === redesign.id ? (
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
                        leftIcon={<EyeIcon className="h-4 w-4" />}
                      >
                        View Full
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ShareIcon className="h-4 w-4" />}
                      >
                        Share
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Interior Design Center
              </h2>
              <p className="text-slate-400">
                Boost property appeal and inquiries with AI room transformations
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
            </div>
          </div>

          {/* Business-Focused Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🏡</span>
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.propertiesEnhanced}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Properties Enhanced</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📥</span>
                <span className="text-2xl font-bold text-white">
                  {summaryMetrics.totalClientDownloads}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Client Downloads</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📈</span>
                <span className="text-2xl font-bold text-white">
                  +{summaryMetrics.avgInquiryLift}%
                </span>
              </div>
              <p className="text-slate-400 text-sm">Inquiry Lift</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-white capitalize">
                  {
                    getDesignStyleInfo(
                      summaryMetrics.topPerformingStyle as AiDesignStyleId,
                    ).name
                  }
                </span>
              </div>
              <p className="text-slate-400 text-sm">Top Style</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
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
                  {view === "content" ? "My Room Redesigns" : "Quick Generate"}
                </button>
              ))}
            </div>

            {/* Filters - Only for Content View */}
            {viewMode === "content" && (
              <div className="flex items-center gap-4">
                {/* Display Mode Toggle */}
                <div className="flex items-center bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setDisplayMode("cards")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      displayMode === "cards"
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Card View"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDisplayMode("table")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      displayMode === "table"
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Table View"
                  >
                    <TableCellsIcon className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Room Types</option>
                  {ROOM_TYPES.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.icon} {room.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDesignStyle}
                  onChange={(e) =>
                    setSelectedDesignStyle(e.target.value as any)
                  }
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Styles</option>
                  {AI_DESIGN_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Room Redesigns View */}
      {viewMode === "content" && (
        <>
          {/* Content - Conditional Rendering */}
          {displayMode === "table" ? renderRoomTable() : renderRoomCards()}

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
                <div className="text-center">
                  <PhotoIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl text-white mb-2">
                    No room redesigns found
                  </p>
                  <p className="text-slate-400 mb-6">
                    {selectedRoomType !== "all" || selectedDesignStyle !== "all"
                      ? "Try adjusting your filters or search terms."
                      : "Start by generating your first room redesign."}
                  </p>
                  <Button
                    variant="gradient"
                    leftIcon={<SparklesIcon className="h-5 w-5" />}
                    onClick={() => setViewMode("generate")}
                  >
                    Generate Room Redesign
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
              Quick Generate Room Redesign
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
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    Room Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROOM_TYPES.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedGenerateRoomType(room.id)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedGenerateRoomType === room.id
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{room.icon}</span>
                          <span className="text-sm font-medium">
                            {room.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Design Style
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {AI_DESIGN_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedGenerateStyle(style.id)}
                        className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                          selectedGenerateStyle === style.id
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:border-white/25"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{style.name}</div>
                          <div className="text-sm text-slate-400">
                            {style.description}
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

                  {selectedListing ? (
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
                          Room & Style
                        </h5>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">
                            {getRoomTypeInfo(selectedGenerateRoomType).icon}
                          </span>
                          <span className="text-slate-300 text-sm">
                            {getRoomTypeInfo(selectedGenerateRoomType).name}
                          </span>
                        </div>
                        <div className="text-slate-300 text-sm">
                          {getDesignStyleInfo(selectedGenerateStyle).name} style
                        </div>
                        <div className="text-slate-400 text-xs">
                          {
                            getDesignStyleInfo(selectedGenerateStyle)
                              .description
                          }
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          to={`/listings/${selectedListing}/interior-reimagined?roomType=${selectedGenerateRoomType}&style=${selectedGenerateStyle}`}
                          className="w-full"
                        >
                          <Button
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            leftIcon={<SparklesIcon className="h-5 w-5" />}
                          >
                            Start Room Redesign
                          </Button>
                        </Link>

                        <p className="text-slate-400 text-xs text-center">
                          This will open the AI room redesign tool with your
                          selected options
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <PhotoIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm mb-2">
                        Ready to redesign
                      </p>
                      <p className="text-slate-400 text-xs">
                        Select a property to get started with AI room redesign
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">
                    🎨 How It Works
                  </h4>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p>1. Upload or select a room photo from your listing</p>
                    <p>
                      2. Choose the room type for accurate AI classification
                    </p>
                    <p>3. Pick your preferred design style</p>
                    <p>
                      4. AI generates a professional redesign in 30-60 seconds
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-2">
                    📊 Business Impact
                  </h4>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p>• Properties with redesigns get 23% more inquiries</p>
                    <p>• Clients download and share redesigns 3x more often</p>
                    <p>• Modern & Scandinavian styles perform best</p>
                    <p>• Living rooms and bedrooms drive highest engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorDesignDashboard;
