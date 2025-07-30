import React, { useState, useEffect } from "react";
import { Contract, ContractProperty, Listing } from "../../../types";
import Button from "../../shared/Button";
import {
  HomeIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface ContractPropertyStepProps {
  listing: Listing;
  contractData: Partial<Contract>;
  onUpdate: (updates: Partial<Contract>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ContractPropertyStep: React.FC<ContractPropertyStepProps> = ({
  listing,
  contractData,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const [property, setProperty] = useState<ContractProperty>(
    contractData.property || {
      listingId: listing.id,
      address: listing.address,
      city: listing.city || "",
      state: listing.state || "NC",
      zipCode: listing.zipCode || "",
      county: listing.county || "",
      legalDescription: "",
      parcelId: "",
      includedItems: [
        "All existing fixtures and fittings",
        "Built-in appliances",
        "Window treatments",
        "Ceiling fans",
        "Light fixtures",
      ],
      excludedItems: [],
      propertyCondition: "inspection-repairs",
      knownDefects: [],
      leadPaintDisclosure: false,
      propertyDisclosureProvided: false,
      mineralRightsIncluded: true,
    },
  );

  const [newIncludedItem, setNewIncludedItem] = useState("");
  const [newExcludedItem, setNewExcludedItem] = useState("");
  const [newDefect, setNewDefect] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Standard included items for quick selection
  const standardIncludedItems = [
    "All existing fixtures and fittings",
    "Built-in appliances",
    "Window treatments",
    "Ceiling fans",
    "Light fixtures",
    "Garage door openers and remotes",
    "Security system equipment",
    "Irrigation system",
    "Storage sheds",
    "Mailbox",
  ];

  // Common excluded items
  const commonExcludedItems = [
    "Personal property",
    "Refrigerator",
    "Washer and dryer",
    "Hot tub/spa",
    "Outdoor furniture",
    "Decorative items",
    "Plants and landscaping features",
  ];

  // Update contract data whenever property changes
  useEffect(() => {
    onUpdate({ property });
  }, [property]);

  // Validate property data
  useEffect(() => {
    const errors: string[] = [];

    if (!property.address.trim()) {
      errors.push("Property address is required");
    }
    if (!property.city.trim()) {
      errors.push("City is required");
    }
    if (!property.county.trim()) {
      errors.push("County is required for NC contracts");
    }

    setValidationErrors(errors);
  }, [property]);

  const updateProperty = (field: keyof ContractProperty, value: any) => {
    setProperty((prev) => ({ ...prev, [field]: value }));
  };

  const addIncludedItem = (item: string) => {
    if (item.trim() && !property.includedItems.includes(item.trim())) {
      updateProperty("includedItems", [...property.includedItems, item.trim()]);
      setNewIncludedItem("");
    }
  };

  const removeIncludedItem = (index: number) => {
    updateProperty(
      "includedItems",
      property.includedItems.filter((_, i) => i !== index),
    );
  };

  const addExcludedItem = (item: string) => {
    if (item.trim() && !property.excludedItems.includes(item.trim())) {
      updateProperty("excludedItems", [...property.excludedItems, item.trim()]);
      setNewExcludedItem("");
    }
  };

  const removeExcludedItem = (index: number) => {
    updateProperty(
      "excludedItems",
      property.excludedItems.filter((_, i) => i !== index),
    );
  };

  const addKnownDefect = () => {
    if (
      newDefect.trim() &&
      !property.knownDefects?.includes(newDefect.trim())
    ) {
      updateProperty("knownDefects", [
        ...(property.knownDefects || []),
        newDefect.trim(),
      ]);
      setNewDefect("");
    }
  };

  const removeKnownDefect = (index: number) => {
    updateProperty(
      "knownDefects",
      property.knownDefects?.filter((_, i) => i !== index) || [],
    );
  };

  const FieldLabel: React.FC<{
    children: React.ReactNode;
    required?: boolean;
    recommended?: boolean;
    ncSpecific?: boolean;
  }> = ({ children, required, recommended, ncSpecific }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
      {children}
      {required && (
        <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded-full">
          Required
        </span>
      )}
      {recommended && (
        <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">
          Recommended
        </span>
      )}
      {ncSpecific && (
        <span className="text-amber-400 text-xs bg-amber-500/20 px-2 py-1 rounded-full">
          NC Required
        </span>
      )}
    </label>
  );

  return (
    <div className="space-y-8">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-semibold mb-2">
                Property Information Issues:
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

      {/* Property Information */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <HomeIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Property Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FieldLabel required>Property Address</FieldLabel>
            <input
              type="text"
              value={property.address}
              onChange={(e) => updateProperty("address", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Street address"
              required
            />
          </div>

          <div>
            <FieldLabel required>City</FieldLabel>
            <input
              type="text"
              value={property.city}
              onChange={(e) => updateProperty("city", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="City"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel required>State</FieldLabel>
              <select
                value={property.state}
                onChange={(e) => updateProperty("state", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="NC">NC</option>
                <option value="SC">SC</option>
                <option value="VA">VA</option>
                <option value="GA">GA</option>
              </select>
            </div>

            <div>
              <FieldLabel required>ZIP Code</FieldLabel>
              <input
                type="text"
                value={property.zipCode}
                onChange={(e) => updateProperty("zipCode", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="12345"
                required
              />
            </div>
          </div>

          <div>
            <FieldLabel ncSpecific>County</FieldLabel>
            <input
              type="text"
              value={property.county}
              onChange={(e) => updateProperty("county", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Wake County"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Required for NC property records
            </p>
          </div>

          <div>
            <FieldLabel recommended>Parcel ID</FieldLabel>
            <input
              type="text"
              value={property.parcelId || ""}
              onChange={(e) => updateProperty("parcelId", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Tax parcel identification number"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel recommended>Legal Description</FieldLabel>
            <textarea
              value={property.legalDescription || ""}
              onChange={(e) =>
                updateProperty("legalDescription", e.target.value)
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Legal description from deed or survey"
              rows={3}
            />
            <p className="text-xs text-slate-400 mt-1">
              Detailed legal description helps ensure accurate property
              identification
            </p>
          </div>
        </div>
      </div>

      {/* Property Condition */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Property Condition
        </h3>

        <div className="space-y-6">
          <div>
            <FieldLabel required>Property Sold</FieldLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  value: "as-is",
                  label: "As-Is",
                  desc: "Buyer accepts current condition",
                },
                {
                  value: "inspection-repairs",
                  label: "Subject to Inspections",
                  desc: "Seller may make agreed repairs",
                },
                {
                  value: "seller-representations",
                  label: "With Warranties",
                  desc: "Seller warrants condition",
                },
              ].map((condition) => (
                <button
                  key={condition.value}
                  onClick={() =>
                    updateProperty("propertyCondition", condition.value)
                  }
                  className={`
                    p-4 rounded-lg border text-left transition-all duration-200
                    ${
                      property.propertyCondition === condition.value
                        ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="font-semibold">{condition.label}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {condition.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Known Defects - Show if not as-is */}
          {property.propertyCondition !== "as-is" && (
            <div>
              <FieldLabel recommended>Known Defects or Issues</FieldLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDefect}
                    onChange={(e) => setNewDefect(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe any known defects or issues"
                    onKeyPress={(e) => e.key === "Enter" && addKnownDefect()}
                  />
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={addKnownDefect}
                    disabled={!newDefect.trim()}
                  >
                    Add
                  </Button>
                </div>

                {property.knownDefects && property.knownDefects.length > 0 && (
                  <div className="space-y-2">
                    {property.knownDefects.map((defect, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                      >
                        <span className="text-white text-sm">{defect}</span>
                        <button
                          onClick={() => removeKnownDefect(index)}
                          className="p-1 rounded text-slate-400 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Included Items */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-emerald-400" />
          Items Included in Sale
        </h3>

        <div className="space-y-4">
          {/* Quick add standard items */}
          <div>
            <h4 className="text-white font-medium mb-3">
              Standard Items (click to add)
            </h4>
            <div className="flex flex-wrap gap-2">
              {standardIncludedItems
                .filter((item) => !property.includedItems.includes(item))
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addIncludedItem(item)}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-full text-emerald-300 text-sm transition-colors"
                  >
                    + {item}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom item input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newIncludedItem}
              onChange={(e) => setNewIncludedItem(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Add custom item to be included"
              onKeyPress={(e) =>
                e.key === "Enter" && addIncludedItem(newIncludedItem)
              }
            />
            <Button
              variant="glass"
              size="sm"
              onClick={() => addIncludedItem(newIncludedItem)}
              disabled={!newIncludedItem.trim()}
            >
              Add
            </Button>
          </div>

          {/* Included items list */}
          <div className="space-y-2">
            {property.includedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
              >
                <span className="text-emerald-300 text-sm">✓ {item}</span>
                <button
                  onClick={() => removeIncludedItem(index)}
                  className="p-1 rounded text-slate-400 hover:text-red-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Excluded Items */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Items Excluded from Sale
        </h3>

        <div className="space-y-4">
          {/* Quick add common exclusions */}
          <div>
            <h4 className="text-white font-medium mb-3">
              Common Exclusions (click to add)
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonExcludedItems
                .filter((item) => !property.excludedItems.includes(item))
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addExcludedItem(item)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full text-red-300 text-sm transition-colors"
                  >
                    + {item}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom exclusion input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newExcludedItem}
              onChange={(e) => setNewExcludedItem(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Add item to be excluded from sale"
              onKeyPress={(e) =>
                e.key === "Enter" && addExcludedItem(newExcludedItem)
              }
            />
            <Button
              variant="glass"
              size="sm"
              onClick={() => addExcludedItem(newExcludedItem)}
              disabled={!newExcludedItem.trim()}
            >
              Add
            </Button>
          </div>

          {/* Excluded items list */}
          {property.excludedItems.length > 0 && (
            <div className="space-y-2">
              {property.excludedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  <span className="text-red-300 text-sm">✗ {item}</span>
                  <button
                    onClick={() => removeExcludedItem(index)}
                    className="p-1 rounded text-slate-400 hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NC Specific Disclosures */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <h4 className="text-amber-400 font-semibold mb-4 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          North Carolina Required Disclosures
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Lead Paint Disclosure</p>
              <p className="text-amber-300 text-sm">
                Required for homes built before 1978
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={property.leadPaintDisclosure || false}
                onChange={(e) =>
                  updateProperty("leadPaintDisclosure", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Property Disclosure Statement
              </p>
              <p className="text-amber-300 text-sm">
                NC residential property disclosure
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={property.propertyDisclosureProvided || false}
                onChange={(e) =>
                  updateProperty("propertyDisclosureProvided", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Mineral Rights Included</p>
              <p className="text-amber-300 text-sm">
                Transfer of subsurface mineral rights
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={property.mineralRightsIncluded || false}
                onChange={(e) =>
                  updateProperty("mineralRightsIncluded", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <Button
          variant="glass"
          onClick={onPrevious}
          leftIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          }
        >
          Previous
        </Button>

        <Button
          variant="gradient"
          onClick={onNext}
          disabled={validationErrors.length > 0}
          rightIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          }
        >
          Continue to Contingencies
        </Button>
      </div>
    </div>
  );
};

export default ContractPropertyStep;
