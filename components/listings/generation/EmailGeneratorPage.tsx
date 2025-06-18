import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as listingService from "../../../services/listingService";
import { ollamaService } from "../../../services/ollamaService";
import { Listing } from "../../../types";
import { TOOLKIT_TOOLS } from "../../../constants";
import Button from "../../shared/Button";
import Textarea from "../../shared/Textarea";
import PropertySummaryHeader from "./PropertySummaryHeader";
import WorkflowNavigation from "./WorkflowNavigation";
import EmailMockup from "./EmailMockup";
import {
  ArrowLeftIcon,
  SparklesIcon as SparklesOutlineIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const EmailGeneratorPage: React.FC = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  // Workflow management
  const workflowParam = searchParams.get("workflow");
  const workflowTools = workflowParam ? workflowParam.split(",") : [];
  const isInWorkflow = workflowTools.length > 1;

  // Get previous step name for back navigation
  const getPreviousStepName = () => {
    if (!isInWorkflow) return "Property";
    const currentIndex = workflowTools.indexOf("email");
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(
        (tool) => tool.id === previousToolId,
      );
      return previousTool?.name || "Previous Step";
    }
    return "Property";
  };

  const getPreviousStepPath = () => {
    if (!isInWorkflow) return `/listings/${listingId}`;
    const currentIndex = workflowTools.indexOf("email");
    if (currentIndex > 0) {
      const previousToolId = workflowTools[currentIndex - 1];
      const previousTool = TOOLKIT_TOOLS.find(
        (tool) => tool.id === previousToolId,
      );
      if (previousTool?.pathSuffix) {
        return `/listings/${listingId}${previousTool.pathSuffix}?workflow=${workflowParam}`;
      }
    }
    return `/listings/${listingId}`;
  };

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided.");
      setIsLoadingPage(false);
      return;
    }
    listingService
      .getListingById(listingId)
      .then((data) => {
        if (data && data.userId === user?.id) {
          setListing(data);
          setGeneratedEmail(
            data.generatedEmail ||
              "Your generated introductory email will appear here...",
          );
        } else {
          setError(data ? "Permission denied." : "Listing not found.");
        }
      })
      .catch(() => setError("Failed to fetch listing details."))
      .finally(() => setIsLoadingPage(false));
  }, [listingId, user]);

  useEffect(() => {
    setCharCount(generatedEmail.length);
  }, [generatedEmail]);

  const handleGenerateEmail = async () => {
    if (!listing) return;
    setIsGenerating(true);
    setGeneratedEmail("Generating your exciting email content...");

    try {
      const aiEmail = await ollamaService.generateIntroEmail(listing);
      setGeneratedEmail(aiEmail);
    } catch (error) {
      console.error("Generation error:", error);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockEmail = `Subject: New Listing - ${listing.address.split(",")[0]} Available!

Dear [Client Name],

I hope this email finds you well! I'm absolutely thrilled to share an exceptional opportunity that just hit the market - and I immediately thought of you.

This stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom home at ${listing.address.split(",")[0]} is everything you've been searching for and more. At ${listing.squareFootage} square feet, this ${listing.yearBuilt} property offers the perfect blend of comfort, style, and value at $${listing.price.toLocaleString()}.

✨ What makes this property truly special:
${listing.keyFeatures
  .split(",")
  .slice(0, 4)
  .map((feature) => `• ${feature.trim()}`)
  .join("\n")}

The moment you step inside, you'll feel the warmth and potential this home offers. It's move-in ready and perfect for creating lasting memories with your loved ones.

🎯 Properties like this don't stay on the market long! I'd love to arrange a private showing at your earliest convenience. I'm confident you'll fall in love with what this home has to offer.

Would you be available for a quick tour this week? I have several time slots open and can work around your schedule.

Looking forward to hearing from you soon!

Best regards,
[Your Name]
[Your Phone Number]
[Your Email]
[Your Brokerage]`;

      setGeneratedEmail(mockEmail);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!listingId || !listing || !user) return;
    if (
      generatedEmail.includes("Your generated") ||
      generatedEmail.includes("Generating your content")
    ) {
      alert("Please generate an email before saving.");
      return;
    }

    try {
      await listingService.updateListing(listingId, {
        ...listing,
        generatedEmail: generatedEmail,
        userId: user.id,
      });

      // If in workflow, go to next tool
      if (isInWorkflow) {
        const currentIndex = workflowTools.indexOf("email");
        const nextToolId = workflowTools[currentIndex + 1];

        if (nextToolId) {
          const nextTool = TOOLKIT_TOOLS.find((tool) => tool.id === nextToolId);
          if (nextTool && nextTool.pathSuffix) {
            navigate(
              `/listings/${listingId}${nextTool.pathSuffix}?workflow=${workflowParam}`,
            );
            return;
          }
        }
      }

      // Default: go back to listing
      navigate(`/listings/${listingId}`);
    } catch (e) {
      alert("Failed to save email.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(generatedEmail)
      .then(() => alert("Email copied to clipboard!"))
      .catch(() => alert("Copy failed."));
  };

  const handleRefresh = () => {
    handleGenerateEmail();
  };

  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-danger p-4">{error}</p>
        <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
      </div>
    );
  }

  if (!listing) return <p className="text-center">Listing not found.</p>;

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link
            to={getPreviousStepPath()}
            className="inline-flex items-center text-sm text-brand-text-secondary hover:text-brand-primary transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:text-brand-primary" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6">
          Generate Email Campaign
        </h1>

        {isInWorkflow && (
          <div className="mb-8">
            <WorkflowNavigation
              workflowTools={workflowTools}
              currentToolId="email"
            />
          </div>
        )}

        <div className="mb-8">
          <PropertySummaryHeader listing={listing} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <div className="order-2 xl:order-1">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-brand-text-primary mb-4">
                Email Preview
              </h3>
              <div className="mb-6">
                <EmailMockup emailContent={generatedEmail} />
              </div>
              <Button
                onClick={handleGenerateEmail}
                isLoading={isGenerating}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-brand-secondary to-emerald-600 hover:from-emerald-600 hover:to-brand-secondary text-white font-semibold shadow-lg transition-all duration-300"
                leftIcon={<SparklesOutlineIcon className="h-5 w-5" />}
                size="lg"
              >
                {isGenerating ? "Generating..." : "Generate New Email"}
              </Button>
            </div>
          </div>

          {/* Content Editor Panel */}
          <div className="order-1 xl:order-2">
            <div className="bg-brand-panel border border-brand-border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-1">
                    Generated Email
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    Edit and customize your generated content.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Regenerate email"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-brand-card hover:bg-brand-border/20 border border-brand-border/50 text-brand-text-secondary hover:text-brand-primary transition-all duration-200"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  placeholder="Email content..."
                  className="w-full"
                  rows={16}
                  disabled={isGenerating}
                  variant="gradient"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-brand-text-tertiary mb-4 sm:mb-0">
                    Character count: {charCount}
                  </p>
                  <Button
                    onClick={handleConfirmAndSave}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-semibold shadow-lg transition-all duration-300 px-8"
                    leftIcon={<CheckIcon className="h-5 w-5" />}
                    size="lg"
                  >
                    Confirm & Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailGeneratorPage;
