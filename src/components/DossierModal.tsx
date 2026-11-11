import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Building2,
  MapPin,
  Clock,
  Send,
  PlusCircle,
  Copy,
  Check,
  Edit,
  Trash2,
  AlertCircle,
  Radio,
  FileCheck,
} from 'lucide-react';
import { AllegianceLevel, Faction, MissionBrief, MissionLog, Operative, OperativeStatus } from '../types/tactical';

interface DossierModalProps {
  operative: Operative | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOperative: (updated: Operative) => void;
  onDeleteOperative: (id: string, name: string) => void;
  onOpenEditModal: (operative: Operative) => void;
  onPushToGoogleContacts?: (operative: Operative) => Promise<void>;
  isGoogleConnected: boolean;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  operative,
  isOpen,
  onClose,
  onUpdateOperative,
  onDeleteOperative,
  onOpenEditModal,
  onPushToGoogleContacts,
  isGoogleConnected,
}) => {
  if (!isOpen || !operative) return null;

  const [activeTab, setActiveTab] = useState<'brief' | 'logs' | 'lore' | 'transmit'>('brief');
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isPushingContact, setIsPushingContact] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  // New Mission Log state
  const [newLogType, setNewLogType] = useState<MissionLog['type']>('Call');
  const [newLogOutcome, setNewLogOutcome] = useState<MissionLog['outcome']>('Success');
  const [newLogSummary, setNewLogSummary] = useState('');
  const [newLogImpact, setNewLogImpact] = useState<number>(5);

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    setBriefError(null);

    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operative }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const brief: MissionBrief = data.brief;

      const updatedOperative: Operative = {
        ...operative,
        lastBrief: brief,
        lastContacted: new Date().toISOString().split('T')[0],
      };

      onUpdateOperative(updatedOperative);
    } catch (err: any) {
      console.error('Failed to generate tactical mission brief:', err);
      setBriefError('Tactical link unstable. Local heuristic fallback engaged.');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleAddMissionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogSummary.trim()) return;

    const newLog: MissionLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newLogType,
      outcome: newLogOutcome,
      summary: newLogSummary.trim(),
      healthImpact: Number(newLogImpact),
    };

    const newHealth = Math.max(
      0,
      Math.min(100, operative.relationshipHealth + Number(newLogImpact))
    );

    const updatedOperative: Operative = {
      ...operative,
      relationshipHealth: newHealth,
      lastContacted: newLog.date,
      missionLogs: [newLog, ...operative.missionLogs],
    };

    onUpdateOperative(updatedOperative);
    setNewLogSummary('');
    setNewLogImpact(5);
  };

  const handleCopyOpening = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handlePushToGoogle = async () => {
    if (!onPushToGoogleContacts) return;
    setIsPushingContact(true);
    setPushStatusMessage(null);
    try {
      await onPushToGoogleContacts(operative);
      setPushStatusMessage('Successfully synchronized with your Google Contacts.');
    } catch (err: any) {
      setPushStatusMessage(`Synchronization failed: ${err.message}`);
    } finally {
      setIsPushingContact(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-[#101114] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Classified Bar */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 border-b border-amber-500/25 px-5 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
              TOP SECRET // LEVEL 4 CLEARANCE
            </span>
            <span className="text-amber-400 font-bold hidden sm:inline">
              OPERATIVE DOSSIER // {operative.codename.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEditModal(operative)}
              aria-label="Edit operative profile"
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-amber-300 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteOperative(operative.id, operative.name)}
              aria-label="Delete operative"
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:border-red-500 text-stone-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dossier modal"
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operative Header Profile Card */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-amber-400 font-black text-2xl tracking-wide uppercase">
                [{operative.codename}]
              </span>
              <span className="text-xs bg-amber-500/15 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded font-bold">
                {operative.faction}
              </span>
              <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                {operative.clearanceLevel}
              </span>
            </div>

            <h2 id="dossier-modal-title" className="text-lg font-bold text-white tracking-normal font-sans">
              {operative.name}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{operative.role}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-2">
              {operative.organization && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
                  {operative.organization}
                </span>
              )}
              {operative.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  {operative.location}
                </span>
              )}
              {operative.phone && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                  {operative.phone}
                </span>
              )}
              {operative.email && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <Mail className="w-3.5 h-3.5" />
                  {operative.email}
                </span>
              )}
            </div>
          </div>

          {/* Health Index Radar Gauge */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 flex sm:flex-col items-center justify-between sm:justify-center gap-2 w-full sm:w-36 flex-shrink-0">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider text-center">
              Trust & Health
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  operative.relationshipHealth >= 85
                    ? 'text-emerald-400'
                    : operative.relationshipHealth >= 70
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {operative.relationshipHealth}%
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-bold uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800">
              {operative.allegiance}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950/60 px-5 font-mono text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`py-3 px-3.5 border-b-2 font-bold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'brief'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mission Brief</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3.5 border-b-2 font-bold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Mission Logs ({operative.missionLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lore')}
            className={`py-3 px-3.5 border-b-2 font-bold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lore'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Background & Lore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transmit')}
            className={`py-3 px-3.5 border-b-2 font-bold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transmit'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Transmission Center</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-200 font-mono text-xs flex-1">
          {/* TAB 1: AI MISSION BRIEF */}
          {activeTab === 'brief' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 border border-amber-500/20 p-4 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tactical Pre-Engagement Intelligence
                  </h4>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Synthesizes operational posture, strategic objectives, and draft transmissions before contact.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateBrief}
                  disabled={isGeneratingBrief}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingBrief ? 'SCANNING COMMS...' : 'RUN AI BRIEF'}</span>
                </button>
              </div>

              {briefError && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{briefError}</span>
                </div>
              )}

              {isGeneratingBrief ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-amber-400">
                  <Radio className="w-8 h-8 animate-spin" />
                  <span className="font-bold tracking-widest text-xs uppercase animate-pulse">
                    CALCULATING TACTICAL PARAMETERS VIA GEMINI 3.8 FLASH...
                  </span>
                </div>
              ) : operative.lastBrief ? (
                <div className="space-y-4">
                  {/* Tactical Rating & Date Header */}
                  <div className="flex items-center justify-between text-stone-400 text-xs border-b border-stone-800 pb-2">
                    <span>
                      LAST GENERATED:{' '}
                      <strong className="text-amber-400">{operative.lastBrief.generatedAt}</strong>
                    </span>
                    <span>
                      READINESS INDEX:{' '}
                      <strong className="text-emerald-400">{operative.lastBrief.tacticalRating}/100</strong>
                    </span>
                  </div>

                  {/* Situation Assessment */}
                  <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4">
                    <h5 className="text-amber-400 font-bold tracking-wide uppercase text-xs mb-1.5">
                      Tactical Situation Assessment
                    </h5>
                    <p className="text-stone-300 leading-relaxed font-sans text-sm">
                      {operative.lastBrief.tacticalSummary}
                    </p>
                  </div>

                  {/* Strategic Objectives & Leverage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4">
                      <h5 className="text-amber-400 font-bold tracking-wide uppercase text-xs mb-2">
                        Strategic Objectives
                      </h5>
                      <ul className="space-y-2 text-stone-300">
                        {operative.lastBrief.strategicObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">[{i + 1}]</span>
                            <span className="font-sans text-xs">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4">
                      <h5 className="text-amber-400 font-bold tracking-wide uppercase text-xs mb-2">
                        Leverage Points & Sensitivities
                      </h5>
                      <ul className="space-y-2 text-stone-300">
                        {operative.lastBrief.leveragePoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span className="font-sans text-xs">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Past Interaction Synthesis */}
                  <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4">
                    <h5 className="text-amber-400 font-bold tracking-wide uppercase text-xs mb-1">
                      Relationship & Interaction Synthesis
                    </h5>
                    <p className="text-stone-300 font-sans text-xs leading-relaxed">
                      {operative.lastBrief.pastInteractionSynthesis}
                    </p>
                  </div>

                  {/* Recommended Transmission Opener */}
                  <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-amber-400 font-bold tracking-wide uppercase text-xs">
                        Recommended Transmission Script
                      </h5>
                      <button
                        type="button"
                        onClick={() => handleCopyOpening(operative.lastBrief!.recommendedOpening)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-white text-[11px] transition-colors"
                      >
                        {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDraft ? 'COPIED' : 'COPY SCRIPT'}</span>
                      </button>
                    </div>
                    <blockquote className="p-3 bg-stone-950/80 rounded-lg border border-stone-800 text-stone-200 font-mono text-xs leading-relaxed italic">
                      "{operative.lastBrief.recommendedOpening}"
                    </blockquote>
                  </div>
                </div>
              ) : (
                <div className="py-12 border border-dashed border-stone-800 rounded-xl text-center text-stone-400 space-y-2">
                  <p>No active tactical mission brief compiled for this operative.</p>
                  <button
                    type="button"
                    onClick={handleGenerateBrief}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Click here to run the initial mission intelligence synthesis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MISSION LOGS & MILESTONES */}
          {activeTab === 'logs' && (
            <div className="space-y-5">
              {/* Add New Log Form */}
              <form
                onSubmit={handleAddMissionLog}
                className="bg-stone-900/90 border border-amber-500/20 p-4 rounded-xl space-y-3"
              >
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  Log New Mission Interaction
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase mb-1">
                      Interaction Type
                    </label>
                    <select
                      value={newLogType}
                      onChange={(e) => setNewLogType(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Field Mission">Field Mission</option>
                      <option value="Intel Exchange">Intel Exchange</option>
                      <option value="Debrief">Debrief</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase mb-1">
                      Outcome
                    </label>
                    <select
                      value={newLogOutcome}
                      onChange={(e) => setNewLogOutcome(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Success">Success</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Critical Failure">Critical Failure</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase mb-1">
                      Health Impact (+/-)
                    </label>
                    <input
                      type="number"
                      value={newLogImpact}
                      onChange={(e) => setNewLogImpact(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 uppercase mb-1">
                    Debrief / Milestone Summary
                  </label>
                  <textarea
                    rows={2}
                    value={newLogSummary}
                    onChange={(e) => setNewLogSummary(e.target.value)}
                    placeholder="Enter tactical observations, decisions made, and follow-up commitments..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-sans"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wide transition-all"
                  >
                    SAVE LOG ENTRY
                  </button>
                </div>
              </form>

              {/* Logs List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                  Historical Records ({operative.missionLogs.length})
                </h4>

                {operative.missionLogs.length === 0 ? (
                  <p className="text-stone-500 py-6 text-center">
                    No historical mission logs on file for this operative.
                  </p>
                ) : (
                  operative.missionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-stone-900/70 border border-stone-800/90 rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 uppercase">[{log.type}]</span>
                          <span className="text-stone-400">{log.date}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            log.outcome === 'Success'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : log.outcome === 'Neutral'
                              ? 'bg-stone-800 text-stone-300 border-stone-700'
                              : 'bg-red-950/60 text-red-300 border-red-500/40'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </div>
                      <p className="text-stone-200 font-sans text-xs">{log.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BACKGROUND & LORE */}
          {activeTab === 'lore' && (
            <div className="space-y-4">
              <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 space-y-2">
                <h4 className="text-amber-400 font-bold uppercase tracking-wide text-xs">
                  Classified Lore & Field History
                </h4>
                <p className="text-stone-300 font-sans leading-relaxed text-sm whitespace-pre-wrap">
                  {operative.lore || 'No classified dossier files provided.'}
                </p>
              </div>

              <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 space-y-3">
                <h4 className="text-amber-400 font-bold uppercase tracking-wide text-xs">
                  Tactical Tags & Designations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {operative.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-stone-950 text-amber-300 border border-stone-800 px-2.5 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSMISSION CENTER */}
          {activeTab === 'transmit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {operative.phone && (
                  <a
                    href={`tel:${operative.phone}`}
                    className="p-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-emerald-500 text-center text-stone-200 hover:text-emerald-300 transition-all block"
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                    <span className="font-bold block uppercase text-xs">Voice Dispatch</span>
                    <span className="text-[11px] text-stone-400">{operative.phone}</span>
                  </a>
                )}

                {operative.phone && (
                  <a
                    href={`sms:${operative.phone}`}
                    className="p-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-cyan-500 text-center text-stone-200 hover:text-cyan-300 transition-all block"
                  >
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                    <span className="font-bold block uppercase text-xs">Secure SMS</span>
                    <span className="text-[11px] text-stone-400">Direct Comms</span>
                  </a>
                )}

                {operative.email && (
                  <a
                    href={`mailto:${operative.email}?subject=[DESERT FORCE] Operational Sync`}
                    className="p-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500 text-center text-stone-200 hover:text-amber-300 transition-all block"
                  >
                    <Mail className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                    <span className="font-bold block uppercase text-xs">Classified Email</span>
                    <span className="text-[11px] text-stone-400 truncate block">{operative.email}</span>
                  </a>
                )}
              </div>

              {/* Google Contacts Push Integration */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-amber-400 uppercase text-xs">
                    Google Contacts Cloud Sync
                  </h5>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Push this classified operative directly to your Google Contacts address book.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePushToGoogle}
                  disabled={!isGoogleConnected || isPushingContact}
                  className="px-4 py-2 rounded-lg bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-stone-700 disabled:opacity-50 text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isPushingContact ? 'SYNCHRONIZING...' : 'PUSH TO GOOGLE CONTACTS'}</span>
                </button>
              </div>

              {pushStatusMessage && (
                <p className="text-xs text-amber-300 p-2.5 bg-stone-950 rounded-lg border border-amber-500/30">
                  {pushStatusMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
