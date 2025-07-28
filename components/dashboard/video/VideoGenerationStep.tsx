import React, { useEffect, useState } from 'react';
import { VideoScript, VideoGenerationResult, videoGenerationService } from '../../../services/videoGenerationService';
import { ProgressBar, PlatformProgress, VideoProcessingSteps } from '../../shared/VideoProgressIndicator';
import { VideoCameraIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../../shared/Button';

interface VideoGenerationStepProps {
  images: File[];
  script: VideoScript;
  platforms: {
    tiktok: boolean;
    instagram: boolean;
    youtube: boolean;
  };
  onComplete: (video: VideoGenerationResult) => void;
}

const VideoGenerationStep: React.FC<VideoGenerationStepProps> = ({ 
  images, 
  script, 
  platforms,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [masterProgress, setMasterProgress] = useState(0);
  const [masterMessage, setMasterMessage] = useState('Initializing video generation...');
  const [platformStatuses, setPlatformStatuses] = useState([
    { platform: 'tiktok' as const, status: 'waiting' as const },
    { platform: 'instagram' as const, status: 'waiting' as const },
    { platform: 'youtube' as const, status: 'waiting' as const }
  ]);
  const [generatedVideo, setGeneratedVideo] = useState<VideoGenerationResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const processingSteps = [
    'Preparing media assets',
    'Generating master video',
    'Optimizing for platforms',
    'Finalizing output',
    'Video ready!'
  ];

  useEffect(() => {
    const generateVideo = async () => {
      try {
        // Step 1: Prepare assets
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(1);

        // Step 2: Generate master video
        const video = await videoGenerationService.generateVideo(
          images,
          script,
          (progress, message) => {
            setMasterProgress(progress);
            setMasterMessage(message);
          }
        );
        setGeneratedVideo(video);
        setCurrentStep(2);

        // Step 3: Optimize for platforms
        const activePlatforms = Object.entries(platforms)
          .filter(([_, enabled]) => enabled)
          .map(([platform]) => platform as 'tiktok' | 'instagram' | 'youtube');

        setPlatformStatuses(prev => prev.map(status => ({
          ...status,
          status: activePlatforms.includes(status.platform) ? 'processing' : 'waiting'
        })));

        await videoGenerationService.optimizeForPlatforms(
          video.videoId,
          activePlatforms,
          (platform, message) => {
            setPlatformStatuses(prev => prev.map(status => 
              status.platform === platform
                ? { ...status, status: 'processing', message }
                : status
            ));
          }
        );

        // Mark platforms as complete
        setPlatformStatuses(prev => prev.map(status => ({
          ...status,
          status: activePlatforms.includes(status.platform) ? 'complete' : 'waiting'
        })));

        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentStep(4);
        setIsComplete(true);
        
      } catch (error) {
        console.error('Video generation failed:', error);
      }
    };

    generateVideo();
  }, [images, script, platforms]);

  if (isComplete && generatedVideo) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Video Generated Successfully!</h3>
          <p className="text-slate-400">Your property video is ready for publishing</p>
        </div>

        {/* Video Preview */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Video Preview</h4>
          {generatedVideo.masterVideoUrl ? (
            <div className="space-y-4">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                {generatedVideo.masterVideoUrl.startsWith('blob:') || generatedVideo.masterVideoUrl.startsWith('http') ? (
                  <video
                    controls
                    className="w-full h-full"
                    src={generatedVideo.masterVideoUrl}
                  >
                    <source src={generatedVideo.masterVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <VideoCameraIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">Video preview available after processing</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {generatedVideo.masterVideoUrl.startsWith('blob:') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = generatedVideo.masterVideoUrl;
                      a.download = `property-video-${generatedVideo.videoId}.mp4`;
                      a.click();
                    }}
                  >
                    Download Video (with Voiceover)
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
              <VideoCameraIcon className="h-16 w-16 text-slate-500" />
            </div>
          )}
        </div>

        {/* Platform Versions */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Platform Versions Ready</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(generatedVideo.platformVersions).map(([platform, version]) => (
              version && (
                <div key={platform} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white font-medium capitalize mb-2">{platform}</p>
                  <p className="text-slate-400 text-sm mb-3">Duration: {version.duration}s</p>
                  <CheckCircleIcon className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  {version.url.startsWith('blob:') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = version.url;
                        a.download = `${platform}-video-${generatedVideo.videoId}.mp4`;
                        a.click();
                      }}
                      className="w-full"
                    >
                      Download
                    </Button>
                  )}
                </div>
              )
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            variant="gradient"
            onClick={() => onComplete(generatedVideo)}
            leftIcon={<CheckCircleIcon className="h-5 w-5" />}
          >
            Continue to Publishing
          </Button>
        </div>
      </div>
    );
  }

  // Platform data with emojis and colors
  const platformData = {
    tiktok: { 
      name: 'TikTok', 
      icon: '📱', 
      color: 'from-pink-500 to-black',
      borderColor: 'border-pink-500/30',
      bgColor: 'bg-pink-500/10'
    },
    instagram: { 
      name: 'Instagram', 
      icon: '📷', 
      color: 'from-purple-500 via-pink-500 to-orange-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10'
    },
    youtube: { 
      name: 'YouTube', 
      icon: '🎥', 
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10'
    }
  };

  const activePlatforms = Object.entries(platforms)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform as keyof typeof platformData);

  return (
    <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
          <VideoCameraIcon className="relative h-20 w-20 text-purple-400 mx-auto animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-3">Creating Your AI Video</h3>
        <p className="text-slate-400 text-lg">
          {currentStep === 0 && "Preparing your property showcase..."}
          {currentStep === 1 && "Generating master video with voiceover..."}
          {currentStep === 2 && "Optimizing for social platforms..."}
          {currentStep === 3 && "Finalizing your videos..."}
          {currentStep === 4 && "All done! 🎉"}
        </p>
      </div>

      {/* Horizontal Platform Animation */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
        <div className="flex justify-center items-center space-x-16">
          {activePlatforms.map((platform, index) => {
            const data = platformData[platform];
            const platformStatus = platformStatuses.find(s => s.platform === platform);
            const isActive = currentStep >= 2 && platformStatus?.status === 'processing';
            const isComplete = platformStatus?.status === 'complete';
            const shouldShow = currentStep >= 1;
            
            return (
              <div 
                key={platform}
                className={`relative transition-all duration-1000 ${
                  shouldShow 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-75'
                }`}
                style={{ 
                  transitionDelay: `${index * 300}ms`
                }}
              >
                {/* Animated Background */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl opacity-30 animate-pulse">
                    <div className={`w-full h-full bg-gradient-to-r ${data.color} rounded-2xl blur-md`}></div>
                  </div>
                )}
                
                {/* Platform Card */}
                <div className={`relative w-32 h-32 rounded-2xl border-2 transition-all duration-500 ${
                  isComplete 
                    ? 'bg-emerald-500/20 border-emerald-400' 
                    : isActive 
                      ? `${data.bgColor} ${data.borderColor} scale-110` 
                      : 'bg-white/5 border-white/20'
                }`}>
                  
                  {/* Particle Effects for Active Platform */}
                  {isActive && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-70 animate-ping"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            animationDelay: `${i * 200}ms`
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Platform Icon */}
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className={`text-4xl mb-2 transition-all duration-300 ${
                      isActive ? 'animate-bounce' : isComplete ? 'scale-110' : ''
                    }`}>
                      {isComplete ? '✅' : data.icon}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      isComplete ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-400'
                    }`}>
                      {data.name}
                    </span>
                    
                    {/* Status Message */}
                    {isActive && platformStatus?.message && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <p className="text-xs text-purple-400 animate-pulse">
                          {platformStatus.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        {currentStep === 1 && (
          <div className="mt-12">
            <div className="flex items-center justify-center mb-4">
              <div className="text-white font-medium">{masterMessage}</div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${masterProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Fun Tip */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl px-8 py-4">
          <p className="text-blue-400">
            <span className="font-semibold">✨ AI Magic in Progress:</span> Creating platform-optimized videos for maximum engagement!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationStep;