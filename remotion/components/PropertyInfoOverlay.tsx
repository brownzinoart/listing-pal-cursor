import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PropertyInfoOverlayProps {
  propertyInfo: {
    address: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
  };
  platform?: 'tiktok' | 'instagram' | 'youtube';
}

export const PropertyInfoOverlay: React.FC<PropertyInfoOverlayProps> = ({
  propertyInfo,
  platform = 'youtube',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Animate info appearance
  const infoProgress = spring({
    frame: frame - 30, // Delay appearance
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  // Hide info in the last 3 seconds
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 90, durationInFrames - 60],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  const opacity = infoProgress * fadeOut;
  const translateY = interpolate(infoProgress, [0, 1], [-50, 0]);
  
  // Platform-specific positioning
  const topPosition = platform === 'youtube' ? 60 : 100;
  
  return (
    <AbsoluteFill
      style={{
        padding: 40,
      }}
    >
      {/* Property info card */}
      <div
        style={{
          position: 'absolute',
          top: topPosition,
          left: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: '24px 32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          opacity,
          transform: `translateY(${translateY}px)`,
          maxWidth: platform === 'youtube' ? 500 : 400,
        }}
      >
        {/* Price */}
        <div
          style={{
            fontSize: platform === 'youtube' ? 36 : 32,
            fontWeight: 'bold',
            color: '#1F2937',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 8,
          }}
        >
          {propertyInfo.price}
        </div>
        
        {/* Address */}
        <div
          style={{
            fontSize: platform === 'youtube' ? 20 : 18,
            color: '#6B7280',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 16,
          }}
        >
          {propertyInfo.address}
        </div>
        
        {/* Property details */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            fontSize: platform === 'youtube' ? 18 : 16,
            color: '#4B5563',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M17.5 7.5V17.5H2.5V7.5M10 2.5L17.5 7.5L10 2.5ZM10 2.5L2.5 7.5L10 2.5Z"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="7" y="12" width="6" height="5.5" stroke="#6B7280" strokeWidth="1.5" />
            </svg>
            <span>{propertyInfo.beds} Beds</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="7.5" width="15" height="10" rx="2" stroke="#6B7280" strokeWidth="1.5" />
              <path d="M7.5 7.5V5.5C7.5 4.39543 8.39543 3.5 9.5 3.5H10.5C11.6046 3.5 12.5 4.39543 12.5 5.5V7.5" stroke="#6B7280" strokeWidth="1.5" />
            </svg>
            <span>{propertyInfo.baths} Baths</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" stroke="#6B7280" strokeWidth="1.5" />
              <path d="M7 3V17M13 3V17M3 10H17" stroke="#6B7280" strokeWidth="1.5" />
            </svg>
            <span>{propertyInfo.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};