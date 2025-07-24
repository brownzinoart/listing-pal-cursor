import React, {
  useState,
  useEffect,
  useLayoutEffect,
  ChangeEvent,
} from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as listingService from "../../../services/listingService";
import { Listing } from "../../../types";
import {
  DESCRIPTION_STYLES,
  DescriptionStyleId,
  AI_DESIGN_STYLES,
  AiDesignStyleId,
  TOOLKIT_TOOLS,
} from "../../../constants";
import Button from "../../shared/Button";
import Card from "../../shared/Card";
import PropertySummaryHeader from "./PropertySummaryHeader";
import StyleButton from "./StyleButton";
import {
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PhotoIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";

// Types for selections
interface BatchSelections {
  description: {
    style: DescriptionStyleId;
  };
  email: {
    theme: EmailTheme;
  };
  roomRedesign: {
    selectedImageIndex: number | null;
    uploadedImage: string | null;
    uploadedImageFile: File | null;
    roomType: string;
    designStyle: AiDesignStyleId;
  };
  paidAds: {
    facebook: AdObjective | null;
    linkedin: AdObjective | null;
    google: AdObjective | null;
  };
}

type AdObjective = "WEBSITE_TRAFFIC" | "LEAD_GENERATION" | "BRAND_AWARENESS";
type EmailTheme =
  | "OPEN_HOUSE"
  | "PRICE_REDUCTION"
  | "NEW_LISTING"
  | "UNDER_CONTRACT"
  | "MARKET_UPDATE"
  | "EXCLUSIVE_SHOWING"
  | "FOLLOW_UP"
  | "COMING_SOON";

// Room type options
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

// Ad platforms and objectives
const AD_PLATFORMS: {
  id: keyof BatchSelections["paidAds"];
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "facebook", name: "Facebook & Instagram", icon: FaFacebook },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin },
  { id: "google", name: "Google Ads", icon: FaGoogle },
];

const EMAIL_THEMES: { id: EmailTheme; name: string; description: string }[] = [
  {
    id: "NEW_LISTING",
    name: "New Listing Alert",
    description: "Announce a fresh property on the market",
  },
  {
    id: "OPEN_HOUSE",
    name: "Open House Invitation",
    description: "Invite prospects to view the property",
  },
  {
    id: "PRICE_REDUCTION",
    name: "Price Reduction Notice",
    description: "Alert about updated pricing",
  },
  {
    id: "UNDER_CONTRACT",
    name: "Under Contract Update",
    description: "Notify that property is pending sale",
  },
  {
    id: "EXCLUSIVE_SHOWING",
    name: "Exclusive Showing",
    description: "Private viewing invitation for VIP clients",
  },
  {
    id: "MARKET_UPDATE",
    name: "Market Report",
    description: "Share neighborhood market insights",
  },
  {
    id: "FOLLOW_UP",
    name: "Follow-up Check-in",
    description: "Professional follow-up with prospects",
  },
  {
    id: "COMING_SOON",
    name: "Coming Soon Teaser",
    description: "Build anticipation for upcoming listing",
  },
];

const AD_OBJECTIVES: { id: AdObjective; name: string; description: string }[] =
  [
    {
      id: "WEBSITE_TRAFFIC",
      name: "Website Traffic",
      description: "Send people to your property page",
    },
    {
      id: "LEAD_GENERATION",
      name: "Lead Generation",
      description: "Collect contact info with forms",
    },
    {
      id: "BRAND_AWARENESS",
      name: "Brand Awareness",
      description: "Maximize ad visibility",
    },
  ];

const PreselectBatchPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Batch selections state
  const [selections, setSelections] = useState<BatchSelections>({
    description: {
      style: DESCRIPTION_STYLES[0].id,
    },
    email: {
      theme: "NEW_LISTING",
    },
    roomRedesign: {
      selectedImageIndex: null,
      uploadedImage: null,
      uploadedImageFile: null,
      roomType: "livingroom",
      designStyle: AI_DESIGN_STYLES[0]?.id || "modern",
    },
    paidAds: {
      facebook: null,
      linkedin: null,
      google: null,
    },
  });

  // Ensure design style is properly initialized on mount
  useEffect(() => {
    const defaultDesignStyle = AI_DESIGN_STYLES[0]?.id || "modern";
    console.log("🎨 Ensuring design style is initialized:", defaultDesignStyle);
    console.log(
      "📋 Available design styles:",
      AI_DESIGN_STYLES.map((s) => s.id),
    );

    if (
      !selections.roomRedesign.designStyle ||
      selections.roomRedesign.designStyle !== defaultDesignStyle
    ) {
      console.log(
        "🔄 Forcing design style update from",
        selections.roomRedesign.designStyle,
        "to",
        defaultDesignStyle,
      );
      setSelections((prev) => ({
        ...prev,
        roomRedesign: {
          ...prev.roomRedesign,
          designStyle: defaultDesignStyle,
        },
      }));
    }
  }, []); // Run only once on mount

  // Scroll to top before render (no visible scroll)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debug log for selections
  useEffect(() => {
    console.log("🔍 Current selections state:", selections);
  }, [selections]);

  // Workflow management - Default to the four tools that require selections
  const workflowParam = searchParams.get("workflow");
  const workflowTools = workflowParam
    ? workflowParam.split(",")
    : ["desc", "email", "interior", "paid_ads"];
  const isInWorkflow = workflowTools.length > 1;

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided.");
      setIsLoadingPage(false);
      return;
    }

    listingService
      .getListingById(listingId)
      .then((data) => {
        if (data && data.userId === user?.id) {
          setListing(data);
          // Pre-select first image if available and ensure design style is set
          if (data.images && data.images.length > 0) {
            console.log("🖼️ Auto-selecting first image for room redesign");
            setSelections((prev) => ({
              ...prev,
              roomRedesign: {
                ...prev.roomRedesign,
                selectedImageIndex: 0,
                // Ensure design style is properly set
                designStyle: AI_DESIGN_STYLES[0]?.id || "modern",
              },
            }));
          } else {
            // Even if no images, ensure design style is set
            console.log(
              "🎨 Ensuring design style is set (no images available)",
            );
            setSelections((prev) => ({
              ...prev,
              roomRedesign: {
                ...prev.roomRedesign,
                designStyle: AI_DESIGN_STYLES[0]?.id || "modern",
              },
            }));
          }
        } else {
          setError(
            data
              ? "You don't have permission to edit this listing."
              : "Listing not found.",
          );
        }
      })
      .catch((err) => {
        console.error("Error loading listing:", err);
        setError("Failed to fetch listing details.");
      })
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Invalid file type. Please upload an image (PNG, JPG, WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File is too large. Maximum size is 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelections((prev) => ({
          ...prev,
          roomRedesign: {
            ...prev.roomRedesign,
            selectedImageIndex: null, // Clear existing image selection
            uploadedImage: reader.result as string,
            uploadedImageFile: file,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleStartBatchGeneration = () => {
    console.log("🚀 Starting batch generation with selections:", selections);

    // Validate selections
    const hasImageSelected =
      selections.roomRedesign.selectedImageIndex !== null ||
      selections.roomRedesign.uploadedImage !== null;
    const hasAdObjectiveSelected = Object.values(selections.paidAds).some(
      (obj) => obj !== null,
    );

    console.log("✅ Validation checks:", {
      hasImageSelected,
      selectedImageIndex: selections.roomRedesign.selectedImageIndex,
      uploadedImage: !!selections.roomRedesign.uploadedImage,
      roomType: selections.roomRedesign.roomType,
      designStyle: selections.roomRedesign.designStyle,
      hasAdObjectiveSelected,
      adObjectives: selections.paidAds,
    });

    if (!hasImageSelected) {
      console.error("❌ No image selected for room redesign");
      alert("Please select an image for room redesign or upload a new one.");
      return;
    }

    if (!hasAdObjectiveSelected) {
      console.error("❌ No ad objectives selected");
      alert("Please select at least one ad objective for paid ads.");
      return;
    }

    // Store selections in sessionStorage for the workflow
    console.log("💾 Storing batch selections in sessionStorage:", selections);
    sessionStorage.setItem("batchSelections", JSON.stringify(selections));

    // Navigate to the batch progress page with selections
    console.log(
      "🎯 Navigating to batch generation page with workflow:",
      workflowTools,
    );
    navigate(
      `/listings/${listingId}/generate-all?workflow=${workflowTools.join(",")}&batch=true`,
    );
  };

  const getSelectedImage = () => {
    if (selections.roomRedesign.uploadedImage) {
      return selections.roomRedesign.uploadedImage;
    }
    if (
      selections.roomRedesign.selectedImageIndex !== null &&
      listing?.images
    ) {
      return listing.images[selections.roomRedesign.selectedImageIndex]?.url;
    }
    return null;
  };

  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-danger bg-red-900/20 p-4 rounded-md max-w-md mx-auto">
          {error}
        </p>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (!listing) {
    return (
      <p className="text-center text-brand-text-secondary py-10">
        Listing data is unavailable.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link
            to={`/listings/${listingId}`}
            className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back to Property
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Batch Content Generation
        </h1>
        <p className="text-brand-text-secondary mb-8">
          Select your preferences for all content types, then generate
          everything at once.
        </p>

        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="space-y-8">
          {/* 1. Description Style Selection */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-6 w-6 text-brand-secondary mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">
                  Property Description Style
                </h3>
                <p className="text-sm text-brand-text-secondary">
                  Choose the writing tone for your MLS description
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DESCRIPTION_STYLES.map((style) => (
                <StyleButton
                  key={style.id}
                  name={style.name}
                  description={style.description}
                  isSelected={selections.description.style === style.id}
                  onClick={() =>
                    setSelections((prev) => ({
                      ...prev,
                      description: { style: style.id },
                    }))
                  }
                />
              ))}
            </div>
          </Card>

          {/* 2. Email Generator Theme Selection */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center mb-6">
              <EnvelopeIcon className="h-6 w-6 text-brand-secondary mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">
                  Email Campaign Theme
                </h3>
                <p className="text-sm text-brand-text-secondary">
                  Select the type of email campaign to generate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EMAIL_THEMES.map((theme) => (
                <StyleButton
                  key={theme.id}
                  name={theme.name}
                  description={theme.description}
                  isSelected={selections.email.theme === theme.id}
                  onClick={() =>
                    setSelections((prev) => ({
                      ...prev,
                      email: { theme: theme.id },
                    }))
                  }
                />
              ))}
            </div>
          </Card>

          {/* 3. Room Redesign Image & Style Selection */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center mb-6">
              <SparklesIcon className="h-6 w-6 text-brand-secondary mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">
                  AI Room Redesign
                </h3>
                <p className="text-sm text-brand-text-secondary">
                  Select an image and choose room type & design style
                </p>
              </div>
            </div>

            {/* Image Selection */}
            <div className="mb-6">
              <h4 className="font-medium text-brand-text-primary mb-4">
                Select Room Image
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {listing.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(
                        `🖼️ Image ${index} clicked (was: ${selections.roomRedesign.selectedImageIndex})`,
                      );
                      setSelections((prev) => ({
                        ...prev,
                        roomRedesign: {
                          ...prev.roomRedesign,
                          selectedImageIndex: index,
                          uploadedImage: null,
                          uploadedImageFile: null,
                        },
                      }));
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selections.roomRedesign.selectedImageIndex === index
                        ? "border-brand-primary ring-2 ring-brand-primary/20"
                        : "border-brand-border hover:border-brand-primary/50"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selections.roomRedesign.selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                        <CheckIcon className="h-8 w-8 text-brand-primary" />
                      </div>
                    )}
                  </button>
                ))}

                {/* Upload new image option */}
                <label
                  className={`relative aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    selections.roomRedesign.uploadedImage
                      ? "border-brand-primary bg-brand-primary/10"
                      : "border-brand-border hover:border-brand-primary/50 hover:bg-brand-border/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {selections.roomRedesign.uploadedImage ? (
                    <>
                      <img
                        src={selections.roomRedesign.uploadedImage}
                        alt="Uploaded"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                        <CheckIcon className="h-8 w-8 text-brand-primary" />
                      </div>
                    </>
                  ) : (
                    <>
                      <PhotoIcon className="h-8 w-8 text-brand-text-tertiary mb-2" />
                      <span className="text-xs text-brand-text-tertiary text-center">
                        Upload
                        <br />
                        New Image
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Room Type & Design Style Selection - Only show if image is selected */}
            {getSelectedImage() && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-brand-text-primary mb-4">
                    Room Type
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ROOM_TYPES.map((room) => (
                      <StyleButton
                        key={room.id}
                        name={`${room.icon} ${room.name}`}
                        description=""
                        isSelected={
                          selections.roomRedesign.roomType === room.id
                        }
                        onClick={() => {
                          console.log(
                            `🏠 Room type clicked: ${room.id} (was: ${selections.roomRedesign.roomType})`,
                          );
                          setSelections((prev) => ({
                            ...prev,
                            roomRedesign: {
                              ...prev.roomRedesign,
                              roomType: room.id,
                            },
                          }));
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-brand-text-primary mb-4">
                    Design Style
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {AI_DESIGN_STYLES.map((style) => (
                      <StyleButton
                        key={style.id}
                        name={style.name}
                        description={style.description}
                        isSelected={
                          selections.roomRedesign.designStyle === style.id
                        }
                        onClick={() => {
                          console.log(
                            `🎨 Design style clicked: ${style.id} (was: ${selections.roomRedesign.designStyle})`,
                          );
                          setSelections((prev) => ({
                            ...prev,
                            roomRedesign: {
                              ...prev.roomRedesign,
                              designStyle: style.id,
                            },
                          }));
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 4. Paid Ads Platform & Objectives */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center mb-6">
              <MegaphoneIcon className="h-6 w-6 text-brand-secondary mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">
                  Paid Ad Campaigns
                </h3>
                <p className="text-sm text-brand-text-secondary">
                  Select objectives for each advertising platform
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {AD_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div
                    key={platform.id}
                    className="border border-brand-border rounded-lg p-4"
                  >
                    <div className="flex items-center mb-4">
                      <Icon className="h-5 w-5 text-brand-text-secondary mr-2" />
                      <h4 className="font-medium text-brand-text-primary">
                        {platform.name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {AD_OBJECTIVES.map((objective) => (
                        <StyleButton
                          key={objective.id}
                          name={objective.name}
                          description={objective.description}
                          isSelected={
                            selections.paidAds[platform.id] === objective.id
                          }
                          onClick={() =>
                            setSelections((prev) => ({
                              ...prev,
                              paidAds: {
                                ...prev.paidAds,
                                [platform.id]:
                                  prev.paidAds[platform.id] === objective.id
                                    ? null
                                    : objective.id,
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/listings/${listingId}`)}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartBatchGeneration}
              leftIcon={<SparklesIcon className="h-5 w-5" />}
              size="lg"
              className="flex-1"
            >
              Start Batch Generation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreselectBatchPage;
