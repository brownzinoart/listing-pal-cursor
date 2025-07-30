import React, { useState, useEffect, ChangeEvent } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as listingService from "../../services/listingService";
import { Listing } from "../../types";
import {
  AI_DESIGN_STYLES,
  AiDesignStyleId,
  TOOLKIT_TOOLS,
} from "../../constants";
import {
  restyleRoom,
  RestyleOptions,
  getAPIConfig,
  checkServiceHealth,
} from "../../services/roomRestyleService";
import Button from "../shared/Button";
import Input from "../shared/Input";
import AiDesignStyleCard from "./generation/AiDesignStyleCard";
import WorkflowNavigation from "./generation/WorkflowNavigation";
import PropertySummaryHeader from "./generation/PropertySummaryHeader";
import ModernDashboardLayout from "../shared/ModernDashboardLayout";
import {
  ArrowLeftIcon,
  PhotoIcon,
  CameraIcon,
  SparklesIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// Room type options from the API
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

const AiRoomRedesignPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedDesignStyle, setSelectedDesignStyle] =
    useState<AiDesignStyleId | null>(AI_DESIGN_STYLES[0]?.id || null);
  const [selectedRoomType, setSelectedRoomType] =
    useState<string>("livingroom");
  const [activeTab, setActiveTab] = useState<"roomtype" | "style">("roomtype");
  const [designPrompt, setDesignPrompt] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Base64 string
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // File object for API
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(
    null,
  );
  const [generatedRedesign, setGeneratedRedesign] = useState<string | null>(
    null,
  ); // URL of redesigned image

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Advanced options state
  const [showAdvancedOptions, setShowAdvancedOptions] =
    useState<boolean>(false);
  const [usePaidAPI, setUsePaidAPI] = useState<boolean>(false);
  const [numImages, setNumImages] = useState<number>(1);
  const [upscaleResult, setUpscaleResult] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<{
    available: boolean;
    apiType: "paid" | "local";
    error?: string;
  } | null>(null);

  // Workflow management
  const workflowParam = searchParams.get("workflow");
  const workflowTools = workflowParam ? workflowParam.split(",") : [];
  const isInWorkflow = workflowTools.length > 1;

  // Get previous step name for back navigation
  const getPreviousStepName = () => {
    if (!isInWorkflow) return "Property";
    const currentIndex = workflowTools.indexOf("interior");
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(
        (tool) => tool.id === previousToolId,
      );
      return previousTool?.name || "Previous Step";
    }
    return "Property";
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf("interior");
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(
        (tool) => tool.id === previousToolId,
      );
      if (previousTool?.pathSuffix) {
        return `/listings/${listingId}${previousTool.pathSuffix}?workflow=${workflowParam}`;
      }
    }
    return `/listings/${listingId}`;
  };

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided.");
      setIsLoadingPage(false);
      return;
    }
    setIsLoadingPage(true);

    // Check API health and initialize settings
    const checkHealth = async () => {
      try {
        console.log("Checking API health...");
        const health = await checkServiceHealth();
        console.log("Health check result:", health);
        setApiHealth(health);
        const config = getAPIConfig();
        setUsePaidAPI(config.usePaidAPI);
      } catch (error) {
        console.error("Failed to check API health:", error);
        // Set a fallback health status to prevent UI from breaking
        setApiHealth({
          available: false,
          apiType: "local",
          error: "Could not reach API service",
        });
      }
    };

    Promise.all([listingService.getListingById(listingId), checkHealth()])
      .then(([data]) => {
        if (data && data.userId === user?.id) {
          setListing(data);
        } else if (data && data.userId !== user?.id) {
          setError("You do not have permission to access this page.");
        } else {
          setError("Listing not found.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch listing details.");
      })
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadedImage(null);
    setUploadedImageFile(null);
    setUploadedImageName(null);
    setGeneratedRedesign(null);

    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFileError(
          "Invalid file type. Please upload an image (PNG, JPG, WEBP).",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setFileError("File is too large. Maximum size is 5MB.");
        return;
      }

      // Store the file for API calls
      setUploadedImageFile(file);
      setUploadedImageName(file.name);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.onerror = () => {
        setFileError("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ""; // Allow re-uploading the same file
  };

  // Map AI design styles to room types and design styles
  const mapDesignStyleToHuggingFace = (
    styleId: AiDesignStyleId,
    roomType: string,
  ) => {
    const roomTypeMap: Record<string, string> = {
      livingroom: "Living Room",
      bedroom: "Bedroom",
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      diningroom: "Dining Room",
      homeoffice: "Home Office",
      nursery: "Nursery",
      basement: "Basement",
    };

    // Map to exact API style names (from /styles endpoint)
    const styleMap: Record<AiDesignStyleId, string> = {
      modern: "modern",
      scandinavian: "scandinavian",
      minimalist: "minimalist",
      industrial: "industrial",
      bohemian: "bohemian",
      traditional: "traditional",
      midcenturymodern: "midcenturymodern",
      glamorous: "glamorous",
      rustic: "rustic",
      contemporary: "contemporary",
      eclectic: "eclectic",
      farmhouse: "farmhouse",
    };

    return {
      room_type: roomTypeMap[roomType] || "Living Room",
      style: styleMap[styleId] || "contemporary",
    };
  };

  const handleGenerateRedesign = async () => {
    if (!uploadedImageFile || !selectedDesignStyle || !selectedRoomType) {
      setError(
        "Please upload an image, select a room type, and select a design style.",
      );
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedRedesign(null);

    try {
      const mappedStyle = mapDesignStyleToHuggingFace(
        selectedDesignStyle,
        selectedRoomType,
      );

      const options: RestyleOptions = {
        usePaidAPI: usePaidAPI,
        numImages: numImages,
        upscale: upscaleResult,
      };

      const response = await restyleRoom(
        uploadedImageFile,
        designPrompt || `${mappedStyle.style} style ${mappedStyle.room_type}`,
        selectedRoomType,
        mappedStyle.style.toLowerCase(),
        options,
      );

      if (response.success && response.imageUrl) {
        setGeneratedRedesign(response.imageUrl);
      } else {
        setError(
          response.error ||
            "Failed to generate room redesign. Please try again.",
        );
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError(
        "An error occurred while generating the room redesign. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingPage) {
    return (
      <ModernDashboardLayout
        title="AI Room Redesign"
        subtitle="Transform your spaces with AI-powered interior design"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (error && !listing) {
    // Show general error if listing also fails to load
    return (
      <ModernDashboardLayout
        title="AI Room Redesign"
        subtitle="Transform your spaces with AI-powered interior design"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="glass" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (!listing) {
    return (
      <ModernDashboardLayout
        title="AI Room Redesign"
        subtitle="Transform your spaces with AI-powered interior design"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-slate-400">Listing data is unavailable.</p>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  const handleConfirmAndSave = async () => {
    if (!listingId || !generatedRedesign || !uploadedImage) {
      alert("No redesigned image to save.");
      return;
    }

    // Prepare redesigned image object for images array
    const newImage = {
      url: generatedRedesign,
      label: `${selectedDesignStyle} Redesign of ${selectedRoomType}`,
      isRedesign: true,
      originalImageUrl: uploadedImage,
    };

    // Prepare generatedRoomDesign entry (to power workflow status)
    const newRoomDesign = {
      originalImageUrl: uploadedImage!,
      styleId: selectedDesignStyle!,
      redesignedImageUrl: generatedRedesign,
      prompt: designPrompt,
      createdAt: new Date().toISOString(),
    };

    const updatedImages = [...(listing.images || []), newImage];
    const updatedRoomDesigns = [
      ...(listing.generatedRoomDesigns || []),
      newRoomDesign,
    ];

    try {
      await listingService.updateListing(listingId, {
        images: updatedImages,
        generatedRoomDesigns: updatedRoomDesigns,
      });
      navigate(`/listings/${listingId}`);
    } catch (error) {
      console.error("Failed to save redesigned image:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  const headerActions = (
    <Link to={getPreviousStepPath()}>
      <Button
        variant="glass"
        size="sm"
        leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
      >
        Back to {getPreviousStepName()}
      </Button>
    </Link>
  );

  return (
    <ModernDashboardLayout
      title="AI Room Redesign"
      subtitle="Transform your spaces with AI-powered interior design"
      actions={headerActions}
    >
      <div className="space-y-8">
        {isInWorkflow && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <WorkflowNavigation
                workflowTools={workflowTools}
                currentToolId="interior"
              />
            </div>
          </div>
        )}

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <PropertySummaryHeader listing={listing} />
          </div>
        </div>

        {/* Main Content: Upload & Output */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left: Image Upload & Preview */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <PhotoIcon className="h-6 w-6 text-purple-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">
                  Upload Room Photo
                </h3>
              </div>
              <p className="text-slate-400 mb-6">
                Upload a clear photo of the room you want to redesign. Photos
                taken with your phone camera work perfectly!
              </p>

              {!uploadedImage ? (
                <div className="space-y-6">
                  {/* Image Upload Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Traditional Upload */}
                    <label
                      htmlFor="room-image-upload"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-400/50 hover:bg-white/5 transition-all duration-200"
                    >
                      <PhotoIcon className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-white font-medium">
                        Upload Photo
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </label>
                    <input
                      type="file"
                      id="room-image-upload"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Mobile Camera */}
                    <label
                      htmlFor="mobile-camera-upload"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-400/50 hover:bg-white/5 transition-all duration-200"
                    >
                      <CameraIcon className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-white font-medium">
                        Take Photo
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Mobile camera
                      </span>
                    </label>
                    <input
                      type="file"
                      id="mobile-camera-upload"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Custom Instructions (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., add a modern coffee table and a large plant"
                      value={designPrompt}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setDesignPrompt(e.target.value)
                      }
                      className="w-full text-sm"
                      variant="gradient"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded room"
                      className="w-full rounded-xl shadow-lg border border-white/20"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedImageFile(null);
                        setUploadedImageName(null);
                        setGeneratedRedesign(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-300 text-center">
                    {uploadedImageName}
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Custom Instructions (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., add a modern coffee table and a large plant"
                      value={designPrompt}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setDesignPrompt(e.target.value)
                      }
                      className="w-full text-sm"
                      variant="gradient"
                    />
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-red-400 mt-2">{fileError}</p>
              )}
            </div>
          </div>

          {/* Right: Output Area */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <SparklesIcon className="h-6 w-6 text-indigo-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">
                  Redesigned Room
                </h3>
              </div>

              {!generatedRedesign ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/20 rounded-xl">
                  <SparklesIcon className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-400 text-center">
                    Upload a room photo and select your style to see the
                    AI-generated redesign here
                  </p>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <img
                      src={generatedRedesign}
                      alt="Redesigned room"
                      className="w-full rounded-xl shadow-lg border border-indigo-400/50"
                    />
                    <div className="absolute top-3 left-3 bg-indigo-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium">
                      {AI_DESIGN_STYLES.find(
                        (s) => s.id === selectedDesignStyle,
                      )?.name || "Redesigned"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection Process */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Select Room Type & Design Style
            </h3>

            {/* Tab Navigation */}
            <div className="flex justify-between items-center border-b border-white/20 mb-6">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("roomtype")}
                  className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === "roomtype"
                      ? "border-blue-400 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  Room Type
                  {selectedRoomType && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("style")}
                  className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ml-6 ${
                    activeTab === "style"
                      ? "border-blue-400 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  Design Style
                  {selectedDesignStyle && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Generate/Regenerate & Save Buttons */}
              <div className="pb-2 flex gap-3">
                <Button
                  onClick={handleGenerateRedesign}
                  isLoading={isGenerating}
                  disabled={
                    !uploadedImage ||
                    !selectedRoomType ||
                    !selectedDesignStyle ||
                    isGenerating
                  }
                  variant="gradient"
                  leftIcon={
                    isGenerating ? undefined : generatedRedesign ? (
                      <ArrowPathIcon className="h-5 w-5" />
                    ) : (
                      <SparklesIcon className="h-5 w-5" />
                    )
                  }
                  size="lg"
                >
                  {isGenerating
                    ? "Generating..."
                    : generatedRedesign
                      ? "Regenerate"
                      : "Generate Redesign"}
                </Button>

                <Button
                  onClick={handleConfirmAndSave}
                  disabled={
                    !uploadedImage ||
                    !selectedRoomType ||
                    !selectedDesignStyle ||
                    !generatedRedesign ||
                    isGenerating
                  }
                  variant="glow"
                  glowColor="emerald"
                  leftIcon={<CheckIcon className="h-5 w-5" />}
                  size="lg"
                >
                  {isInWorkflow ? "Continue" : "Save & Continue"}
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "roomtype" && (
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Choose the room type:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ROOM_TYPES.map((roomType) => (
                    <button
                      key={roomType.id}
                      onClick={() => {
                        setSelectedRoomType(roomType.id);
                        setActiveTab("style"); // Auto-advance to next tab
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedRoomType === roomType.id
                          ? "border-blue-400 bg-blue-400/20 text-blue-400"
                          : "border-white/20 text-slate-300 hover:border-blue-400/50 hover:bg-white/5"
                      }`}
                    >
                      <div className="text-2xl mb-2">{roomType.icon}</div>
                      <div className="text-sm font-medium leading-tight">
                        {roomType.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "style" && (
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Choose your design style:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                  {AI_DESIGN_STYLES.map((style) => (
                    <AiDesignStyleCard
                      key={style.id}
                      style={style}
                      isSelected={selectedDesignStyle === style.id}
                      onSelect={() => setSelectedDesignStyle(style.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && !isGenerating && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-red-500/20 rounded-3xl p-6">
              <div className="flex items-center text-red-400">
                <InformationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
};

export default AiRoomRedesignPage;
