import type { NextApiRequest, NextApiResponse } from "next";
import { remotionVideoService } from "../../services/remotionVideoService";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      images,
      audioUrl,
      propertyInfo,
      transitionType = "fade",
      imageDuration = 5,
      platform = "youtube",
      generateAllPlatforms = false,
    } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    if (!propertyInfo) {
      return res.status(400).json({ error: "Property info is required" });
    }

    console.log("🎬 Starting Remotion video generation...");

    if (generateAllPlatforms) {
      // Generate videos for all platforms
      const videos = await remotionVideoService.generateAllPlatformVideos(
        {
          images,
          audioUrl,
          propertyInfo,
          transitionType,
          imageDuration,
        },
        (platform, progress) => {
          console.log(`${platform}: ${Math.round(progress * 100)}%`);
        },
      );

      return res.status(200).json({
        success: true,
        videos,
      });
    } else {
      // Generate single platform video
      const videoUrl = await remotionVideoService.generateVideo(
        {
          images,
          audioUrl,
          propertyInfo,
          transitionType,
          imageDuration,
          platform,
        },
        (progress) => {
          console.log(`Progress: ${Math.round(progress * 100)}%`);
        },
      );

      return res.status(200).json({
        success: true,
        videoUrl,
        platform,
      });
    }
  } catch (error) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: "Failed to generate video",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
