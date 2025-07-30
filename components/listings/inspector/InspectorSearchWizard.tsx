import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as listingService from "../../../services/listingService";
import { InspectorSearchService } from "../../../services/inspectorSearchService";
import {
  InspectorSearchCriteria,
  ServiceSearchResult,
  ServiceAppointment,
  Listing,
  Inspector,
} from "../../../types";
import ModernDashboardLayout from "../../shared/ModernDashboardLayout";
import Button from "../../shared/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Import step components (will create these next)
import InspectorSearchCriteriaStep from "./InspectorSearchCriteriaStep";
import InspectorLocationStep from "./InspectorLocationStep";
import InspectorRequirementsStep from "./InspectorRequirementsStep";
import InspectorResultsStep from "./InspectorResultsStep";
import InspectorSelectionStep from "./InspectorSelectionStep";
import InspectorBookingStep from "./InspectorBookingStep";

// Define the wizard steps
const WIZARD_STEPS = [
  {
    id: "criteria",
    title: "Search Criteria",
    component: "InspectorSearchCriteriaStep",
  },
  {
    id: "location",
    title: "Location & Timing",
    component: "InspectorLocationStep",
  },
  {
    id: "requirements",
    title: "Requirements",
    component: "InspectorRequirementsStep",
  },
  { id: "results", title: "Search Results", component: "InspectorResultsStep" },
  {
    id: "selection",
    title: "Compare & Select",
    component: "InspectorSelectionStep",
  },
  {
    id: "booking",
    title: "Book Inspection",
    component: "InspectorBookingStep",
  },
];

const InspectorSearchWizard: React.FC = () => {
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
    Partial<InspectorSearchCriteria>
  >({
    serviceType: "inspector",
    listingId: listingId,
    urgency: "within-week",
    maxDistance: 25,
    inspectionTypes: ["general"],
    propertyType: "residential",
    verifiedOnly: true,
    insuredOnly: true,
  });

  const [searchResults, setSearchResults] = useState<ServiceSearchResult[]>([]);
  const [selectedInspectors, setSelectedInspectors] = useState<string[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(
    null,
  );
  const [appointment, setAppointment] = useState<ServiceAppointment | null>(
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
            InspectorSearchService.createSearchCriteriaFromListing(data);
          setSearchCriteria((prev) => ({
            ...prev,
            ...initialCriteria,
            listingId: listingId,
          }));
        } else {
          setError(
            data
              ? "You don't have permission to search inspectors for this listing."
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
        navigate(`/listings/${listingId}/inspector/${WIZARD_STEPS[0].id}`, {
          replace: true,
        });
      }
    }
  }, [stepId, listingId, navigate]);

  // Navigation helpers
  const navigateToStep = (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex];
    navigate(`/listings/${listingId}/inspector/${step.id}`);
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

  // Perform inspector search
  const performSearch = async () => {
    try {
      setIsSearching(true);
      const results = await InspectorSearchService.searchInspectors(
        searchCriteria as InspectorSearchCriteria,
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search for inspectors. Please try again.");
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
      case "criteria":
        if (
          !searchCriteria.inspectionTypes ||
          searchCriteria.inspectionTypes.length === 0
        ) {
          errors.push("At least one inspection type is required");
        }
        if (!searchCriteria.propertyType) {
          errors.push("Property type is required");
        }
        break;

      case "location":
        if (!searchCriteria.maxDistance || searchCriteria.maxDistance <= 0) {
          errors.push("Maximum distance must be greater than 0");
        }
        if (!searchCriteria.urgency) {
          errors.push("Urgency level is required");
        }
        break;

      case "requirements":
        // Requirements are mostly optional filters
        break;

      case "results":
        if (searchResults.length === 0) {
          errors.push(
            "No inspectors found. Please adjust your criteria and search again.",
          );
        }
        break;

      case "selection":
        if (!selectedInspector) {
          errors.push("Please select an inspector to proceed");
        }
        break;

      case "booking":
        if (!appointment) {
          errors.push("Please complete the booking process");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Update search criteria
  const updateSearchCriteria = (updates: Partial<InspectorSearchCriteria>) => {
    setSearchCriteria((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Handle inspector selection
  const handleInspectorSelection = async (inspectorId: string) => {
    try {
      const inspector =
        await InspectorSearchService.getInspectorById(inspectorId);
      if (inspector) {
        setSelectedInspector(inspector);
      }
    } catch (error) {
      console.error("Error selecting inspector:", error);
      setError("Failed to load inspector details.");
    }
  };

  // Handle appointment booking
  const handleAppointmentBooking = async (
    appointmentData: Partial<ServiceAppointment>,
  ) => {
    try {
      if (!selectedInspector) {
        throw new Error("No inspector selected");
      }

      const newAppointment = await InspectorSearchService.bookInspection(
        selectedInspector.id,
        listingId!,
        {
          ...appointmentData,
          userId: user?.id,
        },
      );

      setAppointment(newAppointment);

      // Auto-advance to completion or show success
      navigateToStep(currentStepIndex + 1);
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError("Failed to book inspection. Please try again.");
    }
  };

  // Calculate progress
  const progressPercentage =
    ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  if (isLoading) {
    return (
      <ModernDashboardLayout
        title="Inspector Search"
        subtitle="Loading inspector search wizard..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModernDashboardLayout
        title="Inspector Search"
        subtitle="Error loading inspector search wizard"
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
      title="Inspector Search"
      subtitle={`Finding certified inspectors for ${listing?.address}`}
    >
      {/* Progress Bar and Steps */}
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          {/* Overall Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Search Progress
              </h3>
            </div>
            <span className="text-sm font-semibold text-blue-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500"
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
                    ${isActive ? "bg-blue-500 text-white ring-4 ring-blue-400/30" : ""}
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
                    ${isActive ? "text-blue-400 font-semibold" : ""}
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
          {currentStep.id === "criteria" && listing && (
            <InspectorSearchCriteriaStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "location" && listing && (
            <InspectorLocationStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "requirements" && listing && (
            <InspectorRequirementsStep
              listing={listing}
              searchCriteria={searchCriteria}
              onUpdate={updateSearchCriteria}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "results" && listing && (
            <InspectorResultsStep
              listing={listing}
              searchCriteria={searchCriteria}
              searchResults={searchResults}
              isSearching={isSearching}
              selectedInspectors={selectedInspectors}
              onUpdate={updateSearchCriteria}
              onSearch={performSearch}
              onSelect={setSelectedInspectors}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "selection" && listing && (
            <InspectorSelectionStep
              listing={listing}
              searchResults={searchResults}
              selectedInspectors={selectedInspectors}
              selectedInspector={selectedInspector}
              onSelect={handleInspectorSelection}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "booking" && listing && selectedInspector && (
            <InspectorBookingStep
              listing={listing}
              inspector={selectedInspector}
              appointment={appointment}
              onBook={handleAppointmentBooking}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default InspectorSearchWizard;
