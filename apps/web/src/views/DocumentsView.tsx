import React from 'react';
import { FolderGit2, FileText, Download, Lock, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface DocumentsViewProps {
  lang?: 'en' | 'ur';
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ lang = 'en' }) => {
  const documents = [
    { title: 'Verified Savings Certificate — September 2026', type: 'Cryptographic Certificate', date: '01-OCT-2026', size: '1.2 MB', hash: 'e3b0c44...52b8', status: 'VERIFIED' },
    { title: 'NEPRA Chapter 4 Sec. 21 Dispute Dossier (FESCO)', type: 'Legal Regulatory Filing', date: '05-SEP-2026', size: '4.8 MB', hash: '8f92a14...b01c', status: 'READY' },
    { title: 'EU CBAM Carbon & Decarbonization Audit Report', type: 'ESG Compliance Disclosure', date: '01-OCT-2026', size: '2.1 MB', hash: '3c19d45...e84a', status: 'AUDITED' },
    { title: 'FBR e-Invoice #WW-INV-2026-09-004 (With PRA Tax)', type: 'Tax Invoice (FBR IRIS)', date: '01-OCT-2026', size: '480 KB', hash: '7b28a91...f12d', status: 'PAID' },
    { title: 'WattBrain WB-04 Firmware Calibration Certificate', type: 'Hardware Compliance', date: '15-JAN-2026', size: '890 KB', hash: '9a01e38...c491', status: 'CALIBRATED' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              COMPLIANCE DOCUMENTS & AUDIT REPOSITORY
            </h1>
            <span className="ww-badge ww-badge-live">
              <Lock size={11} /> TAMPER-PROOF REPOSITORY
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Central repository of legal filings, cryptographic proof certificates, and tax invoices · {CURRENT_FACILITY.name}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <FolderGit2 size={13} color="var(--industrial-blue-light)" />
            Certified Industrial Documentation Registry
          </span>
          <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Immutable SHA-256 Storage
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Publication Date</th>
                <th>File Size</th>
                <th>Verification Digest</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{doc.type}</td>
                  <td className="num-mono">{doc.date}</td>
                  <td className="num-mono">{doc.size}</td>
                  <td className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{doc.hash}</td>
                  <td>
                    <span className="ww-badge ww-badge-live">
                      <CheckCircle2 size={10} /> {doc.status}
                    </span>
                  </td>
                  <td>
                    <button className="ww-btn ww-btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}>
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
