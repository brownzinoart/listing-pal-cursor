import React from "react";
import {
  AbsoluteFill,
  Img,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ListingPalBranding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate logo entrance
  const logoScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-end",
        padding: 40,
      }}
    >
      {/* Bottom gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Logo container with actual logoLP.png */}
      <div
        style={{
          zIndex: 10,
          transform: `scale(${logoScale})`,
          filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))",
        }}
      >
        <Img
          src="http://localhost:3001/logoLP.png"
          style={{
            height: 80,
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
