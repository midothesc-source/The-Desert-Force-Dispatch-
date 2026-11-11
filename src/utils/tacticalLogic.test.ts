import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRelationshipHealth,
  filterAndSearchOperatives,
  formatTacticalCallsign,
  exportToCsv,
  calculateTacticalStats,
  generateQuickBriefFallback,
} from './tacticalLogic';
import { Operative, MissionLog } from '../types/tactical';

const mockLogs: MissionLog[] = [
  {
    id: 'log-1',
    date: '2026-11-01',
    type: 'Call',
    summary: 'Tactical sync on media distribution',
    outcome: 'Success',
    healthImpact: 5,
  },
  {
    id: 'log-2',
    date: '2026-11-05',
    type: 'Meeting',
    summary: 'Broadcast strategy realignment',
    outcome: 'Neutral',
    healthImpact: 0,
  },
];

const mockOperatives: Operative[] = [
  {
    id: 'op-1',
    name: 'Rahaf Al-Mansoor',
    codename: 'Desert Viper',
    role: 'Tactical Trainee & Recon',
    faction: 'Student Roster',
    status: 'Active',
    allegiance: 'Loyal',
    clearanceLevel: 'Level 2: Field Agent',
    phone: '+966-50-111-2233',
    email: 'rahaf@desertforce.internal',
    organization: 'Desert Force Academy',
    lore: 'Top scoring student operative in navigation and cyber defense.',
    relationshipHealth: 92,
    tags: ['Student', 'Fast-Track', 'Cipher'],
    missionLogs: mockLogs,
    lastContacted: '2026-11-08',
  },
  {
    id: 'op-2',
    name: 'Sonic',
    codename: 'SonicPulse',
    role: 'Broadcast Intelligence Director',
    faction: 'Allies & Syndicate',
    status: 'High Priority',
    allegiance: 'Strategic',
    clearanceLevel: 'Level 3: Senior Asset',
    phone: '+971-55-987-6543',
    email: 'sonic@trendymedia.agency',
    organization: 'Trendy Media',
    lore: 'Master of viral communications and public perception warfare.',
    relationshipHealth: 84,
    tags: ['Media', 'Viral', 'Syndicate'],
    missionLogs: [],
    lastContacted: '2026-11-09',
  },
  {
    id: 'op-3',
    name: 'Sarah Khalid',
    codename: 'Sandstorm',
    role: 'Field Analytics Cadre',
    faction: 'Student Roster',
    status: 'Standby',
    allegiance: 'Pledged',
    clearanceLevel: 'Level 1: Recruit',
    phone: '+966-54-444-5555',
    email: 'sarah.k@desertforce.internal',
    lore: 'Specializes in geospatial topography and route planning.',
    relationshipHealth: 78,
    tags: ['Student', 'Analytics'],
    missionLogs: [],
    lastContacted: '2026-11-02',
  },
];

test('calculateRelationshipHealth adjusts score by allegiance and logs', () => {
  const healthLoyal = calculateRelationshipHealth(80, mockLogs, 'Loyal');
  // Base 80 + Loyal (10) + log impact (max(5,4) + 0 = 5) = 95
  assert.equal(healthLoyal, 95);

  const healthObserved = calculateRelationshipHealth(50, [], 'Under Observation');
  // 50 - 15 = 35
  assert.equal(healthObserved, 35);

  // Clamped at 100 max and 0 min
  const healthClampedHigh = calculateRelationshipHealth(98, mockLogs, 'Loyal');
  assert.equal(healthClampedHigh, 100);

  const healthClampedLow = calculateRelationshipHealth(5, [{
    id: 'fail',
    date: '2026-11-01',
    type: 'Debrief',
    summary: 'Total mission rupture',
    outcome: 'Critical Failure',
    healthImpact: -20,
  }], 'Under Observation');
  assert.equal(healthClampedLow, 0);
});

test('filterAndSearchOperatives filters by faction and search query', () => {
  const students = filterAndSearchOperatives(mockOperatives, {
    searchQuery: '',
    faction: 'Student Roster',
    status: 'ALL',
    allegiance: 'ALL',
    sortBy: 'name-asc',
  });
  assert.equal(students.length, 2);
  assert.equal(students[0].name, 'Rahaf Al-Mansoor');
  assert.equal(students[1].name, 'Sarah Khalid');

  // Search by organization
  const mediaMatches = filterAndSearchOperatives(mockOperatives, {
    searchQuery: 'Trendy Media',
    faction: 'ALL',
    status: 'ALL',
    allegiance: 'ALL',
    sortBy: 'recent',
  });
  assert.equal(mediaMatches.length, 1);
  assert.equal(mediaMatches[0].codename, 'SonicPulse');

  // Search by codename
  const viperMatches = filterAndSearchOperatives(mockOperatives, {
    searchQuery: 'viper',
    faction: 'ALL',
    status: 'ALL',
    allegiance: 'ALL',
    sortBy: 'recent',
  });
  assert.equal(viperMatches.length, 1);
  assert.equal(viperMatches[0].name, 'Rahaf Al-Mansoor');
});

test('formatTacticalCallsign formats standard callsign banner', () => {
  const banner = formatTacticalCallsign(mockOperatives[0]);
  assert.equal(banner, '[DESERT VIPER] // Rahaf Al-Mansoor (Student Roster)');
});

test('calculateTacticalStats computes correct totals and averages', () => {
  const stats = calculateTacticalStats(mockOperatives);
  assert.equal(stats.total, 3);
  assert.equal(stats.active, 1);
  assert.equal(stats.highPriority, 1);
  assert.equal(stats.studentCount, 2);
  assert.equal(stats.loyalCount, 2); // Rahaf (Loyal) + Sarah (Pledged)
  assert.equal(stats.avgHealth, Math.round((92 + 84 + 78) / 3));
});

test('exportToCsv generates valid CSV header and rows', () => {
  const csv = exportToCsv(mockOperatives);
  assert.ok(csv.includes('Codename,Full Name,Faction'));
  assert.ok(csv.includes('"Desert Viper","Rahaf Al-Mansoor","Student Roster"'));
  assert.ok(csv.includes('"SonicPulse","Sonic","Allies & Syndicate"'));
});

test('generateQuickBriefFallback produces cohesive tactical briefing', () => {
  const brief = generateQuickBriefFallback(mockOperatives[1]);
  assert.ok(brief.tacticalSummary.includes('SonicPulse'));
  assert.ok(brief.strategicObjectives.length >= 3);
  assert.ok(brief.leveragePoints.length >= 2);
  assert.ok(brief.tacticalRating > 50);
});
