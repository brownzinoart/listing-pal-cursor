import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as listingService from "../../services/listingService";
import { contentGenerationService } from "../../services/contentGenerationService";
import { Listing } from "../../types";
import {
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "../shared/Button";

interface BatchGenerationStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  result?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
}

const ContentGenerationProgressPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [batchSelections, setBatchSelections] = useState<any>(null);
  const [steps, setSteps] = useState<BatchGenerationStep[]>([
    {
      id: "description",
      name: "Property Description",
      description: "Professional MLS property description",
      status: "pending",
    },
    {
      id: "email",
      name: "Email Campaign",
      description: "Professional email marketing content",
      status: "pending",
    },
    {
      id: "facebook-post",
      name: "Facebook Post",
      description: "Engaging social media post for Facebook",
      status: "pending",
    },
    {
      id: "instagram-post",
      name: "Instagram Post",
      description: "Visual-focused caption for Instagram",
      status: "pending",
    },
    {
      id: "x-post",
      name: "X (Twitter) Post",
      description: "Concise post for X/Twitter",
      status: "pending",
    },
    {
      id: "interior-reimagined",
      name: "AI Room Redesign",
      description: "Interior design concepts and styling",
      status: "pending",
    },
    {
      id: "paid-ads",
      name: "Paid Ad Campaigns",
      description: "Multi-platform advertising copy",
      status: "pending",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [batchStartTime, setBatchStartTime] = useState<number | null>(null);
  const [batchEndTime, setBatchEndTime] = useState<number | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided");
      return;
    }

    // Check for batch selections from sessionStorage
    const storedSelections = sessionStorage.getItem("batchSelections");
    if (storedSelections) {
      setBatchSelections(JSON.parse(storedSelections));
      sessionStorage.removeItem("batchSelections");
    }

    // Fetch listing data
    listingService
      .getListingById(listingId)
      .then((data) => {
        if (data && data.userId === user?.id) {
          setListing(data);
          // Auto-start batch generation
          startBatchGeneration(
            data,
            storedSelections ? JSON.parse(storedSelections) : null,
          );
        } else {
          setError(data ? "Permission denied" : "Listing not found");
        }
      })
      .catch(() => setError("Failed to fetch listing details"));
  }, [listingId, user]);

  // Auto-redirect countdown effect
  useEffect(() => {
    if (isComplete && !redirectCountdown) {
      setRedirectCountdown(3);
    }
  }, [isComplete]);

  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      navigate(`/listings/${listingId}`);
    }
  }, [redirectCountdown, listingId, navigate]);

  const startBatchGeneration = async (
    listingData: Listing,
    selections: any,
  ) => {
    setIsGenerating(true);
    setError(null);
    setBatchStartTime(Date.now());

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStepIndex(i);

        // Update step to in-progress
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: "in-progress", startTime: Date.now() }
              : s,
          ),
        );

        try {
          let content = "";
          let options: any = {};

          // Prepare options based on selections and step type
          switch (step.id) {
            case "description":
              if (selections?.description?.style) {
                options.style = selections.description.style;
              }
              content = await contentGenerationService.generateContentStep(
                listingData,
                "mls-description",
                options,
              );
              break;

            case "email":
              if (selections?.email?.theme) {
                options.theme = selections.email.theme;
              }
              content = await contentGenerationService.generateContentStep(
                listingData,
                "email",
                options,
              );
              break;

            case "interior-reimagined":
              if (selections?.roomRedesign) {
                if (selections.roomRedesign.uploadedImage) {
                  options.selectedImage = selections.roomRedesign.uploadedImage;
                } else if (
                  selections.roomRedesign.selectedImageIndex !== null &&
                  listingData.images
                ) {
                  options.selectedImage =
                    listingData.images[
                      selections.roomRedesign.selectedImageIndex
                    ]?.url;
                }
                options.roomType = selections.roomRedesign.roomType;
                options.designStyle = selections.roomRedesign.designStyle;
              }
              content = await contentGenerationService.generateContentStep(
                listingData,
                "interior-reimagined",
                options,
              );
              break;

            case "paid-ads":
              if (selections?.paidAds) {
                options.objectives = selections.paidAds;
              }
              content = await contentGenerationService.generateContentStep(
                listingData,
                "paid-ads",
                options,
              );
              break;

            default:
              // For facebook-post, instagram-post, x-post - no special options needed
              content = await contentGenerationService.generateContentStep(
                listingData,
                step.id,
                options,
              );
              break;
          }

          // Update step to completed
          setSteps((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? {
                    ...s,
                    status: "completed",
                    result: content,
                    endTime: Date.now(),
                  }
                : s,
            ),
          );

          // Save content to listing
          const updateData: any = {};
          switch (step.id) {
            case "description":
              updateData.generatedDescription = content;
              break;
            case "email":
              updateData.generatedEmail = content;
              break;
            case "facebook-post":
              updateData.generatedFacebookPost = content;
              break;
            case "instagram-post":
              updateData.generatedInstagramPost = content;
              break;
            case "x-post":
              updateData.generatedXPost = content;
              break;
            case "interior-reimagined":
              updateData.generatedRoomDesigns = [{ content, type: "concept" }];
              break;
            case "paid-ads":
              updateData.generatedAdCopy = content;
              break;
          }

          await listingService.updateListing(listingId!, updateData);

          // Small delay for UX
          await new Promise((resolve) => setTimeout(resolve, 800));
        } catch (stepError) {
          console.error(`Error generating ${step.name}:`, stepError);
          setSteps((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? {
                    ...s,
                    status: "failed",
                    error:
                      stepError instanceof Error
                        ? stepError.message
                        : "Generation failed",
                    endTime: Date.now(),
                  }
                : s,
            ),
          );
        }
      }

      setBatchEndTime(Date.now());
      setIsComplete(true);
    } catch (error) {
      console.error("Batch generation error:", error);
      setError("Failed to complete batch generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const retryStep = async (stepIndex: number) => {
    if (!listing) return;

    const step = steps[stepIndex];
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === stepIndex
          ? {
              ...s,
              status: "in-progress",
              error: undefined,
              startTime: Date.now(),
            }
          : s,
      ),
    );

    try {
      let content = "";
      let options: any = {};

      // Prepare options based on selections and step type (same logic as above)
      switch (step.id) {
        case "description":
          if (batchSelections?.description?.style) {
            options.style = batchSelections.description.style;
          }
          content = await contentGenerationService.generateContentStep(
            listing,
            "mls-description",
            options,
          );
          break;
        case "email":
          if (batchSelections?.email?.theme) {
            options.theme = batchSelections.email.theme;
          }
          content = await contentGenerationService.generateContentStep(
            listing,
            "email",
            options,
          );
          break;
        case "interior-reimagined":
          if (batchSelections?.roomRedesign) {
            if (batchSelections.roomRedesign.uploadedImage) {
              options.selectedImage =
                batchSelections.roomRedesign.uploadedImage;
            } else if (
              batchSelections.roomRedesign.selectedImageIndex !== null &&
              listing.images
            ) {
              options.selectedImage =
                listing.images[
                  batchSelections.roomRedesign.selectedImageIndex
                ]?.url;
            }
            options.roomType = batchSelections.roomRedesign.roomType;
            options.designStyle = batchSelections.roomRedesign.designStyle;
          }
          content = await contentGenerationService.generateContentStep(
            listing,
            "interior-reimagined",
            options,
          );
          break;
        case "paid-ads":
          if (batchSelections?.paidAds) {
            options.objectives = batchSelections.paidAds;
          }
          content = await contentGenerationService.generateContentStep(
            listing,
            "paid-ads",
            options,
          );
          break;
        default:
          content = await contentGenerationService.generateContentStep(
            listing,
            step.id,
            options,
          );
          break;
      }

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === stepIndex
            ? {
                ...s,
                status: "completed",
                result: content,
                endTime: Date.now(),
              }
            : s,
        ),
      );

      // Save content to listing
      const updateData: any = {};
      switch (step.id) {
        case "description":
          updateData.generatedDescription = content;
          break;
        case "email":
          updateData.generatedEmail = content;
          break;
        case "facebook-post":
          updateData.generatedFacebookPost = content;
          break;
        case "instagram-post":
          updateData.generatedInstagramPost = content;
          break;
        case "x-post":
          updateData.generatedXPost = content;
          break;
        case "interior-reimagined":
          updateData.generatedRoomDesigns = [{ content, type: "concept" }];
          break;
        case "paid-ads":
          updateData.generatedAdCopy = content;
          break;
      }

      await listingService.updateListing(listingId!, updateData);
    } catch (error) {
      console.error(`Retry error for ${step.name}:`, error);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === stepIndex
            ? {
                ...s,
                status: "failed",
                error: error instanceof Error ? error.message : "Retry failed",
                endTime: Date.now(),
              }
            : s,
        ),
      );
    }
  };

  const getStepIcon = (step: BatchGenerationStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "in-progress":
        return (
          <SparklesIcon className="h-6 w-6 text-brand-primary animate-pulse" />
        );
      case "failed":
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-brand-text-tertiary" />;
    }
  };

  const getStepTextColor = (step: BatchGenerationStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-brand-primary font-semibold";
      case "failed":
        return "text-red-600";
      default:
        return "text-brand-text-secondary";
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getTotalTime = () => {
    if (batchStartTime && batchEndTime) {
      return formatTime(batchEndTime - batchStartTime);
    }
    if (batchStartTime && isGenerating) {
      return formatTime(Date.now() - batchStartTime);
    }
    return "0s";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-brand-danger mb-4">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-brand-primary mr-3" />
            <h1 className="text-3xl font-bold text-brand-text-primary">
              Batch Content Generation
            </h1>
          </div>
          <p className="text-brand-text-secondary">
            Creating comprehensive marketing content for {listing.address}
          </p>
          <div className="mt-2 text-sm text-brand-text-tertiary">
            Total Time: {getTotalTime()}
          </div>
        </div>

        <div className="bg-brand-panel rounded-2xl shadow-2xl border border-brand-border p-8">
          {/* Progress Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-brand-text-secondary">
                Progress
              </span>
              <span className="text-sm text-brand-text-secondary">
                {steps.filter((s) => s.status === "completed").length} of{" "}
                {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-brand-border rounded-full h-3">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-secondary h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(steps.filter((s) => s.status === "completed").length / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  step.status === "in-progress"
                    ? "bg-brand-primary/5 border-brand-primary/20 transform scale-[1.02]"
                    : step.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : step.status === "failed"
                        ? "bg-red-50 border-red-200"
                        : "bg-brand-card border-brand-border/50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getStepIcon(step)}</div>
                  <div>
                    <h3 className={`font-semibold ${getStepTextColor(step)}`}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-brand-text-tertiary">
                      {step.description}
                    </p>
                    {step.status === "in-progress" && (
                      <div className="mt-1 flex items-center text-sm text-brand-primary">
                        <SparklesIcon className="h-4 w-4 mr-1 animate-pulse" />
                        Generating...
                      </div>
                    )}
                    {step.status === "failed" && step.error && (
                      <div className="mt-1 text-sm text-red-600">
                        Error: {step.error}
                      </div>
                    )}
                  </div>
                </div>

                {step.status === "failed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => retryStep(index)}
                    leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                  >
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {isComplete && (
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Content Generation Complete!
              </h2>
              <p className="text-brand-text-secondary mb-2">
                All marketing content has been generated successfully
              </p>
              <p className="text-lg font-semibold text-brand-primary mb-6">
                Total Generation Time: {getTotalTime()}
              </p>
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <p className="text-sm text-brand-text-tertiary mb-4">
                  Redirecting to your listing in {redirectCountdown}...
                </p>
              )}
              <Button
                onClick={() => navigate(`/listings/${listingId}`)}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg transition-all duration-300"
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                size="lg"
              >
                View Your Listing Now
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !isComplete && (
            <div className="mt-8 text-center">
              <div className="animate-pulse text-brand-text-secondary">
                <SparklesIcon className="h-8 w-8 mx-auto mb-2 animate-bounce text-brand-primary" />
                <p>Creating amazing content for your listing...</p>
                <p className="text-sm text-brand-text-tertiary mt-1">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerationProgressPage;
