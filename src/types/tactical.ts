export type Faction = 
  | 'Student Roster' 
  | 'Allies & Syndicate' 
  | 'VIP Clients' 
  | 'Field Operatives' 
  | 'Command Council';

export type OperativeStatus = 
  | 'Active' 
  | 'Standby' 
  | 'High Priority' 
  | 'Under Recon' 
  | 'Neutral';

export type AllegianceLevel = 
  | 'Loyal' 
  | 'Pledged' 
  | 'Guarded' 
  | 'Strategic' 
  | 'Under Observation';

export type ClearanceLevel = 
  | 'Level 1: Recruit' 
  | 'Level 2: Field Agent' 
  | 'Level 3: Senior Asset' 
  | 'Level 4: Shadow Council' 
  | 'Level 5: Supreme Commander';

export interface MissionLog {
  id: string;
  date: string;
  type: 'Call' | 'Meeting' | 'Field Mission' | 'Intel Exchange' | 'Debrief';
  summary: string;
  outcome: 'Success' | 'Neutral' | 'Critical Failure' | 'Pending';
  healthImpact: number;
}

export interface MissionBrief {
  generatedAt: string;
  tacticalSummary: string;
  strategicObjectives: string[];
  leveragePoints: string[];
  pastInteractionSynthesis: string;
  recommendedOpening: string;
  tacticalRating: number;
}

export interface Operative {
  id: string;
  name: string;
  codename: string;
  role: string;
  faction: Faction;
  status: OperativeStatus;
  allegiance: AllegianceLevel;
  clearanceLevel: ClearanceLevel;
  phone: string;
  email: string;
  organization?: string;
  location?: string;
  avatarUrl?: string;
  lore: string;
  relationshipHealth: number; // 0 to 100
  tags: string[];
  missionLogs: MissionLog[];
  lastBrief?: MissionBrief;
  lastContacted?: string;
  googleContactResourceName?: string;
}

export interface TacticalFilters {
  searchQuery: string;
  faction: Faction | 'ALL';
  status: OperativeStatus | 'ALL';
  allegiance: AllegianceLevel | 'ALL';
  sortBy: 'health-desc' | 'health-asc' | 'name-asc' | 'priority-desc' | 'recent';
}
