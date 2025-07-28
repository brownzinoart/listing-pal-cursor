import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PropertyImage } from "../components/PropertyImage";
import { ListingPalBranding } from "../components/ListingPalBranding";
import { PropertyInfoOverlay } from "../components/PropertyInfoOverlay";
import { TransitionEffect } from "../components/TransitionEffect";

export interface PropertySlideshowProps {
  images: string[];
  audioUrl?: string;
  propertyInfo: {
    address: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
  };
  transitionType: "fade" | "slide" | "zoom";
  imageDuration: number; // seconds per image
  platform?: "tiktok" | "instagram" | "youtube";
}

export const PropertySlideshow: React.FC<PropertySlideshowProps> = ({
  images,
  audioUrl,
  propertyInfo,
  transitionType,
  imageDuration,
  platform = "youtube",
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const framesPerImage = imageDuration * fps;
  const transitionDuration = 0.5 * fps; // 0.5 second transitions

  if (images.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "black" }}>
        <div
          style={{
            color: "white",
            fontSize: 48,
            textAlign: "center",
            marginTop: "45%",
          }}
        >
          No images provided
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Image sequences with transitions */}
      {images.map((image, index) => {
        const startFrame = index * framesPerImage;
        const endFrame = startFrame + framesPerImage;
        const isLastImage = index === images.length - 1;

        return (
          <React.Fragment key={index}>
            <Sequence
              from={startFrame}
              durationInFrames={framesPerImage}
              name={`Image ${index + 1}`}
            >
              <PropertyImage
                src={image}
                imageIndex={index}
                totalImages={images.length}
                enableKenBurns={true}
              />
            </Sequence>

            {/* Transition to next image */}
            {!isLastImage && (
              <Sequence
                from={endFrame - transitionDuration}
                durationInFrames={transitionDuration}
                name={`Transition ${index + 1}`}
              >
                <TransitionEffect
                  type={transitionType}
                  fromImage={image}
                  toImage={images[index + 1]}
                />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}

      {/* Property info overlay */}
      <Sequence from={0} name="Property Info">
        <PropertyInfoOverlay propertyInfo={propertyInfo} platform={platform} />
      </Sequence>

      {/* ListingPal branding */}
      <Sequence from={0} name="Branding">
        <ListingPalBranding />
      </Sequence>
    </AbsoluteFill>
  );
};
