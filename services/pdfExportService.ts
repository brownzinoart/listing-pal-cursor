import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Listing, AgentProfile } from "../types";

export class PDFExportService {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20; // Page margins in mm

  static async exportListingToPDF(
    listing: Listing,
    agent: AgentProfile,
    elementId?: string,
  ): Promise<void> {
    console.log("🔧 PDFExportService.exportListingToPDF called");
    console.log("📋 Input validation...");

    try {
      // Validate inputs
      if (!listing) {
        throw new Error("Listing data is required");
      }
      if (!agent) {
        throw new Error("Agent data is required");
      }

      console.log("✅ Input validation passed");
      console.log("📄 Creating PDF instance...");

      const pdf = new jsPDF("p", "mm", "a4");
      console.log("✅ PDF instance created successfully");

      // If elementId is provided, capture that specific element
      if (elementId) {
        console.log("📸 Using element capture method with ID:", elementId);
        try {
          await this.captureElementToPDF(pdf, elementId, listing, agent);
        } catch (captureError) {
          console.error(
            "⚠️ Element capture failed, falling back to programmatic PDF:",
            captureError,
          );
          // Fallback to programmatic PDF generation
          await this.generateProgrammaticPDF(pdf, listing, agent);
        }
      } else {
        console.log("🖥️ Using programmatic PDF generation");
        // Otherwise, generate PDF programmatically
        await this.generateProgrammaticPDF(pdf, listing, agent);
      }

      // Generate filename
      console.log("📝 Generating filename...");
      const filename = this.generateFilename(listing);
      console.log("📁 Filename:", filename);

      // Save the PDF
      console.log("💾 Saving PDF...");
      pdf.save(filename);
      console.log("🎉 PDF saved successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
    }
  }

  private static async captureElementToPDF(
    pdf: jsPDF,
    elementId: string,
    _listing: Listing,
    agent: AgentProfile,
  ): Promise<void> {
    console.log("🎯 captureElementToPDF called with element ID:", elementId);

    const element = document.getElementById(elementId);
    console.log("🔍 Found element:", element);

    if (!element) {
      console.error("❌ Element not found!");
      throw new Error("Element not found for PDF capture");
    }

    // Add agent header first - commenting out temporarily for testing
    console.log("👤 Adding agent header...");
    try {
      await this.addAgentHeader(pdf, agent);
      console.log("✅ Agent header added");
    } catch (headerError) {
      console.error("⚠️ Failed to add agent header:", headerError);
      // Continue without header for now
    }

    // Capture the element
    console.log("📷 Starting html2canvas capture...");
    console.log(
      "📐 Element dimensions:",
      element.offsetWidth,
      "x",
      element.offsetHeight,
    );

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 1, // Standard scale for simplicity
        logging: false, // Disable logging for cleaner output
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = this.PAGE_WIDTH - this.MARGIN * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log("🖼️ Processing image for PDF...");
      console.log("📏 PDF image dimensions:", imgWidth, "x", imgHeight);

      // Add the captured content
      let yPosition = 50; // Start after agent header (45px header + 5px spacing)

      if (imgHeight > this.PAGE_HEIGHT - yPosition - this.MARGIN) {
        // Split across multiple pages if needed
        const pageHeight = this.PAGE_HEIGHT - yPosition - this.MARGIN;
        const totalPages = Math.ceil(imgHeight / pageHeight);

        console.log(`📄 Content will span ${totalPages} pages`);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
            yPosition = this.MARGIN;
          }

          const sourceY = (i * pageHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageHeight * canvas.height) / imgHeight,
            canvas.height - sourceY,
          );

          // Create a temporary canvas for this page slice
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight,
            );
            const tempImgData = tempCanvas.toDataURL("image/png");
            const tempImgHeight = (sourceHeight * imgWidth) / canvas.width;

            pdf.addImage(
              tempImgData,
              "PNG",
              this.MARGIN,
              yPosition,
              imgWidth,
              tempImgHeight,
            );
            console.log(`✅ Added page ${i + 1} of ${totalPages}`);
          }
        }
      } else {
        pdf.addImage(
          imgData,
          "PNG",
          this.MARGIN,
          yPosition,
          imgWidth,
          imgHeight,
        );
        console.log("✅ Content fits on single page");
      }

      // No footer - keeping it clean
      console.log("✅ Content capture complete");
    } catch (error) {
      console.error("❌ html2canvas capture failed:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
      }
      throw new Error(
        `Failed to capture content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private static async generateProgrammaticPDF(
    pdf: jsPDF,
    listing: Listing,
    agent: AgentProfile,
  ): Promise<void> {
    // Add agent header
    await this.addAgentHeader(pdf, agent);

    let yPosition = 60;

    // Add property title
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text(listing.address.split(",")[0], this.MARGIN, yPosition);
    yPosition += 10;

    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      listing.address.split(",").slice(1).join(",").trim(),
      this.MARGIN,
      yPosition,
    );
    yPosition += 15;

    // Add price
    pdf.setFontSize(20);
    pdf.setTextColor(0, 150, 0);
    pdf.text(this.formatPrice(listing.price), this.MARGIN, yPosition);
    yPosition += 15;

    // Add property details
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    const details = [
      `${listing.bedrooms} Bedrooms`,
      `${listing.bathrooms} Bathrooms`,
      `${listing.squareFootage.toLocaleString()} Sq Ft`,
      `Built ${listing.yearBuilt}`,
    ];
    pdf.text(details.join(" • "), this.MARGIN, yPosition);
    yPosition += 20;

    // Add key features if available
    if (listing.keyFeatures && listing.keyFeatures.trim()) {
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Key Features", this.MARGIN, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const features = this.parseKeyFeatures(listing.keyFeatures);

      features.forEach((feature) => {
        if (yPosition > this.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }
        pdf.text(`• ${feature}`, this.MARGIN + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Add property description if available
    if (listing.generatedDescription) {
      if (yPosition > this.PAGE_HEIGHT - 60) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Property Description", this.MARGIN, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const descriptionLines = pdf.splitTextToSize(
        listing.generatedDescription,
        this.PAGE_WIDTH - this.MARGIN * 2,
      );

      descriptionLines.forEach((line: string) => {
        if (yPosition > this.PAGE_HEIGHT - 30) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }
        pdf.text(line, this.MARGIN, yPosition);
        yPosition += 5;
      });
    }

    // No footer for programmatic PDF either
  }

  private static async addAgentHeader(
    pdf: jsPDF,
    agent: AgentProfile,
  ): Promise<void> {
    // Add clean white background for header
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, this.PAGE_WIDTH, 45, "F");

    // Add subtle bottom border
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.5);
    pdf.line(0, 45, this.PAGE_WIDTH, 45);

    // Add agent photo if available
    if (agent.photoUrl) {
      try {
        // Load and add agent photo
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load agent photo"));
          // Add timeout to prevent hanging
          setTimeout(() => reject(new Error("Agent photo load timeout")), 3000);
          img.src = agent.photoUrl!;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Draw circular photo
          ctx.save();
          ctx.beginPath();
          ctx.arc(50, 50, 50, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(img, 0, 0, 100, 100);
          ctx.restore();

          const photoData = canvas.toDataURL("image/png");
          pdf.addImage(photoData, "PNG", this.MARGIN, 10, 25, 25);
        }
      } catch (error) {
        console.warn("Could not load agent photo, skipping:", error);
        // Continue without photo - don't fail the entire PDF generation
      }
    }

    // Add agent info text in black
    const textStartX = this.MARGIN + (agent.photoUrl ? 30 : 0);

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(agent.name, textStartX, 18);

    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    let yPos = 25;

    if (agent.brokerage) {
      pdf.text(agent.brokerage, textStartX, yPos);
      yPos += 5;
    }

    pdf.text(`${agent.email} • ${agent.phone}`, textStartX, yPos + 5);

    // Add "Powered by ListingPal" on the right side
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Powered by ListingPal", this.PAGE_WIDTH - 50, 40);
  }

  private static addFooter(pdf: jsPDF): void {
    // Get current page number (jsPDF uses 1-based indexing)
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // Add dark footer background
      pdf.setFillColor(30, 41, 59); // slate-800
      pdf.rect(0, this.PAGE_HEIGHT - 20, this.PAGE_WIDTH, 20, "F");

      // Add "Powered by ListingPal" text
      pdf.setFontSize(8);
      pdf.setTextColor(200, 200, 200); // Light gray
      pdf.text(
        "Powered by ListingPal",
        this.PAGE_WIDTH - this.MARGIN - 30,
        this.PAGE_HEIGHT - 10,
      );

      // Add page number
      pdf.text(
        `${i}`,
        this.PAGE_WIDTH - this.MARGIN - 5,
        this.PAGE_HEIGHT - 10,
      );
    }
  }

  private static parseKeyFeatures(keyFeatures: string): string[] {
    // Handle both bullet-separated and comma-separated features
    if (
      keyFeatures.includes("•") ||
      keyFeatures.includes("·") ||
      keyFeatures.includes("*")
    ) {
      return keyFeatures
        .split(/[•·*]/g)
        .map((feat) => feat.trim())
        .filter((feat) => feat && feat.length > 0);
    } else {
      return keyFeatures
        .split(",")
        .map((feat) => feat.trim())
        .filter((feat) => feat && feat.length > 0);
    }
  }

  private static formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  }

  private static generateFilename(listing: Listing): string {
    const address = listing.address
      .split(",")[0]
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    return `${address}-listing-${date}.pdf`;
  }
}
