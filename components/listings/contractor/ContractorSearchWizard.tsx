import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as listingService from "../../../services/listingService";
import { ContractorSearchService } from "../../../services/contractorSearchService";
import {
  ContractorSearchCriteria,
  ServiceSearchResult,
  ServiceQuoteRequest,
  ServiceAppointment,
  Listing,
  Contractor,
} from "../../../types";
import ModernDashboardLayout from "../../shared/ModernDashboardLayout";
import Button from "../../shared/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Import step components (will create these next)
import ContractorProjectScopeStep from "./ContractorProjectScopeStep";
import ContractorLocationTimelineStep from "./ContractorLocationTimelineStep";
import ContractorRequirementsStep from "./ContractorRequirementsStep";
import ContractorResultsStep from "./ContractorResultsStep";
import ContractorSelectionStep from "./ContractorSelectionStep";
import ContractorBookingStep from "./ContractorBookingStep";

// Define the wizard steps
const WIZARD_STEPS = [
  {
    id: "scope",
    title: "Project Scope",
    component: "ContractorProjectScopeStep",
  },
  {
    id: "location",
    title: "Location & Timeline",
    component: "ContractorLocationTimelineStep",
  },
  {
    id: "requirements",
    title: "Requirements",
    component: "ContractorRequirementsStep",
  },
  {
    id: "results",
    title: "Search Results",
    component: "ContractorResultsStep",
  },
  {
    id: "selection",
    title: "Compare & Select",
    component: "ContractorSelectionStep",
  },
  { id: "booking", title: "Request Quote", component: "ContractorBookingStep" },
];

const ContractorSearchWizard: React.FC = () => {
  const { id: listingId, stepId } = useParams<{
    id: string;
    stepId?: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search data state
  const [searchCriteria, setSearchCriteria] = useState<
    Partial<ContractorSearchCriteria>
  >({
    serviceType: "contractor",
    listingId: listingId,
    urgency: "within-month",
    maxDistance: 30,
    tradeNeeded: ["general"],
    projectType: "repair",
    budgetRange: { min: 1000, max: 25000 },
    projectDescription: "",
    timeframe: "2-4 weeks",
    verifiedOnly: true,
    insuredOnly: true,
  });

  const [searchResults, setSearchResults] = useState<ServiceSearchResult[]>([]);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<ServiceQuoteRequest | null>(
    null,
  );

  // Load listing data
  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided.");
      setIsLoading(false);
      return;
    }

    listingService
      .getListingById(listingId)
      .then((data) => {
        if (data && data.userId === user?.id) {
          setListing(data);

          // Initialize search criteria from listing
          const initialCriteria =
            ContractorSearchService.createSearchCriteriaFromListing(data);
          setSearchCriteria((prev) => ({
            ...prev,
            ...initialCriteria,
            listingId: listingId,
            projectDescription: `Property improvement project for ${data.address}`,
          }));
        } else {
          setError(
            data
              ? "You don't have permission to search contractors for this listing."
              : "Listing not found.",
          );
        }
      })
      .catch((err) => {
        console.error("Error loading listing:", err);
        setError("Failed to fetch listing details.");
      })
      .finally(() => setIsLoading(false));
  }, [listingId, user]);

  // Set current step based on URL
  useEffect(() => {
    if (stepId) {
      const index = WIZARD_STEPS.findIndex((step) => step.id === stepId);
      if (index !== -1) {
        setCurrentStepIndex(index);
      }
    } else {
      // If no stepId provided, redirect to first step
      setCurrentStepIndex(0);
      if (listingId) {
        navigate(`/listings/${listingId}/contractor/${WIZARD_STEPS[0].id}`, {
          replace: true,
        });
      }
    }
  }, [stepId, listingId, navigate]);

  // Navigation helpers
  const navigateToStep = (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex];
    navigate(`/listings/${listingId}/contractor/${step.id}`);
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    const validation = await validateCurrentStep();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    // If moving from requirements to results, perform search
    if (currentStepIndex === 2) {
      // requirements step
      await performSearch();
    }

    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      navigateToStep(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow navigating to previous steps or current step
    if (index <= currentStepIndex) {
      setValidationErrors([]);
      navigateToStep(index);
    }
  };

  // Perform contractor search
  const performSearch = async () => {
    try {
      setIsSearching(true);
      const results = await ContractorSearchService.searchContractors(
        searchCriteria as ContractorSearchCriteria,
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search for contractors. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Validation logic for each step
  const validateCurrentStep = async (): Promise<{
    isValid: boolean;
    errors: string[];
  }> => {
    const errors: string[] = [];
    const step = WIZARD_STEPS[currentStepIndex];

    switch (step.id) {
      case "scope":
        if (
          !searchCriteria.tradeNeeded ||
          searchCriteria.tradeNeeded.length === 0
        ) {
          errors.push("At least one trade specialty is required");
        }
        if (!searchCriteria.projectType) {
          errors.push("Project type is required");
        }
        if (!searchCriteria.projectDescription?.trim()) {
          errors.push("Project description is required");
        }
        break;

      case "location":
        if (!searchCriteria.maxDistance || searchCriteria.maxDistance <= 0) {
          errors.push("Maximum distance must be greater than 0");
        }
        if (!searchCriteria.urgency) {
          errors.push("Urgency level is required");
        }
        if (!searchCriteria.timeframe?.trim()) {
          errors.push("Project timeframe is required");
        }
        break;

      case "requirements":
        if (
          !searchCriteria.budgetRange ||
          searchCriteria.budgetRange.min <= 0 ||
          searchCriteria.budgetRange.max <= searchCriteria.budgetRange.min
        ) {
          errors.push("Valid budget range is required");
        }
        break;

      case "results":
        if (searchResults.length === 0) {
          errors.push(
            "No contractors found. Please adjust your criteria and search again.",
          );
        }
        break;

      case "selection":
        if (!selectedContractor) {
          errors.push("Please select a contractor to proceed");
        }
        break;

      case "booking":
        if (!quoteRequest) {
          errors.push("Please complete the quote request process");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Update search criteria
  const updateSearchCriteria = (updates: Partial<ContractorSearchCriteria>) => {
    setSearchCriteria((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Handle contractor selection
  const handleContractorSelection = async (contractorId: string) => {
    try {
      const contractor =
        await ContractorSearchService.getContractorById(contractorId);
      if (contractor) {
        setSelectedContractor(contractor);
      }
    } catch (error) {
      console.error("Error selecting contractor:", error);
      setError("Failed to load contractor details.");
    }
  };

  // Handle quote request
  const handleQuoteRequest = async (
    quoteData: Partial<ServiceQuoteRequest>,
  ) => {
    try {
      if (!selectedContractor) {
        throw new Error("No contractor selected");
      }

      const newQuoteRequest = await ContractorSearchService.requestQuote(
        selectedContractor.id,
        listingId!,
        {
          ...quoteData,
          userId: user?.id,
          projectDescription: searchCriteria.projectDescription,
          projectType: searchCriteria.projectType,
          budgetRange: searchCriteria.budgetRange,
          timeframe: searchCriteria.timeframe,
        },
      );

      setQuoteRequest(newQuoteRequest);

      // Stay on current step to show success screen
    } catch (error) {
      console.error("Error requesting quote:", error);
      setError("Failed to request quote. Please try again.");
    }
  };

  // Calculate progress
  const progressPercentage =
    ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  if (isLoading) {
    return (
      <ModernDashboardLayout
        title="Contractor Search"
        subtitle="Loading contractor search wizard..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModernDashboardLayout
        title="Contractor Search"
        subtitle="Error loading contractor search wizard"
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-400">{error}</p>
          <Button
            variant="glass"
            onClick={() => navigate(`/listings/${listingId}`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            className="mt-4"
          >
            Back to Listing
          </Button>
        </div>
      </ModernDashboardLayout>
    );
  }

  const currentStep = WIZARD_STEPS[currentStepIndex];

  return (
    <ModernDashboardLayout
      title="Contractor Search"
      subtitle={`Finding qualified contractors for ${listing?.address}`}
    >
      {/* Progress Bar and Steps */}
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          {/* Overall Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">
                Search Progress
              </h3>
            </div>
            <span className="text-sm font-semibold text-orange-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
                  onClick={() => isClickable && handleStepClick(index)}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? "bg-orange-500 text-white ring-4 ring-orange-400/30" : ""}
                    ${isCompleted ? "bg-emerald-500 text-white" : ""}
                    ${!isActive && !isCompleted ? "bg-slate-700 text-slate-400" : ""}
                  `}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`
                    mt-2 text-xs text-center
                    ${isActive ? "text-orange-400 font-semibold" : ""}
                    ${isCompleted ? "text-emerald-400" : ""}
                    ${!isActive && !isCompleted ? "text-slate-500" : ""}
                  `}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-semibold mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-300 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentStep.title}
          </h2>

          {/* Render step component */}
          {currentStep.id === "scope" && listing && (
            <ContractorProjectScopeStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "location" && listing && (
            <ContractorLocationTimelineStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "requirements" && listing && (
            <ContractorRequirementsStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "results" && listing && (
            <ContractorResultsStep
              listing={listing}
              searchCriteria={searchCriteria}
              searchResults={searchResults}
              isSearching={isSearching}
              selectedContractors={selectedContractors}
              onUpdate={updateSearchCriteria}
              onSearch={performSearch}
              onSelect={setSelectedContractors}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "selection" && listing && (
            <ContractorSelectionStep
              listing={listing}
              searchResults={searchResults}
              selectedContractors={selectedContractors}
              selectedContractor={selectedContractor}
              onSelect={handleContractorSelection}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "booking" && listing && selectedContractor && (
            <ContractorBookingStep
              listing={listing}
              contractor={selectedContractor}
              quoteRequest={quoteRequest}
              searchCriteria={searchCriteria}
              onRequest={handleQuoteRequest}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default ContractorSearchWizard;
