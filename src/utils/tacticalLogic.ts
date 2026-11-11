import { AllegianceLevel, Faction, MissionBrief, MissionLog, Operative, TacticalFilters } from '../types/tactical';

/**
 * Calculates dynamically weighted relationship health (0 - 100) based on
 * base metric, allegiance weight, and recent mission outcomes.
 */
export function calculateRelationshipHealth(
  baseHealth: number,
  logs: MissionLog[] = [],
  allegiance: AllegianceLevel = 'Strategic'
): number {
  let score = baseHealth;

  // Allegiance modifier
  const allegianceModifiers: Record<AllegianceLevel, number> = {
    'Loyal': 10,
    'Pledged': 6,
    'Strategic': 0,
    'Guarded': -5,
    'Under Observation': -15,
  };

  score += allegianceModifiers[allegiance] ?? 0;

  // Impact from past mission logs
  if (logs.length > 0) {
    const recentLogs = logs.slice(0, 5);
    const logImpact = recentLogs.reduce((acc, log) => {
      let impact = log.healthImpact;
      if (log.outcome === 'Success') impact = Math.max(impact, 4);
      if (log.outcome === 'Critical Failure') impact = Math.min(impact, -10);
      return acc + impact;
    }, 0);
    score += logImpact;
  }

  // Bound strictly between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Filters and searches operatives across code names, real names, roles, tags, emails, and organizations.
 */
export function filterAndSearchOperatives(
  operatives: Operative[],
  filters: TacticalFilters
): Operative[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return operatives
    .filter((op) => {
      // Faction filter
      if (filters.faction !== 'ALL' && op.faction !== filters.faction) {
        return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && op.status !== filters.status) {
        return false;
      }

      // Allegiance filter
      if (filters.allegiance !== 'ALL' && op.allegiance !== filters.allegiance) {
        return false;
      }

      // Search query
      if (query) {
        const matchName = op.name.toLowerCase().includes(query);
        const matchCodename = op.codename.toLowerCase().includes(query);
        const matchRole = op.role.toLowerCase().includes(query);
        const matchPhone = op.phone.toLowerCase().includes(query);
        const matchEmail = op.email.toLowerCase().includes(query);
        const matchOrg = (op.organization || '').toLowerCase().includes(query);
        const matchTags = op.tags.some((t) => t.toLowerCase().includes(query));
        const matchLore = op.lore.toLowerCase().includes(query);

        if (
          !matchName &&
          !matchCodename &&
          !matchRole &&
          !matchPhone &&
          !matchEmail &&
          !matchOrg &&
          !matchTags &&
          !matchLore
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'health-desc':
          return b.relationshipHealth - a.relationshipHealth;
        case 'health-asc':
          return a.relationshipHealth - b.relationshipHealth;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'priority-desc': {
          const priorityScore = (op: Operative) => {
            if (op.status === 'High Priority') return 4;
            if (op.status === 'Active') return 3;
            if (op.status === 'Under Recon') return 2;
            if (op.status === 'Standby') return 1;
            return 0;
          };
          return priorityScore(b) - priorityScore(a);
        }
        case 'recent':
        default:
          return (b.lastContacted || '').localeCompare(a.lastContacted || '');
      }
    });
}

/**
 * Formats a clean military-grade callsign header.
 */
export function formatTacticalCallsign(op: Operative): string {
  return `[${op.codename.toUpperCase()}] // ${op.name} (${op.faction})`;
}

/**
 * Exports operative dataset to RFC-compatible CSV for tactical reporting.
 */
export function exportToCsv(operatives: Operative[]): string {
  const headers = [
    'Codename',
    'Full Name',
    'Faction',
    'Role',
    'Status',
    'Allegiance',
    'Clearance Level',
    'Relationship Health',
    'Phone',
    'Email',
    'Organization',
    'Last Contacted',
    'Tags',
  ];

  const rows = operatives.map((op) => [
    `"${op.codename.replace(/"/g, '""')}"`,
    `"${op.name.replace(/"/g, '""')}"`,
    `"${op.faction}"`,
    `"${op.role.replace(/"/g, '""')}"`,
    `"${op.status}"`,
    `"${op.allegiance}"`,
    `"${op.clearanceLevel}"`,
    op.relationshipHealth,
    `"${op.phone}"`,
    `"${op.email}"`,
    `"${(op.organization || '').replace(/"/g, '""')}"`,
    `"${op.lastContacted || 'N/A'}"`,
    `"${op.tags.join('; ')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Aggregate intelligence telemetry statistics.
 */
export function calculateTacticalStats(operatives: Operative[]) {
  const total = operatives.length;
  const active = operatives.filter((o) => o.status === 'Active').length;
  const highPriority = operatives.filter((o) => o.status === 'High Priority').length;
  const studentCount = operatives.filter((o) => o.faction === 'Student Roster').length;
  const loyalCount = operatives.filter((o) => o.allegiance === 'Loyal' || o.allegiance === 'Pledged').length;
  const avgHealth = total > 0
    ? Math.round(operatives.reduce((sum, o) => sum + o.relationshipHealth, 0) / total)
    : 0;

  return {
    total,
    active,
    highPriority,
    studentCount,
    loyalCount,
    avgHealth,
  };
}

/**
 * Deterministic tactical briefing generator (offline/fallback generator).
 */
export function generateQuickBriefFallback(op: Operative): MissionBrief {
  const dateStr = new Date().toISOString().split('T')[0];

  const objectives = [
    `Establish contact with ${op.name} regarding current ${op.role.toLowerCase()} operations.`,
    `Assess operational alignment within the ${op.faction} quadrant.`,
    `Verify integrity of communication frequency (${op.phone || op.email || 'secure channel'}).`,
  ];

  const leverage = [
    `Allegiance level is rated as ${op.allegiance}; respect established boundary protocols.`,
    op.organization ? `Leverage connection through ${op.organization} assets.` : 'Maintain strict operational security.',
    `Recent field status is logged as ${op.status}.`,
  ];

  const summary = `Tactical dossier on ${op.name} (${op.codename}). Operating as ${op.role} within ${op.faction}. Health score currently stands at ${op.relationshipHealth}/100. Contact posture requires adherence to the Desert Force doctrine: "Follow My Path Or Feel My Wrath."`;

  const opening = `Greetings ${op.codename}. Command is reviewing our operational sync in the ${op.faction} theater. We require an update on your active developments.`;

  return {
    generatedAt: dateStr,
    tacticalSummary: summary,
    strategicObjectives: objectives,
    leveragePoints: leverage,
    pastInteractionSynthesis: `Operative has ${op.missionLogs.length} logged field interactions with current health index ${op.relationshipHealth}%.`,
    recommendedOpening: opening,
    tacticalRating: Math.min(98, Math.max(50, op.relationshipHealth + 5)),
  };
}
