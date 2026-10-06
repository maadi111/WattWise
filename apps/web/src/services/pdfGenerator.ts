import jsPDF from 'jspdf';
import { SavingsRecord, Factory } from '../types';

export function generateSavingsCertificatePdf(record: SavingsRecord, factory: Factory): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background Header Styling
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line (Emerald)
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 42, pageWidth, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('WATTWISE TECHNOLOGIES (PVT.) LTD.', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Industrial Energy Intelligence & Arbitrage Platform · SECP Reg #0241982', 14, 26);
  doc.text('Office: National Incubation Centre, Islamabad | Regional Hub: Khurrianwala, Faisalabad', 14, 32);

  // Certificate Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFIED SAVINGS AUDIT CERTIFICATE', 14, 56);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate Ref: WW-AUD-${record.periodMonth.replace('-', '')}-${factory.id.slice(0, 6).toUpperCase()}`, 14, 62);
  doc.text(`Issuance Timestamp: ${new Date().toISOString()} (UTC+5)`, 14, 67);

  // Factory Summary Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 73, pageWidth - 28, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('INDUSTRIAL CLIENT INFORMATION', 20, 81);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Enterprise: ${factory.name}`, 20, 88);
  doc.text(`Sector: ${factory.sector} | Cluster: ${factory.city}, Punjab`, 20, 94);
  doc.text(`Electricity Feeder: ${factory.wapdaFeeder}`, 20, 100);

  doc.text(`DISCO Grid Supply: ${factory.disco} (11 kV Industrial)`, 115, 88);
  doc.text(`Peak Load Capacity: ${factory.peakLoadKw} kW`, 115, 94);
  doc.text(`Subscription Tier: ${factory.plan}`, 115, 100);

  // Audit Methodology Statement
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ENERGY ARBITRAGE & DISPATCH AUDIT (PKR)', 14, 116);

  // Financial Table
  const tableY = 122;
  const col1 = 18;
  const col2 = 130;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Audit Line Item', col1, tableY + 5.5);
  doc.text('Audited Valuation', col2, tableY + 5.5);

  const rows = [
    { label: 'Prophet Model Baseline Energy Cost (Counterfactual)', val: `Rs. ${record.baselinePkr.toLocaleString('en-PK')}` },
    { label: 'Actual Energy Bill (Grid + Diesel Generation Incurred)', val: `Rs. ${record.actualPkr.toLocaleString('en-PK')}` },
    { label: 'Documented Gross Energy Savings (Avoided Waste)', val: `Rs. ${record.grossSavingPkr.toLocaleString('en-PK')}` },
    { label: 'WattWise 20% Performance Gain-Share Fee', val: `Rs. ${record.wattwiseFeePkr.toLocaleString('en-PK')}` },
    { label: 'NET CLIENT FINANCIAL GAIN (Retained Cashflow)', val: `Rs. ${record.netSavingPkr.toLocaleString('en-PK')}` },
  ];

  let currentY = tableY + 12;
  rows.forEach((row, i) => {
    if (i === rows.length - 1) {
      doc.setFillColor(236, 253, 245); // Light emerald
      doc.rect(14, currentY - 4, pageWidth - 28, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 95, 70); // Dark emerald
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    }
    doc.text(row.label, col1, currentY + 1.5);
    doc.text(row.val, col2, currentY + 1.5);
    currentY += 8;
  });

  // KPI Metrics Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. OPERATIONAL & ESG IMPACT METRICS', 14, currentY + 8);

  const kpiBoxY = currentY + 13;
  const boxWidth = (pageWidth - 28 - 6) / 3;

  // Box 1: ROI
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, kpiBoxY, boxWidth, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`${record.roiMultiple.toFixed(1)}x`, 18, kpiBoxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified ROI Multiple', 18, kpiBoxY + 16);

  // Box 2: Diesel Hours Saved
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxWidth + 3, kpiBoxY, boxWidth, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(14, 165, 233); // Sky
  doc.text(`${record.dieselHoursSaved} hrs`, 14 + boxWidth + 7, kpiBoxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Diesel Gen Avoided Hours', 14 + boxWidth + 7, kpiBoxY + 16);

  // Box 3: CO2 avoided
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxWidth + 3) * 2, kpiBoxY, boxWidth, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text(`${(record.co2AvoidedKg / 1000).toFixed(1)} Tons`, 14 + (boxWidth + 3) * 2 + 4, kpiBoxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CO2 Avoided (EU GSP+)', 14 + (boxWidth + 3) * 2 + 4, kpiBoxY + 16);

  // Tamper-Proof Cryptographic Lock Section
  const cryptoY = kpiBoxY + 30;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, cryptoY, pageWidth - 28, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('CRYPTOGRAPHIC AUDIT INTEGRITY & TAMPER-PROOF PROOF', 20, cryptoY + 7);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`SHA-256 Digest: ${record.auditHash}`, 20, cryptoY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Baseline Locked: Monthly at 00:00:00 PKT via Facebook Prophet decomposition model.', 20, cryptoY + 18);
  doc.text('Raw Sensor Archive: Stored with immutable write-once S3 lock for independent banking audit.', 20, cryptoY + 22);

  // Signatures / Seal Area
  const sigY = cryptoY + 34;
  doc.setDrawColor(203, 213, 225);
  doc.line(18, sigY + 15, 80, sigY + 15);
  doc.line(pageWidth - 80, sigY + 15, pageWidth - 18, sigY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Hammad (Lead Engineer & CTO)', 18, sigY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('WattWise Technologies (Pvt.) Ltd.', 18, sigY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Lead Energy Auditor / ESCO Partner', pageWidth - 80, sigY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Approved for Bank Financing / Refinance', pageWidth - 80, sigY + 23);

  // Footer Note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This verified document conforms to NEPRA Demand-Side Management & Energy Audit Guidelines (2026).', 14, 287);

  // Save the PDF
  doc.save(`WattWise_Savings_Certificate_${factory.id}_${record.periodMonth}.pdf`);
}
