import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface TransitionEffectProps {
  type: "fade" | "slide" | "zoom";
  fromImage: string;
  toImage: string;
}

export const TransitionEffect: React.FC<TransitionEffectProps> = ({
  type,
  fromImage,
  toImage,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1]);

  switch (type) {
    case "fade":
      return (
        <>
          <AbsoluteFill style={{ opacity: 1 - progress }}>
            <Img
              src={fromImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: progress }}>
            <Img
              src={toImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </>
      );

    case "slide":
      const slideX = interpolate(frame, [0, durationInFrames], [0, -100]);
      return (
        <>
          <AbsoluteFill style={{ transform: `translateX(${slideX}%)` }}>
            <Img
              src={fromImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${slideX + 100}%)` }}>
            <Img
              src={toImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </>
      );

    case "zoom":
      const fromScale = interpolate(frame, [0, durationInFrames], [1, 0.8]);
      const toScale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
      return (
        <>
          <AbsoluteFill style={{ opacity: 1 - progress }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Img
                src={fromImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${fromScale})`,
                }}
              />
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: progress }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Img
                src={toImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${toScale})`,
                }}
              />
            </div>
          </AbsoluteFill>
        </>
      );
  }
};
