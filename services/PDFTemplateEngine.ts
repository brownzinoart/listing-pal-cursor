import { jsPDF } from "jspdf";
import { Listing, AgentProfile } from "../types";

// Professional PDF color scheme - clean and modern
export const PDF_COLORS = {
  // Primary brand colors
  primary: "#4A55C7", // Brand blue
  secondary: "#38A169", // Brand green
  accent: "#805AD5", // Brand purple

  // Text colors for readability
  textPrimary: "#1A202C", // Dark gray for main text
  textSecondary: "#4A5568", // Medium gray for secondary text
  textTertiary: "#718096", // Light gray for captions

  // Background colors
  white: "#FFFFFF",
  lightBg: "#F7FAFC", // Very light gray background
  cardBg: "#F8F9FA", // Card backgrounds
  borderLight: "#E2E8F0", // Light borders

  // Status colors
  success: "#38A169",
  info: "#4A55C7",
  warning: "#F59E0B",

  // Neutral colors
  black: "#000000",
  darkGray: "#2D3748",
  mediumGray: "#718096",
  lightGray: "#CBD5E0",

  // Social media brand colors
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",

  // Subtle accent backgrounds
  primaryLight: "#EBF4FF",
  secondaryLight: "#F0FDF4",
  accentLight: "#FAF5FF",
} as const;

// Typography system matching your Inter-based design
export const PDF_TYPOGRAPHY = {
  fonts: {
    primary: "helvetica", // Closest to Inter in jsPDF
    secondary: "helvetica", // Consistent
  },
  sizes: {
    // Hero and display
    hero: 36, // Large property names
    display: 28, // Price and major headings

    // Hierarchy
    h1: 24, // Section titles
    h2: 20, // Subsection titles
    h3: 16, // Card titles
    h4: 14, // Small titles

    // Body text
    body: 12, // Primary body text
    bodySmall: 10, // Secondary body text
    caption: 9, // Captions and metadata
    small: 8, // Fine print

    // Special
    price: 32, // Price display
    stats: 18, // Property stats
  },
  weights: {
    normal: "normal",
    bold: "bold",
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Layout system inspired by your glass morphism design
export const PDF_LAYOUT = {
  page: {
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
    margin: 15, // Generous margins
    contentWidth: 180, // Available content width
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    xxxl: 32,
  },
  elements: {
    // Headers and footers
    headerHeight: 70,
    footerHeight: 25,

    // Visual elements
    borderRadius: 6, // Rounded corners (glass morphism)
    cardPadding: 12, // Interior padding
    cardSpacing: 16, // Between cards

    // Images and media
    heroImageHeight: 120, // Large hero images
    galleryImageSize: 80, // Gallery thumbnails
    agentPhotoSize: 40, // Agent headshots

    // Special effects
    gradientHeight: 8, // Gradient accent bars
    shadowOffset: 2, // Subtle shadows
    glassOpacity: 0.95, // Glass effect transparency
  },
} as const;

export class PDFTemplateEngine {
  private pdf: jsPDF;
  private currentY: number = 0;
  private pageNumber: number = 1;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
    this.currentY = PDF_LAYOUT.page.margin;
  }

  // Public methods for external access
  public getPDFBlob(): Blob {
    return this.pdf.output("blob");
  }

  public getPDFDataUri(): string {
    return this.pdf.output("datauristring");
  }

  // Core utility methods
  private addNewPage(): void {
    this.pdf.addPage();
    this.pageNumber++;
    this.currentY = PDF_LAYOUT.page.margin;
  }

  private async loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        reject(new Error("Image load timeout"));
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  private setFont(size: number, weight: "normal" | "bold" = "normal"): void {
    this.pdf.setFont(PDF_TYPOGRAPHY.fonts.primary, weight);
    this.pdf.setFontSize(size);
  }

  private setColor(color: string): void {
    // Validate color parameter
    if (!color || typeof color !== "string") {
      console.warn("⚠️ Invalid color parameter, using default black:", color);
      color = "#000000";
    }

    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    this.pdf.setTextColor(r, g, b);
  }

  // Brand-aligned design helpers
  private drawGlassPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    opacity: number = 0.95,
  ): void {
    // Glass morphism effect - light background with border (using lighter colors instead of alpha)
    this.pdf.setFillColor(248, 250, 252); // Very light background
    this.pdf.roundedRect(
      x,
      y,
      width,
      height,
      PDF_LAYOUT.elements.borderRadius,
      PDF_LAYOUT.elements.borderRadius,
      "F",
    );

    // Subtle border
    this.pdf.setDrawColor(200, 200, 220);
    this.pdf.setLineWidth(0.3);
    this.pdf.roundedRect(
      x,
      y,
      width,
      height,
      PDF_LAYOUT.elements.borderRadius,
      PDF_LAYOUT.elements.borderRadius,
      "S",
    );
  }

  private drawBrandGradient(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Simulate brand gradient with layered rectangles
    const steps = 5;
    const stepHeight = height / steps;

    for (let i = 0; i < steps; i++) {
      // Interpolate between gradient colors
      const ratio = i / (steps - 1);
      const r = Math.round(128 + (74 - 128) * ratio); // 805AD5 -> 4A55C7
      const g = Math.round(90 + (85 - 90) * ratio);
      const b = Math.round(213 + (199 - 213) * ratio);

      this.pdf.setFillColor(r, g, b);
      this.pdf.rect(x, y + i * stepHeight, width, stepHeight, "F");
    }
  }

  private drawAccentBar(x: number, y: number, width: number): void {
    // Brand accent bar
    this.drawBrandGradient(x, y, width, PDF_LAYOUT.elements.gradientHeight);
  }

  private drawShadow(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Subtle shadow effect using light gray instead of alpha
    const offset = PDF_LAYOUT.elements.shadowOffset;
    this.pdf.setFillColor(230, 230, 230);
    this.pdf.roundedRect(
      x + offset,
      y + offset,
      width,
      height,
      PDF_LAYOUT.elements.borderRadius,
      PDF_LAYOUT.elements.borderRadius,
      "F",
    );
  }

  // Page templates
  async generateCoverPage(
    listing: Listing,
    agent: AgentProfile,
  ): Promise<void> {
    console.log("🎨 Generating professional cover page...");

    // Clean white background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    // Top accent bar
    this.pdf.setFillColor(74, 85, 199); // Primary blue
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, 3, "F");

    // Agent header - clean and professional
    this.currentY = 20;
    await this.addCleanAgentHeader(agent);

    // Hero property image - large and impactful
    this.currentY = 65;
    const imageHeight = 120;
    await this.addHeroPropertyImage(
      listing,
      PDF_LAYOUT.page.margin,
      this.currentY,
      180,
      imageHeight,
    );
    this.currentY += imageHeight + 15;

    // Property address - bold and prominent
    this.setFont(PDF_TYPOGRAPHY.sizes.hero, "bold");
    this.setColor(PDF_COLORS.textPrimary);
    const address = listing.address.split(",")[0];
    this.pdf.text(address, PDF_LAYOUT.page.margin, this.currentY);
    this.currentY += 12;

    // Location subtitle
    const subtitle = listing.address.split(",").slice(1).join(",").trim();
    this.setFont(PDF_TYPOGRAPHY.sizes.h3);
    this.setColor(PDF_COLORS.textSecondary);
    this.pdf.text(subtitle, PDF_LAYOUT.page.margin, this.currentY);
    this.currentY += 20;

    // Price - featured prominently
    const price = this.formatPrice(listing.price);
    this.pdf.setFillColor(235, 244, 255); // primaryLight
    this.pdf.roundedRect(
      PDF_LAYOUT.page.margin - 5,
      this.currentY - 12,
      100,
      30,
      5,
      5,
      "F",
    );

    this.setFont(PDF_TYPOGRAPHY.sizes.price, "bold");
    this.setColor(PDF_COLORS.primary);
    this.pdf.text(price, PDF_LAYOUT.page.margin, this.currentY);
    this.currentY += 25;

    // Key stats in modern card layout
    this.addModernStatsCards(listing);

    // Professional footer
    this.addCleanFooter();
  }

  generateOverviewPage(listing: Listing): void {
    console.log("📊 Generating overview page...");
    this.addNewPage();

    // Clean white background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    // Page header
    this.addPageHeader("Property Overview");
    this.currentY = 40;

    // Executive summary section
    if (listing.generatedDescription) {
      this.pdf.setFillColor(248, 249, 250); // Light gray background
      this.pdf.roundedRect(
        PDF_LAYOUT.page.margin,
        this.currentY,
        170,
        60,
        5,
        5,
        "F",
      );

      this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(
        "Executive Summary",
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 10,
      );

      const summaryText =
        listing.generatedDescription.substring(0, 250) + "...";
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.textSecondary);
      const lines = this.pdf.splitTextToSize(summaryText, 160);
      let yPos = this.currentY + 20;
      lines.slice(0, 4).forEach((line) => {
        this.pdf.text(line, PDF_LAYOUT.page.margin + 5, yPos);
        yPos += 6;
      });
      this.currentY += 70;
    }

    // Property details in modern grid
    this.addDetailedPropertyInfo(listing);
    this.currentY += 15;

    // Key features with icons
    if (listing.keyFeatures) {
      this.addEnhancedKeyFeatures(listing.keyFeatures);
    }

    // Clean footer
    this.addCleanFooter();
  }

  generateDescriptionPage(listing: Listing): void {
    console.log("📝 Generating description page...");
    this.addNewPage();

    // Clean white background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    // Page header
    this.addPageHeader("Property Description");
    this.currentY = 40;

    if (listing.generatedDescription) {
      // Add description with better formatting
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.textPrimary);

      const paragraphs = listing.generatedDescription.split("\n\n");
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          const lines = this.pdf.splitTextToSize(paragraph, 170);
          lines.forEach((line) => {
            this.pdf.text(line, PDF_LAYOUT.page.margin, this.currentY);
            this.currentY += 6;
          });
          this.currentY += 8; // Space between paragraphs
        }
      });
    } else {
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(
        "Property description will be available soon.",
        PDF_LAYOUT.page.margin,
        this.currentY,
      );
    }

    this.addCleanFooter();
  }

  // New page generation methods
  async generatePhotoGalleryPage(listing: Listing): Promise<void> {
    if (!listing.images || listing.images.length === 0) return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Property Gallery");
    this.currentY = 40;

    // Create a grid of images (2x3 or 3x2 based on count)
    const images = listing.images.slice(0, 6); // Max 6 images per page
    const cols = images.length <= 4 ? 2 : 3;
    const rows = Math.ceil(images.length / cols);
    const imageWidth = cols === 2 ? 80 : 50;
    const imageHeight = cols === 2 ? 60 : 40;
    const spacing = 10;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < images.length) {
          const x = PDF_LAYOUT.page.margin + col * (imageWidth + spacing);
          const y = this.currentY + row * (imageHeight + spacing);

          // Draw image placeholder with border
          this.pdf.setDrawColor(226, 232, 240);
          this.pdf.setLineWidth(0.5);
          this.pdf.roundedRect(x, y, imageWidth, imageHeight, 3, 3, "S");

          // Add image number
          this.setFont(9);
          this.setColor(PDF_COLORS.textTertiary);
          this.pdf.text(`Image ${index + 1}`, x + 2, y + imageHeight - 2);

          // Try to add actual image
          try {
            const imageData = await this.loadImage(images[index].url);
            this.pdf.addImage(imageData, "JPEG", x, y, imageWidth, imageHeight);
          } catch (error) {
            console.warn("Could not load image:", error);
          }
        }
      }
    }

    this.currentY += rows * (imageHeight + spacing) + 10;
    this.addCleanFooter();
  }

  generateSocialMediaPage(listing: Listing): void {
    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Social Media Marketing");
    this.currentY = 40;

    // Facebook Post
    if (listing.generatedFacebookPost) {
      this.addSocialMediaPost(
        "Facebook",
        listing.generatedFacebookPost,
        PDF_COLORS.facebook,
      );
      this.currentY += 15;
    }

    // Instagram Post
    if (listing.generatedInstagramCaption) {
      this.addSocialMediaPost(
        "Instagram",
        listing.generatedInstagramCaption,
        PDF_COLORS.instagram,
      );
      this.currentY += 15;
    }

    // X/Twitter Post
    if (listing.generatedXPost) {
      this.addSocialMediaPost(
        "X (Twitter)",
        listing.generatedXPost,
        PDF_COLORS.twitter,
      );
    }

    this.addCleanFooter();
  }

  generateEmailCampaignPage(listing: Listing): void {
    if (!listing.generatedEmail) return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Email Campaign");
    this.currentY = 40;

    // Email preview container
    this.pdf.setFillColor(248, 249, 250);
    this.pdf.roundedRect(
      PDF_LAYOUT.page.margin,
      this.currentY,
      170,
      200,
      5,
      5,
      "F",
    );

    // Email content
    this.setFont(PDF_TYPOGRAPHY.sizes.body);
    this.setColor(PDF_COLORS.textPrimary);

    const emailLines = listing.generatedEmail.split("\n");
    let emailY = this.currentY + 10;

    emailLines.forEach((line) => {
      if (emailY < this.currentY + 190) {
        // Stay within container
        if (line.startsWith("Subject:")) {
          this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
          this.setColor(PDF_COLORS.primary);
        } else {
          this.setFont(PDF_TYPOGRAPHY.sizes.body);
          this.setColor(PDF_COLORS.textPrimary);
        }

        const wrappedLines = this.pdf.splitTextToSize(line, 160);
        wrappedLines.forEach((wrappedLine) => {
          if (emailY < this.currentY + 190) {
            this.pdf.text(wrappedLine, PDF_LAYOUT.page.margin + 5, emailY);
            emailY += 6;
          }
        });
        emailY += 3;
      }
    });

    this.addCleanFooter();
  }

  async generateRoomRedesignsPage(listing: Listing): Promise<void> {
    if (!listing.generatedRoomDesigns) return;

    let roomDesigns: any[] = [];
    if (Array.isArray(listing.generatedRoomDesigns)) {
      roomDesigns = listing.generatedRoomDesigns;
    } else if (typeof listing.generatedRoomDesigns === "string") {
      try {
        const parsed = JSON.parse(listing.generatedRoomDesigns);
        if (Array.isArray(parsed)) roomDesigns = parsed;
      } catch (e) {
        console.error("Failed to parse room designs:", e);
        return;
      }
    }

    if (roomDesigns.length === 0) return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Interior Design Concepts");
    this.currentY = 40;

    // Show up to 2 designs per page
    const designsToShow = roomDesigns.slice(0, 2);

    designsToShow.forEach((design, index) => {
      // Design container
      this.pdf.setFillColor(248, 249, 250);
      this.pdf.roundedRect(
        PDF_LAYOUT.page.margin,
        this.currentY,
        170,
        80,
        5,
        5,
        "F",
      );

      // Style name
      this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(
        design.styleId || `Design ${index + 1}`,
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 10,
      );

      // Description
      if (design.prompt) {
        this.setFont(PDF_TYPOGRAPHY.sizes.body);
        this.setColor(PDF_COLORS.textSecondary);
        const lines = this.pdf.splitTextToSize(design.prompt, 160);
        lines.slice(0, 3).forEach((line, i) => {
          this.pdf.text(
            line,
            PDF_LAYOUT.page.margin + 5,
            this.currentY + 20 + i * 6,
          );
        });
      }

      this.currentY += 90;
    });

    this.addCleanFooter();
  }

  async generateMarketingMaterialsPage(listing: Listing): Promise<void> {
    if (!listing.generatedFlyers || listing.generatedFlyers.length === 0)
      return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Marketing Materials");
    this.currentY = 40;

    // Show flyer previews
    this.setFont(PDF_TYPOGRAPHY.sizes.body);
    this.setColor(PDF_COLORS.textSecondary);
    this.pdf.text(
      `${listing.generatedFlyers.length} professional marketing flyers have been created for this property.`,
      PDF_LAYOUT.page.margin,
      this.currentY,
    );
    this.currentY += 15;

    // List flyers with their details
    listing.generatedFlyers.slice(0, 5).forEach((flyer, index) => {
      // Flyer item
      this.pdf.setFillColor(248, 249, 250);
      this.pdf.roundedRect(
        PDF_LAYOUT.page.margin,
        this.currentY,
        170,
        25,
        3,
        3,
        "F",
      );

      this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(
        `Flyer ${index + 1}`,
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 8,
      );

      // Color scheme dots
      if (flyer.customization) {
        const colors = [
          flyer.customization.primaryColor,
          flyer.customization.secondaryColor,
          flyer.customization.accentColor,
        ];

        colors.forEach((color, i) => {
          const rgb = this.hexToRgb(color || "#000000");
          this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          this.pdf.circle(
            PDF_LAYOUT.page.margin + 100 + i * 15,
            this.currentY + 8,
            3,
            "F",
          );
        });
      }

      this.currentY += 30;
    });

    this.addCleanFooter();
  }

  generateNeighborhoodInsightsPage(listing: Listing): void {
    // Include page if we have either custom sections or coordinates
    const hasCustomSections =
      listing.neighborhoodSections && listing.neighborhoodSections.length > 0;
    const hasCoordinates = listing.latitude && listing.longitude;

    if (!hasCustomSections && !hasCoordinates) return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Neighborhood Insights");
    this.currentY = 40;

    // Neighborhood name
    const neighborhood = listing.address
      ? listing.address.split(",")[0]
      : "Local Area";
    this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
    this.setColor(PDF_COLORS.primary);
    this.pdf.text(
      `${neighborhood} Neighborhood`,
      PDF_LAYOUT.page.margin,
      this.currentY,
    );
    this.currentY += 15;

    // Process neighborhood sections if available
    if (hasCustomSections && listing.neighborhoodSections) {
      listing.neighborhoodSections.forEach((section, index) => {
        if (this.currentY > 250) {
          this.addCleanFooter();
          this.addNewPage();
          this.pdf.setFillColor(255, 255, 255);
          this.pdf.rect(
            0,
            0,
            PDF_LAYOUT.page.width,
            PDF_LAYOUT.page.height,
            "F",
          );
          this.addPageHeader("Neighborhood Insights (continued)");
          this.currentY = 40;
        }

        // Section container
        this.pdf.setFillColor(248, 249, 250);
        this.pdf.roundedRect(
          PDF_LAYOUT.page.margin,
          this.currentY,
          170,
          40,
          5,
          5,
          "F",
        );

        // Parse section for title and content
        const lines = section.split("\n").filter((line) => line.trim());
        const title = lines[0] || `Insight ${index + 1}`;
        const content = lines.slice(1).join(" ");

        // Section title
        this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
        this.setColor(PDF_COLORS.textPrimary);
        this.pdf.text(title, PDF_LAYOUT.page.margin + 5, this.currentY + 10);

        // Section content
        if (content) {
          this.setFont(PDF_TYPOGRAPHY.sizes.small);
          this.setColor(PDF_COLORS.textSecondary);
          const contentLines = this.pdf.splitTextToSize(content, 160);
          contentLines.slice(0, 3).forEach((line, i) => {
            this.pdf.text(
              line,
              PDF_LAYOUT.page.margin + 5,
              this.currentY + 20 + i * 5,
            );
          });
        }

        this.currentY += 50;
      });
    } else if (hasCoordinates && !hasCustomSections) {
      // Add default neighborhood content when only coordinates are available
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.textSecondary);
      this.pdf.text(
        "Neighborhood insights are available in the online listing portal.",
        PDF_LAYOUT.page.margin,
        this.currentY,
      );
      this.currentY += 10;
      this.pdf.text(
        "Visit the listing page to explore:",
        PDF_LAYOUT.page.margin,
        this.currentY,
      );
      this.currentY += 8;

      const insights = [
        "• School ratings and districts",
        "• Walkability and transit scores",
        "• Nearby amenities and attractions",
        "• Crime statistics and safety ratings",
        "• Demographics and community information",
      ];

      insights.forEach((insight) => {
        this.setFont(PDF_TYPOGRAPHY.sizes.small);
        this.setColor(PDF_COLORS.textTertiary);
        this.pdf.text(insight, PDF_LAYOUT.page.margin + 5, this.currentY);
        this.currentY += 6;
      });

      this.currentY += 10;
    }

    // Add location map placeholder
    if (this.currentY < 200) {
      this.currentY += 10;
      this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text("Location Overview", PDF_LAYOUT.page.margin, this.currentY);
      this.currentY += 10;

      // Map placeholder
      this.pdf.setFillColor(240, 242, 245);
      this.pdf.roundedRect(
        PDF_LAYOUT.page.margin,
        this.currentY,
        170,
        60,
        5,
        5,
        "F",
      );

      this.setFont(PDF_TYPOGRAPHY.sizes.small);
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(
        "Interactive neighborhood map available online",
        PDF_LAYOUT.page.margin + 40,
        this.currentY + 30,
      );
    }

    this.addCleanFooter();
  }

  generatePaidAdsPage(listing: Listing): void {
    if (!listing.generatedAdCopy) return;

    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Digital Advertising Campaigns");
    this.currentY = 40;

    let adCampaigns: any[] = [];

    try {
      const adCopyString =
        typeof listing.generatedAdCopy === "string"
          ? listing.generatedAdCopy
          : JSON.stringify(listing.generatedAdCopy);
      const parsed = JSON.parse(adCopyString);
      if (Array.isArray(parsed)) adCampaigns = parsed;
    } catch (e) {
      // Fallback to text display
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.textPrimary);
      const adText =
        typeof listing.generatedAdCopy === "string"
          ? listing.generatedAdCopy
          : JSON.stringify(listing.generatedAdCopy, null, 2);
      const lines = this.pdf.splitTextToSize(adText, 170);
      lines.slice(0, 20).forEach((line) => {
        this.pdf.text(line, PDF_LAYOUT.page.margin, this.currentY);
        this.currentY += 6;
      });
      this.addCleanFooter();
      return;
    }

    // Display parsed campaigns
    adCampaigns.slice(0, 3).forEach((ad) => {
      // Ad container
      this.pdf.setFillColor(248, 249, 250);
      this.pdf.roundedRect(
        PDF_LAYOUT.page.margin,
        this.currentY,
        170,
        50,
        5,
        5,
        "F",
      );

      // Platform and objective
      this.setFont(PDF_TYPOGRAPHY.sizes.h4, "bold");
      this.setColor(PDF_COLORS.primary);
      this.pdf.text(
        `${ad.platform} - ${ad.objective}`,
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 10,
      );

      // Headline
      this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(
        ad.headline || "",
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 20,
      );

      // Body preview
      this.setFont(PDF_TYPOGRAPHY.sizes.small);
      this.setColor(PDF_COLORS.textSecondary);
      const bodyLines = this.pdf.splitTextToSize(ad.body || "", 160);
      bodyLines.slice(0, 2).forEach((line, i) => {
        this.pdf.text(
          line,
          PDF_LAYOUT.page.margin + 5,
          this.currentY + 28 + i * 5,
        );
      });

      // CTA
      this.setFont(PDF_TYPOGRAPHY.sizes.small, "bold");
      this.setColor(PDF_COLORS.accent);
      this.pdf.text(
        ad.cta || "",
        PDF_LAYOUT.page.margin + 5,
        this.currentY + 42,
      );

      this.currentY += 60;
    });

    this.addCleanFooter();
  }

  // Helper methods for clean design
  private addPageHeader(title: string): void {
    // Simple, clean header
    this.pdf.setFillColor(74, 85, 199); // Primary color
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, 25, "F");

    this.setFont(PDF_TYPOGRAPHY.sizes.h2, "bold");
    this.setColor(PDF_COLORS.white);
    this.pdf.text(title, PDF_LAYOUT.page.margin, 16);

    // Page number
    this.setFont(PDF_TYPOGRAPHY.sizes.small);
    this.pdf.text(`Page ${this.pageNumber}`, PDF_LAYOUT.page.width - 30, 16);
  }

  private addCleanFooter(): void {
    const footerY = PDF_LAYOUT.page.height - 15;

    // Simple line separator
    this.pdf.setDrawColor(226, 232, 240);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      PDF_LAYOUT.page.margin,
      footerY - 5,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin,
      footerY - 5,
    );

    // Powered by text
    this.setFont(PDF_TYPOGRAPHY.sizes.small);
    this.setColor(PDF_COLORS.textTertiary);
    this.pdf.text("Powered by ListingPal", PDF_LAYOUT.page.width - 60, footerY);
  }

  private addContentSummaryPage(contentSummary: any): void {
    this.addNewPage();
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, PDF_LAYOUT.page.height, "F");

    this.addPageHeader("Content Summary");
    this.currentY = 40;

    // Summary title
    this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
    this.setColor(PDF_COLORS.textPrimary);
    this.pdf.text(
      "PDF Content Included:",
      PDF_LAYOUT.page.margin,
      this.currentY,
    );
    this.currentY += 15;

    // Content checklist
    const contentItems = [
      { label: "Property Overview", included: true },
      {
        label: "Property Description",
        included: contentSummary.hasDescription,
      },
      {
        label: "Photo Gallery",
        included: contentSummary.hasImages && contentSummary.imagesLength > 0,
      },
      {
        label: "Social Media Posts",
        included:
          contentSummary.hasFacebookPost ||
          contentSummary.hasInstagramCaption ||
          contentSummary.hasXPost,
      },
      { label: "Email Campaign", included: contentSummary.hasEmail },
      { label: "Interior Redesigns", included: contentSummary.hasRoomDesigns },
      {
        label: "Marketing Flyers",
        included: contentSummary.hasFlyers && contentSummary.flyersLength > 0,
      },
      { label: "Digital Ad Campaigns", included: contentSummary.hasAdCopy },
      {
        label: "Neighborhood Insights",
        included:
          contentSummary.hasNeighborhoodSections ||
          contentSummary.hasCoordinates,
      },
    ];

    contentItems.forEach((item) => {
      // Checkbox
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(
        item.included ? PDF_COLORS.primary : PDF_COLORS.textTertiary,
      );
      this.pdf.text(
        item.included ? "✓" : "○",
        PDF_LAYOUT.page.margin,
        this.currentY,
      );

      // Label
      this.setColor(
        item.included ? PDF_COLORS.textPrimary : PDF_COLORS.textTertiary,
      );
      this.pdf.text(item.label, PDF_LAYOUT.page.margin + 10, this.currentY);

      this.currentY += 8;
    });

    // Debug info (if needed)
    if (
      contentSummary.roomDesignsType === "string" ||
      contentSummary.adCopyType === "string"
    ) {
      this.currentY += 15;
      this.setFont(PDF_TYPOGRAPHY.sizes.small);
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(
        "Note: Some content required format conversion during PDF generation.",
        PDF_LAYOUT.page.margin,
        this.currentY,
      );
    }

    this.addCleanFooter();
  }

  private async addCleanAgentHeader(agent: AgentProfile): Promise<void> {
    // Agent info in clean layout
    const photoSize = 35;
    const textX = PDF_LAYOUT.page.margin + photoSize + 10;

    // Photo placeholder
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.circle(
      PDF_LAYOUT.page.margin + photoSize / 2,
      this.currentY + photoSize / 2,
      photoSize / 2,
      "F",
    );

    // Try to load agent photo
    if (agent.photoUrl) {
      try {
        const photoData = await this.loadImage(agent.photoUrl);
        // Add circular clipping for photo
        this.pdf.addImage(
          photoData,
          "JPEG",
          PDF_LAYOUT.page.margin,
          this.currentY,
          photoSize,
          photoSize,
        );
      } catch (error) {
        console.warn("Could not load agent photo");
      }
    }

    // Agent name
    this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
    this.setColor(PDF_COLORS.textPrimary);
    this.pdf.text(agent.name, textX, this.currentY + 8);

    // Contact info
    this.setFont(PDF_TYPOGRAPHY.sizes.small);
    this.setColor(PDF_COLORS.textSecondary);
    this.pdf.text(agent.phone + " • " + agent.email, textX, this.currentY + 16);

    // Brokerage
    if (agent.brokerage) {
      this.pdf.text(agent.brokerage, textX, this.currentY + 23);
    }

    this.currentY += photoSize + 10;
  }

  private addModernStatsCards(listing: Listing): void {
    const stats = [
      { icon: "🛏️", label: "Bedrooms", value: listing.bedrooms.toString() },
      { icon: "🚿", label: "Bathrooms", value: listing.bathrooms.toString() },
      {
        icon: "📐",
        label: "Square Feet",
        value: listing.squareFootage.toLocaleString(),
      },
      { icon: "📅", label: "Year Built", value: listing.yearBuilt.toString() },
    ];

    const cardWidth = 40;
    const cardHeight = 30;
    const spacing = 2;

    stats.forEach((stat, index) => {
      const x = PDF_LAYOUT.page.margin + index * (cardWidth + spacing);

      // Card background
      this.pdf.setFillColor(248, 249, 250);
      this.pdf.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, "F");

      // Icon
      this.setFont(14);
      this.pdf.text(stat.icon, x + cardWidth / 2 - 4, this.currentY + 8);

      // Value
      this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(
        stat.value,
        x + cardWidth / 2 - stat.value.length * 2,
        this.currentY + 16,
      );

      // Label
      this.setFont(PDF_TYPOGRAPHY.sizes.caption);
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(
        stat.label,
        x + cardWidth / 2 - stat.label.length * 1.5,
        this.currentY + 23,
      );
    });

    this.currentY += cardHeight + 10;
  }

  private addDetailedPropertyInfo(listing: Listing): void {
    // Property details in a clean grid
    const details = [
      {
        label: "Property Type",
        value: listing.propertyType || "Single Family",
      },
      { label: "Listing Type", value: listing.listingType || "For Sale" },
      {
        label: "Price per Sq Ft",
        value: `$${Math.round(listing.price / listing.squareFootage)}`,
      },
      {
        label: "Monthly Est.",
        value: `$${Math.round(listing.price * 0.004).toLocaleString()}`,
      },
    ];

    const startY = this.currentY;
    details.forEach((detail, index) => {
      const y = startY + index * 20;

      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(detail.label, PDF_LAYOUT.page.margin, y);

      this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
      this.setColor(PDF_COLORS.textPrimary);
      this.pdf.text(detail.value, PDF_LAYOUT.page.margin + 80, y);
    });

    this.currentY = startY + details.length * 20;
  }

  private addEnhancedKeyFeatures(keyFeatures: string): void {
    this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
    this.setColor(PDF_COLORS.textPrimary);
    this.pdf.text("Key Features", PDF_LAYOUT.page.margin, this.currentY);
    this.currentY += 10;

    const features = keyFeatures.split(/[•\n]/).filter((f) => f.trim());
    features.slice(0, 8).forEach((feature) => {
      if (feature.trim()) {
        // Feature with bullet
        this.setFont(PDF_TYPOGRAPHY.sizes.body);
        this.setColor(PDF_COLORS.primary);
        this.pdf.text("•", PDF_LAYOUT.page.margin, this.currentY);

        this.setColor(PDF_COLORS.textPrimary);
        const lines = this.pdf.splitTextToSize(feature.trim(), 160);
        lines.forEach((line, i) => {
          this.pdf.text(
            line,
            PDF_LAYOUT.page.margin + 8,
            this.currentY + i * 6,
          );
        });
        this.currentY += lines.length * 6 + 4;
      }
    });
  }

  private addSocialMediaPost(
    platform: string,
    content: string,
    brandColor: string,
  ): void {
    // Social media post container
    const containerHeight = 50;
    this.pdf.setFillColor(248, 249, 250);
    this.pdf.roundedRect(
      PDF_LAYOUT.page.margin,
      this.currentY,
      170,
      containerHeight,
      5,
      5,
      "F",
    );

    // Platform indicator
    const rgb = this.hexToRgb(brandColor);
    this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    this.pdf.rect(
      PDF_LAYOUT.page.margin,
      this.currentY,
      3,
      containerHeight,
      "F",
    );

    // Platform name
    this.setFont(PDF_TYPOGRAPHY.sizes.h4, "bold");
    this.setColor(PDF_COLORS.textPrimary);
    this.pdf.text(platform, PDF_LAYOUT.page.margin + 8, this.currentY + 10);

    // Post content
    this.setFont(PDF_TYPOGRAPHY.sizes.small);
    this.setColor(PDF_COLORS.textSecondary);
    const lines = this.pdf.splitTextToSize(content, 155);
    lines.slice(0, 5).forEach((line, i) => {
      this.pdf.text(
        line,
        PDF_LAYOUT.page.margin + 8,
        this.currentY + 20 + i * 5,
      );
    });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  // Premium component methods (keep existing)
  private async addPremiumAgentHeader(agent: AgentProfile): Promise<void> {
    const headerHeight = PDF_LAYOUT.elements.headerHeight;

    // Glass morphism header background
    this.drawGlassPanel(0, 0, PDF_LAYOUT.page.width, headerHeight, 0.95);

    // Accent gradient bar at top
    this.drawAccentBar(0, 0, PDF_LAYOUT.page.width);

    // Agent photo with premium styling
    const photoSize = PDF_LAYOUT.elements.agentPhotoSize;
    const photoX = PDF_LAYOUT.page.margin;
    const photoY = 15;

    await this.addPremiumAgentPhoto(agent, photoX, photoY, photoSize);

    // Agent details with sophisticated typography
    const textX = photoX + photoSize + 15;

    this.setFont(PDF_TYPOGRAPHY.sizes.h2, "bold");
    this.setColor(PDF_COLORS.printBackground);
    this.pdf.text(agent.name, textX, photoY + 12);

    this.setFont(PDF_TYPOGRAPHY.sizes.body);
    this.setColor(PDF_COLORS.textTertiary);
    if (agent.brokerage) {
      this.pdf.text(agent.brokerage, textX, photoY + 22);
    }

    this.setFont(PDF_TYPOGRAPHY.sizes.bodySmall);
    this.pdf.text(agent.phone, textX, photoY + 32);
    this.pdf.text(agent.email, textX, photoY + 42);

    if (agent.website) {
      this.pdf.text(agent.website, textX, photoY + 52);
    }

    // Elegant separator line
    this.pdf.setDrawColor(160, 174, 192);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      PDF_LAYOUT.page.margin,
      headerHeight - 8,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin,
      headerHeight - 8,
    );
  }

  private async addPremiumAgentPhoto(
    agent: AgentProfile,
    x: number,
    y: number,
    size: number,
  ): Promise<void> {
    // Drop shadow for photo
    this.drawShadow(x, y, size, size);

    if (agent.photoUrl) {
      try {
        console.log("👤 Loading premium agent photo...");
        const imageData = await this.loadImage(agent.photoUrl);

        // Circular photo with border
        this.pdf.setFillColor(255, 255, 255);
        this.pdf.circle(x + size / 2, y + size / 2, size / 2 + 1, "F");

        this.pdf.addImage(imageData, "JPEG", x + 2, y + 2, size - 4, size - 4);

        // Elegant border
        this.pdf.setDrawColor(74, 85, 199); // Brand primary
        this.pdf.setLineWidth(1);
        this.pdf.circle(x + size / 2, y + size / 2, size / 2, "S");

        console.log("✅ Premium agent photo added");
      } catch (error) {
        console.warn("⚠️ Using premium photo placeholder");
        this.drawPremiumAgentPhotoPlaceholder(x, y, size);
      }
    } else {
      this.drawPremiumAgentPhotoPlaceholder(x, y, size);
    }
  }

  private drawPremiumAgentPhotoPlaceholder(
    x: number,
    y: number,
    size: number,
  ): void {
    // Glass morphism circular placeholder
    this.pdf.setFillColor(234, 234, 240);
    this.pdf.circle(x + size / 2, y + size / 2, size / 2, "F");

    // Border
    this.pdf.setDrawColor(74, 85, 199);
    this.pdf.setLineWidth(1);
    this.pdf.circle(x + size / 2, y + size / 2, size / 2, "S");

    // Icon
    this.setFont(PDF_TYPOGRAPHY.sizes.h3);
    this.setColor(PDF_COLORS.primary);
    this.pdf.text("👤", x + size / 2 - 5, y + size / 2 + 3);
  }

  private addPremiumStatsBar(listing: Listing): void {
    const barY = this.currentY;
    const barHeight = 45;
    const cardWidth = 40;
    const spacing = 8;

    // Background with shadow and glass effect
    this.drawShadow(PDF_LAYOUT.page.margin - 5, barY - 5, 180, barHeight);
    this.drawGlassPanel(
      PDF_LAYOUT.page.margin - 5,
      barY - 5,
      180,
      barHeight,
      0.9,
    );

    const stats = [
      { label: "Beds", value: listing.bedrooms.toString(), icon: "🛏️" },
      { label: "Baths", value: listing.bathrooms.toString(), icon: "🚿" },
      {
        label: "Sq Ft",
        value: listing.squareFootage.toLocaleString(),
        icon: "📐",
      },
      { label: "Built", value: listing.yearBuilt.toString(), icon: "🏗️" },
    ];

    stats.forEach((stat, index) => {
      const x = PDF_LAYOUT.page.margin + index * (cardWidth + spacing);

      // Icon
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.pdf.text(stat.icon, x, barY + 8);

      // Value
      this.setFont(PDF_TYPOGRAPHY.sizes.stats, "bold");
      this.setColor(PDF_COLORS.primary);
      this.pdf.text(stat.value, x, barY + 20);

      // Label
      this.setFont(PDF_TYPOGRAPHY.sizes.caption);
      this.setColor(PDF_COLORS.textTertiary);
      this.pdf.text(stat.label, x, barY + 30);
    });

    this.currentY += 55;
  }

  private addPremiumFooter(): void {
    const footerY = PDF_LAYOUT.page.height - 20;

    // Glass footer background
    this.drawGlassPanel(0, footerY - 10, PDF_LAYOUT.page.width, 30, 0.8);

    // Brand accent bar
    this.drawAccentBar(0, footerY - 10, PDF_LAYOUT.page.width);

    // Page number
    this.setFont(PDF_TYPOGRAPHY.sizes.caption);
    this.setColor(PDF_COLORS.textTertiary);
    this.pdf.text(
      `${this.pageNumber}`,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin - 5,
      footerY,
    );

    // ListingPal branding with style
    this.setFont(PDF_TYPOGRAPHY.sizes.caption, "bold");
    this.setColor(PDF_COLORS.primary);
    this.pdf.text(
      "Powered by ListingPal",
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin - 45,
      footerY,
    );
  }

  // Component methods
  private async addAgentPhoto(
    agent: AgentProfile,
    x: number,
    y: number,
    size: number,
  ): Promise<void> {
    if (agent.photoUrl) {
      try {
        console.log("👤 Loading agent photo:", agent.photoUrl);
        const imageData = await this.loadImage(agent.photoUrl);

        // Create circular clipping mask
        this.pdf.circle(x + size / 2, y + size / 2, size / 2, "S");
        this.pdf.addImage(imageData, "JPEG", x, y, size, size);

        console.log("✅ Agent photo added successfully");
      } catch (error) {
        console.warn(
          "⚠️ Could not load agent photo, using placeholder:",
          error,
        );
        this.drawAgentPhotoPlaceholder(x, y, size);
      }
    } else {
      this.drawAgentPhotoPlaceholder(x, y, size);
    }
  }

  private drawAgentPhotoPlaceholder(x: number, y: number, size: number): void {
    this.pdf.setFillColor(200, 200, 200);
    this.pdf.circle(x + size / 2, y + size / 2, size / 2, "F");

    // Add icon
    this.setFont(PDF_TYPOGRAPHY.sizes.body);
    this.setColor(PDF_COLORS.white);
    this.pdf.text("👤", x + size / 2 - 3, y + size / 2 + 2);
  }

  private async addAgentHeader(agent: AgentProfile): Promise<void> {
    // Agent info header with professional styling
    const headerHeight = 50;

    // Background for header
    this.pdf.setFillColor(248, 250, 252); // Very light gray
    this.pdf.rect(0, 0, PDF_LAYOUT.page.width, headerHeight, "F");

    // Agent photo
    const photoSize = 35;
    const photoX = PDF_LAYOUT.page.margin;
    const photoY = 10;

    await this.addAgentPhoto(agent, photoX, photoY, photoSize);

    // Agent details
    const textX = photoX + photoSize + 10;

    this.setFont(PDF_TYPOGRAPHY.sizes.h3, "bold");
    this.setColor(PDF_COLORS.black);
    this.pdf.text(agent.name, textX, photoY + 8);

    this.setFont(PDF_TYPOGRAPHY.sizes.caption);
    this.setColor(PDF_COLORS.mediumGray);
    if (agent.brokerage) {
      this.pdf.text(agent.brokerage, textX, photoY + 15);
    }
    this.pdf.text(agent.phone, textX, photoY + 22);
    this.pdf.text(agent.email, textX, photoY + 29);

    // Separator line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      PDF_LAYOUT.page.margin,
      headerHeight - 5,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin,
      headerHeight - 5,
    );
  }

  private async addHeroPropertyImage(
    listing: Listing,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<void> {
    // Drop shadow for image
    this.drawShadow(x, y, width, height);

    if (listing.images && listing.images.length > 0) {
      try {
        const imageUrl = listing.images[0].url;
        console.log("🖼️ Loading premium hero image:", imageUrl);

        const imageData = await this.loadImage(imageUrl);

        // Rounded rectangle with border
        this.pdf.addImage(imageData, "JPEG", x, y, width, height);

        // Elegant border with brand color
        this.pdf.setDrawColor(74, 85, 199); // Brand primary
        this.pdf.setLineWidth(1.5);
        this.pdf.roundedRect(
          x,
          y,
          width,
          height,
          PDF_LAYOUT.elements.borderRadius,
          PDF_LAYOUT.elements.borderRadius,
          "S",
        );

        // Subtle gradient overlay at bottom for text readability (removed alpha transparency)
        this.drawBrandGradient(x, y + height - 20, width, 20);

        console.log("✅ Premium hero image added successfully");
      } catch (error) {
        console.warn(
          "⚠️ Could not load hero image, using premium placeholder:",
          error,
        );
        this.drawPremiumPropertyImagePlaceholder(x, y, width, height);
      }
    } else {
      this.drawPremiumPropertyImagePlaceholder(x, y, width, height);
    }
  }

  private drawPremiumPropertyImagePlaceholder(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Shadow effect
    this.drawShadow(x, y, width, height);

    // Glass morphism background
    this.drawGlassPanel(x, y, width, height, 0.9);

    // Brand gradient accent
    this.drawBrandGradient(x, y, width, 20);

    // Elegant border
    this.pdf.setDrawColor(74, 85, 199);
    this.pdf.setLineWidth(1.5);
    this.pdf.roundedRect(
      x,
      y,
      width,
      height,
      PDF_LAYOUT.elements.borderRadius,
      PDF_LAYOUT.elements.borderRadius,
      "S",
    );

    // Premium placeholder content
    this.setFont(PDF_TYPOGRAPHY.sizes.h3);
    this.setColor(PDF_COLORS.primary);
    this.pdf.text("🏠", x + width / 2 - 8, y + height / 2 - 10);

    this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
    this.setColor(PDF_COLORS.printBackground);
    this.pdf.text(
      "Premium Property Image",
      x + width / 2 - 35,
      y + height / 2 + 5,
    );

    this.setFont(PDF_TYPOGRAPHY.sizes.caption);
    this.setColor(PDF_COLORS.textTertiary);
    this.pdf.text(
      "Professional photography showcase",
      x + width / 2 - 40,
      y + height / 2 + 15,
    );
  }

  private drawPropertyImagePlaceholder(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Elegant image placeholder with brand colors
    this.pdf.setFillColor(226, 232, 240); // Light gray
    this.pdf.roundedRect(x, y, width, height, 8, 8, "F");

    // Image icon in center
    this.setFont(PDF_TYPOGRAPHY.sizes.body);
    this.setColor(PDF_COLORS.mediumGray);
    this.pdf.text("📷 Property Image", x + width / 2 - 20, y + height / 2);
  }

  private addQuickStatsBar(listing: Listing): void {
    const barY = this.currentY;
    const statWidth = 35;
    const startX = PDF_LAYOUT.page.margin;

    // Background bar
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.roundedRect(startX, barY, 170, 25, 4, 4, "F");

    // Stats
    const stats = [
      { label: "Beds", value: listing.bedrooms.toString() },
      { label: "Baths", value: listing.bathrooms.toString() },
      { label: "Sq Ft", value: listing.squareFootage.toLocaleString() },
      { label: "Built", value: listing.yearBuilt.toString() },
    ];

    stats.forEach((stat, index) => {
      const x = startX + 10 + index * 40;

      this.setFont(PDF_TYPOGRAPHY.sizes.body, "bold");
      this.setColor(PDF_COLORS.primary);
      this.pdf.text(stat.value, x, barY + 10);

      this.setFont(PDF_TYPOGRAPHY.sizes.caption);
      this.setColor(PDF_COLORS.mediumGray);
      this.pdf.text(stat.label, x, barY + 18);
    });

    this.currentY += 35;
  }

  private addPropertyStatsGrid(listing: Listing): void {
    const stats = [
      { label: "Bedrooms", value: listing.bedrooms.toString(), icon: "🛏️" },
      { label: "Bathrooms", value: listing.bathrooms.toString(), icon: "🚿" },
      {
        label: "Square Footage",
        value: listing.squareFootage.toLocaleString() + " sq ft",
        icon: "📐",
      },
      { label: "Year Built", value: listing.yearBuilt.toString(), icon: "🏗️" },
      {
        label: "Property Type",
        value: listing.propertyType || "Single Family",
        icon: "🏠",
      },
      {
        label: "Listing Type",
        value: listing.listingType === "sale" ? "For Sale" : "For Rent",
        icon: "💰",
      },
    ];

    const gridCols = 2;
    const cardWidth = 80;
    const cardHeight = 30;
    const spacing = 10;

    stats.forEach((stat, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;

      const x = PDF_LAYOUT.page.margin + col * (cardWidth + spacing);
      const y = this.currentY + row * (cardHeight + spacing);

      // Card background
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "F");

      // Icon and text
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.pdf.text(stat.icon, x + 5, y + 10);

      this.setFont(PDF_TYPOGRAPHY.sizes.caption, "bold");
      this.setColor(PDF_COLORS.darkGray);
      this.pdf.text(stat.label, x + 15, y + 10);

      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.primary);
      this.pdf.text(stat.value, x + 15, y + 20);
    });

    // Adjust currentY based on number of rows
    const rows = Math.ceil(stats.length / gridCols);
    this.currentY += rows * (cardHeight + spacing);
  }

  private addKeyFeaturesSection(keyFeatures: string): void {
    this.setFont(PDF_TYPOGRAPHY.sizes.h2, "bold");
    this.setColor(PDF_COLORS.darkGray);
    this.pdf.text("Key Features", PDF_LAYOUT.page.margin, this.currentY);
    this.currentY += 15;

    // Parse and format features
    const features = this.parseKeyFeatures(keyFeatures);

    features.forEach((feature, index) => {
      if (this.currentY > PDF_LAYOUT.page.height - 40) {
        this.addNewPage();
      }

      // Bullet point
      this.setColor(PDF_COLORS.primary);
      this.pdf.text("•", PDF_LAYOUT.page.margin, this.currentY);

      // Feature text
      this.setFont(PDF_TYPOGRAPHY.sizes.body);
      this.setColor(PDF_COLORS.black);
      const textLines = this.pdf.splitTextToSize(feature, 160);
      this.pdf.text(textLines, PDF_LAYOUT.page.margin + 8, this.currentY);

      this.currentY += textLines.length * 5 + 3;
    });
  }

  private addFormattedText(text: string, fontSize: number): void {
    this.setFont(fontSize);
    this.setColor(PDF_COLORS.black);

    const lines = this.pdf.splitTextToSize(
      text,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin * 2,
    );

    lines.forEach((line: string) => {
      if (this.currentY > PDF_LAYOUT.page.height - 40) {
        this.addNewPage();
      }

      this.pdf.text(line, PDF_LAYOUT.page.margin, this.currentY);
      this.currentY += 6;
    });
  }

  private addPageFooter(): void {
    const footerY = PDF_LAYOUT.page.height - 15;

    // Page number
    this.setFont(PDF_TYPOGRAPHY.sizes.caption);
    this.setColor(PDF_COLORS.mediumGray);
    this.pdf.text(
      `${this.pageNumber}`,
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin - 5,
      footerY,
    );

    // ListingPal branding
    this.pdf.text(
      "Powered by ListingPal",
      PDF_LAYOUT.page.width - PDF_LAYOUT.page.margin - 40,
      footerY,
    );
  }

  // Utility methods
  private parseKeyFeatures(keyFeatures: string): string[] {
    if (keyFeatures.includes("•") || keyFeatures.includes("·")) {
      return keyFeatures
        .split(/[•·]/g)
        .map((feat) => feat.trim())
        .filter((feat) => feat && feat.length > 0);
    } else {
      return keyFeatures
        .split(",")
        .map((feat) => feat.trim())
        .filter((feat) => feat && feat.length > 0);
    }
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  }

  private generateFilename(listing: Listing): string {
    const address = listing.address
      .split(",")[0]
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .replace(/^-|-$/g, "") // Remove leading/trailing dashes
      .toLowerCase()
      .substring(0, 50); // Limit length to avoid issues
    const date = new Date().toISOString().split("T")[0];
    return `premium-listing-${address}-${date}.pdf`;
  }

  // Main export method
  async generatePDF(listing: Listing, agent: AgentProfile): Promise<void> {
    console.log("🚀 Starting premium PDF generation...");
    const contentSummary = {
      hasDescription: !!listing.generatedDescription,
      hasFacebookPost: !!listing.generatedFacebookPost,
      hasInstagramCaption: !!listing.generatedInstagramCaption,
      hasXPost: !!listing.generatedXPost,
      hasEmail: !!listing.generatedEmail,
      hasRoomDesigns: !!listing.generatedRoomDesigns,
      roomDesignsType: typeof listing.generatedRoomDesigns,
      roomDesignsLength: Array.isArray(listing.generatedRoomDesigns)
        ? listing.generatedRoomDesigns.length
        : "not array",
      hasFlyers: !!listing.generatedFlyers,
      flyersLength: listing.generatedFlyers?.length || 0,
      hasAdCopy: !!listing.generatedAdCopy,
      adCopyType: typeof listing.generatedAdCopy,
      hasNeighborhoodSections: !!listing.neighborhoodSections,
      neighborhoodSectionsLength: listing.neighborhoodSections?.length || 0,
      hasImages: !!listing.images,
      imagesLength: listing.images?.length || 0,
      hasCoordinates: !!(listing.latitude && listing.longitude),
    };
    console.log("📋 Listing content available:", contentSummary);

    try {
      // Validate PDF instance
      if (!this.pdf) {
        throw new Error("PDF instance not initialized");
      }

      // Generate pages with individual error handling
      console.log("📄 Generating cover page...");
      try {
        await this.generateCoverPage(listing, agent);
      } catch (coverError) {
        console.error("❌ Cover page generation failed:", coverError);
        throw new Error(
          `Failed to generate cover page: ${coverError instanceof Error ? coverError.message : "Unknown error"}`,
        );
      }

      console.log("📊 Generating overview page...");
      try {
        this.generateOverviewPage(listing);
      } catch (overviewError) {
        console.error("❌ Overview page generation failed:", overviewError);
        throw new Error(
          `Failed to generate overview page: ${overviewError instanceof Error ? overviewError.message : "Unknown error"}`,
        );
      }

      if (listing.generatedDescription) {
        console.log("📝 Generating description page...");
        try {
          this.generateDescriptionPage(listing);
        } catch (descError) {
          console.error("⚠️ Description page generation failed:", descError);
          // Non-critical, continue with PDF generation
        }
      }

      // Add photo gallery if images exist
      if (listing.images && listing.images.length > 0) {
        console.log("📸 Generating photo gallery...");
        try {
          await this.generatePhotoGalleryPage(listing);
        } catch (galleryError) {
          console.error("⚠️ Gallery page generation failed:", galleryError);
        }
      }

      // Add social media posts if they exist
      if (
        listing.generatedFacebookPost ||
        listing.generatedInstagramCaption ||
        listing.generatedXPost
      ) {
        console.log("📱 Generating social media page...");
        try {
          this.generateSocialMediaPage(listing);
        } catch (socialError) {
          console.error("⚠️ Social media page generation failed:", socialError);
        }
      }

      // Add email campaign if it exists
      if (listing.generatedEmail) {
        console.log("✉️ Generating email campaign page...");
        try {
          this.generateEmailCampaignPage(listing);
        } catch (emailError) {
          console.error("⚠️ Email page generation failed:", emailError);
        }
      }

      // Add room redesigns if they exist
      if (listing.generatedRoomDesigns) {
        console.log("🏠 Processing room redesigns...");
        let roomDesigns = null;

        // Handle both string and array formats
        if (Array.isArray(listing.generatedRoomDesigns)) {
          roomDesigns = listing.generatedRoomDesigns;
        } else if (typeof listing.generatedRoomDesigns === "string") {
          try {
            const parsed = JSON.parse(listing.generatedRoomDesigns);
            if (Array.isArray(parsed)) {
              roomDesigns = parsed;
            }
          } catch (e) {
            console.error("Failed to parse room designs string:", e);
          }
        }

        if (roomDesigns && roomDesigns.length > 0) {
          console.log(
            `🏠 Generating room redesigns page with ${roomDesigns.length} designs...`,
          );
          try {
            await this.generateRoomRedesignsPage(listing);
          } catch (roomError) {
            console.error(
              "⚠️ Room redesigns page generation failed:",
              roomError,
            );
          }
        } else {
          console.log("⚠️ No valid room designs found after parsing");
        }
      }

      // Add marketing materials if they exist
      if (listing.generatedFlyers && listing.generatedFlyers.length > 0) {
        console.log("📄 Generating marketing materials page...");
        try {
          await this.generateMarketingMaterialsPage(listing);
        } catch (flyerError) {
          console.error(
            "⚠️ Marketing materials page generation failed:",
            flyerError,
          );
        }
      }

      // Add paid ads if they exist
      if (listing.generatedAdCopy) {
        console.log("💰 Generating paid ads page...");
        try {
          this.generatePaidAdsPage(listing);
        } catch (adsError) {
          console.error("⚠️ Paid ads page generation failed:", adsError);
        }
      }

      // Add neighborhood insights if they exist or if coordinates are available
      if (
        (listing.neighborhoodSections &&
          listing.neighborhoodSections.length > 0) ||
        (listing.latitude && listing.longitude)
      ) {
        console.log("🏘️ Generating neighborhood insights page...");
        try {
          this.generateNeighborhoodInsightsPage(listing);
        } catch (neighborhoodError) {
          console.error(
            "⚠️ Neighborhood insights page generation failed:",
            neighborhoodError,
          );
        }
      }

      // Add content summary page
      this.addContentSummaryPage(contentSummary);

      // Validate PDF has content
      const pageCount = this.pdf.getNumberOfPages();
      console.log(`📑 PDF has ${pageCount} pages`);

      if (pageCount === 0) {
        throw new Error("PDF has no pages");
      }

      // Generate filename and save
      const filename = this.generateFilename(listing);
      console.log("💾 Attempting to save PDF:", filename);

      // Try multiple download methods
      const downloadSuccess = await this.attemptDownload(filename);

      if (!downloadSuccess) {
        throw new Error("All download methods failed");
      }

      console.log("✅ Premium PDF generated and downloaded successfully!");
    } catch (error) {
      console.error("❌ PDF generation failed:", error);
      throw new Error(
        `Premium PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // New method for robust download handling
  private async attemptDownload(filename: string): Promise<boolean> {
    // Method 1: Direct save
    try {
      console.log("🔄 Attempting direct download...");
      this.pdf.save(filename);
      return true;
    } catch (directError) {
      console.warn("⚠️ Direct download failed:", directError);
    }

    // Method 2: Blob download with delay
    try {
      console.log("🔄 Attempting blob download...");
      const pdfBlob = this.pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);

      // Add small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      link.click();

      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);

      return true;
    } catch (blobError) {
      console.warn("⚠️ Blob download failed:", blobError);
    }

    // Method 3: Open in new window
    try {
      console.log("🔄 Attempting to open PDF in new window...");
      const pdfDataUri = this.pdf.output("datauristring");
      const newWindow = window.open(pdfDataUri, "_blank");

      if (newWindow) {
        console.log("✅ PDF opened in new window");
        return true;
      }
    } catch (windowError) {
      console.warn("⚠️ New window method failed:", windowError);
    }

    // Method 4: Base64 download
    try {
      console.log("🔄 Attempting base64 download...");
      const base64 = this.pdf.output("datauristring").split(",")[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);

      setTimeout(() => {
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      }, 100);

      return true;
    } catch (base64Error) {
      console.error("❌ Base64 download failed:", base64Error);
    }

    return false;
  }
}
