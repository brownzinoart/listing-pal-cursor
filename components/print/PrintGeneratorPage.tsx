import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Listing } from "../../types";
import Button from "../shared/Button";
import Card from "../shared/Card";
import ModernDashboardLayout from "../shared/ModernDashboardLayout";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import * as listingService from "../../services/listingService";

interface PrintGeneratorPageProps {}

type printType = "flyer" | "lawnSign" | "busPanel" | "postcard" | "doorHanger";

// Color options for different print types
const COLOR_OPTIONS = {
  lawnSign: [
    { name: "Royal Blue", bg: "from-blue-600 to-blue-700", text: "text-white" },
    {
      name: "Forest Green",
      bg: "from-green-600 to-green-700",
      text: "text-white",
    },
    { name: "Crimson Red", bg: "from-red-600 to-red-700", text: "text-white" },
    { name: "Purple", bg: "from-purple-600 to-purple-700", text: "text-white" },
    { name: "Orange", bg: "from-orange-500 to-orange-600", text: "text-white" },
    { name: "Teal", bg: "from-teal-600 to-teal-700", text: "text-white" },
  ],
  postcard: [
    {
      name: "Classic Blue",
      bg: "bg-blue-600",
      text: "text-white",
      accent: "bg-blue-100",
    },
    {
      name: "Elegant Green",
      bg: "bg-green-600",
      text: "text-white",
      accent: "bg-green-100",
    },
    {
      name: "Bold Red",
      bg: "bg-red-600",
      text: "text-white",
      accent: "bg-red-100",
    },
    {
      name: "Modern Purple",
      bg: "bg-purple-600",
      text: "text-white",
      accent: "bg-purple-100",
    },
    {
      name: "Warm Orange",
      bg: "bg-orange-500",
      text: "text-white",
      accent: "bg-orange-100",
    },
    {
      name: "Professional Navy",
      bg: "bg-slate-700",
      text: "text-white",
      accent: "bg-slate-100",
    },
  ],
  doorHanger: [
    {
      name: "Bright Blue",
      bg: "from-blue-500 to-cyan-600",
      text: "text-white",
      accent: "bg-yellow-400",
    },
    {
      name: "Vibrant Green",
      bg: "from-green-500 to-emerald-600",
      text: "text-white",
      accent: "bg-orange-400",
    },
    {
      name: "Hot Pink",
      bg: "from-pink-500 to-rose-600",
      text: "text-white",
      accent: "bg-yellow-300",
    },
    {
      name: "Electric Purple",
      bg: "from-purple-500 to-violet-600",
      text: "text-white",
      accent: "bg-cyan-300",
    },
    {
      name: "Sunset Orange",
      bg: "from-orange-400 to-red-500",
      text: "text-white",
      accent: "bg-yellow-300",
    },
    {
      name: "Ocean Teal",
      bg: "from-teal-500 to-blue-600",
      text: "text-white",
      accent: "bg-lime-300",
    },
  ],
  busPanel: [
    {
      name: "Bold Black",
      bg: "from-gray-900 to-black",
      text: "text-white",
      accent: "text-yellow-400",
    },
    {
      name: "Deep Blue",
      bg: "from-blue-900 to-indigo-900",
      text: "text-white",
      accent: "text-cyan-300",
    },
    {
      name: "Rich Green",
      bg: "from-green-800 to-emerald-900",
      text: "text-white",
      accent: "text-lime-300",
    },
    {
      name: "Burgundy",
      bg: "from-red-900 to-rose-900",
      text: "text-white",
      accent: "text-orange-300",
    },
    {
      name: "Dark Purple",
      bg: "from-purple-900 to-violet-900",
      text: "text-white",
      accent: "text-pink-300",
    },
  ],
};

// Simple price formatter
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

// Flyer template options
const FLYER_TEMPLATES = [
  {
    id: "modern-luxury",
    name: "Modern Luxury",
    description: "Clean lines with elegant typography",
  },
  {
    id: "classic-professional",
    name: "Classic Professional",
    description: "Traditional layout with professional styling",
  },
  {
    id: "minimal-chic",
    name: "Minimal Chic",
    description: "Minimalist design with maximum impact",
  },
  {
    id: "contemporary-bold",
    name: "Contemporary Bold",
    description: "Bold colors and modern typography",
  },
];

const COLOR_SCHEMES = [
  {
    name: "Ocean Blue",
    primary: "from-blue-600 to-blue-800",
    secondary: "bg-blue-100",
    text: "text-blue-900",
  },
  {
    name: "Forest Green",
    primary: "from-green-600 to-green-800",
    secondary: "bg-green-100",
    text: "text-green-900",
  },
  {
    name: "Royal Purple",
    primary: "from-purple-600 to-purple-800",
    secondary: "bg-purple-100",
    text: "text-purple-900",
  },
  {
    name: "Sunset Orange",
    primary: "from-orange-500 to-red-600",
    secondary: "bg-orange-100",
    text: "text-orange-900",
  },
  {
    name: "Elegant Black",
    primary: "from-gray-800 to-black",
    secondary: "bg-gray-100",
    text: "text-gray-900",
  },
];

// --- Enhanced Generators with Interactive Colors -------------------------
const FlyerGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(FLYER_TEMPLATES[0]);
  const [selectedColorScheme, setSelectedColorScheme] = useState(
    COLOR_SCHEMES[0],
  );

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">📄</div>
          <h3 className="text-2xl font-bold text-white">
            Property Flyer Generator
          </h3>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Flyer Header */}
            <div
              className={`bg-gradient-to-r ${selectedColorScheme.primary} p-6 text-white`}
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {listing.listingType?.toUpperCase() || "FOR SALE"}
                </div>
                <div className="text-xl opacity-90">{listing.address}</div>
              </div>
            </div>

            {/* Property Image */}
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].url}
                alt="Property"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Property Photo</span>
              </div>
            )}

            {/* Property Details */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div
                  className={`text-4xl font-bold mb-2 bg-gradient-to-r ${selectedColorScheme.primary} bg-clip-text text-transparent`}
                >
                  {formatPrice(listing.price)}
                </div>
                <div className="flex justify-center space-x-4 text-sm font-medium text-gray-600">
                  {listing.bedrooms && (
                    <span
                      className={`${selectedColorScheme.secondary} px-2 py-1 rounded`}
                    >
                      {listing.bedrooms} Beds
                    </span>
                  )}
                  {listing.bathrooms && (
                    <span
                      className={`${selectedColorScheme.secondary} px-2 py-1 rounded`}
                    >
                      {listing.bathrooms} Baths
                    </span>
                  )}
                  {listing.squareFootage && (
                    <span
                      className={`${selectedColorScheme.secondary} px-2 py-1 rounded`}
                    >
                      {listing.squareFootage.toLocaleString()} SF
                    </span>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-gray-800">
                  Key Features:
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {listing.keyFeatures
                    ?.split(",")
                    .slice(0, 4)
                    .map((feature, index) => (
                      <div key={index}>• {feature.trim()}</div>
                    ))}
                </div>
              </div>

              {/* Contact Info */}
              <div
                className={`bg-gradient-to-r ${selectedColorScheme.primary} text-white p-4 rounded-lg text-center`}
              >
                <div className="font-bold text-lg">Your Name</div>
                <div className="text-sm opacity-90">
                  Your Phone • Your Email
                </div>
                <div className="text-xs mt-1">
                  Licensed Real Estate Professional
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Flyer Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FLYER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedTemplate.id === template.id
                      ? "border-purple-400 ring-2 ring-purple-400/20 bg-purple-400/10"
                      : "border-white/20 hover:border-purple-400/50 hover:bg-white/5"
                  }`}
                >
                  <div className="font-medium text-white text-sm">
                    {template.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => setSelectedColorScheme(scheme)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedColorScheme.name === scheme.name
                      ? "border-purple-400 ring-2 ring-purple-400/20 bg-purple-400/10"
                      : "border-white/20 hover:border-purple-400/50 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-full h-6 bg-gradient-to-r ${scheme.primary} rounded mb-2`}
                  ></div>
                  <div className="text-xs font-medium text-white">
                    {scheme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<PrinterIcon className="h-5 w-5" />}
          >
            Generate Property Flyer
          </Button>
        </div>
      </div>
    </div>
  );
};
const LawnSignGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.lawnSign[0]);
  const [selectedSize, setSelectedSize] = useState("standard");

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🏠</div>
          <h3 className="text-2xl font-bold text-white">Lawn Sign Generator</h3>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div
            className={`bg-gradient-to-br ${selectedColor.bg} ${selectedColor.text} p-8 rounded-xl max-w-md mx-auto aspect-[3/2] flex flex-col justify-between shadow-2xl border-4 border-white`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 drop-shadow-lg">
                {listing.listingType?.toUpperCase() || "FOR SALE"}
              </div>
              <div className="text-lg opacity-90 drop-shadow">
                {listing.address}
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2 drop-shadow-lg">
                {formatPrice(listing.price)}
              </div>
              <div className="flex justify-center space-x-4 text-sm font-medium">
                {listing.bedrooms && (
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {listing.bedrooms} BD
                  </span>
                )}
                {listing.bathrooms && (
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {listing.bathrooms} BA
                  </span>
                )}
                {listing.squareFootage && (
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {listing.squareFootage.toLocaleString()} SF
                  </span>
                )}
              </div>
            </div>

            <div className="text-center text-sm bg-white/10 rounded p-2">
              <div className="font-semibold">Your Name</div>
              <div>Your Phone • Your Email</div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Sign Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_OPTIONS.lawnSign.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedColor.name === color.name
                      ? "border-green-400 ring-2 ring-green-400/20 bg-green-400/10"
                      : "border-white/20 hover:border-green-400/50 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-full h-8 bg-gradient-to-r ${color.bg} rounded mb-2`}
                  ></div>
                  <div className="text-xs font-medium text-white">
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sign Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
            >
              <option value="small" className="bg-gray-800 text-white">
                18" x 12" Small
              </option>
              <option value="standard" className="bg-gray-800 text-white">
                24" x 18" Standard
              </option>
              <option value="large" className="bg-gray-800 text-white">
                30" x 24" Large
              </option>
            </select>
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<PrinterIcon className="h-5 w-5" />}
          >
            Generate Lawn Sign
          </Button>
        </div>
      </div>
    </div>
  );
};

const BusPanelGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.busPanel[0]);
  const [selectedLayout, setSelectedLayout] = useState("imageRight");

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🚌</div>
          <h3 className="text-2xl font-bold text-white">Bus Panel Generator</h3>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div
            className={`bg-gradient-to-r ${selectedColor.bg} text-white p-6 rounded-xl aspect-[5/2] flex relative overflow-hidden shadow-2xl border-4 border-gray-300`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>

            <div className="flex-1 z-20 flex flex-col justify-center">
              <div className="text-4xl font-bold mb-2 text-white drop-shadow-2xl">
                {listing.listingType?.toUpperCase() || "FOR SALE"}
              </div>
              <div className="text-2xl mb-4 opacity-90 drop-shadow-lg">
                {listing.address}
              </div>
              <div
                className={`text-5xl font-bold mb-4 drop-shadow-2xl ${selectedColor.accent}`}
              >
                {formatPrice(listing.price)}
              </div>
              <div className="flex space-x-6 text-lg mb-4 font-medium">
                {listing.bedrooms && (
                  <span className="bg-white/20 px-3 py-1 rounded">
                    {listing.bedrooms} Bedrooms
                  </span>
                )}
                {listing.bathrooms && (
                  <span className="bg-white/20 px-3 py-1 rounded">
                    {listing.bathrooms} Bathrooms
                  </span>
                )}
                {listing.squareFootage && (
                  <span className="bg-white/20 px-3 py-1 rounded">
                    {listing.squareFootage.toLocaleString()} SF
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold bg-white/10 rounded p-2 inline-block">
                Call Your Name • Your Phone
              </div>
            </div>

            {listing.images && listing.images.length > 0 && (
              <div className="flex-1 z-10">
                <img
                  src={listing.images[0].url}
                  alt="Property"
                  className="w-full h-full object-cover rounded-r-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_OPTIONS.busPanel.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedColor.name === color.name
                      ? "border-indigo-400 ring-2 ring-indigo-400/20 bg-indigo-400/10"
                      : "border-white/20 hover:border-indigo-400/50 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-full h-8 bg-gradient-to-r ${color.bg} rounded mb-2`}
                  ></div>
                  <div className="text-xs font-medium text-white">
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Layout Style
            </label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all backdrop-blur-sm"
            >
              <option value="imageRight" className="bg-gray-800 text-white">
                Image Right
              </option>
              <option value="imageLeft" className="bg-gray-800 text-white">
                Image Left
              </option>
              <option
                value="imageBackground"
                className="bg-gray-800 text-white"
              >
                Image Background
              </option>
              <option value="textOnly" className="bg-gray-800 text-white">
                Text Only
              </option>
            </select>
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<PrinterIcon className="h-5 w-5" />}
          >
            Generate Bus Panel
          </Button>
        </div>
      </div>
    </div>
  );
};

const PostcardGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.postcard[0]);
  const [selectedSize, setSelectedSize] = useState("4x6");

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">📮</div>
          <h3 className="text-2xl font-bold text-white">Postcard Generator</h3>
        </div>

        {/* Preview - Front */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-brand-text-secondary mb-2">
            Front Side
          </h4>
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg aspect-[3/2] max-w-sm mx-auto relative shadow-xl">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].url}
                alt="Property"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-brand-panel rounded flex items-center justify-center">
                <span className="text-brand-text-tertiary">Property Photo</span>
              </div>
            )}

            <div
              className={`absolute bottom-2 left-2 right-2 ${selectedColor.bg} ${selectedColor.text} p-3 rounded shadow-lg`}
            >
              <div className="text-lg font-bold">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm opacity-90">{listing.address}</div>
            </div>
          </div>
        </div>

        {/* Preview - Back */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-brand-text-secondary mb-2">
            Back Side
          </h4>
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg aspect-[3/2] max-w-sm mx-auto flex shadow-xl">
            <div className="w-1/2 pr-3">
              <div
                className={`text-xs font-bold mb-2 ${selectedColor.bg} ${selectedColor.text} px-2 py-1 rounded`}
              >
                PROPERTY DETAILS
              </div>
              <div className="text-sm space-y-1 text-gray-800">
                <div className="font-medium">
                  {listing.bedrooms || "—"} Bedrooms
                </div>
                <div className="font-medium">
                  {listing.bathrooms || "—"} Bathrooms
                </div>
                <div className="font-medium">
                  {listing.squareFootage?.toLocaleString() || "—"} SF
                </div>
                <div
                  className={`font-bold mt-2 ${selectedColor.bg} ${selectedColor.text} px-2 py-1 rounded text-center`}
                >
                  {listing.listingType?.toUpperCase() || "FOR SALE"}
                </div>
              </div>
            </div>

            <div className="w-1/2 pl-3 border-l-2 border-gray-200">
              <div
                className={`text-xs font-bold mb-2 ${selectedColor.bg} ${selectedColor.text} px-2 py-1 rounded`}
              >
                CONTACT INFO
              </div>
              <div className="text-sm space-y-1 text-gray-800">
                <div className="font-bold">Your Name</div>
                <div className="font-medium">Your Phone</div>
                <div className="font-medium">Your Email</div>
                <div
                  className={`text-xs mt-3 p-2 rounded ${selectedColor.accent} text-gray-700`}
                >
                  <strong>Interested in this property?</strong>
                  <br />
                  Call or email today!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_OPTIONS.postcard.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor.name === color.name
                      ? "border-brand-primary ring-2 ring-brand-primary/20"
                      : "border-brand-border hover:border-brand-primary/50"
                  }`}
                >
                  <div className={`w-full h-6 ${color.bg} rounded mb-2`}></div>
                  <div className="text-xs font-medium text-brand-text-primary">
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">
              Postcard Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-3 bg-brand-input-bg border border-brand-border rounded-lg text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            >
              <option value="4x6">4" x 6" Standard</option>
              <option value="5x7">5" x 7" Large</option>
              <option value="6x9">6" x 9" Jumbo</option>
            </select>
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<PrinterIcon className="h-5 w-5" />}
          >
            Generate Postcard
          </Button>
        </div>
      </div>
    </div>
  );
};

const DoorHangerGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(
    COLOR_OPTIONS.doorHanger[0],
  );
  const [selectedMessage, setSelectedMessage] = useState("newListing");

  const getMessageText = () => {
    switch (selectedMessage) {
      case "justSold":
        return "JUST SOLD!";
      case "priceReduced":
        return "PRICE REDUCED!";
      case "openHouse":
        return "OPEN HOUSE";
      default:
        return "NEW LISTING!";
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🚪</div>
          <h3 className="text-2xl font-bold text-white">
            Door Hanger Generator
          </h3>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="max-w-xs mx-auto">
            {/* Door hanger shape with cutout */}
            <div
              className={`bg-gradient-to-b ${selectedColor.bg} border-4 border-white rounded-lg relative shadow-2xl`}
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 25%, 75% 25%, 75% 35%, 100% 35%, 100% 100%, 0 100%)",
              }}
            >
              <div className="p-6 pt-12">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className={`text-2xl font-black ${selectedColor.text} drop-shadow-2xl`}
                  >
                    {getMessageText()}
                  </div>
                  <div
                    className={`text-lg font-bold ${selectedColor.text} opacity-90 drop-shadow-lg`}
                  >
                    {listing.listingType?.toUpperCase() || "FOR SALE"}
                  </div>
                </div>

                {/* Property Image */}
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt="Property"
                    className="w-full h-32 object-cover rounded-lg mb-4 border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-white/20 rounded-lg mb-4 flex items-center justify-center border-2 border-white">
                    <span className="text-white text-sm font-medium">
                      Property Photo
                    </span>
                  </div>
                )}

                {/* Property Details */}
                <div className="text-center mb-4">
                  <div
                    className={`text-3xl font-black mb-2 drop-shadow-2xl ${selectedColor.accent}`}
                  >
                    {formatPrice(listing.price)}
                  </div>
                  <div
                    className={`text-sm font-bold mb-2 ${selectedColor.text} drop-shadow-lg`}
                  >
                    {listing.address}
                  </div>
                  <div
                    className={`flex justify-center space-x-2 text-sm font-medium ${selectedColor.text}`}
                  >
                    {listing.bedrooms && (
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {listing.bedrooms} BD
                      </span>
                    )}
                    {listing.bathrooms && (
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {listing.bathrooms} BA
                      </span>
                    )}
                    {listing.squareFootage && (
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {listing.squareFootage.toLocaleString()} SF
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div
                  className={`${selectedColor.accent} text-gray-900 p-3 rounded-lg text-center mb-4 shadow-lg font-bold`}
                >
                  <div className="font-black">Interested?</div>
                  <div className="text-sm font-bold">Call for a showing!</div>
                </div>

                {/* Contact Info */}
                <div
                  className={`text-center text-sm ${selectedColor.text} bg-white/10 rounded p-2`}
                >
                  <div className="font-bold">Your Name</div>
                  <div className="font-medium">Your Phone • Your Email</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_OPTIONS.doorHanger.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor.name === color.name
                      ? "border-brand-primary ring-2 ring-brand-primary/20"
                      : "border-brand-border hover:border-brand-primary/50"
                  }`}
                >
                  <div
                    className={`w-full h-8 bg-gradient-to-r ${color.bg} rounded mb-2`}
                  ></div>
                  <div className="text-xs font-medium text-brand-text-primary">
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">
              Message Style
            </label>
            <select
              value={selectedMessage}
              onChange={(e) => setSelectedMessage(e.target.value)}
              className="w-full p-3 bg-brand-input-bg border border-brand-border rounded-lg text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            >
              <option value="newListing">New Listing</option>
              <option value="justSold">Just Sold</option>
              <option value="priceReduced">Price Reduced</option>
              <option value="openHouse">Open House</option>
            </select>
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<PrinterIcon className="h-5 w-5" />}
          >
            Generate Door Hanger
          </Button>
        </div>
      </div>
    </div>
  );
};

const PrintGeneratorPage: React.FC<PrintGeneratorPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrintType, setSelectedPrintType] =
    useState<printType>("flyer");

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const data = await listingService.getListingById(id);
        if (data && data.userId === user.id) {
          setListing(data);
        } else {
          setError(data ? "Permission denied." : "Listing not found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const headerActions = (
    <Link to={`/listings/${id}`}>
      <Button
        variant="glass"
        size="sm"
        leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
      >
        Back
      </Button>
    </Link>
  );

  if (loading) {
    return (
      <ModernDashboardLayout
        title="Print Generator"
        subtitle="Create professional print materials for your property"
        actions={headerActions}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <ModernDashboardLayout
        title="Print Generator"
        subtitle="Create professional print materials for your property"
        actions={headerActions}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Error</h2>
            <p className="text-slate-400 mb-4">
              {error || "Listing not found"}
            </p>
            <Button variant="glass" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  const printTypes = [
    { id: "flyer", name: "Flyer", icon: "📄" },
    { id: "lawnSign", name: "Lawn Sign", icon: "🏠" },
    { id: "busPanel", name: "Bus Panel", icon: "🚌" },
    { id: "postcard", name: "Postcard", icon: "📮" },
    { id: "doorHanger", name: "Door Hanger", icon: "🚪" },
  ];

  const renderGenerator = () => {
    switch (selectedPrintType) {
      case "flyer":
        return <FlyerGenerator listing={listing} />;
      case "lawnSign":
        return <LawnSignGenerator listing={listing} />;
      case "busPanel":
        return <BusPanelGenerator listing={listing} />;
      case "postcard":
        return <PostcardGenerator listing={listing} />;
      case "doorHanger":
        return <DoorHangerGenerator listing={listing} />;
      default:
        return <FlyerGenerator listing={listing} />;
    }
  };

  return (
    <ModernDashboardLayout
      title="Print Generator"
      subtitle={`Create professional print materials for ${listing.address}`}
      actions={headerActions}
    >
      <div className="space-y-8">
        {/* Print Type Selector */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Select Print Material Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {printTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedPrintType(type.id as printType)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                    selectedPrintType === type.id
                      ? "bg-blue-500/20 text-white border-blue-400 shadow-lg"
                      : "bg-white/10 text-slate-300 border-white/20 hover:border-blue-400/50 hover:bg-white/15"
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generator Content */}
        {renderGenerator()}
      </div>
    </ModernDashboardLayout>
  );
};

export default PrintGeneratorPage;
