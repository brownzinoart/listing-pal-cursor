import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Listing } from "../../types";
import FlyerGeneratorPage from "../listings/generation/FlyerGeneratorPage";
import Button from "../shared/Button";
import Card from "../shared/Card";
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

// --- Enhanced Generators with Interactive Colors -------------------------
const LawnSignGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.lawnSign[0]);
  const [selectedSize, setSelectedSize] = useState("standard");

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-xl font-semibold text-brand-text-primary mb-6">
        Lawn Sign Generator
      </h3>

      {/* Preview */}
      <div className="mb-6">
        <div
          className={`bg-gradient-to-br ${selectedColor.bg} ${selectedColor.text} p-8 rounded-lg max-w-md mx-auto aspect-[3/2] flex flex-col justify-between shadow-2xl border-4 border-white`}
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
          <label className="block text-sm font-medium text-brand-text-secondary mb-3">
            Sign Color
          </label>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_OPTIONS.lawnSign.map((color, index) => (
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
            Sign Size
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full p-3 bg-brand-input-bg border border-brand-border rounded-lg text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          >
            <option value="small">18" x 12" Small</option>
            <option value="standard">24" x 18" Standard</option>
            <option value="large">30" x 24" Large</option>
          </select>
        </div>

        <Button variant="primary" fullWidth>
          Generate Lawn Sign
        </Button>
      </div>
    </Card>
  );
};

const BusPanelGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.busPanel[0]);
  const [selectedLayout, setSelectedLayout] = useState("imageRight");

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-xl font-semibold text-brand-text-primary mb-6">
        Bus Panel Generator
      </h3>

      {/* Preview */}
      <div className="mb-6">
        <div
          className={`bg-gradient-to-r ${selectedColor.bg} text-white p-6 rounded-lg aspect-[5/2] flex relative overflow-hidden shadow-2xl border-4 border-gray-300`}
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
                className="w-full h-full object-cover rounded-r-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-3">
            Color Scheme
          </label>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_OPTIONS.busPanel.map((color, index) => (
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
            Layout Style
          </label>
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="w-full p-3 bg-brand-input-bg border border-brand-border rounded-lg text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          >
            <option value="imageRight">Image Right</option>
            <option value="imageLeft">Image Left</option>
            <option value="imageBackground">Image Background</option>
            <option value="textOnly">Text Only</option>
          </select>
        </div>

        <Button variant="primary" fullWidth>
          Generate Bus Panel
        </Button>
      </div>
    </Card>
  );
};

const PostcardGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS.postcard[0]);
  const [selectedSize, setSelectedSize] = useState("4x6");

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-xl font-semibold text-brand-text-primary mb-6">
        Postcard Generator
      </h3>

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

        <Button variant="primary" fullWidth>
          Generate Postcard
        </Button>
      </div>
    </Card>
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
    <Card variant="default" padding="lg">
      <h3 className="text-xl font-semibold text-brand-text-primary mb-6">
        Door Hanger Generator
      </h3>

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

        <Button variant="primary" fullWidth>
          Generate Door Hanger
        </Button>
      </div>
    </Card>
  );
};

const PrintGeneratorPage: React.FC<PrintGeneratorPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center text-brand-danger p-8">
        <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error || "Listing not found"}</p>
        </div>
      </div>
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
        return <FlyerGeneratorPage />;
      case "lawnSign":
        return <LawnSignGenerator listing={listing} />;
      case "busPanel":
        return <BusPanelGenerator listing={listing} />;
      case "postcard":
        return <PostcardGenerator listing={listing} />;
      case "doorHanger":
        return <DoorHangerGenerator listing={listing} />;
      default:
        return <FlyerGeneratorPage />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-brand-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Print Generator
        </h1>
        <p className="text-brand-text-secondary">
          Create professional print materials for{" "}
          <span className="font-semibold text-brand-text-primary">
            {listing.address}
          </span>
        </p>
      </div>

      {/* Print Type Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {printTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedPrintType(type.id as printType)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                selectedPrintType === type.id
                  ? "bg-brand-primary text-white border-brand-primary shadow-brand-lg"
                  : "bg-brand-card text-brand-text-primary border-brand-border hover:border-brand-primary hover:bg-brand-panel"
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generator Content */}
      <div className="bg-brand-panel rounded-lg border border-brand-border shadow-brand">
        {renderGenerator()}
      </div>
    </div>
  );
};

export default PrintGeneratorPage;
