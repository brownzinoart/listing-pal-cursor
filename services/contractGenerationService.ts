import { 
  Contract, 
  ContractTemplate, 
  ContractSection,
  ContractClause,
  ContractProperty,
  ContractFinancials,
  ContractDates,
  ContractParty,
  Listing
} from '../types';

export class ContractGenerationService {
  // North Carolina Offer to Purchase and Contract template
  private static ncPurchaseTemplate: ContractTemplate = {
    id: 'nc-purchase-2024',
    state: 'NC',
    name: 'North Carolina Offer to Purchase and Contract',
    version: '2024.1',
    effectiveDate: '2024-01-01',
    requiredAddenda: [],
    sections: [
      {
        id: 'property-info',
        title: 'Property Information',
        order: 1,
        required: true,
        content: 'Property Address: {{property.address}}, {{property.city}}, {{property.state}} {{property.zipCode}}\nCounty: {{property.county}}\nLegal Description: {{property.legalDescription}}\nParcel ID: {{property.parcelId}}',
        editableFields: ['property.legalDescription', 'property.parcelId']
      },
      {
        id: 'purchase-price',
        title: 'Purchase Price and Terms',
        order: 2,
        required: true,
        content: 'Purchase Price: ${{financials.purchasePrice}}\nEarnest Money Deposit: ${{financials.earnestMoneyDeposit}}\nEarnest Money to be deposited within {{earnestMoneyDays}} days of Effective Date\nEscrow Agent: {{financials.earnestMoneyHolder}}',
        editableFields: ['financials.purchasePrice', 'financials.earnestMoneyDeposit', 'financials.earnestMoneyHolder']
      },
      {
        id: 'dates',
        title: 'Important Dates',
        order: 3,
        required: true,
        content: 'Effective Date: {{dates.offerDate}}\nDue Diligence Period Ends: {{dates.dueDiligenceDeadline}} at 5:00 PM\nClosing Date: {{dates.closingDate}}\nPossession Date/Time: {{dates.possessionDate}} at {{dates.possessionTime}}',
        editableFields: ['dates.dueDiligenceDeadline', 'dates.closingDate', 'dates.possessionDate', 'dates.possessionTime']
      },
      {
        id: 'due-diligence',
        title: 'Due Diligence (NC Specific)',
        order: 4,
        required: true,
        content: 'During the Due Diligence Period, Buyer shall have the right to terminate this Contract for any reason or no reason by providing written notice to Seller prior to the expiration of the Due Diligence Period. If Buyer terminates during Due Diligence, the Earnest Money Deposit shall be refunded to Buyer.',
        editableFields: []
      }
    ],
    standardClauses: [
      {
        id: 'nc-closing-costs',
        title: 'Closing Costs',
        category: 'financial',
        content: 'Seller shall pay for deed preparation, excise tax (revenue stamps), and their attorney fees. Buyer shall pay for deed recording, their loan costs, and their attorney fees.',
        isStandard: true,
        stateSpecific: ['NC']
      },
      {
        id: 'nc-attorney-requirement',
        title: 'Attorney Requirement',
        category: 'legal',
        content: 'North Carolina law requires that an attorney licensed in North Carolina must oversee the closing of all real estate transactions.',
        isStandard: true,
        stateSpecific: ['NC']
      },
      {
        id: 'nc-mineral-rights',
        title: 'Mineral and Oil/Gas Rights',
        category: 'property',
        content: 'Seller makes no representation as to the ownership of any mineral and oil/gas rights. Any mineral and oil/gas rights owned by Seller, if any, shall be conveyed to Buyer at Closing unless otherwise stated herein.',
        isStandard: true,
        stateSpecific: ['NC']
      }
    ]
  };

  // Generate a complete contract from wizard data
  static async generateContract(contractData: Partial<Contract>): Promise<Contract> {
    const template = this.getTemplateByStateAndType(
      contractData.state || 'NC',
      contractData.contractType || 'purchase'
    );

    // Generate unique ID
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build the contract
    const contract: Contract = {
      id: contractId,
      userId: contractData.userId!,
      listingId: contractData.listingId,
      templateId: template.id,
      state: contractData.state || 'NC',
      status: 'draft',
      contractType: contractData.contractType || 'purchase',
      buyers: contractData.buyers || [],
      sellers: contractData.sellers || [],
      listingAgent: contractData.listingAgent,
      sellingAgent: contractData.sellingAgent,
      buyerAttorney: contractData.buyerAttorney,
      sellerAttorney: contractData.sellerAttorney,
      financials: contractData.financials!,
      dates: contractData.dates!,
      property: contractData.property!,
      contingencies: contractData.contingencies || [],
      specialStipulations: contractData.specialStipulations || [],
      additionalTerms: contractData.additionalTerms,
      addenda: contractData.addenda || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    return contract;
  }

  // Get template by state and type
  private static getTemplateByStateAndType(state: string, contractType: string): ContractTemplate {
    // For now, return NC purchase template
    // In the future, this would query a database of templates
    if (state === 'NC' && contractType === 'purchase') {
      return this.ncPurchaseTemplate;
    }
    
    // Default fallback
    return this.ncPurchaseTemplate;
  }

  // Format contract data for display/PDF generation
  static formatContractForDisplay(contract: Contract, template: ContractTemplate): string {
    let formattedContent = `
# ${template.name}

**Contract ID:** ${contract.id}  
**Date Created:** ${new Date(contract.createdAt).toLocaleDateString()}  
**Status:** ${contract.status.toUpperCase()}

---

## PARTIES TO THE CONTRACT

### BUYER(S):
${contract.buyers.map(buyer => 
  `${buyer.firstName} ${buyer.lastName}  
  ${buyer.address ? `${buyer.address}, ${buyer.city}, ${buyer.state} ${buyer.zipCode}` : ''}  
  ${buyer.email ? `Email: ${buyer.email}` : ''}  
  ${buyer.phone ? `Phone: ${buyer.phone}` : ''}`
).join('\n\n')}

### SELLER(S):
${contract.sellers.map(seller => 
  `${seller.firstName} ${seller.lastName}  
  ${seller.address ? `${seller.address}, ${seller.city}, ${seller.state} ${seller.zipCode}` : ''}  
  ${seller.email ? `Email: ${seller.email}` : ''}  
  ${seller.phone ? `Phone: ${seller.phone}` : ''}`
).join('\n\n')}

### REAL ESTATE AGENTS:
${contract.listingAgent ? `**Listing Agent:** ${contract.listingAgent.firstName} ${contract.listingAgent.lastName} (${contract.listingAgent.brokerage})  
License #: ${contract.listingAgent.licenseNumber}` : 'N/A'}

${contract.sellingAgent ? `**Selling Agent:** ${contract.sellingAgent.firstName} ${contract.sellingAgent.lastName} (${contract.sellingAgent.brokerage})  
License #: ${contract.sellingAgent.licenseNumber}` : 'N/A'}

### ATTORNEYS:
${contract.buyerAttorney ? `**Buyer's Attorney:** ${contract.buyerAttorney.firstName} ${contract.buyerAttorney.lastName}  
Firm: ${contract.buyerAttorney.firm}  
Bar #: ${contract.buyerAttorney.barNumber}` : `**Buyer's Attorney:** To be determined`}

${contract.sellerAttorney ? `**Seller's Attorney:** ${contract.sellerAttorney.firstName} ${contract.sellerAttorney.lastName}  
Firm: ${contract.sellerAttorney.firm}  
Bar #: ${contract.sellerAttorney.barNumber}` : `**Seller's Attorney:** To be determined`}

---

## PROPERTY INFORMATION

**Address:** ${contract.property.address}  
**City:** ${contract.property.city}  
**State:** ${contract.property.state}  
**ZIP:** ${contract.property.zipCode}  
**County:** ${contract.property.county}  
${contract.property.legalDescription ? `**Legal Description:** ${contract.property.legalDescription}` : ''}  
${contract.property.parcelId ? `**Parcel ID:** ${contract.property.parcelId}` : ''}

---

## PURCHASE PRICE AND PAYMENT TERMS

**Purchase Price:** $${contract.financials.purchasePrice.toLocaleString()}  
**Earnest Money Deposit:** $${contract.financials.earnestMoneyDeposit.toLocaleString()}  
**Earnest Money Due:** ${contract.financials.earnestMoneyDueDate || 'Within 5 days of Effective Date'}  
**Escrow Agent:** ${contract.financials.earnestMoneyHolder || 'TBD'}  

**Financing Type:** ${contract.financials.financingType.toUpperCase()}  
${contract.financials.loanAmount ? `**Loan Amount:** $${contract.financials.loanAmount.toLocaleString()}` : ''}  
${contract.financials.downPaymentAmount ? `**Down Payment:** $${contract.financials.downPaymentAmount.toLocaleString()} (${contract.financials.downPaymentPercentage}%)` : ''}

**Closing Costs:** Paid by ${contract.financials.closingCostsPaidBy}  
${contract.financials.sellerContribution ? `**Seller Contribution:** $${contract.financials.sellerContribution.toLocaleString()}` : ''}

---

## IMPORTANT DATES

**Offer Date:** ${new Date(contract.dates.offerDate).toLocaleDateString()}  
**Offer Expiration:** ${new Date(contract.dates.offerExpirationDate).toLocaleDateString()} at 5:00 PM  
${contract.dates.dueDiligenceDeadline ? `**Due Diligence Deadline:** ${new Date(contract.dates.dueDiligenceDeadline).toLocaleDateString()} at 5:00 PM` : ''}  
**Closing Date:** ${new Date(contract.dates.closingDate).toLocaleDateString()}  
**Possession:** ${new Date(contract.dates.possessionDate).toLocaleDateString()} at ${contract.dates.possessionTime || '6:00 PM'}

---

## CONTINGENCIES

${contract.contingencies.filter(c => c.included).map(contingency => {
  let content = `### ${contingency.type.toUpperCase()} CONTINGENCY\n`;
  content += `**Deadline:** ${contingency.deadline ? new Date(contingency.deadline).toLocaleDateString() : 'N/A'}\n`;
  if (contingency.details) content += `**Details:** ${contingency.details}\n`;
  return content;
}).join('\n')}

---

## PROPERTY CONDITION

**Condition:** ${contract.property.propertyCondition}  
**Lead Paint Disclosure (pre-1978):** ${contract.property.leadPaintDisclosure ? 'Required and Provided' : 'N/A'}  
**Property Disclosure:** ${contract.property.propertyDisclosureProvided ? 'Provided' : 'To be provided'}  
**Mineral Rights:** ${contract.property.mineralRightsIncluded ? 'Included' : 'Not included/Unknown'}

### Included Items:
${contract.property.includedItems.length > 0 ? contract.property.includedItems.join(', ') : 'See standard inclusions'}

### Excluded Items:
${contract.property.excludedItems.length > 0 ? contract.property.excludedItems.join(', ') : 'None'}

---

## ADDITIONAL TERMS AND CONDITIONS

${contract.specialStipulations && contract.specialStipulations.length > 0 ? 
  contract.specialStipulations.map((stip, i) => `${i + 1}. ${stip}`).join('\n') : 
  'No additional terms'}

${contract.additionalTerms ? `\n### Other Terms:\n${contract.additionalTerms}` : ''}

---

## ADDENDA

${contract.addenda.filter(a => a.included).map(addendum => 
  `- ${addendum.type.toUpperCase()} ADDENDUM${addendum.details ? `: ${addendum.details}` : ''}`
).join('\n')}

---

## NORTH CAROLINA SPECIFIC PROVISIONS

1. **Attorney Requirement:** North Carolina law requires that an attorney licensed in North Carolina must oversee the closing of all real estate transactions.

2. **Due Diligence Period:** During the Due Diligence Period, Buyer has the unilateral right to terminate this Contract for any reason or no reason.

3. **Closing Costs:** Unless otherwise negotiated, Seller typically pays for deed preparation, excise tax (revenue stamps), and their attorney fees. Buyer typically pays for deed recording, loan costs, and their attorney fees.

---

## SIGNATURES

**This is a legally binding contract. If not understood, seek legal advice before signing.**

_________________________________  
Buyer Signature & Date

_________________________________  
Buyer Signature & Date

_________________________________  
Seller Signature & Date

_________________________________  
Seller Signature & Date
`;

    return formattedContent;
  }

  // Validate contract data
  static validateContract(contract: Partial<Contract>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!contract.buyers || contract.buyers.length === 0) {
      errors.push('At least one buyer is required');
    }
    
    if (!contract.sellers || contract.sellers.length === 0) {
      errors.push('At least one seller is required');
    }

    if (!contract.property?.address) {
      errors.push('Property address is required');
    }

    if (!contract.financials?.purchasePrice) {
      errors.push('Purchase price is required');
    }

    if (!contract.financials?.earnestMoneyDeposit) {
      errors.push('Earnest money deposit amount is required');
    }

    if (!contract.dates?.closingDate) {
      errors.push('Closing date is required');
    }

    // North Carolina specific validations
    if (contract.state === 'NC') {
      if (!contract.buyerAttorney && contract.status !== 'draft') {
        errors.push('Buyer attorney is required for North Carolina contracts');
      }
      
      if (!contract.dates?.dueDiligenceDeadline) {
        errors.push('Due diligence deadline is required for North Carolina contracts');
      }
    }

    // Date validations
    if (contract.dates) {
      const today = new Date();
      const closingDate = new Date(contract.dates.closingDate);
      
      if (closingDate < today) {
        errors.push('Closing date cannot be in the past');
      }

      if (contract.dates.dueDiligenceDeadline) {
        const dueDiligenceDate = new Date(contract.dates.dueDiligenceDeadline);
        if (dueDiligenceDate > closingDate) {
          errors.push('Due diligence deadline must be before closing date');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate important dates based on offer date
  static calculateDates(offerDate: Date, closingDays: number = 30): ContractDates {
    const dates: ContractDates = {
      offerDate: offerDate.toISOString(),
      offerExpirationDate: new Date(offerDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      dueDiligenceDeadline: new Date(offerDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days for NC
      closingDate: new Date(offerDate.getTime() + closingDays * 24 * 60 * 60 * 1000).toISOString(),
      possessionDate: new Date(offerDate.getTime() + closingDays * 24 * 60 * 60 * 1000).toISOString(),
      possessionTime: '6:00 PM',
      // Standard contingency deadlines
      inspectionDeadline: new Date(offerDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      financingDeadline: new Date(offerDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      appraisalDeadline: new Date(offerDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return dates;
  }

  // Create contract from listing
  static createContractFromListing(listing: Listing): Partial<Contract> {
    const property: ContractProperty = {
      listingId: listing.id,
      address: listing.address,
      city: listing.city || '',
      state: listing.state || 'NC',
      zipCode: listing.zipCode || '',
      county: '', // To be filled
      includedItems: [
        'All fixtures',
        'Window treatments',
        'Installed appliances',
        'Light fixtures',
        'Ceiling fans'
      ],
      excludedItems: [],
      propertyCondition: 'inspection-repairs',
      leadPaintDisclosure: listing.yearBuilt < 1978,
      propertyDisclosureProvided: false,
      mineralRightsIncluded: true // Default for NC
    };

    const financials: Partial<ContractFinancials> = {
      purchasePrice: listing.price,
      earnestMoneyDeposit: Math.round(listing.price * 0.01), // 1% default
      closingCostsPaidBy: 'split',
      financingType: 'conventional'
    };

    return {
      state: 'NC',
      contractType: 'purchase',
      property,
      financials: financials as ContractFinancials,
      dates: this.calculateDates(new Date()),
      contingencies: [
        {
          type: 'inspection',
          included: true,
          inspectionTypes: ['general', 'pest'],
          repairLimit: 1500
        },
        {
          type: 'financing',
          included: true,
          loanType: 'conventional'
        },
        {
          type: 'appraisal',
          included: true
        }
      ],
      addenda: []
    };
  }
}