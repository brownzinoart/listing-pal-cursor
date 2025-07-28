import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  UserIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
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

// ElevenLabs voice options
const VOICE_OPTIONS = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    gender: "female",
    style: "Professional",
    accent: "American",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    gender: "male",
    style: "Deep",
    accent: "American",
  },
  {
    id: "Yko7PKHZNXotIFUBG7I9",
    name: "Nicole",
    gender: "female",
    style: "Young",
    accent: "American",
  },
  {
    id: "TxGEqnHWrfWFTfGW9XjX",
    name: "Josh",
    gender: "male",
    style: "Mature",
    accent: "American",
  },
  {
    id: "flq6f7yk4E4fJM5XTYuZ",
    name: "Emily",
    gender: "female",
    style: "Warm",
    accent: "American",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    gender: "female",
    style: "Soft",
    accent: "American",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Daniel",
    gender: "male",
    style: "Strong",
    accent: "British",
  },
  {
    id: "pqHfZKP75CvOlQylNhV4",
    name: "Bill",
    gender: "male",
    style: "Documentary",
    accent: "American",
  },
];

interface VideoCreationSectionProps {
  onClose: () => void;
  template?: string | null;
}

const VideoCreationSection: React.FC<VideoCreationSectionProps> = ({
  onClose,
  template,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>("property");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [generatedVideo, setGeneratedVideo] =
    useState<VideoGenerationResult | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
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
  const [imageLoadStatus, setImageLoadStatus] = useState<{
    [key: number]: "loading" | "loaded" | "error";
  }>({});
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

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

  // Update videoGenerationService with selected voice
  React.useEffect(() => {
    (videoGenerationService as any).selectedVoiceId = selectedVoice;
  }, [selectedVoice]);

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

    // Initialize load status for new images
    const startIndex = uploadedImages.length;
    const newStatus: { [key: number]: "loading" | "loaded" | "error" } = {};
    files.forEach((_, index) => {
      newStatus[startIndex + index] = "loading";
    });
    setImageLoadStatus((prev) => ({ ...prev, ...newStatus }));
  };

  const handleDemoPropertySelect = async (propertyId: string) => {
    setIsLoadingDemo(true);
    setSelectedDemoProperty(propertyId);
    try {
      const { property: demoProperty, images } =
        await getDemoPropertyWithImages(propertyId);
      setSelectedListing(demoProperty);
      setUploadedImages(images);

      // Initialize load status for demo images
      const newStatus: { [key: number]: "loading" | "loaded" | "error" } = {};
      images.forEach((_, index) => {
        newStatus[index] = "loaded";
      });
      setImageLoadStatus(newStatus);

      handleNext(); // Auto-advance to upload step
    } catch (error) {
      console.error("Failed to load demo property:", error);
      alert("Failed to fetch images from Unsplash. Please try again.");
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleVoicePreview = async (voiceId: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    if (playingVoice === voiceId) {
      // If same voice is playing, stop it
      setPlayingVoice(null);
      return;
    }

    // For demo purposes, create a sample audio URL
    // In production, this would be actual voice sample URLs from ElevenLabs
    const sampleText =
      "Welcome to this beautiful property featuring modern amenities and stunning views.";
    const demoAudioUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?text=${encodeURIComponent(sampleText)}`;

    try {
      setPlayingVoice(voiceId);

      // For demo, we'll use a placeholder audio or synthesize
      // In production, you'd have pre-generated voice samples
      const audio = new Audio();

      // Use a demo audio file or text-to-speech API
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000); // Simulate 3-second sample
    } catch (error) {
      console.error("Failed to play voice sample:", error);
      setPlayingVoice(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "property":
        // Combine user listings with demo properties for the dropdown
        const allProperties = [
          ...DEMO_PROPERTIES.map((demo) => ({
            ...demo,
            id: `demo-${demo.id}`,
            userId: "demo",
            status: "demo" as const,
            description: `Demo property - ${demo.style || "Luxury"} style home`,
            features: ["Professional Photos", "AI-Ready", "Instant Setup"],
            imageUrl: "/api/placeholder/400/300",
          })),
          ...listings,
        ];

        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Choose Your Property
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Select a property to create an AI-powered video. Demo properties
                include professional images and are ready to use instantly.
              </p>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-2xl p-8">
              <PropertySelector
                listings={allProperties}
                selectedListings={selectedListing ? [selectedListing.id] : []}
                onSelectionChange={async (ids) => {
                  const propertyId = ids[0];
                  if (propertyId?.startsWith("demo-")) {
                    // Handle demo property selection
                    const demoId = propertyId.replace("demo-", "");
                    setIsLoadingDemo(true);
                    setSelectedDemoProperty(demoId);
                    try {
                      const { property: demoProperty, images } =
                        await getDemoPropertyWithImages(demoId);
                      setSelectedListing(demoProperty);
                      setUploadedImages(images);
                      setCurrentStep("upload");
                    } catch (error) {
                      console.error("Failed to load demo property:", error);
                    } finally {
                      setIsLoadingDemo(false);
                    }
                  } else {
                    // Handle regular property selection
                    const listing = listings.find((l) => l.id === propertyId);
                    setSelectedListing(listing || null);
                  }
                }}
                placeholder="Choose a property for your video"
                multiSelect={false}
              />

              {isLoadingDemo && (
                <div className="mt-6 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-slate-400">
                    Loading demo property images...
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Upload Property Images
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Upload high-quality images of the property. The AI will analyze
                and arrange them optimally.
              </p>

              {uploadedImages.length === 0 && (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-white/40 transition-colors">
                  <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-white font-medium">
                      Click to upload images
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
              )}

              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white">
                      {uploadedImages.length} images uploaded
                    </p>
                    {selectedDemoProperty && (
                      <p className="text-sm text-purple-400">
                        High-quality images from Unsplash
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-slate-700 group"
                      >
                        {imageLoadStatus[index] === "loading" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Property image ${index + 1}`}
                          className={`w-full h-full object-cover transition-opacity ${
                            imageLoadStatus[index] === "loading"
                              ? "opacity-0"
                              : "opacity-100"
                          }`}
                          onLoad={() =>
                            setImageLoadStatus((prev) => ({
                              ...prev,
                              [index]: "loaded",
                            }))
                          }
                          onError={() =>
                            setImageLoadStatus((prev) => ({
                              ...prev,
                              [index]: "error",
                            }))
                          }
                        />
                        {imageLoadStatus[index] === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                            <p className="text-xs text-red-400">
                              Failed to load
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setUploadedImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                            setImageLoadStatus((prev) => {
                              const newStatus = { ...prev };
                              delete newStatus[index];
                              return newStatus;
                            });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Selection */}
              <div className="mt-8">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <SpeakerWaveIcon className="h-5 w-5" />
                  Select Narrator Voice
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  Click the play button to preview each voice
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VOICE_OPTIONS.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        selectedVoice === voice.id
                          ? "bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/20"
                          : "bg-white/5 border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedVoice(voice.id)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <UserIcon
                              className={`h-5 w-5 ${voice.gender === "female" ? "text-pink-400" : "text-blue-400"}`}
                            />
                            <div>
                              <h5
                                className={`font-semibold ${
                                  selectedVoice === voice.id
                                    ? "text-white"
                                    : "text-slate-300"
                                }`}
                              >
                                {voice.name}
                              </h5>
                              <p className="text-xs text-slate-400">
                                {voice.style} • {voice.accent}
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleVoicePreview(voice.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            playingVoice === voice.id
                              ? "bg-purple-500 text-white"
                              : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
                          }`}
                          title={
                            playingVoice === voice.id
                              ? "Stop preview"
                              : "Play preview"
                          }
                        >
                          {playingVoice === voice.id ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {selectedVoice === voice.id && (
                        <div className="mt-2">
                          <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div className="mt-8">
                <h4 className="text-white font-medium mb-3">
                  Select Target Platforms
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  Choose where you want to publish your video - we'll optimize
                  for each platform
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

              {/* Generate Button */}
              <div className="mt-12 flex justify-between items-center">
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
              <Button variant="ghost" onClick={onClose}>
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
                  setImageLoadStatus({});
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
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-8 min-h-[80vh]">{renderStepContent()}</div>
    </div>
  );
};

export default VideoCreationSection;
