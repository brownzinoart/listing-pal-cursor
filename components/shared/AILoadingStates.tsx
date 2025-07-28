import React, { useEffect, useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface LoadingStep {
  text: string;
  duration: number;
}

interface AILoadingStateProps {
  steps: LoadingStep[];
  onComplete?: () => void;
  title?: string;
}

export const AILoadingState: React.FC<AILoadingStateProps> = ({
  steps,
  onComplete,
  title = "AI is processing...",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete?.();
      return;
    }

    const step = steps[currentStep];
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentStep(currentStep + 1);
          return 0;
        }
        return prev + 100 / (step.duration / 50);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStep, steps, onComplete]);

  const totalProgress =
    (currentStep / steps.length + progress / 100 / steps.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <SparklesIcon className="h-12 w-12 text-purple-400 animate-pulse" />
          <div className="absolute inset-0 bg-purple-400 blur-xl opacity-30 animate-pulse"></div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white text-center mb-6">
        {title}
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              index < currentStep
                ? "opacity-100"
                : index === currentStep
                  ? "opacity-100"
                  : "opacity-30"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  index < currentStep
                    ? "bg-emerald-400 border-emerald-400"
                    : index === currentStep
                      ? "bg-transparent border-purple-400 animate-pulse"
                      : "bg-transparent border-slate-600"
                }`}
              >
                {index < currentStep && (
                  <svg
                    className="w-3 h-3 m-0.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p
                className={`text-sm ${
                  index <= currentStep ? "text-white" : "text-slate-500"
                }`}
              >
                {step.text}
                {index === currentStep && <AnimatedDots />}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-center text-slate-400 text-sm mt-2">
          {Math.round(totalProgress)}% Complete
        </p>
      </div>
    </div>
  );
};

export const AnimatedDots: React.FC = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-4">{dots}</span>;
};

interface StreamingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 30,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= text.length) {
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className="font-mono text-white">
      {displayText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1" />
      )}
    </div>
  );
};

interface AIThinkingAnimationProps {
  message?: string;
}

export const AIThinkingAnimation: React.FC<AIThinkingAnimationProps> = ({
  message = "AI is thinking",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full animate-ping absolute"></div>
        <div className="w-16 h-16 bg-purple-500/30 rounded-full animate-ping absolute animation-delay-200"></div>
        <div className="w-16 h-16 bg-purple-500/40 rounded-full animate-ping absolute animation-delay-400"></div>
        <SparklesIcon className="w-16 h-16 text-purple-400 relative z-10" />
      </div>
      <p className="text-white font-medium">
        {message}
        <AnimatedDots />
      </p>
    </div>
  );
};

export default AILoadingState;
