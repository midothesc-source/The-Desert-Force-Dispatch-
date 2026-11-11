import React from 'react';
import { Search, Filter, ArrowUpDown, X, Shield, Sparkles } from 'lucide-react';
import { AllegianceLevel, Faction, OperativeStatus, TacticalFilters } from '../types/tactical';

interface TacticalToolbarProps {
  filters: TacticalFilters;
  onFilterChange: (filters: TacticalFilters) => void;
  totalMatches: number;
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({
  filters,
  onFilterChange,
  totalMatches,
}) => {
  const factions: Array<Faction | 'ALL'> = [
    'ALL',
    'Student Roster',
    'Allies & Syndicate',
    'VIP Clients',
    'Field Operatives',
    'Command Council',
  ];

  const statuses: Array<OperativeStatus | 'ALL'> = [
    'ALL',
    'Active',
    'High Priority',
    'Standby',
    'Under Recon',
  ];

  return (
    <div className="bg-[#101115]/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 font-mono text-xs backdrop-blur-md">
      {/* Search & Quick Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search operatives by codename, name, role, tags, or phone (e.g. 'Rahaf', 'Sonic', 'Viper')..."
            className="w-full bg-stone-950/90 border border-stone-800 rounded-xl pl-10 pr-9 py-2.5 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-stone-400 hidden sm:inline">SORT:</span>
            <select
              value={filters.sortBy}
              aria-label="Sort operatives"
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="recent">Recent Contact</option>
              <option value="health-desc">Highest Relationship Health</option>
              <option value="health-asc">Lowest Relationship Health</option>
              <option value="priority-desc">Priority Order</option>
              <option value="name-asc">Alphabetical (Name)</option>
            </select>
          </div>

          <span className="text-stone-400 text-xs px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <strong className="text-amber-400">{totalMatches}</strong> match{totalMatches !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Faction Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <span className="text-stone-400 uppercase tracking-wider pr-1 flex items-center gap-1 flex-shrink-0">
          <Shield className="w-3 h-3 text-amber-400" />
          Quadrant:
        </span>
        {factions.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange({ ...filters, faction: f })}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all whitespace-nowrap flex-shrink-0 border ${
              filters.faction === f
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-stone-950/80 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            {f === 'ALL' ? 'ALL FACTIONS' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Secondary Status & Allegiance Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-800/80 text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <span>STATUS:</span>
          <div className="flex items-center gap-1">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onFilterChange({ ...filters, status: st })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors border ${
                  filters.status === st
                    ? 'bg-stone-800 text-amber-300 border-amber-500/50'
                    : 'bg-stone-950/60 text-stone-400 border-stone-800/80 hover:text-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span>ALLEGIANCE:</span>
          <select
            value={filters.allegiance}
            aria-label="Filter by allegiance"
            onChange={(e) => onFilterChange({ ...filters, allegiance: e.target.value as any })}
            className="bg-stone-950 border border-stone-800 rounded px-2 py-0.5 text-stone-300 text-[10px] focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">ALL ALLEGIANCES</option>
            <option value="Loyal">Loyal</option>
            <option value="Pledged">Pledged</option>
            <option value="Strategic">Strategic</option>
            <option value="Guarded">Guarded</option>
            <option value="Under Observation">Under Observation</option>
          </select>

          {(filters.searchQuery ||
            filters.faction !== 'ALL' ||
            filters.status !== 'ALL' ||
            filters.allegiance !== 'ALL') && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  searchQuery: '',
                  faction: 'ALL',
                  status: 'ALL',
                  allegiance: 'ALL',
                  sortBy: 'recent',
                })
              }
              className="text-amber-400 hover:text-amber-300 underline text-[10px] ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
