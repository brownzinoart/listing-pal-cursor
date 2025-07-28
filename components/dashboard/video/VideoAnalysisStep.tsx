import React, { useEffect, useState } from 'react';
import { AILoadingState } from '../../shared/AILoadingStates';
import { videoGenerationService, VideoAnalysis } from '../../../services/videoGenerationService';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../shared/Button';

interface VideoAnalysisStepProps {
  images: File[];
  onComplete: (analysis: VideoAnalysis) => void;
}

const VideoAnalysisStep: React.FC<VideoAnalysisStepProps> = ({ images, onComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

  useEffect(() => {
    const analyzeImages = async () => {
      try {
        const result = await videoGenerationService.analyzeImages(images);
        setAnalysis(result);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Analysis failed:', error);
        setIsAnalyzing(false);
      }
    };

    analyzeImages();
  }, [images]);

  const analysisSteps = [
    { text: "Detecting rooms", duration: 800 },
    { text: "Identifying key features", duration: 700 },
    { text: "Evaluating image quality", duration: 600 },
    { text: "Optimizing composition", duration: 900 },
    { text: "Analysis complete", duration: 500 }
  ];

  if (isAnalyzing) {
    return (
      <div className="py-8">
        <AILoadingState
          steps={analysisSteps}
          title="AI is analyzing your property images"
          onComplete={() => {}}
        />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Analysis failed. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete!</h3>
        <p className="text-slate-400">AI has analyzed your property images</p>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detected Rooms */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-400" />
            Detected Rooms
          </h4>
          <div className="space-y-2">
            {analysis.detectedRooms.map((room, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">{room}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-400" />
            Key Features
          </h4>
          <div className="space-y-2">
            {analysis.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Quality Scores */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-400" />
          Image Quality Assessment
        </h4>
        <div className="space-y-4">
          {Object.entries(analysis.imageQuality).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300 capitalize">{key}</span>
                <span className="text-white font-medium">{value}%</span>
              </div>
              <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Image Order */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-400" />
          Optimized Image Sequence
        </h4>
        <div className="grid grid-cols-6 gap-3">
          {analysis.suggestedOrder.map((imageIndex, orderIndex) => (
            <div key={orderIndex} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
                <img
                  src={URL.createObjectURL(images[imageIndex])}
                  alt={`Image ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {orderIndex + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="gradient"
          onClick={() => onComplete(analysis)}
          leftIcon={<SparklesIcon className="h-5 w-5" />}
        >
          Continue to Script Generation
        </Button>
      </div>
    </div>
  );
};

export default VideoAnalysisStep;