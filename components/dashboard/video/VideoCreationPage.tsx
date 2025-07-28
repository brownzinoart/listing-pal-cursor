import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../shared/Button";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Listing } from "../../../types";
import PropertySelector from "../../shared/PropertySelector";
import VideoAnalysisStep from "./VideoAnalysisStep";
import VideoScriptEditor from "./VideoScriptEditor";
import VideoGenerationStep from "./VideoGenerationStep";
import VideoPlatformPublisher from "./VideoPlatformPublisher";
import {
  videoGenerationService,
  VideoAnalysis,
  VideoScript,
  VideoGenerationResult,
} from "../../../services/videoGenerationService";
import * as listingService from "../../../services/listingService";
import { useAuth } from "../../../contexts/AuthContext";
import {
  DEMO_PROPERTIES,
  getDemoPropertyWithImages,
  DemoProperty,
} from "../../../services/demoPropertyService";

type WizardStep =
  | "property"
  | "upload"
  | "analysis"
  | "script"
  | "generation"
  | "publish"
  | "complete";

const VideoCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const template = location.state?.template || null;
  const [currentStep, setCurrentStep] = useState<WizardStep>("property");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [generatedVideo, setGeneratedVideo] =
    useState<VideoGenerationResult | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    if (template === "Quick Preview") {
      return { tiktok: true, instagram: true, youtube: false };
    } else if (template === "Virtual Tour") {
      return { tiktok: false, instagram: true, youtube: true };
    }
    return { tiktok: true, instagram: true, youtube: true };
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [selectedDemoProperty, setSelectedDemoProperty] = useState<
    string | null
  >(null);

  React.useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      try {
        const userListings = await listingService.getListings(user.id);
        setListings(userListings);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoadingListings(false);
      }
    };
    fetchListings();
  }, [user]);

  const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
    {
      key: "property",
      label: "Select Property",
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
    },
    {
      key: "upload",
      label: "Upload Images",
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
    },
    {
      key: "analysis",
      label: "AI Analysis",
      icon: <SparklesIcon className="h-5 w-5" />,
    },
    {
      key: "script",
      label: "Review Script",
      icon: <SparklesIcon className="h-5 w-5" />,
    },
    {
      key: "generation",
      label: "Generate Video",
      icon: <VideoCameraIcon className="h-5 w-5" />,
    },
    {
      key: "publish",
      label: "Publish",
      icon: <CheckCircleIcon className="h-5 w-5" />,
    },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((s) => s.key === currentStep);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const useMockData = () => {
    const mockFiles = [
      new File([""], "living-room.jpg", { type: "image/jpeg" }),
      new File([""], "kitchen.jpg", { type: "image/jpeg" }),
      new File([""], "bedroom.jpg", { type: "image/jpeg" }),
      new File([""], "bathroom.jpg", { type: "image/jpeg" }),
    ];
    setUploadedImages(mockFiles);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "property":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Choose Your Property
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Select a property to create an AI-powered video. Use our demo
                properties with professional images to see the full experience.
              </p>
            </div>

            {/* Demo Properties Section */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <h4 className="text-white font-semibold text-lg">
                  Demo Properties
                </h4>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full font-medium">
                  Recommended
                </span>
              </div>

              <p className="text-slate-300 mb-6">
                Try our curated luxury properties with professional photography
                - perfect for showcasing our AI video generation capabilities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DEMO_PROPERTIES.slice(0, 4).map((property) => (
                  <button
                    key={property.id}
                    onClick={async () => {
                      setIsLoadingDemo(true);
                      setSelectedDemoProperty(property.id);
                      try {
                        const { property: demoProperty, images } =
                          await getDemoPropertyWithImages(property.id);
                        setSelectedListing(demoProperty);
                        setUploadedImages(images);
                        setCurrentStep("upload"); // Auto-advance but stay visible
                      } catch (error) {
                        console.error("Failed to load demo property:", error);
                      } finally {
                        setIsLoadingDemo(false);
                      }
                    }}
                    className={`group relative bg-white/5 border border-white/20 rounded-xl p-6 text-left hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 ${
                      selectedDemoProperty === property.id
                        ? "border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/20"
                        : ""
                    }`}
                    disabled={isLoadingDemo}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h5 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                          {property.address}
                        </h5>
                        <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                          <span>{property.bedrooms} beds</span>
                          <span>•</span>
                          <span>{property.bathrooms} baths</span>
                          <span>•</span>
                          <span>{property.sqft?.toLocaleString()} sqft</span>
                        </div>
                      </div>
                      {property.style && (
                        <span className="bg-white/10 text-slate-300 text-xs px-3 py-1 rounded-full">
                          {property.style}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-purple-400">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                        }).format(property.price)}
                      </p>
                      <div className="text-slate-400 text-sm">
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">
                          Ready to use
                        </span>
                      </div>
                    </div>

                    {selectedDemoProperty === property.id && isLoadingDemo && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-sm text-white">
                            Loading property...
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Properties Section */}
            {listings.length > 0 && (
              <div className="bg-white/5 border border-white/20 rounded-2xl p-8">
                <h4 className="text-white font-semibold text-lg mb-6">
                  Your Properties
                </h4>
                <PropertySelector
                  listings={listings}
                  selectedListings={selectedListing ? [selectedListing.id] : []}
                  onSelectionChange={(ids) => {
                    const listing = listings.find((l) => l.id === ids[0]);
                    setSelectedListing(listing || null);
                  }}
                  placeholder="Select one of your properties"
                  multiSelect={false}
                />
              </div>
            )}

            {listings.length === 0 && !isLoadingListings && (
              <div className="bg-white/5 border border-white/20 rounded-2xl p-8 text-center">
                <div className="text-slate-400 mb-4">
                  <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No properties found in your account</p>
                  <p className="text-sm mt-2">
                    Add properties to your portfolio or use our demo properties
                    above
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "upload":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Review Property Details
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Verify your property selection and customize video settings
                before generating your AI-powered property video.
              </p>
            </div>

            {/* Selected Property Summary */}
            {selectedListing && (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <h4 className="text-white font-semibold">
                    Selected Property
                  </h4>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="text-white font-semibold text-lg">
                    {selectedListing.address}
                  </h5>
                  <div className="flex items-center gap-4 mt-2 text-slate-400">
                    <span>{selectedListing.bedrooms} beds</span>
                    <span>•</span>
                    <span>{selectedListing.bathrooms} baths</span>
                    <span>•</span>
                    <span>{selectedListing.sqft?.toLocaleString()} sqft</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400 mt-3">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(selectedListing.price)}
                  </p>
                </div>
              </div>
            )}

            {/* Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Property Images</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">
                      {uploadedImages.length} images ready
                    </span>
                    {selectedDemoProperty && (
                      <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                        Demo Content
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {uploadedImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-slate-700 group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() =>
                            setUploadedImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Images Upload */}
            {!selectedDemoProperty && (
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <h4 className="text-white font-semibold mb-4">
                  Add More Images
                </h4>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 transition-colors">
                  <CloudArrowUpIcon className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Click to upload additional images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-slate-400 text-sm mt-2">
                    or drag and drop
                  </p>
                </div>
              </div>
            )}

            {/* Platform Selection */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <h4 className="text-white font-semibold mb-4">
                Target Platforms
              </h4>
              <p className="text-slate-400 text-sm mb-6">
                Choose where you want to publish your video - we'll optimize for
                each platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    key: "tiktok",
                    label: "TikTok",
                    desc: "9:16 vertical • 60s max",
                    icon: "📱",
                  },
                  {
                    key: "instagram",
                    label: "Instagram Reels",
                    desc: "9:16 vertical • 90s max",
                    icon: "📷",
                  },
                  {
                    key: "youtube",
                    label: "YouTube Shorts",
                    desc: "9:16 vertical • 60s max",
                    icon: "🎥",
                  },
                ].map((platform) => (
                  <button
                    key={platform.key}
                    onClick={() =>
                      setSelectedPlatforms((prev) => ({
                        ...prev,
                        [platform.key]:
                          !prev[platform.key as keyof typeof prev],
                      }))
                    }
                    className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                      selectedPlatforms[
                        platform.key as keyof typeof selectedPlatforms
                      ]
                        ? "bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/20"
                        : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-purple-400/30"
                    }`}
                  >
                    <div className="text-2xl mb-3">{platform.icon}</div>
                    <h5
                      className={`font-semibold mb-2 ${
                        selectedPlatforms[
                          platform.key as keyof typeof selectedPlatforms
                        ]
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {platform.label}
                    </h5>
                    <p className="text-slate-400 text-sm">{platform.desc}</p>
                    {selectedPlatforms[
                      platform.key as keyof typeof selectedPlatforms
                    ] && (
                      <div className="mt-3">
                        <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                          Selected
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("property")}
                leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
              >
                Change Property
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setCurrentStep("analysis")}
                disabled={
                  !selectedListing ||
                  uploadedImages.length === 0 ||
                  !Object.values(selectedPlatforms).some(Boolean)
                }
                className="px-8 py-4"
              >
                Generate AI Video
                <SparklesIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "analysis":
        return (
          <VideoAnalysisStep
            images={uploadedImages}
            onComplete={(result) => {
              setAnalysis(result);
              handleNext();
            }}
          />
        );

      case "script":
        if (!selectedListing || !analysis) return null;
        return (
          <VideoScriptEditor
            listing={selectedListing}
            analysis={analysis}
            onComplete={(result) => {
              setScript(result);
              handleNext();
            }}
          />
        );

      case "generation":
        if (!script) return null;
        return (
          <VideoGenerationStep
            images={uploadedImages}
            script={script}
            platforms={selectedPlatforms}
            onComplete={(video) => {
              setGeneratedVideo(video);
              handleNext();
            }}
          />
        );

      case "publish":
        if (!generatedVideo) return null;
        return (
          <VideoPlatformPublisher
            video={generatedVideo}
            platforms={selectedPlatforms}
            onComplete={() => setCurrentStep("complete")}
          />
        );

      case "complete":
        return (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Video Published Successfully!
            </h3>
            <p className="text-slate-400 mb-8">
              Your property video is now live on selected platforms.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/videos")}
              >
                Back to Video Studio
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  setCurrentStep("property");
                  setSelectedListing(null);
                  setUploadedImages([]);
                  setAnalysis(null);
                  setScript(null);
                  setGeneratedVideo(null);
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "property":
        return selectedListing !== null;
      case "upload":
        return uploadedImages.length > 0;
      case "analysis":
        return false;
      case "script":
        return false;
      case "generation":
        return false;
      case "publish":
        return false;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto p-8">
        <button
          onClick={() => navigate("/dashboard/videos")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Video Studio
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 min-h-[80vh]">{renderStepContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default VideoCreationPage;
