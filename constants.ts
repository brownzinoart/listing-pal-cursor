import { LightBulbIcon, SparklesIcon as SparklesIconOutline, HomeModernIcon, SunIcon, PaintBrushIcon, WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, EnvelopeIcon, PhotoIcon, MegaphoneIcon, CurrencyDollarIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { AiDesignStyle, AiWorkflowTool } from './types';


export const APP_NAME = "ListingPal";

export const MAX_LISTING_IMAGES = 12;

export const TOOLKIT_TOOLS = [
  { id: "desc", name: "Property Description", pathSuffix: "/generate/description", enabled: true, color: "bg-blue-600", icon: DocumentTextIcon, subtitle: "MLS-ready property descriptions" },
  { id: "fb", name: "Facebook Media", pathSuffix: "/generate/facebook-post", enabled: true, color: "bg-blue-700", icon: MegaphoneIcon, subtitle: "Engaging Facebook posts" },
  { id: "ig", name: "Instagram Media", pathSuffix: "/generate/instagram-post", enabled: true, color: "bg-purple-600", icon: PhotoIcon, subtitle: "Captivating Instagram captions" },
  { id: "x", name: "X (Twitter) Media", pathSuffix: "/generate/x-post", enabled: true, color: "bg-sky-600", icon: ChatBubbleLeftRightIcon, subtitle: "Concise X posts" },
  { id: "email", name: "Introductory Email", pathSuffix: "/generate/email", enabled: true, color: "bg-teal-600", icon: EnvelopeIcon, subtitle: "Professional email campaigns" },
  { id: "interior", name: "Interior Reimagined", pathSuffix: "/ai/room-redesign", enabled: true, color: "bg-pink-600", icon: LightBulbIcon, subtitle: "AI interior styling" },
  { id: "flyer", name: "Flyer Generator", pathSuffix: "/generate/flyer", enabled: true, color: "bg-orange-600", icon: PaintBrushIcon, subtitle: "Custom marketing flyers" },
  { id: "print", name: "Print Materials", pathSuffix: "/print", enabled: true, color: "bg-indigo-600", icon: PrinterIcon, subtitle: "Lawn signs, postcards & more" },
  { id: "paid_ads", name: "Paid Ad Campaigns", pathSuffix: "/generate/paid-ad", enabled: true, color: "bg-green-600", icon: CurrencyDollarIcon, subtitle: "Generate paid ad copy" },
];

export const DESCRIPTION_STYLES = [
  { id: 'professional', name: 'Professional', description: 'Formal, detailed description for MLS listings' },
  { id: 'luxury', name: 'Luxury', description: 'Elegant, sophisticated tone for high-end properties' },
  { id: 'family-friendly', name: 'Family-Friendly', description: 'Warm, welcoming tone emphasizing comfort' },
  { id: 'modern', name: 'Modern', description: 'Contemporary, sleek language for modern homes' },
  { id: 'investment', name: 'Investment', description: 'ROI-focused for investors and flippers' },
];

export type DescriptionStyleId = typeof DESCRIPTION_STYLES[number]['id'];

export const AI_DESIGN_STYLES: AiDesignStyle[] = [
  { id: 'modern', name: 'Modern', description: 'Contemporary design with minimalist aesthetics', icon: HomeModernIcon },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Light, airy spaces with natural materials', icon: SunIcon },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean lines and uncluttered spaces', icon: HomeModernIcon },
  { id: 'industrial', name: 'Industrial', description: 'Raw materials like brick, metal, and wood', icon: WrenchScrewdriverIcon },
  { id: 'bohemian', name: 'Bohemian', description: 'Eclectic mix of patterns, textures, and colors', icon: SparklesIconOutline },
  { id: 'traditional', name: 'Traditional', description: 'Classic and timeless design elements', icon: HomeModernIcon },
  { id: 'midcenturymodern', name: 'Mid-Century Modern', description: 'Retro 1950s-60s design aesthetic', icon: HomeModernIcon },
  { id: 'glamorous', name: 'Glamorous', description: 'Luxurious and sophisticated with metallic accents', icon: LightBulbIcon },
  { id: 'rustic', name: 'Rustic', description: 'Natural wood and country-inspired elements', icon: PaintBrushIcon },
  { id: 'contemporary', name: 'Contemporary', description: 'Current trends with clean, sophisticated style', icon: HomeModernIcon },
  { id: 'eclectic', name: 'Eclectic', description: 'Mix of different styles and periods', icon: SparklesIconOutline },
  { id: 'farmhouse', name: 'Farmhouse', description: 'Country-inspired design with modern comfort', icon: PaintBrushIcon },
];
export type AiDesignStyleId = typeof AI_DESIGN_STYLES[number]['id'];


// Old color constants are removed as the new palette is primarily handled by tailwind.config.js
// export const ACCENT_COLOR_MAIN = "teal-500";
// export const ACCENT_COLOR_HOVER = "teal-600";
// export const ACCENT_COLOR_TEXT = "text-teal-500";
// export const GENERATE_BUTTON_GREEN = "emerald-500";
// export const GENERATE_BUTTON_GREEN_HOVER = "emerald-600";
// export const SAVE_BUTTON_BLUE = "blue-600";
// export const SAVE_BUTTON_BLUE_HOVER = "blue-700";
