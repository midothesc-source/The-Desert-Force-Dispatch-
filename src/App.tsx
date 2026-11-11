import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { MissionBriefTicker } from './components/MissionBriefTicker';
import { TacticalToolbar } from './components/TacticalToolbar';
import { OperativeCard } from './components/OperativeCard';
import { DossierModal } from './components/DossierModal';
import { OperativeFormModal } from './components/OperativeFormModal';
import { GoogleContactsModal } from './components/GoogleContactsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { INITIAL_OPERATIVES } from './data/initialOperatives';
import {
  Faction,
  MissionBrief,
  Operative,
  OperativeStatus,
  TacticalFilters,
} from './types/tactical';
import {
  filterAndSearchOperatives,
  generateQuickBriefFallback,
} from './utils/tacticalLogic';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCachedAccessToken,
} from './services/firebaseAuth';
import {
  fetchGoogleContacts,
  pushOperativeToGoogleContacts,
  deleteGoogleContact,
  GoogleContactSummary,
} from './services/googleContacts';
import { Shield, Sparkles, AlertCircle, Compass } from 'lucide-react';

const STORAGE_KEY = 'desert_force_dispatch_operatives_v1';

export default function App() {
  // Load initial operatives from localStorage if available, or fall back to default seed
  const [operatives, setOperatives] = useState<Operative[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored operatives, using default roster', e);
    }
    return INITIAL_OPERATIVES;
  });

  // Save to localStorage whenever operatives state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operatives));
    } catch (e) {
      console.error('Failed to store operatives', e);
    }
  }, [operatives]);

  // Filters State
  const [filters, setFilters] = useState<TacticalFilters>({
    searchQuery: '',
    faction: 'ALL',
    status: 'ALL',
    allegiance: 'ALL',
    sortBy: 'recent',
  });

  // Active Modals & Selected Operative
  const [selectedOperative, setSelectedOperative] = useState<Operative | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperative, setEditingOperative] = useState<Operative | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // User & Google Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleContacts, setGoogleContacts] = useState<GoogleContactSummary[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Destructive Confirmation Modal state
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    action: () => Promise<void> | void;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    action: () => {},
    isDestructive: true,
  });

  // Global Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        showNotification(`Authenticated as ${result.user.email}. Google Contacts access granted.`, 'success');
        // Fetch contacts immediately
        await loadGoogleContacts(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed', err);
      showNotification(`Authentication error: ${err.message}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Sign Out
  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setGoogleContacts([]);
    showNotification('Signed out from Google account.', 'info');
  };

  // Load Google Contacts using cached access token
  const loadGoogleContacts = async (tokenOverride?: string) => {
    const token = tokenOverride || getCachedAccessToken();
    if (!token) {
      showNotification('Google Access token expired or unavailable. Please sign in again.', 'error');
      return;
    }

    setIsLoadingContacts(true);
    try {
      const contacts = await fetchGoogleContacts(token);
      setGoogleContacts(contacts);
      showNotification(`Fetched ${contacts.length} Google Contacts.`, 'success');
    } catch (err: any) {
      console.error('Failed to fetch Google contacts', err);
      showNotification(`Failed to load Google Contacts: ${err.message}`, 'error');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Import a Google Contact into The Desert Force Dispatch directory
  const handleImportGoogleContact = (contact: GoogleContactSummary, targetFaction: Faction) => {
    // Generate codename based on name
    const firstName = contact.name.split(' ')[0] || 'Asset';
    const generatedCodename = `${firstName.toUpperCase()}-SPECTER`;

    const newOperative: Operative = {
      id: `op-google-${Date.now()}`,
      name: contact.name,
      codename: generatedCodename,
      role: contact.jobTitle || 'Field Asset & Intelligence Liaison',
      faction: targetFaction,
      status: 'Active',
      allegiance: 'Strategic',
      clearanceLevel: 'Level 2: Field Agent',
      phone: contact.phone || '',
      email: contact.email || '',
      organization: contact.organization || 'Google Contacts Import',
      lore: contact.notes || 'Imported from Google Workspace contacts network.',
      relationshipHealth: 82,
      tags: ['Google Import', targetFaction],
      missionLogs: [
        {
          id: `log-import-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Intel Exchange',
          summary: 'Imported from Google Contacts address book.',
          outcome: 'Success',
          healthImpact: 2,
        },
      ],
      lastContacted: new Date().toISOString().split('T')[0],
      googleContactResourceName: contact.resourceName,
    };

    setOperatives((prev) => [newOperative, ...prev]);
    showNotification(`Imported ${contact.name} [${generatedCodename}] into ${targetFaction}.`, 'success');
  };

  // Push an Operative to Google Contacts
  const handlePushOperativeToGoogle = async (op: Operative) => {
    const token = getCachedAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google. Please sign in first.');
    }

    const result = await pushOperativeToGoogleContacts(token, op);
    // Mark operative with resourceName
    setOperatives((prev) =>
      prev.map((item) =>
        item.id === op.id ? { ...item, googleContactResourceName: result.resourceName } : item
      )
    );
    showNotification(`Synchronized [${op.codename}] to Google Contacts.`, 'success');
  };

  // Delete Google Contact (triggers confirmation dialog first)
  const triggerDeleteGoogleContact = (resourceName: string, name: string) => {
    setConfirmationState({
      isOpen: true,
      title: 'Remove Contact From Google Address Book?',
      message: `Are you sure you want to permanently delete "${name}" from your Google Contacts? This action modifies your external Google Workspace account.`,
      confirmLabel: 'Delete from Google',
      isDestructive: true,
      action: async () => {
        const token = getCachedAccessToken();
        if (!token) return;
        try {
          await deleteGoogleContact(token, resourceName);
          setGoogleContacts((prev) => prev.filter((c) => c.resourceName !== resourceName));
          showNotification(`Removed "${name}" from Google Contacts.`, 'success');
        } catch (err: any) {
          showNotification(`Deletion failed: ${err.message}`, 'error');
        }
      },
    });
  };

  // Status Change trigger
  const handleStatusChange = (id: string, newStatus: OperativeStatus) => {
    setOperatives((prev) =>
      prev.map((op) => (op.id === id ? { ...op, status: newStatus } : op))
    );
    const target = operatives.find((o) => o.id === id);
    if (target) {
      showNotification(`Updated [${target.codename}] status to ${newStatus}.`, 'info');
    }
  };

  // Quick AI Brief trigger from card
  const handleGenerateBrief = async (op: Operative) => {
    showNotification(`Generating AI Mission Brief for [${op.codename}]...`, 'info');
    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operative: op }),
      });

      let brief: MissionBrief;
      if (response.ok) {
        const data = await response.json();
        brief = data.brief;
      } else {
        brief = generateQuickBriefFallback(op);
      }

      const updated = {
        ...op,
        lastBrief: brief,
        lastContacted: new Date().toISOString().split('T')[0],
      };

      setOperatives((prev) => prev.map((item) => (item.id === op.id ? updated : item)));
      setSelectedOperative(updated);
      setIsDossierOpen(true);
      showNotification(`AI Mission Brief compiled for [${op.codename}].`, 'success');
    } catch (e) {
      const fallbackBrief = generateQuickBriefFallback(op);
      const updated = {
        ...op,
        lastBrief: fallbackBrief,
        lastContacted: new Date().toISOString().split('T')[0],
      };
      setOperatives((prev) => prev.map((item) => (item.id === op.id ? updated : item)));
      setSelectedOperative(updated);
      setIsDossierOpen(true);
      showNotification(`Tactical Brief compiled for [${op.codename}].`, 'info');
    }
  };

  // Update operative from Dossier modal
  const handleUpdateOperative = (updated: Operative) => {
    setOperatives((prev) => prev.map((op) => (op.id === updated.id ? updated : op)));
    setSelectedOperative(updated);
  };

  // Delete Operative trigger
  const triggerDeleteOperative = (id: string, name: string) => {
    setConfirmationState({
      isOpen: true,
      title: 'Decommission Operative Record?',
      message: `Are you sure you want to decommission and purge the classified dossier for "${name}" from The Desert Force Dispatch directory? This action cannot be undone.`,
      confirmLabel: 'Decommission Operative',
      isDestructive: true,
      action: () => {
        setOperatives((prev) => prev.filter((o) => o.id !== id));
        setIsDossierOpen(false);
        showNotification(`Decommissioned operative "${name}".`, 'info');
      },
    });
  };

  // Reset seed data
  const handleResetSeedData = () => {
    setConfirmationState({
      isOpen: true,
      title: 'Reset Directory to Initial Academy Roster?',
      message: 'This will restore the default directory including student operatives (Rahaf, Rimas, Sarah, Hayaa) and media network allies (Sonic from Trendy Media).',
      confirmLabel: 'Reset to Academy Seed',
      isDestructive: false,
      action: () => {
        setOperatives(INITIAL_OPERATIVES);
        showNotification('Directory restored to default Academy roster.', 'success');
      },
    });
  };

  // Filtered operatives list
  const filteredOperatives = filterAndSearchOperatives(operatives, filters);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-stone-200 tactical-grid-bg flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        operatives={operatives}
        onOpenNewOperativeModal={() => {
          setEditingOperative(null);
          setIsFormOpen(true);
        }}
        onOpenGoogleContactsModal={() => setIsGoogleModalOpen(true)}
        onResetSeedData={handleResetSeedData}
        isGoogleConnected={!!user}
        userEmail={user?.email}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-40 max-w-md p-4 rounded-xl border shadow-2xl font-mono text-xs flex items-center justify-between gap-3 animate-slide-up ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-900/30'
              : notification.type === 'error'
              ? 'bg-red-950/90 border-red-500/60 text-red-200 shadow-red-900/30'
              : 'bg-stone-900/95 border-amber-500/50 text-amber-200 shadow-amber-950/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Tactical Mission Brief Ticker */}
        <MissionBriefTicker operatives={operatives} />

        {/* Tactical Search & Filter Toolbar */}
        <TacticalToolbar
          filters={filters}
          onFilterChange={setFilters}
          totalMatches={filteredOperatives.length}
        />

        {/* Tactical Directory Grid */}
        {filteredOperatives.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-stone-800 rounded-2xl bg-stone-950/40 p-8 space-y-4">
            <Shield className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-lg font-bold text-stone-300 font-mono">
              NO CLASSIFIED OPERATIVES FOUND
            </h3>
            <p className="text-stone-400 text-xs font-mono max-w-md mx-auto">
              No personnel match your search filters. Try adjusting your query or resetting quadrant and status filters.
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  faction: 'ALL',
                  status: 'ALL',
                  allegiance: 'ALL',
                  sortBy: 'recent',
                })
              }
              className="px-4 py-2 rounded-lg bg-stone-900 border border-amber-500/40 text-amber-300 hover:bg-stone-800 text-xs font-mono font-bold"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOperatives.map((op) => (
              <OperativeCard
                key={op.id}
                operative={op}
                onOpenDossier={(target) => {
                  setSelectedOperative(target);
                  setIsDossierOpen(true);
                }}
                onGenerateBrief={handleGenerateBrief}
                onStatusChange={handleStatusChange}
                onPushToGoogleContacts={handlePushOperativeToGoogle}
                isGoogleConnected={!!user}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-[#09090b] py-6 px-4 text-center font-mono text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-400">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-300 uppercase">THE DESERT FORCE DISPATCH</span>
            <span>// REL-INTEL COMMAND</span>
          </div>

          <div className="text-amber-400/90 font-semibold tracking-wider">
            "Follow My Path Or Feel My Wrath."
          </div>

          <div className="text-[11px] text-stone-400">
            Vercel & Capacitor Production Ready
          </div>
        </div>
      </footer>

      {/* Interactive Dossier Modal */}
      <DossierModal
        operative={selectedOperative}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onUpdateOperative={handleUpdateOperative}
        onDeleteOperative={triggerDeleteOperative}
        onOpenEditModal={(op) => {
          setIsDossierOpen(false);
          setEditingOperative(op);
          setIsFormOpen(true);
        }}
        onPushToGoogleContacts={handlePushOperativeToGoogle}
        isGoogleConnected={!!user}
      />

      {/* Operative Form Modal (New / Edit) */}
      <OperativeFormModal
        isOpen={isFormOpen}
        initialData={editingOperative}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOperative(null);
        }}
        onSave={(op) => {
          if (editingOperative) {
            setOperatives((prev) => prev.map((item) => (item.id === op.id ? op : item)));
            showNotification(`Updated operative dossier for [${op.codename}].`, 'success');
          } else {
            setOperatives((prev) => [op, ...prev]);
            showNotification(`Registered new operative [${op.codename}].`, 'success');
          }
        }}
      />

      {/* Google Contacts Management Modal */}
      <GoogleContactsModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        user={user}
        isLoggingIn={isLoggingIn}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        googleContacts={googleContacts}
        isLoadingContacts={isLoadingContacts}
        onFetchGoogleContacts={() => loadGoogleContacts()}
        onImportGoogleContact={handleImportGoogleContact}
        operatives={operatives}
        onPushOperativeToGoogle={handlePushOperativeToGoogle}
        onDeleteGoogleContactTrigger={triggerDeleteGoogleContact}
      />

      {/* Mandatory User Confirmation Modal for Destructive Operations */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmLabel={confirmationState.confirmLabel}
        isDestructive={confirmationState.isDestructive}
        onConfirm={() => {
          const act = confirmationState.action;
          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
          act();
        }}
        onCancel={() => {
          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
