import { WorkflowProject } from '../types';

export const CATEGORY_CONFIGS: Record<
  WorkflowProject['category'],
  { label: string; icon: string; defaultTags: string[]; gradient: string }
> = {
  app: {
    label: 'App & Software',
    icon: 'Terminal',
    defaultTags: ['Architecture', 'UI/UX', 'API', 'Frontend', 'Database', 'Testing', 'Deployment'],
    gradient: 'from-cyan-500 to-blue-600',
  },
  song: {
    label: 'Music & Song',
    icon: 'Music',
    defaultTags: ['Composition', 'Beat Making', 'Bassline', 'Vocal Stems', 'Arrangement', 'Mixing', 'Mastering'],
    gradient: 'from-purple-500 to-pink-600',
  },
  writing: {
    label: 'Writing & Story',
    icon: 'BookOpen',
    defaultTags: ['Brainstorm', 'Character Arc', 'Outline', 'Drafting', 'Revision', 'Copyedit', 'Publish'],
    gradient: 'from-amber-500 to-orange-600',
  },
  design: {
    label: 'Design & Visuals',
    icon: 'Palette',
    defaultTags: ['Moodboard', 'Wireframe', 'Design System', 'High-Fi', 'Prototyping', 'Handoff'],
    gradient: 'from-emerald-500 to-teal-600',
  },
  video: {
    label: 'Video & Media',
    icon: 'Film',
    defaultTags: ['Scripting', 'Storyboard', 'Footage Capture', 'Rough Cut', 'Color Grading', 'Sound FX', 'Render'],
    gradient: 'from-rose-500 to-red-600',
  },
  research: {
    label: 'Research & Study',
    icon: 'Search',
    defaultTags: ['Hypothesis', 'Literature Review', 'Data Collection', 'Analysis', 'Synthesis', 'Documentation'],
    gradient: 'from-indigo-500 to-violet-600',
  },
  other: {
    label: 'Custom Project',
    icon: 'Sparkles',
    defaultTags: ['Ideation', 'Preparation', 'Execution', 'Refinement', 'Final Review'],
    gradient: 'from-slate-500 to-zinc-700',
  },
};

export const INITIAL_PROJECTS: WorkflowProject[] = [
  {
    id: 'proj-workflow-1',
    title: 'My Workflow Project',
    tagline: 'Turbulent thought organizer & step register',
    description: 'Log and track your steps from initial brainstorm to completion.',
    category: 'app',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [],
  },
];

