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

  const waitUntilImageIsAccessible = async (
    url: string,
    timeout = 15000,
    retries = 4,
  ): Promise<void> => {
    let attempts = 0;

    const tryCheck = async (): Promise<void> => {
      try {
        // Try HEAD request (no-cors removed for better control)
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok)
          throw new Error(`HEAD request failed with status ${res.status}`);
      } catch (err) {
        console.warn(
          `⚠️ HEAD request failed, falling back to image load check:`,
          err,
        );
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        const timer = setTimeout(() => {
          img.src = ""; // cancel load
          reject(new Error("⏳ Timeout loading image"));
        }, timeout);

        img.onload = () => {
          clearTimeout(timer);
          console.log("✅ Image verified via <img>.onload:", url);
          resolve();
        };

        img.onerror = (e) => {
          clearTimeout(timer);
          reject(new Error("❌ Image load failed via <img>.onerror"));
        };

        img.src = `${url}?cacheBust=${Date.now()}`;
      });
    };

    while (attempts < retries) {
      try {
        await tryCheck();
        return; // success!
      } catch (e) {
        attempts++;
        console.warn(`Retry ${attempts}/${retries}:`, e);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    throw new Error("Image not accessible after multiple retries");
  };

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
    console.log("🔄 Checking redirect conditions:", {
      isComplete,
      redirectCountdown,
      listingId,
    });
    if (isComplete && !redirectCountdown && listingId) {
      console.log("✅ Batch generation complete, starting redirect countdown");
      console.log("🎯 Target URL will be:", `/listings/${listingId}`);
      setRedirectCountdown(3);
    }
  }, [isComplete, listingId]);

  useEffect(() => {
    console.log("⏱️ Redirect countdown effect triggered:", {
      redirectCountdown,
      listingId,
    });
    if (redirectCountdown !== null && redirectCountdown > 0) {
      console.log(
        `Redirecting in ${redirectCountdown} seconds to /listings/${listingId}...`,
      );
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && listingId) {
      console.log(`🚀 EXECUTING REDIRECT NOW to /listings/${listingId}`);
      // Use window.location.href to force a full page reload, ensuring fresh data.
      window.location.href = `/#/listings/${listingId}?refresh=${Date.now()}`;
    }
  }, [redirectCountdown, listingId]);

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
                  console.log(
                    "🖼️ Using uploaded image for room redesign:",
                    selections.roomRedesign.uploadedImage.substring(0, 50) +
                      "...",
                  );
                } else if (
                  selections.roomRedesign.selectedImageIndex !== null &&
                  listingData.images
                ) {
                  options.selectedImage =
                    listingData.images[
                      selections.roomRedesign.selectedImageIndex
                    ]?.url;
                  console.log(
                    "🖼️ Using listing image for room redesign:",
                    options.selectedImage,
                  );
                }
                options.roomType = selections.roomRedesign.roomType;
                options.designStyle = selections.roomRedesign.designStyle;
                console.log("🎨 Room redesign options:", {
                  roomType: options.roomType,
                  designStyle: options.designStyle,
                  hasImage: !!options.selectedImage,
                });
              } else {
                console.warn("⚠️ No room redesign selections found");
              }

              // Update step description to show Decor8AI processing
              setSteps((prev) =>
                prev.map((s, idx) =>
                  idx === i
                    ? {
                        ...s,
                        description: "Processing with Decor8AI...",
                        status: "in-progress",
                      }
                    : s,
                ),
              );

              // Generate the room redesign - this will handle both immediate and async results
              console.log("🚀 Starting interior-reimagined generation...");
              content = await contentGenerationService.generateContentStep(
                listingData,
                "interior-reimagined",
                options,
              );
              console.log(
                "✅ Interior-reimagined generation completed. Content:",
                content ? content.substring(0, 100) + "..." : "null",
              );

              // Validate the response - should be an image URL
              if (!content || typeof content !== "string") {
                console.error("❌ Invalid content received:", content);
                throw new Error(
                  "Interior redesign API returned invalid response",
                );
              }

              // Check if it's a valid URL (more flexible than just checking for 'http')
              try {
                new URL(content);
                console.log(
                  "✅ Valid image URL received from Decor8AI:",
                  content,
                );
              } catch (urlError) {
                // If it's not a URL, treat it as an error but allow retry
                console.warn(
                  "⚠️ Interior redesign returned non-URL content:",
                  content.substring(0, 100),
                );
                throw new Error(
                  "Interior redesign API did not return a valid image URL. Please retry.",
                );
              }

              if (content.startsWith("http")) {
                // Show interim status while image loads
                setSteps((prev) =>
                  prev.map((s, idx) =>
                    idx === i
                      ? {
                          ...s,
                          description: "Finalizing image processing...",
                          status: "in-progress",
                        }
                      : s,
                  ),
                );

                try {
                  console.log("🔍 Starting image accessibility check...");
                  await waitUntilImageIsAccessible(content, 15000, 4);
                  console.log(
                    "🖼️ Image confirmed loaded and accessible:",
                    content,
                  );
                } catch (imgErr) {
                  console.warn(
                    "⚠️ Image not fully loaded before timeout or error:",
                    imgErr,
                  );
                  throw new Error(
                    "Interior redesign image is not ready yet. Please retry.",
                  );
                }
              }
              console.log(
                "🎉 Interior-reimagined step processing completed successfully",
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
          console.log(
            `🎯 Updating step ${step.id} (${step.name}) to completed status`,
          );
          console.log(
            `📊 Step content length: ${content ? content.length : 0}`,
          );
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
          console.log(`✅ Step ${step.id} marked as completed`);

          // Save content to listing
          const updateData: any = {};
          switch (step.id) {
            case "description":
              updateData.generatedDescription = content;
              console.log(
                "💾 Saving description content:",
                content.substring(0, 100) + "...",
              );
              break;
            case "email":
              updateData.generatedEmail = content;
              console.log(
                "💾 Saving email content:",
                content.substring(0, 100) + "...",
              );
              break;
            case "facebook-post":
              updateData.generatedFacebookPost = content;
              console.log(
                "💾 Saving Facebook post content:",
                content.substring(0, 100) + "...",
              );
              break;
            case "instagram-post":
              updateData.generatedInstagramCaption = content;
              console.log(
                "💾 Saving Instagram post content:",
                content.substring(0, 100) + "...",
              );
              break;
            case "x-post":
              updateData.generatedXPost = content;
              console.log(
                "💾 Saving X post content:",
                content.substring(0, 100) + "...",
              );
              break;
            case "interior-reimagined":
              console.log(
                "🔍 Processing interior-reimagined content:",
                content,
              );
              console.log(
                "🎯 Content type check - starts with http?",
                content.startsWith("http"),
              );
              console.log("🎯 Content preview:", content.substring(0, 100));

              // Check if content is an image URL (actual redesign) or text (concepts)
              if (content.startsWith("http")) {
                // It's an actual redesigned image URL - save it regardless of domain
                const newRoomDesign = {
                  originalImageUrl: options.selectedImage,
                  styleId: options.designStyle,
                  redesignedImageUrl: content,
                  prompt: `${options.roomType} in ${options.designStyle} style`,
                  createdAt: new Date().toISOString(),
                };

                // IMPORTANT: Append to existing room designs, don't overwrite (matching individual workflow)
                let existingRoomDesigns = [];
                if (listingData.generatedRoomDesigns) {
                  if (Array.isArray(listingData.generatedRoomDesigns)) {
                    existingRoomDesigns = listingData.generatedRoomDesigns;
                  } else if (
                    typeof listingData.generatedRoomDesigns === "string"
                  ) {
                    try {
                      const parsed = JSON.parse(
                        listingData.generatedRoomDesigns,
                      );
                      if (Array.isArray(parsed)) {
                        existingRoomDesigns = parsed;
                      } else {
                        console.warn(
                          "Parsed generatedRoomDesigns is not an array, starting fresh.",
                          parsed,
                        );
                        existingRoomDesigns = [];
                      }
                    } catch (e) {
                      console.error(
                        "Failed to parse generatedRoomDesigns string, starting fresh.",
                        e,
                      );
                      existingRoomDesigns = [];
                    }
                  }
                }
                updateData.generatedRoomDesigns = [
                  ...existingRoomDesigns,
                  newRoomDesign,
                ];

                console.log("💾 Saving room design URL:", content);
                console.log("💾 Room design details:", newRoomDesign);
                console.log(
                  "💾 Existing room designs count:",
                  existingRoomDesigns.length,
                );
                console.log(
                  "💾 New total room designs count:",
                  updateData.generatedRoomDesigns.length,
                );
                console.log("✅ Interior redesign will be saved to listing");
              } else {
                // It's text concepts - still save them for debugging but also flag the issue
                console.log("🔍 Generated interior concepts (text):", content);
                console.log(
                  "⚠️ Got text instead of image URL - this might indicate an API issue",
                );
                // For now, let's save it as a note so we can debug
                updateData.generatedInteriorConcepts = content;
              }
              break;
            case "paid-ads":
              updateData.generatedAdCopy = content;
              console.log(
                "💾 Saving paid ads content:",
                content.substring(0, 100) + "...",
              );
              break;
          }

          console.log("📊 Update data for", step.id, ":", updateData);
          const saveResult = await listingService.updateListing(
            listingId!,
            updateData,
          );
          console.log("✅ Save result for", step.id, ":", saveResult);

          // For interior redesign, let's log more details about what was actually saved
          if (step.id === "interior-reimagined" && saveResult) {
            console.log(
              "🔍 Saved listing room designs:",
              saveResult.generatedRoomDesigns,
            );
            console.log(
              "🔍 Room designs count:",
              saveResult.generatedRoomDesigns?.length || 0,
            );
          }

          // Small delay for UX
          console.log(
            `⏳ Waiting 800ms before moving to next step (current step: ${step.id})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 800));
          console.log(`🚀 Moving to next step after ${step.id} completion`);
        } catch (stepError) {
          console.error(`Error generating ${step.name}:`, stepError);

          // For interior-reimagined, we MUST wait for it to complete successfully
          // Don't continue to next step if this critical step fails
          if (step.id === "interior-reimagined") {
            console.error(
              "❌ Interior-reimagined step failed - this is a critical step that must complete",
            );
            console.error(
              "🛑 Stopping batch generation - interior-reimagined must succeed before proceeding",
            );

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

            // Set batch as complete but with errors so user can retry
            setBatchEndTime(Date.now());
            setIsComplete(true);
            setIsGenerating(false);
            return; // STOP HERE - don't continue to paid-ads
          }

          // For other steps, continue with next step even if this one failed
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
      console.log(
        "🏁 Batch generation loop completed, setting isComplete to true",
      );
      console.log(
        "📊 Final step statuses:",
        steps.map((s) => ({ name: s.name, status: s.status })),
      );
      console.log("🎯 About to set isComplete to true - current state:", {
        isComplete,
        isGenerating,
      });
      setIsComplete(true);
      console.log("✅ isComplete has been set to true");

      // Force refresh the listing data to ensure fresh data is available
      console.log("🔄 Refreshing listing data before redirect...");
      try {
        const refreshedListing = await listingService.getListingById(
          listingId!,
        );
        if (refreshedListing) {
          console.log("📊 Refreshed listing data:", {
            id: refreshedListing.id,
            hasDescription: !!refreshedListing.generatedDescription,
            hasEmail: !!refreshedListing.generatedEmail,
            hasFacebookPost: !!refreshedListing.generatedFacebookPost,
            hasInstagramCaption: !!refreshedListing.generatedInstagramCaption,
            hasXPost: !!refreshedListing.generatedXPost,
            hasRoomDesigns: !!(
              refreshedListing.generatedRoomDesigns &&
              refreshedListing.generatedRoomDesigns.length > 0
            ),
            hasAdCopy: !!refreshedListing.generatedAdCopy,
          });
        } else {
          console.warn("⚠️ Refreshed listing data is null");
        }
      } catch (refreshError) {
        console.error("⚠️ Error refreshing listing data:", refreshError);
      }

      // IMMEDIATE REDIRECT - Don't wait for state updates
      console.log("🚀 IMMEDIATE REDIRECT - Bypassing state-based countdown");
      setTimeout(() => {
        console.log(
          "⚡ Executing immediate redirect to:",
          `/listings/${listingId}`,
        );
        // Force a hard refresh to ensure the listing page loads fresh data
        window.location.href = `/#/listings/${listingId}?refresh=${Date.now()}`;
      }, 1000);

      // Backup redirect mechanism - force redirect after 3 seconds if state-based redirect doesn't work
      setTimeout(() => {
        console.log("🔄 Backup redirect check - isComplete:", isComplete);
        console.log("🚀 Executing backup redirect to listing page");
        window.location.href = `/#/listings/${listingId}`;
      }, 3000);
    } catch (error) {
      console.error("Batch generation error:", error);
      setError("Failed to complete batch generation. Please try again.");
      // Still set completion to true even if some steps failed, so user can see results and navigate
      setBatchEndTime(Date.now());
      console.log(
        "❌ Batch generation failed, but setting isComplete to true for navigation",
      );
      console.log(
        "🎯 About to set isComplete to true (error case) - current state:",
        { isComplete, isGenerating },
      );
      setIsComplete(true);
      console.log("✅ isComplete has been set to true (error case)");

      // IMMEDIATE REDIRECT - Don't wait for state updates (error case)
      console.log(
        "🚀 IMMEDIATE REDIRECT (error case) - Bypassing state-based countdown",
      );
      setTimeout(() => {
        console.log(
          "⚡ Executing immediate redirect to:",
          `/listings/${listingId}`,
        );
        navigate(`/listings/${listingId}`);
      }, 1000);

      // Backup redirect mechanism - force redirect after 3 seconds if state-based redirect doesn't work
      setTimeout(() => {
        console.log(
          "🔄 Backup redirect check (error case) - isComplete:",
          isComplete,
        );
        console.log("🚀 Executing backup redirect to listing page");
        window.location.href = `/#/listings/${listingId}`;
      }, 3000);
    } finally {
      setIsGenerating(false);
      console.log("✅ setIsGenerating(false) called");
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

          // Update step description to show Decor8AI processing
          setSteps((prev) =>
            prev.map((s, idx) =>
              idx === stepIndex
                ? {
                    ...s,
                    description: "Processing with Decor8AI...",
                    status: "in-progress",
                  }
                : s,
            ),
          );

          content = await contentGenerationService.generateContentStep(
            listing,
            "interior-reimagined",
            options,
          );

          // Validate the response - should be an image URL (matching main generation logic)
          if (!content || typeof content !== "string") {
            throw new Error("Interior redesign API returned invalid response");
          }

          // Check if it's a valid URL (more flexible than just checking for 'http')
          try {
            new URL(content);
            console.log(
              "✅ Retry - Valid image URL received from Decor8AI:",
              content,
            );
          } catch (urlError) {
            // If it's not a URL, treat it as an error but allow retry
            console.warn(
              "⚠️ Retry - Interior redesign returned non-URL content:",
              content.substring(0, 100),
            );
            throw new Error(
              "Interior redesign API did not return a valid image URL. Please retry.",
            );
          }

          if (content.startsWith("http")) {
            // Show interim status while image loads
            setSteps((prev) =>
              prev.map((s, idx) =>
                idx === stepIndex
                  ? {
                      ...s,
                      description: "Finalizing image processing...",
                      status: "in-progress",
                    }
                  : s,
              ),
            );

            try {
              await waitUntilImageIsAccessible(content, 15000, 4);
              console.log(
                "🖼️ Retry - Image confirmed loaded and accessible:",
                content,
              );
            } catch (imgErr) {
              console.warn(
                "⚠️ Retry - Image not fully loaded before timeout or error:",
                imgErr,
              );
              throw new Error(
                "Interior redesign image is not ready yet. Please retry.",
              );
            }
          }
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
          console.log(
            "💾 Saving description content:",
            content.substring(0, 100) + "...",
          );
          break;
        case "email":
          updateData.generatedEmail = content;
          console.log(
            "💾 Saving email content:",
            content.substring(0, 100) + "...",
          );
          break;
        case "facebook-post":
          updateData.generatedFacebookPost = content;
          console.log(
            "💾 Saving Facebook post content:",
            content.substring(0, 100) + "...",
          );
          break;
        case "instagram-post":
          updateData.generatedInstagramCaption = content;
          console.log(
            "💾 Saving Instagram post content:",
            content.substring(0, 100) + "...",
          );
          break;
        case "x-post":
          updateData.generatedXPost = content;
          console.log(
            "💾 Saving X post content:",
            content.substring(0, 100) + "...",
          );
          break;
        case "interior-reimagined":
          console.log(
            "🔍 Retry - Processing interior-reimagined content:",
            content,
          );
          console.log(
            "🎯 Retry - Content type check - starts with http?",
            content.startsWith("http"),
          );

          // Check if content is an image URL (actual redesign) or text (concepts)
          if (content.startsWith("http")) {
            // It's an actual redesigned image URL - save it regardless of domain
            const newRoomDesign = {
              originalImageUrl: options.selectedImage,
              styleId: options.designStyle,
              redesignedImageUrl: content,
              prompt: `${options.roomType} in ${options.designStyle} style`,
              createdAt: new Date().toISOString(),
            };

            // IMPORTANT: Append to existing room designs, don't overwrite (matching individual workflow)
            let existingRoomDesigns = [];
            if (listing.generatedRoomDesigns) {
              if (Array.isArray(listing.generatedRoomDesigns)) {
                existingRoomDesigns = listing.generatedRoomDesigns;
              } else if (typeof listing.generatedRoomDesigns === "string") {
                try {
                  const parsed = JSON.parse(listing.generatedRoomDesigns);
                  if (Array.isArray(parsed)) {
                    existingRoomDesigns = parsed;
                  } else {
                    console.warn(
                      "Parsed generatedRoomDesigns is not an array on retry, starting fresh.",
                      parsed,
                    );
                    existingRoomDesigns = [];
                  }
                } catch (e) {
                  console.error(
                    "Failed to parse generatedRoomDesigns string on retry, starting fresh.",
                    e,
                  );
                  existingRoomDesigns = [];
                }
              }
            }
            updateData.generatedRoomDesigns = [
              ...existingRoomDesigns,
              newRoomDesign,
            ];

            console.log("💾 Retry - Saving room design URL:", content);
            console.log("💾 Retry - Room design details:", newRoomDesign);
            console.log(
              "💾 Retry - Existing room designs count:",
              existingRoomDesigns.length,
            );
            console.log(
              "💾 Retry - New total room designs count:",
              updateData.generatedRoomDesigns.length,
            );
            console.log(
              "✅ Retry - Interior redesign will be saved to listing",
            );
          } else {
            // It's text concepts - still save them for debugging
            console.log(
              "🔍 Retry - Generated interior concepts (text):",
              content,
            );
            console.log(
              "⚠️ Retry - Got text instead of image URL - this might indicate an API issue",
            );
            updateData.generatedInteriorConcepts = content;
          }
          break;
        case "paid-ads":
          updateData.generatedAdCopy = content;
          console.log(
            "💾 Saving paid ads content:",
            content.substring(0, 100) + "...",
          );
          break;
      }

      console.log("📊 Update data for", step.id, ":", updateData);
      const saveResult = await listingService.updateListing(
        listingId!,
        updateData,
      );
      console.log("✅ Save result for", step.id, ":", saveResult);
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
            <div className="text-center py-8">
              <div className="mb-6">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-brand-text-primary mb-2">
                  Batch Generation Complete!
                </h2>
                <p className="text-brand-text-secondary mb-2">
                  Generated{" "}
                  {steps.filter((s) => s.status === "completed").length} out of{" "}
                  {steps.length} content pieces
                </p>
                {batchStartTime && batchEndTime && (
                  <p className="text-sm text-brand-text-tertiary">
                    Total time: {formatTime(batchEndTime - batchStartTime)}
                  </p>
                )}
              </div>

              {redirectCountdown !== null && redirectCountdown > 0 ? (
                <div className="space-y-4">
                  <p className="text-brand-text-secondary">
                    Redirecting to your listing in {redirectCountdown}{" "}
                    seconds...
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        console.log("🔄 Manual redirect button clicked");
                        window.location.href = `/#/listings/${listingId}?refresh=${Date.now()}`;
                      }}
                      className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90"
                    >
                      Go to Listing Now
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        console.log("❌ Auto-redirect cancelled by user");
                        setRedirectCountdown(null);
                      }}
                      className="text-brand-text-secondary"
                    >
                      Cancel Auto-Redirect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      console.log("🔄 View listing button clicked");
                      window.location.href = `/#/listings/${listingId}?refresh=${Date.now()}`;
                    }}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90"
                  >
                    View Your Listing
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="ml-3"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
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
