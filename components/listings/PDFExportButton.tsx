import React, { useState } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import Button from "../shared/Button";
import { PDFExportService } from "../../services/pdfExportService";
import { Listing, AgentProfile } from "../../types";
import toast from "react-hot-toast";

interface PDFExportButtonProps {
  listing: Listing;
  className?: string;
  variant?: "primary" | "secondary" | "glass" | "edit";
  size?: "sm" | "md" | "lg";
}

// Default agent profile - in a real app, this would come from user context or settings
const DEFAULT_AGENT: AgentProfile = {
  name: "Michael Scott",
  email: "michael@dundermifflin.com",
  phone: "(570) 555-0123",
  website: "www.michaelscottproperties.com",
  photoUrl:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
  brokerage: "Dunder Mifflin Real Estate",
  licenseNumber: "RE123456789",
};

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  listing,
  className = "",
  variant = "glass",
  size = "lg",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    console.log("🎨 PDF Export started!");
    console.log("📊 Listing data:", listing);
    console.log("👤 Agent data:", DEFAULT_AGENT);

    if (!listing) {
      console.error("❌ No listing data available");
      toast.error("No listing data available for export");
      return;
    }

    console.log("✨ Capturing page content...");
    setIsExporting(true);

    // Track progress with multiple toasts
    let loadingToast: string | null = null;

    try {
      // Initial loading toast
      loadingToast = toast.loading("Capturing page content...");

      console.log("🔄 Using html2canvas to capture content...");

      // Update progress
      toast.loading("Generating PDF from captured content...", {
        id: loadingToast,
      });

      console.log("📄 Generating PDF with html2canvas...");
      // Use PDFExportService to capture the pdf-export-content element
      await PDFExportService.exportListingToPDF(
        listing,
        DEFAULT_AGENT,
        "pdf-export-content",
      );

      // Success feedback
      console.log("🎉 PDF created successfully!");
      toast.dismiss(loadingToast);
      toast.success(
        "PDF downloaded successfully! Check your downloads folder.",
        {
          duration: 5000,
          icon: "📄",
        },
      );
    } catch (error) {
      console.error("❌ PDF creation failed:", error);
      console.error("Error details:", error);

      // Dismiss loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      // More detailed error message with suggestions
      let errorMessage = "Failed to create PDF presentation";
      let suggestion = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Stack trace:", error.stack);

        // Add helpful suggestions based on error type
        if (error.message.includes("download")) {
          suggestion =
            "Please check your browser download settings and try again.";
        } else if (error.message.includes("popup")) {
          suggestion = "Please allow popups for this site and try again.";
        } else if (error.message.includes("capture")) {
          suggestion =
            "There was an issue capturing the page content. Please try again.";
        } else if (error.message.includes("Element not found")) {
          suggestion =
            "Content container not found. Please refresh the page and try again.";
        }
      }

      toast.error(
        <div>
          <p className="font-semibold">{errorMessage}</p>
          {suggestion && <p className="text-sm mt-1">{suggestion}</p>}
        </div>,
        { duration: 6000 },
      );
    } finally {
      setIsExporting(false);
      console.log("🏁 PDF process finished");
    }
  };

  return (
    <Button
      variant={variant}
      glowColor="blue"
      leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? "Creating..." : "Create PDF Presentation"}
    </Button>
  );
};

export default PDFExportButton;
