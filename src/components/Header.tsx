import React from 'react';
import {
  Compass,
  Radio,
  Users,
  Shield,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Operative } from '../types/tactical';
import { calculateTacticalStats, exportToCsv } from '../utils/tacticalLogic';

interface HeaderProps {
  operatives: Operative[];
  onOpenNewOperativeModal: () => void;
  onOpenGoogleContactsModal: () => void;
  onResetSeedData: () => void;
  isGoogleConnected: boolean;
  userEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  operatives,
  onOpenNewOperativeModal,
  onOpenGoogleContactsModal,
  onResetSeedData,
  isGoogleConnected,
  userEmail,
}) => {
  const stats = calculateTacticalStats(operatives);

  const handleDownloadCsv = () => {
    const csvContent = exportToCsv(operatives);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `desert-force-dispatch-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(operatives, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `desert-force-dossiers-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-amber-500/20 bg-[#0d0d10]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Tactical Broadcast Bar */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border-b border-amber-500/15 py-1.5 px-4 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-stone-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px]">
            DISPATCH FREQ 91.4 MHZ // SECURE DESERT MESH
          </span>
        </div>

        {/* Signature Creed in banner */}
        <div className="text-amber-300 font-semibold tracking-wider text-xs flex items-center gap-1.5 bg-amber-500/10 px-3 py-0.5 rounded border border-amber-500/30">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>CREED: "Follow My Path Or Feel My Wrath."</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>GRID: 24.7136° N, 46.6753° E</span>
          <span className="text-amber-500/60">•</span>
          <span>SYSTEM: READY</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Creed Identity */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 flex-shrink-0">
              <Compass className="w-8 h-8 animate-pulse text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
                  The Desert Force <span className="text-amber-400">Dispatch</span>
                </h1>
                <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 font-bold">
                  Tactical Command v2.6
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-400 font-mono mt-0.5">
                Classified Operative Dossiers & Relationship Intelligence Hub
              </p>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Google Contacts Trigger */}
            <button
              type="button"
              onClick={onOpenGoogleContactsModal}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all border ${
                isGoogleConnected
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-stone-900/90 border-amber-500/30 text-amber-300 hover:bg-amber-950/40 hover:border-amber-400'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>
                {isGoogleConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Google Contacts (Synced)
                  </span>
                ) : (
                  'Google Contacts'
                )}
              </span>
            </button>

            {/* Export Roster Dropdown / Action */}
            <div className="flex items-center rounded-lg border border-stone-800 bg-stone-900/80 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={handleDownloadCsv}
                title="Export Roster as CSV"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>CSV</span>
              </button>
              <span className="text-stone-700">|</span>
              <button
                type="button"
                onClick={handleDownloadJson}
                title="Export Dossiers as JSON"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <span>JSON</span>
              </button>
            </div>

            {/* Reset Roster to Initial Seed */}
            <button
              type="button"
              onClick={onResetSeedData}
              title="Reset Roster to Default Academy Seed"
              className="p-2 rounded-lg border border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-amber-400 transition-colors"
              aria-label="Reset Roster to initial seed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Add New Operative Button */}
            <button
              type="button"
              onClick={onOpenNewOperativeModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold font-mono tracking-wide shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>NEW OPERATIVE</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-3 border-t border-stone-800/80 font-mono">
          <div className="bg-[#121317]/80 border border-stone-800/90 rounded-lg p-2.5">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Total Personnel
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{stats.total}</span>
              <span className="text-[11px] text-amber-400/80">records</span>
            </div>
          </div>

          <div className="bg-[#121317]/80 border border-emerald-900/40 rounded-lg p-2.5">
            <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider block">
              Active In Field
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{stats.active}</span>
              <span className="text-[11px] text-stone-400">deployed</span>
            </div>
          </div>

          <div className="bg-[#121317]/80 border border-amber-900/40 rounded-lg p-2.5">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
              Student Roster
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-300">{stats.studentCount}</span>
              <span className="text-[11px] text-stone-400">cadets</span>
            </div>
          </div>

          <div className="bg-[#121317]/80 border border-red-900/40 rounded-lg p-2.5">
            <span className="text-[10px] text-red-400/80 uppercase tracking-wider block">
              High Priority
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-red-400">{stats.highPriority}</span>
              <span className="text-[11px] text-stone-400">urgent</span>
            </div>
          </div>

          <div className="bg-[#121317]/80 border border-blue-900/40 rounded-lg p-2.5">
            <span className="text-[10px] text-blue-400/80 uppercase tracking-wider block">
              Pledged & Loyal
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-blue-300">{stats.loyalCount}</span>
              <span className="text-[11px] text-stone-400">verified</span>
            </div>
          </div>

          <div className="bg-[#121317]/80 border border-amber-500/30 rounded-lg p-2.5">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
              Avg Health Index
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-400">{stats.avgHealth}%</span>
              <span className="text-[11px] text-stone-400">optimal</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
