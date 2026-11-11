import React, { useState, useEffect } from 'react';
import { X, Shield, Save } from 'lucide-react';
import {
  AllegianceLevel,
  ClearanceLevel,
  Faction,
  Operative,
  OperativeStatus,
} from '../types/tactical';

interface OperativeFormModalProps {
  isOpen: boolean;
  initialData?: Operative | null;
  onClose: () => void;
  onSave: (operative: Operative) => void;
}

export const OperativeFormModal: React.FC<OperativeFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [codename, setCodename] = useState('');
  const [role, setRole] = useState('');
  const [faction, setFaction] = useState<Faction>('Student Roster');
  const [status, setStatus] = useState<OperativeStatus>('Active');
  const [allegiance, setAllegiance] = useState<AllegianceLevel>('Loyal');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>('Level 1: Recruit');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [lore, setLore] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [relationshipHealth, setRelationshipHealth] = useState(85);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCodename(initialData.codename);
      setRole(initialData.role);
      setFaction(initialData.faction);
      setStatus(initialData.status);
      setAllegiance(initialData.allegiance);
      setClearanceLevel(initialData.clearanceLevel);
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setOrganization(initialData.organization || '');
      setLocation(initialData.location || '');
      setLore(initialData.lore || '');
      setTagsInput(initialData.tags.join(', '));
      setRelationshipHealth(initialData.relationshipHealth || 85);
    } else {
      setName('');
      setCodename('');
      setRole('');
      setFaction('Student Roster');
      setStatus('Active');
      setAllegiance('Loyal');
      setClearanceLevel('Level 1: Recruit');
      setPhone('');
      setEmail('');
      setOrganization('');
      setLocation('');
      setLore('');
      setTagsInput('Recruit, Tactical');
      setRelationshipHealth(85);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const operativePayload: Operative = {
      id: initialData?.id || `op-${Date.now()}`,
      name: name.trim(),
      codename: codename.trim(),
      role: role.trim(),
      faction,
      status,
      allegiance,
      clearanceLevel,
      phone: phone.trim(),
      email: email.trim(),
      organization: organization.trim(),
      location: location.trim(),
      lore: lore.trim(),
      relationshipHealth: Number(relationshipHealth),
      tags: tags.length > 0 ? tags : ['Operative'],
      missionLogs: initialData?.missionLogs || [],
      lastBrief: initialData?.lastBrief,
      lastContacted: initialData?.lastContacted || new Date().toISOString().split('T')[0],
      googleContactResourceName: initialData?.googleContactResourceName,
    };

    onSave(operativePayload);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="operative-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#111216] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto">
        <div className="bg-stone-950 px-5 py-3 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <h3 id="operative-form-title">
              {initialData ? `EDIT OPERATIVE // ${initialData.codename}` : 'REGISTER NEW OPERATIVE'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 font-mono text-xs text-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Full Legal / Operational Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahaf Al-Mansoor / Sonic"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Codename / Tactical Callsign *
              </label>
              <input
                type="text"
                required
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="e.g. Desert Viper / SonicPulse"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-amber-300 focus:outline-none focus:border-amber-400 font-mono text-sm font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Designated Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Advanced Tactical Trainee & Cipher Cadre"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Faction Quadrant *
              </label>
              <select
                value={faction}
                onChange={(e) => setFaction(e.target.value as Faction)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-amber-300 focus:outline-none focus:border-amber-400"
              >
                <option value="Student Roster">Student Roster</option>
                <option value="Allies & Syndicate">Allies & Syndicate</option>
                <option value="VIP Clients">VIP Clients</option>
                <option value="Field Operatives">Field Operatives</option>
                <option value="Command Council">Command Council</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OperativeStatus)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Active">Active</option>
                <option value="Standby">Standby</option>
                <option value="High Priority">High Priority</option>
                <option value="Under Recon">Under Recon</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Allegiance Level
              </label>
              <select
                value={allegiance}
                onChange={(e) => setAllegiance(e.target.value as AllegianceLevel)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Loyal">Loyal</option>
                <option value="Pledged">Pledged</option>
                <option value="Strategic">Strategic</option>
                <option value="Guarded">Guarded</option>
                <option value="Under Observation">Under Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Clearance
              </label>
              <select
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Level 1: Recruit">Level 1: Recruit</option>
                <option value="Level 2: Field Agent">Level 2: Field Agent</option>
                <option value="Level 3: Senior Asset">Level 3: Senior Asset</option>
                <option value="Level 4: Shadow Council">Level 4: Shadow Council</option>
                <option value="Level 5: Supreme Commander">Level 5: Supreme Commander</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Comms Frequency / Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966-50-xxx-xxxx"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Dispatch Email / Cipher
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operative@desertforce.internal"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Affiliated Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Trendy Media / Desert Force Academy"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Field Location / Post
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Riyadh Central Command"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-400 uppercase text-[11px] mb-1">
              Classified Lore, Background & Past Service
            </label>
            <textarea
              rows={3}
              value={lore}
              onChange={(e) => setLore(e.target.value)}
              placeholder="Record known history, behavioral patterns, technical specialties, and field loyalty..."
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 font-sans text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-stone-400 uppercase text-[11px] mb-1">
                Tactical Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Student, Cipher, Broadcast, High-Risk"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-stone-400 uppercase text-[11px]">
                  Relationship Health
                </label>
                <span className="text-amber-400 font-bold">{relationshipHealth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={relationshipHealth}
                onChange={(e) => setRelationshipHealth(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4 text-black" />
              <span>SAVE OPERATIVE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
