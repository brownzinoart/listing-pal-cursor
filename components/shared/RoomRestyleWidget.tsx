import React, { useState, useRef, useCallback } from "react";
import {
  PhotoIcon,
  CameraIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { restyleRoom, generatePrompt } from "../../services/roomRestyleService";
import Button from "./Button";
import ReactCompareImage from "react-compare-image";

interface RoomRestyleWidgetProps {
  onSave?: (originalImage: string, styledImage: string, metadata: any) => void;
  className?: string;
}

const ROOM_TYPES = [
  { id: "bedroom", label: "Bedroom", icon: "🛏️" },
  { id: "livingroom", label: "Living Room", icon: "🛋️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "diningroom", label: "Dining Room", icon: "🍽️" },
  { id: "homeoffice", label: "Office", icon: "💼" },
  { id: "bathroom", label: "Bathroom", icon: "🚿" },
  { id: "entryway", label: "Entryway", icon: "🚪" },
];

const DESIGN_STYLES = [
  {
    id: "scandinavian",
    label: "Scandinavian",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "industrial",
    label: "Industrial",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    id: "farmhouse",
    label: "Farmhouse",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "modern",
    label: "Modern",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    color: "bg-slate-100 text-slate-800 border-slate-200",
  },
  {
    id: "midcenturymodern",
    label: "Mid-century",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "bohemian",
    label: "Bohemian",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    id: "contemporary",
    label: "Contemporary",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "rustic",
    label: "Rustic",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "japandi",
    label: "Japandi",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

const RoomRestyleWidget: React.FC<RoomRestyleWidgetProps> = ({
  onSave,
  className = "",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [styledImageUrl, setStyledImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"upload" | "select" | "generate" | "result">(
    "upload",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setSelectedFile(file);
        setOriginalImageUrl(URL.createObjectURL(file));
        setStep("select");
        setError("");
      } else {
        setError("Please select a valid image file (JPEG, PNG, WebP)");
      }
    },
    [],
  );

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setIsUsingCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setError("Camera access denied or not available");
      console.error("Camera error:", error);
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", {
            type: "image/jpeg",
          });
          setSelectedFile(file);
          setOriginalImageUrl(URL.createObjectURL(file));
          setStep("select");
          stopCamera();
        }
      },
      "image/jpeg",
      0.8,
    );
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsUsingCamera(false);
  }, [cameraStream]);

  // Generate styled room
  const handleGenerate = useCallback(async () => {
    if (!selectedFile || !selectedRoom || !selectedStyle) return;

    setIsGenerating(true);
    setError("");

    try {
      // Generate descriptive prompt using the service function
      const prompt = generatePrompt(selectedRoom, selectedStyle);

      console.log("Generating with prompt:", prompt);
      console.log("Room type:", selectedRoom, "Style:", selectedStyle);

      const result = await restyleRoom(selectedFile, prompt);

      if (result.success && result.imageUrl) {
        setStyledImageUrl(result.imageUrl);
        setStep("result");

        // Call onSave callback if provided
        if (onSave) {
          onSave(originalImageUrl, result.imageUrl, {
            roomType: selectedRoom,
            style: selectedStyle,
            prompt,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setError(result.error || "Failed to generate styled room");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [selectedFile, selectedRoom, selectedStyle, originalImageUrl, onSave]);

  // Reset to start over
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setSelectedRoom("");
    setSelectedStyle("");
    setOriginalImageUrl("");
    setStyledImageUrl("");
    setError("");
    setStep("upload");
    stopCamera();

    // Clear file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (mobileCameraInputRef.current) {
      mobileCameraInputRef.current.value = "";
    }
  }, [stopCamera]);

  // Fallback before/after component
  const BeforeAfterFallback: React.FC<{ before: string; after: string }> = ({
    before,
    after,
  }) => {
    const [showAfter, setShowAfter] = useState(false);

    return (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={showAfter ? after : before}
          alt={showAfter ? "Styled room" : "Original room"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <button
              onClick={() => setShowAfter(false)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                !showAfter
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setShowAfter(true)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showAfter
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/20"
              }`}
            >
              After
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Upload or Camera */}
      {step === "upload" && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-text-primary mb-2">
              Upload Your Room Photo
            </h3>
            <p className="text-brand-text-secondary">
              Choose a clear photo of your room to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* File Upload */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-brand-border rounded-lg hover:border-brand-primary transition-colors flex flex-col items-center justify-center space-y-2 text-brand-text-secondary hover:text-brand-primary"
              >
                <PhotoIcon className="h-8 w-8" />
                <span className="font-medium">Upload Photo</span>
                <span className="text-xs">JPEG, PNG, WebP</span>
              </button>
            </div>

            {/* Mobile Camera Capture */}
            <div className="relative">
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => mobileCameraInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-brand-border rounded-lg hover:border-brand-primary transition-colors flex flex-col items-center justify-center space-y-2 text-brand-text-secondary hover:text-brand-primary"
              >
                <CameraIcon className="h-8 w-8" />
                <span className="font-medium">Take Photo</span>
                <span className="text-xs">Mobile camera</span>
              </button>
            </div>

            {/* Full Camera Interface */}
            <button
              onClick={startCamera}
              className="w-full h-32 border-2 border-dashed border-brand-border rounded-lg hover:border-brand-primary transition-colors flex flex-col items-center justify-center space-y-2 text-brand-text-secondary hover:text-brand-primary"
            >
              <CameraIcon className="h-8 w-8" />
              <span className="font-medium">Camera View</span>
              <span className="text-xs">Preview & capture</span>
            </button>
          </div>

          {/* Camera View */}
          {isUsingCamera && (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <Button
                  onClick={capturePhoto}
                  variant="primary"
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="secondary"
                  className="bg-black/50 text-white border-white/20"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Step 2: Select Room Type and Style */}
      {step === "select" && (
        <div className="space-y-6">
          {/* Preview Image */}
          <div className="relative w-full max-w-md mx-auto">
            <img
              src={originalImageUrl}
              alt="Selected room"
              className="w-full aspect-video object-cover rounded-lg shadow-md"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Room Type Selection */}
          <div>
            <h4 className="text-lg font-medium text-brand-text-primary mb-3">
              Select Room Type
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ROOM_TYPES.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedRoom === room.id
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-brand-border text-brand-text-secondary hover:border-brand-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{room.icon}</div>
                  <div className="text-sm font-medium">{room.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div>
            <h4 className="text-lg font-medium text-brand-text-primary mb-3">
              Select Design Style
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-medium ${
                    selectedStyle === style.id
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : `border-gray-200 ${style.color} hover:border-brand-primary/50`
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {selectedRoom && selectedStyle && (
            <div className="text-center pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                isLoading={isGenerating}
                variant="primary"
                size="lg"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
                className="px-8"
              >
                {isGenerating
                  ? "Generating Styled Room..."
                  : "Generate Styled Room"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {step === "result" && styledImageUrl && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-text-primary mb-2">
              Your Styled Room
            </h3>
            <p className="text-brand-text-secondary">
              {DESIGN_STYLES.find((s) => s.id === selectedStyle)?.label} style •{" "}
              {ROOM_TYPES.find((r) => r.id === selectedRoom)?.label}
            </p>
          </div>

          {/* Before/After Comparison */}
          <div className="w-full">
            {originalImageUrl && styledImageUrl ? (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <ReactCompareImage
                  leftImage={originalImageUrl}
                  rightImage={styledImageUrl}
                />
              </div>
            ) : (
              <BeforeAfterFallback
                before={originalImageUrl}
                after={styledImageUrl}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleReset}
              variant="secondary"
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Create Another
            </Button>
            <Button
              onClick={() => {
                // Download styled image
                const link = document.createElement("a");
                link.href = styledImageUrl;
                link.download = `styled-room-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="primary"
              leftIcon={<CheckIcon className="h-4 w-4" />}
            >
              Download Result
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomRestyleWidget;
