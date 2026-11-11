import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleContactSummary } from '../services/googleContacts';
import { Faction, Operative } from '../types/tactical';

interface GoogleContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isLoggingIn: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  googleContacts: GoogleContactSummary[];
  isLoadingContacts: boolean;
  onFetchGoogleContacts: () => Promise<void>;
  onImportGoogleContact: (contact: GoogleContactSummary, faction: Faction) => void;
  operatives: Operative[];
  onPushOperativeToGoogle: (op: Operative) => Promise<void>;
  onDeleteGoogleContactTrigger: (resourceName: string, name: string) => void;
}

export const GoogleContactsModal: React.FC<GoogleContactsModalProps> = ({
  isOpen,
  onClose,
  user,
  isLoggingIn,
  onSignIn,
  onSignOut,
  googleContacts,
  isLoadingContacts,
  onFetchGoogleContacts,
  onImportGoogleContact,
  operatives,
  onPushOperativeToGoogle,
  onDeleteGoogleContactTrigger,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFaction, setSelectedFaction] = useState<Faction>('Allies & Syndicate');
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePush = async (op: Operative) => {
    setPushingId(op.id);
    setStatusMessage(null);
    try {
      await onPushOperativeToGoogle(op);
      setStatusMessage(`Successfully pushed [${op.codename}] to Google Contacts.`);
    } catch (err: any) {
      setStatusMessage(`Failed: ${err.message}`);
    } finally {
      setPushingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-contacts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-3xl bg-[#101115] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-stone-950 px-5 py-3.5 border-b border-stone-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h3 id="google-contacts-title">GOOGLE CONTACTS // TACTICAL SYNCHRONIZATION</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Banner & Status */}
        <div className="p-5 border-b border-stone-800 bg-stone-900/50">
          {!user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white font-sans">
                  Connect your Google Workspace Account
                </h4>
                <p className="text-xs text-stone-400 font-mono mt-1">
                  Authenticate to synchronize your contacts directory directly with The Desert Force Dispatch command center.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button flex-shrink-0"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  {user.displayName?.[0] || user.email?.[0] || 'G'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{user.displayName || 'Authorized User'}</span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px]">
                      CONNECTED
                    </span>
                  </div>
                  <span className="text-stone-400 text-[11px]">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onFetchGoogleContacts}
                  disabled={isLoadingContacts}
                  className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContacts ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isLoadingContacts ? 'REFRESHING...' : 'SYNC RECENT'}</span>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-800 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>SIGN OUT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        {user && (
          <div className="flex border-b border-stone-800 bg-stone-950 font-mono text-xs px-5">
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`py-3 px-4 border-b-2 font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'import'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import to Dispatch ({googleContacts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`py-3 px-4 border-b-2 font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'export'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Push Operatives to Google</span>
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {statusMessage && (
            <div className="p-3 bg-stone-900 border border-amber-500/40 rounded-lg text-amber-300 flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {!user ? (
            <div className="py-12 text-center text-stone-400 space-y-3 font-sans">
              <Shield className="w-12 h-12 text-amber-500/40 mx-auto" />
              <p className="text-sm max-w-md mx-auto text-stone-300">
                To access and synchronize your real Google Contacts network, sign in above. You can easily categorize personal contacts as student trainees, media allies, or VIP sponsors.
              </p>
            </div>
          ) : activeTab === 'import' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                <div>
                  <span className="text-stone-300 font-bold block">
                    Select Target Faction for Imports:
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Imported contacts will be assigned this tactical quadrant.
                  </span>
                </div>

                <select
                  value={selectedFaction}
                  onChange={(e) => setSelectedFaction(e.target.value as Faction)}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-400 text-xs"
                >
                  <option value="Student Roster">Student Roster</option>
                  <option value="Allies & Syndicate">Allies & Syndicate</option>
                  <option value="VIP Clients">VIP Clients</option>
                  <option value="Field Operatives">Field Operatives</option>
                  <option value="Command Council">Command Council</option>
                </select>
              </div>

              {isLoadingContacts ? (
                <div className="py-12 text-center text-amber-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                  <p>Pulling Google People API connections...</p>
                </div>
              ) : googleContacts.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-3">
                  <p>No contacts retrieved from your Google Account.</p>
                  <button
                    type="button"
                    onClick={onFetchGoogleContacts}
                    className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold border border-amber-500/30"
                  >
                    Pull Contacts Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {googleContacts.map((contact) => (
                    <div
                      key={contact.resourceName}
                      className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-sans">{contact.name}</span>
                          {contact.organization && (
                            <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                              {contact.organization}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 mt-1">
                          {contact.phone && <span>{contact.phone}</span>}
                          {contact.email && <span>{contact.email}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onImportGoogleContact(contact, selectedFaction)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-black" />
                          <span>IMPORT AS [{selectedFaction.toUpperCase()}]</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteGoogleContactTrigger(contact.resourceName, contact.name)
                          }
                          title="Delete from Google Contacts"
                          className="px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-red-500 text-stone-500 hover:text-red-400 text-[11px] transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* EXPORT / PUSH TO GOOGLE */
            <div className="space-y-3">
              <p className="text-stone-300 text-xs">
                Push operatives from The Desert Force Dispatch directory to your Google Contacts account:
              </p>

              <div className="space-y-2">
                {operatives.map((op) => (
                  <div
                    key={op.id}
                    className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">[{op.codename}]</span>
                        <span className="text-white font-sans">{op.name}</span>
                        <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700">
                          {op.faction}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{op.role}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePush(op)}
                      disabled={pushingId === op.id}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>{pushingId === op.id ? 'PUSHING...' : 'PUSH TO GOOGLE'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
