import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as listingService from "../../../services/listingService";
import { ContractGenerationService } from "../../../services/contractGenerationService";
import {
  Contract,
  Listing,
  ContractParty,
  ContractFinancials,
  ContractDates,
  ContractProperty,
  ContractContingency,
  ContractAddendum,
} from "../../../types";
import ModernDashboardLayout from "../../shared/ModernDashboardLayout";
import Button from "../../shared/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Import step components
import ContractBasicInfoStep from "./ContractBasicInfoStep";
import ContractPartiesStep from "./ContractPartiesStep";
import ContractFinancialStep from "./ContractFinancialStep";
import ContractDatesStep from "./ContractDatesStep";
import ContractPropertyStep from "./ContractPropertyStep";
import ContractContingenciesStep from "./ContractContingenciesStep";
import ContractAdditionalTermsStep from "./ContractAdditionalTermsStep";
import ContractReviewStep from "./ContractReviewStep";

// Define the steps
const WIZARD_STEPS = [
  {
    id: "basic",
    title: "Basic Information",
    component: "ContractBasicInfoStep",
  },
  { id: "parties", title: "Parties", component: "ContractPartiesStep" },
  {
    id: "financial",
    title: "Financial Terms",
    component: "ContractFinancialStep",
  },
  { id: "dates", title: "Dates & Deadlines", component: "ContractDatesStep" },
  {
    id: "property",
    title: "Property Details",
    component: "ContractPropertyStep",
  },
  {
    id: "contingencies",
    title: "Contingencies",
    component: "ContractContingenciesStep",
  },
  {
    id: "additional",
    title: "Additional Terms",
    component: "ContractAdditionalTermsStep",
  },
  { id: "review", title: "Review & Generate", component: "ContractReviewStep" },
];

const ContractWizard: React.FC = () => {
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

  // Contract data state
  const [contractData, setContractData] = useState<Partial<Contract>>({
    userId: user?.id,
    listingId: listingId,
    state: "NC",
    contractType: "purchase",
    status: "draft",
    buyers: [],
    sellers: [],
    financials: {
      purchasePrice: 0,
      earnestMoneyDeposit: 0,
      closingCostsPaidBy: "split",
      financingType: "conventional",
    } as ContractFinancials,
    dates: {} as ContractDates,
    property: {} as ContractProperty,
    contingencies: [],
    addenda: [],
    specialStipulations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  });

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

          // Initialize contract data from listing
          const initialData =
            ContractGenerationService.createContractFromListing(data);
          setContractData((prev) => ({
            ...prev,
            ...initialData,
            userId: user?.id,
            listingId: listingId,
          }));
        } else {
          setError(
            data
              ? "You don't have permission to create a contract for this listing."
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
        navigate(`/listings/${listingId}/contract/${WIZARD_STEPS[0].id}`, {
          replace: true,
        });
      }
    }
  }, [stepId, listingId, navigate]);

  // Navigation helpers
  const navigateToStep = (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex];
    navigate(`/listings/${listingId}/contract/${step.id}`);
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
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

  const handleJumpToStep = (stepId: string) => {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId);
    if (index !== -1 && index <= currentStepIndex) {
      setValidationErrors([]);
      navigateToStep(index);
    }
  };

  // Validation logic for each step
  const validateCurrentStep = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const step = WIZARD_STEPS[currentStepIndex];

    switch (step.id) {
      case "basic":
        // Basic info validation
        if (!contractData.state) errors.push("State is required");
        if (!contractData.contractType)
          errors.push("Contract type is required");
        break;

      case "parties":
        // Parties validation
        if (!contractData.buyers || contractData.buyers.length === 0) {
          errors.push("At least one buyer is required");
        }
        if (!contractData.sellers || contractData.sellers.length === 0) {
          errors.push("At least one seller is required");
        }
        // NC requires attorney info
        if (contractData.state === "NC" && !contractData.buyerAttorney) {
          errors.push(
            "Buyer attorney information is required for North Carolina contracts",
          );
        }
        break;

      case "financial":
        // Financial validation
        if (
          !contractData.financials?.purchasePrice ||
          contractData.financials.purchasePrice <= 0
        ) {
          errors.push("Purchase price must be greater than 0");
        }
        if (
          !contractData.financials?.earnestMoneyDeposit ||
          contractData.financials.earnestMoneyDeposit <= 0
        ) {
          errors.push("Earnest money deposit must be greater than 0");
        }
        break;

      case "dates":
        // Dates validation
        if (!contractData.dates?.closingDate) {
          errors.push("Closing date is required");
        }
        if (
          contractData.state === "NC" &&
          !contractData.dates?.dueDiligenceDeadline
        ) {
          errors.push(
            "Due diligence deadline is required for North Carolina contracts",
          );
        }
        break;

      case "property":
        // Property validation
        if (!contractData.property?.address) {
          errors.push("Property address is required");
        }
        if (!contractData.property?.city) {
          errors.push("Property city is required");
        }
        if (!contractData.property?.county) {
          errors.push("Property county is required for NC contracts");
        }
        break;

      case "contingencies":
        // Contingencies validation - all included contingencies should have deadlines
        const includedContingencies =
          contractData.contingencies?.filter((c) => c.included) || [];
        includedContingencies.forEach((contingency, index) => {
          if (contingency.type === "sale" && !contingency.propertyAddress) {
            errors.push(
              `Sale contingency ${index + 1} requires property address`,
            );
          }
        });
        break;

      case "additional":
        // Additional terms validation - mostly optional, but validate addenda if included
        const includedAddenda =
          contractData.addenda?.filter((a) => a.included) || [];
        includedAddenda.forEach((addendum, index) => {
          if (addendum.type === "custom" && !addendum.details?.trim()) {
            errors.push(`Custom addendum ${index + 1} requires details`);
          }
        });
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Update contract data
  const updateContractData = (updates: Partial<Contract>) => {
    setContractData((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Generate final contract
  const handleGenerateContract = async () => {
    try {
      // Final validation
      const validation =
        ContractGenerationService.validateContract(contractData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Generate the contract
      const finalContract =
        await ContractGenerationService.generateContract(contractData);

      // Navigate to a success page or download the contract
      console.log("Contract generated:", finalContract);

      // TODO: Save contract to backend and generate PDF
    } catch (error) {
      console.error("Error generating contract:", error);
      setError("Failed to generate contract. Please try again.");
    }
  };

  // Calculate progress
  const progressPercentage =
    ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  if (isLoading) {
    return (
      <ModernDashboardLayout
        title="Contract Wizard"
        subtitle="Loading contract wizard..."
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
        title="Contract Wizard"
        subtitle="Error loading contract wizard"
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
      title="Contract Wizard"
      subtitle={`Creating purchase contract for ${listing?.address}`}
    >
      {/* Progress Bar and Steps */}
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          {/* Overall Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <DocumentCheckIcon className="h-6 w-6 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">
                Contract Progress
              </h3>
            </div>
            <span className="text-sm font-semibold text-amber-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
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
                    ${isActive ? "bg-amber-500 text-white ring-4 ring-amber-400/30" : ""}
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
                    ${isActive ? "text-amber-400 font-semibold" : ""}
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
          {currentStep.id === "basic" && listing && (
            <ContractBasicInfoStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "parties" && listing && (
            <ContractPartiesStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "financial" && listing && (
            <ContractFinancialStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "dates" && listing && (
            <ContractDatesStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "property" && listing && (
            <ContractPropertyStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "contingencies" && listing && (
            <ContractContingenciesStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "additional" && listing && (
            <ContractAdditionalTermsStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep.id === "review" && listing && (
            <ContractReviewStep
              listing={listing}
              contractData={contractData}
              onUpdate={updateContractData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onJumpToStep={handleJumpToStep}
            />
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default ContractWizard;
