import React, { useState } from 'react';
import { Operative } from '../types/tactical';
import { calculateTacticalStats } from '../utils/tacticalLogic';
import { Radio, RefreshCw } from 'lucide-react';

interface MissionBriefTickerProps {
  operatives: Operative[];
}

interface DirectiveItem {
  code: string;
  body: string;
  grid: string;
}

const DIRECTIVES: DirectiveItem[] = [
  {
    code: 'OPERATION SAND STORM RECON',
    body: '"Follow My Path Or Feel My Wrath." All operatives are instructed to maintain secure frequency checks, verify student roster metrics, and synchronize field telemetry before next deployment cycle.',
    grid: '24.7136° N, 46.6753° E',
  },
  {
    code: 'PROTOCOL GOLDEN MIRAGE // CADET SYNC',
    body: '"Follow My Path Or Feel My Wrath." Student Roster operatives (Rahaf, Rimas, Sarah, Hayaa) must complete encrypted cipher handshakes and log field readiness scores prior to 0600 hours.',
    grid: '24.7136° N, 46.6753° E',
  },
  {
    code: 'SYNDICATE BROADCAST // TRENDY MEDIA LINK',
    body: '"Follow My Path Or Feel My Wrath." High-priority media assets under Sonic [SonicPulse] are cleared for coordinated strategic air-cover and high-velocity dispatch transmission.',
    grid: '25.0954° N, 55.1562° E',
  },
];

export const MissionBriefTicker: React.FC<MissionBriefTickerProps> = ({ operatives }) => {
  const [directiveIndex, setDirectiveIndex] = useState(0);
  const stats = calculateTacticalStats(operatives);
  const currentDirective = DIRECTIVES[directiveIndex];

  const statusLabel =
    stats.avgHealth >= 80
      ? `OPTIMAL [${stats.avgHealth}%]`
      : stats.avgHealth >= 65
      ? `STABLE [${stats.avgHealth}%]`
      : `ALERT [${stats.avgHealth}%]`;

  const handleNextDirective = () => {
    setDirectiveIndex((prev) => (prev + 1) % DIRECTIVES.length);
  };

  return (
    <section
      aria-label="Tactical Mission Brief Ticker"
      className="mb-6 rounded-xl border border-yellow-500/30 bg-neutral-900/90 p-4 shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-500/20 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-yellow-500"></span>
          <span className="text-xs font-mono uppercase tracking-widest text-yellow-400">
            DISPATCH SECURE BRIEF // LIVE FEED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400">
            GRID: {currentDirective.grid}
          </span>
          <button
            type="button"
            onClick={handleNextDirective}
            aria-label="Cycle active directive"
            title="Cycle Active Directive"
            className="flex items-center gap-1 rounded border border-yellow-500/30 bg-neutral-950/80 px-2 py-0.5 text-[10px] font-mono uppercase text-yellow-400 hover:bg-yellow-500/15 hover:border-yellow-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>NEXT FEED ({directiveIndex + 1}/{DIRECTIVES.length})</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold tracking-wide text-neutral-100 uppercase flex flex-wrap items-center gap-2">
          <span>⚡ ACTIVE DIRECTIVE:</span>
          <span className="text-yellow-400 font-mono">{currentDirective.code}</span>
        </h3>
        <p className="text-xs text-neutral-300 font-mono leading-relaxed">
          {currentDirective.body}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-400">
        <span>STATUS: {statusLabel}</span>
        <span className="text-yellow-500">ENCRYPTION: AES-256-GCM</span>
      </div>
    </section>
  );
};
