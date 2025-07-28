import React, { useEffect, useState } from 'react';
import { Listing } from '../../../types';
import { VideoAnalysis, VideoScript, videoGenerationService } from '../../../services/videoGenerationService';
import { StreamingText, AIThinkingAnimation } from '../../shared/AILoadingStates';
import Button from '../../shared/Button';
import { SparklesIcon, PencilSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface VideoScriptEditorProps {
  listing: Listing;
  analysis: VideoAnalysis;
  onComplete: (script: VideoScript) => void;
}

const VideoScriptEditor: React.FC<VideoScriptEditorProps> = ({ 
  listing, 
  analysis, 
  onComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'modern' | 'luxury' | 'family'>('modern');
  const [editableScript, setEditableScript] = useState<VideoScript | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const generateScript = async () => {
      try {
        const result = await videoGenerationService.generateScript(listing, analysis, selectedStyle);
        setScript(result);
        setEditableScript(result);
        setIsGenerating(false);
      } catch (error) {
        console.error('Script generation failed:', error);
        setIsGenerating(false);
      }
    };

    generateScript();
  }, [listing, analysis, selectedStyle]);

  const handleRegenerateScript = async () => {
    setIsGenerating(true);
    try {
      const result = await videoGenerationService.generateScript(listing, analysis, selectedStyle);
      setScript(result);
      setEditableScript(result);
      setIsGenerating(false);
    } catch (error) {
      console.error('Script regeneration failed:', error);
      setIsGenerating(false);
    }
  };

  const handleSceneEdit = (index: number, narration: string) => {
    if (editableScript) {
      const updatedScript = {
        ...editableScript,
        scenes: editableScript.scenes.map((scene, i) => 
          i === index ? { ...scene, narration } : scene
        )
      };
      setEditableScript(updatedScript);
    }
  };

  if (isGenerating) {
    return (
      <div className="py-8">
        <AIThinkingAnimation message="AI is crafting your property story" />
        <div className="mt-8 max-w-2xl mx-auto">
          <StreamingText
            text="Creating an engaging narrative that highlights the unique features of your property..."
            speed={40}
          />
        </div>
      </div>
    );
  }

  if (!script || !editableScript) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Script generation failed. Please try again.</p>
        <Button variant="gradient" onClick={handleRegenerateScript} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Script Generated!</h3>
        <p className="text-slate-400">Review and customize your video narration</p>
      </div>

      {/* Style Selection */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4">Script Style</h4>
        <div className="grid grid-cols-3 gap-4">
          {(['modern', 'luxury', 'family'] as const).map((style) => (
            <button
              key={style}
              onClick={() => {
                setSelectedStyle(style);
                handleRegenerateScript();
              }}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                selectedStyle === style
                  ? 'bg-purple-500/20 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="font-medium capitalize">{style}</span>
              <p className="text-xs mt-1 opacity-80">
                {style === 'modern' && 'Clean and contemporary'}
                {style === 'luxury' && 'Sophisticated and elegant'}
                {style === 'family' && 'Warm and welcoming'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Script Preview */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-white font-semibold">Video Script</h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<SparklesIcon className="h-4 w-4" />}
              onClick={handleRegenerateScript}
            >
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PencilSquareIcon className="h-4 w-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done Editing' : 'Edit'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Intro */}
          <div>
            <h5 className="text-purple-400 font-medium mb-2">Introduction</h5>
            {isEditing ? (
              <textarea
                value={editableScript.intro}
                onChange={(e) => setEditableScript({ ...editableScript, intro: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-300">{editableScript.intro}</p>
            )}
          </div>

          {/* Scenes */}
          <div>
            <h5 className="text-purple-400 font-medium mb-3">Scenes</h5>
            <div className="space-y-4">
              {editableScript.scenes.map((scene, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      Scene {index + 1}: {analysis.detectedRooms[scene.imageIndex]}
                    </span>
                    <span className="text-slate-400 text-sm">{scene.duration}s</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={scene.narration}
                      onChange={(e) => handleSceneEdit(index, e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={2}
                    />
                  ) : (
                    <p className="text-slate-300 text-sm">{scene.narration}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outro */}
          <div>
            <h5 className="text-purple-400 font-medium mb-2">Conclusion</h5>
            {isEditing ? (
              <textarea
                value={editableScript.outro}
                onChange={(e) => setEditableScript({ ...editableScript, outro: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-300">{editableScript.outro}</p>
            )}
          </div>

          {/* Duration */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-slate-400">
              Total Duration: <span className="text-white font-medium">{editableScript.totalDuration} seconds</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="gradient"
          onClick={() => onComplete(editableScript)}
          leftIcon={<CheckCircleIcon className="h-5 w-5" />}
        >
          Approve Script & Continue
        </Button>
      </div>
    </div>
  );
};

export default VideoScriptEditor;