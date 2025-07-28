import React, { useEffect, useState } from "react";
import {
  VideoGenerationResult,
  videoGenerationService,
  PublishResult,
} from "../../../services/videoGenerationService";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "../../shared/Button";

interface VideoPlatformPublisherProps {
  video: VideoGenerationResult;
  platforms: {
    tiktok: boolean;
    instagram: boolean;
    youtube: boolean;
  };
  onComplete: () => void;
}

interface PlatformPublishState {
  platform: "tiktok" | "instagram" | "youtube";
  status: "pending" | "publishing" | "success" | "error";
  result?: PublishResult;
}

const VideoPlatformPublisher: React.FC<VideoPlatformPublisherProps> = ({
  video,
  platforms,
  onComplete,
}) => {
  const [publishStates, setPublishStates] = useState<PlatformPublishState[]>(
    [],
  );
  const [isPublishing, setIsPublishing] = useState(true);
  const [currentPlatform, setCurrentPlatform] = useState(0);

  const activePlatforms = Object.entries(platforms)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform as "tiktok" | "instagram" | "youtube");

  useEffect(() => {
    // Initialize states
    const initialStates: PlatformPublishState[] = activePlatforms.map(
      (platform) => ({
        platform,
        status: "pending",
      }),
    );
    setPublishStates(initialStates);

    // Start publishing process
    publishToAllPlatforms();
  }, []);

  const publishToAllPlatforms = async () => {
    for (let i = 0; i < activePlatforms.length; i++) {
      const platform = activePlatforms[i];
      setCurrentPlatform(i);

      // Update status to publishing
      setPublishStates((prev) =>
        prev.map((state) =>
          state.platform === platform
            ? { ...state, status: "publishing" }
            : state,
        ),
      );

      try {
        const result = await videoGenerationService.publishToPlatform(
          video.videoId,
          platform,
        );

        setPublishStates((prev) =>
          prev.map((state) =>
            state.platform === platform
              ? {
                  ...state,
                  status: result.success ? "success" : "error",
                  result,
                }
              : state,
          ),
        );
      } catch (error) {
        setPublishStates((prev) =>
          prev.map((state) =>
            state.platform === platform
              ? {
                  ...state,
                  status: "error",
                  result: { platform, success: false, error: "Network error" },
                }
              : state,
          ),
        );
      }
    }

    setIsPublishing(false);
  };

  const retryPlatform = async (
    platform: "tiktok" | "instagram" | "youtube",
  ) => {
    setPublishStates((prev) =>
      prev.map((state) =>
        state.platform === platform
          ? { ...state, status: "publishing" }
          : state,
      ),
    );

    try {
      const result = await videoGenerationService.publishToPlatform(
        video.videoId,
        platform,
      );

      setPublishStates((prev) =>
        prev.map((state) =>
          state.platform === platform
            ? {
                ...state,
                status: result.success ? "success" : "error",
                result,
              }
            : state,
        ),
      );
    } catch (error) {
      setPublishStates((prev) =>
        prev.map((state) =>
          state.platform === platform
            ? {
                ...state,
                status: "error",
                result: { platform, success: false, error: "Network error" },
              }
            : state,
        ),
      );
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "tiktok":
        return <FaTiktok className="h-8 w-8" />;
      case "instagram":
        return <FaInstagram className="h-8 w-8" />;
      case "youtube":
        return <FaYoutube className="h-8 w-8" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "tiktok":
        return "TikTok";
      case "instagram":
        return "Instagram";
      case "youtube":
        return "YouTube";
      default:
        return platform;
    }
  };

  const allSuccessful = publishStates.every(
    (state) => state.status === "success",
  );
  const hasErrors = publishStates.some((state) => state.status === "error");

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Publishing Your Video
        </h3>
        <p className="text-slate-400">
          {isPublishing
            ? "Publishing to selected platforms..."
            : allSuccessful
              ? "All platforms published successfully!"
              : "Publishing complete with some issues"}
        </p>
      </div>

      {/* Platform Publishing Status */}
      <div className="space-y-4">
        {publishStates.map((state) => (
          <div
            key={state.platform}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`
                  ${
                    state.status === "publishing"
                      ? "text-blue-400"
                      : state.status === "success"
                        ? "text-emerald-400"
                        : state.status === "error"
                          ? "text-red-400"
                          : "text-slate-400"
                  }
                `}
                >
                  {getPlatformIcon(state.platform)}
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">
                    {getPlatformName(state.platform)}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {state.status === "pending" && "Waiting to publish..."}
                    {state.status === "publishing" && "Publishing video..."}
                    {state.status === "success" && "Published successfully!"}
                    {state.status === "error" &&
                      (state.result?.error || "Publishing failed")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {state.status === "publishing" && (
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state.status === "success" && (
                  <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                )}
                {state.status === "error" && (
                  <>
                    <XCircleIcon className="h-6 w-6 text-red-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                      onClick={() => retryPlatform(state.platform)}
                    >
                      Retry
                    </Button>
                  </>
                )}
              </div>
            </div>

            {state.status === "success" && state.result?.url && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-400 text-sm">
                  View your video:{" "}
                  <a
                    href={state.result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-emerald-300"
                  >
                    {state.result.url}
                  </a>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {!isPublishing && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Publishing Summary</h4>
          <div className="space-y-2">
            <p className="text-slate-300">
              <span className="text-emerald-400 font-medium">
                {publishStates.filter((s) => s.status === "success").length}
              </span>{" "}
              of {publishStates.length} platforms published successfully
            </p>
            {hasErrors && (
              <p className="text-amber-400 text-sm">
                Some platforms failed to publish. You can retry or continue.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {!isPublishing && (
        <div className="flex justify-center pt-4">
          <Button
            variant="gradient"
            onClick={onComplete}
            leftIcon={<CheckCircleIcon className="h-5 w-5" />}
          >
            {allSuccessful ? "Complete" : "Continue Anyway"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlatformPublisher;
