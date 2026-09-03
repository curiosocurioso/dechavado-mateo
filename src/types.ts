export type StepStatus = 'turbulent' | 'in_motion' | 'polished' | 'parked';

export type ProjectCategory = 'app' | 'song' | 'writing' | 'design' | 'video' | 'research' | 'other';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  chaosLevel: number; // 1 (Crystal clear) to 5 (Heavy turbulence / chaotic idea)
  tag: string;
  estimatedMinutes?: number;
  notes?: string[];
  isCurrent?: boolean; // Highlighted as the current focus step
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowProject {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category: ProjectCategory;
  steps: WorkflowStep[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface StepFilterOptions {
  searchQuery: string;
  statusFilter: 'all' | StepStatus;
  tagFilter: string;
  sortBy: 'order' | 'chaos-high' | 'chaos-low' | 'title';
}
