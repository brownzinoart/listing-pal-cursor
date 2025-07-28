import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface PropertyImageProps {
  src: string;
  imageIndex: number;
  totalImages: number;
  enableKenBurns?: boolean;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({
  src,
  imageIndex,
  totalImages,
  enableKenBurns = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Ken Burns effect - subtle zoom and pan
  const scale = enableKenBurns
    ? interpolate(frame, [0, durationInFrames], [1, 1.1], {
        extrapolateRight: 'clamp',
      })
    : 1;
  
  // Alternate pan direction for variety
  const panDirection = imageIndex % 2 === 0 ? 1 : -1;
  const translateX = enableKenBurns
    ? interpolate(frame, [0, durationInFrames], [0, 30 * panDirection], {
        extrapolateRight: 'clamp',
      })
    : 0;
  
  const translateY = enableKenBurns
    ? interpolate(frame, [0, durationInFrames], [0, -20], {
        extrapolateRight: 'clamp',
      })
    : 0;
  
  return (
    <AbsoluteFill>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          }}
        />
      </div>
      
      {/* Image counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '8px 16px',
          borderRadius: 20,
          color: 'white',
          fontSize: 18,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {imageIndex + 1} / {totalImages}
      </div>
    </AbsoluteFill>
  );
};