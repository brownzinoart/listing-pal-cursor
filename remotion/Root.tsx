import React from 'react';
import { Composition } from 'remotion';
import { PropertySlideshow } from './compositions/PropertySlideshow';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PropertySlideshow"
        component={PropertySlideshow}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          images: [],
          audioUrl: undefined,
          propertyInfo: {
            address: '',
            price: '',
            beds: 0,
            baths: 0,
            sqft: 0,
          },
          transitionType: 'fade',
          imageDuration: 5,
        }}
      />
      
      <Composition
        id="PropertySlideshowTikTok"
        component={PropertySlideshow}
        durationInFrames={1800} // 60 seconds at 30fps
        fps={30}
        width={1080}
        height={1920} // 9:16 aspect ratio
        defaultProps={{
          images: [],
          audioUrl: undefined,
          propertyInfo: {
            address: '',
            price: '',
            beds: 0,
            baths: 0,
            sqft: 0,
          },
          transitionType: 'fade',
          imageDuration: 5,
          platform: 'tiktok',
        }}
      />
      
      <Composition
        id="PropertySlideshowInstagram"
        component={PropertySlideshow}
        durationInFrames={2700} // 90 seconds at 30fps
        fps={30}
        width={1080}
        height={1920} // 9:16 aspect ratio
        defaultProps={{
          images: [],
          audioUrl: undefined,
          propertyInfo: {
            address: '',
            price: '',
            beds: 0,
            baths: 0,
            sqft: 0,
          },
          transitionType: 'fade',
          imageDuration: 5,
          platform: 'instagram',
        }}
      />
    </>
  );
};