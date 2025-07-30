import { jsPDF } from 'jspdf';
import { Contract, Listing } from '../types';

export class ContractPDFService {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20; // Page margins in mm

  static async generateContractPDF(contract: Partial<Contract>, listing: Listing): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = this.MARGIN;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('NORTH CAROLINA OFFER TO PURCHASE AND CONTRACT', this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Standard Form 2-T', this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Property Information
      yPosition = this.addSection(pdf, 'PROPERTY INFORMATION', yPosition);
      pdf.text(`Property Address: ${contract.property?.address || listing.address}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`City: ${contract.property?.city || listing.city}, State: ${contract.property?.state || 'NC'}, ZIP: ${contract.property?.zipCode || listing.zipCode}`, this.MARGIN, yPosition);
      yPosition += 7;
      if (contract.property?.county) {
        pdf.text(`County: ${contract.property.county}`, this.MARGIN, yPosition);
        yPosition += 7;
      }
      if (contract.property?.legalDescription) {
        pdf.text(`Legal Description: ${contract.property.legalDescription}`, this.MARGIN, yPosition);
        yPosition += 7;
      }
      yPosition += 10;

      // Parties
      yPosition = this.addSection(pdf, 'PARTIES', yPosition);
      
      // Buyers
      pdf.setFont('helvetica', 'bold');
      pdf.text('BUYER(S):', this.MARGIN, yPosition);
      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      contract.buyers?.forEach((buyer, index) => {
        pdf.text(`${index + 1}. ${buyer.firstName} ${buyer.lastName}`, this.MARGIN + 5, yPosition);
        yPosition += 5;
        if (buyer.address) {
          pdf.text(`   ${buyer.address}, ${buyer.city}, ${buyer.state} ${buyer.zipCode}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        }
        if (buyer.email || buyer.phone) {
          pdf.text(`   Email: ${buyer.email || 'N/A'} | Phone: ${buyer.phone || 'N/A'}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      });

      // Sellers
      pdf.setFont('helvetica', 'bold');
      pdf.text('SELLER(S):', this.MARGIN, yPosition);
      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      contract.sellers?.forEach((seller, index) => {
        pdf.text(`${index + 1}. ${seller.firstName} ${seller.lastName}`, this.MARGIN + 5, yPosition);
        yPosition += 5;
        if (seller.address) {
          pdf.text(`   ${seller.address}, ${seller.city}, ${seller.state} ${seller.zipCode}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        }
        if (seller.email || seller.phone) {
          pdf.text(`   Email: ${seller.email || 'N/A'} | Phone: ${seller.phone || 'N/A'}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      });
      yPosition += 10;

      // Check if we need a new page
      if (yPosition > this.PAGE_HEIGHT - 50) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      // Financial Terms
      yPosition = this.addSection(pdf, 'PURCHASE PRICE AND FINANCING', yPosition);
      pdf.text(`Purchase Price: $${this.formatCurrency(contract.financials?.purchasePrice || 0)}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Earnest Money Deposit: $${this.formatCurrency(contract.financials?.earnestMoneyDeposit || 0)}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Financing Type: ${this.capitalizeFirst(contract.financials?.financingType || 'Not specified')}`, this.MARGIN, yPosition);
      yPosition += 7;
      
      if (contract.financials?.downPaymentAmount) {
        pdf.text(`Down Payment: $${this.formatCurrency(contract.financials.downPaymentAmount)} (${contract.financials.downPaymentPercentage?.toFixed(1)}%)`, this.MARGIN, yPosition);
        yPosition += 7;
      }
      
      if (contract.financials?.loanAmount) {
        pdf.text(`Loan Amount: $${this.formatCurrency(contract.financials.loanAmount)}`, this.MARGIN, yPosition);
        yPosition += 7;
      }
      yPosition += 10;

      // Important Dates
      yPosition = this.addSection(pdf, 'IMPORTANT DATES', yPosition);
      pdf.text(`Offer Date: ${this.formatDate(contract.dates?.offerDate)}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Offer Expiration: ${this.formatDate(contract.dates?.offerExpirationDate)}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Due Diligence Deadline: ${this.formatDate(contract.dates?.dueDiligenceDeadline)} at 5:00 PM`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Closing Date: ${this.formatDate(contract.dates?.closingDate)}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Possession Date: ${this.formatDate(contract.dates?.possessionDate)} at ${contract.dates?.possessionTime || '6:00 PM'}`, this.MARGIN, yPosition);
      yPosition += 10;

      // Check if we need a new page
      if (yPosition > this.PAGE_HEIGHT - 80) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      // Property Condition and Inclusions
      yPosition = this.addSection(pdf, 'PROPERTY CONDITION AND INCLUSIONS', yPosition);
      pdf.text(`Property Condition: ${this.capitalizeFirst(contract.property?.propertyCondition?.replace('-', ' ') || 'Not specified')}`, this.MARGIN, yPosition);
      yPosition += 10;

      if (contract.property?.includedItems && contract.property.includedItems.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('INCLUDED ITEMS:', this.MARGIN, yPosition);
        yPosition += 7;
        pdf.setFont('helvetica', 'normal');
        contract.property.includedItems.forEach(item => {
          pdf.text(`• ${item}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      if (contract.property?.excludedItems && contract.property.excludedItems.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('EXCLUDED ITEMS:', this.MARGIN, yPosition);
        yPosition += 7;
        pdf.setFont('helvetica', 'normal');
        contract.property.excludedItems.forEach(item => {
          pdf.text(`• ${item}`, this.MARGIN + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Contingencies
      if (contract.contingencies && contract.contingencies.filter(c => c.included).length > 0) {
        // Check if we need a new page
        if (yPosition > this.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }

        yPosition = this.addSection(pdf, 'CONTINGENCIES', yPosition);
        contract.contingencies.filter(c => c.included).forEach(contingency => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${this.capitalizeFirst(contingency.type)} Contingency:`, this.MARGIN, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          if (contingency.deadline) {
            pdf.text(`Deadline: ${this.formatDate(contingency.deadline)}`, this.MARGIN + 5, yPosition);
            yPosition += 5;
          }
          if (contingency.details) {
            pdf.text(`Details: ${contingency.details}`, this.MARGIN + 5, yPosition);
            yPosition += 5;
          }
          yPosition += 3;
        });
        yPosition += 5;
      }

      // Special Stipulations
      if (contract.specialStipulations && contract.specialStipulations.length > 0) {
        // Check if we need a new page
        if (yPosition > this.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }

        yPosition = this.addSection(pdf, 'SPECIAL STIPULATIONS', yPosition);
        contract.specialStipulations.forEach((stipulation, index) => {
          pdf.text(`${index + 1}. ${stipulation}`, this.MARGIN, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }

      // Additional Terms
      if (contract.additionalTerms) {
        // Check if we need a new page
        if (yPosition > this.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }

        yPosition = this.addSection(pdf, 'ADDITIONAL TERMS', yPosition);
        const lines = this.splitTextToLines(pdf, contract.additionalTerms, this.PAGE_WIDTH - 2 * this.MARGIN);
        lines.forEach(line => {
          pdf.text(line, this.MARGIN, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // NC Disclosures
      if (yPosition > this.PAGE_HEIGHT - 80) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      yPosition = this.addSection(pdf, 'NORTH CAROLINA DISCLOSURES', yPosition);
      pdf.text(`Lead Paint Disclosure: ${contract.property?.leadPaintDisclosure ? 'Provided' : 'Not Required/Not Provided'}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Property Disclosure Statement: ${contract.property?.propertyDisclosureProvided ? 'Provided' : 'Not Provided'}`, this.MARGIN, yPosition);
      yPosition += 7;
      pdf.text(`Mineral Rights: ${contract.property?.mineralRightsIncluded ? 'Included' : 'Not Included'}`, this.MARGIN, yPosition);
      yPosition += 15;

      // Attorney Information
      if (contract.buyerAttorney) {
        yPosition = this.addSection(pdf, 'BUYER ATTORNEY', yPosition);
        pdf.text(`Name: ${contract.buyerAttorney.firstName} ${contract.buyerAttorney.lastName}`, this.MARGIN, yPosition);
        yPosition += 7;
        if (contract.buyerAttorney.firm) {
          pdf.text(`Firm: ${contract.buyerAttorney.firm}`, this.MARGIN, yPosition);
          yPosition += 7;
        }
        if (contract.buyerAttorney.phone) {
          pdf.text(`Phone: ${contract.buyerAttorney.phone}`, this.MARGIN, yPosition);
          yPosition += 7;
        }
        yPosition += 15;
      }

      // Signature Section
      if (yPosition > this.PAGE_HEIGHT - 100) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      yPosition = this.addSection(pdf, 'SIGNATURES', yPosition);
      
      pdf.text('BUYER(S) SIGNATURE(S):', this.MARGIN, yPosition);
      yPosition += 15;
      
      contract.buyers?.forEach((buyer, index) => {
        pdf.text(`_________________________________    Date: ___________`, this.MARGIN, yPosition);
        yPosition += 5;
        pdf.text(`${buyer.firstName} ${buyer.lastName}`, this.MARGIN, yPosition);
        yPosition += 15;
      });

      pdf.text('SELLER(S) SIGNATURE(S):', this.MARGIN, yPosition);
      yPosition += 15;
      
      contract.sellers?.forEach((seller, index) => {
        pdf.text(`_________________________________    Date: ___________`, this.MARGIN, yPosition);
        yPosition += 5;
        pdf.text(`${seller.firstName} ${seller.lastName}`, this.MARGIN, yPosition);
        yPosition += 15;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`NC Contract - Page ${i} of ${pageCount}`, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 10, { align: 'center' });
        pdf.text('Generated by ListingPal', this.PAGE_WIDTH - this.MARGIN, this.PAGE_HEIGHT - 10, { align: 'right' });
      }

      // Generate filename and download
      const filename = `NC_Contract_${listing.address.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating contract PDF:', error);
      throw new Error('Failed to generate contract PDF. Please try again.');
    }
  }

  private static addSection(pdf: jsPDF, title: string, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, this.MARGIN, yPosition);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    return yPosition + 10;
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private static formatDate(dateString?: string): string {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static splitTextToLines(pdf: jsPDF, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = pdf.getTextWidth(testLine);
      
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}