import React, { useState } from 'react';
import { Building2, MapPin, Activity, Shield, ChevronRight, Zap } from 'lucide-react';
import { ALL_FACILITIES, FacilityProfile } from '../data/controlRoomData';

interface FacilitiesViewProps {
  onSelectFacility?: (fac: FacilityProfile) => void;
  lang?: 'en' | 'ur';
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ onSelectFacility, lang = 'en' }) => {
  const [selectedFacility, setSelectedFacility] = useState<FacilityProfile>(ALL_FACILITIES[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              ENTERPRISE MULTI-SITE FACILITY PORTFOLIO
            </h1>
            <span className="ww-badge ww-badge-live">
              <Building2 size={11} /> CRESCENT GROUP (04 SITES)
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Central monitoring across Faisalabad, Lahore, Sheikhupura & Hattar Special Economic Zone
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Portfolio Load: <b style={{ color: 'var(--text-primary)' }}>8.42 MW</b> · 03 Operational · 01 Attention
          </span>
        </div>
      </div>

      {/* Grid: Pakistan Facility Map + Facility Registry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.4fr) minmax(320px, 1fr)', gap: 14 }}>
        {/* Pakistan Regional Map Representation */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <MapPin size={13} color="var(--operational-green)" />
              Pakistan Industrial Grid Cluster Map
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Interactive Site Selectors
            </span>
          </div>
          <div className="ww-card-body" style={{ padding: 14, height: 320, backgroundColor: 'var(--bg-canvas)', position: 'relative', overflow: 'hidden' }}>
            {/* Pakistan SVG Stylized Outline */}
            <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ opacity: 0.25 }}>
              <path
                d="M180,30 L220,50 L260,90 L240,140 L280,180 L250,220 L210,240 L160,250 L120,230 L90,190 L110,130 L150,80 Z"
                fill="none"
                stroke="var(--industrial-blue-light)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Interactive Facility Markers */}
            {/* Faisalabad Marker */}
            <div
              onClick={() => setSelectedFacility(ALL_FACILITIES[0])}
              style={{
                position: 'absolute',
                top: '42%',
                left: '48%',
                cursor: 'pointer',
                textAlign: 'center',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--operational-green)', margin: '0 auto', boxShadow: '0 0 10px var(--operational-green)' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, whiteSpace: 'nowrap' }}>
                Faisalabad (Unit 04)
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--operational-green)' }}>2.84 MW · FESCO</div>
            </div>

            {/* Lahore Marker */}
            <div
              onClick={() => setSelectedFacility(ALL_FACILITIES[1])}
              style={{
                position: 'absolute',
                top: '46%',
                left: '62%',
                cursor: 'pointer',
                textAlign: 'center',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--operational-green)', margin: '0 auto' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, whiteSpace: 'nowrap' }}>
                Lahore (Unit 01)
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>3.40 MW · LESCO</div>
            </div>

            {/* Sheikhupura Marker */}
            <div
              onClick={() => setSelectedFacility(ALL_FACILITIES[2])}
              style={{
                position: 'absolute',
                top: '38%',
                left: '56%',
                cursor: 'pointer',
                textAlign: 'center',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--energy-amber)', margin: '0 auto', boxShadow: '0 0 8px var(--energy-amber)' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', marginTop: 4, whiteSpace: 'nowrap' }}>
                Sheikhupura (Unit 02)
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--energy-amber)' }}>1.60 MW · ATTENTION</div>
            </div>

            {/* Hattar Marker */}
            <div
              onClick={() => setSelectedFacility(ALL_FACILITIES[3])}
              style={{
                position: 'absolute',
                top: '20%',
                left: '52%',
                cursor: 'pointer',
                textAlign: 'center',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--operational-green)', margin: '0 auto' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, whiteSpace: 'nowrap' }}>
                Hattar SEZ (Unit 03)
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>0.58 MW · GEPCO</div>
            </div>
          </div>
        </div>

        {/* Selected Facility Health Card */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Building2 size={13} color="var(--industrial-blue-light)" />
              Facility Telemetry: {selectedFacility.name}
            </span>
            <span className={`ww-badge ww-badge-${selectedFacility.status === 'OPERATIONAL' ? 'live' : 'warning'}`}>
              {selectedFacility.status}
            </span>
          </div>

          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Location: <b>{selectedFacility.city}, {selectedFacility.province}</b> · Feeder: <b>{selectedFacility.feederCode}</b>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Sanctioned Load</div>
                <div className="num-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedFacility.connectionSanctionedMva} <span style={{ fontSize: 11 }}>MVA</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Genset Capacity</div>
                <div className="num-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedFacility.generatorCapacityKva} <span style={{ fontSize: 11 }}>kVA</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>DISCO Tariff:</span>
                <span style={{ fontWeight: 600 }}>{selectedFacility.disco} Industrial B-3 TOU</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Telemetry Nodes:</span>
                <span className="num-mono" style={{ fontWeight: 700, color: 'var(--operational-green)' }}>28/28 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
