import React from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';
import { AllegianceLevel, Faction, Operative, OperativeStatus } from '../types/tactical';

interface OperativeCardProps {
  operative: Operative;
  onOpenDossier: (operative: Operative) => void;
  onGenerateBrief: (operative: Operative) => void;
  onStatusChange: (id: string, newStatus: OperativeStatus) => void;
  onPushToGoogleContacts?: (operative: Operative) => void;
  isGoogleConnected: boolean;
}

export const OperativeCard: React.FC<OperativeCardProps> = ({
  operative,
  onOpenDossier,
  onGenerateBrief,
  onStatusChange,
  onPushToGoogleContacts,
  isGoogleConnected,
}) => {
  const getFactionColor = (faction: Faction) => {
    switch (faction) {
      case 'Student Roster':
        return 'border-amber-400/40 text-amber-300 bg-amber-400/10';
      case 'Allies & Syndicate':
        return 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10';
      case 'VIP Clients':
        return 'border-purple-400/40 text-purple-300 bg-purple-400/10';
      case 'Field Operatives':
        return 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10';
      case 'Command Council':
        return 'border-red-400/40 text-red-300 bg-red-400/10';
      default:
        return 'border-stone-500/40 text-stone-300 bg-stone-500/10';
    }
  };

  const getAllegianceBadge = (allegiance: AllegianceLevel) => {
    switch (allegiance) {
      case 'Loyal':
        return {
          label: 'LOYAL',
          classes: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
          icon: ShieldCheck,
        };
      case 'Pledged':
        return {
          label: 'PLEDGED',
          classes: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          icon: ShieldCheck,
        };
      case 'Strategic':
        return {
          label: 'STRATEGIC',
          classes: 'bg-blue-950/80 border-blue-500/40 text-blue-300',
          icon: ShieldCheck,
        };
      case 'Guarded':
        return {
          label: 'GUARDED',
          classes: 'bg-orange-950/80 border-orange-500/40 text-orange-300',
          icon: ShieldAlert,
        };
      case 'Under Observation':
      default:
        return {
          label: 'OBSERVED',
          classes: 'bg-red-950/80 border-red-500/40 text-red-300',
          icon: ShieldAlert,
        };
    }
  };

  const getStatusColor = (status: OperativeStatus) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-600/40';
      case 'High Priority':
        return 'text-red-400 bg-red-950/50 border-red-600/40 animate-pulse';
      case 'Under Recon':
        return 'text-amber-400 bg-amber-950/50 border-amber-600/40';
      case 'Standby':
        return 'text-stone-400 bg-stone-900 border-stone-700';
      case 'Neutral':
      default:
        return 'text-blue-400 bg-blue-950/50 border-blue-600/40';
    }
  };

  const allegianceMeta = getAllegianceBadge(operative.allegiance);
  const AllegianceIcon = allegianceMeta.icon;

  const healthColor =
    operative.relationshipHealth >= 85
      ? 'text-emerald-400 stroke-emerald-500'
      : operative.relationshipHealth >= 70
      ? 'text-amber-400 stroke-amber-500'
      : 'text-red-400 stroke-red-500';

  return (
    <article
      aria-label={`Operative card for ${operative.name}`}
      className="tactical-card rounded-xl overflow-hidden flex flex-col justify-between group relative"
    >
      {/* Top Header Strip */}
      <div className="p-4 pb-3 border-b border-stone-800/80 bg-stone-950/40">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getFactionColor(
              operative.faction
            )}`}
          >
            {operative.faction}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Allegiance Badge */}
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${allegianceMeta.classes}`}
            >
              <AllegianceIcon className="w-3 h-3" />
              {allegianceMeta.label}
            </span>

            {/* Instant Status Switcher */}
            <select
              value={operative.status}
              aria-label={`Status for ${operative.name}`}
              onChange={(e) => onStatusChange(operative.id, e.target.value as OperativeStatus)}
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 ${getStatusColor(
                operative.status
              )}`}
            >
              <option value="Active">Active</option>
              <option value="Standby">Standby</option>
              <option value="High Priority">High Priority</option>
              <option value="Under Recon">Under Recon</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>
        </div>

        {/* Codename & Real Name */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-black tracking-wide text-amber-400 uppercase font-mono group-hover:text-amber-300 transition-colors">
              [{operative.codename}]
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              {operative.clearanceLevel.split(':')[0]}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-tight mt-0.5">
            {operative.name}
          </h4>

          <p className="text-xs text-stone-300 font-mono mt-0.5 line-clamp-1">
            {operative.role}
          </p>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 space-y-3.5 flex-1 text-xs font-mono">
        {/* Meta badges: Org and Location */}
        <div className="space-y-1.5 text-stone-400">
          {operative.organization && (
            <div className="flex items-center gap-1.5 text-stone-300">
              <Building2 className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
              <span className="truncate">{operative.organization}</span>
            </div>
          )}

          {operative.location && (
            <div className="flex items-center gap-1.5 text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
              <span className="truncate">{operative.location}</span>
            </div>
          )}

          {operative.lastContacted && (
            <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
              <span>Last Contact: {operative.lastContacted}</span>
            </div>
          )}
        </div>

        {/* Relationship Health Meter */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-400 uppercase tracking-wider">
              Relationship Health
            </span>
            <span className={`font-bold ${healthColor}`}>
              {operative.relationshipHealth}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                operative.relationshipHealth >= 85
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  : operative.relationshipHealth >= 70
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-red-600 to-red-400'
              }`}
              style={{ width: `${operative.relationshipHealth}%` }}
            />
          </div>
        </div>

        {/* Lore / Intelligence Snippet */}
        <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800/80 text-[11px] text-stone-300 leading-relaxed italic">
          <p className="line-clamp-2">
            "{operative.lore}"
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {operative.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-stone-800/70 text-stone-300 px-2 py-0.5 rounded border border-stone-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="p-3 bg-stone-950/70 border-t border-stone-800 flex items-center justify-between gap-1.5 font-mono">
        {/* Quick Communication Triggers */}
        <div className="flex items-center gap-1">
          {operative.phone && (
            <a
              href={`tel:${operative.phone}`}
              aria-label={`Call ${operative.name}`}
              title={`Call ${operative.phone}`}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}

          {operative.phone && (
            <a
              href={`sms:${operative.phone}`}
              aria-label={`SMS ${operative.name}`}
              title="Send SMS"
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          )}

          {operative.email && (
            <a
              href={`mailto:${operative.email}?subject=[DESERT FORCE DISPATCH] Tactical Directive`}
              aria-label={`Email ${operative.name}`}
              title={`Email ${operative.email}`}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Push to Google Contacts icon if user is connected */}
          {isGoogleConnected && onPushToGoogleContacts && (
            <button
              type="button"
              onClick={() => onPushToGoogleContacts(operative)}
              aria-label={`Sync ${operative.name} to Google Contacts`}
              title="Sync to Google Contacts"
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-400 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dossier & AI Mission Brief Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onGenerateBrief(operative)}
            aria-label={`AI Mission Brief for ${operative.name}`}
            title="Generate AI Tactical Brief"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 text-[11px] font-bold transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI BRIEF</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDossier(operative)}
            aria-label={`Open Dossier for ${operative.name}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-[11px] font-bold border border-stone-700 transition-colors"
          >
            <span>DOSSIER</span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
          </button>
        </div>
      </div>
    </article>
  );
};
